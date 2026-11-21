# SkinCard

Kartu **skin / pakaian luar (الكِسْوَةُ)** untuk maskot. Karena semua hewan memakai satu postur, setiap skin otomatis pas di kelima hewan. Skin di-clip ke bentuk badan bersama.

| Tingkat | Arab | Warna bingkai | Cara dapat | Skin |
|---|---|---|---|---|
| Common | عَادِيٌّ | abu kertas `#9c8d7b` | dibeli dengan kurma (100–150) | قَمِيصُ البَحَّارِ (baju pelaut), صِدْرِيَّةٌ (rompi), بَاتِيك |
| Rare | نَادِرٌ | biru `#3b82c4` | kurma 400 atau tiba di wilayah tertentu | دِشْدَاشَةٌ (Oman), قَمِيصُ كُوكُو (baju koko) |
| Epic | مَلْحَمِيٌّ | ungu `#7c4dbd` | lulus tes marhalah, streak 30 hari | زِيُّ النُّوخِذَةِ (seragam nakhoda), جُبَّةُ العَالِمِ (jubah ulama) |
| Legendary | أُسْطُورِيٌّ | emas `#e9b949` + kilau animasi | tamat 4 marhalah, event khusus (18 Desember) | البِشْتُ الذَّهَبِيُّ (bisht emas), مِدَادُ اللَّيْلِ (tinta malam) |

- Skin legendary punya elemen `.mm-spark` yang berkilau. Kilau ini berhenti kalau reduced-motion aktif.
- Warna tingkat **tidak dipakai sendirian**: selalu ada label tingkat dalam bahasa Arab di kartu.
- Data: `{ skin: 'nakhoda' }` di konfigurasi maskot. Daftar lengkap ada di `MidadMascot.SKINS` dan `MidadMascot.TIERS`.
