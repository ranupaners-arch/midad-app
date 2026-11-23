import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useProfile } from '../store';
import { l, UNITS } from '../domain/content';
import { isActivityUnlocked, isUnitUnlocked, masteryPct } from '../domain/progress';
import { filterVocabulary, masteryFilter, vocabularySessionId } from '../domain/vocabulary';
import type { MasteryFilter } from '../domain/vocabulary';
import { Progress, Text, Tr } from '../ui/Common';
import { Icon } from '../ui/Icon';
import { useAudio } from '../ui/useAudio';

const filters = [
  { id: 'all', label: l('الْكُلُّ', 'Semua', 'All') },
  { id: 'new', label: l('جَدِيدَةٌ', 'Baru', 'New') },
  { id: 'learning', label: l('أَتَعَلَّمُهَا', 'Dipelajari', 'Learning') },
  { id: 'mastered', label: l('أَتْقَنْتُهَا', 'Dikuasai', 'Mastered') },
] as const;

export default function Vocabulary() {
  const { unitId } = useParams(), { profile } = useProfile(), [params, setParams] = useSearchParams(), audio = useAudio();
  const appliedQuery = params.get('q') ?? '', appliedStatus = masteryFilter(params.get('status'));
  const [query, setQuery] = useState(appliedQuery), [status, setStatus] = useState<MasteryFilter>(appliedStatus), [speaking, setSpeaking] = useState<string | null>(null);
  const searchKey = `${unitId}:${params.toString()}`;
  const [previousSearch, setPreviousSearch] = useState(searchKey);
  // Sync URL navigation before committing the form. A later effect can erase
  // new typing immediately after the user clears a previous search.
  if (previousSearch !== searchKey) {
    setPreviousSearch(searchKey); setQuery(appliedQuery); setStatus(appliedStatus);
  }
  const unit = UNITS.find(u => u.id === Number(unitId));
  if (!unit || !isUnitUnlocked(profile, unit.id)) return <Navigate to="/" replace />;
  const matches = filterVocabulary(unit, profile.mastery, appliedQuery, appliedStatus), pct = masteryPct(profile, unit);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (status !== 'all') next.set('status', status);
    setParams(next, { replace: true });
  };
  const clear = () => { setQuery(''); setStatus('all'); setParams({}, { replace: true }); };
  return <div className="screen vocabulary-screen"><Link className="back-link" to={`/unit/${unit.id}`}><Icon name="back" /> {unit.title.ar}</Link><span className="eyebrow">الْوَحْدَةُ <span className="number">{unit.id}</span> · {unit.title.ar}</span><h1 id="main-title" tabIndex={-1}><Text text={l('مُفْرَدَاتِي', 'Kosakataku', 'My vocabulary')} /></h1>
    <div className="vocabulary-overview"><div><b className="number">{unit.words.filter(w => (profile.mastery[w.idKey] ?? 0) >= 3).length}/{unit.words.length}</b><span> كَلِمَةً مَحْفُوظَةً</span></div><Progress value={pct} label="إِتْقَانُ مُفْرَدَاتِ الْوَحْدَةِ" /><p><Text text={l('ثَلَاثُ إِجَابَاتٍ صَحِيحَةٍ لِكُلِّ كَلِمَةٍ. كُلُّ نُقْطَةٍ خُطْوَةٌ.', 'Setiap kata perlu tiga jawaban benar pada soal berbeda. Setiap titik menunjukkan satu langkah.', 'Each word needs three correct answers on different questions. Each dot is one step.')} /></p></div>
    <search className="vocabulary-search"><form action={`#/unit/${unit.id}/words`} method="get" onSubmit={submit}>
      <label htmlFor="vocabulary-query"><Text text={l('ابْحَثْ عَنْ كَلِمَةٍ', 'Cari kosakata', 'Search vocabulary')} /></label>
      <input id="vocabulary-query" name="q" type="search" value={query} onChange={event => setQuery(event.target.value)} dir="auto" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" aria-describedby="vocabulary-search-help" />
      <p id="vocabulary-search-help" className="small-label"><Text text={l('بِالْعَرَبِيَّةِ، أَوِ الْإِنْدُونِيسِيَّةِ، أَوِ الْإِنْجِلِيزِيَّةِ.', 'Cari dalam bahasa Arab, Indonesia, atau Inggris. Harakat boleh diabaikan.', 'Search Arabic, Indonesian or English. Arabic vowel marks are optional.')} /></p>
      <fieldset className="vocabulary-filters"><legend>مُسْتَوَى الْإِتْقَانِ</legend><div>{filters.map(filter => <span className="vocabulary-filter" key={filter.id}><input id={`vocabulary-${filter.id}`} name="status" type="radio" value={filter.id} checked={status === filter.id} onChange={() => setStatus(filter.id)} /><label htmlFor={`vocabulary-${filter.id}`}><Text text={filter.label} /></label></span>)}</div></fieldset>
      <div className="vocabulary-search-actions"><button type="submit" className="md-btn">اِبْحَثْ</button><button type="button" className="text-button" onClick={clear}>مَسْحُ الْبَحْثِ</button></div>
    </form></search>
    <p className="vocabulary-result-count" role="status"><span className="number">{matches.length}</span> مِنْ <span className="number">{unit.words.length}</span> كَلِمَةً</p>
    {!audio.available && <p className="audio-note vocabulary-audio-note"><Icon name="book" /><Text text={l('يَظْهَرُ زِرُّ الْاِسْتِمَاعِ عِنْدَ تَوَفُّرِ صَوْتٍ عَرَبِيٍّ عَلَى جِهَازِكَ.', 'Tombol dengar muncul ketika suara Arab tersedia pada perangkat ini.', 'Listening controls appear when an Arabic voice is available on this device.')} /></p>}
    {matches.length ? <ul className="vocabulary-list" role="list">{matches.map(word => {
      const count = Math.min(3, profile.mastery[word.idKey] ?? 0), activityId = vocabularySessionId(unit, word.idKey)!;
      const unlocked = isActivityUnlocked(profile, unit, activityId), reading = audio.playing && speaking === word.idKey;
      return <li key={word.idKey} className={`vocabulary-entry ${count === 3 ? 'mastered' : ''}`}><div className="vocabulary-word"><p className="lesson-arabic" lang="ar">{word.ar}</p><Tr text={word} />{audio.available && <button type="button" className={`icon-button ${reading ? 'selected' : ''}`} aria-label={`اِسْتَمِعْ إِلَى ${word.ar}`} onClick={() => { if (audio.speak(word.ar)) setSpeaking(word.idKey); }}><Icon name="sound" /></button>}</div><div className="vocabulary-entry-footer"><span className="word-mastery" role="img" aria-label={`${count} إِجَابَاتٍ صَحِيحَةٍ مِنْ ٣`}>{[1, 2, 3].map(n => <i key={n} className={n <= count ? 'filled' : ''} aria-hidden="true" />)}<span className="number" aria-hidden="true">{count}/3</span></span><span className="small-label">{count === 3 ? 'أَتْقَنْتَهَا' : count > 0 ? 'تَتَعَلَّمُهَا' : 'جَدِيدَةٌ'}</span>{unlocked ? <Link className="vocabulary-session-link" to={`/unit/${unit.id}/lesson/${activityId}`}>إِلَى جَلْسَتِهَا</Link> : <span className="vocabulary-session-locked"><Icon name="lock" /> تَفْتَحُ مَعَ تَقَدُّمِكَ</span>}</div></li>;
    })}</ul> : <div className="vocabulary-empty"><Icon name="book" /><h2>لَا تَوْجَدُ نَتَائِجُ</h2><p className="muted"><Text text={l('جَرِّبْ كَلِمَةً أُخْرَى أَوْ غَيِّرِ الْفِلْتَرَ.', 'Coba kata lain atau ubah filter penguasaan.', 'Try another word or change the mastery filter.')} /></p><button type="button" className="text-button" onClick={clear}>عَرْضُ كُلِّ الْكَلِمَاتِ</button></div>}
  </div>;
}
