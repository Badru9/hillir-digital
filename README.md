# AdForecast Pro — Ad ROI Calculator

> Aplikasi SaaS sederhana untuk memprediksi **laba atas investasi (ROI) kampanye iklan digital** secara *real-time*. Setiap pengguna memiliki akun sendiri, dan seluruh riwayat perhitungannya tersimpan secara privat.

Dibangun sebagai jawaban untuk **technical test Full Stack Developer — PT Hillir Tumbuh Bersama**.

---

## Daftar Isi

1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Fitur](#2-fitur)
3. [Tech Stack](#3-tech-stack)
4. [Memulai](#4-memulai)
5. [Skrip](#5-skrip)
6. [Arsitektur Aplikasi](#6-arsitektur-aplikasi)
7. [Skema Data](#7-skema-data)
8. [API Reference](#8-api-reference)
9. [Model Bisnis: Perhitungan ROI](#9-model-bisnis-perhitungan-roi)
10. [Keamanan](#10-keamanan)
11. [Struktur Proyek](#11-struktur-proyek)
12. [Deployment](#12-deployment)
13. [Verifikasi & Testing](#13-verifikasi--testing)
14. [Known Issues](#14-known-issues)

---

## 1. Ringkasan Produk

**AdForecast Pro** adalah kalkulator ROI kampanye iklan berbasis web dengan autentikasi penuh. Pemakai memasukkan empat parameter kampanye dan langsung melihat proyeksi pendapatan, laba, dan ROI — tanpa reload. Perhitungan yang menarik bisa disimpan ke akun pribadi untuk dibandingkan kemudian di halaman *history*.

- **Single-page kalkulator** dengan slider + numeric input yang tersinkronisasi.
- **Autentikasi penuh** (registrasi, login, logout, sesi persisten via JWT cookie httpOnly).
- **Riwayat privat** — setiap akun hanya melihat perhitungannya sendiri; data diisolasi di level database *dan* level API.
- **UI/UX** mengikuti referensi desain terlampir: tema terang, aksen indigo/biru, tipografi Geist Sans.

---

## 2. Fitur

| # | Fitur | Detail |
|---|---|---|
| F1 | Autentikasi | Registrasi, login, logout, sesi 7 hari |
| F2 | Perhitungan *real-time* | ROI/profit/revenue berubah seketika saat parameter diubah |
| F3 | Slider ↔ Number sinkron | Setiap parameter punya slider *dan* number input yang berbagi satu *state* |
| F4 | Simpan perhitungan | POST ke API, tersimpan dengan `userId` dari token |
| F5 | History Log | GET ter-filter per-user, diurutkan dari yang terbaru |
| F6 | Isolasi data | `proxy.ts` + server-side `requireSession()` + filter `where({ userId })` |
| F7 | Validasi input | Zod di setiap write endpoint, pesan error dalam Bahasa Indonesia |
| F8 | UI konsisten | Semua primitive Button/Input/Table/Card/NumberField/Slider dari HeroUI v3 |
| F9 | Tema ringan | Tailwind CSS v4 + variabel CSS `@theme inline` |
| F10 | Format lokal | Rupiah (`Intl.NumberFormat("id-ID")`) + tanggal medium + short |
| F11 | UI kontekstual untuk kampanye rugi | Hero card ganti ke gradient sky-cyan + verdict "Perlu Optimasi" + 3 insight actionable dari `generateInsights()` |

---

## 3. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components, route handlers, middleware — semua kebutuhan SaaS kecil terpenuhi |
| UI runtime | **React 19** | Didukung langsung oleh Next 16, concurrent rendering |
| Styling | **Tailwind CSS v4** + `@heroui/styles` | Utility-first, theme via CSS variables (`@theme inline`) |
| Komponen | **HeroUI v3** | Compound components, BEM, aksesibilitas via React Aria |
| ORM | **Prisma 8 (RC, contract-first)** | Skema sebagai sumber kebenaran tunggal, *type generation* dari kontrak |
| Database | **PostgreSQL 18** | Relasional — User–Calculation adalah relasi 1-ke-N |
| Autentikasi | **`jose`** (JWT HS256) + **`bcryptjs`** (12 salt rounds) | Standar industri, library kecil, audited |
| Validasi | **Zod 4** | Skema single-source-of-truth untuk client dan server |
| Bahasa | **TypeScript 7** | Strict mode, type generation otomatis dari Prisma contract |

---

## 4. Memulai

### 4.1 Prasyarat

- Node.js ≥ 20 (Bun 1.4 direkomendasikan untuk `bun.lock` / `packageManager`).
- PostgreSQL ≥ 15 yang dapat dijangkau.
- Salin `.env.example` → `.env` dan isi `DATABASE_URL` serta `AUTH_SECRET`.

```bash
# Generate secret JWT yang kuat (48 byte base64url)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 4.2 Instalasi

```bash
bun install                     # atau: npm install
cp .env.example .env            # lalu edit DATABASE_URL & AUTH_SECRET
```

### 4.3 Setup Database

```bash
# 1. Emit kontrak Prisma → generate src/prisma/contract.json + contract.d.ts
bun run contract:emit

# 2. Inisialisasi tabel (jalankan sekali)
npx prisma db init --db "$DATABASE_URL"

# 3. Terapkan perubahan skema (dev)
npx prisma db update --db "$DATABASE_URL"
```

### 4.4 Seed Data (opsional)

```bash
bun run db:seed
```

Membuat dua akun demo dengan riwayat perhitungan. Re-run aman — kalkulasi milik user yang sama akan di-reset:

| Email | Password | Perhitungan |
|---|---|---|
| `demo@adforecast.test` | `password123` | 3 |
| `sari@adforecast.test` | `password123` | 1 |

### 4.5 Jalankan Aplikasi

```bash
bun run dev
```

Buka <http://localhost:3000>. Akan redirect ke `/login` jika belum terautentikasi.

---

## 5. Skrip

| Perintah | Deskripsi |
|---|---|
| `bun run dev` | Menjalankan dev server (Turbopack) |
| `bun run build` | Build produksi (termasuk type-check) |
| `bun run start` | Serve build produksi |
| `bun run lint` | ESLint (lihat *Known Issues*) |
| `bun run contract:emit` | Regenerasi artefak kontrak Prisma |
| `bun run db:seed` | Seed akun & kalkulasi demo |

---

## 6. Arsitektur Aplikasi

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│   Next.js App Router (React 19 + HeroUI v3 + Tailwind v4)       │
│                                                                  │
│   ┌──────────┐   ┌──────────────┐   ┌────────────────────────┐  │
│   │ /login   │   │ /register    │   │ / (dashboard)           │ │
│   │ Form     │   │ Form         │   │  Calculator + History   │ │
│   └────┬─────┘   └──────┬───────┘   └────────────┬────────────┘  │
└────────┼────────────────┼────────────────────────┼───────────────┘
         │                │                        │
         │ POST /api/auth/login       POST /api/calculations
         │ POST /api/auth/register    GET  /api/calculations
         │ POST /api/auth/logout
         ▼                ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                 Next.js Route Handlers (Server)                  │
│                                                                  │
│   • zod validation         • bcrypt verify / hash                │
│   • jose JWT signing       • session cookie (httpOnly)           │
│   • shared calculateRoi()  • Prisma 8 contract client            │
└──────────────────────────────────────────────────────────────────┘
         │                                                       │
         │ proxy.ts  (Next 16 "proxy" — protect /, /history)      │
         │ requireSession() in Server Components                  │
         ▼                                                       ▼
┌────────────────────┐                              ┌──────────────────────┐
│  PostgreSQL 18     │                              │  hillir_session       │
│  ─ User (1)        │                              │  httpOnly cookie      │
│  ─ Calculation (N) │                              │  JWT (HS256, 7 days)  │
│  FK userId (idx)   │                              └──────────────────────┘
└────────────────────┘
```

### 6.1 Alur Autentikasi

1. **Sign up**: User POST `{ username, email, password }` → server memvalidasi (zod), hash password (bcrypt 12 rounds), buat `User`, sign JWT (`{ sub: userId, email, username }`), pasang cookie `hillir_session` (`httpOnly`, `sameSite=lax`, `secure` di prod), redirect ke `/`.
2. **Login**: User POST `{ email, password }` → server lookup, verifikasi hash (bcrypt.compare), set cookie sama seperti di atas. Pesan error **identik** untuk "email tidak ditemukan" dan "password salah" — anti-enumerasi akun.
3. **Session**: Cookie JWT diverifikasi setiap request via `proxy.ts` (route gate) dan `requireSession()` (server-side guard).
4. **Logout**: POST `/api/auth/logout` → cookie di-*expire* (`maxAge: 0`).

### 6.2 Alur Perhitungan

1. **State lokal**: `Calculator.tsx` memegang satu `RoiInput` state.
2. **Reactive**: `useMemo(() => calculateRoi(inputs), [inputs])` menjalankan ulang formula setiap render — slider/number yang terhubung ke state akan langsung memicu hitung ulang.
3. **Save**: Tombol "Simpan Perhitungan" → POST `/api/calculations` dengan 4 input. Server memvalidasi (`calculationSchema`), **menjalankan `calculateRoi()` lagi** (server tidak pernah percaya hitungan klien), simpan ke DB, kembalikan row lengkap.
4. **History**: `/history` adalah Server Component → `requireSession()` → `GET /api/calculations` internal → filter `where({ userId: session.userId })`.

---

## 7. Skema Data

### 7.1 Tabel `User`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `Int` | PK, autoincrement |
| `email` | `String` | UNIQUE |
| `username` | `String` | UNIQUE |
| `passwordHash` | `String` | bcrypt hash (60 chars) |
| `createdAt` | `Timestamptz` | default `now()` |
| `updatedAt` | `Timestamptz` | auto-update |

### 7.2 Tabel `Calculation`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `Int` | PK |
| `userId` | `Int` | FK → `User.id`, `ON DELETE CASCADE`, **indexed** |
| `productPrice` | `Float` | Input |
| `averageOrderValue` | `Float` | Input |
| `adSpend` | `Float` | Input |
| `costPerResult` | `Float` | Input |
| `resultCount` | `Int` | Hasil hitung |
| `revenue` | `Float` | Hasil hitung |
| `profit` | `Float` | Hasil hitung |
| `roi` | `Float` | Hasil hitung (persen) |
| `revenuePerResult` | `Float` | Hasil hitung |
| `marginPerResult` | `Float` | Hasil hitung |
| `createdAt` | `Timestamptz` | default `now()` |
| `updatedAt` | `Timestamptz` | auto-update |

> **Mengapa hasil hitung juga disimpan?** Untuk audit trail — baris history menampilkan snapshot hasil pada saat disimpan, bukan hasil *recomputed* yang bisa berbeda kalau formula diubah di kemudian hari.

### 7.3 Isolasi Data

Setiap query `Calculation` **wajib** menyertakan `where({ userId: session.userId })`. Pola ini diverifikasi di:

- `src/app/api/calculations/route.ts` (POST & GET).
- `src/prisma/seed.ts` (tidak menghapus akun satu user saat seeding ulang).

---

## 8. API Reference

Seluruh respons mengikuti envelope:

```json
{ "success": true, "data": ... }       // 2xx
{ "success": false, "error": "..." }   // 4xx/5xx
```

| Method | Endpoint | Auth | Body | Respons |
|---|---|---|---|---|
| POST | `/api/auth/register` | — | `{ username, email, password }` | `201` `{ userId, email, username }` + cookie |
| POST | `/api/auth/login` | — | `{ email, password }` | `200` `{ userId, email, username }` + cookie |
| POST | `/api/auth/logout` | — | — | `200` `{ loggedOut: true }` + cookie expired |
| POST | `/api/calculations` | ✅ | `{ productPrice, averageOrderValue, adSpend, costPerResult }` | `201` Calculation |
| GET | `/api/calculations` | ✅ | — | `200` Calculation[] |

### 8.1 Status Code

| Kode | Makna |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Body request tidak bisa di-parse |
| 401 | Tidak terautentikasi / kredensial salah |
| 404 | (tidak dipakai) |
| 409 | Email/username duplikat (saat register) |
| 422 | Validasi zod gagal |

### 8.2 Validasi (zod schemas)

```ts
registerSchema = {
  username: 3–32 chars, [a-zA-Z0-9_]+
  email: format email valid, max 255
  password: 8–72 chars
}

loginSchema = {
  email: format valid
  password: non-empty
}

calculationSchema = {
  productPrice:      finite, ≥ 0
  averageOrderValue: finite, ≥ 0
  adSpend:           finite, > 0
  costPerResult:     finite, > 0
}
```

Pesan error memakai Bahasa Indonesia, diambil dari issue pertama yang gagal.

---

## 9. Model Bisnis: Perhitungan ROI

> Dokumen lengkap tentang rumus, asumsi, justifikasi, dan referensi ada di
> [`docs/roi-model.md`](./docs/roi-model.md). Bagian ini adalah ringkasannya.

### 9.1 Input

| Parameter | Alias UI | Satuan | Domain |
|---|---|---|---|
| `productPrice` | Harga Produk | IDR | `≥ 0` |
| `averageOrderValue` (AOV) | Nilai Pesanan Rata-rata | IDR | `≥ 0` |
| `adSpend` | Pengeluaran Iklan Bulanan | IDR | `> 0` |
| `costPerResult` (CPR) | Cost per Result | IDR | `> 0` |

### 9.2 Rumus (diimplementasikan di `src/lib/roi.ts`)

```
resultCount      = round(adSpend / costPerResult)
revenue          = resultCount × averageOrderValue
profit           = revenue − adSpend
roi              = (profit / adSpend) × 100          // persen
revenuePerResult = averageOrderValue
marginPerResult  = averageOrderValue − costPerResult
productMargin    = averageOrderValue − productPrice  // informational
```

### 9.3 Contoh Perhitungan

Input: `productPrice=150.000`, `AOV=175.000`, `adSpend=5.000.000`, `CPR=50.000`

```
resultCount      = round(5.000.000 / 50.000) = 100
revenue          = 100 × 175.000             = 17.500.000
profit           = 17.500.000 − 5.000.000    = 12.500.000
roi              = (12.500.000 / 5.000.000) × 100 = +250,0%
revenuePerResult = 175.000
marginPerResult  = 175.000 − 50.000          = 125.000
productMargin    = 175.000 − 150.000         = 25.000
```

### 9.4 Edge Cases & Pencegahan

- **`costPerResult = 0`** → `resultCount = 0` (di-handle eksplisit; pembagian 0 akan menjadi `Infinity`).
- **`adSpend = 0`** → `roi = 0` (di-handle eksplisit; pembagian 0).
- **`Number.isFinite` guard** di `format.ts` — formatter mengembalikan `"Rp 0"` untuk `NaN`/`Infinity`.
- **`adSpend`/`costPerResult` wajib `> 0`** di zod — ini juga memastikan output `resultCount` dan `roi` tidak ambigu.

### 9.5 Definisi & Standar yang Dirujuk

- **ROI (Return on Investment)** dan **ROAS (Return on Ad Spend)** — dipakai luas oleh Google Ads, Meta Ads, HubSpot, dan buku teks digital marketing (*"Digital Marketing Analytics"* — Marshall & Saby).
- Konvensi industri: hasil disimpan sebagai **persen** (mis. `250.0%`) dan **dibulatkan ke 1 desimal** saat ditampilkan (`formatPercent`).
- Lihat [`docs/roi-model.md`](./docs/roi-model.md) untuk justifikasi panjang, *sensitivity analysis*, dan referensi.

---

## 10. Keamanan

| Aspek | Implementasi |
|---|---|
| Password hashing | `bcryptjs` 12 salt rounds (~250 ms per hash) — plaintext **tidak pernah** disimpan. |
| Session | JWT HS256 ditandatangani dengan `AUTH_SECRET` (32+ byte), disimpan di cookie `httpOnly`, `sameSite=lax`, `secure` di production. |
| Anti-enumerasi | Login mengembalikan **pesan identik** untuk "email tidak ditemukan" dan "password salah". |
| Validasi input | zod di setiap endpoint tulis; error pertama dikembalikan ke klien. |
| Isolasi data | Setiap query `Calculation` menyertakan `where({ userId })`; diverifikasi end-to-end. |
| CSRF | Cookie `sameSite=lax` cukup untuk perlindungan CSRF dasar pada form ini (tidak ada state-changing GET). Untuk hardening lebih lanjut dapat ditambahkan token anti-CSRF di body. |
| SQL injection | Semua query via Prisma contract — parameterized, tidak ada string interpolation. |
| Secrets | `AUTH_SECRET` & `DATABASE_URL` di `.env` (gitignored). `.env.example` hanya berisi placeholder. |
| Error leakage | Server tidak membocorkan stack trace; route handlers mengembalikan pesan generic. |

---

## 11. Struktur Proyek

```
hillir/
├── src/
│   ├── app/                          # App Router
│   │   ├── (auth)/                   # Grup publik (login/register)
│   │   │   ├── layout.tsx            # Shell auth: card tengah, gradient bg
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Grup terproteksi
│   │   │   ├── layout.tsx            # requireSession() + DashboardNav
│   │   │   ├── page.tsx              # Kalkulator (/)
│   │   │   └── history/page.tsx      # Riwayat (/history)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── register/route.ts
│   │   │   └── calculations/route.ts # POST save, GET list (protected)
│   │   ├── components/
│   │   │   ├── auth/{Login,Register}Form.tsx
│   │   │   ├── dashboard/{Calculator,RoiPanel,SliderField,NumberField,
│   │   │   │                MetricCard,LogoutButton,NavLinks,DashboardNav}.tsx
│   │   │   ├── ui/{TextField,SubmitButton}.tsx
│   │   │   └── Brand.tsx
│   │   ├── globals.css               # @import tailwindcss + @heroui/styles
│   │   └── layout.tsx                # Root layout (html, body, fonts)
│   ├── lib/
│   │   ├── api/response.ts           # ok() / fail() envelope
│   │   ├── auth/
│   │   │   ├── constants.ts          # cookie name, TTL, salt rounds
│   │   │   ├── jwt.ts                # signSession / verifySession (jose)
│   │   │   ├── password.ts           # hashPassword / verifyPassword (bcryptjs)
│   │   │   └── session.ts            # getSession / requireSession / attach
│   │   ├── format.ts                 # Intl wrappers (rupiah, percent, date)
│   │   ├── roi.ts                    # ★ Pure ROI model (1 implementasi, 2 caller)
│   │   └── validation.ts             # zod schemas
│   ├── prisma/
│   │   ├── contract.prisma           # Skema sumber kebenaran
│   │   ├── contract.json             # Generated
│   │   ├── contract.d.ts             # Generated types
│   │   ├── db.ts                     # postgres<Contract>() client
│   │   └── seed.ts                   # Demo users + calculations
│   └── proxy.ts                      # Next 16 middleware (auth gate)
├── docs/
│   ├── technical-test-brief.md       # Brief asli + audit implementasi
│   └── roi-model.md                  # ★ Justifikasi rumus ROI
├── prisma.config.ts                  # Konfigurasi Prisma 8 (root)
├── next.config.ts
├── tailwind config                    # lewat @tailwindcss/postcss (v4)
├── postcss.config.mjs
├── tsconfig.json                     # alias @/* → src/*
├── package.json
└── README.md                         # ← Anda di sini
```

---

## 12. Deployment

### 12.1 Vercel (direkomendasikan)

```bash
# Install CLI
npm i -g vercel

# Set env vars di dashboard Vercel:
#   DATABASE_URL  → Postgres connection string (Neon, Supabase, RDS, dll.)
#   AUTH_SECRET   → hasil dari `crypto.randomBytes(48).toString('base64url')`

vercel deploy --prod
```

Catatan Vercel:
- Pakai **Node.js 20** runtime (Bun opsional).
- `proxy.ts` Next 16 jalan di edge runtime — tidak ada penyesuaian khusus.
- Serverless functions menjalankan route handlers; `@prisma/orm-postgres` compatible dengan runtime Node.

### 12.2 Self-hosted

```bash
bun run build
bun run start                        # default port 3000
```

Siapkan reverse-proxy (Caddy/Nginx) untuk TLS, dan Postgres yang reachable.

### 12.3 Checklist Pra-Deploy

- [ ] `DATABASE_URL` di-set di environment production.
- [ ] `AUTH_SECRET` di-set dan **berbeda** dari development.
- [ ] `prisma db init` sudah dijalankan di production DB.
- [ ] HTTPS aktif (cookie `secure` butuh HTTPS di production).
- [ ] CORS dibatasi (default Next sudah restrictive — tidak perlu setup tambahan).

---

## 13. Verifikasi & Testing

### 13.1 Verifikasi Manual yang Sudah Dijalankan

- ✅ `npm run build` — lulus TypeScript strict.
- ✅ API end-to-end (18 cek): register, login, logout, save, list, isolation, validation, protected route, seeded account.
- ✅ Page rendering (9 cek): semua route render di kedua state (auth/unauth).
- ✅ `npm run db:seed` — idempotent.

### 13.2 Test yang Direkomendasikan untuk Iterasi Berikut

- **Unit**: `src/lib/roi.ts` — table tests untuk semua edge case (`adSpend=0`, `cpr=0`, nilai sangat besar/kecil).
- **Integration**: route handlers — pakai `next-test-api-route-handler` atau Playwright.
- **E2E**: Playwright untuk flow register → simpan kalkulasi → cek history → logout.
- **Security**: dependency audit (`bun audit` / `npm audit`), `zod` schema fuzzing.

---

## 14. Known Issues

| Issue | Dampak | Mitigasi |
|---|---|---|
| `npm run lint` gagal: `typescript-eslint` belum mendukung TS 7.0 | Lint tidak bisa dijalankan | Toolchain issue, **bukan** code issue. `npm run build` tetap melakukan type-check dan lulus. Solusi: pin TS ke 6.x di branch terpisah, atau tunggu upstream support. |
| Tidak ada rate-limiting di `/api/auth/login` | Brute force mungkin | Tambahkan rate-limit (upstash/redis) sebelum go-live. |
| Tidak ada email verification | Akun tanpa verifikasi email bisa dipakai | Bisa ditambah dengan kolom `emailVerifiedAt` di `User`. |
| Tidak ada password reset | UX terbatas | Bisa ditambah endpoint `/api/auth/forgot` (perlu mail provider). |
| Hard-coded cookie name (`hillir_session`) | Tidak ada masalah sekarang, tapi inflexibel untuk multi-domain | Bisa diparameterisasi per environment. |

---

## Lampiran: Glosarium

| Istilah | Definisi |
|---|---|
| **ROI** | Return on Investment — laba dibagi investasi, dikalikan 100%. |
| **ROAS** | Return on Ad Spend — versi spesifik ROI untuk budget iklan saja. Di aplikasi ini, istilah "ROI" mengikuti konvensi industri iklan (= ROAS). |
| **AOV** | Average Order Value — nilai rata-rata satu transaksi/konversi. |
| **CPR** | Cost per Result — biaya untuk memperoleh satu hasil (konversi/lead/sale). |
| **CPL** | Cost per Lead — sama dengan CPR ketika "result" = lead. |
| **SaaS** | Software as a Service — model distribusi di mana aplikasi diakses via web. |
| **JWT** | JSON Web Token — token berformat JSON untuk transmisi klaim yang ditandatangani. |
| **bcrypt** | Algoritma hashing password adaptive (perlu round = cost factor). |
| **FK** | Foreign Key — constraint referensial antar tabel. |
| **Cascade** | Aksi saat parent dihapus: child ikut terhapus. |

---

© 2024 AdForecast Pro — dibuat untuk technical test PT Hillir Tumbuh Bersama.