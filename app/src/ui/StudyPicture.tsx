import { useState } from 'react';
import { sceneFor, sceneKey } from '../domain/scenes';
import { WordPicture } from './Common';
import { sceneUrl } from './sceneAssets';
import WordScene from './WordScene';
import '../scene.css';

/** Gambar kartu belajar: ilustrasi adegan bila kosakata punya latar; jatuh ke ikon lama (WordPicture) bila tidak ada atau gagal dimuat. */
export default function StudyPicture({ symbol, audioKey }: { symbol: string; audioKey?: string }) {
  const [failed, setFailed] = useState(false);
  const def = sceneFor(audioKey), url = def && sceneUrl(def.scene);
  if (!def || !url || failed) return <WordPicture symbol={symbol} />;
  return <WordScene def={def} url={url} sceneKey={sceneKey(audioKey)} onError={() => setFailed(true)} />;
}
