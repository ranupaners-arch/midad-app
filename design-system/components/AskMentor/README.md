# AskMentor

> **Post-MVP.** Tidak masuk demo lomba (5 Des 2026); cukup disebut di rencana pengembangan.

Halaman **اسْأَلِ المُعَلِّمَ** (tanya mentor). Pengguna mengirim pertanyaan ke mentor manusia (ustadz/pengajar bahasa Arab terverifikasi) dan mendapat jawaban di dalam aplikasi.

**Bagian halaman:**
1. **Header** dengan ikon `mentor.svg` dan sisa kuota pertanyaan minggu ini.
2. **Ketersediaan mentor:** avatar inisial (titik hijau = sedang aktif) dan perkiraan waktu balas.
3. **Form pertanyaan:**
   - **Konteks otomatis** (📍 wahdah/hiwar/soal yang sedang dibuka) supaya mentor langsung paham.
   - Teks bebas **dalam bahasa apa pun** (Arab, Indonesia, Inggris).
   - Kategori: النُّطْقُ (pengucapan), المُفْرَدَاتُ (kosakata), القَوَاعِدُ (tata bahasa), أُخْرَى (lainnya).
   - Lampiran **rekaman suara** (untuk dikoreksi pengucapannya) dan **gambar**.
4. **Pertanyaan serupa** yang sudah pernah dijawab muncul sebelum pengguna mengirim, untuk mengurangi pertanyaan berulang.
5. **أَسْئِلَتِي** (pertanyaanku): status تَمَّ الرَّدُّ (sudah dijawab) / قَيْدَ الانْتِظَارِ (menunggu). Jawaban mentor ditulis dalam bahasa Arab + terjemahan, dan boleh disertai **pesan suara**.

**Akses:** dari menu profil, dari tombol di FeedbackSheet ("لَمْ أَفْهَمْ" / belum paham), dan dari HintPrompt saat tetes hint habis.

**Batas & keamanan:**
- Kuota awal 3 pertanyaan per minggu (bisa diatur sesuai kapasitas mentor).
- Mentor terverifikasi, percakapan hanya berlangsung di dalam aplikasi, dan nomor HP atau tautan luar disaring otomatis.
- Setiap jawaban bisa dilaporkan. Untuk pengguna di bawah umur, semua percakapan tercatat dan dipantau admin.
- Jawaban mentor yang bagus (dengan izin) masuk ke bank "أَسْئِلَةٌ مُشَابِهَةٌ".
