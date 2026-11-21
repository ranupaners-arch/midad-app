# Rihlah: Level, Rute & Hijrah

## Struktur level: 4 marhalah × 16 wahdah

Midad memakai **kurikulum sendiri yang diselaraskan dengan CEFR** (data: `assets/rihlah/curriculum.json`, detail: Notion "09 Kurikulum CEFR"). Ada **4 marhalah**, masing-masing **16 wahdah** yang dibagi dua **setengah marhalah** @8 wahdah. Totalnya **64 wahdah = 64 level**.

| Marhalah | CEFR | Level | Setengah 1 · 2 | Tasykil |
|---|---|---|---|---|
| 1 · الانْطِلَاق | A1 | 1–16 | 1–8 · 9–16 | Penuh |
| 2 · الوُصُول | A2 | 17–32 | 17–24 · 25–32 | Penuh |
| 3 · الاسْتِقْرَار | B1 | 33–48 | 33–40 · 41–48 | Penuh sampai level 40, tanpa tasykil mulai 41 |
| 4 · الإِتْقَان | B2 | 49–64 | 49–56 · 57–64 | Tanpa tasykil, kecuali kata yang ambigu |

- **1 wahdah = 1 level = 1 pelabuhan/kota** di peta.
- Di dalam wahdah ada **6 langkah** (mufradat, pola, hiwar, qira'ah, tadribat, kuis), tampil sebagai node pelajaran (LessonNode) di antara dua pelabuhan. Node **peti harta (كَنْز)** muncul setelah hiwar. Lihat [belajar.md](belajar.md).
- **Kuis wahdah (اخْتِبَارُ الوَحْدَةِ)** di akhir setiap wahdah, lulus ≥ 80%. Wajib lulus untuk membuka wahdah berikutnya.
- **Tes setengah marhalah (الاخْتِبَارُ النِّصْفِيُّ)** setelah wahdah 8 dan **tes marhalah (الاخْتِبَارُ النِّهَائِيُّ)** setelah wahdah 16, lulus ≥ 75%. Keduanya jadi **gerbang hijrah**: kapal pindah ke wilayah baru dan kendaraannya berganti.
- Setiap naik level, maskot pengguna berlayar ke pelabuhan berikutnya (komponen LevelUpTravel). Roadmap lengkap tiap rute ada di komponen RihlahRoadmap, datanya di `assets/rihlah/routes.json`.

## Tes tahdid mustawa (اِخْتِبَارُ تَحْدِيدِ المُسْتَوَى)

Muncul di onboarding, setelah memilih bahasa ibu dan maskot:

1. Pengguna memilih **"اِبْدَأْ مِنَ الصِّفْرِ"** (mulai dari nol, langsung ke level 1) atau **"اخْتِبَارُ تَحْدِيدِ المُسْتَوَى"** (ikut tes).
2. Tes adaptif sekitar 10–15 menit dengan soal dengar, baca, dan susun kalimat. Soal naik-turun tingkat kesulitannya mengikuti jawaban.
3. Hasilnya menentukan **titik awal di awal salah satu marhalah** (level 1, 17, 33, atau 49; `placementStarts` di `routes.json`). Soalnya diambil dari can-do tiap marhalah.
4. Semua level sebelum titik awal ditandai **"تَجَاوَزْتَهُ"** (dilewati). Pengguna tetap bisa membukanya untuk mengulang, tapi tanpa XP penuh.
5. Animasi pembukanya: maskot langsung **berlayar ke wilayah hasil tes** dengan kendaraan wilayah itu.
6. Tes bisa diulang dari الإِعْدَادَات (pengaturan), sekali setiap 30 hari.

## Rute per bahasa ibu

Pengguna berangkat dari **negara bahasa ibunya**, lalu pelan-pelan mendekati dunia Arab.

- **Marhalah 1 (level 1–16, A1)** berlangsung di luar dunia Arab, sebagai fase pembiasaan.
- **Lulus tes marhalah 1** = tiba di negara Arab pertama (level 17).
- **Marhalah 2–4** menjelajah dunia Arab dalam 6 wilayah. Urutan wilayahnya mengikuti dari arah mana pengguna datang.

### Bahasa Indonesia — dari Nusantara lewat Samudra Hindia

| Etape | Level | Wilayah | Kendaraan | Pelabuhan (1 per wahdah) |
|---|---|---|---|---|
| M1·1 | 1–8 | Nusantara | **Pinisi** | Jakarta, Banten, Lampung, Palembang, Bangka, Padang, Medan, Banda Aceh |
| M1·2 | 9–16 | Samudra Hindia | **Jong Jawa** | Melaka, Penang, Kolombo, Kochi, Malé, Kozhikode, Surat, Gwadar |
| M2·1 | 17–24 | 🌙 **Oman** (tiba di dunia Arab) | **Baghlah** | Muscat, Sur, Ras al-Jinz, Nizwa, Bahla, Sohar, Khasab, Salalah |
| M2·2 | 25–32 | Teluk | **Boom** | Dubai, Sharjah, Abu Dhabi, Doha, Manama, Dammam, Al-Ahsa, Kuwait |
| M3·1 | 33–40 | Yaman & Hijaz | **Sambuk** | Mukalla, Tarim, Aden, Sana'a, Abha, Taif, Jeddah, Madinah |
| M3·2 | 41–48 | Syam & Irak ✱ | **Kafilah unta** | Aqaba, Petra, Amman, Damaskus, Beirut, Aleppo, Baghdad, Basrah |
| M4·1 | 49–56 | Mesir & Sudan | **Felucca** | Port Said, Alexandria, Kairo, Giza, Luxor, Aswan, Siwa, Khartoum |
| M4·2 | 57–64 | Maghrib | **Xebec** | Tripoli, Tunis, Kairouan, Aljir, Fez, Marrakesh, Chinguetti, Tangier |

### English — from Britain across the Mediterranean

| Etape | Level | Wilayah | Kendaraan | Pelabuhan |
|---|---|---|---|---|
| M1·1 | 1–8 | Britania | **Thames barge** | London, Dover, Southampton, Plymouth, Falmouth, Cardiff, Liverpool, Edinburgh |
| M1·2 | 9–16 | Atlantik & Iberia | **Karavel** | Brest, Bordeaux, Bilbao, A Coruña, Porto, Lisbon, Cádiz, Gibraltar |
| M2·1 | 17–24 | 🌙 **Maghrib** (tiba di dunia Arab) | **Xebec** | Tangier, Fez, Marrakesh, Chinguetti, Aljir, Tunis, Kairouan, Tripoli |
| M2·2 | 25–32 | Mesir & Sudan | **Felucca** | Alexandria, Kairo, Giza, Siwa, Luxor, Aswan, Khartoum, Port Said |
| M3·1 | 33–40 | Syam & Irak | **Kafilah unta** | Beirut, Damaskus, Aleppo, Amman, Petra, Aqaba, Baghdad, Basrah |
| M3·2 | 41–48 | Hijaz & Yaman ✱ | **Sambuk** | Madinah, Jeddah, Taif, Abha, Sana'a, Aden, Tarim, Mukalla |
| M4·1 | 49–56 | Teluk | **Boom** | Kuwait, Al-Ahsa, Dammam, Manama, Doha, Abu Dhabi, Sharjah, Dubai |
| M4·2 | 57–64 | **Oman** | **Baghlah** | Khasab, Sohar, Muscat, Nizwa, Bahla, Sur, Ras al-Jinz, Salalah |

Etape `M2·1` = marhalah 2, setengah pertama.

✱ = mulai level 41 (setengah kedua marhalah 3), **mode tanpa tasykil** aktif (lihat bawah).

**Oman sebagai gerbang.** Untuk pengguna Indonesia, Oman adalah pelabuhan Arab pertama (level 17): di sinilah oryx dan dishdasha terbuka, dan jalur laut Nusantara–Oman jadi cerita utama Midad. Untuk rute EN, Oman menjadi etape terakhir.

Kedua rute melewati **6 wilayah Arab yang sama dengan urutan terbalik**. Jadi konten wilayah (pelabuhan, kosakata budaya, ilustrasi) cukup dibuat sekali. Bahasa ibu lain nanti cukup menambah dua etape pembuka (marhalah 1) dan memilih titik masuk ke dunia Arab.

Catatan: daftar kota di atas masih usulan dan bisa diganti tim. Kota yang dipilih sebaiknya netral dan dikenal secara budaya.

## Hijrah (pindah wilayah)

Hijrah terjadi setiap kali pengguna lulus tes di akhir setengah marhalah (nisfi) atau marhalah (nihai):

1. Layar selebrasi: maskot dengan ekspresi `cheer`, lalu muncul hadiah (skin atau item, lihat Skin).
2. **Animasi hijrah:** kendaraan lama berlabuh, lalu maskot pindah ke **kendaraan baru** dan berlayar (atau berjalan dengan kafilah) ke wilayah berikutnya.
3. Kartu wilayah baru tampil: nama wilayah dalam bahasa Arab + terjemahan, kendaraan barunya, dan 3 kosakata budaya.

Kendaraan (`assets/maskot/vehicles.js`, kanvas 512×320, maskot pengguna ikut naik):

| Kendaraan | Arab | Wilayah |
|---|---|---|
| Pinisi | فِينِيسِي | Nusantara |
| Jong Jawa | جُونْغ | Samudra Hindia |
| Thames barge | مَرْكَبُ التَّايْمْز | Britania |
| Karavel | كَارَافِيل | Iberia |
| Baghlah | بَغْلَة | Oman |
| Boom | بُوم | Teluk |
| Sambuk | سَنْبُوك | Laut Merah |
| Kafilah unta | قَافِلَة | Syam & Irak (darat) |
| Felucca | فَلُوكَة | Sungai Nil |
| Xebec | شَبَّاك | Maghrib |

## Mode tanpa tasykil (بِدُونِ تَشْكِيلٍ)

- **Aktif otomatis mulai level 41** (setengah kedua marhalah 3, B1).
- Teks UI dan teks pelajaran tampil **tanpa harakat**. Tombol **"التَّشْكِيلُ"** (ikon harakat) memunculkan harakat sementara, mirip tombol تَرْجَمَة.
- Setiap kali harakat dibuka, sistem mencatat "bantuan terpakai" untuk analitik (tanpa penalti XP).
- Soal yang memang menguji harakat (i'rab) tetap menampilkan harakat pada bagian yang relevan saja.
- Sebelum level 41, pengguna bisa mencoba mode ini dari pengaturan, tapi tidak dipaksa.
- Kartu pengumuman saat mode ini pertama aktif: *«أَنْتَ الآنَ تَقْرَأُ بِدُونِ تَشْكِيلٍ!»* + terjemahan.
