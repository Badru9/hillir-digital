import { Card } from "@heroui/react";

import { MetricCard } from "./MetricCard";
import {
  type CampaignHealth,
  generateInsights,
  getCampaignHealth,
} from "@/lib/roi";
import { formatNumber, formatPercent, formatRupiah } from "@/lib/format";
import type { RoiInput, RoiResult } from "@/lib/roi";

interface HeroCardClasses {
  /** Background class for the prominent ROI card. */
  container: string;
  /** Text colour for the sub-label and percentage. */
  label: string;
  /** Text colour for the verdict pill below the percentage. */
  verdict: string;
  /** Pill background for the verdict. */
  pill: string;
  /** Trend arrow character. */
  arrow: string;
  /** Verdict text shown under the percentage. */
  verdictText: string;
  /** Accessible label for the ROI value (e.g. "Positif" / "Negatif"). */
  trendLabel: string;
}

function heroClassesFor(health: CampaignHealth): HeroCardClasses {
  if (health.status === "profitable") {
    return {
      container:
        "rounded-2xl p-6 text-center text-white shadow-lg shadow-brand/25 brand-gradient",
      label: "text-white/80",
      verdict: "text-white",
      pill: "bg-white/15 text-white",
      arrow: "↗",
      verdictText: "Kampanye Menguntungkan",
      trendLabel: "Positif",
    };
  }
  return {
    container:
      "rounded-2xl p-6 text-center text-white shadow-lg shadow-sky-500/30 bg-gradient-to-br from-sky-500 to-cyan-500",
    label: "text-white/85",
    verdict: "text-white",
    pill: "bg-white/15 text-white",
    arrow: "↗",
    verdictText: "Perlu Optimasi",
    trendLabel: "Negatif",
  };
}

export function RoiPanel({ inputs, result }: { inputs: RoiInput; result: RoiResult }) {
  const health = getCampaignHealth(result);
  const classes = heroClassesFor(health);
  const insights = generateInsights(inputs, result);
  const returnPerRupiah = (result.roi / 100 + 1).toFixed(2);

  return (
    <Card className="gap-4 rounded-2xl border border-slate-100 p-6 shadow-sm">
      <Card.Header className="gap-1">
        <Card.Title className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            📊
          </span>
          Hasil Prediksi
        </Card.Title>
        <Card.Description className="text-sm text-slate-500">
          Berdasarkan parameter kampanye Anda
        </Card.Description>
      </Card.Header>

      <Card.Content className="space-y-4">
        <div className={classes.container}>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-sm ${classes.label}`}>Laba atas Investasi (ROI)</p>
            <span aria-hidden="true" className={classes.label}>
              {classes.arrow}
            </span>
            <span className="sr-only">{classes.trendLabel}</span>
          </div>
          <p className="mt-1 text-4xl font-bold">{formatPercent(result.roi)}</p>
          <p className={`mt-1 text-sm ${classes.verdict}`}>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classes.pill}`}
            >
              {classes.verdictText}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Pendapatan" value={formatRupiah(result.revenue)} />
          <MetricCard
            label="Keuntungan"
            value={formatRupiah(result.profit)}
            tone={health.status === "profitable" ? "positive" : "negative"}
          />
          <MetricCard label="Jumlah Results" value={formatNumber(result.resultCount)} />
          <MetricCard label="CPR Target" value={formatRupiah(inputs.costPerResult)} />
          <MetricCard
            label="Pendapatan per Result"
            value={formatRupiah(result.revenuePerResult)}
          />
          <MetricCard
            label="Margin per Result"
            value={formatRupiah(result.marginPerResult)}
            tone={result.marginPerResult >= 0 ? "positive" : "negative"}
          />
        </div>

        {health.status === "profitable" && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Ringkasan Cepat</p>
            <p className="mt-2 text-sm text-slate-500">
              Setiap Rp 1 yang dibelanjakan menghasilkan Rp {returnPerRupiah}. Margin per
              hasil {formatRupiah(result.marginPerResult)}.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Wawasan Utama</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {insights.map((insight) => (
              <li key={insight.id} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
                >
                  💡
                </span>
                <span>{insight.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card.Content>
    </Card>
  );
}