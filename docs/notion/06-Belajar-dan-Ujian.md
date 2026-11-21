# 06 · Belajar & Ujian

## Alur satu wahdah

Enam langkah, sesuai **09 Kurikulum CEFR**:

1. **Mufradat** (المُفْرَدَاتُ) dengan alur **اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ**: gambar, audio, lalu pengguna mengulang.
2. **Pola kalimat** (التَّرَاكِيبُ): 1–2 pola baru, disusun dari kartu kata.
3. **Hiwar** (الحِوَارُ): dialog bertokoh maskot, pengguna memainkan satu peran. Setelah hiwar muncul **peti harta** (kuis singkat).
4. **Qira'ah** (القِرَاءَةُ): teks 3–6 kalimat + soal pemahaman.
5. **Tadribat** (التَّدْرِيبَاتُ): latihan campuran, hint terbatas.
6. **Kuis wahdah** (اخْتِبَارُ الوَحْدَةِ): lulus ≥ 80% untuk membuka wahdah berikutnya, lalu animasi berlayar dan layar hadiah.

**Kosakata (pola hybrid):** wahdah biasa membawa 30–45 kata baru, dipecah jadi **3 sesi mufradat @10–15 kata** (wahdah ulangan: 20 kata, 2 sesi). Setiap kata punya 3 titik penguasaan (benar 3× = hafal), dan cincin % kuis wahdah dihitung dari **semua** kata wahdah.

## اُنْظُرْ وَاسْتَمِعْ وَأَعِدْ (Lihat, Dengar, dan Ulangi)

Alur untuk membiasakan pengucapan yang benar sejak awal. Setiap langkah punya **lencana sendiri**:

| Langkah | Lencana | Yang terjadi |
| --- | --- | --- |
| اُنْظُرْ (lihat) | lingkaran **teal**, mata | Bagian yang aktif disorot, sisanya diredupkan |
| اسْتَمِعْ (dengar) | lingkaran **emas**, telinga + gelombang suara | Sistem membacakan bagian itu (audio penutur asli), kata yang dibaca disorot. Ada opsi 0.75× |
| أَعِدْ (ulangi) | lingkaran **kurma**, mikrofon + panah ulang | Pengguna mengucapkan bagian itu, maskot berpikir |

- **Benar** (≥ 80% kata cocok) → hijau ✓ dan lanjut ke bagian berikutnya.
- **Kurang tepat** → kata yang meleset diberi garis bergelombang, audionya diputar pelan, lalu coba lagi. Setelah 3× muncul tombol lewati.
- Satu bagian = satu baris hiwar. Kalimat lebih dari 6 kata dipecah per frasa.
- **Teknis:** pengenalan suara `ar-SA` (Web Speech API atau server ASR seperti Whisper). Sebelum dibandingkan, teks dinormalisasi: hapus harakat dan tatweel, samakan أ إ آ → ا, ى → ي, ة → ه, buang tanda baca. Pencocokan per kata (Levenshtein).
- **Catatan jujur:** ASR hanya mengecek *kata* yang diucapkan, bukan makhraj secara mendalam. Penilaian pelafalan yang detail bisa ditambah nanti.
- **Tanpa mikrofon:** «لَا أَسْتَطِيعُ التَّحَدُّثَ الآنَ» mematikan soal bicara selama 15 menit.

## Tiga jenis ujian, persentase, dan hadiah

Setiap ujian punya **cincin persentase** yang menunjukkan seberapa siap pengguna.

| Ujian | Arab | Posisi | % dihitung dari | Lulus | Hadiah |
| --- | --- | --- | --- | --- | --- |
| Wahdah | اخْتِبَارُ الوَحْدَةِ | Akhir tiap wahdah | Mufradat wahdah yang sudah hafal | ≥ 80% | 30 kurma + bintang 1–3 + peti kecil |
| Setengah marhalah | الاخْتِبَارُ النِّصْفِيُّ | Setelah wahdah 8 | Wahdah 1–8 marhalah itu yang lulus | ≥ 75% | 150 kurma + item/skin **Rare** • hijrah |
| Marhalah | الاخْتِبَارُ النِّهَائِيُّ | Setelah wahdah 16 | 16 wahdah marhalah itu yang lulus | ≥ 75% | 300 kurma + skin **Epic** • شَهَادَة (sertifikat) + hijrah |

- Bobot tes setengah marhalah dan tes marhalah: menyimak 25%, membaca 25%, kosakata & tata bahasa 30%, berbicara 20%. Sertifikat bertuliskan «Setara A1 (diselaraskan dengan CEFR)».
- Ujian bisa dimulai saat cincin 100%. Mulai dari 80% juga boleh, dengan peringatan.
- **Terjemahan dan hint mati selama ujian.**
- Gagal → lihat bagian yang salah → latihan ulang khusus bagian itu → coba lagi. Hadiah kurma hanya diberikan saat pertama kali lulus.
- Skor ≥ 95% → bintang ketiga + bonus 20 kurma.

## Saat pengguna stuck: hint (تَلْمِيح)

- Setelah 20 detik diam atau 2× salah, maskot memakai ekspresi **think** dan bertanya «هَلْ تُرِيدُ تَلْمِيحًا؟». Petunjuk muncul **hanya kalau pengguna setuju**.
- Petunjuk **bukan jawaban penuh**: coret satu pilihan salah, huruf pertama, akar kata, audio pelan, gambar, atau kata pertama.
- **Batas:** 3 **قَطَرَات** (tetes tinta) gratis per hari. Tetes tambahan 10 kurma (maks. 5/hari). Maksimal 1 petunjuk per soal, dan XP soal itu jadi 50%.
- Tetes habis → saran untuk membuka ulang mufradat atau **tanya mentor**.

## Tanya mentor (اسْأَلِ المُعَلِّمَ)

Halaman untuk bertanya ke mentor manusia (ustadz/pengajar terverifikasi):

- **Konteks pelajaran terlampir otomatis** (wahdah, hiwar, atau soal yang sedang dibuka).
- Pertanyaan boleh ditulis dalam bahasa apa pun, dan bisa disertai **rekaman suara** (untuk koreksi pengucapan) atau gambar.
- Kategori: النُّطْقُ (pengucapan), المُفْرَدَاتُ (kosakata), القَوَاعِدُ (tata bahasa), أُخْرَى (lainnya).
- Sebelum mengirim, muncul **pertanyaan serupa** yang sudah pernah dijawab.
- Status: تَمَّ الرَّدُّ (sudah dijawab) / قَيْدَ الانْتِظَارِ (menunggu). Jawaban dalam bahasa Arab + terjemahan, bisa disertai pesan suara.
- Bisa dibuka dari profil, dari FeedbackSheet («لَمْ أَفْهَمْ»), dan dari HintPrompt saat tetes habis.
- **Batas & keamanan:** kuota 3 pertanyaan/minggu, mentor terverifikasi, percakapan hanya di dalam aplikasi, nomor HP/tautan luar disaring, ada fitur laporan, dan percakapan pengguna di bawah umur dipantau admin.

## Tips belajar di layar loading

Setiap loading menampilkan **نَصِيحَةٌ** yang bergantian (Arab + terjemahan). Ada 16 tips di `assets/rihlah/tips.json`, misalnya:

- اسْتَمِعْ كَثِيرًا قَبْلَ أَنْ تَتَكَلَّمَ. — Dengarkan banyak-banyak sebelum mulai berbicara.
- احْفَظِ الاسْمَ مَعَ جَمْعِهِ. — Hafalkan kata benda bersama bentuk jamaknya.
- لَاحِظِ الجُذُورَ: كَتَبَ، كِتَابٌ، مَكْتَبٌ. — Perhatikan akar kata.
- خَمْسُ دَقَائِقَ كُلَّ يَوْمٍ خَيْرٌ مِنْ سَاعَةٍ فِي الأُسْبُوعِ. — Lima menit setiap hari lebih baik daripada satu jam seminggu sekali.
