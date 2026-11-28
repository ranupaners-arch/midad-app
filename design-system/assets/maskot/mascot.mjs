// Midad — maskot sebagai ES module (untuk aplikasi/bundler).
// mascot.js tetap sumber gambarnya (dipakai juga oleh preview lama lewat <script>);
// file ini menambahkan validasi konfigurasi dan escape label.
import './mascot.js';

/** @type {import('./mascot.mjs').MidadMascotApi} */
export const MidadMascot = globalThis.MidadMascot;
const M = MidadMascot;

const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
const escapeAttr = (s) => String(s).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Membersihkan konfigurasi maskot (misal dari localStorage/server):
 * nilai yang tidak dikenal diganti nilai default hewan itu.
 * @param {unknown} raw
 * @returns {import('./mascot.mjs').MascotConfig}
 */
export function validateMascotConfig(raw) {
  const cfg = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
  const animal = has(M.ANIMALS, cfg.animal) ? /** @type {string} */ (cfg.animal) : 'hudhud';
  const A = M.ANIMALS[animal];
  const d = M.defaults(animal);
  const pick = (key, ok) => (ok(cfg[key]) ? cfg[key] : d[key]);
  const out = {
    animal,
    color: pick('color', (v) => has(A.colors, v)),
    style: pick('style', (v) => A.styles.includes(v)),
    eyes: pick('eyes', (v) => has(M.EYES, v)),
    mouth: pick('mouth', (v) => has(A.mouthKind === 'beak' ? M.BEAKS : M.MOUTHS, v)),
    nose: A.hasNose ? pick('nose', (v) => has(M.NOSES, v)) : null,
    hand: pick('hand', (v) => has(M.HAND, v)),
    head: pick('head', (v) => has(M.HEAD, v)),
    neck: pick('neck', (v) => has(M.NECK, v)),
    skin: has(M.SKINS, cfg.skin) ? cfg.skin : 'none',
  };
  if (has(M.EMOTES, cfg.emote)) out.emote = cfg.emote;
  if (has(M.MARK, cfg.mark) && cfg.mark !== 'none') out.mark = cfg.mark;
  return /** @type {import('./mascot.mjs').MascotConfig} */ (out);
}

/**
 * Render maskot yang aman: konfigurasi divalidasi dan label di-escape.
 * `opts.attrs`, `opts.cls`, dan `opts.viewBox` harus berasal dari kode, bukan input pengguna.
 * @param {unknown} cfg
 * @param {import('./mascot.mjs').RenderOptions} [opts]
 */
export function renderMascot(cfg, opts = {}) {
  const o = { ...opts };
  if (o.label != null) o.label = escapeAttr(o.label);
  return M.render(validateMascotConfig(cfg), o);
}
