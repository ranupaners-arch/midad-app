import { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../design-system/assets/rihlah/routes.json';
import { MidadVehicles } from '../../../design-system/assets/maskot/vehicles.mjs';
import oman from '../domain/omanTexts.json';
import { Button, Text, Tr, Vehicle } from '../ui/Common';
import LevelUpTravel from '../ui/LevelUpTravel';
import '../demoOman.css';

/**
 * PRATINJAU perjalanan ke Oman (halaman demo, #/demo/oman). Hanya MEMUTAR animasi perjalanan (LevelUpTravel, kapal baghlah, pelabuhan Muscat) dan
 * menampilkan kartu wilayah Oman. Stateless: tidak memanggil update(), tidak menulis localStorage, tidak memberi XP/kurma, tidak membuka level 17
 * dan tidak membuka oryx/dishdasha. Semua teks Arab dari Shaharil (ui-strings.json lewat omanTexts.json), nama wilayah dan kendaraan dari data app.
 * Lencana "Demo" ada di tajuk; keterangan pratinjau tepat di bawah animasi supaya spanduk kedatangan terlihat tanpa gulir di HP.
 */
const route = routes.routes.id[2];
export default function DemoOman() {
  const [run, setRun] = useState(0);
  const boat = MidadVehicles.V.baghlah.name;
  return <div className="screen demo-oman" data-testid="demo-oman">
    <div className="demo-oman-head">
      <span className="oman-demo-badge" lang="en" dir="ltr">Demo</span>
      <h1 id="main-title" tabIndex={-1} lang="ar">{route.region.ar}</h1>
    </div>
    <LevelUpTravel key={run} level={0} vehicle="baghlah" port="Muscat" banner={oman.banner} showLevel={false} />
    <p className="demo-oman-note" data-testid="demo-oman-note"><Text force text={oman.previewNote} /></p>
    <section className="oman-card" aria-labelledby="oman-card-title" data-testid="oman-card">
      <h2 id="oman-card-title" className="sr-only" lang="ar">{route.region.ar}</h2>
      <div className="oman-row"><span className="oman-label"><Text text={oman.label.region} /></span><b className="oman-name" lang="ar">{route.region.ar}</b><Tr text={{ ar: '', id: route.region.id, en: route.region.en }} small /></div>
      <div className="oman-row oman-row-vehicle"><span className="oman-label"><Text text={oman.label.vehicle} /></span><Vehicle id="baghlah" className="oman-vehicle" /><b className="oman-name" lang="ar">{boat[0]}</b><Tr text={{ ar: '', id: boat[1], en: boat[2] }} small /></div>
      <div className="oman-vocab"><h3 className="oman-label"><Text text={oman.label.vocab} /></h3>
        <ul>{oman.vocab.map((v, i) => <li key={i} data-testid="oman-vocab"><b className="oman-word" lang="ar">{v.ar}</b><Tr text={v} /><Tr text={{ ar: '', id: v.note.id, en: v.note.en }} small /></li>)}</ul>
      </div>
    </section>
    <div className="oman-actions">
      <Button variant="secondary" className="full-width" onClick={() => setRun(n => n + 1)} data-testid="oman-replay"><Text text={oman.btn.replay} /></Button>
      <Link className="md-btn full-width" to="/" data-testid="oman-back"><Text text={oman.btn.back} /></Link>
    </div>
  </div>;
}
