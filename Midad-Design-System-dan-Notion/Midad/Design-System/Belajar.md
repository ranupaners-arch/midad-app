# Belajar & Ujian

Alur belajar di dalam setiap wahdah (level), mulai dari mufradat sampai hadiah, ditambah bantuan saat pengguna kesulitan.

## Alur satu wahdah

1. **Mufradat baru** (مُفْرَدَاتُ الوَحْدَةِ): sekitar 10–15 kata dari wahdah itu, dengan gambar dan audio. Setiap kata punya 3 titik penguasaan (benar 3× = hafal).
2. **Dars-dars** (node di peta): hiwar dengan alur **اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ**, latihan pilihan ganda, susun kalimat, dan dengar.
3. **Peti harta** tiap dua dars (kuis singkat).
4. **Ujian wahdah (اخْتِبَارُ الوَحْدَةِ):** menguji mufradat dan pola kalimat wahdah itu. Lulus ≥ 80% → wahdah berikutnya terbuka.
5. **Naik level:** animasi LevelUpTravel → RewardSheet.

## Tiga jenis ujian & persentase

Setiap ujian punya **cincin persentase** (komponen TestProgress) yang menunjukkan seberapa siap pengguna:

| Ujian | Arab | Posisi | % dihitung dari | Lulus | Hadiah |
|---|---|---|---|---|---|
| Wahdah | اخْتِبَارُ الوَحْدَةِ | akhir tiap wahdah | mufradat wahdah yang sudah hafal | ≥ 80% | 30 kurma + bintang 1–3 + peti kecil |
| Setengah kitab | الاخْتِبَارُ النِّصْفِيُّ | akhir jilid 1 | wahdah jilid 1 yang lulus | ≥ 75% | 150 kurma + item/skin **Rare** + hijrah |
| Akhir kitab | الاخْتِبَارُ النِّهَائِيُّ | akhir jilid 2 | 16 wahdah kitab yang lulus | ≥ 75% | 300 kurma + skin **Epic** + شَهَادَة (sertifikat) + hijrah |

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

Halaman khusus untuk bertanya ke mentor manusia (komponen AskMentor):
- Konteks pelajaran terlampir otomatis, pertanyaan boleh ditulis dalam bahasa apa pun, dan bisa disertai rekaman suara atau gambar.
- Ada kategori: pengucapan, kosakata, tata bahasa, dan lainnya.
- Sebelum mengirim, pengguna melihat dulu pertanyaan serupa yang sudah pernah dijawab.
- Kuota 3 pertanyaan/minggu. Mentor terverifikasi, percakapan hanya di dalam aplikasi, ada fitur laporan, dan pemantauan untuk pengguna di bawah umur.

## Tips belajar di layar loading

Setiap loading menampilkan **نَصِيحَةٌ** (tips belajar bahasa Arab) yang bergantian, dalam bahasa Arab + terjemahan. Ada 16 tips di `assets/Rihlah/tips.json`, misalnya:
- اسْتَمِعْ كَثِيرًا قَبْلَ أَنْ تَتَكَلَّمَ. — Dengarkan banyak-banyak sebelum mulai berbicara.
- احْفَظِ الاسْمَ مَعَ جَمْعِهِ. — Hafalkan kata benda bersama bentuk jamaknya.
- لَاحِظِ الجُذُورَ: كَتَبَ، كِتَابٌ، مَكْتَبٌ. — Perhatikan akar kata.
