/* ==========================================================
   BOCADILLO A40 DE TÁNGER — Propuesta B «Medina de noche»
   Arco de herradura que se abre con el scroll hasta el neón
   del local, faroles de latón con física de péndulo que
   encienden la carta, «monta tu bocadillo» desde las bandejas
   del mostrador, fotos tendidas en el zoco y contraventanas
   azules que se abren a los vídeos.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const STATIC = /[?&]static\b/.test(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || STATIC;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
document.documentElement.classList.toggle('static', STATIC);
document.documentElement.classList.toggle('no-motion', !motion);
const IMG = (f) => 'assets/img/' + f;
const play = (v) => { if (!v) return; if (!v.src && v.dataset.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); };
const seeded = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const NS = 'http://www.w3.org/2000/svg';

/* ----------------------------------------------------------
   DATOS · carta, ingredientes y bocadillos en datos.js (5 idiomas)
   ---------------------------------------------------------- */
const { ING, BOC, MENU, EXTRAS } = A40;
const loc = A40.L, T = A40.t;
const TRAYS = ['lechuga', 'ensalada', 'tomate', 'cebolla', 'pimientos', 'maiz', 'aceitunas', 'huevo', 'remolacha', 'zanahoria', 'cebmorada', 'pollo', 'ternera', 'salsa'];
const ZOCO = [
  ['rotulo.jpg', 300, '1 / 1'], ['fachada.jpg', 280, '4 / 5'], ['mural-tanger.jpg', 320, '1 / 1'], ['pizarra.jpg', 460, '16 / 7'],
  ['neon.jpg', 220, '9 / 20'], ['mural-tacos.jpg', 260, '3 / 5'], ['mostrador.jpg', 460, '16 / 8'], ['mural-burger.jpg', 270, '3 / 4'],
  ['salsas.jpg', 300, '6 / 5'], ['hazlo.jpg', 250, '2 / 3'], ['mural-nuggets.jpg', 280, '3 / 4'], ['nevera.jpg', 220, '1 / 2'], ['interior.jpg', 460, '3 / 2']
];
const RUG = [['#C65A3A', 'repeating-linear-gradient(90deg,#F1E2C4 0 8px,#1F3D8A 8px 16px,#F2A93B 16px 24px)'], ['#1F3D8A', 'repeating-linear-gradient(90deg,#C65A3A 0 10px,#F1E2C4 10px 14px,#3F8F6A 14px 24px,#F1E2C4 24px 28px)'], ['#3F8F6A', 'repeating-linear-gradient(135deg,#F2A93B 0 8px,#1F3D8A 8px 16px)'], ['#B8862B', 'repeating-linear-gradient(90deg,#7A2E22 0 6px,#F1E2C4 6px 12px)'], ['#7A2E4A', 'repeating-linear-gradient(45deg,#F1E2C4 0 6px,#3F6FC1 6px 12px,#F2A93B 12px 18px)']];

/* ----------------------------------------------------------
   HORARIO · martes a domingo 12:00–24:00, lunes cerrado
   ---------------------------------------------------------- */
const madrid = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute };
};
const paintLive = () => {
  const { d, m } = madrid();
  const open = d !== 1 && m >= 720;
  const txt = T(open ? 'open' : d === 1 ? 'closedMon' : 'closedAm');
  $$('[data-live]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('[data-live-text]', el).textContent = txt; });
  $$('#week li').forEach((li) => li.classList.toggle('is-today', +li.dataset.d === d));
};
paintLive(); setInterval(paintLive, 30000);
A40.on(paintLive);

/* ----------------------------------------------------------
   SCROLL · NAV · MENÚ
   ---------------------------------------------------------- */
let lenis = null;
if (motion && typeof window.Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  nav.classList.toggle('is-hidden', y > 700 && y > lastY && !drawer.classList.contains('is-open'));
  lastY = y;
}, { passive: true });
const setDrawer = (open) => { burger.setAttribute('aria-expanded', open); drawer.classList.toggle('is-open', open); document.body.style.overflow = open ? 'hidden' : ''; if (lenis) open ? lenis.stop() : lenis.start(); };
burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
const goTo = (t) => { if (lenis) lenis.scrollTo(t, { offset: -40 }); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = $(id); if (!t) return;
  e.preventDefault(); setDrawer(false); goTo(t);
}));

/* ----------------------------------------------------------
   BAB · la pared encalada y el arco que se abre
   ---------------------------------------------------------- */
(() => {
  const wall = $('#wall');
  const cv = document.createElement('canvas'); cv.width = cv.height = 180;
  const c = cv.getContext('2d'), id = c.createImageData(180, 180), rnd = seeded(9);
  for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = rnd() * 26; }
  c.putImageData(id, 0, 0);
  wall.style.setProperty('--noise', `url(${cv.toDataURL()})`);
  const sign = $('#sign');
  if (!motion) return;
  let lit = false;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#bab', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true,
    onUpdate: (st) => { if (st.progress > .42 && !lit) { lit = true; sign.classList.remove('is-flicker'); void sign.offsetWidth; sign.classList.add('is-flicker'); } if (st.progress < .2) lit = false; } } });
  tl.to('#babHead', { opacity: 0, y: -60, duration: .16 }, 0)
    .to('#babHint', { opacity: 0, duration: .08 }, 0)
    .to(wall, { scale: 7.5, duration: .7, ease: 'power2.in' }, 0)
    .to(wall, { opacity: 0, duration: .1 }, .62)
    .to('.bab__inside > img', { scale: 1, duration: .8 }, 0)
    .to(sign, { top: '44%', width: () => Math.min(innerHeight * .56, innerWidth * .78), duration: .62, ease: 'power2.inOut' }, .1)
    .to('.bab__under', { opacity: 1, y: 0, duration: .14 }, .74)
    .set({}, {}, 1);
  gsap.set('.bab__under', { y: 30 });
  gsap.from('#babHead > *', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .12, delay: .15 });
})();

if (motion) $$('[data-up]').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }));

/* ----------------------------------------------------------
   FAROLES · péndulos que encienden la carta
   ---------------------------------------------------------- */
(() => {
  const row = $('#lanterns'), pool = $('#pool');
  const LEN = [36, 74, 24, 92, 48, 66, 30, 58];
  const SH = [[24, 64], [20, 76], [27, 56], [22, 70], [25, 60], [19, 80], [26, 62], [23, 68]];
  const lanSVG = (i) => {
    const len = LEN[i], [bw, bh] = SH[i], top = len + 40, H = top + bh + 64, cx = 50;
    const body = `M${cx - bw + 6} ${top} H ${cx + bw - 6} L ${cx + bw + 6} ${top + bh * .28} V ${top + bh * .78} L ${cx + bw - 4} ${top + bh} H ${cx - bw + 4} L ${cx - bw - 6} ${top + bh * .78} V ${top + bh * .28} Z`;
    let holes = '';
    for (let y = top + 8; y < top + bh - 4; y += 11) for (let x = cx - bw - 4; x < cx + bw + 6; x += 10) {
      const ox = ((y - top) / 11) % 2 ? 5 : 0;
      holes += `<path d="M${x + ox} ${y - 3.6} l 1.4 2.2 2.2 1.4 -2.2 1.4 -1.4 2.2 -1.4 -2.2 -2.2 -1.4 2.2 -1.4 z"/>`;
    }
    return `<svg viewBox="0 0 100 ${H}" aria-hidden="true">
      <defs><clipPath id="lb${i}"><path d="${body}"/></clipPath>
        <radialGradient id="lg${i}"><stop offset="0" stop-color="#FFC86A" stop-opacity=".55"/><stop offset="1" stop-color="#FFC86A" stop-opacity="0"/></radialGradient>
        <radialGradient id="lf${i}"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".5" stop-color="#FFD56E"/><stop offset="1" stop-color="#FF9A2E" stop-opacity="0"/></radialGradient></defs>
      <circle class="halo" cx="${cx}" cy="${top + bh / 2}" r="${bw * 3.4}" fill="url(#lg${i})"/>
      <line class="chain" x1="${cx}" y1="0" x2="${cx}" y2="${len}"/>
      <circle cx="${cx}" cy="${len + 4}" r="4" fill="none" stroke="#A88445" stroke-width="2.4"/>
      <circle class="metal2" cx="${cx}" cy="${len + 12}" r="4.6"/>
      <path class="metal2" d="M${cx - bw + 2} ${top - 6} Q ${cx} ${len + 2} ${cx + bw - 2} ${top - 6} Z"/>
      <rect class="metal" x="${cx - bw - 2}" y="${top - 7}" width="${bw * 2 + 4}" height="8" rx="2"/>
      <path class="glass" d="${body}"/>
      <g clip-path="url(#lb${i})"><ellipse class="flame" cx="${cx}" cy="${top + bh * .55}" rx="${bw * .9}" ry="${bh * .42}" fill="url(#lf${i})"/><g class="holes">${holes}</g></g>
      <path d="${body}" fill="none" stroke="#2B1E0E" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M${cx} ${top} V ${top + bh} M${cx - bw - 6} ${top + bh * .28} H ${cx + bw + 6} M${cx - bw - 6} ${top + bh * .78} H ${cx + bw + 6}" stroke="#8A6A35" stroke-width="2.2"/>
      <path class="metal" d="M${cx - bw + 2} ${top + bh} H ${cx + bw - 2} L ${cx + 8} ${top + bh + 14} H ${cx - 8} Z"/>
      <circle class="metal2" cx="${cx}" cy="${top + bh + 20}" r="5.5"/>
      <path class="metal" d="M${cx - 2} ${top + bh + 25} h 4 l -2 12 z"/>
    </svg>`;
  };
  row.innerHTML = MENU.map((m, i) => `<button class="lan" type="button" role="tab" id="lan-${m.id}" aria-controls="pool" aria-selected="false" data-i="${i}">${lanSVG(i)}<span class="lan__n"></span></button>`).join('');
  const names = () => $$('.lan__n', row).forEach((el, i) => { el.innerHTML = loc(MENU[i].n) + (A40.rtl ? '' : `<small lang="ar">${MENU[i].ar}</small>`); });
  names();
  const lans = $$('.lan', row).map((el, i) => ({ el, th: 0, w: (i % 2 ? 1 : -1) * .3, ph: i * 1.3 }));
  let cur = -1;
  const show = (i, quiet) => {
    const m = MENU[i];
    cur = i;
    lans.forEach((l, k) => l.el.setAttribute('aria-selected', k === i));
    if (!quiet) lans[i].w += .9 * (Math.random() > .5 ? 1 : -1);
    pool.setAttribute('aria-labelledby', 'lan-' + m.id);
    const r = lans[i].el.getBoundingClientRect(), pr = pool.getBoundingClientRect();
    if (pr.width) pool.style.setProperty('--px', clamp(((r.left + r.width / 2 - pr.left) / pr.width) * 100, 8, 92).toFixed(1) + '%');
    $('#poolT').textContent = loc(m.n); $('#poolAr').textContent = A40.rtl ? '' : m.ar; $('#poolSub').textContent = loc(m.sub);
    $('#poolList').innerHTML = m.items.map((it) => `<li><b>${loc(it.n)}${it.nuevo ? `<span class="tag tag--new">${T('nuevo')}</span>` : ''}${it.board ? `<span class="tag tag--board">${T('pizarra')}</span>` : ''}</b><span class="pr">${A40.eur(it.p)}</span>${it.d ? `<p>${loc(it.d)}</p>` : ''}</li>`).join('');
    if (motion && !quiet) gsap.fromTo('#pool .pool__head > *, #poolList li', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45, stagger: .03 });
  };
  row.addEventListener('click', (e) => { const b = e.target.closest('.lan'); if (b) show(+b.dataset.i); });
  row.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const n = (cur + (e.key === 'ArrowRight' ? 1 : -1) + MENU.length) % MENU.length;
    show(n); lans[n].el.focus();
  });
  show(0);
  A40.on(() => { names(); show(cur, true); });
  if (!motion) return;
  let px = -1, py = 0, last = 0, vis = false, raf = 0;
  const sec = $('#faroles');
  sec.addEventListener('pointermove', (e) => {
    const now = performance.now(), dt = Math.max(8, now - last);
    if (px >= 0) {
      const vx = (e.clientX - px) / dt;
      lans.forEach((l) => {
        const r = l.el.getBoundingClientRect();
        if (e.clientX > r.left - 10 && e.clientX < r.right + 10 && e.clientY > r.top && e.clientY < r.bottom) l.w += vx * .06;
      });
    }
    px = e.clientX; py = e.clientY; last = now;
  });
  sec.addEventListener('pointerleave', () => { px = -1; });
  let prev = 0;
  const loop = (t) => {
    const dt = Math.min(.05, (t - (prev || t)) / 1000); prev = t;
    lans.forEach((l) => {
      const idle = Math.sin(t / 1400 + l.ph) * .004;
      l.w += (-10 * l.th - 1.1 * l.w) * dt + idle;
      l.th = clamp(l.th + l.w * dt, -.5, .5);
      l.el.style.transform = `rotate(${l.th.toFixed(4)}rad)`;
    });
    raf = vis ? requestAnimationFrame(loop) : 0;
  };
  new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis && !raf) { prev = 0; raf = requestAnimationFrame(loop); } }).observe(sec);
  $('#openCarta').addEventListener('click', () => openLB(IMG('carta-impresa.jpg'), T('menu.printCap')));
})();
if (!motion) $('#openCarta').addEventListener('click', () => openLB(IMG('carta-impresa.jpg'), T('menu.printCap')));

/* ----------------------------------------------------------
   MONTA TU BOCADILLO · del mostrador al pan
   ---------------------------------------------------------- */
const X0 = 70, X1 = 530, L = X1 - X0, OUT = '#1A1236';
const SPEC = {
  lechuga:   { h: 22, t: 'wave', f: '#4CC36A', k: '#2E8F48' },
  ensalada:  { h: 26, t: 'wave', f: '#4CC36A', k: '#2E8F48', bits: true },
  tomate:    { h: 17, t: 'pc', s: 'ell', n: 7, w: 64, f: ['#E8443A'], i: '#FF7A5E' },
  cebolla:   { h: 14, t: 'pc', s: 'ring', n: 12, w: 34, f: ['#F3EAFB'], k: '#B7A2CF' },
  cebmorada: { h: 14, t: 'pc', s: 'ring', n: 12, w: 34, f: ['#D58BC7'], k: '#7A2E6C' },
  pimientos: { h: 18, t: 'pc', s: 'strip', n: 14, w: 52, sh: 8, rows: 2, f: ['#E8443A', '#3FA34D'] },
  maiz:      { h: 13, t: 'dots', n: 70, f: '#FFD23A', k: '#C99A1A' },
  aceitunas: { h: 15, t: 'pc', s: 'olive', n: 16, w: 15, f: ['#2A2620', '#6F7D2C'] },
  pollo:     { h: 30, t: 'pc', s: 'blob', n: 10, w: 54, sh: 19, rows: 2, f: ['#E3A653', '#D18F3F'], grill: true },
  ternera:   { h: 26, t: 'pc', s: 'strip', n: 9, w: 82, sh: 10, rows: 3, f: ['#8E4A30', '#7A3E28', '#9C5638'] },
  kefta:     { h: 28, t: 'pc', s: 'cap', n: 6, w: 76, f: ['#7A3F28'], specks: true },
  salchicha: { h: 26, t: 'pc', s: 'cap', n: 2, w: 226, f: ['#C25A44'], cuts: true },
  gambas:    { h: 28, t: 'pc', s: 'shrimp', n: 8, w: 50, f: ['#FF8F5E'] },
  calamar:   { h: 22, t: 'pc', s: 'ring', n: 14, w: 30, f: ['#F6EBD3'], k: '#C9A36A', thick: 7 },
  sepia:     { h: 20, t: 'pc', s: 'rect', n: 6, w: 72, f: ['#F2E6CB'], grill: true },
  higado:    { h: 20, t: 'pc', s: 'blob', n: 7, w: 64, sh: 18, f: ['#6A2A26', '#5A2320'] },
  huevo:     { h: 22, t: 'pc', s: 'egg', n: 8, w: 52, f: ['#FFF8E6'] },
  remolacha: { h: 15, t: 'cubes', n: 30, f: '#9A2357' },
  zanahoria: { h: 13, t: 'shreds', n: 64, f: '#FF9A3A' },
  salsa:     { h: 0, t: 'drizzle', f: '#FFC27A' }
};
const drawLayer = (key, rnd) => {
  const sp = SPEC[key], h = sp.h;
  let s = '';
  if (sp.t === 'wave') {
    let d = `M${X0 - 8} ${h * .45}`;
    for (let x = X0 + 6; x <= X1 + 8; x += 14) d += ` Q ${x - 7} ${rnd() * h * .25} ${x} ${h * .35 + rnd() * 3}`;
    d += ` L ${X1 + 8} ${h} L ${X0 - 8} ${h} Z`;
    s += `<path d="${d}" fill="${sp.f}" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<path d="M${X0 + 8} ${h * .7} H ${X1 - 8}" stroke="${sp.k}" stroke-width="3" stroke-dasharray="18 14" stroke-linecap="round"/>`;
    if (sp.bits) for (let x = X0 + 14; x < X1 - 20; x += 34 + rnd() * 20) s += rnd() > .45 ? `<rect x="${x}" y="${h * .3}" width="15" height="${h * .42}" rx="4" fill="#E8443A" stroke="${OUT}" stroke-width="2"/>` : `<path d="M${x} ${h * .45} q 9 -9 18 0" fill="none" stroke="${OUT}" stroke-width="5.5" stroke-linecap="round"/><path d="M${x} ${h * .45} q 9 -9 18 0" fill="none" stroke="#F6F0FF" stroke-width="3" stroke-linecap="round"/>`;
    return s;
  }
  if (sp.t === 'dots') { for (let k = 0; k < sp.n; k++) s += `<circle cx="${X0 + 6 + rnd() * (L - 12)}" cy="${3 + rnd() * (h - 6)}" r="${3.2 + rnd()}" fill="${sp.f}" stroke="${OUT}" stroke-width="1.4"/>`; return s; }
  if (sp.t === 'cubes') { for (let k = 0; k < sp.n; k++) { const x = X0 + rnd() * (L - 12), y = rnd() * (h - 10), w = 9 + rnd() * 3; s += `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="2" fill="${sp.f}" stroke="${OUT}" stroke-width="1.6" transform="rotate(${rnd() * 40 - 20} ${x + w / 2} ${y + w / 2})"/>`; } return s; }
  if (sp.t === 'shreds') { for (let k = 0; k < sp.n; k++) { const x = X0 + rnd() * (L - 28), y = 2 + rnd() * (h - 4), dx = 18 + rnd() * 10, dy = (rnd() - .5) * 6; s += `<path d="M${x} ${y} l ${dx} ${dy}" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/><path d="M${x} ${y} l ${dx} ${dy}" stroke="${sp.f}" stroke-width="2.6" stroke-linecap="round"/>`; } return s; }
  if (sp.t === 'drizzle') return '';
  const rows = sp.rows || 1, step = (L - sp.w) / Math.max(1, Math.ceil(sp.n / rows) - 1);
  let k = 0;
  for (let r = 0; r < rows; r++) for (let j = 0; j < Math.ceil(sp.n / rows) && k < sp.n; j++, k++) {
    const x = Math.min(X0 + j * step + (r % 2) * step * .45 + (rnd() - .5) * 6, X1 - sp.w + 4), ph = sp.sh || h - 2;
    const y = rows > 1 ? r * (h - ph) / (rows - 1) : (h - ph) / 2 + (rnd() - .5) * 2;
    const f = sp.f[(k + r) % sp.f.length], w = sp.w;
    switch (sp.s) {
      case 'ell': s += `<ellipse cx="${x + w / 2}" cy="${y + ph / 2}" rx="${w / 2}" ry="${ph / 2}" fill="${f}" stroke="${OUT}" stroke-width="2.6"/><ellipse cx="${x + w / 2}" cy="${y + ph / 2}" rx="${w / 2 - 7}" ry="${ph / 2 - 4}" fill="${sp.i}"/>`; break;
      case 'ring': s += `<ellipse cx="${x + w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2 - 1.5}" fill="none" stroke="${OUT}" stroke-width="${(sp.thick || 4) + 3}"/><ellipse cx="${x + w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2 - 1.5}" fill="none" stroke="${f}" stroke-width="${sp.thick || 4}"/>`; break;
      case 'strip': s += `<rect x="${x}" y="${y}" width="${w}" height="${ph}" rx="${ph / 2}" fill="${f}" stroke="${OUT}" stroke-width="2.2" transform="rotate(${(rnd() - .5) * 8} ${x + w / 2} ${y + ph / 2})"/>`; break;
      case 'olive': s += `<circle cx="${x + w / 2}" cy="${h / 2}" r="${w / 2}" fill="${f}" stroke="${OUT}" stroke-width="2.2"/><circle cx="${x + w / 2}" cy="${h / 2}" r="${w / 5}" fill="${f === '#2A2620' ? '#6A5A4A' : '#D8432F'}"/>`; break;
      case 'blob': {
        const pts = [[0, .25], [.3, 0], [.78, .06], [1, .5], [.8, 1], [.18, .94]].map(([a, b]) => `${(x + a * w + (rnd() - .5) * 4).toFixed(1)},${(y + b * ph + (rnd() - .5) * 3).toFixed(1)}`).join(' ');
        s += `<polygon points="${pts}" fill="${f}" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round"/>`;
        if (sp.grill) s += `<path d="M${x + w * .3} ${y + ph * .3} l ${w * .26} ${ph * .4} M${x + w * .52} ${y + ph * .22} l ${w * .26} ${ph * .4}" stroke="#7A4A1E" stroke-width="3" stroke-linecap="round"/>`;
        break;
      }
      case 'cap':
        s += `<rect x="${x}" y="${y}" width="${w}" height="${ph}" rx="${ph / 2}" fill="${f}" stroke="${OUT}" stroke-width="2.6"/><path d="M${x + 12} ${y + 6} H ${x + w - 12}" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
        if (sp.specks) for (let q = 0; q < 8; q++) s += `<circle cx="${x + 10 + rnd() * (w - 20)}" cy="${y + 8 + rnd() * (ph - 14)}" r="1.7" fill="${rnd() > .5 ? '#7BC24E' : OUT}"/>`;
        if (sp.cuts) for (let q = x + 26; q < x + w - 20; q += 30) s += `<path d="M${q} ${y + ph * .28} l 10 ${ph * .44}" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`;
        break;
      case 'shrimp': {
        const r0 = h * .4, cx = x + r0 + 4, cy = h * .52;
        s += `<path d="M${cx - r0} ${cy} A ${r0} ${r0} 0 1 1 ${cx + r0 * .2} ${cy + r0 * .96}" fill="none" stroke="${OUT}" stroke-width="${h * .44 + 4}" stroke-linecap="round"/><path d="M${cx - r0} ${cy} A ${r0} ${r0} 0 1 1 ${cx + r0 * .2} ${cy + r0 * .96}" fill="none" stroke="${f}" stroke-width="${h * .44}" stroke-linecap="round"/>`;
        break;
      }
      case 'rect':
        s += `<rect x="${x}" y="${y}" width="${w}" height="${ph}" rx="7" fill="${f}" stroke="${OUT}" stroke-width="2.4"/>`;
        if (sp.grill) for (let q = 0; q < 3; q++) s += `<path d="M${x + 14 + q * 20} ${y + 4} l 9 ${ph - 8}" stroke="#7A5A2E" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
        break;
      case 'egg': s += `<ellipse cx="${x + w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2 - 1}" fill="${f}" stroke="${OUT}" stroke-width="2.4"/><ellipse cx="${x + w / 2}" cy="${h / 2 + 1}" rx="${w / 4.4}" ry="${h / 2 - 5}" fill="#FFB92E" stroke="${OUT}" stroke-width="1.6"/>`; break;
    }
  }
  return s;
};
const breadBottom = () => `<path d="M${X0 + 10} 0 H ${X1 - 10} Q ${X1 + 8} 0 ${X1 + 4} 14 Q ${X1 - 6} 46 ${X1 - 66} 46 H ${X0 + 66} Q ${X0 + 6} 46 ${X0 - 4} 14 Q ${X0 - 8} 0 ${X0 + 10} 0 Z" fill="#E2A458" stroke="${OUT}" stroke-width="3"/>
  <path d="M${X0 + 30} 40 H ${X1 - 30}" stroke="#B9773A" stroke-width="6" stroke-linecap="round"/><rect x="${X0 + 2}" y="2" width="${L - 4}" height="8" rx="4" fill="#FBE7BF"/>`;
const breadTop = () => {
  let s = `<path d="M${X0 - 6} 0 Q ${X0 - 14} -44 ${X0 + 40} -66 Q ${X0 + L / 2} -104 ${X1 - 40} -66 Q ${X1 + 14} -44 ${X1 + 6} 0 Z" fill="#E2A458" stroke="${OUT}" stroke-width="3"/><rect x="${X0}" y="-9" width="${L}" height="8" rx="4" fill="#FBE7BF"/>`;
  for (let k = 0; k < 5; k++) { const x = X0 + 58 + k * 80; s += `<path d="M${x} -40 Q ${x + 32} -82 ${x + 62} -64 Q ${x + 30} -54 ${x} -40 Z" fill="#FFD08A" stroke="${OUT}" stroke-width="2"/>`; }
  s += `<path d="M${X0 + 60} -78 Q ${X0 + L / 2} -100 ${X1 - 120} -82" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  return s;
};

(() => {
  const svg = $('#breadSvg'), tokens = $('#tokens'), counter = $('#counter');
  const BASE = 316;
  svg.innerHTML = `<ellipse cx="300" cy="${BASE + 56}" rx="260" ry="12" fill="#000" opacity=".35"/><g id="bBot" transform="translate(0 ${BASE})">${breadBottom()}</g><g id="bLayers"></g><g id="bSauce"></g><g id="bTop" transform="translate(0 ${BASE}) rotate(0 ${X1} 0)">${breadTop()}</g>`;
  const gLayers = $('#bLayers', svg), gSauce = $('#bSauce', svg), gTop = $('#bTop', svg);
  const paintTokens = () => { tokens.innerHTML = BOC.map((b, i) => `${b.board && !BOC[i - 1].board ? `<p class="sep">${T('board')}</p>` : ''}<button class="tok" type="button" aria-pressed="${i === cur}" data-i="${i}"><i>${loc(b.n).slice(0, 2)}</i>${loc(b.n)}<small dir="ltr">${A40.eur0(b.p)}</small></button>`).join(''); };
  counter.innerHTML = TRAYS.map((k) => {
    const sp = SPEC[k], rnd = seeded(k.length * 31 + 3);
    const inner = k === 'salsa' ? `<path d="M${X0 + 120} 14 q 20 -26 40 0 t 40 0 t 40 0" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M${X0 + 120} 14 q 20 -26 40 0 t 40 0 t 40 0" fill="none" stroke="#FFC27A" stroke-width="7" stroke-linecap="round"/>` : drawLayer(k, rnd);
    return `<div class="tray${EXTRAS.includes(k) ? ' is-extra' : ''}" data-k="${k}"${EXTRAS.includes(k) ? ` role="button" tabindex="0" aria-pressed="false"` : ''}><svg viewBox="${X0 + 110} ${-(sp.h || 20) * .7} 150 ${(sp.h || 20) * 2.4}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg><b></b></div>`;
  }).join('');
  const paintTrays = () => $$('.tray', counter).forEach((t) => { const k = t.dataset.k; $('b', t).textContent = loc(ING[k].s || ING[k].n); if (t.classList.contains('is-extra')) t.setAttribute('aria-label', T('monta.add') + ': ' + loc(ING[k].n)); });
  const trays = Object.fromEntries($$('.tray', counter).map((t) => [t.dataset.k, t]));
  let cur = -1, extras = new Set(), tl = null, started = false;

  const order = (b) => {
    const f = b.ings.filter((k) => k !== 'salsa');
    EXTRAS.forEach((k) => { if (extras.has(k) && !f.includes(k)) f.push(k); });
    return f;
  };
  const card = (b, keys) => {
    $('#mKick').textContent = T('monta.kick') + (b.board ? ' · ' + T('pizarra') : '');
    $('#mName').textContent = loc(b.n);
    $('#mAr').textContent = A40.rtl ? '' : b.ar || '';
    $('#mDesc').textContent = loc(b.d);
    const all = ['pan', ...keys, ...(b.ings.includes('salsa') ? ['salsa'] : [])];
    $('#mIngs').innerHTML = all.map((k) => `<li${k === 'pan' ? ' class="is-done"' : ''} style="--c:${k === 'pan' ? '#E2A458' : ING[k].c}" data-k="${k}"><span><b>${loc(ING[k].n)}</b>${ING[k].ar && !A40.rtl ? `<span class="ar" lang="ar">${ING[k].ar}</span>` : ''}${extras.has(k) ? ` <small>(${T('extra')})</small>` : ''}<br>${loc(ING[k].note)}</span></li>`).join('');
    $('#mNote').textContent = loc(b.tip);
    $('#stampP').textContent = b.p;
  };
  const done = (k) => { const li = $(`#mIngs li[data-k="${k}"]`); if (li) li.classList.add('is-done'); };

  const assemble = (fast = false, only = null, instant = false) => {
    const b = BOC[cur];
    const keys = order(b);
    if (tl) tl.kill();
    $$('.flyer').forEach((f) => f.remove());
    card(b, keys);
    Object.entries(trays).forEach(([k, t]) => { t.classList.toggle('is-need', keys.includes(k) || (k === 'salsa' && b.ings.includes('salsa'))); t.classList.remove('is-pulse'); });
    gLayers.innerHTML = ''; gSauce.innerHTML = '';
    let y = BASE;
    const groups = keys.map((k, i) => {
      const h = SPEC[k].h, top = y - h * .72;
      y = top;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(0 ${(top + (i === 0 ? 4 : 0)).toFixed(1)})`);
      const inner = document.createElementNS(NS, 'g');
      inner.innerHTML = drawLayer(k, seeded(i * 53 + k.length * 7 + 11));
      g.appendChild(inner); gLayers.appendChild(g);
      return { k, inner, top, h };
    });
    const topY = y - 2;
    let zig = `M${X0 + 10} ${topY + 4}`;
    for (let x = X0 + 30, up = true; x <= X1 - 10; x += 22, up = !up) zig += ` L ${x} ${topY + (up ? -6 : 8)}`;
    if (b.ings.includes('salsa')) gSauce.innerHTML = `<path d="${zig}" fill="none" stroke="${OUT}" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/><path d="${zig}" fill="none" stroke="#FFC27A" stroke-width="6.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${zig}" fill="none" stroke="#FFF1D6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6 30"/>`;
    const closed = `translate(0 ${topY - 6}) rotate(0 ${X1} 0)`;
    if (!motion || instant) { gTop.setAttribute('transform', closed); keys.forEach(done); done('salsa'); if (hasGSAP) gsap.set('#stamp', { scale: 1, rotate: -12 }); return; }
    const sp = fast ? .45 : 1;
    tl = gsap.timeline();
    tl.set('#stamp', { scale: 0, rotate: -40 });
    tl.to(gTop, { attr: { transform: `translate(0 ${topY - 90}) rotate(-22 ${X1} 0)` }, duration: .55 * sp, ease: 'power3.out' });
    groups.forEach((g, i) => {
      if (only && g.k !== only) { tl.set(g.inner, { opacity: 1 }, '<'); done(g.k); return; }
      tl.set(g.inner, { opacity: 0, scaleY: .2, transformOrigin: '50% 100%' }, 0);
      tl.add(() => {
        const t = trays[g.k]; if (!t) return;
        t.classList.add('is-pulse'); setTimeout(() => t.classList.remove('is-pulse'), 420);
        const tr = t.getBoundingClientRect(), m = svg.getScreenCTM();
        if (!m || !tr.width) return;
        const p = svg.createSVGPoint(); p.x = X0 + L * (.3 + .4 * Math.random()); p.y = g.top + g.h / 2;
        const sp2 = p.matrixTransform(m);
        const fl = document.createElement('div'); fl.className = 'flyer'; fl.style.background = ING[g.k].c;
        fl.style.left = tr.left + tr.width / 2 + 'px'; fl.style.top = tr.top + tr.height / 2 + 'px';
        document.body.appendChild(fl);
        const dx = sp2.x - (tr.left + tr.width / 2), dy = sp2.y - (tr.top + tr.height / 2);
        gsap.to(fl, { x: dx, duration: .55 * sp, ease: 'power1.inOut' });
        gsap.to(fl, { keyframes: [{ y: Math.min(dy, 0) - 110, duration: .28 * sp, ease: 'power2.out' }, { y: dy, duration: .27 * sp, ease: 'power2.in' }] });
        gsap.to(fl, { scale: .4, opacity: 0, duration: .15, delay: .5 * sp, onComplete: () => fl.remove() });
      }, i ? '>-0.05' : '>');
      tl.to(g.inner, { opacity: 1, scaleY: 1, duration: .4 * sp, ease: 'back.out(2.4)', onStart: () => done(g.k) }, `>+${.45 * sp}`);
    });
    if (b.ings.includes('salsa')) {
      const paths = $$('path', gSauce);
      tl.add(() => { trays.salsa.classList.add('is-pulse'); setTimeout(() => trays.salsa.classList.remove('is-pulse'), 420); });
      paths.slice(0, 2).forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len }); });
      gsap.set(paths[2], { opacity: 0 });
      tl.to(paths.slice(0, 2), { strokeDashoffset: 0, duration: .7 * sp, ease: 'power1.inOut', onStart: () => done('salsa') });
      tl.to(paths[2], { opacity: 1, duration: .2 });
    }
    tl.to(gTop, { attr: { transform: closed }, duration: .5 * sp, ease: 'bounce.out' });
    tl.to('#stamp', { scale: 1, rotate: -12, duration: .5, ease: 'back.out(3)' }, '-=.15');
  };

  const select = (i) => {
    cur = i;
    $$('.tok', tokens).forEach((t) => t.setAttribute('aria-pressed', +t.dataset.i === i));
    assemble();
  };
  tokens.addEventListener('click', (e) => { const t = e.target.closest('.tok'); if (t) { started = true; select(+t.dataset.i); } });
  const toggleExtra = (t) => {
    const k = t.dataset.k;
    extras.has(k) ? extras.delete(k) : extras.add(k);
    t.classList.toggle('is-on', extras.has(k)); t.setAttribute('aria-pressed', extras.has(k));
    assemble(true, extras.has(k) ? k : '__none');
  };
  counter.addEventListener('click', (e) => { const t = e.target.closest('.tray.is-extra'); if (t) toggleExtra(t); });
  counter.addEventListener('keydown', (e) => { const t = e.target.closest('.tray.is-extra'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleExtra(t); } });
  $('#mAgain').addEventListener('click', () => assemble());
  cur = Math.max(0, BOC.findIndex((b) => b.id === 'mixto'));
  paintTokens(); paintTrays();
  A40.on(() => { paintTokens(); paintTrays(); assemble(false, null, true); });
  if (motion) {
    assemble(false, null, true);
    ScrollTrigger.create({ trigger: '.monta__grid', start: 'top 60%', once: true, onEnter: () => { if (!started) assemble(); } });
  } else assemble();
})();

/* ----------------------------------------------------------
   EL ZOCO · fotos tendidas en un cordel
   ---------------------------------------------------------- */
(() => {
  const vp = $('#zocoVp'), track = $('#zocoTrack'), rope = $('#rope');
  track.insertAdjacentHTML('beforeend', ZOCO.map(([f, w, ar], i) => {
    const [fc, band] = RUG[i % RUG.length];
    return `<figure class="rug" data-i="${i}" style="--fc:${fc};--band:${band};--w:${w}px;--ar:${ar};margin-top:${(i % 3) * 14}px"><span class="rug__peg rug__peg--l"></span><span class="rug__peg rug__peg--r"></span><div class="rug__body"><div class="rug__img"><img src="${IMG(f)}" alt="" loading="lazy" draggable="false"></div><div class="rug__band"></div></div><div class="rug__fringe"></div><figcaption class="rug__tag"></figcaption></figure>`;
  }).join(''));
  const rugs = $$('.rug', track).map((el, i) => ({ el, th: 0, w: 0, ph: i * .9 }));
  const caps = () => rugs.forEach(({ el }, i) => { const [t, d] = A40.SITE.zoco[i]; $('.rug__tag', el).innerHTML = `<b>${loc(t)}</b>${loc(d)}`; $('img', el).alt = `${loc(t)}: ${loc(d)}`; });
  caps(); A40.on(caps);
  const drawRope = () => {
    const W = track.scrollWidth;
    rope.setAttribute('width', W); rope.setAttribute('viewBox', `0 0 ${W} 120`);
    const pts = [[0, 4]];
    rugs.forEach(({ el }) => { const x = el.offsetLeft, w = el.offsetWidth, y = el.offsetTop - 34 + 6; pts.push([x + w * .18 + 6, y], [x + w * .82 - 6, y]); });
    pts.push([W, 4]);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k]; d += ` Q ${(x0 + x1) / 2} ${Math.max(y0, y1) + Math.min(30, (x1 - x0) * .08)} ${x1} ${y1}`; }
    rope.innerHTML = `<path d="${d}"/><path d="${d}"/>`;
  };
  let x = 0, tx = 0, vel = 0, drag = null, moved = 0, raf = 0, vis = false, prevX = 0;
  const maxX = () => Math.max(0, track.scrollWidth - vp.clientWidth);
  const tick = (t) => {
    x = lerp(x, tx, motion ? .1 : 1);
    vel = lerp(vel, x - prevX, .3); prevX = x;
    track.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
    $('#zBar').style.transform = `translateX(${(maxX() ? x / maxX() : 0) * 400}%)`;
    rugs.forEach((r) => {
      r.w += (-.12 * r.th - .14 * r.w) + vel * .0009 + (motion ? Math.sin(t / 1600 + r.ph) * .00012 : 0);
      r.th = clamp(r.th + r.w, -.22, .22);
      r.el.style.transform = `rotate(${r.th.toFixed(4)}rad)`;
    });
    raf = (vis || drag) && motion ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf && motion) raf = requestAnimationFrame(tick); else if (!motion) tick(0); };
  vp.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, st: tx }; moved = 0; vp.setPointerCapture(e.pointerId); vp.classList.add('is-drag'); kick(); });
  vp.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.sx; moved = Math.max(moved, Math.abs(dx)); tx = clamp(drag.st - dx * 1.1, -60, maxX() + 60); });
  const end = () => { if (!drag) return; drag = null; vp.classList.remove('is-drag'); tx = clamp(tx, 0, maxX()); kick(); };
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  track.addEventListener('click', (e) => { const r = e.target.closest('.rug'); if (!r || moved > 6) return; const i = +r.dataset.i, [t, d] = A40.SITE.zoco[i]; openLB(IMG(ZOCO[i][0]), `${loc(t)} · ${loc(d)}`); });
  const nudge = (s) => { tx = clamp(tx + s * vp.clientWidth * .7, 0, maxX()); kick(); };
  $('#zPrev').addEventListener('click', () => nudge(-1)); $('#zNext').addEventListener('click', () => nudge(1));
  vp.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') nudge(1); if (e.key === 'ArrowLeft') nudge(-1); });
  new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) kick(); }).observe(vp);
  const setup = () => { drawRope(); tx = clamp(tx, 0, maxX()); kick(); };
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  setup();
})();

/* ----------------------------------------------------------
   VENTANAS · contraventanas que se abren a los vídeos
   ---------------------------------------------------------- */
(() => {
  const wins = $$('[data-win]');
  if (STATIC) { wins.forEach((w) => w.classList.add('is-open')); return; }
  const io = new IntersectionObserver((ens) => ens.forEach((en) => {
    const v = $('video', en.target);
    if (en.isIntersecting) { en.target.classList.add('is-open'); setTimeout(() => play(v), reduced ? 0 : 500); }
    else v.pause();
  }), { threshold: .4 });
  wins.forEach((w) => io.observe(w));
})();

/* ----------------------------------------------------------
   VOCES · reseñas en bucle
   ---------------------------------------------------------- */
(() => {
  const t = $('#voces');
  const paint = () => {
    const one = (h) => A40.SITE.revs.map(([who, q]) => `<blockquote${h ? ' aria-hidden="true"' : ''}><p>${loc(q)}</p><cite>${who ? who + ' · ' : ''}${T('rev.g')}</cite></blockquote>`).join('');
    t.innerHTML = one(false) + one(true);
  };
  paint(); A40.on(paint);
})();

/* ----------------------------------------------------------
   LIGHTBOX
   ---------------------------------------------------------- */
function openLB(src, cap) {
  const lb = $('#lb');
  $('#lbImg').src = src; $('#lbImg').alt = cap; $('#lbCap').textContent = cap;
  lb.hidden = false; if (lenis) lenis.stop();
  $('.lb__x', lb).focus();
}
const closeLB = () => { $('#lb').hidden = true; if (lenis) lenis.start(); };
$('#lb').addEventListener('click', (e) => { if (e.target.id === 'lb' || e.target.closest('.lb__x')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#lb').hidden) closeLB(); });

A40.start();
if (hasGSAP) addEventListener('load', () => ScrollTrigger.refresh());
})();
