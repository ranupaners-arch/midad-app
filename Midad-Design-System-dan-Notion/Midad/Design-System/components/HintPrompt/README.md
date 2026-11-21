# HintPrompt

Saat pengguna **stuck**, maskotnya terlihat **berpikir** (emote `think`) dan menawarkan **تَلْمِيح** (petunjuk). Petunjuk **tidak pernah berupa jawaban penuh**, dan hanya muncul kalau pengguna setuju.

**Kapan ditawarkan:** pengguna diam lebih dari 20 detik di satu soal, atau sudah salah 2× di soal yang sama.

**Jenis petunjuk** (dipilih otomatis sesuai jenis soal):
- **Coret satu pilihan salah** (pilihan ganda)
- **Huruf pertama** atau **akar kata** (ك ت ب)
- **Dengarkan pelan** (0.75×) untuk soal dengar dan ListenRepeat
- **Gambar petunjuk** untuk kosakata benda
- **Kata pertama** untuk susun kalimat

**Batas pemakaian:** petunjuk disebut **قَطَرَات** (tetes tinta) dengan ikon `hint-drop.svg`.
- 3 tetes gratis per hari, terisi ulang setiap tengah malam.
- Tetes tambahan bisa dibeli dengan 10 kurma (maksimal 5 per hari).
- Maksimal 1 petunjuk per soal. Soal yang dijawab dengan petunjuk mendapat XP 50%.
- Petunjuk **mati** selama ujian (wahdah, nisfi, nihai).
- Kalau tetes habis, maskot memakai ekspresi `sad` dan menyarankan **اسْأَلِ المُعَلِّمَ** (tanya mentor) atau membuka ulang mufradat.

Aksesibilitas: sisa tetes diumumkan lewat `aria-label` ("قَطْرَتَانِ مُتَبَقِّيَتَانِ مِنْ ثَلَاثٍ"), dan pilihan yang dicoret diberi `aria-disabled`.
