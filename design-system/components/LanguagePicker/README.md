# LanguagePicker

Layar pertama aplikasi: pengguna memilih **bahasa ibu**. Semua terjemahan (TranslateToggle) akan mengikuti pilihan ini.

- Pertanyaan ditulis dalam bahasa Arab, dengan terjemahan **ke semua bahasa yang tersedia** yang selalu tampil. Ini satu-satunya layar dengan terjemahan selalu terbuka, karena bahasa pengguna belum diketahui.
- Pilihan saat ini: **Bahasa Indonesia (ID)** dan **English (EN)**. Baris "لُغَاتٌ أُخْرَى قَرِيبًا" (bahasa lain segera) menandakan akan ada bahasa lain, misalnya Melayu, Turki, atau Urdu.
- Setiap pilihan menampilkan nama bahasa dalam bahasanya sendiri ditambah nama Arabnya. Ini sekaligus jadi kosakata pertama pengguna.
- **Tanpa bendera**, karena bahasa ≠ negara.
- Pilihan bisa diubah kapan saja di الإِعْدَادَات (pengaturan).
- Pola aksesibilitas: `role="radiogroup"` dengan `role="radio"` dan `aria-checked` di tiap pilihan.
