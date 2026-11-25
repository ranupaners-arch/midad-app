import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../store';
import { l } from '../domain/content';
import { validateMascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { Button, Mascot, Text, Vehicle } from '../ui/Common';
import { Icon, Logo } from '../ui/Icon';
import Placement from './Placement';

export default function Welcome() {
  const { profile, update } = useProfile(), navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [takingPlacement, setTakingPlacement] = useState(false);
  useEffect(() => { document.getElementById('main-title')?.focus({ preventScroll: true }); }, [step, takingPlacement]);
  const colors = [['orange', 'بُرْتُقَالِيٌّ', '#f2a03d'], ['teal', 'فَيْرُوزِيٌّ', '#2a9d8f'], ['pink', 'وَرْدِيٌّ', '#ef7f9a'], ['sky', 'سَمَاوِيٌّ', '#5fa8e0'], ['lavender', 'بَنَفْسَجِيٌّ', '#a68bd6'], ['mint', 'نَعْنَاعِيٌّ', '#74c69d']];
  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0); };
  const start = () => { update(p => ({ ...p, onboarded: true })); navigate('/', { replace: true }); };
  return <main className={takingPlacement ? 'welcome taking-placement' : 'welcome'}>
    <header className="welcome-header"><Logo /><span className="onboarding-step" role="img" aria-label={`الْخُطْوَةُ ${step + 1} مِنْ ٣`}>{[0, 1, 2].map(n => <i key={n} className={n <= step ? 'filled' : ''} />)}</span></header>
    <div className={takingPlacement ? 'welcome-content welcome-placement' : 'welcome-content'} key={step}>
      {takingPlacement ? <Placement onBack={() => setTakingPlacement(false)} onStart={start} /> : step === 0 ? <>
        <div className="welcome-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><Vehicle /><span className="floating-drop"><Icon name="drop" /></span></div>
        <h1 id="main-title" tabIndex={-1}>تَعَلَّمِ الْعَرَبِيَّةَ</h1>
        <fieldset className="language-fieldset"><legend><Text force text={l('لُغَةُ التَّرْجَمَةِ', 'Bahasa terjemahan', 'Translation language')} /></legend><div className="language-options">{(['id', 'en'] as const).map(lang => <label className={`language-card ${profile.language === lang ? 'selected' : ''}`} key={lang}>
          <input type="radio" name="language" value={lang} checked={profile.language === lang} onChange={() => update(p => ({ ...p, language: lang }))} />
          <span className="language-monogram" lang={lang}>{lang.toUpperCase()}</span><span lang={lang} dir="ltr"><b>{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</b></span><Icon name="check" />
        </label>)}</div></fieldset>
        <Button className="full-width" onClick={next}>مُتَابَعَة</Button>
        <p className="welcome-note" lang={profile.language} dir="ltr">{profile.language === 'id' ? 'Antarmuka tetap berbahasa Arab.' : 'The interface stays in Arabic.'}</p>
      </> : step === 1 ? <>
        <h1 id="main-title" tabIndex={-1}><Text text={l('اِخْتَرْ لَوْنَ الْهُدْهُدِ', 'Pilih warna hudhud', 'Choose your hoopoe’s color')} force /></h1>
        <div className="onboarding-mascot-stage"><Mascot /><span className="stage-shadow" /></div>
        <fieldset className="swatches"><legend className="sr-only">لَوْنُ الْهُدْهُدِ</legend>{colors.map(([key, name, color]) => <label key={key} className={`swatch ${profile.mascot.color === key ? 'selected' : ''}`} style={{ background: color }}><input className="sr-only" type="radio" name="mascot-color" checked={profile.mascot.color === key} onChange={() => update(p => ({ ...p, mascot: validateMascotConfig({ ...p.mascot, color: key }) }))} aria-label={name} />{profile.mascot.color === key && <Icon name="check" />}</label>)}</fieldset>
        <Button className="full-width" onClick={next}>مُتَابَعَة</Button><button className="text-button" onClick={() => setStep(0)}>رُجُوعٌ</button>
      </> : <>
        <div className="welcome-art final-art"><Vehicle /><span className="port-dot" /></div>
        <h1 id="main-title" tabIndex={-1}><Text text={l('اِخْتَرْ نُقْطَةَ الْبِدَايَةِ', 'Pilih cara mulai', 'Choose how to start')} force /></h1>
        <div className="starting-level"><span className="level-tag" lang="en" dir="ltr">A1</span><div><b>اِبْدَأْ مِنَ الصِّفْرِ</b><Text text={l('السَّلَامُ، ثُمَّ التَّعَارُفُ، ثُمَّ الْأَرْقَامُ.', 'Salam, perkenalan, dan angka.', 'Greetings, introductions, and numbers.')} force /></div><Icon name="compass" /></div>
        <Button className="full-width" onClick={start}>اِبْدَأْ</Button>
        <Button variant="secondary" className="full-width" onClick={() => setTakingPlacement(true)}><Text force text={l('اخْتِبَارُ تَحْدِيدِ الْمُسْتَوَى', 'Ikut tes tahdid mustawa', 'Take the placement test')} /></Button><button className="text-button" onClick={() => setStep(1)}>رُجُوعٌ</button>
        <p className="welcome-note" lang={profile.language} dir="ltr">{profile.language === 'id' ? 'Progres tersimpan di browser perangkat ini, tanpa perlu akun.' : 'Your progress stays in this browser, without an account.'}</p>
      </>}
    </div>
  </main>;
}
