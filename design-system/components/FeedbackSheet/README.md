# FeedbackSheet

Sheet yang naik dari bawah setelah pengguna menekan تَحَقَّقْ. Tugasnya memberi tahu benar atau salah, lalu mengarahkan ke soal berikutnya.

- `--correct`: pujian singkat berbahasa Arab yang bervariasi, misalnya مُمْتَاز!، أَحْسَنْتَ!، أَحْسَنْتِ! (sesuaikan gender pengguna kalau sudah diketahui), atau رَائِع!. Tombolnya مُتَابَعَة (`md-btn--success`).
- `--wrong`: judul الإِجَابَةُ الصَّحِيحَةُ: lalu jawaban yang benar dalam teks Arab. Di sini **terjemahan langsung tampil** (tombol terjemahan aktif secara default) supaya pengguna paham kesalahannya. Tombolnya فَهِمْتُ (`md-btn--danger`).
- `role="status"` untuk benar dan `role="alert"` untuk salah.
