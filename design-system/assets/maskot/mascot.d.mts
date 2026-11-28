// Tipe untuk mascot.js / mascot.mjs. Daftar nilai harus sama dengan mascot.js
// (dicek oleh scripts/check-mascot.mjs).
export type Animal = 'hudhud' | 'cat' | 'camel' | 'turtle' | 'oryx';
export type Eyes = 'round' | 'happy' | 'sleepy' | 'star' | 'determined' | 'wink' | 'dot' | 'sad' | 'up' | 'lashes';
export type Beak = 'long' | 'smile' | 'short' | 'laugh';
export type Mouth = 'smile' | 'laugh' | 'small' | 'w' | 'tongue' | 'o' | 'grin' | 'frown' | 'flat';
export type Nose = 'tri' | 'button' | 'camel' | 'heart' | 'oval' | 'dots';
export type HeadItem = 'none' | 'kumma' | 'mussar' | 'peci';
export type NeckItem = 'none' | 'scarf';
export type HandItem = 'none' | 'qalam' | 'inkpot' | 'book' | 'lantern' | 'dates' | 'dhow' | 'telescope' | 'scroll';
export type Skin = 'none' | 'sailor' | 'vest' | 'batik' | 'dishdasha' | 'koko' | 'nakhoda' | 'scholar' | 'goldbisht' | 'nightink';
export type Tier = 'common' | 'rare' | 'epic' | 'legendary';
export type Emote = 'cheer' | 'sad' | 'think' | 'surprised' | 'sleep';
/** Penanda tokoh cerita (bukan item lemari): 'female' = pita dan rok. */
export type Mark = 'none' | 'female';

export interface MascotConfig {
  animal: Animal;
  /** kunci dari ANIMALS[animal].colors */
  color: string;
  /** salah satu ANIMALS[animal].styles */
  style: string;
  eyes: Eyes;
  /** Beak untuk hudhud, Mouth untuk hewan lain */
  mouth: Beak | Mouth;
  /** null untuk hudhud (tidak punya hidung) */
  nose: Nose | null;
  hand: HandItem;
  head: HeadItem;
  neck: NeckItem;
  skin: Skin;
  emote?: Emote;
  mark?: Mark;
}

export interface RenderOptions {
  /** default '0 0 512 512'; crop kepala: '96 40 320 320' */
  viewBox?: string;
  /** atribut SVG tambahan. Hanya dari kode, jangan dari input pengguna. */
  attrs?: string;
  cls?: string;
  /** aria-label; di-escape oleh renderMascot() */
  label?: string;
}

export interface AnimalDef {
  colors: Record<string, [body: string, dark: string, light: string, accent: string]>;
  styles: string[];
  mouthKind: 'beak' | 'mouth';
  hasNose: boolean;
}

export interface MidadMascotApi {
  render(cfg: Partial<MascotConfig>, opts?: RenderOptions): string;
  defaults(animal: Animal): Omit<MascotConfig, 'skin' | 'emote'>;
  ANIMALS: Record<Animal, AnimalDef>;
  SKINS: Record<Skin, { tier: Tier }>;
  TIERS: Record<Tier, string>;
  EMOTES: Record<Emote, unknown>;
  EYES: Record<Eyes, unknown>;
  BEAKS: Record<Beak, unknown>;
  MOUTHS: Record<Mouth, unknown>;
  NOSES: Record<Nose, unknown>;
  HEAD: Record<HeadItem, unknown>;
  NECK: Record<NeckItem, unknown>;
  HAND: Record<HandItem, unknown>;
  MARK: Record<Mark, unknown>;
}

export declare const MidadMascot: MidadMascotApi;
export declare function validateMascotConfig(raw: unknown): MascotConfig;
export declare function renderMascot(cfg: unknown, opts?: RenderOptions): string;
