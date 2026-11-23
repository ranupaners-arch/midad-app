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
app/                    aplikasi Vite + React + TypeScript
  src/domain/           konten demo, progres/hadiah, pengulangan, validasi profil, pencocokan transkrip
  src/screens/          onboarding, Rihlah, wahdah, kosakata, latihan, pengulangan, ringkasan, maskot, profil
  src/ui/               komponen bersama, audio perangkat, pengenalan suara
  public/               ikon SVG/PNG dan lisensi font; manifest/worker dibuat saat build
tests/                  pengujian alur browser (Playwright + axe)
dist/                   hasil build, tidak di-commit
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm install` | Memasang dependensi aplikasi (Node ≥ 22.12) |
| `npm run dev` | Aplikasi lokal di http://127.0.0.1:5173/ |
| `npm run build` | Validasi design system, periksa TypeScript, build ke `dist/app/` |
| `npm run preview` | Pratinjau build aplikasi di http://127.0.0.1:4173/ |
| `npm run typecheck` | Pemeriksaan tipe aplikasi |
| `npm test` | Pengujian aturan progres, konten, hadiah, penyimpanan, dan transkrip |
| `npm run test:e2e` | Alur browser, reload, kuis, maskot, tema, dan pemeriksaan aksesibilitas |
| `npm run test:pwa` | Build produksi, uji offline, pembaruan aplikasi, dan kegagalan pendaftaran worker |
| `npm run build:css` | `tokens.json` → `tokens.css`, dan `bundle.css` dari `preview.css` + `components.css` |
| `npm run check` | Memastikan CSS sinkron, tipe maskot cocok dengan runtime, dan data rute/kurikulum konsisten |
| `npm run preview:ds` | Galeri komponen di http://127.0.0.1:8765/preview/ (terang/gelap) |
| `npm run build:paket` | Paket aset siap bagi ke `dist/paket-aset/` + `dist/Midad-Aset.zip` |

## Aturan

- Jangan edit file yang dibuat otomatis (`tokens.css`, `bundle.css`, `dist/`). Ubah sumbernya lalu jalankan build.
- Kurikulum: 4 marhalah (A1–B2) × 16 wahdah = 64 level, diselaraskan dengan CEFR (`docs/notion/09-Kurikulum-CEFR.md`).
- Semua konten pelajaran ditulis sendiri. Jangan menyalin materi dari kitab atau tabel CEFR resmi.

## MVP aplikasi (23 Nov 2026)

Alur yang sudah diimplementasikan: bahasa ID/EN → kustomisasi hudhud → mulai A1 → peta Nusantara → tiga wahdah → kuis → hadiah dan pembukaan wahdah berikutnya.

- Wahdah 1: salam; wahdah 2: perkenalan; wahdah 3: angka. Total **100 entri kosakata/ungkapan** (30/35/35), masing-masing dengan tiga sesi belajar dan pengulangan. Semua materi di `app/src/domain/content.ts` adalah **draf orisinal untuk demo**, perlu ditinjau pengajar bahasa Arab sebelum rilis pembelajaran.
- Delapan aktivitas mewakili enam langkah wahdah: tiga sesi mufradat diselingi pola kalimat, hiwar, qira'ah, latihan, lalu kuis. Satu kata dikuasai setelah tiga jawaban benar pada soal berbeda; kuis terbuka setelah langkah sebelumnya selesai dan ≥80% kosakata dikuasai.
- Daftar **Kosakataku** tersedia dari setiap wahdah yang terbuka. Tiga titik menunjukkan kredit penguasaan tiap kata. Pencarian menerima bahasa Arab dengan/tanpa harakat, Indonesia, Inggris, serta simbol angka Arab/Persia. Filter semua/baru/dipelajari/dikuasai diterapkan dengan tombol cari; kata kunci dan filter tersimpan pada URL sehingga tetap ada setelah reload. Tautan latihan hanya muncul untuk sesi yang sudah terbuka.
- Kuis baru berisi **8 soal kosakata dan 2 soal susun kalimat**, lulus ≥80%. Pada penguasaan 80–99%, pengguna memilih mencoba kuis atau kembali belajar; sesi yang sedang berjalan langsung dilanjutkan. Hadiah pertama 30 kurma (+20 jika ≥95%) dan 30 XP; mengulang kuis tidak menggandakan hadiah. Peti sesudah hiwar memberi 10 kurma dan aksesori sekali saja. Wahdah ketiga membuka skin pelaut sebagai hadiah demo.
- Progres, posisi soal, feedback terakhir, maskot, inventori, bahasa, dan tema disimpan di browser dengan kunci `midad.profile.v1`. Profil dapat diekspor/impor lewat pengaturan. Tidak ada akun atau sinkronisasi server. Jangan menghapus data browser tanpa membuat cadangan.
- **Checkpoint per latihan:** membuka aktivitas lain menyimpan sesi sebelumnya ke `savedSessions` dan memulihkan sesi tujuan jika sudah pernah dimulai. Posisi soal, feedback, versi soal, serta hint yang sudah dipakai tetap tersimpan; aturan kredit XP/penguasaan dan hadiah tetap berlaku. Peta menampilkan sesi terakhir dengan nama wahdah, aktivitas, serta nomor soal; sesi lainnya tersedia lewat daftar yang bisa dibuka dengan keyboard. Kartu aktivitas di wahdah menandai latihan yang bisa dilanjutkan. Semua checkpoint ikut dalam ekspor/impor dan cache aplikasi memungkinkan pemulihannya saat offline.
- Setelah tiga kuis wahdah lulus, **ringkasan perjalanan** tersedia dari hasil kuis ketiga, peta, dan profil (`#/summary`). Ringkasan menampilkan nilai terbaik, jumlah kata yang benar-benar dikuasai, dan bagian yang menunggu pengulangan, dengan tautan untuk belajar kembali dan memakai hadiah pelaut yang sudah dimiliki. Menampilkan ringkasan tidak memberi hadiah lagi; menyelesaikan tiga wahdah tidak otomatis berarti semua kata sudah dikuasai.
- **Pengulangan tersimpan:** jawaban salah dan hiwar yang dilewati masuk daftar `reviews`, tersedia dari peta, profil, dan hasil latihan. Daftar menyimpan sumber soal; sesi pengulangan memiliki checkpoint dan feedback sendiri sehingga tidak menimpa pelajaran yang sedang berjalan. Jawaban benar mengeluarkan soal dari daftar. Melewati mikrofon tetap menyisakan latihan bicara, tanpa dianggap benar. Soal kuis yang diulang di sini tidak mengubah nilai kuis, memberi hadiah, atau membuka level; soal latihan hanya dapat memberi kredit penguasaan/XP pertamanya. Posisi sesi tetap stabil ketika entri yang selesai keluar dari daftar.
- Cadangan profil v1 lama tetap dapat dibaca. Field pengulangan dan `savedSessions` yang belum ada diberi nilai awal tanpa menghapus progres atau sesi aktif; kesalahan yang masih tersimpan dalam sesi aktif lama dipulihkan ke daftar. Kesalahan dari sesi lama yang datanya sudah tidak ada tidak direka ulang. Checkpoint yang kuncinya tidak cocok dengan wahdah/aktivitas di dalamnya diabaikan, dan sesi aktif menjadi sumber utama bila sebuah cadangan memuat duplikat checkpoint.
- Sesi menyimpan `questionVersion`: sesi baru memakai versi 2; sesi lama tanpa field ini memakai versi 1. Kuis versi 1 tetap berisi 10 soal kosakata dengan urutan, checkpoint, feedback, dan aturan hadiah sebelumnya. Daftar pengulangan tetap mengenali soal kuis lama, termasuk dua soal yang diganti pada versi 2. Versi yang belum dikenal tidak ditulis ulang otomatis.
- Tema mengikuti sistem atau pilihan pengguna; UI Arab/RTL, terjemahan opsional, radio native, dialog native, dan reduced motion. Terjemahan dikunci pada soal arti dan ujian.
- Audio demo memakai **SpeechSynthesis dengan suara Arab perangkat**, jika tersedia. Ini belum rekaman penutur asli. Suara lokal diprioritaskan; suara layanan jarak jauh tidak dipilih saat offline. Perangkat tanpa suara Arab yang dapat digunakan mendapat latihan teks.
- Hiwar dapat memakai **Web Speech API** setelah tindakan pengguna dan izin mikrofon. Transkrip dibandingkan dengan teks yang dinormalisasi; hasil ini bukan penilaian makhraj. Jika tidak tersedia/gagal, pengguna bisa lanjut tanpa mikrofon; bagian itu ditandai untuk pengulangan dan tidak dihitung sebagai jawaban benar.
- Tiga hint gratis per hari menurut tanggal lokal; tambahan 10 kurma, maksimal lima pembelian sehari. Hint ditawarkan setelah dua jawaban salah berturut-turut atau 20 detik tanpa interaksi saat halaman terlihat. Kuota hanya terpakai setelah diklik, maksimal satu per soal, tanpa hint dalam ujian. Hint mengurangi pilihan yang salah atau membantu urutan; pilihan yang dieliminasi tidak dapat dikirim sebagai jawaban. XP jawaban benar dengan hint menjadi setengah, dibulatkan ke bawah (5 → 2 XP), dan pemakaiannya tetap tercatat setelah reload.

Build statis berada di `dist/app/`, terpisah dari `dist/paket-aset/`. Hash routing membuat halaman bisa dimuat ulang tanpa aturan rewrite server.

## PWA dan offline

1. Jalankan `npm run build`, lalu `npm run preview` untuk membuka versi produksi di http://127.0.0.1:4173/. Server pengembangan (`npm run dev`) tidak memasang service worker.
2. Buka aplikasi saat terhubung, lalu cek status **pelajaran siap offline** di profil. Build memuat seluruh materi demo, renderer maskot, ikon, dan font. Font disajikan dari aplikasi melalui paket [Fontsource](https://fontsource.org/docs/getting-started/introduction); tidak ada permintaan Google Fonts di aplikasi. Lisensi font ikut disertakan di `font-licenses/`.
3. Setelah cache siap, aplikasi dapat dimuat ulang, dipakai belajar, dan menyimpan progres saat offline. Pengenalan suara dinonaktifkan ketika browser menyatakan offline; pengguna tetap bisa melanjutkan melalui jalur tanpa mikrofon. Dukungan audio sintetis bergantung pada suara lokal yang benar-benar tersedia di perangkat.
4. Browser yang menyediakan tombol pemasangan akan menampilkannya di profil. Ikon PNG 192/512, ikon maskable, dan ikon Apple disertakan; browser lain tetap bisa memakai menu penambahan ke layar utama jika didukung.
5. Pembaruan disimpan sebagai worker yang menunggu. Aplikasi tidak memuat ulang otomatis saat pelajaran berlangsung. Pengguna memilih **perbarui aplikasi** dari banner di luar pelajaran atau dari profil; checkpoint tetap disimpan. Bila penyimpanan progres sedang gagal, tombol pembaruan tidak diaktifkan agar progres sementara bisa dicadangkan dahulu.

Precache dibuat dengan [Vite PWA / Workbox](https://vite-pwa-org.netlify.app/guide/), dan pendaftaran/pembaruan memakai event service worker native. Hosting publik perlu HTTPS; localhost dapat dipakai untuk pengujian. Lihat [siklus worker yang menunggu](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/waiting). Cache hanya mencakup berkas aplikasi, bukan cadangan profil atau layanan pengenalan suara. Menghapus data situs/browser tetap dapat menghapus cache dan progres.

Tes PWA berjalan terhadap build produksi pada port 4173, terpisah dari tes aplikasi pada 5173. Pengujian mematikan koneksi browser lalu memuat ulang halaman, memakai font/maskot, menjawab soal, berpindah latihan tanpa kehilangan checkpoint, dan memulihkan feedback. Ringkasan akhir juga diuji setelah reload offline tanpa menggandakan hadiah. Uji pembaruan menyajikan revisi worker baru dan memastikan reload baru terjadi setelah tindakan pengguna. Artefak masing-masing suite dipisahkan ke `test-results/app/` dan `test-results/pwa/` agar aman dijalankan bersamaan.

Override `workbox-build > glob` memakai versi 14.0.2 atau patch kompatibel berikutnya untuk menghindari versi transitif yang ditandai audit. Build precache dan `npm audit` diverifikasi setelah perubahan ini; evaluasi kembali override saat memperbarui Workbox.

Tes browser memakai Chromium sistem jika `/usr/bin/chromium` tersedia. Di mesin lain jalankan `npx playwright install chromium`, atau isi `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Tes pengenalan suara mencakup jalur tanpa mikrofon serta transkrip dan penolakan izin yang disimulasikan. Kualitas suara, mikrofon nyata, pemasangan pada perangkat fisik, Safari/Firefox, serta peninjauan materi perlu diuji tersendiri.

Di luar MVP: tes penempatan adaptif, mentor, rute Inggris, konten wahdah 4–64, tes nisfi/nihai, backend, sinkronisasi lintas perangkat, dan rekaman audio penutur. Roadmap yang terkunci tidak mengklaim konten tersebut sudah tersedia.
