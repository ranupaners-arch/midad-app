# Midad (مِداد) — Design System

**Midad** artinya *tinta*: alat para ulama menulis ilmu. Midad adalah aplikasi belajar bahasa Arab dengan gaya game. Materinya memakai **kurikulum Midad sendiri yang diselaraskan dengan CEFR**: 4 marhalah (A1–B2) × 16 wahdah = 64 level. Pengguna punya avatar yang bisa dikustomisasi, **berlayar dari negeri asalnya ke dunia Arab** (rute Indonesia: Nusantara → Samudra Hindia → **Oman sebagai gerbang** dunia Arab), dan mengumpulkan kurma serta menyalakan lentera setiap hari.

> Tagline: **تَعَلَّمِ العَرَبِيَّةَ قَطْرَةً قَطْرَةً** — *Belajar bahasa Arab, setetes demi setetes.*

## Prinsip

1. **Arab-first.** Bahasa Arab diajarkan *dengan* bahasa Arab (imersi): seluruh UI dan materi memakai bahasa Arab dengan layout **RTL**. Bahasa ibu hanya muncul sebagai terjemahan yang dibuka pengguna sendiri.
2. **Teks Arab adalah pahlawannya.** Harakat harus terbaca jelas. Terjemahan selalu lebih kecil dan lebih pudar daripada teks Arabnya.
3. **Hangat, bukan kekanak-kanakan.** Kertas krem, tinta teal, dan emas kurma. Ramah untuk santri SMP sampai mahasiswa.
4. **Bisa ditekan.** Tombol dan kartu punya *tepi 3D*: saat ditekan, elemen turun 4px.
5. **Hadiah punya warna sendiri.** Emas = XP, coklat kurma = mata uang, oranye lentera = streak.
6. **Benar/salah tidak pernah hanya warna.** Selalu ada ikon (✓/✕), teks, dan bunyi.

## Bahasa: Arab-first + terjemahan sesuai bahasa ibu

### Alur bahasa
1. **Layar pertama: LanguagePicker.** Pengguna memilih bahasa ibu: **Bahasa Indonesia** atau **English**. Bahasa lain menyusul.
2. **Seluruh UI berbahasa Arab** (`<html lang="ar" dir="rtl">`): tombol, menu, instruksi soal, dan pesan.
3. **TranslateToggle** (tombol تَرْجَمَة) menampilkan terjemahan kecil di bawah setiap teks Arab, dalam bahasa ibu yang dipilih.

### Aturan terjemahan
- Default **mati**. Pengecualian: layar LanguagePicker dan bagian jawaban benar di FeedbackSheet saat jawaban salah.
- Ukuran terjemahan selalu lebih kecil dari teks Arab yang diterjemahkan: `tr-md` (15px) di bawah teks pelajaran/judul, `tr-sm` (13px) di bawah teks UI. Warna `ink-muted`, LTR, rata kanan.
- Dikunci di soal yang menguji arti.
- **Label tombol tidak diterjemahkan.** Jumlahnya sedikit dan berulang terus, jadi pengguna akan hafal sendiri. Glosarium ada di bawah dan di layar bantuan.

### Harakat di UI
- **Level 1–40:** seluruh teks UI dan pelajaran berharakat lengkap.
- **Mulai level 41** (setengah kedua marhalah 3, B1): **mode tanpa tasykil** aktif. Teks tampil tanpa harakat, dan tombol **التَّشْكِيلُ** memunculkan harakat sementara, mirip tombol تَرْجَمَة. Detailnya ada di [guides/rihlah.md](guides/rihlah.md).

### Awal pemakaian
Urutan onboarding: pilih bahasa ibu (LanguagePicker) → buat maskot → **mulai dari nol atau tes tahdid mustawa** (PlacementStart) → peta Rihlah dimulai dari negara bahasa ibu.

### اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ (Lihat, Dengar, dan Ulangi)
Setiap hiwar dan teks bacaan memakai alur ini (komponen ListenRepeat). Sistem membacakan sebagian teks, pengguna mengulanginya, dan kalau ucapannya cocok, lanjut ke bagian berikutnya. Setiap langkah punya **lencana sendiri**: mata teal (انظر), telinga emas (استمع), dan mikrofon kurma dengan panah ulang (أعد). Detailnya ada di grup aset Ikon.

Alur belajar lengkap (6 langkah wahdah, tes, hadiah, hint, mentor) ada di [guides/belajar.md](guides/belajar.md). Data kurikulum ada di `assets/rihlah/curriculum.json`.

### Angka
Angka statistik (XP, kurma, streak) memakai 0–9 dengan gaya `num` supaya cepat terbaca. Angka di dalam teks Arab memakai ٠–٩.

### Glosarium UI (Arab → ID / EN)

| Arab | Indonesia | English | Di mana |
|---|---|---|---|
| تَحَقَّقْ | Periksa | Check | Tombol utama soal |
| مُتَابَعَة | Lanjut | Continue | Setelah benar, onboarding |
| فَهِمْتُ | Mengerti | Got it | Setelah salah |
| تَخَطَّ | Lewati | Skip | Soal dengar/bicara |
| اِبْدَأْ | Mulai | Start | Node peta |
| تَرْجَمَة | Terjemahan | Translation | TranslateToggle |
| اِسْتَمِعْ | Dengarkan | Listen | Tombol audio |
| مُمْتَاز! / أَحْسَنْتَ! | Luar biasa! / Bagus! | Excellent! / Well done! | Sheet benar |
| الإِجَابَةُ الصَّحِيحَةُ | Jawaban yang benar | Correct answer | Sheet salah |
| رِحْلَة | Perjalanan (peta) | Journey (map) | Tab peta |
| مَحَطَّة | Pelabuhan / Unit | Port / Unit | Unit di peta |
| تَمْر | Kurma (mata uang) | Dates (currency) | StatPill |
| فَانُوس | Lentera (streak) | Lantern (streak) | StatPill |
| كَنْز | Harta / Peti | Treasure | Node peti |
| الإِعْدَادَات | Pengaturan | Settings | Menu |

## Warna

Semua warna adalah token semantik dengan tema **Terang** (default) dan **Gelap**.

| Peran | Token | Aturan |
|---|---|---|
| Latar | `surface-000` → `surface-100` → `surface-200` | Halaman → kartu → area cekung. |
| Teks | `ink`, `ink-muted` | `ink-muted` juga untuk terjemahan. `ink-subtle` hanya untuk ikon dan elemen terkunci. |
| Brand | `brand`, `brand-strong`, `brand-soft`, `brand-ink`, `on-brand` | Satu aksi brand per layar. Teks di atas brand pakai `on-brand`, teks di atas `brand-soft` pakai `brand-ink`. |
| Hadiah | `gold*` | XP, level, peti harta. |
| Mata uang | `date`, `date-soft` | Kurma (Tamr) dan toko avatar. |
| Streak | `lantern`, `lantern-soft`, `lantern-ink` | Ikon pakai `lantern`, angka pakai `lantern-ink`. |
| Feedback | `success*`, `danger*` | Teks di latar soft pakai `*-ink`; teks di atas fill pakai `on-success` / `on-danger`. |
| Fokus | `focus` | Cincin fokus 3px, offset 2px. |

Kontras teks sudah dicek ≥ 4.5:1 di kedua tema.

## Tipografi

| Grup | Font | Untuk |
|---|---|---|
| UI Arab | **IBM Plex Sans Arabic** | Semua teks antarmuka: tombol, judul, instruksi, menu |
| Arab Pelajaran | **Noto Naskh Arabic** | Kalimat, kosakata, dan dialog pelajaran |
| Terjemahan | **Nunito** | Terjemahan ID/EN dan angka statistik |

- Teks berharakat minimal `ar-sm` (22px). Line-height sekitar 1.8× supaya harakat tidak bertabrakan.
- Tanpa letter-spacing dan tanpa uppercase di teks Arab.
- Semua font dari Google Fonts:
  `https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@500;700&display=swap`

## Layout RTL

- `dir="rtl"` di root. Pakai properti logis (`inset-inline-start`, `margin-inline`, `padding-inline`) dan jangan pakai left/right.
- Ikon berarah (panah, lanjut/kembali) dicerminkan. Ikon non-arah (✓, bintang, kurma) tidak dicerminkan.
- Progress bar terisi dari kanan. Tombol keluar ada di kanan atas, tombol terjemahan di kiri atas.
- Teks terjemahan (LTR) memakai `dir="ltr"` + `unicode-bidi: isolate` dan rata kanan.

## Ruang, radius, kedalaman

- Grid **4px**. Margin tepi layar HP `space-4`, jarak antar section `space-6`.
- Radius: tombol/pilihan `radius-md`, kartu `radius-lg`, sheet `radius-xl`, pill & node `radius-pill`.
- Kedalaman memakai **tepi 3D** (`edge-*`). Blur (`overlay`) hanya untuk modal/toast.
- Area sentuh ≥ `touch-min` (48px). Kolom konten maksimal `screen-max` (480px).

## Gerak & suara

- Tekan: elemen turun 4px dan tepi 3D hilang, 80ms.
- Sheet feedback naik dari bawah, 200ms ease-out. Terjemahan muncul dengan fade 150ms.
- Benar: pop (1 → 1.05 → 1) + bunyi "ting". Salah: goyang 3× ±4px + bunyi lembut.
- Hormati `prefers-reduced-motion`.

## Referensi: Duolingo sebagai acuan, bukan jiplakan

Yang **diadopsi** (pola UX umum yang sudah terbukti): satu soal per layar, tombol periksa di bawah, sheet feedback, peta jalur bertahap, streak, mata uang dalam app, dan tepi tombol yang bisa ditekan.

Yang **milik Midad sendiri** dan tidak boleh mirip Duolingo:
- Warna: kertas krem + tinta teal + emas kurma. **Bukan** hijau terang di atas putih.
- Font: IBM Plex Sans Arabic, Naskh, dan Nunito. **Bukan** Feather/DIN Rounded.
- Maskot dan ilustrasi buatan sendiri. **Jangan** pakai burung hantu hijau atau karakter mirip itu, dan jangan tulis "Duolingo style" di prompt aset.
- Tema dunia: pelayaran dari negeri sendiri ke dunia Arab (rute ID: Nusantara → Oman sebagai gerbang), lentera, kurma, tinta. **Bukan** pohon/peta ala Duolingo.
- Bunyi efek dibuat atau dilisensikan sendiri.
- Metode: imersi Arab-first, bukan terjemahan-first.

## Ikon & ilustrasi

- Ikon: garis 2px, ujung bulat, grid 24px. Ikon mata uang dan streak (kurma, lentera, bintang) versi **solid**.
- Ilustrasi: flat 2D, bentuk bulat, tanpa gradien. Ornamen geometri Islam hanya sebagai tekstur tipis (≤ 8%).
- **Maskot:** burung **hudhud memegang pena tinta** sebagai default. Avatar pengguna adalah maskot hewan yang bisa dikustomisasi (hudhud, kucing, unta, penyu, oryx), termasuk skin dari Common sampai Legendary. **Maskot buatan pengguna dipakai di mana-mana**: loading, peta, feedback, dan profil. Spesifikasi lengkapnya ada di [guides/maskot.md](guides/maskot.md).
- Aset awal (maskot, bagian kustomisasi, item, peta, ikon hadiah, ilustrasi kosakata) dibuat dengan **Gemini (Nano Banana)** sebagai referensi, lalu digambar ulang jadi SVG dan diunggah ke grup Assets.

## Komponen

| Komponen | Kegunaan |
|---|---|
| LanguagePicker | Layar pertama: pilih bahasa ibu (ID/EN) |
| TranslateToggle | Tombol تَرْجَمَة + teks terjemahan kecil |
| Button | Aksi dengan tepi 3D, label Arab |
| AnswerOption | Pilihan jawaban (default, terpilih, benar, salah) |
| WordTile | Tile kata Arab untuk susun kalimat |
| ProgressBar | Kemajuan pelajaran (isi dari kanan) |
| StatPill | Lentera, kurma, XP |
| LessonNode | Node di peta Rihlah |
| FeedbackSheet | Sheet benar/salah setelah تَحَقَّقْ |
| ListenRepeat | Alur اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ untuk hiwar & teks |
| PlacementStart | Onboarding: mulai dari nol atau tes tahdid mustawa |
| MascotLoader | Animasi loading & hijrah dengan maskot milik pengguna |
| MascotMoments | Ekspresi maskot di berbagai tempat |
| SkinCard | Skin maskot: Common → Legendary |
| Vehicles | Kendaraan hijrah per wilayah |
| RihlahRoadmap | Roadmap rute ID & EN (8 etape) |
| LevelUpTravel | Animasi naik level: maskot berlayar ke pelabuhan berikutnya |
| TestProgress | Cincin % menuju ujian wahdah/nisfi/nihai + mufradat |
| RewardSheet | Hadiah setelah lulus ujian |
| HintPrompt | Maskot berpikir + hint terbatas (قَطَرَات) |
| AskMentor | Halaman tanya mentor (**post-MVP**, tidak masuk demo lomba) |

Class CSS berawalan `md-` dan ada di `components/components.css`. Semua komponen hanya membaca variabel token, jadi tema gelap otomatis ikut.

### Memakai di aplikasi

```html
<html lang="ar" dir="rtl">  <!-- tambah data-theme="dark" / "light" untuk memaksa tema; tanpa atribut = ikut sistem -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@500;700&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/components.css">
```

- `tokens.css` **dibuat** dari `tokens.json` (`npm run build:css`). Ubah nilainya di `tokens.json`, jangan di CSS.
- `bundle.css` hanya untuk design system interaktif lama (font + gaya preview + komponen).
- Galeri komponen lokal: `npm run preview:ds`.

## Aksesibilitas

- Kontras teks ≥ 4.5:1 (≥ 3:1 untuk teks ≥ 24px, ikon, dan pinggir kontrol) di kedua tema.
- `lang="ar"` di root dan `lang="id"`/`lang="en"` di setiap terjemahan, supaya pembaca layar memakai suara yang tepat.
- Fokus keyboard selalu terlihat.
- Setiap teks Arab pelajaran punya audio.
