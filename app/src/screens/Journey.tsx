import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../design-system/assets/rihlah/routes.json';
import curriculum from '../../../design-system/assets/rihlah/curriculum.json';
import { useProfile } from '../store';
import { l } from '../domain/content';
import { Text, Tr, Vehicle } from '../ui/Common';
import { Icon } from '../ui/Icon';
import { pendingReviews } from '../domain/reviews';
import { demoCompleted } from '../domain/checkpoints';
import SavedLessons from '../ui/SavedLessons';
import StationList from '../ui/StationList';
import '../stations.css';

const StationMap = lazy(() => import('../ui/StationMap'));

export default function Journey() {
  const { profile } = useProfile();
  return <div className="screen journey-screen">
    <div className="page-heading"><div><h1 id="main-title" tabIndex={-1}><Text text={l('رِحْلَتِي', 'Perjalananku', 'My journey')} /></h1></div><Link className="map-button" to="/map" aria-label="خَرِيطَةُ الرِّحْلَةِ"><Icon name="globe" /><span>الْخَرِيطَةُ</span></Link></div>
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
    <Suspense fallback={<StationList />}><StationMap /></Suspense>
    <div className="station-next"><Icon name="lock" /><span><b>{curriculum.wahdah[3].title}</b><span className="small-label">قَرِيبًا · الْوَحْدَةُ الرَّابِعَةُ</span></span></div>
  </div>;
}
