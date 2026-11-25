import { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../design-system/assets/rihlah/routes.json';
import curriculum from '../../../design-system/assets/rihlah/curriculum.json';
import { useProfile } from '../store';
import { activities, activityKey, l, unitsFor } from '../domain/content';
import { isUnitUnlocked } from '../domain/progress';
import { Button, Dialog, Progress, Text, Tr, Vehicle } from '../ui/Common';
import { Icon } from '../ui/Icon';
import { pendingReviews } from '../domain/reviews';
import { demoCompleted } from '../domain/checkpoints';
import SavedLessons from '../ui/SavedLessons';

export default function Journey() {
  const { profile } = useProfile();
  const [roadmap, setRoadmap] = useState(false);
  return <div className="screen journey-screen">
    <div className="page-heading"><div><span className="eyebrow">بِسْمِ اللَّهِ، نُبْحِرُ</span><h1 id="main-title" tabIndex={-1}><Text text={l('رِحْلَتِي', 'Perjalananku', 'My journey')} /></h1></div><button className="map-button" type="button" aria-label="خَرِيطَةُ الرِّحْلَةِ" onClick={() => setRoadmap(true)}><Icon name="globe" /><span>الْخَرِيطَةُ</span></button></div>
    <section className="journey-hero" aria-labelledby="region-title"><div className="hero-copy"><span className="region-kicker">الْمَرْحَلَةُ الْأُولَى <span lang="en" dir="ltr">A1</span></span><h2 id="region-title">نُوسَانْتَارَا</h2><p>مِنْ هُنَا تَبْدَأُ الْحِكَايَةُ.</p><Tr text={l('', 'Dari sini, kisahmu dimulai.', 'This is where your story begins.')} /><span className="route-label"><span /> جَاكَرْتَا <span className="route-line" /> عُمَانُ</span></div><Vehicle className="hero-vehicle" /><svg className="hero-waves" viewBox="0 0 500 60" preserveAspectRatio="none" aria-hidden="true"><path d="M-30 26Q30 0 90 26t120 0 120 0 120 0 120 0v60H-30Z" fill="currentColor"/><path d="M-30 45Q30 19 90 45t120 0 120 0 120 0 120 0" fill="none" stroke="currentColor" strokeWidth="2"/></svg></section>
    {demoCompleted(profile) && <Link className="demo-complete-card" to="/summary"><Icon name="trophy" /><span><b><Text text={l('أَكْمَلْتَ مَحَطَّاتِكَ الثَّلَاثَ!', 'Tiga pelabuhan pertamamu selesai!', 'Your first three ports are complete!')} /></b><span className="small-label">شَاهِدْ حَصِيلَةَ رِحْلَتِكَ</span></span></Link>}
    <SavedLessons />
    {(pendingReviews(profile).length > 0 || profile.reviewSession) && <Link className="review-card" to="/review"><span className="resume-icon"><Icon name="book" /></span><span><b>{profile.reviewSession ? 'تَابِعِ الْمُرَاجَعَةَ' : 'رَاجِعْ مَا فَاتَكَ'}</b><Tr text={l('', 'Jawaban salah dan latihan bicara yang tersimpan', 'Saved mistakes and speaking practice')} /></span><span className="number">{pendingReviews(profile).length}</span></Link>}
    <div className="section-heading"><h2><Text text={l('مَحَطَّاتُكَ الْأُولَى', 'Pelabuhan pertamamu', 'Your first ports')} /></h2><span className="small-label number" dir="ltr">{profile.rewardedUnits.length} / 3</span></div>
    <ol className="unit-path" role="list">{unitsFor(profile).map((unit, i) => {
      const unlocked = isUnitUnlocked(profile, unit.id), done = profile.rewardedUnits.includes(unit.id);
      const count = activities(unit).filter(a => profile.completedActivities.includes(activityKey(unit.id, a.id))).length;
      const content = <><span className={`unit-node ${done ? 'done' : unlocked ? 'current' : 'locked'}`}><Icon name={done ? 'check' : unlocked ? (i === 0 ? 'greeting' : i === 1 ? 'person' : 'book') : 'lock'} /></span><span className="unit-card"><span className="unit-meta"><span>الْوَحْدَةُ {['الْأُولَى', 'الثَّانِيَةُ', 'الثَّالِثَةُ'][i]}</span><span className="port-name" lang="en" dir="ltr">{routes.routes.id[0].ports[i]}</span></span><strong>{unit.title.ar}</strong><Tr text={unit.title} /><span className="unit-card-description">{unit.subtitle.ar}</span>{unlocked ? <><Progress value={count / 8 * 100} label={`تَقَدُّمُ الْوَحْدَةِ ${unit.id}`} /><span className="unit-action">{done ? 'مُرَاجَعَةٌ' : count ? 'مُتَابَعَة' : 'اِبْدَأْ'}<span className="number">{count}/8</span></span></> : <span className="locked-caption">أَكْمِلِ الْوَحْدَةَ السَّابِقَةَ</span>}</span></>;
      return <li key={unit.id} className={unlocked ? '' : 'is-locked'}>{unlocked ? <Link to={`/unit/${unit.id}`} className="unit-link">{content}</Link> : <div className="unit-link" aria-disabled="true">{content}</div>}</li>;
    })}<li className="coming-next"><span className="unit-node locked"><Icon name="lock" /></span><span><b>{curriculum.wahdah[3].title}</b><span className="small-label">قَرِيبًا · الْوَحْدَةُ الرَّابِعَةُ</span></span></li></ol>
    <div className="journey-note"><Icon name="drop" /><Text text={l('لَا تَسْتَعْجِلْ. كُلُّ قَطْرَةٍ تُقَرِّبُكَ.', 'Tak perlu terburu-buru. Setiap tetes membawamu lebih dekat.', 'Take your time. Every drop brings you closer.')} /></div>
    <Dialog open={roadmap} onClose={() => setRoadmap(false)} title="خَرِيطَةُ الرِّحْلَةِ"><p className="muted"><Text text={l('أَرْبَعُ مَرَاحِلَ، وَأَرْبَعٌ وَسِتُّونَ مَحَطَّةً. الْوَحَدَاتُ الثَّلَاثُ الْأُولَى مُتَاحَةٌ الْآنَ.', 'Rencana perjalanan: 64 pelabuhan, A1–B2. Tiga wahdah pertama tersedia dalam demo ini.', 'The journey ahead: 64 ports, A1–B2. The first three units are available in this demo.')} force /></p><ol className="roadmap-list">{routes.routes.id.map((leg, i) => <li key={leg.levels[0]}><span className={i === 0 ? 'roadmap-dot active' : 'roadmap-dot'} /><div><b>{leg.region.ar}</b><span className="translation" lang={profile.language} dir="ltr">{leg.region[profile.language]}</span><span className="small-label">{leg.levels[0]}–{leg.levels[1]} · {['A1', 'A2', 'B1', 'B2'][leg.marhalah - 1]} {i > 0 && '· قَادِمٌ'}</span></div>{i === 2 && <span className="arrival-badge">بَوَّابَةُ الْعَالَمِ الْعَرَبِيِّ</span>}</li>)}</ol><Button className="full-width" onClick={() => setRoadmap(false)}>فَهِمْتُ</Button></Dialog>
  </div>;
}
