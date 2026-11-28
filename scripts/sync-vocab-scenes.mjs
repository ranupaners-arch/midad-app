#!/usr/bin/env node
// Bangun app/src/domain/sceneMap.json dari peta-adegan.json (latar) + emoji-adegan.json (penanda makna) + ui-strings.json (label AI).
// Berkas gambar sudah ada di app/src/assets/vocab dan emoji di app/src/assets/emoji. Hanya field yang dipakai app yang disalin.
// Pakai: node scripts/sync-vocab-scenes.mjs [folderAssetsVocab] [folderKonten]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vocab = process.argv[2];
const content = process.argv[3];
if (!vocab || !content) { console.error('Pemakaian: node scripts/sync-vocab-scenes.mjs <vocab> <content>'); process.exit(1); }
const read = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));

const peta = read(join(vocab, 'peta-adegan.json')).items;
const em = read(join(vocab, 'emoji-adegan.json'));
const items = {};
const problems = [];
for (const [key, p] of Object.entries(peta)) {
  const e = em.items[key];
  items[key] = { scene: p.scene, mode: p.mode, ...(p.emote ? { emote: p.emote } : {}), ...(e ? { emoji: e.emoji } : {}), ...(em.femaleFriend.includes(key) ? { friendFemale: true } : {}) };
  if (!existsSync(join(root, 'app/src/assets/vocab', `${p.scene}.webp`))) problems.push(`gambar hilang: ${p.scene}.webp (${key})`);
  if (e && !existsSync(join(root, 'app/src/assets/emoji', `${e.emoji}.svg`))) problems.push(`emoji hilang: ${e.emoji}.svg (${key})`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
writeFileSync(join(root, 'app/src/domain/sceneMap.json'), JSON.stringify({ items }, null, 1) + '\n');

// label "ilustrasi menggunakan AI": teks Arab dari Shaharil, disalin apa adanya
const ai = read(join(content, 'ui-strings.json')).strings['about.ai_illustration'];
if (!ai?.ar) { console.error('about.ai_illustration tidak ada di ui-strings.json'); process.exit(1); }
writeFileSync(join(root, 'app/src/domain/aiLabel.json'), JSON.stringify({ ar: ai.ar, id: ai.id, en: ai.en }, null, 1) + '\n');
console.log(`sceneMap: ${Object.keys(items).length} kata; emoji: ${Object.values(items).filter(i => i.emoji).length}; label AI ok`);
