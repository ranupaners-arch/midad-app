# Belajar & Ujian

Alur belajar di dalam setiap wahdah (level), mulai dari mufradat sampai hadiah, ditambah bantuan saat pengguna kesulitan.

## Alur satu wahdah

Satu wahdah berisi **6 langkah**, sekitar 10–15 menit per sesi, dan melatih semua keterampilan CEFR (menyimak, berbicara, membaca, menulis, interaksi). Data: `wahdahStructure` di `assets/rihlah/curriculum.json`.

| # | Langkah | Arab | Isi | Keterampilan |
|---|---|---|---|---|
| 1 | Mufradat | المُفْرَدَاتُ | Kata baru dengan gambar + audio, alur **اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ** | menyimak, berbicara |
| 2 | Pola kalimat | التَّرَاكِيبُ | 1–2 pola baru, disusun dari kartu kata (WordTile) | menulis |
| 3 | Hiwar | الحِوَارُ | Dialog bertokoh maskot, pengguna memainkan satu peran | interaksi, berbicara |
| — | **Peti harta** | كَنْز | Kuis singkat setelah hiwar | — |
| 4 | Qira'ah | القِرَاءَةُ | Teks 3–6 kalimat + soal pemahaman | membaca |
| 5 | Tadribat | التَّدْرِيبَاتُ | Latihan campuran (pilihan ganda, susun, dengar) | campuran |
| 6 | Kuis wahdah | اخْتِبَارُ الوَحْدَةِ | Mufradat + pola wahdah itu, lulus ≥ 80% | kosakata |

Setelah lulus kuis: **naik level** (animasi LevelUpTravel → RewardSheet), dan wahdah berikutnya terbuka.

### Kosakata per wahdah (pola hybrid)

- Wahdah biasa memperkenalkan **30–45 kata baru** (target A1 ±600 kata), dipecah jadi **3 sesi mufradat @10–15 kata**. Wahdah ulangan (8 dan 16) berisi 20 kata dalam 2 sesi.
- Satu sesi = satu kali duduk yang ringan. Sesi 2 dan 3 bisa muncul lagi sebagai node mufradat di antara langkah lain.
- Setiap kata punya 3 titik penguasaan (benar 3× = hafal). **Cincin % kuis wahdah dihitung dari semua kata wahdah** yang sudah hafal.

## Tiga jenis ujian & persentase

Setiap ujian punya **cincin persentase** (komponen TestProgress) yang menunjukkan seberapa siap pengguna:

| Ujian | Arab | Posisi | % dihitung dari | Lulus | Hadiah |
|---|---|---|---|---|---|
| Wahdah | اخْتِبَارُ الوَحْدَةِ | akhir tiap wahdah | mufradat wahdah yang sudah hafal | ≥ 80% | 30 kurma + bintang 1–3 + peti kecil |
| Setengah marhalah | الاخْتِبَارُ النِّصْفِيُّ | setelah wahdah 8 | wahdah 1–8 marhalah itu yang lulus | ≥ 75% | 150 kurma + item/skin **Rare** + hijrah |
| Marhalah | الاخْتِبَارُ النِّهَائِيُّ | setelah wahdah 16 | wahdah 1–16 marhalah itu yang lulus | ≥ 75% | 300 kurma + skin **Epic** + شَهَادَة + hijrah |

- **Bobot tes setengah marhalah dan tes marhalah:** menyimak 25%, membaca 25%, kosakata & tata bahasa 30%, berbicara 20% (dinilai lewat pengenalan suara).
- **Label sertifikat:** «Setara A1 (diselaraskan dengan CEFR)». Jangan tulis "sertifikat CEFR", karena Midad bukan lembaga penguji resmi.
- Ujian bisa dimulai saat cincin 100%. Pengguna juga boleh mencoba lebih awal mulai 80%, dengan peringatan.
- Selama ujian, **terjemahan dan hint mati**.
- Gagal: tampilkan kata/bagian yang salah → latihan ulang khusus bagian itu → coba lagi. Hadiah kurma hanya diberikan saat pertama kali lulus.
- Skor tinggi (≥ 95%) memberi bintang ketiga + bonus 20 kurma.

## Saat pengguna stuck: hint (تَلْمِيح)

- Maskot memakai ekspresi **think** dan menawarkan petunjuk setelah 20 detik diam atau 2× salah. Petunjuk muncul **hanya kalau pengguna setuju**.
- Petunjuk **bukan jawaban penuh**: coret satu pilihan salah, huruf pertama, akar kata, audio pelan, gambar, atau kata pertama.
- **Batas pemakaian:** 3 **قَطَرَات** (tetes tinta) gratis per hari. Tetes tambahan bisa dibeli dengan 10 kurma (maks. 5/hari). Maksimal 1 petunjuk per soal, dan XP soal itu jadi 50%.
- Tetes habis → saran untuk membuka ulang mufradat atau **tanya mentor**.

## Tanya mentor (اسْأَلِ المُعَلِّمَ)

> **Post-MVP.** Tidak masuk demo lomba; cukup disebut di rencana pengembangan.

Halaman khusus untuk bertanya ke mentor manusia (komponen AskMentor):
- Konteks pelajaran terlampir otomatis, pertanyaan boleh ditulis dalam bahasa apa pun, dan bisa disertai rekaman suara atau gambar.
- Ada kategori: pengucapan, kosakata, tata bahasa, dan lainnya.
- Sebelum mengirim, pengguna melihat dulu pertanyaan serupa yang sudah pernah dijawab.
- Kuota 3 pertanyaan/minggu. Mentor terverifikasi, percakapan hanya di dalam aplikasi, ada fitur laporan, dan pemantauan untuk pengguna di bawah umur.

## Tips belajar di layar loading

Setiap loading menampilkan **نَصِيحَةٌ** (tips belajar bahasa Arab) yang bergantian, dalam bahasa Arab + terjemahan. Ada 16 tips di `assets/rihlah/tips.json`, misalnya:
- اسْتَمِعْ كَثِيرًا قَبْلَ أَنْ تَتَكَلَّمَ. — Dengarkan banyak-banyak sebelum mulai berbicara.
- احْفَظِ الاسْمَ مَعَ جَمْعِهِ. — Hafalkan kata benda bersama bentuk jamaknya.
- لَاحِظِ الجُذُورَ: كَتَبَ، كِتَابٌ، مَكْتَبٌ. — Perhatikan akar kata.
