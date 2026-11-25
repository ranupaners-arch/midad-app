import { useEffect, useState } from 'react';
import { l } from '../domain/content';
import { passesPlacement, placementQuestions } from '../domain/placement';
import { useProfile } from '../store';
import { Button, Text } from '../ui/Common';
import QuestionBody from '../ui/QuestionBody';

type Attempt = { level: number; cursor: number; correct: number; scores: number[]; done: boolean };
const initial: Attempt = { level: 1, cursor: 0, correct: 0, scores: [], done: false };

export default function Placement({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const { profile } = useProfile();
  const [attempt, setAttempt] = useState(initial);
  const questions = placementQuestions(attempt.level, profile.language);
  const question = questions[attempt.cursor];
  useEffect(() => {
    document.getElementById('main-title')?.focus({ preventScroll: true });
  }, [question.id, attempt.done]);

  const submit = (correct: boolean) => setAttempt(current => {
    if (current !== attempt || current.done) return current;
    const score = current.correct + Number(correct);
    if (current.cursor + 1 < questions.length) return { ...current, cursor: current.cursor + 1, correct: score };
    const scores = [...current.scores, score];
    if (current.level === 1 && passesPlacement(score, questions.length)) {
      return { ...initial, level: 2, scores };
    }
    return { ...current, scores, done: true };
  });

  const passedA2 = attempt.level === 2 && passesPlacement(attempt.scores[1], questions.length);
  return <>
    <h1 id="main-title" tabIndex={-1}><Text force text={attempt.done
      ? l('نَتِيجَةُ الاِخْتِبَارِ', 'Hasil tes tahdid', 'Placement result')
      : l('اخْتِبَارُ تَحْدِيدِ الْمُسْتَوَى', 'Tes tahdid mustawa', 'Placement test')} /></h1>
    {attempt.done ? <>
      <p className="center" dir="ltr">{attempt.scores.map((score, index) => `A${index + 1} · ${score}/${placementQuestions(index + 1, profile.language).length}`).join(' · ')}</p>
      <p><Text force text={passedA2
        ? l('أَجَزْتَ قِسْمَ A2.', 'Kamu lolos bagian A2. Tes demo ini mencakup A1 dan A2.', 'You passed the A2 section. This demo covers A1 and A2.')
        : attempt.level === 2
          ? l('نُوصِي أَنْ تَبْدَأَ مِنْ A2.', 'Saran titik mulai: A2.', 'Suggested starting point: A2.')
          : l('نُوصِي أَنْ تَبْدَأَ مِنْ A1.', 'Saran titik mulai: A1.', 'Suggested starting point: A1.')} /></p>
      <p><Text force text={l('يَتَضَمَّنُ الْعَرْضُ ثَلَاثَ وَحَدَاتٍ مِنْ A1.', 'Demo ini menyediakan tiga wahdah A1.', 'This demo includes three A1 units.')} /></p>
      <Button className="full-width" onClick={onStart}><Text force text={l('اِبْدَأْ دُرُوسَ A1', 'Mulai belajar A1', 'Start A1 lessons')} /></Button>
    </> : <>
      <p className="center" dir="ltr">A{attempt.level} · {attempt.cursor + 1}/{questions.length}</p>
      <h2><Text force text={question.prompt} /></h2>
      {question.kind === 'order' && <p lang={profile.language} dir="ltr">{question.text?.[profile.language]}</p>}
      <QuestionBody key={question.id} question={question} quiz locked={false} hinted={false} onAnswer={submit} onStudy={() => {}} />
    </>}
    <button className="text-button" onClick={onBack}><Text force text={l('رُجُوعٌ', 'Kembali ke pilihan awal', 'Back to start options')} /></button>
  </>;
}
