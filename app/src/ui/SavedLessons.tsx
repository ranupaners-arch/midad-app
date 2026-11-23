import { Link } from 'react-router-dom';
import { l } from '../domain/content';
import { savedLessons } from '../domain/checkpoints';
import { useProfile } from '../store';
import { Text, Tr } from './Common';
import { Icon } from './Icon';

type Checkpoint = ReturnType<typeof savedLessons>[number];
function ResumeCard({ checkpoint: { unit, activity, session, position, total } }: { checkpoint: Checkpoint }) {
  return <Link className="resume-card" to={`/unit/${unit.id}/lesson/${activity.id}`}>
    <span className="resume-icon"><Icon name="repeat" /></span>
    <span className="resume-copy"><b>{unit.title.ar} · {activity.title.ar}</b><span className="small-label">{activity.session && <>الْجَلْسَةُ <span className="number">{activity.session}/3</span> · </>}السُّؤَالُ <span className="number">{position}/{total}</span>{session.answers[session.cursor] && ' · إِجَابَتُكَ مَحْفُوظَةٌ'}</span><Tr text={l('', 'Lanjutkan dari posisi terakhir', 'Continue where you left off')} /></span>
  </Link>;
}

export default function SavedLessons() {
  const { profile } = useProfile(), checkpoints = savedLessons(profile);
  if (!checkpoints.length) return null;
  return <section className="saved-lessons" aria-labelledby="saved-lessons-title"><h2 id="saved-lessons-title"><Text text={l('تَابِعْ مِنْ حَيْثُ تَوَقَّفْتَ', 'Lanjutkan belajarmu', 'Continue learning')} /></h2><ResumeCard checkpoint={checkpoints[0]} />
    {checkpoints.length > 1 && <details className="other-lessons"><summary><span>دُرُوسٌ أُخْرَى مَحْفُوظَةٌ</span><span className="number">{checkpoints.length - 1}</span><Tr text={l('', 'Latihan tersimpan lainnya', 'Other saved lessons')} /></summary><ul role="list">{checkpoints.slice(1).map(checkpoint => <li key={`${checkpoint.unit.id}:${checkpoint.activity.id}`}><ResumeCard checkpoint={checkpoint} /></li>)}</ul></details>}
  </section>;
}
