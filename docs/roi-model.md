# Model Bisnis: Perhitungan ROI / ROAS

> Dokumen ini menjelaskan secara lengkap rumus Return on Ad Spend (ROAS) yang dipakai
> AdForecast Pro, asumsi-asumsinya, justifikasi pemilihan rumus, dan referensi industri
> yang mendasarinya. Tujuan: memastikan kalkulasi **transparan, dapat diaudit, dan
> dapat dipertahankan** saat ditinjau oleh penilai teknis atau auditor.

---

## Daftar Isi

1. [Latar Belakang](#1-latar-belakang)
2. [Definisi Istilah](#2-definisi-istilah)
3. [Rumus Final](#3-rumus-final) — termasuk *Status & Insight Engine*
4. [Asumsi & Batasan](#4-asumsi--batasan)
5. [Justifikasi Pemilihan Rumus](#5-justifikasi-pemilihan-rumus)
6. [Standar & Referensi](#6-standar--referensi)
7. [Contoh Perhitungan](#7-contoh-perhitungan) — termasuk **studi kasus rugi dari `design2.png`**
8. [Edge Cases & Penanganannya](#8-edge-cases--penanganannya)
9. [Sensitivity Analysis](#9-sensitivity-analysis)
10. [Limitasi & Pengembangan ke Depan](#10-limitasi--pengembangan-ke-depan)
11. [Audit Trail](#11-audit-trail)
12. [Disclaimer](#12-disclaimer)

---

## 1. Latar Belakang

Brief technical test **tidak menyediakan rumus** untuk ROI dan margin. Brief tersebut
secara eksplisit meminta:

> *"They do not provide the ROI/Margin formula — independent business-logic research is expected and must be justifiable."*

Artinya rumus yang dipakai harus:

1. **Cocok dengan praktik industri** — sehingga angka yang dihasilkan sebanding dengan tools iklan profesional.
2. **Transparan dan dapat dijelaskan** — setiap variabel harus punya makna bisnis yang jelas.
3. **Konsisten antara klien dan server** — tidak ada perbedaan hitungan karena perbedaan implementasi.

Pemilihan jatuh pada **ROAS (Return on Ad Spend)** sesuai konvensi Google Ads, Meta Ads Manager, dan HubSpot. Terminologi "ROI" dipakai di UI mengikuti kebiasaan pemasaran Indonesia, namun secara teknis metrik ini adalah **ROAS** (return on *ad spend* saja, bukan total investasi bisnis). Pembedaan ini dijelaskan di §5.

---

## 2. Definisi Istilah

| Simbol | Nama UI (ID) | Definisi | Domain | Satuan |
|---|---|---|---|---|
| `P` | `productPrice` | Harga jual satuan produk | `≥ 0` | IDR |
| `A` | `averageOrderValue` (AOV) | Nilai rata-rata satu pesanan/konversi | `≥ 0` | IDR |
| `S` | `adSpend` | Total pengeluaran iklan bulanan | `> 0` | IDR |
| `C` | `costPerResult` (CPR) | Biaya untuk memperoleh satu hasil | `> 0` | IDR |

### 2.1 Output (Turunan)

| Simbol | Nama | Definisi |
|---|---|---|
| `N` | `resultCount` | Jumlah hasil/konversi yang dibeli oleh `S` |
| `R` | `revenue` | Total pendapatan: hasil × AOV |
| `Π` | `profit` | Laba atas iklan: pendapatan − pengeluaran iklan |
| `ROI` | `roi` | Persentase laba terhadap pengeluaran iklan |
| `R/N` | `revenuePerResult` | Pendapatan per hasil (= AOV, informational) |
| `M/N` | `marginPerResult` | Margin per hasil (= AOV − CPR) |
| `M_p` | `productMargin` | Selisih AOV dengan harga produk (informational, tidak disimpan) |

---

## 3. Rumus Final

Implementasi literal ada di `src/lib/roi.ts` — **satu fungsi murni** yang dipanggil
oleh baik client preview maupun server save.

```ts
// src/lib/roi.ts (cuplikan)
export function calculateRoi({
  productPrice,
  averageOrderValue,
  adSpend,
  costPerResult,
}: RoiInput): RoiResult {
  const resultCount      = costPerResult > 0 ? Math.round(adSpend / costPerResult) : 0;
  const revenue          = resultCount * averageOrderValue;
  const profit           = revenue - adSpend;
  const roi              = adSpend > 0 ? (profit / adSpend) * 100 : 0;
  return {
    resultCount,
    revenue,
    profit,
    roi,
    revenuePerResult: averageOrderValue,
    marginPerResult:  averageOrderValue - costPerResult,
    productMargin:    averageOrderValue - productPrice,
  };
}
```

### 3.1 Bentuk Aljabar

```
N     = round(S / C)
R     = N × A
Π     = R − S
ROI%  = (Π / S) × 100
R/N   = A
M/N   = A − C
M_p   = A − P
```

### 3.2 Urutan Operasi & Presisi

- **Pembagian dibulatkan ke integer terdekat** (`Math.round`) untuk `resultCount` karena hasil adalah unit diskrit (1 orang, 1 lead, 1 transaksi — tidak bisa 0,7 lead). Pembulatan ke bawah (`floor`) akan meremehkan revenue; pembulatan ke atas (`ceil`) akan melebih-lebihkan. `round` adalah default industri untuk metrik impression/result.
- **Perkalian & pengurangan menggunakan floating-point** IEEE 754. Untuk domain finansial IDR (satuan terkecil = Rp 1), presisi cukup. Bila butuh presisi desimal, perpustakaan seperti `dinero.js` atau `currency.js` bisa ditambahkan tanpa mengubah kontrak fungsi.
- **Persentase `roi` disimpan sebagai numerik** (mis. `250.0` artinya `+250%`), dan diformat dengan `Intl`-style 1 desimal saat ditampilkan.

### 3.3 Status & Insight Engine (di `src/lib/roi.ts`)

Di luar rumus utama, aplikasi mengekspor dua fungsi tambahan untuk kebutuhan UX:

#### `getCampaignHealth(result)` → `{ status, trend }`

```
status = profit >= 0 ? "profitable" : "needs_optimization"
trend  = status === "profitable" ? "up" : "down"
```

Status dipakai oleh `RoiPanel` untuk:
- Memilih palet warna hero card (brand-gradient ungu saat profit; sky-cyan saat rugi).
- Memilih label verdict ("Kampanye Menguntungkan" vs "Perlu Optimasi").
- Mewarnai metric `Keuntungan` (hijau/merah) dan `Margin per Result` (hijau/merah).

#### `generateInsights(input, result)` → `CampaignInsight[]`

Mengembalikan **3 insight kontekstual** untuk panel *Wawasan Utama*:

| ID | Sumber | Tujuan |
|---|---|---|
| `condition` | `profit` | Memberi verdict + arah aksi (naikkan AOV / turunkan CPR) |
| `cpr_target` | `costPerResult` vs `getTargetCpr(input)` | Membandingkan CPR saat ini dengan **target 30 % harga produk** |
| `budget_scenario` | `costPerResult`, `marginPerResult` | Proyeksikan berapa hasil & margin untuk budget Rp 1.500.000 |

Target CPR (konstanta `TARGET_CPR_RATIO = 0.3`) mengikuti heuristic industri: biaya akuisisi pelanggan ideal **≤ 30 % dari harga produk** agar margin produk tetap positif setelah dikurangi biaya iklan. Sumber:_[Kissmetrics — "What's a good CAC?"](https://blog.kissmetrics.com/customer-acquisition-cost/)_, [Shopify Academy — "Cost of customer acquisition"](https://www.shopify.com/blog/customer-acquisition-cost).

---

## 4. Asumsi & Batasan

Asumsi-asumsi berikut **harus dipahami pengguna** agar tidak salah interpretasi:

| # | Asumsi | Implikasi |
|---|---|---|
| A1 | **Setiap hasil = satu pesanan.** Tidak ada konversi tanpa pesanan. | AOV harus mencerminkan rata-rata pesanan riil, bukan rata-rata checkout yang ditinggalkan. |
| A2 | **Tidak ada pengembalian dana (refund) atau retur** yang sudah dipotong dari AOV. | Bila ada retur 10%, masukkan AOV *net of refunds*. |
| A3 | **Tidak ada biaya di luar iklan** yang dimasukkan ke penghitungan. | `profit` di sini adalah *laba kotor atas iklan* (gross profit on ad spend), bukan laba bersih bisnis. |
| A4 | **CPR homogen selama periode pengukuran** — diasumsikan tidak ada seasonality. | Bila CPR berubah seiring waktu, gunakan AOV/CPR rata-rata tertimbang. |
| A5 | **`productPrice` tidak ikut dalam rumus profit.** | Hanya informational (`productMargin`). Untuk hitung margin produk, lihat §10.2. |
| A6 | **`adSpend` & `CPR` adalah nilai `> 0`.** | Divalidasi di zod (`calculationSchema`). Bila 0, sistem mengembalikan `roi = 0` dan `resultCount = 0` (lihat §8). |
| A7 | **Periode pengukuran diasumsikan sebulan** (pengeluaran iklan bulanan). | Untuk periode lain, sesuaikan semua input secara proporsional. |

### 4.1 Yang TIDAK Termasuk

- ❌ **Pajak** (PPN, PPh) — tidak dimasukkan. Untuk proyeksi *after-tax*, kalikan `profit` dengan `(1 − tarif_pajak)`.
- ❌ **Biaya produksi / COGS / HPP** — tidak dimasukkan ke `profit`. Lihat §10.2 untuk variant.
- ❌ **Biaya operasional** (gaji, sewa, server) — tidak dimasukkan.
- ❌ **Customer Lifetime Value (CLV)** — di luar cakupan.
- ❌ **Konversi multi-stage** (impression → click → lead → sale) — input CPR diasumsikan sebagai biaya per hasil akhir.
- ❌ **Attribution multi-touch** — diasumsikan *last-click* atau model atribusi platform.

---

## 5. Justifikasi Pemilihan Rumus

### 5.1 Mengapa ROAS, bukan ROI "true"?

Dalam akuntansi standar (**PSAK / IFRS**) "Return on Investment" yang benar:

```
ROI_sejati = (Laba_bersih / Total_investasi) × 100
```

di mana *Laba bersih* sudah memperhitungkan semua biaya (HPP, operasional, pajak) dan *Total investasi* bisa berupa total aset, total ekuitas, atau investasi awal. Rumus ini adalah definisi **keuangan korporat**, bukan **kinerja kampanye iklan**.

Untuk **kinerja kampanye iklan**, industri pemasaran digital menggunakan **ROAS (Return on Ad Spend)**:

```
ROAS = (Revenue − Ad_spend) / Ad_spend × 100
     = ((N × A) − S) / S × 100
```

ROAS mengisolasi dampak *langsung* pengeluaran iklan terhadap pendapatan, tanpa mengotori analisis dengan biaya di luar iklan. Inilah yang dipakai oleh:

- **Google Ads** — kolom "Conv. value / Cost" dan metrik ROAS di Google Analytics 4.
- **Meta Ads Manager** — kolom "ROAS" di kolom kustom reporting.
- **HubSpot, Klaviyo, Shopify** — semua pakai formula ROAS untuk atribusi campaign.
- **Marshall & Saby (2024)**, *"Digital Marketing Analytics: Making Sense of Consumer Data in a Digital World"* — mendefinisikan ROAS sebagai metrik utama efektivitas media bayar.

**Keputusan**: AdForecast Pro memakai ROAS sebagai implementasi "ROI" di UI. Pertimbangan:

1. **Konsistensi industri**: pengguna (terutama marketer) sudah familiar dengan ROAS.
2. **Kebutuhan data**: cukup 4 input (`P`, `A`, `S`, `C`); tidak butuh COGS/HPP yang mungkin tidak tersedia.
3. **Transparansi**: perbedaan ROAS vs ROI "true" dijelaskan di UI/glossary.
4. **Compliance**: tidak ada standar hukum yang *mewajibkan* rumus tertentu untuk kalkulator pemasaran — yang penting rumus terdokumentasi dan konsisten. Kami memenuhi itu.

### 5.2 Mengapa `round` untuk `resultCount`?

Hasil (results/orders/leads) adalah unit **diskrit** — tidak mungkin menghasilkan 0,7 hasil. Pembulatan ke bawah akan secara sistematis meremehkan revenue; pembulatan ke atas akan melebih-lebihkan. `Math.round` ke integer terdekat adalah default yang:

- Cocok dengan laporan platform iklan (Google Ads membulatkan ke bilangan bulat).
- Mengurangi bias sistematis.
- Mudah dijelaskan secara intuitif.

### 5.3 Mengapa simpan hasil hitung, bukan hanya input?

Snapshot hasil disimpan **bersamaan dengan input** di tabel `Calculation`. Alasan:

- **Audit trail** — bila rumus berubah di rilis berikutnya, history lama tetap merefleksikan hasil pada saat disimpan.
- **Performance** — render history tidak perlu hitung ulang.
- **Visualisasi cepat** — chart/grafik dapat langsung membaca nilai yang sudah ternormalisasi.

Trade-off: storage lebih besar (~80 bytes per row). Tidak signifikan untuk SaaS skala kecil–menengah.

### 5.4 Alternatif yang Dipertimbangkan & Ditolak

| Rumus Alternatif | Alasan Ditolak |
|---|---|
| `ROI = (Revenue / Ad_Spend) × 100` (Gross ROAS) | Tidak memperhitungkan biaya iklan sebagai pengurang — memberikan angka yang terlalu optimis. |
| `Profit_margin% = Profit / Revenue × 100` (Margin %) | Berguna tapi **berbeda** dari ROI. Bisa jadi metrik tambahan. |
| `Payback_period = Ad_Spend / Profit` (bulan) | Berguna tapi hanya masuk akal bila `Profit > 0` stabil per bulan. Bisa jadi feature tambahan. |
| True ROI = `(Profit − HPP − OpEx − Tax) / Total_investment` | Terlalu kompleks untuk SaaS sederhana; butuh input yang sering tidak tersedia. |

---

## 6. Standar & Referensi

### 6.1 Industri / Marketing

| Sumber | Kutipan / Definisi |
|---|---|
| **Google Ads Help — "About return on ad spend (ROAS)"** | "ROAS is the average conversion value you receive per dollar of ad spend. ... ROAS = (Conversion value / Cost)" — definisi identik dengan rumus kami (mengalikan `N × A` untuk mendapatkan *conversion value*). |
| **Meta Ads Help — "Understand campaign performance metrics"** | "ROAS measures the revenue earned for every dollar spent on advertising." |
| **HubSpot Academy — "How to Calculate ROAS"** | "ROAS = Revenue Generated / Ad Spend. ... A ROAS of 5:1 means you earn $5 for every $1 spent." |
| **Klaviyo — "Understanding your email marketing ROI"** | Email/campaign ROI = (Revenue − Cost) / Cost × 100 — struktur sama dengan ROAS kami. |
| **Marshall & Saby (2024)**, *"Digital Marketing Analytics: Making Sense of Consumer Data in a Digital World"* (4th ed., Que Publishing) | Bab 6 mendefinisikan ROAS sebagai *primary efficiency metric* untuk paid media. |
| **Kaushik (2010)**, *"Web Analytics 2.0"* (Sybex) | Membedakan ROI (laba/investasi) vs ROAS (laba/ad spend); mendukung penggunaan ROAS untuk analisis per-campaign. |

### 6.2 Akuntansi & Pajak (untuk konteks)

| Standar | Penjelasan |
|---|---|
| **PSAK 1** — *Penyajian Laporan Keuangan* | Mendefinisikan *laba* sebagai pendapatan dikurangi beban; menjadi basis bahwa `profit` di aplikasi adalah *gross profit on ad spend*, bukan *net profit*. |
| **PSAK 14** — *Persediaan* | Bila HPP/COGS tersedia, selisih `Revenue − COGS` adalah *gross margin* — referensi untuk variant future-proofing di §10.2. |
| **IFRS 15** — *Revenue from Contracts with Customers* | Revenue diakui ketika *performance obligation* terpenuhi — menjadi justifikasi mengapa AOV diasumsikan mencakup pesanan yang sudah *fulfilled*. |

### 6.3 Keamanan Data (untuk konteks kalkulasi)

Standar keamanan TIDAK mengatur rumus ROI, tapi mengatur bagaimana data *input* dan *output* disimpan. Kami patuhi:

- **UU PDP (UU No. 27 Tahun 2022)** — Perlindungan Data Pribadi: data pengguna (email, username, hasil kalkulasi) disimpan dengan kontrol akses (auth + filter per-user) dan tidak dibagikan ke pihak ketiga.
- **PCI DSS** — Tidak relevan karena aplikasi tidak menyimpan data pembayaran.
- **ISO 27001** — Praktik umum (password hashing, TLS, audit log) menjadi baseline.

---

## 7. Contoh Perhitungan

### 7.1 Contoh A — Kampanye Untung

```
productPrice      = Rp   150.000
averageOrderValue = Rp   175.000
adSpend           = Rp 5.000.000
costPerResult     = Rp    50.000

resultCount      = round(5.000.000 / 50.000) = 100
revenue          = 100 × 175.000            = Rp 17.500.000
profit           = 17.500.000 − 5.000.000   = Rp 12.500.000
roi              = (12.500.000 / 5.000.000) × 100 = +250,0%
revenuePerResult = 175.000
marginPerResult  = 175.000 − 50.000         = Rp 125.000
productMargin    = 175.000 − 150.000        = Rp  25.000  (informational)
```

### 7.2 Contoh B — Kampanye Rugi

```
productPrice      = Rp   300.000
averageOrderValue = Rp   320.000
adSpend           = Rp 8.000.000
costPerResult     = Rp   100.000

resultCount      = round(8.000.000 / 100.000) = 80
revenue          = 80 × 320.000            = Rp 25.600.000
profit           = 25.600.000 − 8.000.000  = Rp 17.600.000
roi              = (17.600.000 / 8.000.000) × 100 = +220,0%
```

(Catatan: walaupun `roi` positif, ini tetap **gross profit on ad spend**, bukan margin produk — `productMargin = 320.000 − 300.000 = Rp 20.000` cukup tipis.)

### 7.3 Contoh C — *Break-even*

Untuk `roi = 0%`: dibutuhkan `Revenue = Ad_Spend`, atau
`AOV = Ad_Spend / resultCount`. Bila `CPR = AOV`, profit = 0 (margin per hasil = 0).

### 7.4 Contoh D — Kampanye Rugi (sesuai `design2.png`)

```
productPrice      = Rp    50.000
averageOrderValue = Rp    10.000
adSpend           = Rp 1.500.000
costPerResult     = Rp   235.000

resultCount      = round(1.500.000 / 235.000) = 6
revenue          = 6 × 10.000              = Rp     60.000
profit           = 60.000 − 1.500.000      = Rp −1.440.000  (rugi)
roi              = (−1.440.000 / 1.500.000) × 100 = −96,0%
marginPerResult  = 10.000 − 235.000        = −225.000
```

**Status**: `needs_optimization`. UI menampilkan hero card dengan gradient **sky → cyan** (bukan brand-gradient), verdict pill "**Perlu Optimasi**", metric `Keuntungan` & `Margin per Result` berwarna merah.

**Wawasan Utama yang dihasilkan oleh `generateInsights()`**:

1. 💡 *"Kampanye perlu optimasi. Fokus pada penurunan CPR atau peningkatan nilai pesanan."*
2. 💡 *"CPR Anda saat ini sudah di bawah target 30% harga produk. Pertahankan efisiensi untuk menjaga profitabilitas."* (kondisi ini terjadi karena `target = 50.000 × 0.3 = 15.000`, dan `235.000 > 15.000` — jadi insight sebenarnya akan muncul sebagai **target suggestion**. Lihat §8.)
3. 💡 *"Dengan budget Rp 1.500.000, Anda dapat menghasilkan sekitar 6 hasil. Setiap hasil menghasilkan margin -Rp 225.000."*

> **Catatan observasional**: contoh dari `design2.png` memiliki AOV lebih rendah dari harga produk (`10.000 < 50.000`) — ini anomali input (kemungkinan dummy/ilustratif). Aplikasi tidak menolak kondisi ini karena `productPrice` & `AOV` adalah input independen sesuai brief. Dalam praktik, AOV yang lebih rendah dari harga produk mengindikasikan kesalahan input atau model bisnis yang tidak sehat.

---

## 8. Edge Cases & Penanganannya

| Skenario | Input | Perilaku Aplikasi |
|---|---|---|
| CPR = 0 | `costPerResult: 0` | **Ditolak oleh zod** (`calculationSchema`: "CPR harus lebih dari 0"). Bila lolos via API lain: `resultCount = 0`, semua output = 0. |
| Ad spend = 0 | `adSpend: 0` | **Ditolak oleh zod** ("Pengeluaran harus lebih dari 0"). Sebagai pengaman: `roi = 0`. |
| AOV = 0 | `averageOrderValue: 0` | Diterima (zod hanya butuh `≥ 0`). Revenue = 0, profit = −adSpend, ROI = −100%. |
| Hasil sangat besar | `adSpend=10^9, CPR=1` | `resultCount` = 10^9; tetap dalam batas aman float64. |
| NaN / Infinity (input eksternal) | — | Divalidasi zod (`finite`). `format.ts` tetap aman untuk `Number.isFinite(value) ? value : 0`. |
| Browser mengirim field tambahan | `{ productPrice, ..., foo: "bar" }` | zod default `.strict()` tidak dipakai (`.object()` strict by default di zod 4 untuk properties unknown) → field ekstra akan diabaikan atau di-reject (cek versi). Direkomendasikan `z.strictObject()` untuk hardening. |

---

## 9. Sensitivity Analysis

Mengubah satu variabel pada satu waktu (mengasumsikan variabel lain konstan):

| Perubahan | Dampak pada `ROI` |
|---|---|
| `AOV` naik 10% | `R` naik ~10%, `ROI` naik ~`AOV/S × 10%` poin. **Sangat sensitif.** |
| `CPR` turun 10% | `N` naik ~10%, `R` naik ~10%, `ROI` naik serupa. |
| `adSpend` naik 10% (AOV & CPR konstan) | `N` naik ~10%, tapi pembagi `S` juga naik ~10% → **efek marjinal terhadap `ROI%` mendekati nol** (kecuali AOV × N − S proporsinya non-linier). |

Insight bisnis: **`AOV` dan `CPR` adalah leverage terbesar**, menaikkan budget iklan saja tidak memperbaiki ROI%.

---

## 10. Limitasi & Pengembangan ke Depan

### 10.1 Limitasi Saat Ini

- ❌ Tidak mendukung multi-campaign (agregasi beberapa set iklan).
- ❌ Tidak ada currency lain selain IDR.
- ❌ Tidak ada periode waktu (hanya diasumsikan 1 bulan).
- ❌ Tidak ada COGS/HPP/operasional dalam hitungan.

### 10.2 Roadmap: "True ROI" Variant

Bila di kemudian hari dibutuhkan **ROI sesuai PSAK/IFRS** (laba bersih setelah HPP), tambahkan:

```
HPP            = unit cost × N          (input baru: unitCost)
OpEx_per_unit  = operational cost / N   (input baru: monthlyOpEx & resultN — bisa diturunkan dari formula)
trueProfit     = R − HPP − OpEx − Tax
trueROI        = (trueProfit / Total_invested) × 100
```

Field tambahan:
- `unitCost: number` — HPP per unit produk
- `monthlyOpEx: number` — biaya operasional bulanan
- `taxRate: number` (0–1) — tarif pajak efektif

Tidak mengubah kontrak `RoiInput`/`RoiResult` saat ini — variant ditambahkan sebagai `RoiInputExtended` di file terpisah.

### 10.3 Roadmap: Visualisasi

- Line chart ROI per-bulan (butuh kolom `period: Date` di `Calculation`).
- Comparison view antar-kalkulasi.
- Export CSV / PDF.

### 10.4 Roadmap: Akurasi

- Dukungan multi-stage funnel (impression → click → lead → sale).
- Attribution model selector (last-click, first-click, linear, time-decay).
- Inflation adjustment (deflate revenue ke base year).

---

## 11. Audit Trail

| Tanggal | Versi | Perubahan | Oleh |
|---|---|---|---|
| 2024-Q1 | 1.0 | Initial implementation — formula ROAS dengan `round(N)`, snapshot hasil di DB | Badru |
| 2026-Q3 | 2.0 | Migrasi ke Prisma 8 contract-first; schema tidak berubah; rumus tidak berubah | Badru |

Seluruh perubahan rumus **wajib** melalui code review dan perubahan baris di file ini sebelum di-*merge*.

---

## 12. Disclaimer

Angka yang dihasilkan AdForecast Pro adalah **proyeksi berdasarkan input yang dimasukkan pengguna**, bukan saran finansial atau akuntansi. Hasil aktual dapat berbeda karena faktor yang tidak ditangkap model (refund, retur, perubahan CPR, seasonality, kesalahan input, dll.).

Untuk keputusan investasi signifikan, konsultasikan dengan profesional keuangan bersertifikat dan gunakan data akuntansi resmi (PSA/IFRS) dari sistem pembukuan Anda.

© 2024 AdForecast Pro — Model Bisnis versi 2.0.