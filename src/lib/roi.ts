export interface RoiInput {
  productPrice: number;
  averageOrderValue: number;
  adSpend: number;
  costPerResult: number;
}

export interface RoiResult {
  resultCount: number;
  revenue: number;
  profit: number;
  roi: number;
  revenuePerResult: number;
  marginPerResult: number;
  productMargin: number;
}

/** Recommended CPR ceiling as a fraction of product price — used to flag an "achievable target". */
export const TARGET_CPR_RATIO = 0.3;

/** Status of a campaign based on whether `profit` (or `roi`) is positive. */
export type CampaignStatus = "profitable" | "needs_optimization";

/** Aggregated health snapshot used by the UI to drive copy + styling. */
export interface CampaignHealth {
  status: CampaignStatus;
  /** Direction the user should move to fix a negative campaign. */
  trend: "up" | "down";
}

export interface CampaignInsight {
  /** Stable id so React can key the list without index shuffling. */
  id: "condition" | "cpr_target" | "budget_scenario";
  /** Plain-language body of the insight. */
  text: string;
}

/**
 * Ad-ROI model used across the app (client for the live preview, server for persistence).
 *
 * - `adSpend / costPerResult` = results (orders) the ad spend buys
 * - revenue values every result at the average order value (`averageOrderValue`)
 * - `productMargin` reports how far the order value sits above the base product price
 *
 * Kept as a single pure function so the dashboard and the API can never disagree.
 */
export function calculateRoi({
  productPrice,
  averageOrderValue,
  adSpend,
  costPerResult,
}: RoiInput): RoiResult {
  const resultCount = costPerResult > 0 ? Math.round(adSpend / costPerResult) : 0;
  const revenue = resultCount * averageOrderValue;
  const profit = revenue - adSpend;
  const roi = adSpend > 0 ? (profit / adSpend) * 100 : 0;

  return {
    resultCount,
    revenue,
    profit,
    roi,
    revenuePerResult: averageOrderValue,
    marginPerResult: averageOrderValue - costPerResult,
    productMargin: averageOrderValue - productPrice,
  };
}

/**
 * Classifies the campaign into one of two UX states.
 * - `profitable` when profit is non-negative
 * - `needs_optimization` otherwise
 */
export function getCampaignHealth(result: RoiResult): CampaignHealth {
  return {
    status: result.profit >= 0 ? "profitable" : "needs_optimization",
    trend: result.profit >= 0 ? "up" : "down",
  };
}

/**
 * Target CPR suggested by the planner — 30 % of the product price by default.
 * Returns 0 when the product price is 0 to avoid suggesting a non-sensical floor.
 */
export function getTargetCpr(input: Pick<RoiInput, "productPrice">): number {
  return input.productPrice > 0 ? input.productPrice * TARGET_CPR_RATIO : 0;
}

/**
 * Generates up to three contextual insights for the Wawasan Utama panel.
 *
 * 1. `condition` — the verdict on the current campaign + the lever to move.
 * 2. `cpr_target` — if the user is above the recommended CPR target, suggest a target;
 *    otherwise encourage them on the existing efficiency.
 * 3. `budget_scenario` — for every campaign, project how many results a small budget
 *    produces at the current CPR.
 */
export function generateInsights(input: RoiInput, result: RoiResult): CampaignInsight[] {
  const health = getCampaignHealth(result);
  const targetCpr = getTargetCpr(input);
  const projectedBudget = 1_500_000;
  const projectedResults =
    input.costPerResult > 0 ? Math.round(projectedBudget / input.costPerResult) : 0;
  const projectedMargin = projectedResults * result.marginPerResult;

  const conditionText =
    health.status === "profitable"
      ? "Kampanye Anda saat ini menguntungkan. Pertahankan CPR di bawah target dan naikkan AOV secara bertahap."
      : "Kampanye perlu optimasi. Fokus pada penurunan CPR atau peningkatan nilai pesanan.";

  const cprText =
    input.costPerResult > targetCpr && targetCpr > 0
      ? `Pertimbangkan untuk menurunkan CPR Anda untuk meningkatkan profitabilitas. Target CPR sebaiknya 30% dari harga produk.`
      : `CPR Anda saat ini sudah di bawah target 30% harga produk. Pertahankan efisiensi untuk menjaga profitabilitas.`;

  const budgetText = `Dengan budget Rp ${formatRupiahShort(projectedBudget)}, Anda dapat menghasilkan sekitar ${projectedResults} hasil. Setiap hasil menghasilkan margin ${formatRupiahShort(projectedMargin)}.`;

  return [
    { id: "condition", text: conditionText },
    { id: "cpr_target", text: cprText },
    { id: "budget_scenario", text: budgetText },
  ];
}

/** Lightweight IDR formatter used by insights (avoids importing `format.ts`). */
function formatRupiahShort(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}