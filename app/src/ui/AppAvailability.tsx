import { usePwa } from '../pwa';
import { useProfile } from '../store';
import { l } from '../domain/content';
import { Text } from './Common';
import { Icon } from './Icon';

export default function AppAvailability({ learning }: { learning: boolean }) {
  const pwa = usePwa(), { storageError } = useProfile();
  return <>
    {!pwa.online && <div className="availability-banner" role="status"><Icon name="book" /><span><Text text={l(pwa.ready ? 'أَنْتَ بِدُونِ اتِّصَالٍ. دُرُوسُكَ وَتَقَدُّمُكَ مَعَكَ.' : 'أَنْتَ بِدُونِ اتِّصَالٍ. قَدْ لَا تَتَوَفَّرُ بَعْضُ الْمَوَادِ بَعْدُ.', pwa.ready ? 'Kamu sedang offline. Pelajaran dan progres tetap tersedia pada perangkat ini.' : 'Kamu sedang offline. Sebagian materi mungkin belum tersimpan pada perangkat ini.', pwa.ready ? 'You are offline. Lessons and progress are still available on this device.' : 'You are offline. Some materials may not be saved on this device yet.')} /></span></div>}
    {pwa.updateAvailable && !learning && <div className="availability-banner update-banner" role="status"><Icon name="repeat" /><span><Text text={l('تَحْدِيثٌ جَدِيدٌ جَاهِزٌ. ثَبِّتْهُ فِي الْوَقْتِ الْمُنَاسِبِ لَكَ.', 'Versi baru tersedia. Perbarui saat kamu siap; progres tersimpan di perangkat.', 'An update is available. Update when you are ready; progress stays on your device.')} /></span><button className="text-button" disabled={storageError} onClick={() => void pwa.applyUpdate()}>حَدِّثِ التَّطْبِيقَ</button></div>}
    {pwa.updateError && <div className="availability-banner" role="status"><Text text={l('تَعَذَّرَ تَثْبِيتُ التَّحْدِيثِ. يُمْكِنُكَ مُوَاصَلَةُ التَّعَلُّمِ وَالْمُحَاوَلَةُ لَاحِقًا.', 'Pembaruan belum berhasil. Kamu bisa tetap belajar dan mencoba lagi nanti.', 'The update did not finish. Keep learning and try again later.')} force /></div>}
  </>;
}
