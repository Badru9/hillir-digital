"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { NumberField } from "./NumberField";
import { RoiPanel } from "./RoiPanel";
import { SliderField } from "./SliderField";
import { calculateRoi, type RoiInput } from "@/lib/roi";
import { Button, Card } from "@heroui/react";

const INITIAL_INPUTS: RoiInput = {
  productPrice: 500_000,
  averageOrderValue: 500_000,
  adSpend: 5_000_000,
  costPerResult: 100_000,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function Calculator() {
  const router = useRouter();
  const [inputs, setInputs] = useState<RoiInput>(INITIAL_INPUTS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");

  const result = useMemo(() => calculateRoi(inputs), [inputs]);

  function updateInput<K extends keyof RoiInput>(key: K, value: number) {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setSaveStatus("idle");
  }

  async function handleSave() {
    setSaveStatus("saving");
    setSaveError("");

    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Gagal menyimpan perhitungan");
      }

      setSaveStatus("saved");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
      setSaveStatus("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="gap-4 rounded-2xl border border-slate-100 p-6 shadow-sm">
        <Card.Header className="gap-0">
          <Card.Title className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              ⚙
            </span>
            Parameter Kampanye
          </Card.Title>
        </Card.Header>

        <Card.Content className="space-y-6">
          <NumberField
            label="Harga Produk"
            value={inputs.productPrice}
            onChange={(value) => updateInput("productPrice", value)}
            hint="Harga jual satuan produk"
          />
          <SliderField
            label="Pengeluaran Iklan Bulanan"
            value={inputs.adSpend}
            onChange={(value) => updateInput("adSpend", value)}
            min={1_000_000}
            max={50_000_000}
            step={500_000}
          />
          <SliderField
            label="Cost per Results (CPR)"
            value={inputs.costPerResult}
            onChange={(value) => updateInput("costPerResult", value)}
            min={10_000}
            max={500_000}
            step={5_000}
          />
          <NumberField
            label="Nilai Pesanan Rata-rata"
            value={inputs.averageOrderValue}
            onChange={(value) => updateInput("averageOrderValue", value)}
            hint="Rata-rata nilai transaksi per hasil"
          />
        </Card.Content>

        <Card.Footer className="mt-2 flex flex-wrap items-center gap-3">
          <Button
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-95"
            isPending={saveStatus === "saving"}
            type="button"
            onPress={handleSave}
          >
            {({ isPending }) => (isPending ? "Menyimpan..." : "Simpan Perhitungan")}
          </Button>
          {saveStatus === "saved" && (
            <span className="text-sm text-emerald-600">
              Perhitungan tersimpan.
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
        </Card.Footer>
      </Card>

      <RoiPanel inputs={inputs} result={result} />
    </div>
  );
}
