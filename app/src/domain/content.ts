import shaharil from './shaharil.json' with { type: 'json' };
import type { Profile, Activity, Language, Localized, Question, QuestionVersion, Unit, Vocabulary } from './types';

export const l = (ar: string, id: string, en: string): Localized => ({ ar, id, en });
const vocabulary = (unit: number, rows: string[][]): Vocabulary[] => rows.map(([ar, id, en, symbol], i) => ({ ...l(ar, id, en), idKey: `u${unit}-w${i + 1}`, symbol }));

// Original demo draft. Lexical entries include useful multiword expressions.
// Counts match curriculum.json (30 / 35 / 35); teaching review and recorded audio remain required.
export const UNITS: Unit[] = [
  {
    id: 1,
    title: l('السَّلَامُ', 'Salam dan sapaan', 'Greetings'),
    subtitle: l('كُلُّ صَدَاقَةٍ تَبْدَأُ بِسَلَامٍ', 'Setiap pertemanan dimulai dengan salam', 'Every friendship begins with a greeting'),
    words: vocabulary(1, [
      ['السَّلَامُ عَلَيْكُمْ', 'Semoga keselamatan menyertaimu', 'Peace be upon you', 'greeting'],
      ['وَعَلَيْكُمُ السَّلَامُ', 'Semoga keselamatan juga menyertaimu', 'And peace be upon you', 'greeting'],
      ['مَرْحَبًا', 'Halo', 'Hello', 'greeting'], ['أَهْلًا', 'Hai / selamat datang', 'Hi / welcome', 'greeting'],
      ['صَبَاحُ الْخَيْرِ', 'Selamat pagi', 'Good morning', 'sun'], ['صَبَاحُ النُّورِ', 'Balasan selamat pagi', 'Good morning (reply)', 'sun'],
      ['مَسَاءُ الْخَيْرِ', 'Selamat sore / malam', 'Good evening', 'moon'], ['مَسَاءُ النُّورِ', 'Balasan selamat sore / malam', 'Good evening (reply)', 'moon'],
      ['كَيْفَ حَالُكَ؟', 'Apa kabarmu? (laki-laki)', 'How are you? (to a male)', 'greeting'], ['كَيْفَ حَالُكِ؟', 'Apa kabarmu? (perempuan)', 'How are you? (to a female)', 'greeting'],
      ['أَنَا بِخَيْرٍ', 'Saya baik', 'I am well', 'heart'], ['الْحَمْدُ لِلَّهِ', 'Segala puji bagi Allah', 'Praise be to Allah', 'heart'],
      ['شُكْرًا', 'Terima kasih', 'Thank you', 'heart'], ['عَفْوًا', 'Sama-sama / permisi', 'You are welcome / excuse me', 'heart'],
      ['مِنْ فَضْلِكَ', 'Tolong (kepada laki-laki)', 'Please (to a male)', 'greeting'], ['مِنْ فَضْلِكِ', 'Tolong (kepada perempuan)', 'Please (to a female)', 'greeting'],
      ['نَعَمْ', 'Ya', 'Yes', 'check'], ['لَا', 'Tidak', 'No', 'cross'],
      ['إِلَى اللِّقَاءِ', 'Sampai jumpa', 'See you', 'greeting'], ['مَعَ السَّلَامَةِ', 'Selamat jalan', 'Goodbye', 'greeting'],
      ['صَدِيقٌ', 'Teman laki-laki', 'Male friend', 'person'], ['صَدِيقَةٌ', 'Teman perempuan', 'Female friend', 'person'],
      ['مُعَلِّمٌ', 'Guru laki-laki', 'Male teacher', 'book'], ['مُعَلِّمَةٌ', 'Guru perempuan', 'Female teacher', 'book'],
      ['طَالِبٌ', 'Pelajar laki-laki', 'Male student', 'book'], ['طَالِبَةٌ', 'Pelajar perempuan', 'Female student', 'book'],
      ['يَوْمٌ', 'Hari', 'Day', 'sun'], ['صَبَاحٌ', 'Pagi', 'Morning', 'sun'], ['مَسَاءٌ', 'Sore / malam', 'Evening', 'moon'], ['لَيْلَةٌ', 'Malam', 'Night', 'moon'],
    ]),
    patterns: [
      { words: ['أَنَا', 'بِخَيْرٍ'], translation: { id: 'Saya baik.', en: 'I am well.' } },
      { words: ['كَيْفَ', 'حَالُكَ؟'], translation: { id: 'Apa kabarmu? (laki-laki)', en: 'How are you? (to a male)' } },
      { words: ['أَنَا', 'طَالِبٌ'], translation: { id: 'Saya seorang pelajar laki-laki.', en: 'I am a male student.' } },
    ],
    dialogue: [l('السَّلَامُ عَلَيْكُمْ.', 'Semoga keselamatan menyertaimu.', 'Peace be upon you.'), l('وَعَلَيْكُمُ السَّلَامُ. كَيْفَ حَالُكَ؟', 'Semoga keselamatan juga menyertaimu. Apa kabarmu?', 'And peace be upon you. How are you?'), l('أَنَا بِخَيْرٍ، شُكْرًا.', 'Saya baik, terima kasih.', 'I am well, thank you.'), l('إِلَى اللِّقَاءِ!', 'Sampai jumpa!', 'See you!')],
    reading: l('أَنَا طَالِبٌ. هَذَا صَدِيقِي. فِي الصَّبَاحِ أَقُولُ: صَبَاحُ الْخَيْرِ. يَقُولُ صَدِيقِي: صَبَاحُ النُّورِ. نَحْنُ بِخَيْرٍ.', 'Saya seorang pelajar. Ini teman saya. Pada pagi hari saya mengucapkan: selamat pagi. Teman saya membalas: selamat pagi. Kami baik-baik saja.', 'I am a student. This is my friend. In the morning I say: good morning. My friend replies: good morning. We are well.'),
    comprehension: [
      { prompt: l('مَنْ أَنَا فِي النَّصِّ؟', 'Siapa saya dalam bacaan?', 'Who am I in the passage?'), choices: ['طَالِبٌ', 'مُعَلِّمٌ', 'طَبِيبٌ'], answer: 0 },
      { prompt: l('مَاذَا أَقُولُ فِي الصَّبَاحِ؟', 'Apa yang saya ucapkan pada pagi hari?', 'What do I say in the morning?'), choices: ['مَسَاءُ الْخَيْرِ', 'صَبَاحُ الْخَيْرِ', 'مَعَ السَّلَامَةِ'], answer: 1 },
      { prompt: l('كَيْفَ حَالُنَا؟', 'Bagaimana kabar kami?', 'How are we?'), choices: ['نَحْنُ بِخَيْرٍ', 'أَنَا مُعَلِّمٌ', 'هَذَا كِتَابٌ'], answer: 0 },
    ],
  },
  {
    id: 2,
    title: l('مَنْ أَنْتَ؟', 'Mari berkenalan', 'Let’s introduce ourselves'),
    subtitle: l('اِسْمٌ جَدِيدٌ، وَصَدِيقٌ جَدِيدٌ', 'Nama baru, teman baru', 'A new name, a new friend'),
    words: vocabulary(2, [
      ['أَنَا', 'Saya', 'I', 'person'], ['أَنْتَ', 'Kamu (laki-laki)', 'You (male)', 'person'], ['أَنْتِ', 'Kamu (perempuan)', 'You (female)', 'person'], ['هُوَ', 'Dia (laki-laki)', 'He', 'person'], ['هِيَ', 'Dia (perempuan)', 'She', 'person'], ['نَحْنُ', 'Kami / kita', 'We', 'person'],
      ['اِسْمٌ', 'Nama', 'Name', 'person'], ['اِسْمِي', 'Nama saya', 'My name', 'person'], ['مَا', 'Apa', 'What', 'question'], ['مَنْ', 'Siapa', 'Who', 'question'], ['مِنْ', 'Dari', 'From', 'compass'], ['أَيْنَ', 'Di mana', 'Where', 'compass'],
      ['بَلَدٌ', 'Negara', 'Country', 'globe'], ['لُغَةٌ', 'Bahasa', 'Language', 'book'], ['إِنْدُونِيسِيَا', 'Indonesia', 'Indonesia', 'globe'], ['عُمَانُ', 'Oman', 'Oman', 'globe'], ['مِصْرُ', 'Mesir', 'Egypt', 'globe'], ['الْيَمَنُ', 'Yaman', 'Yemen', 'globe'], ['مَالِيزِيَا', 'Malaysia', 'Malaysia', 'globe'], ['بَرِيطَانِيَا', 'Britania', 'Britain', 'globe'],
      ['إِنْدُونِيسِيٌّ', 'Orang Indonesia (laki-laki)', 'Indonesian (male)', 'person'], ['إِنْدُونِيسِيَّةٌ', 'Orang Indonesia (perempuan)', 'Indonesian (female)', 'person'], ['عُمَانِيٌّ', 'Orang Oman (laki-laki)', 'Omani (male)', 'person'], ['عُمَانِيَّةٌ', 'Orang Oman (perempuan)', 'Omani (female)', 'person'],
      ['الْعَرَبِيَّةُ', 'Bahasa Arab', 'Arabic', 'book'], ['الْإِنْدُونِيسِيَّةُ', 'Bahasa Indonesia', 'Indonesian', 'book'], ['الْإِنْجِلِيزِيَّةُ', 'Bahasa Inggris', 'English', 'book'],
      ['أَتَكَلَّمُ', 'Saya berbicara', 'I speak', 'greeting'], ['أَتَعَلَّمُ', 'Saya belajar', 'I learn', 'book'], ['أَفْهَمُ', 'Saya memahami', 'I understand', 'book'], ['أُحِبُّ', 'Saya menyukai', 'I like', 'heart'], ['مَدِينَةٌ', 'Kota', 'City', 'compass'], ['جَاكَرْتَا', 'Jakarta', 'Jakarta', 'compass'], ['مَسْقَطُ', 'Muscat', 'Muscat', 'compass'], ['تَشَرَّفْنَا', 'Senang berkenalan denganmu', 'Pleased to meet you', 'greeting'],
    ]),
    patterns: [
      { words: ['اِسْمِي', 'أَحْمَدُ'], translation: { id: 'Nama saya Ahmad.', en: 'My name is Ahmad.' } },
      { words: ['أَنَا', 'مِنْ', 'إِنْدُونِيسِيَا'], translation: { id: 'Saya dari Indonesia.', en: 'I am from Indonesia.' } },
      { words: ['أَنَا', 'أَتَعَلَّمُ', 'الْعَرَبِيَّةَ'], translation: { id: 'Saya belajar bahasa Arab.', en: 'I am learning Arabic.' } },
    ],
    dialogue: [l('مَا اسْمُكَ؟', 'Siapa namamu? (laki-laki)', 'What is your name? (to a male)'), l('اِسْمِي أَحْمَدُ. وَأَنْتَ؟', 'Nama saya Ahmad. Dan kamu?', 'My name is Ahmad. And you?'), l('اِسْمِي سَالِمٌ. أَنَا مِنْ عُمَانَ.', 'Nama saya Salim. Saya dari Oman.', 'My name is Salim. I am from Oman.'), l('أَنَا مِنْ إِنْدُونِيسِيَا. تَشَرَّفْنَا!', 'Saya dari Indonesia. Senang berkenalan!', 'I am from Indonesia. Pleased to meet you!')],
    reading: l('اِسْمِي سَارَةُ. أَنَا مِنْ إِنْدُونِيسِيَا. مَدِينَتِي جَاكَرْتَا. أَتَكَلَّمُ الْإِنْدُونِيسِيَّةَ. أَتَعَلَّمُ الْعَرَبِيَّةَ مَعَ صَدِيقَتِي.', 'Nama saya Sarah. Saya dari Indonesia. Kota saya Jakarta. Saya berbicara bahasa Indonesia. Saya belajar bahasa Arab bersama teman perempuan saya.', 'My name is Sarah. I am from Indonesia. My city is Jakarta. I speak Indonesian. I am learning Arabic with my female friend.'),
    comprehension: [
      { prompt: l('مَا اسْمُهَا؟', 'Siapa namanya?', 'What is her name?'), choices: ['سَارَةُ', 'سَالِمٌ', 'أَحْمَدُ'], answer: 0 },
      { prompt: l('مِنْ أَيْنَ هِيَ؟', 'Dari mana dia?', 'Where is she from?'), choices: ['مِنْ عُمَانَ', 'مِنْ مِصْرَ', 'مِنْ إِنْدُونِيسِيَا'], answer: 2 },
      { prompt: l('مَاذَا تَتَعَلَّمُ؟', 'Apa yang dia pelajari?', 'What is she learning?'), choices: ['الْإِنْجِلِيزِيَّةَ', 'الْعَرَبِيَّةَ', 'الْإِنْدُونِيسِيَّةَ'], answer: 1 },
    ],
  },
  {
    id: 3,
    title: l('الْأَرْقَامُ', 'Angka di sekitar kita', 'Numbers around us'),
    subtitle: l('قَطْرَةٌ، قَطْرَتَانِ، ثَلَاثُ قَطَرَاتٍ', 'Satu tetes, dua tetes, tiga tetes', 'One drop, two drops, three drops'),
    words: vocabulary(3, [
      ['وَاحِدٌ', 'Satu', 'One', '1'], ['اِثْنَانِ', 'Dua', 'Two', '2'], ['ثَلَاثَةٌ', 'Tiga', 'Three', '3'], ['أَرْبَعَةٌ', 'Empat', 'Four', '4'], ['خَمْسَةٌ', 'Lima', 'Five', '5'], ['سِتَّةٌ', 'Enam', 'Six', '6'], ['سَبْعَةٌ', 'Tujuh', 'Seven', '7'], ['ثَمَانِيَةٌ', 'Delapan', 'Eight', '8'], ['تِسْعَةٌ', 'Sembilan', 'Nine', '9'], ['عَشَرَةٌ', 'Sepuluh', 'Ten', '10'],
      ['أَحَدَ عَشَرَ', 'Sebelas', 'Eleven', '11'], ['اِثْنَا عَشَرَ', 'Dua belas', 'Twelve', '12'], ['ثَلَاثَةَ عَشَرَ', 'Tiga belas', 'Thirteen', '13'], ['أَرْبَعَةَ عَشَرَ', 'Empat belas', 'Fourteen', '14'], ['خَمْسَةَ عَشَرَ', 'Lima belas', 'Fifteen', '15'], ['سِتَّةَ عَشَرَ', 'Enam belas', 'Sixteen', '16'], ['سَبْعَةَ عَشَرَ', 'Tujuh belas', 'Seventeen', '17'], ['ثَمَانِيَةَ عَشَرَ', 'Delapan belas', 'Eighteen', '18'], ['تِسْعَةَ عَشَرَ', 'Sembilan belas', 'Nineteen', '19'], ['عِشْرُونَ', 'Dua puluh', 'Twenty', '20'],
      ['صِفْرٌ', 'Nol', 'Zero', '0'], ['رَقْمٌ', 'Digit / nomor', 'Digit / number', '3'], ['عَدَدٌ', 'Bilangan / jumlah', 'Number / quantity', '3'], ['عُمْرٌ', 'Umur', 'Age', 'person'], ['سَنَةٌ', 'Tahun', 'Year', 'sun'], ['هَاتِفٌ', 'Telepon', 'Telephone', 'phone'], ['كَمْ', 'Berapa', 'How many / how much', 'question'], ['وَاحِدَةٌ', 'Satu (feminin)', 'One (feminine)', '1'], ['اِثْنَتَانِ', 'Dua (feminin)', 'Two (feminine)', '2'], ['كِتَابٌ', 'Buku', 'Book', 'book'], ['قَلَمٌ', 'Pena', 'Pen', 'pen'], ['رَقْمُ الْهَاتِفِ', 'Nomor telepon', 'Telephone number', 'phone'], ['عُمْرِي', 'Umur saya', 'My age', 'person'], ['زِيَادَةٌ', 'Tambahan', 'Increase / addition', 'plus'], ['مَجْمُوعٌ', 'Jumlah keseluruhan', 'Total', 'plus'],
    ]),
    patterns: [
      { words: ['عُمْرِي', 'عِشْرُونَ', 'سَنَةً'], translation: { id: 'Umur saya dua puluh tahun.', en: 'I am twenty years old.' } },
      { words: ['عِنْدِي', 'ثَلَاثَةُ', 'كُتُبٍ'], translation: { id: 'Saya mempunyai tiga buku.', en: 'I have three books.' } },
      { words: ['هَذَا', 'قَلَمٌ', 'وَاحِدٌ'], translation: { id: 'Ini satu pena.', en: 'This is one pen.' } },
    ],
    dialogue: [l('كَمْ عُمْرُكَ؟', 'Berapa umurmu? (laki-laki)', 'How old are you? (to a male)'), l('عُمْرِي عِشْرُونَ سَنَةً.', 'Umur saya dua puluh tahun.', 'I am twenty years old.'), l('كَمْ كِتَابًا عِنْدَكَ؟', 'Berapa buku yang kamu punya?', 'How many books do you have?'), l('عِنْدِي ثَلَاثَةُ كُتُبٍ وَقَلَمٌ وَاحِدٌ.', 'Saya punya tiga buku dan satu pena.', 'I have three books and one pen.')],
    reading: l('اِسْمِي أَحْمَدُ. عُمْرِي عِشْرُونَ سَنَةً. عِنْدِي ثَلَاثَةُ كُتُبٍ. وَعِنْدِي قَلَمٌ وَاحِدٌ. أَقْرَأُ كِتَابًا كُلَّ يَوْمٍ.', 'Nama saya Ahmad. Umur saya dua puluh tahun. Saya mempunyai tiga buku. Saya juga mempunyai satu pena. Saya membaca sebuah buku setiap hari.', 'My name is Ahmad. I am twenty years old. I have three books. I also have one pen. I read a book every day.'),
    comprehension: [
      { prompt: l('كَمْ عُمْرُ أَحْمَدَ؟', 'Berapa umur Ahmad?', 'How old is Ahmad?'), choices: ['عَشْرُ سَنَوَاتٍ', 'عِشْرُونَ سَنَةً', 'خَمْسَ عَشْرَةَ سَنَةً'], answer: 1 },
      { prompt: l('كَمْ كِتَابًا عِنْدَهُ؟', 'Berapa buku yang dia punya?', 'How many books does he have?'), choices: ['كِتَابٌ وَاحِدٌ', 'كِتَابَانِ', 'ثَلَاثَةُ كُتُبٍ'], answer: 2 },
      { prompt: l('كَمْ قَلَمًا عِنْدَهُ؟', 'Berapa pena yang dia punya?', 'How many pens does he have?'), choices: ['قَلَمٌ وَاحِدٌ', 'خَمْسَةُ أَقْلَامٍ', 'قَلَمَانِ'], answer: 0 },
    ],
  },
];

export const SHAHARIL_UNITS: Unit[] = shaharil.map(source => {
  const original = UNITS[source.wahdah - 1];
  const localized = (item: { ar: string; tr: { id: string; en: string } }) => l(item.ar, item.tr.id, item.tr.en);
  const lines = source.qiraah.sentences.map(localized);
  const reading = (lang: keyof Localized) => lines.map((line, index) => `${index + 1}. ${line[lang]}`).join('\n');
  return {
    id: source.wahdah,
    curriculum: 'shaharil',
    title: localized(source.title),
    subtitle: l(original.subtitle.ar, source.canDo.id, source.canDo.en),
    words: source.vocab.map(word => ({
      ...localized(word),
      idKey: `u${source.wahdah}-s-${word.id}`,
      symbol: word.digit?.match(/\((\d+)\)/)?.[1]
        ?? original.words.find(candidate => candidate.ar === word.ar)?.symbol
        ?? 'book',
    })),
    patterns: source.patterns.map(pattern => ({ words: pattern.ar.split(' '), translation: pattern.tr })),
    dialogue: source.dialogue.map(line => ({ ...localized(line), speaker: line.speaker })),
    reading: l(reading('ar'), reading('id'), reading('en')),
    comprehension: [],
  };
});

export const unitsFor = (profile: Pick<Profile, 'curriculum'>) => profile.curriculum === 'shaharil' ? SHAHARIL_UNITS : UNITS;

export const ACTIVITY_TITLES = {
  vocabulary: l('الْمُفْرَدَاتُ', 'Kosakata', 'Vocabulary'), pattern: l('التَّرَاكِيبُ', 'Susun kalimat', 'Sentence patterns'),
  dialogue: l('الْحِوَارُ', 'Percakapan', 'Dialogue'), reading: l('الْقِرَاءَةُ', 'Bacaan', 'Reading'), practice: l('التَّدْرِيبَاتُ', 'Latihan', 'Practice'), quiz: l('اخْتِبَارُ الْوَحْدَةِ', 'Kuis wahdah', 'Unit quiz'),
};

export function activities(unit: Unit): Activity[] {
  const size = Math.ceil(unit.words.length / 3);
  const vocab = (session: number): Activity => ({ id: `vocab-${session}`, kind: 'vocabulary', title: ACTIVITY_TITLES.vocabulary, session, words: unit.words.slice((session - 1) * size, session * size) });
  return [vocab(1), { id: 'pattern', kind: 'pattern', title: ACTIVITY_TITLES.pattern }, vocab(2), { id: 'dialogue', kind: 'dialogue', title: ACTIVITY_TITLES.dialogue }, vocab(3), { id: 'reading', kind: 'reading', title: ACTIVITY_TITLES.reading }, { id: 'practice', kind: 'practice', title: ACTIVITY_TITLES.practice }, { id: 'quiz', kind: 'quiz', title: ACTIVITY_TITLES.quiz }];
}

// Stable ordering makes resume deterministic, without relying on Math.random during render.
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = seed + 1;
  for (let i = out.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

function wordQuestion(unit: Unit, word: Vocabulary, lang: Language, index: number, prefix: string, round = 0): Question {
  const id = `${prefix}-${index}`;
  const candidates = shuffled(unit.words.filter(w => w.idKey !== word.idKey), index + round * 31).slice(0, 3);
  const meaningTest = round !== 1;
  return {
    id, kind: round === 1 ? 'listen' : 'choice', word, meaningTest,
    prompt: meaningTest ? l('مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟', 'Apa arti kata atau ungkapan ini?', 'What does this word or expression mean?') : l('اِسْتَمِعْ وَاخْتَرِ الْكَلِمَةَ', 'Dengarkan, lalu pilih kata yang sesuai', 'Listen and choose the matching word'),
    text: word,
    choices: shuffled([word, ...candidates], index + round + unit.id * 19).map(w => ({ id: w.idKey, text: meaningTest ? w[lang] : w.ar, lang: meaningTest ? lang : 'ar' })),
    answer: word.idKey,
  };
}

export function questions(unit: Unit, activity: Activity, lang: Language, version: QuestionVersion = 2): Question[] {
  const prefix = `u${unit.id}-${unit.curriculum === 'shaharil' ? 's-' : ''}${activity.id}`;
  const source = unit.curriculum === 'shaharil' ? shaharil[unit.id - 1] : undefined;
  if (activity.kind === 'vocabulary') {
    const words = activity.words!;
    return [
      ...words.map((word, i): Question => ({ id: `${prefix}-study-${i}`, kind: 'study', prompt: l('اُنْظُرْ، وَاسْتَمِعْ، وَأَعِدْ', 'Lihat, dengar, dan ulangi', 'Look, listen, and repeat'), text: word, word })),
      ...[0, 1, 2].flatMap(round => shuffled(words, unit.id + round * 7).map((word, i) => wordQuestion(unit, word, lang, i + round * words.length, prefix, round))),
    ];
  }
  if (activity.kind === 'pattern') return unit.patterns.map((p, i) => ({ id: `${prefix}-${i}`, kind: 'order', prompt: l('رَتِّبِ الْكَلِمَاتِ', 'Susun kata menjadi kalimat', 'Put the words in order'), words: p.words, text: l(p.words.join(' '), p.translation.id, p.translation.en) }));
  if (activity.kind === 'dialogue') return unit.dialogue.map(({ speaker, ...text }, i) => ({ id: `${prefix}-${i}`, kind: 'speak', prompt: l('اِسْتَمِعْ ثُمَّ أَعِدِ الْجُمْلَةَ', 'Dengarkan, lalu ulangi kalimat ini', 'Listen, then repeat this sentence'), text, speaker }));
  if (activity.kind === 'reading' && source) return source.qiraah.questions.map(item => ({
    id: `${prefix}-${item.id}`,
    kind: 'choice',
    prompt: l(item.ar || 'أَجِبْ عَنِ السُّؤَالِ', item.prompt.id, item.prompt.en),
    reading: unit.reading,
    choices: shuffled(item.options.map((option, i) => 'ar' in option
      ? { id: String(i), text: option.ar, lang: 'ar' as const }
      : { id: String(i), text: option.tr[lang], lang }), Number(item.id.slice(1)) + 41),
    answer: String(item.options.findIndex(option => option.correct)),
  }));
  if (activity.kind === 'reading') return unit.comprehension.map((q, i) => ({ id: `${prefix}-${i}`, kind: 'choice', prompt: q.prompt, reading: unit.reading, choices: q.choices.map((text, j) => ({ id: String(j), text, lang: 'ar' })), answer: String(q.answer) }));
  if (activity.kind === 'practice') return [
    ...shuffled(unit.words, unit.id * 7).slice(0, 4).map((w, i) => wordQuestion(unit, w, lang, i, prefix, i % 2)),
    ...unit.patterns.slice(0, 2).map((p, i): Question => ({ id: `${prefix}-order-${i}`, kind: 'order', prompt: l('رَتِّبِ الْكَلِمَاتِ', 'Susun kata menjadi kalimat', 'Put the words in order'), words: p.words, text: l(p.words.join(' '), p.translation.id, p.translation.en) })),
  ];
  if (source) return source.exam.map((item, i) => {
    const [target, ...distractors] = ('pairs' in item && item.pairs) || [item.target!, ...item.distractors!];
    const words = [target, ...distractors].map(id => unit.words.find(word => word.idKey === `u${unit.id}-s-${id}`)!);
    const question = wordQuestion(unit, words[0], lang, i, prefix, item.type === 'listen-pick' ? 1 : 0);
    return {
      ...question,
      choices: shuffled(words, i + unit.id * 19).map(word => ({
        id: word.idKey, text: question.meaningTest ? word[lang] : word.ar, lang: question.meaningTest ? lang : 'ar',
      })),
    };
  });
  const vocabulary = shuffled(unit.words, unit.id * 73).slice(0, version === 1 ? 10 : 8).map((w, i) => wordQuestion(unit, w, lang, i, prefix, i % 2));
  if (version === 1) return vocabulary;
  return [...vocabulary, ...unit.patterns.slice(0, 2).map((p, i): Question => ({ id: `${prefix}-pattern-${i}`, kind: 'order', prompt: l('رَتِّبِ الْكَلِمَاتِ', 'Susun kata menjadi kalimat', 'Put the words in order'), words: p.words, text: l(p.words.join(' '), p.translation.id, p.translation.en) }))];
}

export const activityKey = (unitId: number, activityId: string) => `u${unitId}:${activityId}`;
