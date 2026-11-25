import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useProfile } from './store';
import { localDay, streak } from './domain/progress';
import { activities, l, questions, unitsFor } from './domain/content';
import { Icon, Logo } from './ui/Icon';
import { Mascot, Text, Progress } from './ui/Common';
import Welcome from './screens/Welcome';
import Journey from './screens/Journey';
import UnitScreen from './screens/Unit';
import LessonRoute from './screens/Lesson';
import Wardrobe from './screens/Wardrobe';
import ProfileScreen from './screens/Profile';
import Review from './screens/Review';
import { pendingReviews, questionSource } from './domain/reviews';
import AppAvailability from './ui/AppAvailability';
import Vocabulary from './screens/Vocabulary';
import Summary from './screens/Summary';

const navigation = [
  { to: '/', icon: 'route', label: l('رِحْلَتِي', 'Perjalananku', 'My journey') },
  { to: '/wardrobe', icon: 'wardrobe', label: l('رَفِيقِي', 'Teman belajarku', 'My companion') },
  { to: '/profile', icon: 'person', label: l('حِسَابِي', 'Profil dan pengaturan', 'Profile and settings') },
];
export default function App() {
  const { profile, update, storageError } = useProfile();
  const location = useLocation();
  const reviewing = location.pathname === '/review';
  const lesson = location.pathname.includes('/lesson/') || reviewing && !!profile.reviewSession;
  const activeUnit = unitsFor(profile).find(u => u.id === profile.session?.unitId);
  const activeActivity = activeUnit && activities(activeUnit).find(a => a.id === profile.session?.activityId);
  const activeQuestion = activeUnit && activeActivity && questions(activeUnit, activeActivity, profile.language, profile.session!.questionVersion ?? 1)[profile.session!.cursor];
  const reviewQuestion = profile.reviewSession && questionSource(profile.reviewSession.questionIds[profile.reviewSession.cursor], profile.language)?.question;
  const translationLocked = reviewing ? !!reviewQuestion?.meaningTest : lesson && (activeActivity?.kind === 'quiz' || !!activeQuestion?.meaningTest);
  useEffect(() => {
    document.title = `مِدَاد — ${location.pathname === '/summary' ? 'حَصِيلَةُ رِحْلَتِي' : location.pathname.includes('wardrobe') ? 'رَفِيقِي' : location.pathname.includes('profile') ? 'حِسَابِي' : location.pathname.includes('unit') ? 'تَعَلَّمِ الْعَرَبِيَّةَ' : reviewing ? 'الْمُرَاجَعَةُ' : 'رِحْلَتِي'}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector<HTMLElement>('#main-title')?.focus({ preventScroll: true });
  }, [location.pathname]);
  const count = Object.values(profile.mastery).filter(n => n >= 3).length;
  const total = unitsFor(profile).reduce((n, u) => n + u.words.length, 0);
  return <>
    <a className="skip-link" href="#main-title" onClick={event => { event.preventDefault(); document.getElementById('main-title')?.focus(); }}>اِنْتَقِلْ إِلَى الْمُحْتَوَى</a>
    <AppAvailability learning={lesson} />
    {storageError && <div className="storage-warning" role="status"><Text text={l('تَعَذَّرَ حِفْظُ التَّقَدُّمِ عَلَى هَذَا الْجِهَازِ. سَيَضِيعُ التَّقَدُّمُ الْجَدِيدُ عِنْدَ إِغْلَاقِ الصَّفْحَةِ.', 'Penyimpanan tidak tersedia atau datanya tidak terbaca. Progres baru hanya bertahan selama halaman terbuka. Data lama tidak ditimpa.', 'Storage is unavailable or unreadable. New progress lasts only while this page is open. Existing data is not overwritten.')} force /></div>}
    {!profile.onboarded ? <Routes><Route path="/welcome" element={<Welcome />} /><Route path="*" element={<Navigate to="/welcome" replace />} /></Routes> : <div className={`app-layout ${lesson ? 'in-lesson' : ''}`}>
      <aside className="sidebar">
        <NavLink to="/" className="brand-link" aria-label="مِدَاد — رِحْلَتِي"><Logo /></NavLink>
        <p className="sidebar-caption">قَطْرَةٌ كُلَّ يَوْمٍ، عِلْمٌ مَدَى الْحَيَاةِ</p>
        <nav aria-label="التَّنَقُّلُ الرَّئِيسِيُّ" className="desktop-nav">{navigation.map(n => <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon name={n.icon} /><span><Text text={n.label} /></span></NavLink>)}</nav>
        <div className="sidebar-bottom"><Mascot className="sidebar-mascot" decorative /><p>رِحْلَةُ أَلْفِ كَلِمَةٍ<br />تَبْدَأُ بِكَلِمَةٍ.</p><span className="small-label" lang="en" dir="ltr">MIDAD · A LITTLE, EVERY DAY</span></div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <NavLink to="/" className="mobile-logo" aria-label="مِدَاد"><Logo /></NavLink>
          <div className="stats-row" role="group" aria-label="إِحْصَائِيَّاتُكَ">
            <span className="stat stat-streak" aria-label={`سِلْسِلَةٌ: ${streak(profile)} أَيَّامٍ`}><Icon name="lantern" /><b className="number">{streak(profile)}</b></span>
            <span className="stat stat-dates" aria-label={`تَمْرٌ: ${profile.dates}`}><Icon name="dates" /><b className="number">{profile.dates}</b></span>
            <span className="stat stat-xp" aria-label={`نِقَاطُ الْخِبْرَةِ: ${profile.xp}`}><Icon name="star" /><b className="number">{profile.xp}</b></span>
          </div>
          <button className={`icon-button translation-toggle ${profile.translation ? 'selected' : ''}`} type="button" aria-label={translationLocked ? 'التَّرْجَمَةُ مُقْفَلَةٌ فِي هَذَا السُّؤَالِ' : 'تَرْجَمَة'} aria-pressed={profile.translation} disabled={translationLocked} onClick={() => update(p => ({ ...p, translation: !p.translation }))}><Icon name="translate" /><span>تَرْجَمَة</span></button>
        </header>
        <main id="main-content"><Routes>
          <Route path="/" element={<Journey />} />
          <Route path="/unit/:unitId" element={<UnitScreen />} />
          <Route path="/unit/:unitId/words" element={<Vocabulary />} />
          <Route path="/unit/:unitId/lesson/:activityId" element={<LessonRoute />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/review" element={<Review />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes></main>
        <nav className="mobile-nav" aria-label="التَّنَقُّلُ عَلَى الْهَاتِفِ">{navigation.map(n => <NavLink to={n.to} end={n.to === '/'} key={n.to} className={({ isActive }) => isActive ? 'active' : ''}><Icon name={n.icon} /><span>{n.label.ar}</span></NavLink>)}</nav>
      </div>
      <aside className="journey-aside">
        <div className="aside-card"><div className="aside-title"><span className="mini-badge"><Icon name="book" /></span><h2>قَطَرَاتُ الْمَعْرِفَةِ</h2></div><p className="mastery-count"><b className="number">{count}</b><span> / <span className="number">{total}</span></span></p><p className="muted"><Text text={l('كَلِمَةً أَتْقَنْتَهَا', 'Kosakata yang sudah dikuasai', 'Vocabulary entries mastered')} /></p><Progress value={count / total * 100} label="الْمُفْرَدَاتُ الْمَحْفُوظَةُ" /></div>
        <div className="aside-card daily-card"><Icon name="lantern" /><h2>{profile.activityDays.includes(localDay()) ? 'فَانُوسُكَ مُضِيءٌ الْيَوْمَ!' : 'أَضِئْ فَانُوسَكَ الْيَوْمَ'}</h2><p className="muted"><Text text={l('بِضْعُ دَقَائِقَ كُلَّ يَوْمٍ تَصْنَعُ فَرْقًا.', 'Beberapa menit setiap hari membuat perbedaan.', 'A few minutes every day make a difference.')} /></p></div>
        {pendingReviews(profile).length > 0 && <NavLink className="aside-review-link" to="/review"><Icon name="repeat" /> الْمُرَاجَعَةُ <span className="number">{pendingReviews(profile).length}</span></NavLink>}
        <p className="aside-footnote"><Icon name="drop" /> تَعَلَّمِ الْعَرَبِيَّةَ قَطْرَةً قَطْرَةً</p>
      </aside>
    </div>}
  </>;
}
