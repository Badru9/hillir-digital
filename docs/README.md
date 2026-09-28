# Dokumentasi AdForecast Pro

Folder ini berisi dokumentasi teknis lengkap aplikasi. Mulai dari [`../README.md`](../README.md)
di root untuk gambaran umum.

## Daftar Dokumen

| File | Untuk siapa | Isi |
|---|---|---|
| [`technical-test-brief.md`](./technical-test-brief.md) | Reviewer / HR | Brief asli + audit implementasi per requirement |
| [`architecture.md`](./architecture.md) | Engineer | Diagram, request lifecycle, trust boundary, sequence diagram |
| [`roi-model.md`](./roi-model.md) | Business / Penilai | Rumus ROI/ROAS, justifikasi, standar yang dirujuk, contoh |
| [`api-reference.md`](./api-reference.md) | Frontend / Tester | Setiap endpoint: request, validasi, respons, contoh curl |
| [`slide-deck-prompt.md`](./slide-deck-prompt.md) | Presenter / Penulis deck | Prompt siap-pakai untuk AI slide generator (12–15 slide) |

## Urutan Baca yang Disarankan

1. **`../README.md`** — gambaran umum aplikasi, fitur, dan cara menjalankan.
2. **`architecture.md`** — cara kerja teknis, sequence diagram login & save.
3. **`api-reference.md`** — kontrak HTTP untuk frontend/backend.
4. **`roi-model.md`** — pembahasan rumus bisnis, justifikasi, dan referensi standar.

## Untuk Penilai (Technical Test)

Brief di [`technical-test-brief.md`](./technical-test-brief.md) Bagian §7 memuat tabel
status implementasi per requirement (A1–A3, F1–F5, B1–B6) plus ringkasan verifikasi.

Jika ingin langsung ke "bagian yang menarik":

- **Rumus ROI** → [`roi-model.md`](./roi-model.md) §3 (rumus), §5 (justifikasi), §6 (standar).
- **Keamanan sesi** → [`architecture.md`](./architecture.md) §4 + [`../README.md`](../README.md) §10.
- **Isolasi data** → [`api-reference.md`](./api-reference.md) `GET /api/calculations` + catatan tentang `where({ userId })`.

© 2024 AdForecast Pro.