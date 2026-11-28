import map from './sceneMap.json' with { type: 'json' };

// Pemetaan kosakata -> latar ilustrasi (murni, tanpa Vite, supaya mudah diuji).
// Kunci kosakata diambil dari audioKey materi Shaharil: "w01/v05" -> "w1-v05".
export type SceneMode = 'solo' | 'duo' | 'pojok' | 'none';
export type SceneEmote = 'cheer' | 'sad' | 'think' | 'surprised' | 'sleep';
export type SceneDef = { scene: string; mode: SceneMode; emote?: SceneEmote; emoji?: string; friendFemale?: boolean };

const items = (map as { items: Record<string, SceneDef> }).items;

export function sceneKey(audioKey?: string): string | undefined {
  const m = audioKey ? /^w0*(\d+)\/(v\d+)$/.exec(audioKey) : null;
  return m ? `w${m[1]}-${m[2]}` : undefined;
}

export function sceneFor(audioKey?: string): SceneDef | undefined {
  const key = sceneKey(audioKey);
  return key ? items[key] : undefined;
}

export const SCENE_KEYS = Object.keys(items);
export const SCENE_DEFS = items;

/** Hewan teman pendamping di adegan berdua: kucing, atau Hudhud bila pengguna memilih kucing. */
export function friendAnimal(userAnimal: string): 'cat' | 'hudhud' {
  return userAnimal === 'cat' ? 'hudhud' : 'cat';
}
