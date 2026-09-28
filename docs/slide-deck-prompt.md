# Slide Deck Prompt — AdForecast Pro

> Dokumen ini adalah **prompt siap-pakai** untuk membuat slide deck presentasi (10–15 slide) yang menjelaskan aplikasi AdForecast Pro. Copy-paste isi dokumen ini ke LLM/AI slide generator (mis. Gamma, Beautiful.ai, SlidesGPT, ChatGPT, Claude) sebagai instruksi pembuatan deck.
>
> Brief asli: [`technical-test-brief.md`](./technical-test-brief.md). Detail teknis lengkap: [`../README.md`](../README.md), [`architecture.md`](./architecture.md), [`api-reference.md`](./api-reference.md), [`roi-model.md`](./roi-model.md).

---

## 🎯 Prompt untuk AI Slide Generator

```
Buatkan slide deck presentasi profesional (Bahasa Indonesia, formal tapi
accessible) sebanyak 12–15 slide untuk aplikasi web "AdForecast Pro — Ad ROI
Calculator". Deck ini untuk presentasi technical test Full Stack Developer di
PT Hillir Tumbuh Bersama.

Gunakan pedoman visual:
- Tema terang (putih/light gray background), aksen indigo (#5e4dfb) dan
  sky-cyan (#0ea5e9) sesuai brand palette aplikasi.
- Tipografi modern sans-serif (Inter / Geist Sans).
- Layout bersih, banyak white space, setiap slide fokus pada SATU ide.
- Sertakan diagram flowchart/arsitektur (ASCII-friendly), tabel, dan
  bullet points yang ringkas. Maksimal 6 baris teks per slide.
- Setiap slide dimulai dengan judul besar, lalu subtitle / konteks singkat,
  lalu konten utama (visual > teks), lalu key takeaway di bagian bawah.
- Slide terakhir berisi "Terima Kasih" + kontak.

Gunakan struktur dan konten di bawah ini persis. Setiap heading "## Slide N"
adalah SATU slide.
```

---

## 📑 Struktur Slide (isi untuk AI)

### ## Slide 1 — Cover / Judul

**Judul**: AdForecast Pro — Prediksi ROI Kampanye Iklan Secara Real-Time

**Subtitle**: Kalkulator ROI iklan digital dengan autentikasi penuh & riwayat tersimpan privat per-pengguna

**Footer kecil**:
- Penulis: Badru
- Untuk: Technical Test Full Stack Developer — PT Hillir Tumbuh Bersama
- Tanggal: 2024

**Catatan visual**: Background gradient halus indigo→cyan, logo aplikasi di tengah.

---

### ## Slide 2 — Latar Belakang & Masalah

**Judul**: Mengapa AdForecast Pro?

**Konten** (3 poin dengan icon):
1. 💰 **Pemborosan budget iklan** — Banyak UMKM menjalankan iklan tanpa tahu apakah campaign-nya untung atau rugi sampai akhir bulan.
2. 📊 **Kalkulator umum tidak kontekstual** — Tool gratis di internet tidak menyimpan skenario per-user, tidak punya autentikasi, dan tidak memisahkan data antar-pengguna.
3. 🔒 **Privasi data** — Riwayat perhitungan adalah data strategis; perlu dipisahkan per akun.

**Key takeaway**: Aplikasi ini menjembatani kesenjangan antara kalkulasi real-time dan SaaS sederhana yang aman.

---

### ## Slide 3 — Main Mission (dari Brief)

**Judul**: Misi Utama

**Konten** (kutipan singkat):
> *"Bangun 1 aplikasi web kalkulator ROI iklan dengan fitur Authentication yang berfungsi penuh berdasarkan desain UI terlampir. Aplikasi harus berfungsi layaknya SaaS sederhana dimana data perhitungan setiap user tersimpan secara privat."*

**Sub-poin**:
- Aplikasi mengikuti desain referensi terlampir (terang, aksen biru/indigo)
- Autentikasi: register, login, logout, sesi persisten
- Riwayat tersimpan privat per akun

---

### ## Slide 4 — Demo / Tampak Layar

**Judul**: Tampilan Aplikasi

**Konten** (3 mockup screens):
- **Login & Register** — kartu tengah, gradient background, form input
- **Dashboard Kalkulator** — parameter di kiri, hasil prediksi di kanan (2 kolom)
- **History Log** — tabel responsif dengan warna profit/rugi

**Key takeaway**: UI mengikuti desain referensi terlampir; semua interaksi real-time (slider + number input tersinkronisasi).

**Catatan**: Karena ini adalah prompt, tidak ada gambar aktual — instruksikan AI untuk generate placeholder dengan deskripsi di atas atau gunakan placeholder kotak abu-abu.

---

### ## Slide 5 — Tech Stack

**Judul**: Tech Stack

**Konten** (tabel):

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI Runtime | React 19 |
| Styling | Tailwind CSS v4 + HeroUI v3 |
| Database | PostgreSQL 18 + Prisma 8 (contract-first) |
| Auth | `jose` (JWT HS256) + `bcryptjs` (12 rounds) |
| Validasi | Zod 4 |

**Key takeaway**: Semua library modern, well-maintained, dan scalable untuk SaaS skala kecil-menengah.

---

### ## Slide 6 — Arsitektur Aplikasi

**Judul**: Arsitektur Sistem

**Konten** (diagram alur, top-to-bottom):

```
[ Browser / Next.js Client (React 19 + HeroUI v3) ]
        │
        │  fetch JSON, Cookie hillir_session (httpOnly)
        ▼
[ Next.js Server ]
   ├─ proxy.ts (edge)  ─► verifikasi JWT, route gating
   ├─ Route Handlers   ─► zod validate, bcrypt, jose
   ├─ src/lib/roi.ts   ─► pure ROI function (1 impl, 2 callers)
   └─ src/prisma/db.ts ─► Postgres contract client
        │
        ▼
[ PostgreSQL 18 ]
   User (1) ──── Calculation (N)   FK userId (indexed)
```

**Key takeaway**: Single source of truth untuk formula ROI — tidak ada duplikasi antara client preview & server save.

---

### ## Slide 7 — Skema Database

**Judul**: Model Data

**Konten** (2 tabel ringkas):

**Tabel `User`**:
- `id` (PK), `email` (UNIQUE), `username` (UNIQUE)
- `passwordHash` (bcrypt)
- `createdAt`, `updatedAt`
- Relasi: 1 → N Calculation

**Tabel `Calculation`**:
- Input: `productPrice`, `averageOrderValue`, `adSpend`, `costPerResult`
- Hasil hitung (snapshot): `resultCount`, `revenue`, `profit`, `roi`, `revenuePerResult`, `marginPerResult`
- `userId` (FK → User, **CASCADE on delete**, indexed)
- `createdAt`, `updatedAt`

**Key takeaway**: Hasil hitung disimpan sebagai snapshot untuk audit trail — formula bisa evolve tanpa mengubah history lama.

---

### ## Slide 8 — Autentikasi & Keamanan

**Judul**: Autentikasi & Isolasi Data

**Konten** (poin):
- 🔐 **Password**: di-hash dengan `bcryptjs` 12 salt rounds (~250ms per hash). Plain-text tidak pernah disimpan.
- 🎫 **Session**: JWT HS256 ditandatangani `AUTH_SECRET` (32+ byte), disimpan di cookie `httpOnly` + `sameSite=lax` + `secure` di production.
- 🛡 **Anti-enumerasi**: pesan login identik untuk "email tidak ditemukan" vs "password salah".
- 🚧 **Route gating**: `proxy.ts` (edge middleware) + `requireSession()` (server-side guard) di `/` dan `/history`.
- 🔒 **Isolasi data**: setiap query `Calculation` menyertakan `where({ userId: session.userId })`. User A tidak pernah bisa melihat data User B.

**Key takeaway**: 3 lapis pertahanan — password hash, session token, dan filter query per-user.

---

### ## Slide 9 — Model Bisnis: Rumus ROI

**Judul**: Perhitungan ROI / ROAS

**Konten** (rumus + contoh):

```
resultCount      = round(adSpend / costPerResult)
revenue          = resultCount × averageOrderValue
profit           = revenue − adSpend
roi              = (profit / adSpend) × 100
revenuePerResult = averageOrderValue
marginPerResult  = averageOrderValue − costPerResult
```

**Contoh** (input → output):
- Input: AOV Rp 175.000, Ad Spend Rp 5.000.000, CPR Rp 50.000
- Hasil: 100 hasil, Revenue Rp 17,5 jt, Profit Rp 12,5 jt, **ROI +250%**

**Key takeaway**: ROAS = Return on Ad Spend — standar industri (Google Ads, Meta Ads, HubSpot). ROI di aplikasi ini secara teknis adalah ROAS; dokumentasi menjelaskan perbedaannya.

---

### ## Slide 10 — Status & Insight Engine

**Judul**: UX Kontekstual untuk Kampanye Rugi

**Konten** (diagram alur 2 cabang):

```
         ┌─ PROFIT ≥ 0 ──► "Kampanye Menguntungkan"
INPUTS ──┤                 Hero: gradient ungu
         │                 Ringkasan Cepat
         │
         └─ PROFIT < 0 ──► "Perlu Optimasi"
                           Hero: sky → cyan
                           3 Insight Kontekstual:
                           💡 Verdict + arah aksi
                           💡 Target CPR (≤ 30% harga produk)
                           💡 Proyeksi budget Rp 1,5jt
```

**Key takeaway**: Aplikasi tidak hanya menampilkan angka, tapi **rekomendasi actionable**. Target CPR mengikuti heuristic industri (CAC ≤ 30% harga produk).

---

### ## Slide 11 — API Reference

**Judul**: REST API Endpoints

**Konten** (tabel ringkas):

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register` | — | Buat akun + set cookie |
| POST | `/api/auth/login` | — | Login + set cookie |
| POST | `/api/auth/logout` | — | Hapus cookie |
| POST | `/api/calculations` | ✅ | Simpan kalkulasi |
| GET | `/api/calculations` | ✅ | List history user |

**Envelope JSON**:
- Sukses: `{ "success": true, "data": ... }`
- Gagal: `{ "success": false, "error": "..." }` (status 400/401/409/422)

**Key takeaway**: API minimal, RESTful, dengan autentikasi JWT cookie. Dokumentasi lengkap di `docs/api-reference.md`.

---

### ## Slide 12 — Alur Real-Time

**Judul**: Real-Time Calculation Flow

**Konten** (sequence diagram):

```
User ubah slider/number
        │
        ▼
setInputs({ ...prev, [key]: value })
        │
        ▼
useMemo(() => calculateRoi(inputs), [inputs])
        │
        ▼
RoiPanel re-render dengan metrik baru
        │
        ▼
User klik "Simpan Perhitungan"
        │
        ▼
POST /api/calculations (dengan 4 input)
        │
        ▼
Server validasi zod + recompute calculateRoi (server-authoritative)
        │
        ▼
INSERT ke Calculation (userId dari JWT)
```

**Key takeaway**: Preview real-time tanpa network call. Save terotorisasi server; klien tidak pernah dipercaya.

---

### ## Slide 13 — Deployment

**Judul**: Deployment & Operasional

**Konten**:
- 🚀 **Platform**: Vercel (direkomendasikan) — auto-deploy per branch, edge runtime untuk `proxy.ts`
- 🗄 **Database**: PostgreSQL managed (Neon, Supabase, RDS)
- 🔑 **Env vars**: `DATABASE_URL`, `AUTH_SECRET` (32+ byte random)
- 🛠 **Setup**: `bun install` → `cp .env.example .env` → `prisma contract emit` → `prisma db init` → `bun run dev`

**Checklist pra-deploy**:
- [ ] `AUTH_SECRET` berbeda dari development
- [ ] HTTPS aktif (cookie `secure` butuh HTTPS)
- [ ] `prisma db init` sudah dijalankan di DB production
- [ ] (Opsional) Rate-limiting di `/api/auth/login` sebelum go-live

**Key takeaway**: Setup ~5 menit, deploy otomatis via Vercel.

---

### ## Slide 14 — Demo Live / Video

**Judul**: Demo Aplikasi

**Konten** (catatan untuk presenter):
- Tampilkan link live demo: `https://<your-app>.vercel.app`
- Akun demo (jika seed di-deploy): `demo@adforecast.test` / `password123`
- Flow yang di-demo:
  1. Register akun baru → auto-redirect ke dashboard
  2. Ubah slider → ROI update real-time
  3. Coba input ekstrim (rugi besar) → hero card ganti ke "Perlu Optimasi"
  4. Simpan kalkulasi → buka `/history` → data tampil
  5. Logout → coba akses `/` → redirect ke login

**Key takeaway**: Hands-on lebih persuasif daripada screenshot.

---

### ## Slide 15 — Penutup & Kontak

**Judul**: Terima Kasih

**Konten**:
- ✨ **Ringkasan 1 kalimat**: Aplikasi SaaS sederhana yang menghitung ROI iklan real-time dengan privasi data per-pengguna.
- 📚 **Dokumentasi lengkap**: `README.md`, `docs/architecture.md`, `docs/api-reference.md`, `docs/roi-model.md`
- 🔗 **Repo**: `<URL repository>`
- 🌐 **Live demo**: `<URL deployment>`
- 📧 **Kontak**: `<email>`
- 🐛 **Known issues**: `npm run lint` blocked oleh TS 7.0 incompatibility (toolchain, bukan code issue) — `npm run build` tetap lulus TypeScript.

**Catatan visual**: Background gelap (indigo/cyan) dengan teks putih, minimalis, logo di tengah.

---

## 🎨 Pedoman Visual Tambahan

```
Warna brand:
- Primary (indigo):    #5e4dfb   (sesuai --color-brand)
- Accent (sky cyan):   #0891d6 / #0ea5e9 (sesuai --color-brand-accent / hero loss)
- Background:          #f5f6fa (light gray)
- Foreground:          #0f172a (slate-900)
- Success (profit):    #10b981 (emerald-600)
- Danger (loss):       #ef4444 (red-600)

Font:
- Display: Inter / Geist Sans, 600–700 weight
- Body: Inter / Geist Sans, 400–500 weight
- Code/Mono: Geist Mono

Layout principles:
- Slide 16:9 widescreen
- Margin 60px
- Title 36–44pt
- Body 18–22pt (readable dari jarak 3m)
- Hindari full paragraph — pakai bullet + icon
```

---

## 📋 Checklist Sebelum Generate Deck

- [ ] Pilih tool presentasi (Gamma.app / Beautiful.ai / SlidesAI / manual)
- [ ] Siapkan akun demo + URL deployment
- [ ] Screenshot 3 layar utama (login, kalkulator untung, kalkulator rugi)
- [ ] Eksekusi prompt di atas + lampirkan konteks tambahan bila perlu
- [ ] Review slide untuk konsistensi brand color & typo
- [ ] Simpan sebagai PDF (deliverable brief: "Presentation Deck (PDF)")

---

## 🔄 Variasi Prompt (Opsional)

Jika ingin deck yang **lebih ringkas (8–10 slide)**, gabungkan slide-slide berikut:

- Slide 4 (Demo) + 5 (Tech Stack) → **Slide "Implementasi"** (visual + tech dalam satu slide)
- Slide 9 (Rumus ROI) + 10 (Insight Engine) → **Slide "Model Bisnis"**
- Slide 11 (API) + 12 (Real-time flow) → **Slide "Cara Kerja"**
- Slide 13 (Deployment) → opsional, bisa dihapus jika tidak relevan

Jika ingin deck yang **lebih panjang (18+ slide)**, tambahkan:

- Slide per-endpoint API dengan request/response lengkap
- Slide dedicated untuk security deep-dive
- Slide dedicated untuk dokumentasi (`docs/`)
- Slide per-contoh perhitungan (untung, rugi, break-even)

---

© 2024 AdForecast Pro. Dokumen ini di bawah CC-BY — bebas digunakan & dimodifikasi.