# LevelUpTravel

Animasi **naik level**: maskot pengguna (lengkap dengan skin dan itemnya) bergerak **di atas kendaraan wilayahnya** dari pelabuhan yang baru selesai ke pelabuhan berikutnya di peta.

**Urutan (sekitar 3,5 detik):**
1. Pelabuhan lama berubah jadi emas dengan centang.
2. Kendaraan dan maskot meluncur mengikuti jalur titik-titik (`animateMotion` pada path jalur), sementara kendaraan bergoyang (`.vh-boat`).
3. Begitu sampai, node pelabuhan baru menyala (teal + cincin) dan menampilkan nomor level.
4. Banner: **ارْتَقَيْتَ إِلَى المُسْتَوَى …!** + nama pelabuhan berikutnya (+ terjemahan bila aktif). Maskot memasang ekspresi `cheer`.
5. Lanjut ke RewardSheet kalau ada hadiah.

- Saat **hijrah** (setelah lulus tes nisfi atau nihai, tiap 8 level), animasinya sama tetapi jalurnya keluar dari tepi layar, lalu kartu wilayah baru muncul dengan kendaraan baru.
- `prefers-reduced-motion`: kendaraan langsung tampil di pelabuhan baru tanpa gerak.
- Pengumuman ke pembaca layar lewat `role="status"`.
