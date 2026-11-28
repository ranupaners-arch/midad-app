// Salin teks halaman demo Oman (kunci oman.*) dari ui-strings.json Shaharil ke app/src/domain/omanTexts.json, apa adanya
// (tidak ada Arab tulisan sendiri). Pakai: node scripts/sync-oman-texts.mjs [folder-konten]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = process.argv[2];
if (!content) { console.error('Pemakaian: node scripts/sync-oman-texts.mjs <content>'); process.exit(1); }
const strings = JSON.parse(readFileSync(join(content, 'ui-strings.json'), 'utf8').replace(/^\uFEFF/, '')).strings;
const missing = [];
const get = (key, arabicOptional = false) => {
  const s = strings[key];
  if (!s || !s.id || !s.en || (!arabicOptional && !s.ar)) { missing.push(key); return { ar: '', id: '', en: '' }; }
  return { ar: s.ar ?? '', id: s.id, en: s.en };
};
const out = {
  portName: get('oman.port.name'), portAfterIla: get('oman.port.after_ila'), banner: get('oman.banner'),
  label: { region: get('oman.label.region'), vehicle: get('oman.label.vehicle'), vocab: get('oman.label.vocab') },
  vocab: [1, 2, 3].map(n => ({ ...get(`oman.vocab.${n}`), note: get(`oman.vocab.${n}.note`, true) })),
  btn: { replay: get('oman.btn.replay'), back: get('oman.btn.back') }, previewNote: get('oman.preview.note'),
};
if (missing.length) { console.error('Kunci kurang/tidak lengkap di ui-strings.json: ' + missing.join(', ')); process.exit(1); }
writeFileSync(join(root, 'app/src/domain/omanTexts.json'), JSON.stringify(out, null, 1) + '\n');
console.log('omanTexts.json: 3 kosakata budaya, 3 label kartu, 2 tombol, keterangan pratinjau');
