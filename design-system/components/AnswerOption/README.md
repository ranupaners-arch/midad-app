# AnswerOption

Satu pilihan jawaban dalam soal pilihan ganda. Isinya teks Arab (`.md-option__ar`) atau gambar.

- State: default, `is-selected` (sudah diketuk tapi belum diperiksa), `is-correct`, dan `is-wrong` (setelah تَحَقَّقْ).
- Kotak kunci menampilkan angka 1–4 untuk shortcut keyboard, ada di sisi kanan karena layout RTL. Setelah diperiksa, angkanya diganti ikon ✓ atau ✕.
- Pilihan bertumpuk vertikal dengan jarak `space-3`. Untuk pilihan bergambar, pakai grid 2×2.
- Kalau terjemahan aktif (lihat TranslateToggle), terjemahan muncul di bawah teks Arab di dalam pilihan sebagai `.md-tr--sm`. Ini **dimatikan** di soal yang tujuannya menguji arti kata.
- Gunakan `aria-pressed` untuk state terpilih.
