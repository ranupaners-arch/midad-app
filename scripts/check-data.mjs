#!/usr/bin/env node
// Validasi data Rihlah: routes.json, curriculum.json, tips.json (tanpa dependensi).
// Pakai: node scripts/check-data.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../design-system/assets/rihlah');
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const routes = load('routes.json');
const cur = load('curriculum.json');
const tips = load('tips.json');
const { MidadVehicles } = await import('../design-system/assets/maskot/vehicles.mjs');

const errors = [];
const warns = [];
const must = (cond, msg) => { if (!cond) errors.push(msg); };
const LANGS = ['ar', 'id', 'en'];
const hasLangs = (o, langs = LANGS) => o && langs.every((l) => typeof o[l] === 'string' && o[l].trim());

// ---------- routes.json ----------
must(routes.version === 2, 'routes.version harus 2');
const LEG = 8;
for (const [lang, legs] of Object.entries(routes.routes)) {
  const p = `routes.${lang}`;
  must(legs.length * LEG === routes.levels, `${p}: ${legs.length} etape × ${LEG} ≠ ${routes.levels} level`);
  legs.forEach((g, i) => {
    const q = `${p}[${i}]`;
    const start = i * LEG + 1;
    must(g.levels[0] === start && g.levels[1] === start + LEG - 1, `${q}: level ${g.levels} seharusnya ${start}–${start + LEG - 1}`);
    must(g.marhalah === Math.floor(i / 2) + 1, `${q}: marhalah ${g.marhalah} tidak cocok dengan urutan`);
    must(g.half === (i % 2) + 1, `${q}: half ${g.half} tidak cocok dengan urutan`);
    must(g.test === (g.half === 1 ? 'nisfi' : 'nihai'), `${q}: test harus ${g.half === 1 ? 'nisfi' : 'nihai'}`);
    must(hasLangs(g.region), `${q}: region butuh ar/id/en`);
    must(Object.hasOwn(MidadVehicles.V, g.vehicle), `${q}: kendaraan "${g.vehicle}" tidak ada di vehicles.js`);
    must(g.ports.length === LEG, `${q}: ${g.ports.length} pelabuhan, harus ${LEG}`);
    must(g.arab === g.levels[0] >= routes.arabArrivalLevel, `${q}: arab=${g.arab} tidak sesuai arabArrivalLevel ${routes.arabArrivalLevel}`);
    must(!('k' in g || 'j' in g || 'lv' in g), `${q}: masih memakai key lama k/j/lv`);
  });
}
const legStarts = Object.values(routes.routes)[0].map((g) => g.levels[0]);
for (const s of routes.placementStarts) {
  must(cur.marhalah.some((m) => m.levels[0] === s), `placementStarts ${s} bukan awal marhalah`);
}
must(legStarts.includes(routes.noTashkeelFromLevel), `noTashkeelFromLevel ${routes.noTashkeelFromLevel} bukan awal etape`);
const idArrival = routes.routes.id.find((g) => g.levels[0] === routes.arabArrivalLevel);
must(idArrival?.region.id === 'Oman', 'Rute ID: Oman harus menjadi gerbang di arabArrivalLevel (keputusan 21 Nov 2026)');

// ---------- curriculum.json ----------
must(cur.levels === routes.levels, 'curriculum.levels ≠ routes.levels');
must(cur.marhalah.length * cur.levelsPerMarhalah === cur.levels, 'jumlah marhalah × levelsPerMarhalah ≠ levels');
cur.marhalah.forEach((m, i) => {
  const start = i * cur.levelsPerMarhalah + 1;
  must(m.n === i + 1, `marhalah[${i}].n`);
  must(m.levels[0] === start && m.levels[1] === start + cur.levelsPerMarhalah - 1, `marhalah ${m.n}: level ${m.levels}`);
  must(hasLangs(m.name), `marhalah ${m.n}: name butuh ar/id/en`);
  must(hasLangs(m.cando, ['id', 'en']), `marhalah ${m.n}: cando butuh id/en`);
  if (i > 0) must(m.vocabCumulative > cur.marhalah[i - 1].vocabCumulative, `marhalah ${m.n}: vocabCumulative harus naik`);
});
const steps = cur.wahdahStructure.steps.map((s) => s.id);
must(steps.length === 6, `wahdahStructure: ${steps.length} langkah, harus 6`);
must(steps.includes(cur.wahdahStructure.chestAfterStep), 'chestAfterStep tidak ada di steps');
const [wMin, wMax] = cur.wahdahStructure.vocab.wordsPerSession;
for (const t of ['nisfi', 'nihai']) {
  const w = cur.tests[t].weights;
  must(Object.values(w).reduce((a, b) => a + b, 0) === 100, `tests.${t}.weights tidak berjumlah 100`);
}
cur.wahdah.forEach((w, i) => {
  const q = `wahdah level ${w.level}`;
  must(w.level === i + 1, `${q}: urutan level`);
  const m = cur.marhalah.find((x) => w.level >= x.levels[0] && w.level <= x.levels[1]);
  must(m && m.n === w.marhalah, `${q}: marhalah ${w.marhalah} salah`);
  must(w.n === w.level - (m ? m.levels[0] : 1) + 1, `${q}: nomor wahdah n=${w.n} salah`);
  must(typeof w.title === 'string' && w.title.trim(), `${q}: title kosong`);
  must(hasLangs(w.theme, ['id', 'en']) && hasLangs(w.cando, ['id', 'en']), `${q}: theme/cando butuh id/en`);
  const sessions = w.review ? cur.wahdahStructure.vocab.sessionsReview : cur.wahdahStructure.vocab.sessionsRegular;
  const per = w.newWords / sessions;
  if (per < wMin || per > wMax) warns.push(`${q}: ${w.newWords} kata / ${sessions} sesi = ${per.toFixed(1)} kata per sesi (di luar ${wMin}–${wMax})`);
  if (w.n === 8) must(w.test === 'nisfi', `${q}: wahdah 8 harus membawa tes nisfi`);
  if (w.n === 16) must(w.test === 'nihai', `${q}: wahdah 16 harus membawa tes nihai`);
});
for (const m of cur.marhalah) {
  const ws = cur.wahdah.filter((w) => w.marhalah === m.n);
  if (ws.length && ws.length < cur.levelsPerMarhalah) warns.push(`marhalah ${m.n}: baru ${ws.length}/${cur.levelsPerMarhalah} wahdah terisi`);
  if (!ws.length) warns.push(`marhalah ${m.n}: wahdah belum dirinci`);
  if (ws.length === cur.levelsPerMarhalah) {
    const total = ws.reduce((a, w) => a + w.newWords, 0);
    const prev = m.n > 1 ? cur.marhalah[m.n - 2].vocabCumulative : 0;
    warns.push(`marhalah ${m.n}: total kata baru ${total} (target ±${m.vocabCumulative - prev})`);
  }
}
must(cur.wahdah.filter((w) => w.demo).length >= 3, 'minimal 3 wahdah demo');

// ---------- tips.json ----------
must(Array.isArray(tips.tips) && tips.tips.length > 0, 'tips.json kosong');
tips.tips.forEach((t, i) => must(Array.isArray(t) && t.length === 3 && t.every((s) => typeof s === 'string' && s.trim()), `tips[${i}] harus [ar, id, en]`));

for (const w of warns) console.warn(`catatan: ${w}`);
if (errors.length) { console.error(errors.map((e) => `GAGAL: ${e}`).join('\n')); process.exit(1); }
console.log(`Data Rihlah valid: ${Object.keys(routes.routes).length} rute, ${cur.marhalah.length} marhalah, ${cur.wahdah.length} wahdah terinci, ${tips.tips.length} tips.`);
