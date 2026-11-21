# TranslateToggle

Tombol untuk menampilkan atau menyembunyikan terjemahan teks Arab ke **bahasa ibu** pengguna (Indonesia atau Inggris, dipilih di LanguagePicker).

- **Default mati.** Imersi bahasa Arab adalah metode Baina Yadaik, jadi terjemahan hanya bantuan.
- Letaknya di header layar soal, kiri atas (sisi akhir dalam RTL). Versi ikon saja (`--icon`) dipakai di tempat sempit seperti FeedbackSheet dan kartu kosakata.
- Kalau aktif, setiap teks Arab di layar mendapat terjemahan `.md-tr` tepat di bawahnya: instruksi, kalimat soal, dan dialog.
- **Ukuran terjemahan selalu lebih kecil dari teks Arabnya:**
  - Di bawah `ar-lg`, `ar-md`, `title-*` → `tr-md` (15px)
  - Di bawah `body`, `caption`, atau di dalam pilihan jawaban → `tr-sm` (13px)
  - Warna `ink-muted`, arah LTR, rata kanan supaya sejajar dengan teks Arab di atasnya.
- **Dikunci** (tombol `disabled`) di soal yang menguji arti, misalnya "pilih terjemahan yang benar" pada bagian pilihan jawaban. Instruksinya tetap boleh diterjemahkan.
- Status disimpan per pelajaran. Setiap kali terjemahan dibuka, sistem mencatat "bantuan terpakai" untuk analitik kemajuan (tanpa penalti XP).
- Atribut wajib: `aria-pressed` di tombol, `lang="id"` atau `lang="en"` di teks terjemahan.
