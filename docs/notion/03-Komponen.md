# 03 · Komponen

Preview hidup setiap komponen (tema terang/gelap) ada di [design system interaktif](https://claude.ai/artifact/FPWKJoUq5H1KbTjpnVx6wp). Class CSS berawalan `md-` dan ada di `components/components.css`, yang membaca variabel dari `tokens.css` (dibuat dari `tokens.json`).

## Dasar & soal

| Komponen | Kegunaan | Aturan kunci |
| --- | --- | --- |
| **LanguagePicker** | Layar pertama: pilih bahasa ibu (ID/EN) | Satu-satunya layar dengan terjemahan selalu tampil. Tanpa bendera |
| **PlacementStart** | Mulai dari nol atau tes tahdid mustawa | Hasil tes menempatkan pengguna di awal salah satu marhalah (level 1, 17, 33, 49) |
| **TranslateToggle** | Tombol تَرْجَمَة + teks terjemahan | Default mati. Terjemahan selalu lebih kecil dari teks Arab. Dikunci di soal arti |
| **Button** | Aksi dengan tepi 3D | Satu tombol utama per layar. Label Arab, kata kerja perintah |
| **AnswerOption** | Pilihan jawaban | State: default, terpilih, benar, salah. Shortcut 1–4 |
| **WordTile** | Tile susun kalimat | Urutan RTL. Tile terpakai jadi slot kosong |
| **ProgressBar** | Kemajuan pelajaran | Terisi dari kanan |
| **StatPill** | Lentera, kurma, XP | Urutan tetap. `aria-label` lengkap |
| **FeedbackSheet** | Benar/salah setelah تَحَقَّقْ | Salah tidak menyalahkan. Terjemahan jawaban benar langsung tampil |
| **ListenRepeat** | Alur اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ | Dibacakan per bagian, pengguna mengulangi, lanjut kalau ≥ 80% kata cocok |
| **HintPrompt** | Maskot berpikir + hint terbatas | Hanya kalau setuju. Bukan jawaban penuh. 3 قَطَرَات/hari |

## Peta & perjalanan

| Komponen | Kegunaan | Aturan kunci |
| --- | --- | --- |
| **LessonNode** | Node pelajaran di peta | State: sekarang, selesai, peti, terkunci |
| **RihlahRoadmap** | Roadmap rute ID & EN | 8 etape, penanda tiba di dunia Arab, ujian, dan tanpa tasykil |
| **LevelUpTravel** | Animasi naik level | Maskot di atas kendaraan meluncur ke pelabuhan berikutnya |
| **Vehicles** | Kendaraan hijrah | 10 kendaraan, maskot pengguna ikut naik |

## Ujian & hadiah

| Komponen | Kegunaan | Aturan kunci |
| --- | --- | --- |
| **TestProgress** | Cincin % menuju ujian + mufradat wahdah | Teal = wahdah, emas = nisfi, kurma = nihai |
| **RewardSheet** | Hadiah setelah lulus | Maskot `cheer` memakai skin yang baru didapat |

## Maskot

| Komponen | Kegunaan | Aturan kunci |
| --- | --- | --- |
| **MascotLoader** | Loading & hijrah | Maskot milik pengguna + tips belajar bergantian |
| **MascotMoments** | Ekspresi maskot | cheer, sad, think, surprised, sleep |
| **SkinCard** | Skin Common → Legendary | Warna tingkat selalu disertai label |

## Bantuan

| Komponen | Kegunaan | Aturan kunci |
| --- | --- | --- |
| **AskMentor** | Halaman tanya mentor (**post-MVP**) | Konteks otomatis, lampiran suara/gambar, kuota 3/minggu |
