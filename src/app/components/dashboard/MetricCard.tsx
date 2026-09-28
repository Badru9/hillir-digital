import { Card } from "@heroui/react";

import { cn } from "@/lib/cn";

export function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="gap-0.5 rounded-xl border border-slate-100 bg-slate-50 p-3" variant="transparent">
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold",
          tone === "default" && "text-slate-900",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-red-600",
        )}
      >
        {value}
      </p>
    </Card>
  );
}