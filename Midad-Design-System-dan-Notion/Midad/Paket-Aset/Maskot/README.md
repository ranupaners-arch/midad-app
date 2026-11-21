# Maskot

Lima maskot Midad dalam **satu postur yang sama**: chibi, menghadap depan, kanvas 512, garis tanah di y = 480, sayap/tangan kanan terangkat memegang pena qalam.

- `hudhud.svg` — default (oranye-emas, jambul kipas, paruh panjang)
- `cat.svg`, `camel.svg`, `turtle.svg`, `oryx.svg` — bisa dibuka lewat progres (lihat bagian Maskot & Kustomisasi)
- `mascot.js` — sumber semua bagian. `MidadMascot.render({ animal, color, style, eyes, nose, mouth, hand, head, neck })` menghasilkan SVG berlapis. Semua bagian bersama (mata, mulut, item) memakai anchor yang sama untuk kelima hewan.

File SVG di sini adalah ekspor default dengan warna tertanam. Untuk kustomisasi, pakai `mascot.js`.

- `vehicles.js` — kendaraan hijrah. `MidadVehicles.ride(id, userCfg)` menaruh maskot pengguna di atas pinisi, jong, Thames barge, karavel, baghlah, boom, sambuk, kafilah unta, felucca, atau xebec.
- Opsi tambahan di `render`: `skin` (lihat `MidadMascot.SKINS` / `TIERS`) dan `emote` (`cheer`, `sad`, `think`, `surprised`, `sleep`).
