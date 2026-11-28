/* Midad — mascot system. One shared chibi posture for every animal:
   512 canvas, ground y=480, egg body (124..388 x, 166..440 y), eyes y=236 (x 216/296),
   nose y=272, mouth y=294, head-top y=176, hand anchor (392,262), neck y=330.
   Layers: shadow, tail+back-features, legs, back-limb, body, body-overlay (belly, pattern, muzzle, markings),
   outline, neck-item, eyes, nose, mouth/beak, head-item, front-limb, hand-item.
   Colours via CSS vars on <svg>: --mb body, --mbd body dark, --mbl belly/light, --ma accent. Outline #2a211a. */
(function (g) {
  const O = '#2a211a', TIP = '#3b2a1e', CREAM = '#fbf6ec', BEAK = '#8a5a3b', BEAKD = '#6b4329', PINK = '#f4a7b0';
  const SW = `stroke="${O}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;
  let uid = 0;

  const BODY_D = 'M 256 166 C 342 166 388 236 388 314 C 388 392 330 440 256 440 C 182 440 124 392 124 314 C 124 236 170 166 256 166 Z';
  const BELLY = `<path d="M 256 296 C 302 296 328 336 328 374 C 328 410 298 432 256 432 C 214 432 184 410 184 374 C 184 336 210 296 256 296 Z" fill="var(--mbl)"/>`;
  const CHEEKS = `<ellipse cx="190" cy="274" rx="16" ry="9" fill="#ef8f8f" opacity=".45"/><ellipse cx="322" cy="274" rx="16" ry="9" fill="#ef8f8f" opacity=".45"/>`;
  const SHADOW = `<ellipse cx="256" cy="478" rx="120" ry="12" fill="${O}" opacity=".12"/>`;

  // ---------- shared limbs ----------
  const WING_D = 'M 0 -62 C 34 -60 44 -10 34 30 C 30 48 24 60 16 70 L 10 62 L 4 76 L -4 64 L -12 74 L -16 60 C -28 48 -38 30 -36 10 C -40 -20 -32 -60 0 -62 Z';
  function wing(side, raised, id) {
    const cx = 256 + side * 128, cy = raised ? 300 : 322, rot = side * (raised ? -38 : -12);
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><clipPath id="${id}"><path d="${WING_D}"/></clipPath>` +
      `<path d="${WING_D}" fill="var(--mbd)"/><g clip-path="url(#${id})">` +
      [4, 28, 52].map(y => `<rect x="-50" y="${y}" width="100" height="12" fill="${CREAM}"/><rect x="-50" y="${y + 12}" width="100" height="10" fill="${TIP}"/>`).join('') +
      `</g><path d="${WING_D}" fill="none" ${SW}/></g>`;
  }
  const PAW_D = 'M -18 -46 C -18 -58 18 -58 18 -46 L 20 30 C 20 50 -20 50 -20 30 Z';
  function paw(side, raised) {
    const cx = 256 + side * 126, cy = raised ? 292 : 330, rot = side * (raised ? -40 : -16);
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="${PAW_D}" fill="var(--mb)" ${SW}/>` +
      `<path d="M -8 40 L -8 32 M 0 42 L 0 33 M 8 40 L 8 32" stroke="${O}" stroke-width="4" stroke-linecap="round"/></g>`;
  }
  const LEGS = {
    bird: () => [222, 290].map(x => `<path d="M ${x} 430 L ${x} 468 M ${x - 16} 474 L ${x} 464 L ${x + 16} 474 M ${x} 464 L ${x} 476" fill="none" stroke="${BEAKD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`).join(''),
    paw: () => [222, 290].map(x => `<path d="M ${x - 22} 410 L ${x - 22} 462 C ${x - 22} 478 ${x + 22} 478 ${x + 22} 462 L ${x + 22} 410 Z" fill="var(--mb)" ${SW}/><path d="M ${x - 6} 466 L ${x - 6} 474 M ${x + 6} 466 L ${x + 6} 474" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`).join('')
  };

  // ---------- shared face parts ----------
  const EX = [216, 296], EY = 236;
  const roundEye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${O}" stroke-width="5"/><circle cx="${x + 2}" cy="${y + 2}" r="${r * 0.55}" fill="${O}"/><circle cx="${x + 6}" cy="${y - 4}" r="${r * 0.2}" fill="#fff"/>`;
  const arcEye = (x, y) => `<path d="M ${x - 16} ${y + 6} Q ${x} ${y - 16} ${x + 16} ${y + 6}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`;
  const EYES = {
    round: () => EX.map(x => roundEye(x, EY, 22)).join(''),
    happy: () => EX.map(x => arcEye(x, EY)).join(''),
    sleepy: () => EX.map(x => `<circle cx="${x}" cy="${EY}" r="20" fill="#fff" stroke="${O}" stroke-width="5"/><circle cx="${x + 2}" cy="${EY + 6}" r="10" fill="${O}"/><path d="M ${x - 22} ${EY - 2} A 22 22 0 0 1 ${x + 22} ${EY - 2} Z" fill="var(--mbd)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`).join(''),
    star: () => EX.map(x => `<circle cx="${x}" cy="${EY}" r="22" fill="#e9b949" stroke="${O}" stroke-width="5"/><path d="M ${x} ${EY - 14} Q ${x + 3} ${EY - 3} ${x + 14} ${EY} Q ${x + 3} ${EY + 3} ${x} ${EY + 14} Q ${x - 3} ${EY + 3} ${x - 14} ${EY} Q ${x - 3} ${EY - 3} ${x} ${EY - 14} Z" fill="#fff"/>`).join(''),
    determined: () => EX.map((x, i) => roundEye(x, EY + 2, 20) + `<path d="M ${x - 22} ${EY - (i ? 34 : 24)} L ${x + 22} ${EY - (i ? 24 : 34)}" stroke="${O}" stroke-width="8" stroke-linecap="round"/>`).join(''),
    wink: () => roundEye(EX[0], EY, 22) + arcEye(EX[1], EY),
    dot: () => EX.map(x => `<circle cx="${x}" cy="${EY}" r="9" fill="${O}"/><circle cx="${x + 3}" cy="${EY - 3}" r="2.5" fill="#fff"/>`).join(''),
    sad: () => EX.map((x, i) => roundEye(x, EY + 4, 20) + `<path d="M ${x - 20} ${EY - (i ? 20 : 30)} L ${x + 20} ${EY - (i ? 30 : 20)}" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`).join(''),
    up: () => EX.map(x => `<circle cx="${x}" cy="${EY}" r="22" fill="#fff" stroke="${O}" stroke-width="5"/><circle cx="${x + 4}" cy="${EY - 8}" r="11" fill="${O}"/><circle cx="${x + 7}" cy="${EY - 12}" r="4" fill="#fff"/>`).join(''),
    lashes: () => EX.map((x, i) => roundEye(x, EY, 22) + [-1, 0, 1].map(k => { const s = i ? 1 : -1, a = (-90 + s * 35 + k * 22) * Math.PI / 180; return `<path d="M ${x + Math.cos(a) * 24} ${EY + Math.sin(a) * 24} L ${x + Math.cos(a) * 36} ${EY + Math.sin(a) * 36}" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`; }).join('')).join('')
  };
  const BEAKS = {
    long: () => `<path d="M 240 258 Q 256 250 272 258 Q 270 300 258 346 Q 254 352 252 344 Q 244 300 240 258 Z" fill="${BEAK}" ${SW}/><path d="M 247 266 Q 252 300 255 330" stroke="#b07a52" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    smile: () => `<path d="M 238 258 Q 256 250 274 258 Q 272 286 260 314 Q 256 318 252 314 Q 240 286 238 258 Z" fill="${BEAK}" ${SW}/><path d="M 236 276 Q 256 292 276 276" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    short: () => `<path d="M 236 258 Q 256 248 276 258 Q 276 282 256 298 Q 236 282 236 258 Z" fill="${BEAK}" ${SW}/>`,
    laugh: () => `<path d="M 238 256 Q 256 248 274 256 L 262 300 Q 256 304 250 300 Z" fill="${BEAK}" ${SW}/><path d="M 242 300 Q 256 324 270 300 Q 256 306 242 300 Z" fill="#f28b8b" ${SW}/><path d="M 244 318 Q 256 346 268 318" fill="${BEAKD}" ${SW}/>`
  };
  const NOSES = {
    tri: () => `<path d="M 244 266 L 268 266 L 256 280 Z" fill="${PINK}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>`,
    button: () => `<ellipse cx="256" cy="272" rx="13" ry="10" fill="${O}"/><circle cx="252" cy="268" r="3.5" fill="#fff" opacity=".7"/>`,
    camel: () => `<path d="M 236 274 Q 242 266 248 276 M 276 274 Q 270 266 264 276" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    heart: () => `<path d="M 256 282 C 240 270 242 260 250 260 C 254 260 256 264 256 266 C 256 264 258 260 262 260 C 270 260 272 270 256 282 Z" fill="${O}"/>`,
    oval: () => `<ellipse cx="256" cy="272" rx="18" ry="11" fill="#4a3426" stroke="${O}" stroke-width="4"/><ellipse cx="248" cy="273" rx="3" ry="4" fill="${O}"/><ellipse cx="264" cy="273" rx="3" ry="4" fill="${O}"/>`,
    dots: () => `<ellipse cx="249" cy="270" rx="3" ry="4" fill="${O}"/><ellipse cx="263" cy="270" rx="3" ry="4" fill="${O}"/>`
  };
  const MY = 294;
  const MOUTHS = {
    smile: () => `<path d="M 236 ${MY - 6} Q 256 ${MY + 14} 276 ${MY - 6}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    laugh: () => `<path d="M 236 ${MY - 8} Q 256 ${MY - 4} 276 ${MY - 8} Q 274 ${MY + 22} 256 ${MY + 22} Q 238 ${MY + 22} 236 ${MY - 8} Z" fill="#7a2e2e" ${SW}/><path d="M 246 ${MY + 14} Q 256 ${MY + 4} 266 ${MY + 14} Q 256 ${MY + 22} 246 ${MY + 14} Z" fill="#f28b8b"/>`,
    small: () => `<path d="M 246 ${MY - 4} Q 256 ${MY + 4} 266 ${MY - 4}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    w: () => `<path d="M 238 ${MY - 8} Q 247 ${MY + 4} 256 ${MY - 6} Q 265 ${MY + 4} 274 ${MY - 8}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    tongue: () => `<path d="M 262 ${MY - 2} Q 272 ${MY + 18} 266 ${MY + 20} Q 258 ${MY + 22} 256 ${MY} Z" fill="#f28b8b" stroke="${O}" stroke-width="4"/><path d="M 236 ${MY - 6} Q 256 ${MY + 10} 276 ${MY - 6}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    o: () => `<ellipse cx="256" cy="${MY + 2}" rx="8" ry="10" fill="#7a2e2e" stroke="${O}" stroke-width="5"/>`,
    grin: () => `<path d="M 236 ${MY - 8} L 276 ${MY - 8} Q 274 ${MY + 12} 256 ${MY + 12} Q 238 ${MY + 12} 236 ${MY - 8} Z" fill="#fff" ${SW}/><path d="M 246 ${MY - 8} L 246 ${MY + 8} M 256 ${MY - 8} L 256 ${MY + 12} M 266 ${MY - 8} L 266 ${MY + 8}" stroke="${O}" stroke-width="3"/>`,
    frown: () => `<path d="M 238 ${MY + 6} Q 256 ${MY - 10} 274 ${MY + 6}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`,
    flat: () => `<path d="M 244 ${MY} L 268 ${MY}" stroke="${O}" stroke-width="5" stroke-linecap="round"/>`
  };

  // ---------- shared items ----------
  const HEAD = {
    none: () => '',
    kumma: () => `<path d="M 186 196 C 186 150 326 150 326 196 L 326 204 C 296 214 216 214 186 204 Z" fill="#ffffff" ${SW}/><path d="M 192 196 C 222 206 290 206 320 196" fill="none" stroke="#0f766e" stroke-width="6"/>` +
      [200, 224, 248, 272, 296].map(x => `<path d="M ${x} 180 l 8 -8 l 8 8 l -8 8 z" fill="#0f766e"/>`).join('') + [212, 236, 260, 284].map(x => `<circle cx="${x + 8}" cy="166" r="3.5" fill="#e9b949"/>`).join(''),
    mussar: () => `<path d="M 170 204 C 160 150 220 128 256 130 C 292 128 352 150 342 204 C 300 222 212 222 170 204 Z" fill="#0f766e" ${SW}/><path d="M 180 186 C 220 160 300 152 334 176 M 186 166 C 226 142 290 140 324 156" fill="none" stroke="#e9b949" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="M 334 196 C 356 212 362 244 352 270 L 340 266 C 346 244 340 222 326 208 Z" fill="#0f766e" ${SW}/><path d="M 338 250 L 352 254" stroke="#e9b949" stroke-width="5"/>`,
    peci: () => `<path d="M 194 202 L 200 152 C 236 140 276 140 312 152 L 318 202 C 278 212 234 212 194 202 Z" fill="${O}" ${SW}/><path d="M 202 160 C 238 150 274 150 310 160" fill="none" stroke="#4a3a2e" stroke-width="5"/>`
  };
  const NECK = {
    none: () => '',
    scarf: () => `<path d="M 168 318 C 210 340 302 340 344 318 L 348 346 C 302 370 210 370 164 346 Z" fill="#0f766e" ${SW}/>` + [190, 222, 256, 290, 322].map((x, i) => `<circle cx="${x}" cy="${338 + (i % 2 ? 4 : 0)}" r="5" fill="#e9b949"/>`).join('') +
      `<path d="M 300 352 L 318 410 L 292 404 L 280 356 Z" fill="#0f766e" ${SW}/><path d="M 292 380 l 10 0" stroke="#e9b949" stroke-width="5"/>`
  };
  const HAND = {
    none: () => '',
    qalam: () => `<g transform="translate(410 230) rotate(32)"><rect x="-8" y="-70" width="16" height="130" rx="6" fill="#b07a52" ${SW}/><path d="M -8 60 L 0 92 L 8 60 Z" fill="#e9d3b0" ${SW}/><path d="M 0 66 L 0 84" stroke="${O}" stroke-width="3"/>` +
      `<path d="M 0 98 C 6 106 8 112 8 116 A 8 8 0 0 1 -8 116 C -8 112 -6 106 0 98 Z" fill="#0f766e" stroke="${O}" stroke-width="4"/><path d="M -8 -40 h 16 M -8 -10 h 16" stroke="${BEAKD}" stroke-width="4"/></g>`,
    inkpot: () => `<g transform="translate(404 250)"><path d="M -30 -6 C -34 30 -26 50 0 50 C 26 50 34 30 30 -6 Z" fill="#cfe9e5" ${SW}/><path d="M -28 14 C -28 40 -20 48 0 48 C 20 48 28 40 28 14 Z" fill="#0f766e"/><rect x="-16" y="-28" width="32" height="24" rx="5" fill="#7c4a2d" ${SW}/></g>`,
    book: () => `<g transform="translate(400 252) rotate(-8)"><path d="M 0 -30 C -22 -40 -44 -38 -58 -30 L -58 34 C -44 26 -22 26 0 36 C 22 26 44 26 58 34 L 58 -30 C 44 -38 22 -40 0 -30 Z" fill="${CREAM}" ${SW}/><path d="M 0 -30 L 0 36" stroke="${O}" stroke-width="5"/>` +
      [-14, -2, 10].map(y => `<path d="M -48 ${y} q 20 -6 40 0 M 8 ${y} q 20 -6 40 0" stroke="#cdbfa5" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('') + `</g>`,
    lantern: () => `<g transform="translate(404 230)"><circle cy="-56" r="9" fill="none" stroke="${O}" stroke-width="5"/><path d="M -16 -48 L 16 -48 L 22 -36 L -22 -36 Z" fill="#c9741f" ${SW}/><path d="M -26 -36 L 26 -36 L 30 30 L -30 30 Z" fill="#f6c45a" ${SW}/>` +
      `<path d="M -12 -36 L -14 30 M 12 -36 L 14 30" stroke="${O}" stroke-width="4"/><path d="M 0 -18 C 10 -4 10 8 0 14 C -10 8 -10 -4 0 -18 Z" fill="#ef8f24"/><path d="M -24 30 L 24 30 L 18 44 L -18 44 Z" fill="#c9741f" ${SW}/></g>`,
    dates: () => `<g transform="translate(404 262)"><path d="M -46 -8 L 46 -8 L 36 38 L -36 38 Z" fill="#c9a06a" ${SW}/>` + [[-26, -14], [-8, -20], [10, -16], [28, -12], [-16, -28], [4, -32], [20, -26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="8" fill="#7c4a2d" stroke="${O}" stroke-width="4"/>`).join('') +
      [-30, -10, 10, 30].map(x => `<path d="M ${x} -4 L ${x - 4} 34" stroke="#9c7547" stroke-width="3"/>`).join('') + `</g>`,
    dhow: () => `<g transform="translate(404 248)"><path d="M -54 18 L 54 18 L 40 44 L -40 44 Z" fill="#9c6a43" ${SW}/><path d="M 0 18 L 0 -58" stroke="${O}" stroke-width="6"/><path d="M 4 -54 C 36 -30 44 -4 40 12 L 4 12 Z" fill="${CREAM}" ${SW}/><path d="M -4 -40 L -36 12 L -4 12 Z" fill="${CREAM}" ${SW}/></g>`,
    telescope: () => `<g transform="translate(404 252) rotate(-30)"><rect x="-56" y="-12" width="56" height="24" rx="4" fill="#c99a2e" ${SW}/><rect x="0" y="-16" width="44" height="32" rx="4" fill="#e9b949" ${SW}/><rect x="-70" y="-8" width="16" height="16" rx="3" fill="#7c4a2d" ${SW}/></g>`,
    scroll: () => `<g transform="translate(402 250) rotate(-20)"><rect x="-50" y="-20" width="100" height="40" rx="8" fill="${CREAM}" ${SW}/><circle cx="-50" cy="0" r="20" fill="#f2e6cc" ${SW}/><circle cx="-50" cy="0" r="7" fill="none" stroke="${O}" stroke-width="4"/>` +
      `<path d="M 6 -20 L 6 20 M 0 18 L 6 40 L 14 22" fill="#e0573f" stroke="#c44530" stroke-width="7" stroke-linecap="round"/></g>`
  };


  // ---------- character marks (bukan item lemari: penanda tokoh cerita, mis. tokoh perempuan di ilustrasi kosakata) ----------
  // Digambar di atas badan bersama, jadi pas untuk kelima hewan. Warna tetap (bukan var(--mb)) agar terbaca di atas semua warna bulu dan di mode gelap.
  const ROSE = '#e56b8a', ROSED = '#b8405f';
  const MARK = {
    none: { body: () => '', head: () => '' },
    female: {
      // rok mengembang menutup pangkal kaki; hanya telapak yang terlihat di bawahnya
      body: () => `<path d="M 146 384 C 200 398 312 398 366 384 L 398 452 C 330 466 182 466 114 452 Z" fill="${ROSE}" ${SW}/>` +
        `<path d="M 188 398 L 168 458 M 256 402 L 256 462 M 324 398 L 344 458" stroke="${ROSED}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
        `<path d="M 150 388 C 200 402 312 402 362 388" fill="none" stroke="${ROSED}" stroke-width="7" stroke-linecap="round"/>`,
      // pita di puncak kepala
      head: () => `<g transform="translate(256 166)"><path d="M 0 0 C -14 -30 -56 -34 -58 -8 C -59 16 -22 16 0 0 Z" fill="${ROSE}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M 0 0 C 14 -30 56 -34 58 -8 C 59 16 22 16 0 0 Z" fill="${ROSE}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M -16 -8 L -40 -12 M 16 -8 L 40 -12" stroke="${ROSED}" stroke-width="4" stroke-linecap="round"/>` +
        `<circle r="12" fill="${ROSED}" stroke="${O}" stroke-width="5"/></g>`
    }
  };

  // ---------- skins / outer (clipped to the shared body, so they fit every animal) ----------
  const NAVY = '#1f3a5f', GOLDC = '#e9b949', GOLDD = '#b5871a';
  const kawung = (cx, cy) => [0, 90, 180, 270].map(a => `<ellipse cx="${cx}" cy="${cy - 9}" rx="5" ry="9" transform="rotate(${a} ${cx} ${cy})" fill="#f3e3d6"/>`).join('') + `<circle cx="${cx}" cy="${cy}" r="3" fill="#7c4a2d"/>`;
  const SKINS = {
    none: { tier: 'none', draw: () => '' },
    sailor: { tier: 'common', draw: () => `<rect x="100" y="300" width="312" height="160" fill="#ffffff"/>` + [318, 346, 374, 402, 430].map(y => `<rect x="100" y="${y}" width="312" height="12" fill="${NAVY}"/>`).join('') +
      `<path d="M 186 296 L 256 352 L 326 296 L 326 312 L 256 368 L 186 312 Z" fill="${NAVY}"/><path d="M 196 304 L 256 352 L 316 304" fill="none" stroke="#fff" stroke-width="4"/><path d="M 256 300 L 300 300" stroke="${O}" stroke-width="0"/>` },
    vest: { tier: 'common', draw: () => `<path d="M 100 286 L 222 300 L 236 460 L 100 460 Z M 412 286 L 290 300 L 276 460 L 412 460 Z" fill="#0f766e"/><path d="M 222 300 L 236 460 M 290 300 L 276 460" stroke="${O}" stroke-width="5"/>` +
      [330, 370, 410].map(y => `<circle cx="214" cy="${y}" r="6" fill="${GOLDC}" stroke="${O}" stroke-width="3"/>`).join('') },
    batik: { tier: 'common', draw: () => `<rect x="100" y="300" width="312" height="160" fill="#7c4a2d"/><path d="M 100 300 L 412 300" stroke="${O}" stroke-width="5"/>` +
      [[150, 330], [200, 330], [250, 330], [300, 330], [350, 330], [175, 370], [225, 370], [275, 370], [325, 370], [150, 410], [200, 410], [250, 410], [300, 410], [350, 410]].map(([x, y]) => kawung(x, y)).join('') },
    dishdasha: { tier: 'rare', draw: () => `<rect x="100" y="290" width="312" height="170" fill="#fbfaf6"/><path d="M 100 290 L 412 290" stroke="${O}" stroke-width="5"/><path d="M 226 290 Q 256 312 286 290" fill="none" stroke="${O}" stroke-width="4"/>` +
      `<path d="M 256 304 L 256 380" stroke="#cdbfa5" stroke-width="4"/><path d="M 248 380 L 264 380 L 268 412 L 244 412 Z" fill="#cdbfa5" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><path d="M 248 412 L 246 424 M 256 412 L 256 426 M 264 412 L 266 424" stroke="#cdbfa5" stroke-width="3"/>` },
    koko: { tier: 'rare', draw: () => `<rect x="100" y="292" width="312" height="168" fill="#f3e3d6"/><path d="M 100 292 L 412 292" stroke="${O}" stroke-width="5"/><rect x="240" y="292" width="32" height="120" fill="#0f766e"/>` +
      [310, 336, 362, 388].map(y => `<path d="M 256 ${y - 9} l 9 9 l -9 9 l -9 -9 z" fill="${GOLDC}"/>`).join('') + `<path d="M 240 292 L 240 412 M 272 292 L 272 412" stroke="${O}" stroke-width="4"/>` },
    nakhoda: { tier: 'epic', draw: () => `<rect x="100" y="282" width="312" height="178" fill="${NAVY}"/><path d="M 100 282 L 412 282" stroke="${O}" stroke-width="5"/><path d="M 226 282 L 256 330 L 286 282 Z" fill="#fff"/>` +
      [318, 350, 382].map(y => `<circle cx="232" cy="${y}" r="6" fill="${GOLDC}" stroke="${O}" stroke-width="3"/><circle cx="280" cy="${y}" r="6" fill="${GOLDC}" stroke="${O}" stroke-width="3"/>`).join('') +
      `<rect x="100" y="404" width="312" height="14" fill="${GOLDD}"/><rect x="246" y="400" width="20" height="22" rx="3" fill="${GOLDC}" stroke="${O}" stroke-width="3"/>` +
      `<path d="M 128 262 L 176 272 L 172 284 L 124 276 Z M 384 262 L 336 272 L 340 284 L 388 276 Z" fill="${GOLDC}" stroke="${O}" stroke-width="3"/>` },
    scholar: { tier: 'epic', draw: () => `<rect x="100" y="286" width="312" height="174" fill="#1d5c4a"/><path d="M 100 286 L 412 286" stroke="${O}" stroke-width="5"/>` +
      `<path d="M 100 270 L 214 286 L 230 460 L 100 460 Z M 412 270 L 298 286 L 282 460 L 412 460 Z" fill="#2a211a"/><path d="M 214 286 L 230 460 M 298 286 L 282 460" stroke="${GOLDC}" stroke-width="8"/><path d="M 210 300 L 226 460 M 302 300 L 286 460" stroke="${GOLDD}" stroke-width="3"/>` },
    goldbisht: { tier: 'legendary', draw: () => `<rect x="100" y="282" width="312" height="178" fill="#fbfaf6"/><path d="M 100 262 L 216 282 L 234 460 L 100 460 Z M 412 262 L 296 282 L 278 460 L 412 460 Z" fill="${GOLDC}"/>` +
      `<path d="M 216 282 L 234 460 M 296 282 L 278 460" stroke="${GOLDD}" stroke-width="10"/>` +
      [[150, 320], [160, 380], [360, 320], [352, 380]].map(([x, y]) => `<path d="M ${x - 18} ${y} C ${x - 18} ${y - 18} ${x + 18} ${y - 18} ${x + 18} ${y} C ${x + 18} ${y + 12} ${x} ${y + 12} ${x} ${y}" fill="none" stroke="${GOLDD}" stroke-width="4" stroke-linecap="round"/>`).join('') +
      `<g class="mm-spark">` + [[150, 300], [372, 352], [176, 420]].map(([x, y]) => `<path d="M ${x} ${y - 12} Q ${x + 2} ${y - 2} ${x + 12} ${y} Q ${x + 2} ${y + 2} ${x} ${y + 12} Q ${x - 2} ${y + 2} ${x - 12} ${y} Q ${x - 2} ${y - 2} ${x} ${y - 12} Z" fill="#fff"/>`).join('') + `</g>` },
    nightink: { tier: 'legendary', draw: () => `<rect x="100" y="150" width="312" height="310" fill="#0d2b3a"/><path d="M 256 296 C 302 296 328 336 328 374 C 328 410 298 432 256 432 C 214 432 184 410 184 374 C 184 336 210 296 256 296 Z" fill="#15475e"/>` +
      `<g class="mm-spark">` + [[160, 200], [340, 196], [140, 300], [372, 300], [220, 380], [300, 410], [190, 432]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 3 : 4.5}" fill="#fbefcc"/>`).join('') + `</g>` +
      [[200, 432], [256, 440], [312, 432]].map(([x, y]) => `<path d="M ${x} ${y} C ${x + 8} ${y + 14} ${x + 8} ${y + 20} ${x} ${y + 24} C ${x - 8} ${y + 20} ${x - 8} ${y + 14} ${x} ${y} Z" fill="#2fb8a6"/>`).join('') }
  };
  const TIERS = { common: '#9c8d7b', rare: '#3b82c4', epic: '#7c4dbd', legendary: '#e9b949' };

  // ---------- hudhud ----------
  function petal(len, w, rot, tipLen) {
    const p = (L) => `M ${-w} 0 C ${-w - 4} ${-L * 0.55} ${-w * 0.7} ${-L} 0 ${-L} C ${w * 0.7} ${-L} ${w + 4} ${-L * 0.55} ${w} 0 Z`;
    return `<g transform="translate(256 182) rotate(${rot})"><path d="${p(len)}" fill="${TIP}" ${SW}/><path d="${p(len - tipLen)}" fill="var(--mb)"/>` +
      `<path d="M ${-w * 0.9} ${-(len - tipLen)} Q 0 ${-(len - tipLen) + 6} ${w * 0.9} ${-(len - tipLen)}" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/></g>`;
  }
  const CREST = {
    fan: () => [[-60, 100], [60, 100], [-40, 118], [40, 118], [-20, 132], [20, 132], [0, 140]].map(([r, L]) => petal(L, 18, r, 28)).join(''),
    spiky: () => [-48, -28, -10, 10, 28, 48].map((r, i) => { const L = [96, 118, 134, 134, 118, 96][i]; return `<g transform="translate(256 182) rotate(${r})"><path d="M -16 0 L 0 ${-L} L 16 0 Z" fill="var(--mb)" ${SW}/><path d="M -6 ${-L + 22} L 0 ${-L} L 6 ${-L + 22} Z" fill="${TIP}"/></g>`; }).join(''),
    curly: () => [[-36, 210], [0, 256], [36, 302]].map(([r, x]) => {
      const top = 112 + Math.abs(r) * 0.6, d = r < 0 ? -1 : 1;
      const path = `M ${x} 196 C ${x} 170 ${x + d * 4} ${top + 24} ${x} ${top} A 20 20 0 1 ${d > 0 ? 1 : 0} ${x + d * 26} ${top + 10} A 11 11 0 1 ${d > 0 ? 1 : 0} ${x + d * 12} ${top + 14}`;
      return `<path d="${path}" fill="none" stroke="${O}" stroke-width="28" stroke-linecap="round"/><path d="${path}" fill="none" stroke="var(--mb)" stroke-width="16" stroke-linecap="round"/><circle cx="${x + d * 12}" cy="${top + 14}" r="8" fill="${TIP}"/>`;
    }).join(''),
    tuft: () => [-26, 0, 26].map((r, i) => petal(i === 1 ? 70 : 58, 16, r, 18)).join(''),
    swept: () => [-82, -68, -54, -40, -26].map((r, i) => petal([96, 120, 134, 128, 108][i], 16, r, 26)).join(''),
    flower: () => CREST.fan() + `<g transform="translate(334 132)">` + [0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-15" rx="10" ry="15" transform="rotate(${a})" fill="#ffffff" stroke="${O}" stroke-width="4"/>`).join('') + `<circle r="8" fill="#e9b949" stroke="${O}" stroke-width="4"/></g>`
  };
  const hudhudTail = (id) => `<g transform="translate(176 414) rotate(38)">` + [-16, 0, 16].map((dx, i) => `<g transform="translate(${dx} 0) rotate(${(i - 1) * 12})"><clipPath id="${id}t${i}"><rect x="-13" y="0" width="26" height="76" rx="13"/></clipPath><rect x="-13" y="0" width="26" height="76" rx="13" fill="var(--mbd)"/><g clip-path="url(#${id}t${i})"><rect x="-14" y="30" width="28" height="10" fill="${CREAM}"/><rect x="-14" y="40" width="28" height="12" fill="${TIP}"/><rect x="-14" y="60" width="28" height="18" fill="${TIP}"/></g><rect x="-13" y="0" width="26" height="76" rx="13" fill="none" ${SW}/></g>`).join('') + `</g>`;

  // ---------- cat ----------
  const catEars = (style) => [-1, 1].map(s => `<g transform="translate(${256 + s * 78} 196) rotate(${s * 18})"><path d="M -34 10 L 0 -70 L 34 10 Z" fill="${style === 'patches' && s < 0 ? 'var(--ma)' : 'var(--mb)'}" ${SW}/><path d="M -18 0 L 0 -46 L 18 0 Z" fill="${PINK}"/></g>`).join('');
  const CAT_TAIL = 'M 360 420 C 430 420 446 360 418 330';
  const catTail = `<path d="${CAT_TAIL}" fill="none" stroke="${O}" stroke-width="30" stroke-linecap="round"/><path d="${CAT_TAIL}" fill="none" stroke="var(--mb)" stroke-width="18" stroke-linecap="round"/><path d="M 438 362 C 437 348 430 336 418 330" fill="none" stroke="var(--ma)" stroke-width="18" stroke-linecap="round"/>`;
  const CAT_STYLE = {
    patches: (clip) => `<g clip-path="url(#${clip})"><path d="M 150 176 C 220 160 258 196 250 236 C 240 270 190 268 140 256 Z" fill="var(--ma)"/><ellipse cx="368" cy="384" rx="46" ry="38" fill="var(--ma)"/><ellipse cx="146" cy="388" rx="30" ry="24" fill="var(--ma)"/></g>`,
    tabby: (clip) => `<g clip-path="url(#${clip})" fill="none" stroke="var(--ma)" stroke-width="10" stroke-linecap="round"><path d="M 236 172 L 240 200 M 256 168 L 256 204 M 276 172 L 272 200"/><path d="M 126 300 L 166 310 M 124 338 L 164 344 M 386 300 L 346 310 M 388 338 L 348 344"/></g>`,
    plain: () => '',
    mask: (clip) => `<g clip-path="url(#${clip})"><path d="M 124 166 L 388 166 L 388 250 C 340 236 300 250 256 262 C 212 250 172 236 124 250 Z" fill="var(--ma)"/></g>`
  };
  const whiskers = `<path d="M 202 284 L 160 278 M 202 292 L 162 298 M 310 284 L 352 278 M 310 292 L 350 298" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
  const muzzle = (rx, ry, cy) => `<ellipse cx="256" cy="${cy}" rx="${rx}" ry="${ry}" fill="var(--mbl)" stroke="${O}" stroke-width="5"/>`;

  // ---------- camel ----------
  const camelEars = [-1, 1].map(s => `<g transform="translate(${256 + s * 84} 184) rotate(${s * 32})"><ellipse rx="17" ry="28" fill="var(--mb)" ${SW}/><ellipse rx="8" ry="16" cy="2" fill="${PINK}"/></g>`).join('');
  const camelHump = `<path d="M 292 186 C 316 112 392 116 400 192 C 402 210 390 222 370 226 Z" fill="var(--mbd)" ${SW}/>`;
  const tuftTail = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M 0 0 C 10 20 6 40 0 54" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="M 0 0 C 10 20 6 40 0 54" fill="none" stroke="var(--mbd)" stroke-width="6" stroke-linecap="round"/><path d="M -10 50 C -8 70 8 76 12 66 C 14 58 6 50 0 48 Z" fill="var(--ma)" ${SW}/></g>`;
  const CAMEL_STYLE = {
    curly: () => `<path d="M 214 182 C 236 192 276 192 298 182" fill="var(--mbd)"/>` + [222, 244, 268, 290].map((x, i) => `<circle cx="${x}" cy="${176 - (i % 2) * 8}" r="15" fill="var(--mbd)" ${SW}/>`).join(''),
    fringe: () => `<path d="M 212 182 C 218 148 294 148 300 182 L 286 176 L 274 190 L 262 176 L 250 192 L 238 176 L 226 190 Z" fill="var(--mbd)" ${SW}/>`,
    tall: () => [232, 256, 280].map((x, i) => `<path d="M ${x - 12} 184 C ${x - 14} ${148 - (i === 1 ? 22 : 6)} ${x + 14} ${148 - (i === 1 ? 22 : 6)} ${x + 12} 184 Z" fill="var(--mbd)" ${SW}/>`).join(''),
    bald: () => ''
  };

  // ---------- oryx ----------
  const ORYX_STYLE = {
    straight: () => [-1, 1].map(s => `<g transform="translate(${256 + s * 30} 184) rotate(${s * 6})"><path d="M -9 0 L -4 -150 L 4 -150 L 9 0 Z" fill="#5a4636" ${SW}/>` + [-24, -46, -68, -90].map(y => `<path d="M -8 ${y} L 7 ${y - 4}" stroke="${O}" stroke-width="4"/>`).join('') + `</g>`).join(''),
    curved: () => [-1, 1].map(s => `<g transform="translate(${256 + s * 30} 184)"><path d="M ${-s * 9} 0 C ${-s * 10} -60 ${s * 16} -110 ${s * 60} -132 L ${s * 64} -124 C ${s * 26} -100 ${s * 10} -60 ${s * 9} 0 Z" fill="#5a4636" ${SW}/></g>`).join(''),
    short: () => [-1, 1].map(s => `<g transform="translate(${256 + s * 32} 184) rotate(${s * 12})"><path d="M -10 0 L -4 -64 L 4 -64 L 10 0 Z" fill="#5a4636" ${SW}/><path d="M -9 -22 L 8 -26 M -7 -42 L 6 -46" stroke="${O}" stroke-width="4"/></g>`).join(''),
    spiral: () => [-1, 1].map(s => `<g transform="translate(${256 + s * 30} 184) rotate(${s * 8})"><path d="M -10 0 L -3 -130 L 3 -130 L 10 0 Z" fill="#7a5f45" ${SW}/>` + [-16, -36, -56, -76, -96].map(y => `<path d="M -9 ${y} Q 0 ${y - 12} 8 ${y - 2}" fill="none" stroke="${O}" stroke-width="4"/>`).join('') + `</g>`).join('')
  };
  const oryxEars = [-1, 1].map(s => `<g transform="translate(${256 + s * 122} 216) rotate(${s * 70})"><path d="M -16 0 C -16 -40 16 -40 16 0 C 16 10 -16 10 -16 0 Z" fill="var(--mb)" ${SW}/><path d="M -7 -2 C -7 -26 7 -26 7 -2 Z" fill="${PINK}"/></g>`).join('');
  const oryxMask = (clip) => `<g clip-path="url(#${clip})"><path d="M 236 166 C 244 194 268 194 276 166 L 270 206 C 262 214 250 214 242 206 Z" fill="var(--ma)"/>` +
    [-1, 1].map(s => `<path d="M ${256 + s * 30} 220 C ${256 + s * 50} 228 ${256 + s * 54} 262 ${256 + s * 32} 288 C ${256 + s * 22} 298 ${256 + s * 16} 290 ${256 + s * 20} 276 C ${256 + s * 28} 258 ${256 + s * 24} 238 ${256 + s * 18} 228 Z" fill="var(--ma)"/>`).join('') + `</g>`;

  // ---------- turtle ----------
  const SHELL_D = 'M 256 156 C 372 156 418 236 414 318 C 410 398 352 452 256 452 C 160 452 102 398 98 318 C 94 236 140 156 256 156 Z';
  const SHELL_PAT = {
    plates: () => [[150, 230], [362, 230], [124, 320], [388, 320], [150, 404], [362, 404]].map(([x, y]) => `<path d="M ${x} ${y - 26} L ${x + 22} ${y - 13} L ${x + 22} ${y + 13} L ${x} ${y + 26} L ${x - 22} ${y + 13} L ${x - 22} ${y - 13} Z" fill="var(--mbd)" stroke="${O}" stroke-width="4"/>`).join(''),
    stripes: () => [200, 250, 300, 350, 400].map(y => `<path d="M 90 ${y} Q 256 ${y - 30} 420 ${y}" fill="none" stroke="#e9b949" stroke-width="9"/>`).join(''),
    spots: () => [[140, 220], [372, 220], [116, 300], [396, 300], [130, 386], [382, 386], [172, 432], [340, 432]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#e9b949" stroke="${O}" stroke-width="4"/>`).join(''),
    gold: () => `<path d="${SHELL_D}" fill="none" stroke="#e9b949" stroke-width="22"/>`
  };
  const turtleShell = (style, id) => `<clipPath id="${id}s"><path d="${SHELL_D}"/></clipPath><path d="${SHELL_D}" fill="var(--ma)"/><g clip-path="url(#${id}s)">${(SHELL_PAT[style] || SHELL_PAT.plates)()}</g><path d="${SHELL_D}" fill="none" ${SW}/>`;
  const turtleSpots = (clip) => `<g clip-path="url(#${clip})" fill="var(--mbd)"><circle cx="226" cy="186" r="9"/><circle cx="254" cy="178" r="7"/><circle cx="284" cy="188" r="10"/><circle cx="268" cy="206" r="5"/></g>`;
  const plastron = BELLY.replace('/>', '/>') + `<path d="M 256 300 L 256 430 M 190 346 L 322 346 M 186 392 L 326 392" stroke="${O}" stroke-width="4" opacity=".5"/>`;

  // ---------- animals (same posture template) ----------
  const ANIMALS = {
    hudhud: {
      colors: { orange: ['#f2a03d', '#c9741f', '#f9d77e', '#3b2a1e'], teal: ['#2a9d8f', '#1d7368', '#a8e0d6', '#3b2a1e'], pink: ['#ef7f9a', '#c95574', '#fbd0da', '#3b2a1e'], sky: ['#5fa8e0', '#3b7fb5', '#cbe6f7', '#3b2a1e'], lavender: ['#a68bd6', '#7d63ad', '#e2d7f5', '#3b2a1e'], mint: ['#74c69d', '#4d9a74', '#d3f0df', '#3b2a1e'] },
      styles: Object.keys(CREST), def: { color: 'orange', style: 'fan', nose: null, mouth: 'long' }, limb: 'wing', legs: 'bird', mouthKind: 'beak', hasNose: false,
      back: (c, id) => hudhudTail(id) + (CREST[c.style] || CREST.fan)(),
      over: () => BELLY + CHEEKS
    },
    cat: {
      colors: { ginger: ['#fbe7c6', '#e2c79c', '#fff6e6', '#f2a03d'], grey: ['#cfcfcf', '#a3a3a3', '#f1f1f1', '#6e6e6e'], orange: ['#f6b26b', '#d98a3d', '#fde7c8', '#c9741f'], black: ['#5a4d4d', '#3b3131', '#b9aeae', '#2a211a'] },
      styles: Object.keys(CAT_STYLE), def: { color: 'ginger', style: 'patches', nose: 'tri', mouth: 'w' }, limb: 'paw', legs: 'paw', mouthKind: 'mouth', hasNose: true,
      back: (c) => catTail + catEars(c.style),
      over: (c, clip) => BELLY + (CAT_STYLE[c.style] || CAT_STYLE.patches)(clip) + CHEEKS + whiskers
    },
    camel: {
      colors: { sand: ['#e3b86b', '#b98a43', '#f3d9a4', '#5a3a26'], cream: ['#efdcb5', '#cdb184', '#fbf0da', '#6b4b33'], brown: ['#b9814f', '#8d5d33', '#e3c39c', '#3b2a1e'], white: ['#f4ece0', '#d8c9b2', '#ffffff', '#6b4b33'] },
      styles: Object.keys(CAMEL_STYLE), def: { color: 'sand', style: 'curly', nose: 'camel', mouth: 'smile' }, limb: 'paw', legs: 'paw', mouthKind: 'mouth', hasNose: true,
      back: () => tuftTail(150, 410, 30) + camelHump + camelEars,
      over: (c) => BELLY + `<path d="M 200 286 C 200 256 312 256 312 286 C 312 314 284 322 256 322 C 228 322 200 314 200 286 Z" fill="var(--mbl)" stroke="#2a211a" stroke-width="5"/>` + (CAMEL_STYLE[c.style] || CAMEL_STYLE.curly)()
    },
    turtle: {
      colors: { green: ['#8fd3b6', '#5fae8f', '#f2d49b', '#1d7368'], sea: ['#8cc7e8', '#5a9fc8', '#f2d49b', '#2b6f99'], olive: ['#b9cf8a', '#8aa35a', '#f2d49b', '#6b7d3a'], coral: ['#f4b6a6', '#d98a78', '#fbe2c4', '#c45a48'] },
      styles: Object.keys(SHELL_PAT), def: { color: 'green', style: 'plates', nose: 'dots', mouth: 'smile' }, limb: 'paw', legs: 'paw', mouthKind: 'mouth', hasNose: true,
      back: (c, id) => turtleShell(c.style, id),
      over: (c, clip) => plastron + turtleSpots(clip) + CHEEKS
    },
    oryx: {
      colors: { white: ['#f4efe6', '#d9d1c3', '#ffffff', '#5a3a26'], sand: ['#ecd9b4', '#c9b085', '#faf0dc', '#5a3a26'], grey: ['#dcdcd6', '#b3b3aa', '#f6f6f2', '#3b3b36'], rose: ['#f3dcd2', '#d6b3a4', '#fdf3ee', '#6b3b33'] },
      styles: Object.keys(ORYX_STYLE), def: { color: 'white', style: 'straight', nose: 'oval', mouth: 'small' }, limb: 'paw', legs: 'paw', mouthKind: 'mouth', hasNose: true,
      back: (c) => tuftTail(150, 410, 30) + (ORYX_STYLE[c.style] || ORYX_STYLE.straight)() + oryxEars,
      over: (c, clip) => BELLY + oryxMask(clip) + muzzle(34, 26, 282) + CHEEKS
    }
  };

  function defaults(animal) {
    const a = ANIMALS[animal] || ANIMALS.hudhud;
    return Object.assign({ animal, eyes: 'round', hand: 'qalam', head: 'none', neck: 'none' }, a.def);
  }

  const EMOTES = {
    cheer: { eyes: 'happy', mouth: { beak: 'laugh', mouth: 'laugh' }, raise: true },
    sad: { eyes: 'sad', mouth: { beak: null, mouth: 'frown' } },
    think: { eyes: 'up', mouth: { beak: null, mouth: 'small' } },
    surprised: { eyes: 'round', mouth: { beak: 'laugh', mouth: 'o' } },
    sleep: { eyes: 'happy', mouth: { beak: null, mouth: 'flat' } }
  };

  function render(cfg, opts) {
    opts = opts || {};
    const animal = (cfg && cfg.animal) || 'hudhud', A = ANIMALS[animal] || ANIMALS.hudhud;
    const c = Object.assign(defaults(animal), cfg || {});
    const em = EMOTES[c.emote];
    if (em) { c.eyes = em.eyes; const m = em.mouth[A.mouthKind]; if (m) c.mouth = m; }
    const col = A.colors[c.color] || Object.values(A.colors)[0];
    const id = 'mm' + (++uid), clip = id + 'b';
    const holding = c.hand !== 'none';
    const limb = (side, raised) => A.limb === 'wing' ? wing(side, raised, id + 'w' + (side + 1)) : paw(side, raised);
    const mouth = A.mouthKind === 'beak' ? (BEAKS[c.mouth] || BEAKS.long)() : (MOUTHS[c.mouth] || MOUTHS.smile)();
    const nose = A.hasNose && c.nose && NOSES[c.nose] ? NOSES[c.nose]() : '';
    const skin = (SKINS[c.skin] || SKINS.none).draw();
    const mark = MARK[c.mark] || MARK.none;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.viewBox || '0 0 512 512'}" ${opts.attrs || ''} class="mm ${opts.cls || ''}" style="--mb:${col[0]};--mbd:${col[1]};--mbl:${col[2]};--ma:${col[3]}" role="img" aria-label="${opts.label || animal}">` +
      `<defs><clipPath id="${clip}"><path d="${BODY_D}"/></clipPath></defs>` +
      SHADOW + `<g class="mm-all">` + A.back(c, id) + LEGS[A.legs]() + `<g class="mm-back">` + limb(-1, !!(em && em.raise)) + `</g>` +
      `<path d="${BODY_D}" fill="var(--mb)"/>` + A.over(c, clip) + (skin ? `<g clip-path="url(#${clip})">${skin}</g>` : '') + `<path d="${BODY_D}" fill="none" ${SW}/>` + mark.body() +
      (NECK[c.neck] || NECK.none)() + `<g class="mm-eyes">` + (EYES[c.eyes] || EYES.round)() + `</g>` + nose + mouth +
      (HEAD[c.head] || HEAD.none)() + mark.head() + `<g class="mm-front">` + limb(1, holding || !!(em && em.raise)) + (HAND[c.hand] || HAND.none)() + `</g></g></svg>`;
  }

  g.MidadMascot = { render, defaults, SKINS, TIERS, EMOTES, ANIMALS, EYES, BEAKS, NOSES, MOUTHS, HEAD, NECK, HAND, MARK };
})(typeof window !== 'undefined' ? window : globalThis);
