import { useEffect, useRef, useState } from 'react';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type { FeatureCollection, LineString } from 'geojson';
import geography from '../assets/world-countries.json?url';
import { Icon } from './Icon';
import StationList, { StationSummary } from './StationList';
import { defaultStation, useStations } from './stations';
import { CAMERA, partialPath, ROUTE, STATION_COORDS, STATION_FRACTIONS } from './stationRoute';

const graticule = geoGraticule10();
const sphere = { type: 'Sphere' } as const;
const ICONS = ['greeting', 'person', 'book'];
const line = (coordinates: [number, number][]): LineString => ({ type: 'LineString', coordinates });

/**
 * Stasiun wahdah sebagai titik di sepanjang rute pada peta (gambar dan rute sama dengan globe Rihlah, tetapi statis: tanpa geser/zoom,
 * supaya halaman tetap bisa digulir di HP). Ketuk titik -> ringkasan wahdah di panel bawah.
 */
export default function StationMap() {
  const stations = useStations();
  const [selected, setSelected] = useState(() => defaultStation(stations));
  const [noCanvas, setNoCanvas] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);
  const draw = useRef<() => void>(() => {});
  // pecahan rute yang sudah ditempuh: sampai stasiun aktif (atau terakhir bila semua selesai)
  const reachIndex = Math.max(0, stations.findIndex(s => s.state === 'current') >= 0 ? stations.findIndex(s => s.state === 'current') : stations.length - 1);
  const reach = useRef(0);
  reach.current = STATION_FRACTIONS[reachIndex] ?? 0;

  useEffect(() => {
    const element = canvas.current!;
    const context = element.getContext('2d');
    if (!context) { setNoCanvas(true); return; }

    const projection = geoOrthographic().precision(0.5);
    const path = geoPath(projection, context);
    let land: FeatureCollection | undefined;
    let frame = 0;
    const request = new AbortController();
    const theme = matchMedia('(prefers-color-scheme: dark)');
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const width = element.clientWidth, height = element.clientHeight;
        if (!width || !height) return;
        const density = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(width * density), h = Math.round(height * density);
        if (element.width !== w || element.height !== h) { element.width = w; element.height = h; }
        context.setTransform(density, 0, 0, density, 0, 0);
        context.clearRect(0, 0, width, height);

        const { center, zoom } = CAMERA;
        const radius = Math.min(width, height) * 0.43 * zoom;
        const x = width / 2, y = height / 2;
        projection.translate([x, y]).scale(radius).rotate([-center[0], -center[1]]);

        const styles = getComputedStyle(element);
        const color = (name: string) => styles.getPropertyValue(name).trim();
        const ocean = context.createRadialGradient(x - radius * 0.32, y - radius * 0.38, 0, x, y, radius);
        ocean.addColorStop(0, color('--globe-water-light'));
        ocean.addColorStop(1, color('--globe-water'));
        context.beginPath(); path(sphere); context.fillStyle = ocean; context.fill();

        context.beginPath(); path(graticule); context.strokeStyle = color('--globe-grid'); context.lineWidth = 0.7; context.stroke();

        if (land) {
          context.beginPath(); path(land);
          context.fillStyle = color('--globe-land'); context.fill();
          context.strokeStyle = color('--globe-border'); context.lineWidth = 0.65; context.stroke();
          element.dataset.land = 'ready';
        }

        // seluruh rute (putus-putus), lalu bagian yang sudah ditempuh (penuh)
        context.beginPath(); path(line(ROUTE));
        context.strokeStyle = color('--globe-route'); context.lineWidth = 2.5; context.setLineDash([5, 5]); context.stroke(); context.setLineDash([]);
        if (reach.current > 0) {
          context.beginPath(); path(line(partialPath(ROUTE.slice(0, 6), reach.current)));
          context.strokeStyle = color('--brand'); context.lineWidth = 4; context.lineCap = 'round'; context.stroke(); context.lineCap = 'butt';
        }

        STATION_COORDS.forEach((coordinates, index) => {
          const pin = pins.current[index], point = projection(coordinates);
          if (!pin || !point) return;
          pin.style.left = `${point[0]}px`; pin.style.top = `${point[1]}px`;
        });
      });
    };
    draw.current = schedule;
    const resize = new ResizeObserver(schedule); resize.observe(element);
    theme.addEventListener('change', schedule);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    schedule();

    // berkas peta sama dengan globe: sudah masuk precache, jadi tetap jalan offline; bila gagal, air dan titik tetap tampil
    void fetch(geography, { signal: request.signal })
      .then(response => { if (!response.ok) throw new Error('Map data unavailable'); return response.json() as Promise<FeatureCollection>; })
      .then(data => { land = data; schedule(); })
      .catch(() => { /* peta dasar tidak wajib */ });

    return () => {
      request.abort(); resize.disconnect(); themeObserver.disconnect(); theme.removeEventListener('change', schedule);
      cancelAnimationFrame(frame); draw.current = () => {};
    };
  }, []);

  useEffect(() => { draw.current(); }, [reachIndex]);

  if (noCanvas) return <StationList />;
  const station = stations[selected] ?? stations[0];
  return <div className="station-wrap">
    <div className="station-map" data-testid="station-map">
      <canvas className="station-canvas" ref={canvas} aria-hidden="true" />
      {stations.map((s, i) => <button key={s.unit.id} ref={node => { pins.current[i] = node; }} type="button"
        className={`station-pin ${s.state}`} aria-pressed={selected === i} aria-label={s.label} data-station={s.unit.id} onClick={() => setSelected(i)}>
        <span className="station-dot"><Icon name={s.state === 'done' ? 'check' : s.state === 'locked' ? 'lock' : ICONS[i] ?? 'book'} /></span>
        <span className="station-name" lang="en" dir="ltr" aria-hidden="true">{s.port}</span>
      </button>)}
    </div>
    <section className={`station-panel ${station.state}`} aria-live="polite" aria-labelledby="station-title" data-testid="station-panel" data-station={station.unit.id}>
      <StationSummary station={station} headingId="station-title" />
    </section>
  </div>;
}
