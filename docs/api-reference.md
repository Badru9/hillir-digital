# API Reference — AdForecast Pro

> Referensi lengkap untuk semua HTTP endpoint. Semua request dan response memakai
> JSON. Semua response mengikuti envelope `{ success, data | error }`.

---

## Base URL

```
http://localhost:3000           # local dev
https://<your-domain>           # production
```

## Autentikasi

| Endpoint | Mekanisme |
|---|---|
| `/api/auth/*` | Tidak butuh auth |
| `/api/calculations` | Butuh cookie `hillir_session` (JWT ditandatangani HS256) |

Cookie attributes:

```
Name:     hillir_session
HttpOnly: true
SameSite: Lax
Secure:   true (production only)
MaxAge:   604800  # 7 hari
```

---

## Envelope Respons

### Sukses (2xx)

```json
{ "success": true, "data": { ... } }
```

### Gagal (4xx/5xx)

```json
{ "success": false, "error": "Pesan kesalahan dalam Bahasa Indonesia" }
```

Status code yang dipakai:

| Kode | Kapan |
|---|---|
| 200 | OK (GET, PUT analog) |
| 201 | Created (POST membuat row baru) |
| 400 | Body request tidak bisa di-parse sebagai JSON |
| 401 | Tidak terautentikasi / kredensial salah |
| 409 | Konflik (email/username duplikat saat register) |
| 422 | Validasi zod gagal (pesan error pertama dikembalikan) |

---

## POST `/api/auth/register`

Membuat akun baru dan langsung menandatangani sesi.

### Request Body

```json
{
  "username": "badru",
  "email": "badru@example.com",
  "password": "password123"
}
```

### Validasi (`registerSchema`)

| Field | Aturan |
|---|---|
| `username` | 3–32 chars, regex `^[a-zA-Z0-9_]+$` |
| `email` | Format email valid, max 255 chars |
| `password` | 8–72 chars |

### Respons

`201 Created` (sukses):

```json
{
  "success": true,
  "data": {
    "userId": 42,
    "email": "badru@example.com",
    "username": "badru"
  }
}
```

Plus `Set-Cookie: hillir_session=...`

`409 Conflict` (email/username duplikat):

```json
{ "success": false, "error": "Email atau username sudah terdaftar" }
```

`422 Unprocessable Entity` (zod fail):

```json
{ "success": false, "error": "Kata sandi minimal 8 karakter" }
```

---

## POST `/api/auth/login`

Masuk dengan email + password.

### Request Body

```json
{ "email": "badru@example.com", "password": "password123" }
```

### Validasi (`loginSchema`)

| Field | Aturan |
|---|---|
| `email` | Format email valid |
| `password` | Non-empty |

### Respons

`200 OK`:

```json
{
  "success": true,
  "data": { "userId": 42, "email": "...", "username": "..." }
}
```

Plus `Set-Cookie`.

`401 Unauthorized` (sengaja ambigu antara email tidak ditemukan vs password salah):

```json
{ "success": false, "error": "Email atau kata sandi salah" }
```

---

## POST `/api/auth/logout`

Menghapus cookie sesi.

### Request Body

Tidak ada.

### Respons

`200 OK`:

```json
{ "success": true, "data": { "loggedOut": true } }
```

Plus `Set-Cookie` dengan `MaxAge=0`.

---

## POST `/api/calculations`

**Protected.** Simpan kalkulasi baru untuk user yang sedang login.

### Request Body

```json
{
  "productPrice": 150000,
  "averageOrderValue": 175000,
  "adSpend": 5000000,
  "costPerResult": 50000
}
```

### Validasi (`calculationSchema`)

| Field | Aturan |
|---|---|
| `productPrice` | finite, ≥ 0 |
| `averageOrderValue` | finite, ≥ 0 |
| `adSpend` | finite, **> 0** |
| `costPerResult` | finite, **> 0** |

### Respons

`201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 7,
    "userId": 42,
    "productPrice": 150000,
    "averageOrderValue": 175000,
    "adSpend": 5000000,
    "costPerResult": 50000,
    "resultCount": 100,
    "revenue": 17500000,
    "profit": 12500000,
    "roi": 250.0,
    "revenuePerResult": 175000,
    "marginPerResult": 125000,
    "createdAt": "2024-09-28T10:30:00Z",
    "updatedAt": "2024-09-28T10:30:00Z"
  }
}
```

`401` jika tidak ada sesi:

```json
{ "success": false, "error": "Tidak terautentikasi" }
```

`422` jika validasi gagal (pesan pertama):

```json
{ "success": false, "error": "CPR harus lebih dari 0" }
```

---

## GET `/api/calculations`

**Protected.** Ambil daftar kalkulasi milik user (diurutkan dari yang terbaru).

### Request

Tidak ada body.

### Respons

`200 OK`:

```json
{
  "success": true,
  "data": [
    { "id": 7, "userId": 42, "...": "..." },
    { "id": 5, "userId": 42, "...": "..." }
  ]
}
```

> **Isolasi**: hanya row milik `session.userId` yang dikembalikan. Query
> `where({ userId: session.userId })` di server — bukan di-klient.

---

## Contoh dengan `curl`

### Login

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@adforecast.test","password":"password123"}' \
  -c cookies.txt
```

### Save Calculation (pakai cookie dari login)

```bash
curl -i -X POST http://localhost:3000/api/calculations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "productPrice": 150000,
    "averageOrderValue": 175000,
    "adSpend": 5000000,
    "costPerResult": 50000
  }'
```

### List History

```bash
curl -X GET http://localhost:3000/api/calculations -b cookies.txt
```

### Logout

```bash
curl -i -X POST http://localhost:3000/api/auth/logout -b cookies.txt -c cookies.txt
```

---

## Error Codes Cheat-Sheet

| Kode | Pesan Umum | Penyebab Umum |
|---|---|---|
| 400 | "Body permintaan tidak valid" | JSON malformed |
| 401 | "Tidak terautentikasi" / "Email atau kata sandi salah" | Missing/expired cookie, kredensial salah |
| 409 | "Email atau username sudah terdaftar" | Duplicate saat register |
| 422 | Pesan spesifik dari zod | Field tidak sesuai aturan |

---

## Catatan untuk Klien

- **CSRF**: cookie `sameSite=lax` sudah menjadi mitigasi default untuk form HTML tradisional. Tidak ada endpoint state-changing via GET.
- **Preflight CORS**: tidak ada CORS custom dikonfigurasi — klien diasumsikan same-origin.
- **Versioning**: tidak ada versi endpoint (`/v1/...`) saat ini. Perubahan breaking akan dilakukan dengan menambah versi atau via *deprecation window*.

---

© 2024 AdForecast Pro — API Reference versi 2.0.