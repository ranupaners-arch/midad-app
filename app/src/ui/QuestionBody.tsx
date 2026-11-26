import { useState } from 'react';
import type { Question } from '../domain/types';
import { l, shuffled } from '../domain/content';
import { matchSpeech } from '../domain/speech';
import { useProfile } from '../store';
import { Button, Mascot, Text, Tr, WordPicture } from './Common';
import { Icon } from './Icon';
import { useAudio, useRecognition } from './useAudio';
import { recordingFor } from './audioAssets';

export default function QuestionBody({ question: q, locked, quiz, hinted, onAnswer, onStudy }: { question: Question; locked: boolean; quiz: boolean; hinted: boolean; onAnswer: (correct: boolean, skipped?: boolean) => void; onStudy: () => void }) {
  const { profile } = useProfile(), audio = useAudio(recordingFor(q.audioKey ?? q.word?.audioKey));
  const [selected, setSelected] = useState<string | null>(null), [ordered, setOrdered] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0), [transcript, setTranscript] = useState(''), [speechMessage, setSpeechMessage] = useState('');
  const recognition = useRecognition(text => {
    const match = matchSpeech(q.text?.ar ?? '', text);
    setTranscript(text);
    if (match.passed) onAnswer(true);
    else { setAttempts(n => n + 1); setSpeechMessage(`حَاوِلْ مَرَّةً أُخْرَى. رَاجِعْ: ${match.missed.join('، ')}`); }
  });
  const checkOrder = () => {
    const normalize = (sentence: string) => sentence.replace(/[.،؟!?]/g, '');
    const response = ordered.map(i => q.words![i]).join(' ');
    if (!q.orderAlternatives) return response === q.words?.join(' ');
    return [q.words!.join(' '), ...q.orderAlternatives].some(sentence => normalize(sentence) === normalize(response));
  };
  const isListeningQuestion = q.kind === 'listen';
  const [revealed, setRevealed] = useState(false);
  const hiddenChoice = hinted ? q.choices?.find(c => c.id !== q.answer)?.id : undefined;
  const effectiveSelection = selected === hiddenChoice ? null : selected;
  const showTranslation = !quiz && !q.meaningTest;
  const indices = shuffled(q.words?.map((_, i) => i) ?? [], q.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0));
  return <div className="question-body" data-question-id={q.id}>
    {q.reading && <article className="reading-card"><span className="reading-label"><Icon name="book" /> اِقْرَأْ</span><p lang="ar">{q.reading.ar}</p>{!quiz && <Tr text={q.reading} />}</article>}
    {q.kind === 'study' ? <div className="study-card"><div className="study-badges"><span><Icon name="book" /> اُنْظُرْ</span><span><Icon name="sound" /> اِسْتَمِعْ</span><span><Icon name="mic" /> أَعِدْ</span></div><WordPicture symbol={q.word?.symbol ?? 'book'} /><p className="study-word" lang="ar">{q.text?.ar}</p>{q.text && <Tr text={q.text} />}</div> : q.text && q.kind !== 'order' && <div className={`question-cue ${q.kind === 'speak' ? 'dialogue-cue' : ''}`}>
      {q.kind === 'speak' && <Mascot emote="think" decorative />}
      {q.speaker && <span className="small-label dialogue-speaker" lang="ar">{q.speaker}</span>}
      {isListeningQuestion && audio.available && !revealed ? <button className="listen-orb" aria-label="اِسْتَمِعْ إِلَى الْكَلِمَةِ" disabled={locked} onClick={() => audio.speak(q.text!.ar)}><Icon name="sound" /></button> : <p className="arabic-cue" lang="ar">{q.text.ar}</p>}
      {showTranslation && !isListeningQuestion && <Tr text={q.text} />}
      {isListeningQuestion && audio.available && <button className="text-button" onClick={() => setRevealed(v => !v)}>{revealed ? 'إِخْفَاءُ النَّصِّ' : 'عَرْضُ النَّصِّ'}</button>}
    </div>}
    {q.text && (q.kind === 'study' || q.kind === 'speak' || isListeningQuestion) && <div className="audio-controls">
      {audio.available ? <><button className="audio-button" type="button" disabled={recognition.listening} onClick={() => audio.speak(q.text!.ar)} aria-label="اِسْتَمِعْ"><Icon name="sound" />{audio.playing ? 'جَارٍ الْاِسْتِمَاعُ…' : 'اِسْتَمِعْ'}</button><button className="audio-button slow" type="button" disabled={recognition.listening} onClick={() => audio.speak(q.text!.ar, true)} aria-label="اِسْتَمِعْ بِبُطْءٍ"><span className="number">0.75×</span></button></> : <p className="audio-note"><Icon name="book" /><Text text={l('لَا يَتَوَفَّرُ صَوْتٌ عَرَبِيٌّ عَلَى جِهَازِكَ. اِقْرَأِ النَّصَّ وَتَابِعْ.', 'Tidak ada suara Arab pada perangkat ini. Baca teks dan lanjutkan; latihan teks tetap tersedia.', 'No Arabic voice is available on this device. Read the text and continue; text practice remains available.')} /></p>}
    </div>}
    {q.kind === 'study' && <><p className="study-instruction"><Text text={l('اِقْرَأِ الْكَلِمَةَ بِصَوْتٍ مَسْمُوعٍ، ثُمَّ تَابِعْ.', 'Ucapkan kata atau ungkapan ini, lalu lanjutkan. Kamu akan mengulanginya dalam latihan.', 'Say the word or expression aloud, then continue. You will review it in practice.')} /></p><Button className="full-width" onClick={onStudy}>مُتَابَعَة</Button></>}
    {(q.kind === 'choice' || q.kind === 'listen') && <fieldset className="answer-options" disabled={locked}><legend className="sr-only">{q.prompt.ar}</legend>{q.choices?.map((choice, i) => <label className={`answer-choice ${effectiveSelection === choice.id ? 'selected' : ''} ${choice.id === hiddenChoice ? 'eliminated' : ''}`} key={choice.id}>
      <input className="sr-only" type="radio" name={q.id} checked={effectiveSelection === choice.id} disabled={choice.id === hiddenChoice} value={choice.id} onChange={() => setSelected(choice.id)} /><span className="choice-key" aria-hidden="true">{['أ', 'ب', 'ج', 'د'][i]}</span><span className={choice.lang === 'ar' ? 'choice-arabic' : 'choice-native'} lang={choice.lang} dir={choice.lang === 'ar' ? 'rtl' : 'ltr'}>{choice.text}</span>{effectiveSelection === choice.id && <Icon name="check" />}
    </label>)}</fieldset>}
    {q.kind === 'order' && <>{!quiz && profile.translation && <p className="pattern-translation" lang={profile.language} dir="ltr">{q.text?.[profile.language]}</p>}<div className="word-answer" role="group" aria-label="الْجُمْلَةُ الَّتِي رَتَّبْتَهَا">{ordered.length === 0 ? <span className="muted">اِضْغَطْ عَلَى الْكَلِمَاتِ بِالتَّرْتِيبِ</span> : ordered.map((idx, position) => <button className="md-tile" key={`${idx}-${position}`} disabled={locked} onClick={() => setOrdered(o => o.filter((_, i) => i !== position))} aria-label={`حَذْفُ ${q.words![idx]}`}>{q.words![idx]}</button>)}</div><div className="word-bank" role="group" aria-label="بَنْكُ الْكَلِمَاتِ">{indices.map(idx => <button className="md-tile" key={idx} disabled={locked || ordered.includes(idx)} onClick={() => setOrdered(o => [...o, idx])}>{q.words![idx]}</button>)}</div>{hinted && <p className="hint-content">الْكَلِمَةُ الْأُولَى: <b>{q.words?.[0]}</b></p>}</>}
    {q.kind === 'speak' && <div className="speech-controls">
      {recognition.supported && attempts < 3 ? <><button className={`microphone-button ${recognition.listening ? 'listening' : ''}`} disabled={locked} onClick={() => { if (recognition.listening) recognition.stop(); else { audio.stop(); recognition.start(); } }} aria-label={recognition.listening ? 'إِيقَافُ التَّسْجِيلِ' : 'ابْدَأِ التَّسْجِيلَ'}><Icon name="mic" /></button><span className="small-label">{recognition.listening ? 'أَسْتَمِعُ إِلَيْكَ…' : 'دَوْرُكَ! أَعِدِ الْجُمْلَةَ'}</span></> : <p className="muted"><Text text={l(attempts >= 3 ? 'لَا بَأْسَ. تَابِعْ وَعُدْ إِلَيْهَا لَاحِقًا.' : 'الْمِيكْرُوفُونُ غَيْرُ مُتَاحٍ. اِقْرَأِ الْجُمْلَةَ بِصَوْتٍ مَسْمُوعٍ.', attempts >= 3 ? 'Tiga percobaan selesai. Kamu bisa melanjutkan dan berlatih lagi nanti.' : 'Pengenalan suara tidak tersedia. Baca kalimat dengan suara lantang, lalu lanjutkan.', attempts >= 3 ? 'Three attempts completed. Continue and practice again later.' : 'Speech recognition is unavailable. Read the sentence aloud, then continue.')} /></p>}
      {(recognition.error || speechMessage) && <p className="speech-message" role="status">{recognition.error || speechMessage}</p>}{transcript && <p className="transcript" lang="ar">{transcript}</p>}
      {!locked && <Button variant="secondary" className="full-width" onClick={() => { audio.stop(); recognition.stop(); onAnswer(false, true); }}>{recognition.supported && attempts < 3 ? 'لَا أَسْتَطِيعُ التَّحَدُّثَ الْآنَ' : 'مُتَابَعَة بِدُونِ مِيكْرُوفُونٍ'}</Button>}
    </div>}
    {!locked && (q.kind === 'choice' || q.kind === 'listen' || q.kind === 'order') && <Button className="full-width check-answer" data-testid="check-answer" disabled={q.kind === 'order' ? ordered.length !== q.words?.length : !effectiveSelection} onClick={() => onAnswer(q.kind === 'order' ? checkOrder() : effectiveSelection === q.answer)}>تَحَقَّقْ</Button>}
    {hinted && q.kind !== 'order' && <p className="hint-content"><Text text={l(q.kind === 'speak' ? 'اِسْتَمِعْ بِبُطْءٍ وَقَسِّمِ الْجُمْلَةَ إِلَى أَجْزَاءٍ.' : 'حَذَفْنَا خِيَارًا خَاطِئًا. أَنْتَ تَسْتَطِيعُ!', q.kind === 'speak' ? 'Dengarkan perlahan dan bagi kalimat menjadi bagian kecil.' : 'Satu pilihan salah sudah dicoret. Kamu bisa!', q.kind === 'speak' ? 'Listen slowly and break the sentence into smaller parts.' : 'One incorrect option has been crossed out. You can do this!')} /></p>}
  </div>;
}

