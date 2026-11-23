import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { activities, activityKey, l, UNITS } from '../domain/content';
import { isActivityUnlocked, isUnitUnlocked, lessonCheckpoint, masteryPct, openChest } from '../domain/progress';
import { useProfile } from '../store';
import { Button, Dialog, Mascot, Progress, Text, Tr } from '../ui/Common';
import { Icon } from '../ui/Icon';

export default function UnitScreen() {
  const { unitId } = useParams(), { profile, update } = useProfile();
  const [chest, setChest] = useState(false);
  const unit = UNITS.find(u => u.id === Number(unitId));
  if (!unit || !isUnitUnlocked(profile, unit.id)) return <Navigate to="/" replace />;
  const list = activities(unit), pct = masteryPct(profile, unit);
  const chestUnlocked = profile.completedActivities.includes(activityKey(unit.id, 'dialogue'));
  const icons = { vocabulary: 'book', pattern: 'pen', dialogue: 'greeting', reading: 'book', practice: 'compass', quiz: 'trophy' };
  return <div className="screen unit-screen">
    <Link to="/" className="back-link"><Icon name="back" /> رِحْلَتِي</Link>
    <div className="unit-screen-heading"><span className="eyebrow">الْوَحْدَةُ <span className="number">{unit.id}</span> · <span lang="en" dir="ltr">A1</span></span><h1 id="main-title" tabIndex={-1}><Text text={unit.title} /></h1><p className="muted"><Text text={unit.subtitle} /></p></div>
    <section className="mastery-card" aria-label="إِتْقَانُ الْمُفْرَدَاتِ"><Mascot emote={pct >= 80 ? 'cheer' : 'think'} decorative /><div><b><Text text={l('قَطْرَةً قَطْرَةً، تَتَقَدَّمُ', 'Sedikit demi sedikit, kamu bertumbuh', 'Little by little, you grow')} /></b><span className="mastery-detail"><span className="number">{unit.words.filter(w => (profile.mastery[w.idKey] ?? 0) >= 3).length}/{unit.words.length}</span> كَلِمَةً مَحْفُوظَةً</span><Progress value={pct} label="نِسْبَةُ الْمُفْرَدَاتِ الْمَحْفُوظَةِ" /></div><span className="percentage number">{pct}%</span></section>
    <Link className="vocabulary-open-link" to={`/unit/${unit.id}/words`}><Icon name="book" /><span><Text text={l('مُفْرَدَاتُ هَذِهِ الْوَحْدَةِ', 'Kosakata dan penguasaan wahdah ini', 'This unit’s vocabulary and mastery')} /></span><span className="number">{unit.words.length}</span></Link>
    <ol className="activity-list" role="list">{list.map((activity, index) => {
      const unlocked = isActivityUnlocked(profile, unit, activity.id), done = profile.completedActivities.includes(activityKey(unit.id, activity.id)), checkpoint = lessonCheckpoint(profile, unit.id, activity.id);
      const inner = <><span className={`activity-icon ${done ? 'done' : ''}`}><Icon name={checkpoint ? 'repeat' : done ? 'check' : unlocked ? icons[activity.kind] : 'lock'} /></span><span className="activity-info"><b>{activity.title.ar}{activity.session && <span className="session-label"> · {['الْجَلْسَةُ الْأُولَى', 'الْجَلْسَةُ الثَّانِيَةُ', 'الْجَلْسَةُ الثَّالِثَةُ'][activity.session - 1]}</span>}</b><Tr text={activity.title} small /><span className="small-label">{activity.words ? `${activity.words.length} كَلِمَاتٍ · تَعَلُّمٌ وَمُرَاجَعَةٌ` : activity.kind === 'quiz' ? '١٠ أَسْئِلَةٍ · النَّجَاحُ مِنْ ٨٠٪' : activity.kind === 'dialogue' ? 'اُنْظُرْ، وَاسْتَمِعْ، وَأَعِدْ' : activity.kind === 'reading' ? 'اِقْرَأْ وَافْهَمْ' : 'خُطْوَةٌ نَحْوَ الْإِتْقَانِ'}</span>{checkpoint && <span className="checkpoint-note">تَقَدُّمُكَ مَحْفُوظٌ</span>}</span><span className="activity-state">{checkpoint ? 'مُتَابَعَة' : done ? 'مُرَاجَعَةٌ' : unlocked ? 'اِبْدَأْ' : 'مُقْفَلٌ'}</span></>;
      return <li key={activity.id}>{unlocked ? <Link className="activity-card" to={`/unit/${unit.id}/lesson/${activity.id}`}>{inner}</Link> : <div className="activity-card locked" aria-disabled="true">{inner}</div>}
        {activity.kind === 'dialogue' && <button className={`chest-card ${profile.chestRewards[unit.id] ? 'claimed' : ''}`} disabled={!chestUnlocked} onClick={() => { update(p => openChest(p, unit.id)); setChest(true); }}><Icon name={chestUnlocked ? 'chest' : 'lock'} /><span><b>{profile.chestRewards[unit.id] ? 'كَنْزُكَ' : 'كَنْزٌ فِي الطَّرِيقِ'}</b><span className="small-label">{chestUnlocked ? profile.chestRewards[unit.id] ? 'تَمَّ فَتْحُهُ' : 'اِفْتَحْ هَدِيَّتَكَ' : 'بَعْدَ إِكْمَالِ الْحِوَارِ'}</span></span><Icon name="star" /></button>}
        {index === list.length - 2 && <p className="quiz-requirement"><Text text={l('أَكْمِلِ الْخُطُوَاتِ، وَاحْفَظْ ٨٠٪ مِنَ الْمُفْرَدَاتِ لِفَتْحِ الْاِخْتِبَارِ. الْكَلِمَةُ تَحْتَاجُ ثَلَاثَ إِجَابَاتٍ صَحِيحَةٍ.', 'Selesaikan semua langkah dan kuasai 80% kosakata untuk membuka kuis. Setiap kata perlu tiga jawaban benar. Ulangi sesi kosakata untuk memperbaiki kata yang terlewat.', 'Finish all steps and master 80% of the vocabulary to unlock the quiz. Each word needs three correct answers. Revisit vocabulary sessions to review missed words.')} /></p>}
      </li>;
    })}</ol>
    <Dialog open={chest} title="وَجَدْتَ كَنْزًا!" onClose={() => setChest(false)}><Mascot emote="cheer" className="reward-mascot" decorative /><p className="center"><Text text={l('هَدِيَّةٌ صَغِيرَةٌ لِرِحْلَتِكَ: عَشْرُ تَمَرَاتٍ وَأَدَاةٌ لِرَفِيقِكَ.', 'Hadiah peti: 10 kurma dan satu aksesori teman belajarmu. Hadiah tersimpan dan hanya diberikan sekali.', 'Your chest reward: 10 dates and an accessory for your companion. Saved and awarded only once.')} force /></p><div className="reward-item"><Icon name="chest" /><b>{unit.id === 1 ? 'فَانُوسٌ' : unit.id === 2 ? 'طَاقِيَّةٌ' : 'وِشَاحٌ'}</b></div><Link className="md-btn full-width" to="/wardrobe">جَرِّبْهُ</Link><Button variant="secondary" className="full-width" onClick={() => setChest(false)}>مُتَابَعَة</Button></Dialog>
  </div>;
}
