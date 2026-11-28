// Rute untuk peta stasiun di layar Perjalanan (murni, tanpa d3, supaya mudah diuji).
// Titik rute disalin dari JourneyMap.tsx (Jakarta -> Colombo -> Muscat). JourneyMap dimuat malas (React.lazy),
// jadi tidak diimpor dari sini agar tidak menarik d3-geo ke bundel layar utama. Bila rute di JourneyMap berubah, ubah juga di sini
// (atau pindahkan keduanya ke satu modul bersama).
export type Position = [number, number];

export const ROUTE: Position[] = [
  [106.88, -6.11], [105.99, -5.93], [105.75, -5.87], [105.31, -6.02], [104.77, -6.13],
  [97.5, -2.1], [81.5, 5.2], [79.84, 6.93], [75.9, 8.2], [61, 19], [58.57, 23.63],
];

/** Ruas rute yang tampil di peta stasiun (Jakarta sampai pantai barat Sumatra). */
export const STATION_LEG: Position[] = ROUTE.slice(0, 6);

/**
 * Posisi stasiun sepanjang ruas, sebagai pecahan panjang jalur. Wahdah 1 tepat di Jakarta. Data rute tidak punya koordinat Banten dan Lampung
 * (keduanya hanya ±30 km dari Jakarta di sekitar Selat Sunda, jadi tidak bisa dipisahkan di layar HP): titik 2 dan 3 diletakkan
 * merata di sepanjang rute secara ILUSTRATIF supaya tiap titik tetap bisa diketuk (>=44 px).
 */
export const STATION_FRACTIONS = [0, 0.5, 1] as const;

export const CAMERA = { center: [102.3, -3.6] as Position, zoom: 9 };

const dist = (a: Position, b: Position) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function lengthOf(line: readonly Position[]): number {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += dist(line[i - 1], line[i]);
  return total;
}

/** Titik pada jalur di pecahan `f` (0..1) dari panjangnya. */
export function pointAlong(line: readonly Position[], f: number): Position {
  if (f <= 0 || line.length < 2) return line[0];
  if (f >= 1) return line[line.length - 1];
  let remaining = lengthOf(line) * f;
  for (let i = 1; i < line.length; i++) {
    const seg = dist(line[i - 1], line[i]);
    if (remaining <= seg || i === line.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, remaining / seg);
      return [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * t, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * t];
    }
    remaining -= seg;
  }
  return line[line.length - 1];
}

/** Bagian awal jalur sampai pecahan `f` (untuk menggambar rute yang sudah ditempuh). */
export function partialPath(line: readonly Position[], f: number): Position[] {
  if (f <= 0) return [line[0]];
  if (f >= 1) return [...line];
  const target = lengthOf(line) * f;
  const out: Position[] = [line[0]];
  let covered = 0;
  for (let i = 1; i < line.length; i++) {
    const seg = dist(line[i - 1], line[i]);
    if (covered + seg < target) { out.push(line[i]); covered += seg; continue; }
    out.push(pointAlong(line, f));
    break;
  }
  return out;
}

export const STATION_COORDS: Position[] = STATION_FRACTIONS.map(f => pointAlong(STATION_LEG, f));
