# MascotMoments

Maskot pengguna muncul di banyak tempat dengan **ekspresi (emote)** yang berbeda. Ekspresi hanya mengganti mata dan mulut, ditambah kedua tangan terangkat untuk `cheer`. Hewan, warna, skin, dan itemnya tetap milik pengguna.

`MidadMascot.render(Object.assign({ emote }, userCfg))`

| Tempat | Emote |
|---|---|
| Loading, transisi | default + animasi menulis |
| Onboarding, sapaan pagi | `cheer` |
| Peta Rihlah (penanda posisi) | default, naik kendaraan wilayah |
| Awal pelajaran, halaman kosong | `think` |
| Giliran pengguna bicara (ListenRepeat) | `think` |
| Jawaban benar, naik level, hijrah | `cheer` |
| Jawaban salah, streak padam | `sad` (lalu kalimat penyemangat) |
| Peti harta, hadiah baru | `surprised` |
| Notifikasi malam, pengingat | `sleep` |
| Profil, papan peringkat | default, lengkap dengan skin |
| Avatar kecil (header, komentar) | crop kepala: `viewBox="96 40 320 320"` |
