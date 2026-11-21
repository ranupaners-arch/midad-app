# 04 · Maskot & Kustomisasi

Avatar pengguna adalah **maskot hewan kartun** yang bisa dikustomisasi. **Hudhud yang memegang pena tinta** adalah maskot default sekaligus wajah brand Midad.

> 👉 Coba langsung di [prototipe kustomisasi](https://claude.ai/artifact/2d2of7p6z2v9kaT3KGvNdw).

## Daftar hewan (الحَيَوَانَات)

| Hewan | Arab | Alasan tema | Cara membuka |
| --- | --- | --- | --- |
| **Hudhud** (default) | هُدْهُد | Pembawa kabar di kisah Nabi Sulaiman (QS. An-Naml) | Terbuka sejak awal |
| Kucing | قِطّ | Hewan kesayangan, Abu Hurairah | 200 kurma |
| Unta | جَمَل | Ikon Jazirah Arab | Selesai Mahattah 2 |
| Penyu hijau | سُلَحْفَاة | Penyu Ras al-Jinz Oman, tema pelayaran | Streak 7 hari |
| Oryx Arab | المَهَا | Hewan khas Oman | Saat tiba di Oman (rute ID: level 17, gerbang dunia Arab) |

**Satu postur untuk semua hewan:** badan bulat telur ala chibi, menghadap depan, kaki pendek, tangan/sayap kanan terangkat memegang item, dan yang kiri di samping. Yang berbeda hanya ciri khasnya: jambul, telinga, tanduk, punuk, tempurung, ekor, dan corak.

Menu kustomisasi sekaligus jadi pelajaran: setiap slot dan item ditampilkan dengan nama Arabnya (عَيْنٌ، أَنْفٌ، مِنْقَارٌ، قَلَمٌ…) dan tombol audio.

## Slot kustomisasi

| Slot | Arab | Pilihan |
| --- | --- | --- |
| Skin | الكِسْوَةُ | 9 skin, 4 tingkat (lihat bawah) |
| Warna | اللَّوْنُ | Hudhud 6 (oranye, toska, merah muda, biru langit, ungu, mint). Hewan lain masing-masing 4 |
| Gaya | النَّمَطُ | Hudhud 6 jambul (kipas, runcing, keriting, pendek, terurai, berbunga). Kucing 4 corak, unta 4 rambut, oryx 4 tanduk, penyu 4 tempurung |
| Mata | العُيُونُ | 8, dipakai bersama semua hewan |
| Hidung | الأَنْفُ | 6 (segitiga, kancing, lubang hidung unta, hati, oval, dua titik). **Hudhud tanpa hidung** |
| Mulut / paruh | الفَمُ / المِنْقَارُ | Hudhud 4 paruh. Hewan lain 8 mulut |
| Item tangan | فِي اليَدِ | Pena qalam (default), botol tinta, buku, fanus, kurma, kapal dhow, teropong, peta |
| Item kepala | عَلَى الرَّأْسِ | Kumma Oman, mussar Oman, peci |
| Item leher | حَوْلَ العُنُقِ | Syal batik |

Item berbayar memakai kurma. Satu item boleh dipakai di setiap posisi sekaligus, misalnya peci + syal + pena.

## Skin (الكِسْوَةُ)

Skin dipotong mengikuti bentuk badan bersama, jadi **satu skin pas di kelima hewan**.

| Tingkat | Arab | Skin | Cara dapat |
| --- | --- | --- | --- |
| Common | عَادِيّ | Baju pelaut, rompi, batik | Beli dengan kurma (100–150) |
| Rare | نَادِر | Dishdasha, baju koko | Tiba di Oman / 400 kurma / lulus tes setengah marhalah |
| Epic | مَلْحَمِيّ | Seragam nakhoda, jubah ulama | Lulus tes marhalah / streak 30 hari |
| Legendary | أُسْطُورِيّ | Bisht emas, tinta malam (berkilau) | Tamat 4 marhalah / event 18 Desember |

## Maskot pengguna dipakai di mana-mana

Konfigurasi yang disimpan pengguna dipakai di semua tempat yang butuh maskot. Tiap tempat hanya menambah **ekspresi**:

| Tempat | Ekspresi |
| --- | --- |
| Loading, transisi | default + animasi menulis, tips belajar |
| Peta Rihlah, naik level, hijrah | naik kendaraan wilayah |
| Onboarding, jawaban benar, naik level | `cheer` |
| Jawaban salah, streak padam, hint habis | `sad` |
| Awal pelajaran, giliran bicara, hint | `think` |
| Peti harta, hadiah | `surprised` |
| Pengingat malam | `sleep` |
| Profil, papan peringkat | default lengkap dengan skin |

## Spesifikasi teknis

Semua digambar oleh `assets/maskot/mascot.js` (aplikasi: `mascot.mjs`) (lihat **07 · Aset & Kode**).

- **Kanvas:** SVG `viewBox="0 0 512 512"`, garis tanah y = 480.
- **Badan bersama:** telur di x 124–388, y 166–440.
- **Anchor (sama untuk semua hewan):** mata y 236 (x 216 & 296) · hidung y 272 · mulut y 294 · atas kepala y 176 · tangan (392, 262) · leher y 330.
- **Urutan layer:** bayangan → ekor & ciri belakang → kaki → tangan belakang → badan → perut/corak/moncong → skin → garis badan → item leher → mata → hidung → mulut/paruh → item kepala → tangan depan → item tangan.
- **Warna lewat variabel CSS** di elemen `<svg>`: `--mb` (badan), `--mbd` (badan gelap), `--mbl` (perut/terang), `--ma` (aksen). Garis selalu `#2a211a`.
- **Hook animasi:** `.mm-all`, `.mm-front`, `.mm-eyes`, `.mm-spark`, `.vh-boat`, `.vh-waves`.

**Data maskot pengguna:**

```json
{ "animal": "hudhud", "color": "orange", "style": "fan", "eyes": "round", "nose": null, "mouth": "long", "hand": "qalam", "head": "none", "neck": "none", "skin": "none" }
```

Tempat lain cukup menambah `emote`, misalnya `{ ...userCfg, emote: "cheer" }`.

## Langkah berikutnya untuk ilustrator

Merapikan detail di Figma/Illustrator **dengan kanvas dan anchor yang sama**, lalu menambah item baru (perlengkapan Ramadhan, item event 18 Desember). Referensi konsep ada di [chat Gemini (link publik)](https://share.gemini.google/tIXUlZarQhSH).
