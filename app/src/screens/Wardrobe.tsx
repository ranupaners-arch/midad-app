import { useState } from 'react';
import type { MascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { MidadMascot, validateMascotConfig } from '../../../design-system/assets/maskot/mascot.mjs';
import { CATALOG_PRICES, equipMascot, purchase, streak } from '../domain/progress';
import { l } from '../domain/content';
import { useProfile } from '../store';
import { Button, Mascot, Text } from '../ui/Common';
import { Icon } from '../ui/Icon';

const ANIMALS = { hudhud: 'هُدْهُدٌ', cat: 'قِطٌّ', camel: 'جَمَلٌ', turtle: 'سُلَحْفَاةٌ', oryx: 'مَهَا' };
type Slot = 'color' | 'style' | 'eyes' | 'nose' | 'mouth' | 'hand' | 'head' | 'neck' | 'skin';
const SLOTS: { key: Slot; name: string }[] = [{ key: 'color', name: 'اللَّوْنُ' }, { key: 'style', name: 'النَّمَطُ' }, { key: 'eyes', name: 'الْعُيُونُ' }, { key: 'mouth', name: 'الْفَمُ / الْمِنْقَارُ' }, { key: 'nose', name: 'الْأَنْفُ' }, { key: 'hand', name: 'أَدَوَاتٌ' }, { key: 'head', name: 'الرَّأْسُ' }, { key: 'neck', name: 'الْعُنُقُ' }, { key: 'skin', name: 'الْكِسْوَةُ' }];
const NAMES: Record<string, string> = {
  none: 'لَا شَيْءَ', orange: 'بُرْتُقَالِيٌّ', teal: 'فَيْرُوزِيٌّ', pink: 'وَرْدِيٌّ', sky: 'سَمَاوِيٌّ', lavender: 'بَنَفْسَجِيٌّ', mint: 'نَعْنَاعِيٌّ', ginger: 'أَشْقَرُ', grey: 'رَمَادِيٌّ', black: 'أَسْوَدُ', sand: 'رَمْلِيٌّ', cream: 'كِرِيمِيٌّ', brown: 'بُنِّيٌّ', white: 'أَبْيَضُ', green: 'أَخْضَرُ', sea: 'أَزْرَقُ', olive: 'زَيْتُونِيٌّ', coral: 'مَرْجَانِيٌّ', rose: 'وَرْدِيٌّ فَاتِحٌ',
  fan: 'مِرْوَحِيٌّ', spiky: 'شَائِكٌ', curly: 'مُجَعَّدٌ', tuft: 'قَصِيرٌ', swept: 'مُنْسَدِلٌ', flower: 'بِزَهْرَةٍ', patches: 'مُبَقَّعٌ', tabby: 'مُخَطَّطٌ', plain: 'سَادَةٌ', mask: 'مُقَنَّعٌ', fringe: 'غُرَّةٌ', tall: 'عَالٍ', bald: 'بِلَا شَعْرٍ', plates: 'صَفَائِحُ', stripes: 'خُطُوطٌ', spots: 'نُقَطٌ', gold: 'ذَهَبِيٌّ', straight: 'مُسْتَقِيمٌ', curved: 'مُنْحَنٍ', short: 'قَصِيرٌ', spiral: 'حَلَزُونِيٌّ',
  round: 'مُسْتَدِيرَةٌ', happy: 'سَعِيدَةٌ', sleepy: 'نَاعِسَةٌ', star: 'لَامِعَةٌ', determined: 'حَازِمَةٌ', wink: 'غَامِزَةٌ', dot: 'صَغِيرَةٌ', sad: 'حَزِينَةٌ', up: 'إِلَى أَعْلَى', lashes: 'بِرُمُوشٍ', long: 'طَوِيلٌ', smile: 'مُبْتَسِمٌ', laugh: 'ضَاحِكٌ', small: 'صَغِيرٌ', w: 'قِطِّيٌّ', tongue: 'لِسَانٌ', o: 'مُنْدَهِشٌ', grin: 'بِأَسْنَانٍ', frown: 'حَزِينٌ', flat: 'هَادِئٌ', tri: 'مُثَلَّثٌ', button: 'زِرٌّ', camel: 'مَنْخِرَانِ', heart: 'قَلْبٌ', oval: 'بَيْضَوِيٌّ', dots: 'نُقْطَتَانِ',
  qalam: 'قَلَمٌ', inkpot: 'مِحْبَرَةٌ', book: 'كِتَابٌ', lantern: 'فَانُوسٌ', dates: 'تَمْرٌ', dhow: 'سَفِينَةٌ', telescope: 'مِنْظَارٌ', scroll: 'خَرِيطَةٌ', kumma: 'كُمَّةٌ', mussar: 'مُصَرٌّ', peci: 'طَاقِيَّةٌ', scarf: 'وِشَاحٌ', sailor: 'لِبَاسُ الْبَحَّارِ', vest: 'صُدْرِيَّةٌ', batik: 'بَاتِيك', dishdasha: 'دِشْدَاشَةٌ', koko: 'قَمِيصٌ', nakhoda: 'رُبَّانٌ', scholar: 'عَالِمٌ', goldbisht: 'بِشْتٌ ذَهَبِيٌّ', nightink: 'حِبْرُ اللَّيْلِ',
};

export default function Wardrobe() {
  const { profile, update } = useProfile();
  const [draft, setDraft] = useState<MascotConfig>(profile.mascot), [slot, setSlot] = useState<Slot>('color'), [saved, setSaved] = useState(false);
  const A = MidadMascot.ANIMALS[draft.animal];
  const optionMap = { color: A.colors, style: Object.fromEntries(A.styles.map(s => [s, s])), eyes: MidadMascot.EYES, nose: A.hasNose ? MidadMascot.NOSES : {}, mouth: A.mouthKind === 'beak' ? MidadMascot.BEAKS : MidadMascot.MOUTHS, hand: MidadMascot.HAND, head: MidadMascot.HEAD, neck: MidadMascot.NECK, skin: MidadMascot.SKINS };
  const earned = (animal: string) => profile.ownedAnimals.includes(animal) || animal === 'camel' && profile.rewardedUnits.includes(2) || animal === 'turtle' && streak(profile) >= 7;
  const needed: { category: 'animal' | 'skin' | 'item'; key: string }[] = [];
  if (!earned(draft.animal)) needed.push({ category: 'animal', key: draft.animal });
  if (!profile.ownedSkins.includes(draft.skin)) needed.push({ category: 'skin', key: draft.skin });
  for (const s of ['hand', 'head', 'neck'] as const) if (!profile.ownedItems.includes(`${s}:${draft[s]}`)) needed.push({ category: 'item', key: `${s}:${draft[s]}` });
  const locked = needed.some(n => CATALOG_PRICES[`${n.category}:${n.key}`] === undefined);
  const cost = needed.reduce((n, item) => n + (CATALOG_PRICES[`${item.category}:${item.key}`] ?? 0), 0);
  const select = (key: string) => { setDraft(d => validateMascotConfig({ ...d, [slot]: key })); setSaved(false); };
  const save = () => {
    if (locked || cost > profile.dates) return;
    update(p => {
      if (p.dates < cost) return p;
      let next = p;
      for (const item of needed) next = purchase(next, item.category, item.key);
      return equipMascot(next, draft);
    });
    setSaved(true);
  };
  return <div className="screen wardrobe-screen"><div className="page-heading"><h1 id="main-title" tabIndex={-1}><Text text={l('رَفِيقِي', 'Teman belajarku', 'My companion')} /></h1><span className="stat stat-dates"><Icon name="dates" /><b className="number">{profile.dates}</b></span></div>
    <div className="wardrobe-content">
    <div className="wardrobe-stage"><Mascot config={draft} /><p>{ANIMALS[draft.animal]}</p></div>
    <fieldset className="animal-picker"><legend>اخْتَرْ رَفِيقَكَ</legend><div>{Object.entries(ANIMALS).map(([key, name]) => <label key={key} className={draft.animal === key ? 'selected' : ''}><input className="sr-only" type="radio" name="animal" checked={draft.animal === key} onChange={() => { setDraft(validateMascotConfig({ ...MidadMascot.defaults(key as MascotConfig['animal']), skin: draft.skin, head: draft.head, neck: draft.neck, hand: draft.hand })); setSaved(false); }} /><Mascot config={{ animal: key as MascotConfig['animal'] }} decorative /><b>{name}</b>{!earned(key) && <span className="animal-lock"><Icon name="lock" />{key === 'cat' ? <span className="number">200</span> : key === 'camel' ? '٢' : key === 'turtle' ? '٧' : 'عُمَانُ'}</span>}</label>)}</div></fieldset>
    {!earned(draft.animal) && <p className="unlock-message"><Icon name="lock" /><Text text={draft.animal === 'cat' ? l('يُفْتَحُ بِمِائَتَيْ تَمْرَةٍ.', 'Kucing dapat dibeli dengan 200 kurma.', 'Unlock the cat for 200 dates.') : draft.animal === 'camel' ? l('يُفْتَحُ بَعْدَ الْوَحْدَةِ الثَّانِيَةِ.', 'Unta terbuka setelah lulus wahdah kedua.', 'Unlock the camel after passing unit two.') : draft.animal === 'turtle' ? l('يُفْتَحُ بِسِلْسِلَةِ سَبْعَةِ أَيَّامٍ.', 'Penyu terbuka setelah belajar tujuh hari berturut-turut.', 'Unlock the turtle with a seven-day streak.') : l('يُفْتَحُ عِنْدَ الْوُصُولِ إِلَى عُمَانَ.', 'Oryx terbuka saat tiba di Oman pada level 17, di luar demo ini.', 'Unlock the oryx upon reaching Oman at level 17, beyond this demo.')} /></p>}
    <div className="customization-tabs" role="group" aria-label="أَجْزَاءُ الرَّفِيقِ">{SLOTS.map(s => <button key={s.key} type="button" aria-pressed={slot === s.key} className={slot === s.key ? 'selected' : ''} onClick={() => setSlot(s.key)}>{s.name}</button>)}</div>
    <fieldset className="customization-options"><legend className="sr-only">{SLOTS.find(s => s.key === slot)?.name}</legend>{Object.keys(optionMap[slot]).map(key => {
      const isItem = ['hand', 'head', 'neck'].includes(slot), owned = slot === 'skin' ? profile.ownedSkins.includes(key) : isItem ? profile.ownedItems.includes(`${slot}:${key}`) : true;
      const price = CATALOG_PRICES[`${slot === 'skin' ? 'skin' : 'item'}:${isItem ? `${slot}:` : ''}${key}`];
      return <label className={`customization-option ${draft[slot] === key ? 'selected' : ''}`} key={`${slot}-${key}`}><input className="sr-only" type="radio" name={`customization-${slot}`} checked={draft[slot] === key} onChange={() => select(key)} aria-label={NAMES[key] ?? key} />
        {slot === 'color' ? <span className="color-preview" style={{ background: A.colors[key][0] }} /> : <Mascot config={{ ...draft, [slot]: key }} decorative />}
        <b>{NAMES[key] ?? key}</b>{!owned && <span className="option-price">{price !== undefined ? <><Icon name="dates" /><span className="number">{price}</span></> : <><Icon name="lock" />{key === 'dishdasha' ? 'عُمَانُ' : 'بِالتَّقَدُّمِ'}</>}</span>}
      </label>;
    })}{slot === 'nose' && !A.hasNose && <p className="empty-options"><Text text={l('لِلْهُدْهُدِ مِنْقَارٌ، وَلَيْسَ لَهُ أَنْفٌ.', 'Hudhud punya paruh, sehingga tidak menggunakan pilihan hidung.', 'The hoopoe has a beak and does not use nose options.')} /></p>}</fieldset>
    </div>
    <div className="wardrobe-save"><Button className="full-width" disabled={locked || cost > profile.dates} onClick={save}>{locked ? <><Icon name="lock" /> مُقْفَلٌ</> : cost > profile.dates ? 'تَمْرُكَ لَا يَكْفِي' : cost > 0 ? <><Icon name="dates" /> اشْتَرِ وَاحْفَظْ <span className="number">{cost}</span></> : 'احْفَظْ رَفِيقَكَ'}</Button>{saved && <p role="status" className="saved-message"><Icon name="check" /> تَمَّ الْحِفْظُ! سَيُرَافِقُكَ بِهَذَا الشَّكْلِ.</p>}</div>
  </div>;
}
