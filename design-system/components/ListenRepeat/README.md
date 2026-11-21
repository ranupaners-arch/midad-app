# ListenRepeat

Alur **اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ** (Lihat, Dengar, dan Ulangi) untuk mufradat, hiwar, dan teks bacaan, supaya pengguna terbiasa dengan pengucapan yang benar sejak awal.

**Ikon khas: tiga lencana terpisah, satu per langkah** (`assets/ikon/`):
- `look-badge.svg` (اُنْظُرْ): teal, mata
- `listen-badge.svg` (اسْتَمِعْ): emas, telinga + gelombang suara
- `repeat-badge.svg` (أَعِدْ): kurma, mikrofon + panah ulang

Ketiganya tampil berurutan di header, di chip langkah, dan sebagai lencana pelajaran di peta. Versi garis 24px: `look.svg`, `listen.svg`, `repeat.svg`.

**Alur per bagian (segmen):**
1. **اُنْظُرْ (lihat):** segmen aktif disorot, segmen lain diredupkan. Teks tampil berharakat (atau tanpa harakat mulai level 41).
2. **اسْتَمِعْ (dengar):** sistem membacakan segmen dengan audio penutur asli. Kata yang sedang dibaca disorot emas (`.md-w.is-reading`). Tersedia tombol 🐢 kecepatan 0.75×.
3. **أَعِدْ (ulangi):** tombol mikrofon berdenyut dan maskot memasang ekspresi `think`. Pengguna mengucapkan segmen itu.
4. **Hasil:**
   - **Benar** → bubble hijau ✓, bunyi "ting", lalu otomatis lanjut ke segmen berikutnya.
   - **Kurang tepat** → bubble koral dan kata yang meleset diberi garis bergelombang (`.md-w.is-miss`). Audio kata itu diputar pelan, lalu pengguna mencoba lagi.
   - Setelah **3 percobaan**, muncul tombol تَخَطَّ (lewati) dan segmen ditandai untuk diulang nanti.

**Panjang segmen:** satu baris hiwar. Kalimat panjang (> 6 kata) dipecah per frasa, sesuai prinsip "dibacakan sebagian dulu".

**Pengecekan ucapan (spesifikasi teknis):**
- Pengenalan suara `ar-SA`: Web Speech API kalau tersedia, selain itu server ASR (misalnya model Whisper).
- **Dukungan browser (Web Speech API):** Chrome dan Edge (desktop & Android) mendukung `ar-SA` lewat server Google, jadi butuh internet. Safari hanya sebagian. **Firefox tidak mendukung.** Deteksi dukungan saat mulai; kalau tidak ada, soal bicara otomatis diganti soal dengar (sama seperti tombol tanpa mikrofon), dan tampilkan saran memakai Chrome. Demo lomba direkam di Chrome.
- Normalisasi kedua teks sebelum dibandingkan: hapus harakat dan tatweel, samakan أ إ آ → ا, ى → ي, ة → ه, lalu buang tanda baca.
- Pencocokan per kata (jarak Levenshtein). **Lulus kalau ≥ 80% kata cocok** dan tidak ada kata kunci yang hilang.
- Catatan jujur: ASR hanya mengecek *kata yang diucapkan*, bukan kualitas makhraj secara mendalam. Penilaian pelafalan yang lebih detail bisa ditambah nanti dengan layanan *pronunciation assessment*.

**Tanpa mikrofon:** tombol "لَا أَسْتَطِيعُ التَّحَدُّثَ الآنَ" (tidak bisa bicara sekarang) mematikan soal bicara selama 15 menit. Diganti soal dengar.

**Aksesibilitas:** mic memakai `aria-label`, hasil diumumkan via `role="status"`, dan audio bisa diulang tanpa batas.
