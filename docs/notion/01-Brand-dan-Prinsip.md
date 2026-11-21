# 01 · Brand & Prinsip

**Midad** artinya *tinta*: alat para ulama menulis ilmu. Midad adalah aplikasi belajar bahasa Arab dengan gaya game. Materinya mengikuti kitab *Al-'Arabiyyah Baina Yadaik*, dan rak kitab lain bisa ditambah nanti.

## Prinsip

1. **Arab-first.** Seperti Baina Yadaik yang mengajar bahasa Arab *dengan* bahasa Arab, seluruh UI dan materi memakai bahasa Arab dengan layout **RTL**. Bahasa ibu hanya muncul sebagai terjemahan yang dibuka pengguna sendiri.
2. **Teks Arab adalah pahlawannya.** Harakat harus terbaca jelas. Terjemahan selalu lebih kecil dan lebih pudar daripada teks Arabnya.
3. **Hangat, bukan kekanak-kanakan.** Kertas krem, tinta teal, dan emas kurma. Ramah untuk santri SMP sampai mahasiswa.
4. **Bisa ditekan.** Tombol dan kartu punya *tepi 3D*: saat ditekan, elemen turun 4px.
5. **Hadiah punya warna sendiri.** Emas = XP, coklat kurma = mata uang, oranye lentera = streak.
6. **Benar/salah tidak pernah hanya warna.** Selalu ada ikon (✓/✕), teks, dan bunyi.

## Bahasa: Arab-first + terjemahan

### Alur bahasa

1. **Layar pertama: LanguagePicker.** Pengguna memilih bahasa ibu: **Bahasa Indonesia** atau **English**. Bahasa lain menyusul.
2. **Seluruh UI berbahasa Arab** (`<html lang="ar" dir="rtl">`): tombol, menu, instruksi soal, dan pesan.
3. **TranslateToggle** (tombol تَرْجَمَة) menampilkan terjemahan kecil di bawah setiap teks Arab, dalam bahasa ibu yang dipilih.

### Aturan terjemahan

- Default **mati**. Pengecualian: layar LanguagePicker dan bagian jawaban benar di FeedbackSheet saat jawaban salah.
- Ukuran terjemahan selalu lebih kecil dari teks Arabnya: 15px di bawah teks pelajaran/judul, 13px di bawah teks UI. Warna `ink-muted`, LTR, rata kanan.
- Dikunci di soal yang menguji arti.
- **Label tombol tidak diterjemahkan.** Jumlahnya sedikit dan berulang terus, jadi pengguna akan hafal sendiri. Lihat glosarium di bawah.

### Harakat

- **Level 1–40:** seluruh teks UI dan pelajaran berharakat lengkap.
- **Mulai level 41** (pertengahan Kitab 3): **mode tanpa tasykil**. Tombol **التَّشْكِيلُ** memunculkan harakat sementara.

### Angka

Angka statistik (XP, kurma, streak) memakai 0–9 supaya cepat terbaca. Angka di dalam teks Arab memakai ٠–٩.

### Glosarium UI (Arab → ID / EN)

| Arab | Indonesia | English | Di mana |
| --- | --- | --- | --- |
| تَحَقَّقْ | Periksa | Check | Tombol utama soal |
| مُتَابَعَة | Lanjut | Continue | Setelah benar, onboarding |
| فَهِمْتُ | Mengerti | Got it | Setelah salah |
| تَخَطَّ | Lewati | Skip | Soal dengar/bicara |
| اِبْدَأْ | Mulai | Start | Node peta |
| تَرْجَمَة | Terjemahan | Translation | TranslateToggle |
| اسْتَمِعْ | Dengarkan | Listen | Tombol audio |
| مُمْتَاز! / أَحْسَنْتَ! | Luar biasa! / Bagus! | Excellent! / Well done! | Sheet benar |
| الإِجَابَةُ الصَّحِيحَةُ | Jawaban yang benar | Correct answer | Sheet salah |
| رِحْلَة | Perjalanan (peta) | Journey (map) | Tab peta |
| مَحَطَّة | Pelabuhan / Level | Port / Level | Peta |
| تَمْر | Kurma (mata uang) | Dates (currency) | StatPill |
| فَانُوس | Lentera (streak) | Lantern (streak) | StatPill |
| كَنْز | Harta / Peti | Treasure | Node peti |
| الكِسْوَة | Skin | Skin | Kustomisasi maskot |
| قَطَرَات | Tetes (jatah hint) | Drops (hints) | HintPrompt |
| الإِعْدَادَات | Pengaturan | Settings | Menu |

## Layout RTL

- `dir="rtl"` di root. Pakai properti logis (`inset-inline-start`, `margin-inline`, `padding-inline`), jangan left/right.
- Ikon berarah (panah) dicerminkan. Ikon non-arah (✓, bintang, kurma) tidak.
- Progress bar terisi dari kanan. Tombol keluar di kanan atas, tombol terjemahan di kiri atas.
- Teks terjemahan (LTR) memakai `dir="ltr"` + `unicode-bidi: isolate` dan rata kanan.

## Gerak & suara

- Tekan: elemen turun 4px dan tepi 3D hilang, 80ms.
- Sheet feedback naik dari bawah, 200ms ease-out. Terjemahan muncul dengan fade 150ms.
- Benar: pop (1 → 1.05 → 1) + bunyi "ting". Salah: goyang 3× ±4px + bunyi lembut.
- Hormati `prefers-reduced-motion`.

## Referensi: Duolingo sebagai acuan, bukan jiplakan

Yang **diadopsi** (pola UX umum yang sudah terbukti): satu soal per layar, tombol periksa di bawah, sheet feedback, peta jalur bertahap, streak, mata uang dalam app, dan tombol yang bisa ditekan.

Yang **milik Midad sendiri** dan tidak boleh mirip Duolingo:

- Warna: kertas krem + tinta teal + emas kurma. **Bukan** hijau terang di atas putih.
- Font: IBM Plex Sans Arabic, Noto Naskh Arabic, dan Nunito. **Bukan** Feather/DIN Rounded.
- Maskot dan ilustrasi buatan sendiri. **Jangan** pakai burung hantu hijau atau karakter mirip itu, dan jangan tulis "Duolingo style" di prompt aset.
- Tema dunia: pelayaran dari negara bahasa ibu ke dunia Arab, lentera, kurma, tinta.
- Bunyi efek dibuat atau dilisensikan sendiri.
- Metode: imersi Arab-first mengikuti Baina Yadaik.

## Ikon & ilustrasi

- Ikon: garis 2px, ujung bulat, grid 24px. Ikon kurma, lentera, dan bintang versi **solid**.
- Ilustrasi: flat 2D, bentuk bulat, tanpa gradien. Ornamen geometri Islam hanya sebagai tekstur tipis (≤ 8%).

## Aksesibilitas

- Kontras teks ≥ 4.5:1 (≥ 3:1 untuk teks ≥ 24px, ikon, dan pinggir kontrol) di kedua tema. Sudah dicek.
- `lang="ar"` di root dan `lang="id"`/`lang="en"` di setiap terjemahan, supaya pembaca layar memakai suara yang tepat.
- Fokus keyboard selalu terlihat (cincin `focus` 3px).
- Setiap teks Arab pelajaran punya audio.
