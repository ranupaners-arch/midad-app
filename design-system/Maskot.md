# Maskot & Kustomisasi

Avatar pengguna adalah **maskot hewan kartun** yang bisa dikustomisasi. **Hudhud yang memegang pena tinta** adalah maskot default sekaligus wajah brand Midad.

## Daftar hewan (الحَيَوَانَات)

| Hewan | Arab | Alasan tema | Cara membuka |
|---|---|---|---|
| **Hudhud** (default) | هُدْهُد | Burung pembawa kabar di kisah Nabi Sulaiman (QS. An-Naml) | Terbuka sejak awal |
| Kucing | قِطٌّ | Hewan kesayangan, Abu Hurairah | 200 تَمْر |
| Unta | جَمَلٌ | Ikon Jazirah Arab | Selesai Mahattah 2 |
| Penyu hijau | سُلَحْفَاةٌ | Penyu Ras al-Jinz Oman, tema pelayaran | Streak 7 hari |
| Oryx Arab | المَهَا | Hewan khas Oman | Sampai pelabuhan Oman (Mahattah terakhir) |

Menu kustomisasi sekaligus jadi pelajaran: setiap slot dan item ditampilkan dengan nama Arabnya (عَيْنٌ، أَنْفٌ، فَمٌ، مِنْقَارٌ، قَلَمٌ، فَانُوسٌ …).

## Slot kustomisasi

| Slot | Arab | Pilihan | Berlaku untuk |
|---|---|---|---|
| Warna | اللَّوْنُ | Hudhud 6 (oranye, toska, merah muda, biru langit, ungu, mint). Hewan lain masing-masing 4 | Semua |
| Gaya | النَّمَطُ | Hudhud 6 jambul (kipas, runcing, keriting, pendek, terurai, berbunga). Kucing 4 corak, unta 4 rambut, oryx 4 tanduk, penyu 4 tempurung | Semua |
| Mata | العُيُونُ | 8: bulat (default), senyum, ngantuk, bintang, tegas, kedip, titik, bulu mata | Semua (bersama) |
| Hidung | الأَنْفُ | 6: segitiga kucing, kancing, moncong unta, hati, oval oryx, lubang penyu | Kucing, unta, oryx, penyu. **Hudhud tanpa hidung** |
| Mulut / paruh | الفَمُ / المِنْقَارُ | Paruh 4 (hudhud): panjang (default), senyum, pendek, tertawa. Mulut 8 (mamalia & penyu): senyum lebar, tertawa, senyum kecil, "w", melet, "o", nyengir, datar | Per jenis |
| Item | الأَدَوَاتُ | 12, dibagi 3 sub-slot (lihat bawah) | Semua |
| Skin | الكِسْوَةُ | 9 skin, 4 tingkat (lihat bawah) | Semua |

### Item per sub-slot
- **Tangan / sayap** (satu): pena qalam (default), botol tinta, buku terbuka, fanus, keranjang kurma, kapal dhow mainan, teleskop, gulungan peta
- **Kepala** (satu): kumma Oman, mussar Oman, peci
- **Leher** (satu): syal batik

Pengguna bisa memakai satu item di setiap sub-slot sekaligus, misalnya peci + syal batik + pena.


## Skin / pakaian luar (الكِسْوَةُ)

Skin di-clip ke bentuk badan bersama, jadi **satu skin pas di kelima hewan**.

| Tingkat | Arab | Skin | Cara dapat |
|---|---|---|---|
| Common | عَادِيٌّ | Baju pelaut, rompi, batik | Beli dengan kurma (100–150) |
| Rare | نَادِرٌ | Dishdasha, baju koko | Tiba di Oman / 400 kurma |
| Epic | مَلْحَمِيٌّ | Seragam nakhoda, jubah ulama | Tamat satu kitab / streak 30 hari |
| Legendary | أُسْطُورِيٌّ | Bisht emas, tinta malam | Tamat 4 kitab / event 18 Desember |

Data: `{ skin: 'nakhoda' }`. Lihat komponen **SkinCard**.

## Maskot pengguna dipakai di mana-mana

Konfigurasi maskot yang disimpan pengguna (hewan, warna, gaya, wajah, item, skin) dipakai di **semua tempat yang butuh maskot**. Tempat-tempat itu hanya menambahkan **ekspresi** (`emote`: cheer, sad, think, surprised, sleep) tanpa mengubah tampilan milik pengguna.

- **Loading:** maskot menulis dengan pena + kata hari ini (komponen MascotLoader)
- **Hijrah & peta:** maskot naik kendaraan wilayah (komponen Vehicles)
- **Feedback, onboarding, notifikasi, profil, avatar kecil:** lihat MascotMoments

Hook animasi di SVG: `.mm-all`, `.mm-front`, `.mm-eyes`, `.mm-spark`, `.vh-boat`, `.vh-waves`.

## Spesifikasi teknis (untuk developer & ilustrator)

Semua digambar oleh `assets/Maskot/mascot.js`.

- **Kanvas:** SVG `viewBox="0 0 512 512"`, garis tanah y = 480.
- **Badan bersama:** telur di x 124–388, y 166–440.
- **Anchor (sama untuk semua hewan):** mata y 236 (x 216 & 296) · hidung y 272 · mulut y 294 · atas kepala y 176 · tangan (392, 262) · leher y 330.
- **Urutan layer:** bayangan → ekor & ciri belakang → kaki → tangan belakang → badan → perut/corak/moncong → skin → garis badan → item leher → mata → hidung → mulut/paruh → item kepala → tangan depan → item tangan.
- **Warna lewat variabel CSS** di `<svg>`: `--mb` (badan), `--mbd` (badan gelap), `--mbl` (perut/terang), `--ma` (aksen). Garis selalu `#2a211a`.
- **Hook animasi:** `.mm-all`, `.mm-front`, `.mm-eyes`, `.mm-spark`.

**Data maskot pengguna:**
```json
{ "animal": "hudhud", "color": "orange", "style": "fan", "eyes": "round", "nose": null, "mouth": "long", "hand": "qalam", "head": "none", "neck": "none", "skin": "none" }
```
Tempat lain cukup menambah `emote` (`cheer`, `sad`, `think`, `surprised`, `sleep`).

## Alur aset
1. **Konsep (selesai):** sheet dari Gemini (Nano Banana) berisi lineup 5 hewan, 6 warna hudhud, 8 mata, 4 paruh + 8 mulut, 6 hidung, 6 jambul, 12 item.
2. **Produksi (selesai, v1):** kelima hewan sudah digambar ulang jadi SVG berlapis di `assets/Maskot/mascot.js` dengan **satu postur yang sama**:
   - badan bulat telur ala chibi, menghadap depan, kaki pendek
   - sayap/tangan kanan terangkat memegang item, kiri di samping
   - posisi mata, hidung, mulut, kepala, dan tangan sama di kelima hewan
   - yang berbeda hanya ciri khasnya: jambul, telinga, tanduk, punuk, tempurung, ekor, dan corak

   Isi saat ini: hudhud 6 warna + 6 jambul, hewan lain masing-masing 4 warna + 4 gaya, 8 mata, 4 paruh, 8 mulut, 6 hidung, 8 item tangan, 3 item kepala, 1 item leher.
3. **Prototipe layar kustomisasi:** https://claude.ai/artifact/2d2of7p6z2v9kaT3KGvNdw
4. **Berikutnya:** ilustrator merapikan detail di Figma/Illustrator dengan tetap memakai kanvas & anchor yang sama, lalu menambah item lain (perlengkapan Ramadhan, item event 18 Desember).
