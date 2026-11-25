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
    <div className="page-heading"><div><h1 id="main-title" tabIndex={-1}><Text text={l('رِحْلَتِي', 'Perjalananku', 'My journey')} /></h1></div><button className="map-button" type="button" aria-label="خَرِيطَةُ الرِّحْلَةِ" onClick={() => setRoadmap(true)}><Icon name="globe" /><span>الْخَرِيطَةُ</span></button></div>
    <section className="journey-hero" aria-labelledby="region-title">
      <div className="hero-copy">
        <span className="region-kicker" lang="en" dir="ltr">A1</span>
        <h2 id="region-title">{routes.routes.id[0].region.ar}</h2>
        <span className="route-label" dir="ltr">Jakarta → Muscat</span>
      </div>
      <Vehicle className="hero-vehicle" />
    </section>
    {demoCompleted(profile) && <Link className="demo-complete-card" to="/summary"><Icon name="trophy" /><span><b><Text text={l('حَصِيلَةُ رِحْلَتِي', 'Ringkasan perjalanan', 'Journey summary')} /></b></span></Link>}
    <SavedLessons />
    {(pendingReviews(profile).length > 0 || profile.reviewSession) && <Link className="review-card" to="/review"><span className="resume-icon"><Icon name="book" /></span><span><b>{profile.reviewSession ? 'تَابِعِ الْمُرَاجَعَةَ' : 'رَاجِعْ مَا فَاتَكَ'}</b><Tr text={l('', 'Jawaban salah dan latihan bicara yang tersimpan', 'Saved mistakes and speaking practice')} /></span><span className="number">{pendingReviews(profile).length}</span></Link>}
    <div className="section-heading"><h2><Text text={l('مَحَطَّاتُكَ الْأُولَى', 'Pelabuhan pertamamu', 'Your first ports')} /></h2><span className="small-label number" dir="ltr">{profile.rewardedUnits.length} / 3</span></div>
    <ol className="unit-path" role="list">{unitsFor(profile).map((unit, i) => {
      const unlocked = isUnitUnlocked(profile, unit.id), done = profile.rewardedUnits.includes(unit.id);
      const count = activities(unit).filter(a => profile.completedActivities.includes(activityKey(unit.id, a.id))).length;
      const content = <><span className={`unit-node ${done ? 'done' : unlocked ? 'current' : 'locked'}`}><Icon name={done ? 'check' : unlocked ? (i === 0 ? 'greeting' : i === 1 ? 'person' : 'book') : 'lock'} /></span><span className="unit-card"><span className="unit-meta"><span>الْوَحْدَةُ {['الْأُولَى', 'الثَّانِيَةُ', 'الثَّالِثَةُ'][i]}</span><span className="port-name" lang="en" dir="ltr">{routes.routes.id[0].ports[i]}</span></span><strong>{unit.title.ar}</strong><Tr text={unit.title} />{unlocked ? <><Progress value={count / 8 * 100} label={`تَقَدُّمُ الْوَحْدَةِ ${unit.id}`} /><span className="unit-action">{done ? 'مُرَاجَعَةٌ' : count ? 'مُتَابَعَة' : 'اِبْدَأْ'}<span className="number">{count}/8</span></span></> : <span className="locked-caption">أَكْمِلِ الْوَحْدَةَ السَّابِقَةَ</span>}</span></>;
      return <li key={unit.id} className={unlocked ? '' : 'is-locked'}>{unlocked ? <Link to={`/unit/${unit.id}`} className="unit-link">{content}</Link> : <div className="unit-link" aria-disabled="true">{content}</div>}</li>;
    })}<li className="coming-next"><span className="unit-node locked"><Icon name="lock" /></span><span><b>{curriculum.wahdah[3].title}</b><span className="small-label">قَرِيبًا · الْوَحْدَةُ الرَّابِعَةُ</span></span></li></ol>
    <Dialog open={roadmap} onClose={() => setRoadmap(false)} title="خَرِيطَةُ الرِّحْلَةِ"><p className="muted"><Text text={l('أَرْبَعُ مَرَاحِلَ، وَأَرْبَعٌ وَسِتُّونَ مَحَطَّةً. الْوَحَدَاتُ الثَّلَاثُ الْأُولَى مُتَاحَةٌ الْآنَ.', 'Rencana perjalanan: 64 pelabuhan, A1–B2. Tiga wahdah pertama tersedia dalam demo ini.', 'The journey ahead: 64 ports, A1–B2. The first three units are available in this demo.')} force /></p><ol className="roadmap-list">{routes.routes.id.map((leg, i) => <li key={leg.levels[0]}><span className={i === 0 ? 'roadmap-dot active' : 'roadmap-dot'} /><div><b>{leg.region.ar}</b><span className="translation" lang={profile.language} dir="ltr">{leg.region[profile.language]}</span><span className="small-label">{leg.levels[0]}–{leg.levels[1]} · {['A1', 'A2', 'B1', 'B2'][leg.marhalah - 1]} {i > 0 && '· قَادِمٌ'}</span></div>{i === 2 && <span className="arrival-badge">بَوَّابَةُ الْعَالَمِ الْعَرَبِيِّ</span>}</li>)}</ol><details className="journey-story"><summary><Text text={l('حِكَايَةُ الرِّحْلَةِ', 'Kisah perjalanan', 'Journey story')} force /></summary><p><Text text={l('مِنْ قَطْرَةِ حِبْرٍ، تَبْدَأُ حِكَايَةٌ.', 'Kisah ini dimulai dari setetes tinta, di Nusantara.', 'The story begins with a drop of ink, in Nusantara.')} force /></p></details><Button className="full-width" onClick={() => setRoadmap(false)}>فَهِمْتُ</Button></Dialog>
  </div>;
}
