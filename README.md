# Midad (مِداد)

Aplikasi belajar bahasa Arab bergaya game: Arab-first, RTL, dengan maskot yang berlayar dari negeri pengguna ke dunia Arab.
Dibuat untuk Lomba Abjad 2026 (batas pengumpulan 5 Des 2026).

## Struktur

```
design-system/          sumber kebenaran desain
  tokens.json           token (warna terang/gelap, tipografi, spacing, radius, bayangan)
  tokens.css            DIBUAT dari tokens.json (npm run build:css)
  components/           components.css (aplikasi), preview.css, bundle.css (dibuat), 1 folder per komponen
  assets/maskot/        mascot.js/.mjs, vehicles.js/.mjs, SVG, png/
  assets/ikon/          ikon & lencana, png/
  assets/rihlah/        routes.json (rute), curriculum.json (marhalah & wahdah), tips.json
  guides/               panduan: belajar, maskot, rihlah
  preview/              galeri komponen (npm run preview:ds)
  prototypes/           prototipe HTML lepas
docs/
  notion/               salinan Markdown halaman Notion 00–10
  pratinjau/            gambar ringkas maskot & kendaraan
  arsip/                arsip 20 Nov 2026 (catatan & metadata artifact lama)
scripts/                build & pengecekan (Node, tanpa dependensi)
app/                    aplikasi Vite + React + TS (menyusul)
dist/                   hasil build, tidak di-commit
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run build:css` | `tokens.json` → `tokens.css`, dan `bundle.css` dari `preview.css` + `components.css` |
| `npm run check` | Memastikan CSS sinkron, tipe maskot cocok dengan runtime, dan data rute/kurikulum konsisten |
| `npm run preview:ds` | Galeri komponen di http://127.0.0.1:8765/preview/ (terang/gelap) |
| `npm run build:paket` | Paket aset siap bagi ke `dist/paket-aset/` + `dist/Midad-Aset.zip` |

## Aturan

- Jangan edit file yang dibuat otomatis (`tokens.css`, `bundle.css`, `dist/`). Ubah sumbernya lalu jalankan build.
- Kurikulum: 4 marhalah (A1–B2) × 16 wahdah = 64 level, diselaraskan dengan CEFR (`docs/notion/09-Kurikulum-CEFR.md`).
- Semua konten pelajaran ditulis sendiri. Jangan menyalin materi dari kitab atau tabel CEFR resmi.
