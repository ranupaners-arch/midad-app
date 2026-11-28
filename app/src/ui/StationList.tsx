import { Link } from 'react-router-dom';
import { Progress, Tr } from './Common';
import { LOCKED_HINT, useStations } from './stations';
import type { Station } from './stations';

/** Ringkasan satu wahdah: judul, pelabuhan, progres, dan tombol. Dipakai di panel peta dan di daftar cadangan. */
export function StationSummary({ station: s, headingId }: { station: Station; headingId?: string }) {
  return <>
    <span className="station-meta"><span>الْوَحْدَةُ {s.ordinal}</span><span className="port-name" lang="en" dir="ltr">{s.port}</span></span>
    <strong id={headingId} className="station-title" lang="ar">{s.unit.title.ar}</strong>
    <Tr text={s.unit.title} />
    {s.unlocked
      ? <>
        <Progress value={s.count / s.total * 100} label={`تَقَدُّمُ الْوَحْدَةِ ${s.unit.id}`} />
        <Link className="md-btn unit-link station-go" to={`/unit/${s.unit.id}`}>{s.action}<span className="number" dir="ltr">{s.count}/{s.total}</span></Link>
      </>
      : <span className="locked-caption" lang="ar">{LOCKED_HINT}</span>}
  </>;
}

/** Daftar cadangan (tanpa peta): dipakai saat peta masih dimuat atau kanvas tidak tersedia. */
export default function StationList() {
  const stations = useStations();
  return <ol className="station-list" role="list">{stations.map(s => <li key={s.unit.id} className={`station-row ${s.state}`}><StationSummary station={s} /></li>)}</ol>;
}
