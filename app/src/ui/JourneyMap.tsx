import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type { FeatureCollection, LineString } from 'geojson';
import routes from '../../../design-system/assets/rihlah/routes.json';
import geography from '../assets/world-countries.json?url';
import { l, unitsFor } from '../domain/content';
import { isUnitUnlocked } from '../domain/progress';
import { useProfile } from '../store';
import { Icon } from './Icon';
import { Text, Tr } from './Common';

type Position = [number, number];
type Camera = { center: Position; zoom: number };
const overview: Camera = { center: [83, 9], zoom: 1 };
const ports = [
  { name: 'Jakarta', coordinates: [106.88, -6.11] as Position },
  { name: 'Colombo', coordinates: [79.84, 6.93] as Position },
  { name: 'Muscat', coordinates: [58.57, 23.63] as Position },
];
const journey: LineString = {
  type: 'LineString',
  coordinates: [
    ports[0].coordinates, [105.99, -5.93], [105.75, -5.87], [105.31, -6.02], [104.77, -6.13],
    [97.5, -2.1], [81.5, 5.2], ports[1].coordinates, [75.9, 8.2], [61, 19], ports[2].coordinates,
  ],
};
const graticule = geoGraticule10();
const sphere = { type: 'Sphere' } as const;

export default function JourneyMap() {
  const { profile } = useProfile();
  const canvas = useRef<HTMLCanvasElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);
  const details = useRef<HTMLElement>(null);
  const camera = useRef<Camera>(overview);
  const pointers = useRef(new Map<number, Position>());
  const draw = useRef<() => void>(() => {});
  const [selected, setSelected] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const units = unitsFor(profile);
  const language = profile.language;
  const copy = (id: string, en: string) => language === 'id' ? id : en;

  useEffect(() => {
    document.getElementById('main-title')?.focus({ preventScroll: true });
    const element = canvas.current!;
    const context = element.getContext('2d');
    if (!context) { setUnavailable(true); return; }

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
        const actualWidth = Math.round(width * density), actualHeight = Math.round(height * density);
        if (element.width !== actualWidth || element.height !== actualHeight) {
          element.width = actualWidth;
          element.height = actualHeight;
        }
        context.setTransform(density, 0, 0, density, 0, 0);
        context.clearRect(0, 0, width, height);

        const { center, zoom } = camera.current;
        const radius = Math.min(width, height) * 0.43 * zoom;
        const x = width / 2, y = height / 2;
        projection.translate([x, y]).scale(radius).rotate([-center[0], -center[1]]);

        const styles = getComputedStyle(element);
        const color = (name: string) => styles.getPropertyValue(name).trim();
        const ocean = context.createRadialGradient(x - radius * 0.32, y - radius * 0.38, 0, x, y, radius);
        ocean.addColorStop(0, color('--globe-water-light'));
        ocean.addColorStop(1, color('--globe-water'));
        context.beginPath();
        path(sphere);
        context.fillStyle = ocean;
        context.fill();

        context.beginPath();
        path(graticule);
        context.strokeStyle = color('--globe-grid');
        context.lineWidth = 0.7;
        context.stroke();

        if (land) {
          context.beginPath();
          path(land);
          context.fillStyle = color('--globe-land');
          context.fill();
          context.strokeStyle = color('--globe-border');
          context.lineWidth = 0.65;
          context.stroke();
          element.dataset.land = 'ready';
        }

        context.beginPath();
        path(journey);
        context.strokeStyle = color('--globe-route');
        context.lineWidth = 2.5;
        context.setLineDash([5, 5]);
        context.stroke();
        context.setLineDash([]);

        context.beginPath();
        path(sphere);
        context.strokeStyle = color('--globe-border');
        context.lineWidth = 1;
        context.stroke();

        ports.forEach(({ coordinates }, index) => {
          const pin = pins.current[index];
          const point = projection(coordinates);
          if (!pin || !point) return;
          const [left, top] = point;
          pin.hidden = geoDistance(center, coordinates) >= Math.PI / 2
            || left < 20 || left > width - 20 || top < 20 || top > height - 20;
          if (!pin.hidden) {
            pin.style.left = `${left}px`;
            pin.style.top = `${top}px`;
          }
        });

        const card = details.current;
        if (card) {
          const pin = pins.current[Number(card.dataset.portIndex)];
          if (!pin || pin.hidden) {
            card.style.visibility = 'hidden';
          } else {
            const inset = 12;
            const { offsetWidth: cardWidth, offsetHeight: cardHeight } = card;
            const gap = pin.offsetHeight / 2 + 8;
            const below = pin.offsetTop + gap;
            const top = below + cardHeight > height - inset ? pin.offsetTop - gap - cardHeight : below;
            card.style.left = `${Math.max(inset, Math.min(width - inset - cardWidth, pin.offsetLeft - cardWidth / 2))}px`;
            card.style.top = `${Math.max(inset, Math.min(height - inset - cardHeight, top))}px`;
            card.style.visibility = 'visible';
          }
        }
      });
    };

    draw.current = schedule;
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    theme.addEventListener('change', schedule);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    schedule();

    void fetch(geography, { signal: request.signal })
      .then(response => {
        if (!response.ok) throw new Error('Map data unavailable');
        return response.json() as Promise<FeatureCollection>;
      })
      .then(data => { land = data; schedule(); })
      .catch(() => { if (!request.signal.aborted) setUnavailable(true); });

    return () => {
      request.abort();
      resize.disconnect();
      themeObserver.disconnect();
      theme.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
      draw.current = () => {};
    };
  }, []);

  useEffect(() => { draw.current(); }, [selected]);

  const closeDetails = () => {
    if (selected !== null) pins.current[selected]?.focus({ preventScroll: true });
    setSelected(null);
  };

  const update = (center: Position, zoom: number) => {
    camera.current = {
      center: [((center[0] % 360) + 540) % 360 - 180, Math.max(-85, Math.min(85, center[1]))],
      zoom: Math.max(1, Math.min(6, zoom)),
    };
    draw.current();
  };

  const rotate = (x: number, y: number) => {
    const { center, zoom } = camera.current;
    update([center[0] + x, center[1] + y], zoom);
  };

  const changeZoom = (factor: number) => update(camera.current.center, camera.current.zoom * factor);
  const reset = () => { update(overview.center, overview.zoom); setSelected(null); };
  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (selected !== null) setSelected(null);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, [event.clientX, event.clientY]);
  };
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const last = pointers.current.get(event.pointerId);
    if (!last) return;
    const next: Position = [event.clientX, event.clientY];
    const other = [...pointers.current].find(([id]) => id !== event.pointerId)?.[1];
    pointers.current.set(event.pointerId, next);
    if (other) {
      const distance = ([x, y]: Position) => Math.hypot(x - other[0], y - other[1]);
      if (distance(last) > 5) changeZoom(distance(next) / distance(last));
      return;
    }
    const element = event.currentTarget;
    const degrees = 130 / (Math.min(element.clientWidth, element.clientHeight) * camera.current.zoom);
    rotate((last[0] - next[0]) * degrees, (next[1] - last[1]) * degrees);
  };
  const onPointerEnd = (event: PointerEvent<HTMLCanvasElement>) => { pointers.current.delete(event.pointerId); };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && selected !== null) {
      event.preventDefault();
      closeDetails();
      return;
    }
    if (event.target !== event.currentTarget) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => rotate(-8, 0), ArrowRight: () => rotate(8, 0),
      ArrowUp: () => rotate(0, 8), ArrowDown: () => rotate(0, -8),
      '+': () => changeZoom(1.35), '-': () => changeZoom(1 / 1.35), Home: reset,
    };
    const action = actions[event.key];
    if (action) { event.preventDefault(); action(); }
  };

  return <main className="globe-page">
    <header className="globe-header">
      <Link className="icon-button" to="/" aria-label={copy('Kembali ke perjalanan', 'Back to journey')}><Icon name="back" /></Link>
      <h1 id="main-title" tabIndex={-1}>الْخَرِيطَةُ</h1>
      <button className="icon-button" type="button" onClick={reset} aria-label={copy('Lihat seluruh rute', 'Show full route')}><Icon name="globe" /></button>
    </header>
    <div className="globe-stage" role="region" aria-label={copy('Globe perjalanan', 'Journey globe')} tabIndex={0} onKeyDown={onKeyDown}>
      <canvas className="globe-canvas" ref={canvas} aria-hidden="true" onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onLostPointerCapture={onPointerEnd} />
      {ports.map((port, index) => <button key={port.name} ref={node => { pins.current[index] = node; }} hidden
        className="globe-port" type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{port.name}</button>)}
      {unavailable && <p className="globe-status" role="status">{copy('Peta dasar belum tersedia.', 'Basemap unavailable.')}</p>}
      <div className="globe-controls">
        <button className="icon-button" type="button" onClick={() => changeZoom(1.35)} aria-label={copy('Perbesar globe', 'Zoom in')}>+</button>
        <button className="icon-button" type="button" onClick={() => changeZoom(1 / 1.35)} aria-label={copy('Perkecil globe', 'Zoom out')}>−</button>
      </div>
      {selected !== null && <section className="unit-card globe-port-details" ref={details} data-port-index={selected} aria-labelledby="globe-port-title">
        <div className="globe-port-heading">
          <h2 id="globe-port-title" lang="en">{ports[selected].name}</h2>
          <button className="icon-button" type="button" onClick={closeDetails} aria-label={copy('Tutup detail pelabuhan', 'Close port details')}><Icon name="cross" /></button>
        </div>
        {selected === 0 ? <ul className="globe-unit-list" role="list">{routes.routes.id[0].ports.slice(0, 3).map((port, index) => {
          const unlocked = isUnitUnlocked(profile, index + 1);
          return <li key={port}>
            <div><b lang="ar">{units[index].title.ar}</b><span className="small-label" dir="ltr">{index + 1}. {port}</span><Tr text={units[index].title} small /></div>
            {unlocked
              ? <Link className="md-btn md-btn--secondary" to={`/unit/${index + 1}`} aria-label={copy(`Buka wahdah ${port}`, `Open ${port} unit`)}>اِفْتَحْ</Link>
              : <span className="locked-caption"><Text text={l('مُقْفَلٌ', 'Terkunci', 'Locked')} /></span>}
          </li>;
        })}</ul> : <p className="locked-caption"><Text text={l('غَيْرُ مُتَاحٍ بَعْدُ', 'Belum tersedia', 'Coming later')} /></p>}
      </section>}
    </div>
  </main>;
}
