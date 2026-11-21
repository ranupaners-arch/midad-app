# Maskot

Lima maskot Midad dalam **satu postur yang sama**: chibi, menghadap depan, kanvas 512, garis tanah di y = 480, sayap/tangan kanan terangkat memegang pena qalam.

- `hudhud.svg` — default (oranye-emas, jambul kipas, paruh panjang)
- `cat.svg`, `camel.svg`, `turtle.svg`, `oryx.svg` — bisa dibuka lewat progres (lihat bagian Maskot & Kustomisasi)
- `mascot.js` — sumber semua bagian. `MidadMascot.render({ animal, color, style, eyes, nose, mouth, hand, head, neck })` menghasilkan SVG berlapis. Semua bagian bersama (mata, mulut, item) memakai anchor yang sama untuk kelima hewan.

File SVG di sini adalah ekspor default dengan warna tertanam. Untuk kustomisasi, pakai `mascot.js`.

- `vehicles.js` — kendaraan hijrah. `MidadVehicles.ride(id, userCfg)` menaruh maskot pengguna di atas pinisi, jong, Thames barge, karavel, baghlah, boom, sambuk, kafilah unta, felucca, atau xebec.
- Opsi tambahan di `render`: `skin` (lihat `MidadMascot.SKINS` / `TIERS`) dan `emote` (`cheer`, `sad`, `think`, `surprised`, `sleep`).

## Dipakai di aplikasi (ES module)

`mascot.js` dan `vehicles.js` tetap dipakai preview lama lewat `<script>` (memasang `window.MidadMascot` / `window.MidadVehicles`). Untuk aplikasi, impor wrapper ES module yang punya tipe dan validasi:

```ts
import { renderMascot, validateMascotConfig } from 'design-system/assets/maskot/mascot.mjs';
import { rideVehicle } from 'design-system/assets/maskot/vehicles.mjs';

const cfg = validateMascotConfig(JSON.parse(localStorage.getItem('mascot') ?? 'null')); // nilai liar -> default
el.innerHTML = renderMascot({ ...cfg, emote: 'cheer' }, { label: 'maskotku' });          // label di-escape
el.innerHTML = rideVehicle('pinisi', cfg);
```

- Selalu lewat `renderMascot` / `rideVehicle`, bukan `MidadMascot.render` langsung, untuk konfigurasi yang berasal dari penyimpanan atau server.
- `opts.attrs`, `opts.cls`, dan `opts.viewBox` disisipkan apa adanya ke SVG, jadi hanya boleh berasal dari kode.
- Tipe ada di `mascot.d.mts` dan `vehicles.d.mts`. Kalau menambah pilihan di `mascot.js`, perbarui tipenya lalu jalankan `node scripts/check-mascot.mjs`.
