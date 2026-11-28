import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import type { Activity, Question, Unit } from '../domain/types';
import type { UnitReward } from '../domain/progress';
import { activities, l, questions, unitsFor } from '../domain/content';
import { advanceSession, answerQuestion, availableHints, beginSession, completeSession, isActivityUnlocked, lessonCheckpoint, masteryPct, sessionScore, useHint } from '../domain/progress';
import { useProfile } from '../store';
import { Button, Mascot, Progress, Text, Tr, Vehicle } from '../ui/Common';
import { Icon } from '../ui/Icon';
import { feedbackSound } from '../ui/useAudio';
import QuestionBody from '../ui/QuestionBody';
import LevelUpTravel from '../ui/LevelUpTravel';
import { pendingReviews } from '../domain/reviews';
import { hasRepeatedMistakes } from '../domain/hints';
import { useIdleHint } from '../ui/useIdleHint';
import Companion, { emitCompanion } from '../ui/Companion';
import { useIdleCompanion } from '../ui/useIdleCompanion';

export default function LessonRoute() {
  const { unitId, activityId } = useParams(), { profile } = useProfile();
  const [confirmedQuiz, setConfirmedQuiz] = useState<number | null>(null);
  const unit = unitsFor(profile).find(u => u.id === Number(unitId)), activity = unit && activities(unit).find(a => a.id === activityId);
  if (!unit || !activity || !isActivityUnlocked(profile, unit, activity.id)) return <Navigate to={unit ? `/unit/${unit.id}` : '/'} replace />;
  const resuming = !!lessonCheckpoint(profile, unit.id, activity.id);
  if (activity.kind === 'quiz' && masteryPct(profile, unit) < 100 && !resuming && confirmedQuiz !== unit.id) return <div className="screen quiz-readiness"><Link className="back-link" to={`/unit/${unit.id}`}><Icon name="back" /> {unit.title.ar}</Link><Mascot emote="think" decorative /><span className="eyebrow">قَبْلَ الْاِخْتِبَارِ</span><h1 id="main-title" tabIndex={-1}><Text text={l('هَلْ أَنْتَ مُسْتَعِدٌّ؟', 'Siap mencoba kuis?', 'Ready to try the quiz?')} /></h1><p className="readiness-percentage number">{masteryPct(profile, unit)}%</p><Progress value={masteryPct(profile, unit)} label="إِتْقَانُ الْمُفْرَدَاتِ قَبْلَ الْاِخْتِبَارِ" /><p className="readiness-explanation"><Text text={l('لَمْ تَتْقِنْ كُلَّ الْمُفْرَدَاتِ بَعْدُ. يُمْكِنُكَ تَجْرِبَةُ الْاِخْتِبَارِ الْآنَ، أَوِ الرُّجُوعُ لِلْمُرَاجَعَةِ. النَّجَاحُ مِنْ ٨٠٪.', 'Sebagian kosakata belum dikuasai. Kamu boleh mencoba sekarang atau kembali belajar. Nilai lulus tetap 80%; terjemahan dan hint dimatikan selama kuis.', 'Some vocabulary is not mastered yet. You may try now or keep practicing. The pass mark remains 80%; translation and hints are disabled during the quiz.')} force /></p><div className="result-actions"><Button className="full-width" onClick={() => setConfirmedQuiz(unit.id)}>جَرِّبِ الْاِخْتِبَارَ</Button><Link className="md-btn md-btn--secondary full-width" to={`/unit/${unit.id}/words`}>أَكْمِلِ الْمُرَاجَعَةَ</Link></div></div>;
  return <Lesson key={`${unit.id}:${activity.id}`} unit={unit} activity={activity} />;
}

type Result = { score: number; reward: UnitReward | null; mistakes: Question[] };
function Lesson({ unit, activity }: { unit: Unit; activity: Activity }) {
  const { profile, update } = useProfile();
  const [result, setResult] = useState<Result | null>(null);
  const session = profile.session?.unitId === unit.id && profile.session.activityId === activity.id ? profile.session : null;
  const bank = questions(unit, activity, profile.language, session ? session.questionVersion ?? 1 : 2);
  const currentQuestionId = session && bank[session.cursor]?.id;
  const feedbackVisible = !!(session && session.answers[session.cursor]);
  useEffect(() => { update(p => beginSession(p, unit.id, activity.id)); }, [unit.id, activity.id, update]);
  useEffect(() => { if (currentQuestionId && !feedbackVisible) document.getElementById('main-title')?.focus({ preventScroll: true }); }, [currentQuestionId, feedbackVisible]);
  useEffect(() => {
    if (!session || session.cursor < bank.length || result) return;
    const completed = completeSession(profile);
    setResult({ score: sessionScore(session), reward: completed.reward, mistakes: bank.filter(q => session.answers.some(a => a.questionId === q.id && !a.correct)) });
    update(p => completeSession(p).profile);
  }, [session, bank.length, profile, result, update]);
  const idleQuestion = session ? bank[session.cursor] : undefined;
  useIdleCompanion(!!idleQuestion && idleQuestion.kind !== 'study' && !feedbackVisible && !result, currentQuestionId ?? '');
  if (result) return <LessonResult unit={unit} activity={activity} result={result} onRetry={() => { setResult(null); update(p => beginSession(p, unit.id, activity.id)); }} />;
  if (!session || session.cursor >= bank.length) return <div className="screen" role="status">جَارٍ تَجْهِيزُ الدَّرْسِ…</div>;
  const q = bank[session.cursor], response = session.answers[session.cursor];
  const quiz = activity.kind === 'quiz';
  const handleAnswer = (correct: boolean, skipped = false) => {
    update(p => answerQuestion(p, q, correct, skipped));
    if (!skipped) emitCompanion(correct ? 'right' : 'wrong');
    if (profile.sound && !skipped) feedbackSound(correct);
  };
  const correctText = q.kind === 'order' || q.kind === 'speak' ? q.text?.ar : q.choices?.find(c => c.id === q.answer)?.text;
  return <div className="lesson-screen" data-testid="lesson-content">
    <header className="lesson-header"><Link className="icon-button" to={`/unit/${unit.id}`} aria-label="حِفْظُ الدَّرْسِ وَالْعَوْدَةُ"><Icon name="cross" /></Link><Progress value={session.cursor / bank.length * 100} label="تَقَدُّمُ الدَّرْسِ" /><span className="number small-label">{session.cursor + 1}/{bank.length}</span><Companion className="lesson-companion" decorative /></header>
    <QuestionBody key={q.id} question={q} locked={!!response} quiz={quiz} hinted={session.hintAt === session.cursor} onAnswer={handleAnswer} onStudy={() => update(p => advanceSession(answerQuestion(p, q, true)))}
      heading={<><div className="lesson-kicker"><span>{activity.title.ar}{activity.session ? ` · ${activity.session}/3` : ''}</span>{quiz && <span><Icon name="lock" /> الْاِخْتِبَارُ</span>}</div>
    <h1 id="main-title" tabIndex={-1} className="question-title">{q.prompt.ar}{!quiz && <Tr text={q.prompt} />}</h1></>}
      hint={!response && !quiz && q.kind !== 'study' && <HintOffer question={q} />}
      feedback={response && <div className={`feedback-panel ${response.skipped ? 'skipped' : response.correct ? 'correct' : 'wrong'}`} role="status">
      <div className="feedback-copy"><Icon name={response.skipped ? 'book' : response.correct ? 'check' : 'cross'} /><div><b>{response.skipped ? 'سَنُرَاجِعُهَا لَاحِقًا' : response.correct ? 'أَحْسَنْتَ!' : 'لَا بَأْسَ، نَتَعَلَّمُ مَعًا'}</b>{!response.correct && !response.skipped && <><span className="small-label">الْإِجَابَةُ الصَّحِيحَةُ:</span><span className={`correct-answer ${q.meaningTest ? 'native-answer' : ''}`} lang={q.meaningTest ? profile.language : 'ar'} dir={q.meaningTest ? 'ltr' : 'rtl'}>{correctText}</span>{!quiz && q.text && <Tr text={q.text} force />}</>}{response.skipped && <span className="small-label">لَمْ تُحْتَسَبْ كَإِجَابَةٍ صَحِيحَةٍ</span>}</div><Mascot emote={response.correct ? 'cheer' : 'think'} decorative /></div>
      <Button className="full-width" variant={response.correct ? 'success' : response.skipped ? 'primary' : 'danger'} autoFocus onClick={() => update(advanceSession)}>{response.correct || response.skipped ? 'مُتَابَعَة' : 'فَهِمْتُ'}</Button>
    </div>}
    />
  </div>;
}


function HintOffer({ question }: { question: Question }) {
  const { profile, update } = useProfile();
  const offered = useIdleHint(question.id) || hasRepeatedMistakes(profile.session);
  const used = profile.session?.hintAt === profile.session?.cursor;
  if (used) return <p className="hint-xp"><Icon name="drop" /> نِصْفُ نِقَاطِ السُّؤَالِ مَعَ التَّلْمِيحِ</p>;
  if (!offered) return null;
  return <div className="hint-offer"><Mascot emote="think" decorative /><span>تَحْتَاجُ قَطْرَةً مِنَ الْمُسَاعَدَةِ؟ <span className="number">{availableHints(profile)}</span></span>{availableHints(profile) ? <button type="button" className="text-button" onClick={() => update(p => useHint(p))}>تَلْمِيحٌ</button> : <Link to="/profile">قَطَرَاتٌ إِضَافِيَّةٌ</Link>}</div>;
}

function LessonResult({ unit, activity, result, onRetry }: { unit: Unit; activity: Activity; result: Result; onRetry: () => void }) {
  const { profile } = useProfile();
  const quiz = activity.kind === 'quiz', passed = !quiz || result.score >= 80;
  const list = activities(unit), next = list[list.findIndex(a => a.id === activity.id) + 1];
  return <div className="screen result-screen">
    <span className="eyebrow">{quiz ? 'نَتِيجَةُ الْاِخْتِبَارِ' : 'خُطْوَةٌ جَدِيدَةٌ فِي الرِّحْلَةِ'}</span>
    {quiz && passed && result.reward?.firstPass ? <LevelUpTravel level={unit.id + 1} /> : quiz && passed ? <div className="travel-celebration"><Vehicle /><span className="travel-spark one"><Icon name="star" /></span><span className="travel-spark two"><Icon name="star" /></span></div> : <Mascot className="result-mascot" emote={passed ? 'cheer' : 'think'} decorative />}
    <h1 id="main-title" tabIndex={-1}><Text text={passed ? l(quiz ? 'نَجَحْتَ فِي اخْتِبَارِ الْوَحْدَةِ!' : 'أَحْسَنْتَ!', quiz ? 'Kamu lulus kuis wahdah!' : 'Satu langkah selesai!', quiz ? 'You passed the unit quiz!' : 'One more step completed!') : l('نُحَاوِلُ مَرَّةً أُخْرَى', 'Mari mencoba lagi', 'Let’s try again')} /></h1>
    {quiz ? <><div className="score-display number">{result.score}<span>%</span></div><div className="result-stars" aria-label={`${result.reward?.stars ?? 0} نُجُومٍ`}>{[1, 2, 3].map(n => <Icon key={n} name="star" className={n <= (result.reward?.stars ?? 0) ? 'earned' : ''} />)}</div>
      {passed && result.reward?.firstPass ? <div className="reward-summary"><div><Icon name="dates" /><b className="number">+{result.reward.dates}</b><span>تَمْرَةً</span></div><div><Icon name="star" /><b className="number">+30</b><span>خِبْرَةٌ</span></div>{result.reward.skin && <div><Icon name="wardrobe" /><b>لِبَاسُ الْبَحَّارِ</b><span>هَدِيَّتُكَ</span></div>}</div> : passed ? <p className="muted"><Text text={l('مُرَاجَعَةٌ رَائِعَةٌ! سَبَقَ أَنْ اسْتَلَمْتَ هَدِيَّةَ هَذِهِ الْوَحْدَةِ.', 'Ulangan yang bagus! Hadiah wahdah ini sudah pernah diterima.', 'Great review! You have already received this unit’s reward.')} force /></p> : <p className="muted"><Text text={l('تَحْتَاجُ إِلَى ٨٠٪ لِلنَّجَاحِ. رَاجِعْ هَذِهِ الْكَلِمَاتِ ثُمَّ حَاوِلْ مِنْ جَدِيدٍ.', 'Nilai lulus adalah 80%. Pelajari jawaban di bawah ini, lalu coba kembali.', 'The pass mark is 80%. Review the answers below, then try again.')} force /></p>}
    </> : <p className="muted"><Text text={l('كُلُّ خُطْوَةٍ تَقْرِبُكَ مِنْ هَدَفِكَ.', 'Setiap langkah membawamu lebih dekat.', 'Every step brings you closer.')} /><span className="mastery-result">{masteryPct(profile, unit)}% مُفْرَدَاتٌ مَحْفُوظَةٌ</span></p>}
    {result.mistakes.length > 0 && <details className="review-mistakes"><summary>رَاجِعْ مَا فَاتَكَ <span className="number">({result.mistakes.length})</span></summary><ul>{result.mistakes.map(q => <li key={q.id}><span className="lesson-arabic">{q.text?.ar ?? q.prompt.ar}</span>{q.text && <Tr text={q.text} force />}{q.choices && <span className="review-answer" lang={q.meaningTest ? profile.language : 'ar'} dir={q.meaningTest ? 'ltr' : 'rtl'}>✓ {q.choices.find(c => c.id === q.answer)?.text}</span>}{q.kind === 'speak' && <span className="small-label">تَدَرَّبْ عَلَيْهَا بِصَوْتِكَ</span>}</li>)}</ul></details>}
    <div className="result-actions">{!passed ? <Button className="full-width" onClick={onRetry}>حَاوِلْ مَرَّةً أُخْرَى</Button> : quiz ? <Link className="md-btn full-width" to={unit.id < 3 ? `/unit/${unit.id + 1}` : '/summary'}>{unit.id < 3 ? 'لِلْوَحْدَةِ التَّالِيَةِ' : 'حَصِيلَةُ رِحْلَتِي'}</Link> : next && isActivityUnlocked(profile, unit, next.id) ? <Link className="md-btn full-width" to={`/unit/${unit.id}/lesson/${next.id}`}>مُتَابَعَة</Link> : null}<Link className="md-btn md-btn--secondary full-width" to={`/unit/${unit.id}`}>إِلَى الْوَحْدَةِ</Link></div>
    {pendingReviews(profile, unit.id).length > 0 && <Link className="review-card" to="/review"><Icon name="repeat" /><span><Text text={l('رَاجِعْ مَا فَاتَكَ', 'Latih kembali jawaban yang terlewat', 'Practice what you missed')} /></span><span className="number">{pendingReviews(profile, unit.id).length}</span></Link>}
    {quiz && passed && unit.id === 3 && <p className="completion-note"><Text text={l('أَكْمَلْتَ مَحَطَّاتِ التَّجْرِبَةِ الثَّلَاثَ! الْمَزِيدُ فِي الطَّرِيقِ.', 'Tiga pelabuhan demo selesai! Kamu tetap bisa mengulang semua pelajaran.', 'All three demo ports completed! You can keep reviewing every lesson.')} force /></p>}
  </div>;
}
