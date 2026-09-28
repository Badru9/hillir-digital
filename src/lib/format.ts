const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("id-ID");

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe > 0 ? "+" : ""}${safe.toFixed(fractionDigits)}%`;
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

/** Parses a "Rp 5.000.000" / "5000000" string back into a whole-rupiah number. */
export function parseRupiah(input: string): number {
  const digits = input.replace(/[^0-9]/g, "");
  return digits === "" ? 0 : Number(digits);
}
