# Rihlah: Level, Rute & Hijrah

## Struktur level dari kitab

*Al-'Arabiyyah Baina Yadaik* punya **4 kitab (mustawa)**. Tiap kitab terdiri dari **2 jilid (mujallad)**, dan **setiap jilid berisi 8 wahdah**. Totalnya **64 wahdah = 64 level** di Midad.

| Kitab | Jilid | Level | Dars per wahdah | Ujian di kitab |
|---|---|---|---|---|
| Kitab 1 | 1 · 2 | 1–8 · 9–16 | 9 | Ujian tengah (akhir jilid 1) + ujian akhir (akhir jilid 2) |
| Kitab 2 | 1 · 2 | 17–24 · 25–32 | 13 | Tes penempatan di awal + ujian tengah + ujian akhir |
| Kitab 3 | 1 · 2 | 33–40 · 41–48 | 7 | Ujian tengah + ujian akhir |
| Kitab 4 | 1 · 2 | 49–56 · 57–64 | 7 | Ujian tengah + ujian akhir |

- **1 wahdah = 1 level = 1 pelabuhan/kota** di peta.
- **Dars di dalam wahdah = node pelajaran** (LessonNode) di antara dua pelabuhan.
- **Ujian wahdah (اخْتِبَارُ الوَحْدَةِ)** di akhir setiap wahdah, berisi mufradat wahdah itu. Wajib lulus untuk membuka wahdah berikutnya.
- **Ujian setengah kitab (الاخْتِبَارُ النِّصْفِيُّ)** di akhir jilid 1 dan **ujian akhir kitab (الاخْتِبَارُ النِّهَائِيُّ)** di akhir jilid 2. Keduanya jadi **gerbang hijrah**: kapal pindah ke wilayah baru dan kendaraannya berganti.
- Setiap naik level, maskot pengguna berlayar ke pelabuhan berikutnya (komponen LevelUpTravel). Roadmap lengkap tiap rute ada di komponen RihlahRoadmap, datanya di `assets/Rihlah/routes.json`.
- Kitab ini juga punya kuis singkat tiap dua wahdah. Di Midad, kuis ini jadi node **peti harta (كَنْز)**.

Sumber: deskripsi resmi seri dari penerbit (Arabic For All) dan toko buku. Kitab 1 berisi 144 dars dalam 16 wahdah, Kitab 2 berisi 208 dars, Kitab 3 dan 4 masing-masing 112 dars.

## Tes tahdid mustawa (اِخْتِبَارُ تَحْدِيدِ المُسْتَوَى)

Muncul di onboarding, setelah memilih bahasa ibu dan maskot:

1. Pengguna memilih **"اِبْدَأْ مِنَ الصِّفْرِ"** (mulai dari nol, langsung ke level 1) atau **"اخْتِبَارُ تَحْدِيدِ المُسْتَوَى"** (ikut tes).
2. Tes adaptif sekitar 10–15 menit dengan soal dengar, baca, dan susun kalimat. Soal naik-turun tingkat kesulitannya mengikuti jawaban.
3. Hasilnya menentukan **titik awal di awal salah satu jilid** (level 1, 9, 17, 25, 33, 41, 49, atau 57).
4. Semua level sebelum titik awal ditandai **"تَجَاوَزْتَهُ"** (dilewati). Pengguna tetap bisa membukanya untuk mengulang, tapi tanpa XP penuh.
5. Animasi pembukanya: maskot langsung **berlayar ke wilayah hasil tes** dengan kendaraan wilayah itu.
6. Tes bisa diulang dari الإِعْدَادَات (pengaturan), sekali setiap 30 hari.

## Rute per bahasa ibu

Pengguna berangkat dari **negara bahasa ibunya**, lalu pelan-pelan mendekati dunia Arab.

- **Kitab 1 (level 1–16)** berlangsung di luar dunia Arab, sebagai fase pembiasaan.
- **Lulus ujian akhir Kitab 1** = tiba di negara Arab pertama (level 17).
- **Kitab 2–4** menjelajah dunia Arab dalam 6 wilayah. Urutan wilayahnya mengikuti dari arah mana pengguna datang.

### Bahasa Indonesia — dari Nusantara lewat Samudra Hindia

| Jilid | Level | Wilayah | Kendaraan | Pelabuhan (1 per wahdah) |
|---|---|---|---|---|
| K1 J1 | 1–8 | Nusantara | **Pinisi** | Jakarta, Banten, Lampung, Palembang, Bangka, Padang, Medan, Banda Aceh |
| K1 J2 | 9–16 | Samudra Hindia | **Jong Jawa** | Melaka, Penang, Kolombo, Kochi, Malé, Kozhikode, Surat, Gwadar |
| K2 J1 | 17–24 | 🌙 **Oman** (tiba di dunia Arab) | **Baghlah** | Muscat, Sur, Ras al-Jinz, Nizwa, Bahla, Sohar, Khasab, Salalah |
| K2 J2 | 25–32 | Teluk | **Boom** | Dubai, Sharjah, Abu Dhabi, Doha, Manama, Dammam, Al-Ahsa, Kuwait |
| K3 J1 | 33–40 | Yaman & Hijaz | **Sambuk** | Mukalla, Tarim, Aden, Sana'a, Abha, Taif, Jeddah, Madinah |
| K3 J2 | 41–48 | Syam & Irak ✱ | **Kafilah unta** | Aqaba, Petra, Amman, Damaskus, Beirut, Aleppo, Baghdad, Basrah |
| K4 J1 | 49–56 | Mesir & Sudan | **Felucca** | Port Said, Alexandria, Kairo, Giza, Luxor, Aswan, Siwa, Khartoum |
| K4 J2 | 57–64 | Maghrib | **Xebec** | Tripoli, Tunis, Kairouan, Aljir, Fez, Marrakesh, Chinguetti, Tangier |

### English — from Britain across the Mediterranean

| Jilid | Level | Wilayah | Kendaraan | Pelabuhan |
|---|---|---|---|---|
| K1 J1 | 1–8 | Britania | **Thames barge** | London, Dover, Southampton, Plymouth, Falmouth, Cardiff, Liverpool, Edinburgh |
| K1 J2 | 9–16 | Atlantik & Iberia | **Karavel** | Brest, Bordeaux, Bilbao, A Coruña, Porto, Lisbon, Cádiz, Gibraltar |
| K2 J1 | 17–24 | 🌙 **Maghrib** (tiba di dunia Arab) | **Xebec** | Tangier, Fez, Marrakesh, Chinguetti, Aljir, Tunis, Kairouan, Tripoli |
| K2 J2 | 25–32 | Mesir & Sudan | **Felucca** | Alexandria, Kairo, Giza, Siwa, Luxor, Aswan, Khartoum, Port Said |
| K3 J1 | 33–40 | Syam & Irak | **Kafilah unta** | Beirut, Damaskus, Aleppo, Amman, Petra, Aqaba, Baghdad, Basrah |
| K3 J2 | 41–48 | Hijaz & Yaman ✱ | **Sambuk** | Madinah, Jeddah, Taif, Abha, Sana'a, Aden, Tarim, Mukalla |
| K4 J1 | 49–56 | Teluk | **Boom** | Kuwait, Al-Ahsa, Dammam, Manama, Doha, Abu Dhabi, Sharjah, Dubai |
| K4 J2 | 57–64 | **Oman** | **Baghlah** | Khasab, Sohar, Muscat, Nizwa, Bahla, Sur, Ras al-Jinz, Salalah |

✱ = mulai pertengahan Kitab 3 (level 41), **mode tanpa tasykil** aktif (lihat bawah).

Kedua rute melewati **6 wilayah Arab yang sama dengan urutan terbalik**. Jadi konten wilayah (pelabuhan, kosakata budaya, ilustrasi) cukup dibuat sekali. Bahasa ibu lain nanti cukup menambah dua jilid pembuka (Kitab 1) dan memilih titik masuk ke dunia Arab.

Catatan: daftar kota di atas masih usulan dan bisa diganti tim. Kota yang dipilih sebaiknya netral dan dikenal secara budaya.

## Hijrah (pindah wilayah)

Hijrah terjadi setiap kali pengguna lulus ujian di akhir jilid:

1. Layar selebrasi: maskot dengan ekspresi `cheer`, lalu muncul hadiah (skin atau item, lihat Skin).
2. **Animasi hijrah:** kendaraan lama berlabuh, lalu maskot pindah ke **kendaraan baru** dan berlayar (atau berjalan dengan kafilah) ke wilayah berikutnya.
3. Kartu wilayah baru tampil: nama wilayah dalam bahasa Arab + terjemahan, kendaraan barunya, dan 3 kosakata budaya.

Kendaraan (`assets/Maskot/vehicles.js`, kanvas 512×320, maskot pengguna ikut naik):

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

- **Aktif otomatis mulai level 41** (pertengahan Kitab 3, Jilid 2).
- Teks UI dan teks pelajaran tampil **tanpa harakat**. Tombol **"التَّشْكِيلُ"** (ikon harakat) memunculkan harakat sementara, mirip tombol تَرْجَمَة.
- Setiap kali harakat dibuka, sistem mencatat "bantuan terpakai" untuk analitik (tanpa penalti XP).
- Soal yang memang menguji harakat (i'rab) tetap menampilkan harakat pada bagian yang relevan saja.
- Sebelum level 41, pengguna bisa mencoba mode ini dari pengaturan, tapi tidak dipaksa.
- Kartu pengumuman saat mode ini pertama aktif: *«أَنْتَ الآنَ تَقْرَأُ بِدُونِ تَشْكِيلٍ!»* + terjemahan.
