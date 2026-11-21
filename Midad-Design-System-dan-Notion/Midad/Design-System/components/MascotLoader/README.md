# MascotLoader

Animasi loading dan animasi hijrah yang **selalu memakai maskot buatan pengguna sendiri**: hewan, warna, bagian wajah, item, dan skin yang tersimpan di profil.

- **Loading:** maskot naik-turun pelan, tangan depan "menulis" dengan pena, dan matanya berkedip. Di bawahnya tiga tetes tinta muncul bergantian, lalu kartu **نَصِيحَةٌ (tips belajar bahasa Arab)** yang berganti tiap 3,5 detik. Teks Arabnya disertai terjemahan sesuai bahasa ibu. Daftar tipsnya ada di `assets/Rihlah/tips.json` (16 tips, format [ar, id, en]). Saat loading lebih dari 8 detik, kartu boleh diganti dengan **كَلِمَةُ اليَوْمِ** (kata hari ini).
- **Hijrah:** maskot berdiri di atas kendaraan wilayahnya (`MidadVehicles.ride(id, userCfg)`). Kendaraan bergoyang dan ombak bergerak.
- Class animasi berasal dari SVG: `.mm-all` (seluruh badan), `.mm-front` (tangan + item), `.mm-eyes`, `.vh-boat`, `.vh-waves`. Keyframes ada di `bundle.css`.
- `prefers-reduced-motion`: semua animasi berhenti dan tetes tinta tampil statis.
- `role="status"` + `aria-live="polite"` pada wadah loading.
