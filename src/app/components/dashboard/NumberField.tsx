"use client";

import { Label, NumberField as HeroNumberField } from "@heroui/react";

import { formatRupiah } from "@/lib/format";

export function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <HeroNumberField
      className="gap-1.5"
      minValue={0}
      name={label}
      step={1000}
      value={value}
      onChange={(next) => onChange(next ?? 0)}
    >
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-slate-400">{formatRupiah(value)}</span>
      </div>
      <HeroNumberField.Group>
        <HeroNumberField.DecrementButton />
        <HeroNumberField.Input className="w-full" />
        <HeroNumberField.IncrementButton />
      </HeroNumberField.Group>
      {hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </HeroNumberField>
  );
}