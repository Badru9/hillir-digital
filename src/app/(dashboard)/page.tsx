import Calculator from "@/app/components/dashboard/Calculator";
import { Card } from "@heroui/react";

const FEATURES = [
  {
    icon: "⚡",
    title: "Perhitungan Real-Time",
    description:
      "Lihat secara langsung bagaimana perubahan parameter kampanye Anda memperbarui pendapatan, keuntungan, dan ROI dengan kalkulator dinamis kami.",
  },
  {
    icon: "🎯",
    title: "Wawasan Berbasis Data",
    description:
      "Dapatkan rekomendasi yang dapat ditindaklanjuti berdasarkan metrik kampanye Anda untuk mengoptimalkan kinerja dan memaksimalkan profitabilitas.",
  },
  {
    icon: "💡",
    title: "Optimalkan Pengeluaran Iklan",
    description:
      "Temukan keseimbangan sempurna antara pengeluaran iklan dan hasil. Identifikasi CPR optimal untuk bisnis Anda.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="gap-3 rounded-3xl border border-slate-100 p-8 shadow-sm">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm text-brand">
          ✨ Prediksi Kesuksesan Produk Digital Anda
        </span>
        <Card.Title className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
          Hitung ROI Kampanye Iklan Anda{" "}
          <span className="brand-text-gradient">Secara Real-Time</span>
        </Card.Title>
        <Card.Description className="max-w-2xl text-slate-500">
          Buat keputusan berdasarkan data dengan kalkulator prediksi canggih kami.
          Prediksi pendapatan, optimalkan pengeluaran iklan, dan maksimalkan
          profitabilitas produk digital Anda.
        </Card.Description>
      </Card>

      <Calculator />

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
          Mengapa Menggunakan{" "}
          <span className="brand-text-gradient">AdForecast Pro?</span>
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Buat keputusan yang tepat dengan prediksi real-time dan wawasan yang dapat
          ditindaklanjuti untuk kampanye produk digital Anda.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="gap-2 rounded-2xl border border-slate-100 p-6 text-left shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                {feature.icon}
              </div>
              <Card.Title className="mt-4 font-semibold text-slate-900">
                {feature.title}
              </Card.Title>
              <Card.Description className="text-sm text-slate-500">
                {feature.description}
              </Card.Description>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
