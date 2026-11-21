/* Midad — hijrah vehicles. viewBox 0 0 512 320, waterline y=250, deck y≈200.
   ride(vehicleId, mascotCfg) puts the user's own mascot on board (nested 512 canvas at deck). */
(function (g) {
  const O = '#2a211a';
  const SW = `stroke="${O}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const WAVES = `<g class="vh-waves"><path d="M -20 262 Q 12 248 44 262 T 108 262 T 172 262 T 236 262 T 300 262 T 364 262 T 428 262 T 492 262 T 556 262 L 556 320 L -20 320 Z" fill="#2a9d8f"/>` +
    `<path d="M -20 280 Q 12 268 44 280 T 108 280 T 172 280 T 236 280 T 300 280 T 364 280 T 428 280 T 492 280 T 556 280" fill="none" stroke="#a8e0d6" stroke-width="5" stroke-linecap="round"/></g>`;
  const SAND = `<path d="M -20 262 Q 120 246 256 258 T 540 254 L 540 320 L -20 320 Z" fill="#e9c98a"/><path d="M 40 288 q 30 -8 60 0 M 300 296 q 30 -8 60 0" stroke="#c9a06a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const mast = (x, top) => `<path d="M ${x} 214 L ${x} ${top}" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`;
  const lateen = (x, top, w, fill) => `<path d="M ${x} ${top} L ${x + w} ${top + 28} C ${x + w * 0.7} ${top + 70} ${x + 10} ${top + 120} ${x - 4} 200 L ${x} ${top} Z" fill="${fill}" ${SW}/>`;
  const pennant = (x, top, c) => `<path d="M ${x} ${top} L ${x + 34} ${top + 8} L ${x} ${top + 16} Z" fill="${c}" ${SW}/>`;

  const V = {
    pinisi: { name: ['فِينِيسِي', 'Pinisi', 'Pinisi'], region: 'id', sea: true,
      back: () => mast(196, 40) + mast(300, 52) + `<path d="M 196 46 L 150 196 L 196 196 Z M 196 56 L 238 196 L 196 196 Z M 300 58 L 260 196 L 300 196 Z M 300 66 L 346 196 L 300 196 Z" fill="#fbf6ec" ${SW}/><path d="M 300 70 L 462 176" stroke="${O}" stroke-width="4"/><path d="M 300 74 L 430 168 L 330 196 Z" fill="#fbf6ec" ${SW}/>` + pennant(196, 36, '#0f766e'),
      hull: () => `<path d="M 60 196 L 470 186 C 452 228 420 252 380 254 L 132 254 C 96 250 70 228 60 196 Z" fill="#9c6a43" ${SW}/><path d="M 72 210 L 458 200" stroke="#0f766e" stroke-width="8"/><path d="M 84 228 L 440 220" stroke="#e9b949" stroke-width="5"/>` },
    jong: { name: ['جُونْغ', 'Jong Jawa', 'Javanese jong'], region: 'id', sea: true,
      back: () => mast(176, 40) + mast(300, 30) + [[176, 46, 70], [300, 36, 84]].map(([x, t, w]) => `<path d="M ${x - w / 2} ${t} L ${x + w / 2} ${t + 8} L ${x + w / 2 + 6} 196 L ${x - w / 2 - 6} 196 Z" fill="#c9622f" ${SW}/>` + [1, 2, 3, 4, 5].map(k => `<path d="M ${x - w / 2 - k} ${t + k * 27} L ${x + w / 2 + k} ${t + 8 + k * 26}" stroke="${O}" stroke-width="3"/>`).join('')).join('') + pennant(300, 24, '#e9b949'),
      hull: () => `<path d="M 50 170 L 120 200 L 400 200 L 470 168 C 466 222 430 254 380 254 L 140 254 C 90 254 56 222 50 170 Z" fill="#7c4a2d" ${SW}/><path d="M 70 206 L 450 204" stroke="#e9b949" stroke-width="6"/><circle cx="430" cy="214" r="10" fill="#fbf6ec" ${SW}/><circle cx="432" cy="214" r="4" fill="${O}"/>` },
    barge: { name: ['مَرْكَبُ التَّايْمْز', 'Kapal tongkang Thames', 'Thames sailing barge'], region: 'en', sea: true,
      back: () => mast(250, 26) + `<path d="M 250 34 L 380 60 L 360 196 L 250 196 Z" fill="#b5482b" ${SW}/><path d="M 250 34 L 360 196" stroke="${O}" stroke-width="4"/><path d="M 250 40 L 160 196 L 250 196 Z" fill="#c96b3f" ${SW}/><path d="M 420 150 L 444 196 L 410 196 Z" fill="#b5482b" ${SW}/>` + pennant(250, 18, '#0f766e'),
      hull: () => `<path d="M 60 196 L 460 196 L 448 240 C 440 252 430 254 410 254 L 100 254 C 80 254 70 246 66 236 Z" fill="#2a211a" ${SW}/><path d="M 66 212 L 456 212" stroke="#e9b949" stroke-width="5"/>` },
    caravel: { name: ['كَارَافِيل', 'Karavel', 'Caravel'], region: 'en', sea: true,
      back: () => mast(170, 70) + mast(270, 36) + mast(360, 90) + lateen(170, 74, 90, '#fbf6ec') + lateen(270, 40, 120, '#fbf6ec') + lateen(360, 94, 70, '#fbf6ec') + `<path d="M 270 70 Q 330 80 360 110" stroke="#0f766e" stroke-width="6" fill="none"/>` + pennant(270, 26, '#0f766e'),
      hull: () => `<path d="M 54 168 L 112 176 L 116 198 L 420 198 L 470 186 C 456 232 424 254 384 254 L 136 254 C 90 252 62 222 54 168 Z" fill="#9c6a43" ${SW}/><path d="M 70 214 L 452 210" stroke="#0f766e" stroke-width="7"/>` },
    baghlah: { name: ['بَغْلَة', 'Baghlah (Oman)', 'Baghlah (Oman)'], region: 'ar', sea: true,
      back: () => mast(200, 40) + mast(330, 76) + lateen(200, 44, 150, '#fbf6ec') + lateen(330, 80, 100, '#fbf6ec') + pennant(200, 30, '#c44530'),
      hull: () => `<path d="M 40 150 L 110 158 L 118 196 L 420 196 L 476 176 C 460 228 426 254 380 254 L 140 254 C 80 252 46 210 40 150 Z" fill="#b07a52" ${SW}/>` + [64, 82, 100].map(x => `<rect x="${x}" y="168" width="12" height="18" rx="3" fill="#e9b949" stroke="${O}" stroke-width="3"/>`).join('') + `<path d="M 60 214 L 456 208" stroke="#7c4a2d" stroke-width="6"/>` },
    boom: { name: ['بُوم', 'Boom (Teluk)', 'Boom (Gulf)'], region: 'ar', sea: true,
      back: () => mast(250, 30) + lateen(250, 34, 170, '#fbf6ec') + pennant(250, 18, '#0f766e'),
      hull: () => `<path d="M 40 178 L 120 198 L 400 198 L 480 172 C 450 230 416 254 372 254 L 148 254 C 96 254 62 226 40 178 Z" fill="#c9a06a" ${SW}/>` + [140, 190, 240, 290, 340].map(x => `<path d="M ${x} 212 l 12 12 l 12 -12" fill="none" stroke="#7c4a2d" stroke-width="4"/>`).join('') },
    sambuk: { name: ['سَنْبُوك', 'Sambuk (Laut Merah)', 'Sambuk (Red Sea)'], region: 'ar', sea: true,
      back: () => mast(260, 44) + lateen(260, 48, 150, '#f3e3d6') + pennant(260, 32, '#e9b949'),
      hull: () => `<path d="M 60 156 L 120 162 L 124 198 L 410 198 L 470 182 C 452 230 420 254 376 254 L 140 254 C 92 252 64 214 60 156 Z" fill="#8a5a3b" ${SW}/><path d="M 70 172 L 116 176 L 118 192 L 72 190 Z" fill="#0f766e" stroke="${O}" stroke-width="3"/><path d="M 70 214 L 450 210" stroke="#e9b949" stroke-width="5"/>` },
    qafilah: { name: ['قَافِلَة', 'Kafilah unta', 'Camel caravan'], region: 'ar', sea: false,
      back: () => [[110, 0.7], [400, 0.7]].map(([x, s]) => `<g transform="translate(${x} 150) scale(${s})" opacity=".9">${camelSide('#d9b072')}</g>`).join(''),
      hull: () => `<g transform="translate(256 96)">${camelSide('#e3b86b', true)}</g>` },
    felucca: { name: ['فَلُوكَة', 'Felucca (Sungai Nil)', 'Felucca (Nile)'], region: 'ar', sea: true,
      back: () => mast(236, 60) + `<path d="M 120 210 L 420 20 C 400 100 330 170 236 206 Z" fill="#ffffff" ${SW}/><path d="M 120 210 L 420 20" stroke="${O}" stroke-width="5"/>`,
      hull: () => `<path d="M 80 198 L 440 198 C 424 236 396 252 360 252 L 156 252 C 120 252 94 232 80 198 Z" fill="#1f6fa8" ${SW}/><path d="M 92 212 L 430 212" stroke="#e9b949" stroke-width="5"/>` },
    xebec: { name: ['شَبَّاك', 'Xebec (Maghrib)', 'Xebec (Maghreb)'], region: 'ar', sea: true,
      back: () => mast(150, 70) + mast(260, 36) + mast(370, 70) + lateen(150, 74, 90, '#fbf6ec') + lateen(260, 40, 120, '#c9622f') + lateen(370, 74, 80, '#fbf6ec') + pennant(260, 24, '#0f766e'),
      hull: () => `<path d="M 30 180 L 110 196 L 420 196 L 488 176 C 460 230 420 254 376 254 L 140 254 C 90 252 52 226 30 180 Z" fill="#2a6b5e" ${SW}/>` + [140, 180, 220, 260, 300, 340, 380].map(x => `<path d="M ${x} 222 L ${x - 18} 262" stroke="#7c4a2d" stroke-width="5" stroke-linecap="round"/>`).join('') + `<path d="M 50 206 L 470 202" stroke="#e9b949" stroke-width="6"/>` }
  };

  function camelSide(fill, saddle) {
    return `<path d="M -110 60 C -110 20 -60 0 -30 24 C -10 -20 40 -20 50 24 C 70 30 90 40 96 60 L 96 70 C 80 90 40 96 -10 96 L -80 96 C -100 92 -110 80 -110 60 Z" fill="${fill}" ${SW}/>` +
      `<path d="M 90 56 C 110 30 120 0 130 -30 C 136 -46 160 -50 170 -36 C 176 -26 168 -16 156 -18 C 146 -10 136 20 120 64 Z" fill="${fill}" ${SW}/><circle cx="156" cy="-34" r="4" fill="${O}"/>` +
      [-90, -50, 30, 70].map(x => `<path d="M ${x} 90 L ${x} 150" stroke="${O}" stroke-width="16" stroke-linecap="round"/><path d="M ${x} 90 L ${x} 150" stroke="${fill}" stroke-width="8" stroke-linecap="round"/>`).join('') +
      (saddle ? `<path d="M -60 14 C -40 -10 20 -10 34 14 L 30 34 L -56 34 Z" fill="#c44530" ${SW}/><path d="M -56 34 L -50 60 M 30 34 L 24 60" stroke="#e9b949" stroke-width="5"/>` : '');
  }

  function ride(id, cfg, opts) {
    opts = opts || {};
    const v = V[id] || V.baghlah, M = g.MidadMascot;
    const deckY = v.sea ? 214 : 118, mx = v.sea ? 178 : 176, size = v.sea ? 156 : 160;
    const mascot = M ? M.render(cfg || {}, { attrs: `x="${mx}" y="${deckY - size * 0.94}" width="${size}" height="${size}"`, cls: 'vh-rider' }) : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 320" class="vh ${opts.cls || ''}" role="img" aria-label="${v.name[0]}" ${opts.attrs || ''}>` +
      (v.sea ? '' : SAND) + `<g class="vh-boat">` + v.back() + mascot + v.hull() + `</g>` + (v.sea ? WAVES : '') + `</svg>`;
  }

  g.MidadVehicles = { ride, V };
})(typeof window !== 'undefined' ? window : globalThis);
