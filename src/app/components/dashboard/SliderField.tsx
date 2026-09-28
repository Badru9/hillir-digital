"use client";

import { Label, NumberField as HeroNumberField, Slider as HeroSlider } from "@heroui/react";

import { formatRupiah } from "@/lib/format";

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold text-brand">{formatRupiah(value)}</span>
      </div>

      <HeroSlider
        aria-label={label}
        className="w-full"
        maxValue={max}
        minValue={min}
        step={step}
        value={value}
        onChange={(next) => {
          if (typeof next === "number") onChange(next);
        }}
      >
        <HeroSlider.Track>
          <HeroSlider.Fill />
          <HeroSlider.Thumb />
        </HeroSlider.Track>
      </HeroSlider>

      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatRupiah(min)}</span>
        <span>{formatRupiah(max)}</span>
      </div>

      <HeroNumberField
        aria-label={`${label} (angka)`}
        minValue={0}
        step={step}
        value={value}
        onChange={(next) => onChange(next ?? 0)}
      >
        <HeroNumberField.Group>
          <HeroNumberField.DecrementButton />
          <HeroNumberField.Input className="w-full" />
          <HeroNumberField.IncrementButton />
        </HeroNumberField.Group>
      </HeroNumberField>
    </div>
  );
}