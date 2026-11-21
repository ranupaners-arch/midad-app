# 07 · Aset & Kode

Semua file di bawah ada di **design system interaktif** ([buka](https://claude.ai/artifact/FPWKJoUq5H1KbTjpnVx6wp)), di tab Assets/Files.

## File penting

| File | Isi |
| --- | --- |
| `tokens.json` | Semua token: warna (terang/gelap), tipografi, spacing, radius, shadow, ukuran |
| `components/bundle.css` | CSS semua komponen (prefix `md-`), hanya membaca variabel token |
| `assets/Maskot/mascot.js` | Penggambar maskot SVG berlapis: 5 hewan, warna, gaya, mata, hidung, mulut/paruh, item, skin, ekspresi |
| `assets/Maskot/vehicles.js` | 10 kendaraan hijrah, dengan maskot pengguna ikut naik |
| `assets/Maskot/*.svg` | Ekspor default 5 maskot (hudhud, cat, camel, turtle, oryx) |
| `assets/Ikon/*.svg` | Lencana انظر / استمع / أعد, ikon 24px, tetes hint, mentor |
| `assets/Rihlah/routes.json` | Data rute ID & EN: 8 etape, level, wilayah, kendaraan, pelabuhan |
| `assets/Rihlah/tips.json` | 16 tips belajar untuk layar loading [ar, id, en] |

## Cara pakai maskot

```javascript
// Maskot pengguna (konfigurasi tersimpan di profil)
const user = { animal: 'hudhud', color: 'orange', style: 'fan', eyes: 'round',
  mouth: 'long', hand: 'qalam', head: 'kumma', neck: 'none', skin: 'nakhoda' };

// Gambar maskot (string SVG)
el.innerHTML = MidadMascot.render(user);

// Dengan ekspresi: cheer | sad | think | surprised | sleep
el.innerHTML = MidadMascot.render({ ...user, emote: 'cheer' });

// Crop kepala untuk avatar kecil
el.innerHTML = MidadMascot.render(user, { viewBox: '96 40 320 320' });

// Maskot naik kendaraan (peta, hijrah, naik level)
el.innerHTML = MidadVehicles.ride('baghlah', user);
```

Daftar pilihan: `MidadMascot.ANIMALS[animal].colors` / `.styles`, `EYES`, `BEAKS`, `MOUTHS`, `NOSES`, `HAND`, `HEAD`, `NECK`, `SKINS`, `TIERS`, `EMOTES`, dan `MidadVehicles.V`.

## Prototipe & referensi

- **Prototipe kustomisasi maskot:** [claude.ai/artifact/2d2of7p6z2v9kaT3KGvNdw](https://claude.ai/artifact/2d2of7p6z2v9kaT3KGvNdw)
- **Sheet konsep Gemini (Nano Banana):** [share.gemini.google/tIXUlZarQhSH](https://share.gemini.google/tIXUlZarQhSH) (link publik) — lineup 5 hewan, warna, mata, mulut/paruh, hidung, jambul, 12 item, peta, ikon hadiah, ilustrasi kosakata.

## Aturan aset

- Hasil Gemini adalah **referensi**. Untuk dipakai berlapis, bagian-bagiannya harus digambar di kanvas 512 dengan anchor yang sama (lihat **04 · Maskot & Kustomisasi**).
- Jangan menulis teks Arab di dalam gambar AI, karena hurufnya sering salah. Teks ditambahkan di kode.
- Konten pelajaran **ditulis ulang sendiri** mengikuti urutan bab kitab. Jangan menyalin teks, dialog, atau gambar dari kitab tanpa izin penerbit (ada pernyataan orisinalitas di form lomba).
