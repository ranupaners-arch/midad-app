# 02 · Warna, Tipografi & Token

Semua nilai berasal dari `tokens.json` di design system. Komponen hanya membaca variabel CSS (`var(--brand)` dan seterusnya), jadi tema gelap otomatis ikut.

## Warna (tema Terang / Gelap)

| Token | Terang | Gelap | Pemakaian |
| --- | --- | --- | --- |
| `surface-000` | `#fbf6ec` | `#101817` | Latar halaman (krem kertas) |
| `surface-100` | `#ffffff` | `#18231f` | Kartu, sheet, pilihan jawaban |
| `surface-200` | `#f2eadb` | `#22302c` | Area cekung: track progress, slot kosong, node terkunci |
| `line` | `#e6dcc8` | `#33443f` | Garis pinggir kartu, pembatas |
| `line-strong` | `#cdbfa5` | `#4b5f59` | Tepi 3D kartu, pinggir kontrol saat hover |
| `ink` | `#2a211a` | `#f4eee4` | Teks utama & teks Arab pelajaran |
| `ink-muted` | `#6b5d4f` | `#b5ab9b` | Teks sekunder, caption, terjemahan |
| `ink-subtle` | `#9c8d7b` | `#7d8a84` | HANYA ikon non-esensial & elemen terkunci (≈3:1) |
| `brand` | `#0f766e` | `#2fb8a6` | Tinta teal Midad: tombol utama, node aktif, progress |
| `brand-strong` | `#0b5a54` | `#1f8f81` | Tepi 3D tombol brand, state pressed |
| `brand-soft` | `#d6efeb` | `#133c37` | Latar pilihan terpilih, chip info |
| `brand-ink` | `#0b5a54` | `#7fe0d2` | Teks brand di atas brand-soft |
| `on-brand` | `#ffffff` | `#04201d` | Teks di atas brand |
| `gold` | `#e9b949` | `#f0c55e` | Hadiah: XP, naik level, peti harta |
| `gold-strong` | `#b5871a` | `#c99a2e` | Tepi 3D tombol emas, outline bintang |
| `gold-soft` | `#fbefcc` | `#3a2f12` | Latar banner hadiah |
| `on-gold` | `#3a2a06` | `#2a1e03` | Teks di atas gold |
| `date` | `#7c4a2d` | `#d29a70` | Kurma (Tamr), mata uang dalam app |
| `date-soft` | `#f3e3d6` | `#3a271b` | Latar pill kurma, kartu item toko |
| `lantern` | `#ef8f24` | `#f6a548` | Fanus (streak): ikon lentera saja |
| `lantern-soft` | `#fde8cf` | `#3d2810` | Latar pill streak |
| `lantern-ink` | `#9a4d0a` | `#f6a548` | Angka streak |
| `success` | `#1f7f46` | `#4cc27b` | Jawaban benar (selalu dengan ikon ✓) |
| `success-strong` | `#155c32` | `#2f9a5a` | Tepi 3D tombol sukses |
| `success-soft` | `#dcf3e4` | `#14321f` | Latar sheet & pilihan benar |
| `success-ink` | `#17603a` | `#a6e8be` | Teks di success-soft |
| `on-success` | `#ffffff` | `#04200f` | Teks di atas success |
| `danger` | `#c44530` | `#f07a63` | Jawaban salah, koral bukan merah keras (selalu dengan ikon ✕) |
| `danger-strong` | `#8f2f1c` | `#c4553f` | Tepi 3D tombol bahaya |
| `danger-soft` | `#fde3dc` | `#3d1d16` | Latar sheet & pilihan salah |
| `danger-ink` | `#962e18` | `#ffb5a6` | Teks di danger-soft |
| `on-danger` | `#ffffff` | `#2a0b05` | Teks di atas danger |
| `focus` | `#1d4ed8` | `#8ab4ff` | Cincin fokus keyboard (satu-satunya biru) |
| `scrim` | `rgba(42,33,26,0.45)` | `rgba(0,0,0,0.6)` | Latar belakang modal |

Warna tingkat skin: Common `#9c8d7b` · Rare `#3b82c4` · Epic `#7c4dbd` · Legendary `#e9b949` (selalu disertai label tingkatnya).

## Tipografi

| Grup | Font | Untuk |
| --- | --- | --- |
| UI Arab | **IBM Plex Sans Arabic** | Semua teks antarmuka |
| Arab Pelajaran | **Noto Naskh Arabic** | Kalimat, kosakata, dan dialog dari kitab |
| Terjemahan | **Nunito** | Terjemahan ID/EN dan angka statistik |

| Gaya | Ukuran / tinggi baris · tebal | Contoh | Pemakaian |
| --- | --- | --- | --- |
| `display` | 40/60 · 700 | أَحْسَنْتَ! | Layar selebrasi |
| `title-lg` | 28/44 · 700 | مِيناءُ آتشيه | Judul layar, nama pelabuhan |
| `title-md` | 22/36 · 700 | اخْتَرِ الإجابةَ الصحيحةَ | Instruksi soal, judul sheet |
| `body-lg` | 18/30 · 500 | اضْغَطْ على الكلماتِ بالترتيبِ | Teks utama UI |
| `body` | 16/28 · 500 | تعلَّمْتَ خمسةَ أيامٍ متتاليةٍ | Teks umum |
| `label` | 17/24 · 700 | تَحَقَّقْ | Label tombol |
| `caption` | 14/22 · 600 | الوحدة ١ · الدرس ٣ | Meta info, minimum teks Arab UI |
| `ar-hero` | 56/96 · 700 | كِتَابٌ | Satu kata di kartu kosakata |
| `ar-lg` | 32/60 · 500 | السَّلَامُ عَلَيْكُمْ | Kalimat soal, dialog |
| `ar-md` | 26/48 · 500 | هٰذَا بَيْتٌ كَبِيْرٌ | Pilihan jawaban, tile |
| `ar-sm` | 22/40 · 500 | أَنَا طَالِبٌ | **Minimum** teks Arab berharakat |
| `tr-md` | 15/22 · 600 | Ini rumah yang besar. | Terjemahan di bawah teks pelajaran |
| `tr-sm` | 13/18 · 600 | Pilih jawaban yang benar | Terjemahan di bawah teks UI |
| `num` | 15/20 · 800 | 1240 | Angka statistik |

- Tanpa letter-spacing dan tanpa uppercase di teks Arab. Line-height teks berharakat sekitar 1.8×.
- Google Fonts: `https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@500;700&display=swap`

## Ruang, radius, kedalaman, ukuran

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `space-1 … space-16` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px | Grid 4px. Tepi layar HP `space-4`, antar section `space-6` |
| `radius-sm` | 8px | Chip, badge |
| `radius-md` | 14px | Tombol, tile, pilihan jawaban |
| `radius-lg` | 20px | Kartu |
| `radius-xl` | 28px | Sheet, modal |
| `radius-pill` | 999px | Pill, progress, node peta |
| `edge-card` | `0 3px 0 0 line` | Kartu, pilihan, tile |
| `edge-brand` / `edge-gold` / `edge-success` / `edge-danger` | `0 4px 0 0 *-strong` | Tepi 3D tombol |
| `overlay` | `0 12px 32px` (blur) | Hanya modal, popover, toast |
| `touch-min` | 48px | Area sentuh minimum |
| `button-h` | 52px | Tinggi tombol |
| `node-size` | 72px | Node pelajaran di peta |
| `screen-max` | 480px | Lebar kolom konten (HP-first) |
