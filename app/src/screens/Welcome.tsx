import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../store';
import { l } from '../domain/content';
import { validateMascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { Button, Mascot, Text, Vehicle } from '../ui/Common';
import { Icon, Logo } from '../ui/Icon';

export default function Welcome() {
  const { profile, update } = useProfile(), navigate = useNavigate();
  const [step, setStep] = useState(0);
  useEffect(() => { document.getElementById('main-title')?.focus({ preventScroll: true }); }, [step]);
  const colors = [['orange', 'بُرْتُقَالِيٌّ', '#f2a03d'], ['teal', 'فَيْرُوزِيٌّ', '#2a9d8f'], ['pink', 'وَرْدِيٌّ', '#ef7f9a'], ['sky', 'سَمَاوِيٌّ', '#5fa8e0'], ['lavender', 'بَنَفْسَجِيٌّ', '#a68bd6'], ['mint', 'نَعْنَاعِيٌّ', '#74c69d']];
  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0); };
  return <main className="welcome">
    <header className="welcome-header"><Logo /><span className="onboarding-step" role="img" aria-label={`الْخُطْوَةُ ${step + 1} مِنْ ٣`}>{[0, 1, 2].map(n => <i key={n} className={n <= step ? 'filled' : ''} />)}</span></header>
    <div className="welcome-content" key={step}>
      {step === 0 ? <>
        <div className="welcome-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><Vehicle /><span className="floating-drop"><Icon name="drop" /></span></div>
        <span className="eyebrow">أَهْلًا بِكَ فِي مِدَاد</span>
        <h1 id="main-title" tabIndex={-1}>تَعَلَّمِ الْعَرَبِيَّةَ<br /><span className="brand-text">قَطْرَةً قَطْرَةً.</span></h1>
        <p className="welcome-intro" lang="id" dir="ltr">Perjalanan kecil menuju dunia bahasa Arab.</p><p className="welcome-english" lang="en" dir="ltr">A little journey into the world of Arabic.</p>
        <fieldset className="language-fieldset"><legend>مَا لُغَتُكَ الْأُمُّ؟</legend><div className="language-options">{(['id', 'en'] as const).map(lang => <label className={`language-card ${profile.language === lang ? 'selected' : ''}`} key={lang}>
          <input type="radio" name="language" value={lang} checked={profile.language === lang} onChange={() => update(p => ({ ...p, language: lang }))} />
          <span className="language-monogram" lang={lang}>{lang.toUpperCase()}</span><span lang={lang} dir="ltr"><b>{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</b><small>{lang === 'id' ? 'Bahasa terjemahanmu' : 'Your translation language'}</small></span><Icon name="check" />
        </label>)}</div></fieldset>
        <Button className="full-width" onClick={next}>مُتَابَعَة</Button>
        <p className="welcome-note" lang={profile.language} dir="ltr">{profile.language === 'id' ? 'Antarmuka berbahasa Arab. Terjemahan bisa kamu buka kapan saja.' : 'An Arabic interface. Reveal translations whenever you need them.'}</p>
      </> : step === 1 ? <>
        <span className="eyebrow">رَفِيقُ رِحْلَتِكَ</span><h1 id="main-title" tabIndex={-1}><Text text={l('هَذَا هُدْهُدُكَ!', 'Kenalkan, hudhudmu!', 'Meet your hoopoe!')} force /></h1>
        <div className="onboarding-mascot-stage"><Mascot /><span className="stage-shadow" /></div>
        <p className="center muted"><Text text={l('سَيُرَافِقُكَ فِي كُلِّ خُطْوَةٍ. اِخْتَرْ لَوْنَهُ.', 'Ia akan menemanimu di setiap langkah. Pilih warnanya.', 'Your companion for every step. Choose a color.')} force /></p>
        <fieldset className="swatches"><legend className="sr-only">لَوْنُ الْهُدْهُدِ</legend>{colors.map(([key, name, color]) => <label key={key} className={`swatch ${profile.mascot.color === key ? 'selected' : ''}`} style={{ background: color }}><input className="sr-only" type="radio" name="mascot-color" checked={profile.mascot.color === key} onChange={() => update(p => ({ ...p, mascot: validateMascotConfig({ ...p.mascot, color: key }) }))} aria-label={name} />{profile.mascot.color === key && <Icon name="check" />}</label>)}</fieldset>
        <Button className="full-width" onClick={next}>مُتَابَعَة</Button><button className="text-button" onClick={() => setStep(0)}>رُجُوعٌ</button>
      </> : <>
        <div className="welcome-art final-art"><Vehicle /><span className="port-dot" /></div>
        <span className="eyebrow">نُوسَانْتَارَا · الْمَرْحَلَةُ الْأُولَى</span><h1 id="main-title" tabIndex={-1}><Text text={l('لِنَبْدَأِ الرِّحْلَةَ!', 'Ayo mulai perjalanan!', 'Let the journey begin!')} force /></h1>
        <div className="starting-level"><span className="level-tag" lang="en" dir="ltr">A1</span><div><b>اِبْدَأْ مِنَ الصِّفْرِ</b><Text text={l('السَّلَامُ، ثُمَّ التَّعَارُفُ، ثُمَّ الْأَرْقَامُ.', 'Salam, berkenalan, lalu angka. Tiga pelabuhan pertamamu.', 'Greetings, introductions, then numbers. Your first three ports.')} force /></div><Icon name="compass" /></div>
        <p className="muted center"><Text text={l('قَلِيلٌ كُلَّ يَوْمٍ خَيْرٌ مِنْ كَثِيرٍ يَنْقَطِعُ.', 'Sedikit setiap hari, terus melangkah.', 'A little every day. Keep moving forward.')} force /></p>
        <Button className="full-width" onClick={() => { update(p => ({ ...p, onboarded: true })); navigate('/', { replace: true }); }}>اِبْدَأْ</Button><button className="text-button" onClick={() => setStep(1)}>رُجُوعٌ</button>
        <p className="welcome-note" lang={profile.language} dir="ltr">{profile.language === 'id' ? 'Progres tersimpan di browser perangkat ini, tanpa perlu akun.' : 'Your progress stays in this browser, without an account.'}</p>
      </>}
    </div>
    <footer className="welcome-footer"><Icon name="drop" /><span>مِنْ قَطْرَةِ حِبْرٍ، تَبْدَأُ حِكَايَةٌ.</span></footer>
  </main>;
}
