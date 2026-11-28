import { describe, expect, it } from 'vitest';
import { lengthOf, partialPath, pointAlong, ROUTE, STATION_COORDS, STATION_LEG } from './stationRoute';

describe('rute peta stasiun', () => {
  it('stasiun 1 tepat di Jakarta dan stasiun terakhir di ujung ruas', () => {
    expect(STATION_COORDS[0]).toEqual(ROUTE[0]);
    expect(STATION_COORDS[2]).toEqual(STATION_LEG[STATION_LEG.length - 1]);
  });
  it('tiga stasiun berbeda dan berjarak cukup (>1 derajat) agar tidak menumpuk', () => {
    const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    expect(d(STATION_COORDS[0], STATION_COORDS[1])).toBeGreaterThan(1);
    expect(d(STATION_COORDS[1], STATION_COORDS[2])).toBeGreaterThan(1);
  });
  it('pointAlong berada di jalur dan menurun terhadap pecahan', () => {
    const total = lengthOf(STATION_LEG);
    const dist = (f: number) => lengthOf(partialPath(STATION_LEG, f));
    for (const f of [0, 0.1, 0.5, 0.9, 1]) expect(dist(f)).toBeCloseTo(total * f, 6);
    expect(pointAlong(STATION_LEG, -1)).toEqual(STATION_LEG[0]);
    expect(pointAlong(STATION_LEG, 2)).toEqual(STATION_LEG[STATION_LEG.length - 1]);
  });
  it('partialPath(0) hanya titik awal dan partialPath(1) mencakup seluruh jalur', () => {
    expect(partialPath(STATION_LEG, 0)).toEqual([STATION_LEG[0]]);
    const full = partialPath(STATION_LEG, 1);
    expect(full[0]).toEqual(STATION_LEG[0]);
    expect(full[full.length - 1]).toEqual(STATION_LEG[STATION_LEG.length - 1]);
  });
  it('jalur dengan satu titik tidak melempar', () => {
    expect(pointAlong([[1, 2]], 0.5)).toEqual([1, 2]);
  });
});
