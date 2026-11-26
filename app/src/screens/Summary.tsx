import { Link, Navigate } from 'react-router-dom';
import { demoCompleted } from '../domain/checkpoints';
import { l, unitsFor } from '../domain/content';
import { masteryPct } from '../domain/progress';
import { pendingReviews } from '../domain/reviews';
import { useProfile } from '../store';
import { Mascot, Progress, Text } from '../ui/Common';
import { Icon } from '../ui/Icon';

export default function Summary() {
  const { profile } = useProfile();
  if (!demoCompleted(profile)) return <Navigate to="/" replace />;
  const total = unitsFor(profile).reduce((sum, unit) => sum + unit.words.length, 0);
  const mastered = unitsFor(profile).flatMap(unit => unit.words).filter(word => (profile.mastery[word.idKey] ?? 0) >= 3).length;
  const reviews = pendingReviews(profile).length, remainingUnit = unitsFor(profile).find(unit => masteryPct(profile, unit) < 100);
  return <div className="screen summary-screen"><Link className="back-link" to="/"><Icon name="back" /> رِحْلَتِي</Link>
    <div className="summary-hero"><Mascot emote="cheer" decorative /><h1 id="main-title" tabIndex={-1}><Text text={l('حَصِيلَةُ رِحْلَتِي', 'Hasil perjalananmu', 'Your journey so far')} /></h1></div>
    <dl className="summary-stats"><div><dt>وَحَدَاتٌ مُكْتَمِلَةٌ</dt><dd className="number">3/3</dd></div><div><dt>كَلِمَاتٌ مَحْفُوظَةٌ</dt><dd className="number">{mastered}/{total}</dd></div><div><dt>لِلْمُرَاجَعَةِ</dt><dd className="number">{reviews}</dd></div></dl>
    <section aria-labelledby="summary-units-title"><h2 id="summary-units-title"><Text text={l('نَتَائِجُ الْوَحَدَاتِ', 'Hasil per wahdah', 'Unit results')} /></h2><ol className="summary-units" role="list">{unitsFor(profile).map(unit => {
      const count = unit.words.filter(word => (profile.mastery[word.idKey] ?? 0) >= 3).length;
      return <li key={unit.id}><div className="summary-unit-title"><span className="summary-unit-icon"><Icon name="check" /></span><h3><Text text={unit.title} /></h3></div><dl className="summary-unit-facts"><div><dt>أَفْضَلُ نَتِيجَةٍ</dt><dd className="number">{profile.bestScores[unit.id] ?? 0}%</dd></div><div><dt>كَلِمَاتٌ مَحْفُوظَةٌ</dt><dd className="number">{count}/{unit.words.length}</dd></div></dl><Progress value={masteryPct(profile, unit)} label={`إِتْقَانُ مُفْرَدَاتِ ${unit.title.ar}`} /><Link className="summary-unit-link" to={`/unit/${unit.id}`}><Text text={l('رَاجِعْ هَذِهِ الْوَحْدَةَ', 'Ulangi wahdah ini', 'Review this unit')} /></Link></li>;
    })}</ol></section>
    {profile.ownedSkins.includes('sailor') && <section className="summary-gift" aria-labelledby="summary-gift-title"><Icon name="wardrobe" /><div><h2 id="summary-gift-title"><Text text={l('لِبَاسُ الْبَحَّارِ لَكَ', 'Pakaian pelaut sudah menjadi milikmu', 'The sailor outfit is yours')} /></h2><Link className="md-btn md-btn--secondary" to="/wardrobe">إِلَى رَفِيقِي</Link></div></section>}
    <nav className="summary-actions" aria-label="خُطْوَتُكَ التَّالِيَةُ">{(reviews > 0 || profile.reviewSession) && <Link className="md-btn full-width" to="/review"><span><Text text={l('رَاجِعْ مَا فَاتَكَ', 'Latih bagian yang terlewat', 'Practice what you missed')} /></span></Link>}{remainingUnit && <Link className="md-btn md-btn--secondary full-width" to={`/unit/${remainingUnit.id}/words`}><span><Text text={l('أَكْمِلْ إِتْقَانَ الْمُفْرَدَاتِ', 'Lengkapi penguasaan kosakatamu', 'Keep mastering your vocabulary')} /></span></Link>}<Link className="md-btn md-btn--secondary full-width" to="/">إِلَى رِحْلَتِي</Link></nav>
  </div>;
}
