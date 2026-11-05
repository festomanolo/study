import { forms, codeQs } from './content.js';
import { run, runSync, fmt } from './interp.js';
import { bespoke } from './labs.js';
import { DIAGRAMS } from './diagrams.js';
import { makeDiagram } from './notebook.js';
import { PHON, TRAPS, GIST, SHORT, markShort } from './micro.js';
import { learner, MIS, errTag as errTagOf } from './learner.js';
const $ = document.getElementById('app'), live = document.getElementById('live');
const h = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [n, v] of Object.entries(a)) n.startsWith('on') ? e.addEventListener(n.slice(2), v) : n === 'class' ? e.className = v : v !== false && e.setAttribute(n, v === true ? '' : v); for (const c of k.flat()) if (c != null) e.append(c); return e; };
const say = m => { live.textContent = ''; setTimeout(() => live.textContent = m, 30); };

// ---- store (versioned) ----
// Shared-phone learners: '' is the first learner (key manolo.v1); others live in manolo.v1.<name>.
const DEF = { v: 1, set: { sw: true, reduce: false, readable: false, fs: 1, quality: 'auto', rate: 0.9, ink: 0, light: 88, marks: false, group: 1 }, page: {}, edits: {}, lab: {}, quiz: {}, dates: {}, dogear: {}, name: '', school: '', seen: false, last: {} };
const keyOf = n => n ? 'manolo.v1.' + n : 'manolo.v1', ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch {} };
let profiles = [], active = ''; try { profiles = JSON.parse(ls('manolo.profiles') || '[]'); active = ls('manolo.active') || ''; } catch {}
let S; function load() { try { S = { ...structuredClone(DEF), ...JSON.parse(ls(keyOf(active)) || '{}') }; S.set = { ...DEF.set, ...S.set }; } catch { S = structuredClone(DEF); } }
load();
const save = () => ls(keyOf(active), JSON.stringify(S));
const Lr = () => learner(S, save); // understanding engine bound to the active learner
const nameOf = id => id || (() => { try { return JSON.parse(ls('manolo.v1') || '{}').name; } catch {} })() || 'Learner 1';
function switchProfile(id) { save(); active = id; ls('manolo.active', id); load(); applySettings(); }
const INKS = [['#1b387b', '#1e232a', 'Bic Blue'], ['#23272e', '#0f172a', 'Gel Black'], ['#2e1f6e', '#1c1917', 'Indigo']];
function applySettings() {
  const r = document.documentElement;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  const low = S.set.quality === 'low' || (S.set.quality === 'auto' && (mem <= 2 || cores <= 2));
  r.classList.toggle('low', low);
  r.classList.toggle('reduce', S.set.reduce || matchMedia('(prefers-reduced-motion: reduce)').matches || low);
  r.classList.toggle('readable', S.set.readable); r.style.setProperty('--fs', S.set.fs);
  const ink = INKS[S.set.ink] || INKS[0]; r.style.setProperty('--ink', ink[0]); r.style.setProperty('--ink-black', ink[1]); r.style.setProperty('--lighting', S.set.light / 100);
  r.style.setProperty('--line', Math.round(28 * S.set.fs) + 'px');
}
const spread = (sheet, clip) => h('div', { class: 'spread' }, h('div', { class: 'glimpse' }), h('div', { class: 'pages' }, sheet, clip || null, h('div', { class: 'grain' }), h('div', { class: 'light' }), h('div', { class: 'stampbrand' }, 'MANOLO'), h('div', { class: 'mark' }, 'festomanolo.com')));
const reduced = () => document.documentElement.classList.contains('reduce');
// ---- dock icons: stroke-based, SF-Symbols-like (24px grid, round caps) ----
const ICONS = {
  contents: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="18" r=".6"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
  apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
  pack: '<path d="M9 7V6a3 3 0 016 0v1"/><rect x="5" y="7" width="14" height="14" rx="4.5"/><path d="M9 15h6M9 11.5h6"/>',
  translate: '<path d="M3.5 6h9M8 4v2M5.5 6c.6 3.6 3 6.4 6 8M11.5 6c-.6 3.6-3 6.4-6.5 8.2"/><path d="M12.5 20l4-9 4 9M14 16.8h5"/>',
  flow: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  recall: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.6l9 4.8 9-4.8M3 16.8l9 4.7 9-4.7" opacity=".55"/>',
  voice: '<path d="M4 9.5v5h3.5L13 19V5L7.5 9.5z"/><path d="M16.5 9a4.2 4.2 0 010 6M19 6.5a7.7 7.7 0 010 11"/>',
  copy: '<path d="M7 3.5h7.5L19 8v12.5H7z"/><path d="M14.5 3.5V8H19M10 12.5h6M10 16.5h6"/>',
  edit: '<path d="M4 20l.9-4L16 4.9a1.8 1.8 0 012.6 0l.5.5a1.8 1.8 0 010 2.6L8 19.1z"/><path d="M13.8 7.2l3 3"/>',
  ink: '<path d="M12 3.2c3.8 4.6 6 7.8 6 10.8a6 6 0 01-12 0c0-3 2.2-6.2 6-10.8z"/>',
  gear: '<path d="M4 7h9M18 7h2M4 17h2M11 17h9"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="8.5" cy="17" r="2.5"/>',
  install: '<path d="M12 4v11M7.5 10.8l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
};
const icon = n => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ic'); s.innerHTML = ICONS[n]; return s; };
const tool = (n, label, a = {}) => h('button', { class: 'dk-tool', ...a }, icon(n), h('span', { class: 'lbl' }, label));

// ---- audio: synthetic chimes (0 KB) + local neural TTS (/api/tts with Web Speech fallback) ----
let ac, curAudio = null;
function chime(f = 660, d = .08) { try { ac ||= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch {} }
function ttsStop() { if (curAudio) { try { curAudio.pause(); curAudio.src = ''; } catch {} curAudio = null; } try { speechSynthesis.cancel(); } catch {} }
// The neural voice only exists on the local dev server; the published site uses the browser voice.
const NEURAL = /^(localhost|127\.|\[::1\])/.test(location.hostname);
function ttsPrefetch(t) { const c = t.replace(/✏️?/g, '').trim(); if (c && NEURAL) fetch('/api/tts?text=' + encodeURIComponent(c)).catch(() => {}); }
function ttsSpeak(t, { rate = S.set.rate, onEnd, onError } = {}) {
  ttsStop(); const c = t.replace(/✏️?/g, '').trim(); if (!c) return onEnd?.();
  const a = new Audio(NEURAL ? '/api/tts?text=' + encodeURIComponent(c) : undefined); curAudio = a; a.playbackRate = rate || 1;
  a.onended = () => { if (curAudio === a) curAudio = null; onEnd?.(); };
  a.onerror = () => {
    if (curAudio === a) curAudio = null;
    if ('speechSynthesis' in window) { try { const m = new SpeechSynthesisUtterance(c); m.rate = rate || 1; if (onEnd) m.onend = onEnd; if (onError) m.onerror = onError; speechSynthesis.speak(m); return; } catch {} }
    onError ? onError() : say('Speech is not available on this device.');
  };
  if (!NEURAL) return a.onerror();
  a.play().catch(() => a.onerror?.());
}

// ---- spring ----
function spring(from, to, cb, k = 180, c = 18) { let x = from, v = 0, stop = false; (function f() { if (stop) return; v += (-k * (x - to) - c * v) / 60; x += v / 60; cb(x); if (Math.abs(x - to) > .001 || Math.abs(v) > .01) requestAnimationFrame(f); else cb(to); })(); return () => stop = true; }

// ---- notes in IndexedDB (localStorage fallback) ----
const idb = new Promise(r => { try { const q = indexedDB.open('manolo', 1); q.onupgradeneeded = () => q.result.createObjectStore('notes'); q.onsuccess = () => r(q.result); q.onerror = () => r(null); } catch { r(null); } });
const noteKey = id => (active ? active + ':' : '') + id;
const noteGet = async id0 => { const id = noteKey(id0); const d = await idb; if (!d) return S.mine?.[id] || ''; return new Promise(r => { const q = d.transaction('notes').objectStore('notes').get(id); q.onsuccess = () => r(q.result || ''); q.onerror = () => r(''); }); };
const notePut = async (id0, v) => { const id = noteKey(id0); const d = await idb; if (!d) { (S.mine ||= {})[id] = v; return save(); } d.transaction('notes', 'readwrite').objectStore('notes').put(v, id); };

// ---- model ----
// Split long notes at "## " headings so each page holds about one screen of text.
const noteParts = t => { const parts = []; let n = 0; for (const e of t.notes) { const len = e.length; if (e.startsWith('## ') && n > 700) { parts.push(1); n = 0; } n += len; } parts.push(1); return parts.map((_, i) => i ? 'notes' + i : 'notes'); };
const noteChunk = (t, i) => { const out = [[]]; let n = 0; for (const e of t.notes) { if (e.startsWith('## ') && n > 700) { out.push([]); n = 0; } out.at(-1).push(e); n += e.length; } return out[i] || []; };
const form = f => forms[f];
function pagesOf(f) {
  const out = [];
  for (const u of form(f).units) {
    for (const t of u.topics) for (const type of [...noteParts(t), 'glossary', 'lab', ...(t.labs || []).map((_, i) => 'lab' + (i + 2)), 'recall', 'practice', 'summary']) out.push({ kind: 'page', type, t, u, id: `${t.id}.${type}` });
    out.push({ kind: 'cp', u, id: 'cp.' + u.id });
  }
  return out;
}
const topicDone = t => S.lab[t.id] && (t.labs || []).every((_, i) => S.lab[`${t.id}.${i + 2}`]) && (S.quiz[t.id] || 0) >= .6;
const unitPct = u => Math.round(100 * u.topics.filter(topicDone).length / u.topics.length);

// ---- router ----
const go = h2 => { location.hash = h2; };
addEventListener('hashchange', route);
let cur = null, rt = null;
function route() {
  clearInterval(rt);
  const p = location.hash.replace(/^#\/?/, '').split('/'); say('');
  if (!S.seen && !p[0]) return boot();
  if (p[0] === 'cs' && forms[p[1]]) {
    if (p[2] === 'toc') return toc(p[1]);
    if (p[2] === 'review') return review(p[1]);
    if (p[2] === 'p') return pageScene(p[1], +p[3] || 0);
    if (p[2] === 't') return pageScene(p[1], Math.max(0, pagesOf(p[1]).findIndex(x => x.t?.id === p[3])));
    return cover(p[1]);
  }
  if (p[0] === 'hardware') return hardware();
  if (p[0] === 'demo') return demo();
  bag();
}
function scene(...k) { cur?.(); cur = null; $.replaceChildren(h('div', { class: 'scene' }, ...k), hud()); $.firstChild.focus?.(); }
function hud() {
  return h('div', { class: 'hud' }, h('button', { class: 'hud-btn', 'aria-label': 'Settings', title: 'Settings', onclick: settings }, icon('gear')));
}

// ---- boot ----
function boot() {
  const end = () => { S.seen = true; save(); go('#/bag'); };
  scene(h('div', { class: 'stamp' }, 'MANOLO'), h('button', { class: 'pri', onclick: end }, 'Skip / Ruka'));
  const t = setTimeout(end, reduced() ? 400 : 1500); cur = () => clearTimeout(t);
}

// ---- backpack ----
let level = 'f2';
function bag() {
  let p = 0;
  const books = h('div', { class: 'books' },
    h('button', { class: 'book', style: 'background:#244a9a', disabled: true, onclick: open }, 'Computer Science'),
    h('button', { class: 'book', style: 'background:#1b387b;--ty:0px', onclick: () => go('#/hardware') }, 'Hardware · Vifaa'),
    ...['Physics', 'Maths', 'Biology'].map((s, i) => h('button', { class: 'book soon', disabled: true, 'aria-label': s + ' coming soon', style: `background:${['#1b7f5a', '#7a3fa0', '#a06a1b'][i]}` }, s + ' · Soon')));
  const csBtn = books.firstChild;
  const pull = h('div', { class: 'pull', role: 'slider', tabindex: 0, 'aria-label': 'Zipper', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0 });
  const zip = h('div', { class: 'zip' }, h('div', { class: 'track' }), pull);
  const bagEl = h('div', { class: 'bag' }, books, h('div', { class: 'flap' }, '🎒 MANOLO'), zip, h('div', { class: 'charm' }, '🇹🇿'));
  const set = v => { p = Math.max(0, Math.min(1, v)); const w = zip.clientWidth - 30; pull.style.left = p * w + 'px'; bagEl.style.setProperty('--p', p); pull.setAttribute('aria-valuenow', Math.round(p * 100)); const o = p > .85; bagEl.classList.toggle('open', o); csBtn.disabled = !o; if (o) csBtn.disabled = false; };
  let last = 0, cancel = () => {};
  const settle = () => { cancel(); const to = p > .5 ? 1 : 0; if (reduced()) set(to); else cancel = spring(p, to, set); if (to) chime(880, .15); };
  pull.addEventListener('pointerdown', e => { pull.setPointerCapture(e.pointerId); cancel(); pull._d = true; });
  pull.addEventListener('pointermove', e => { if (!pull._d) return; const r = zip.getBoundingClientRect(); set((e.clientX - r.left - 15) / (r.width - 30)); const n = Math.floor(p * 24); if (n !== last) { last = n; chime(300 + n * 15, .02); } });
  pull.addEventListener('pointerup', () => { pull._d = false; settle(); });
  pull.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'Enter') set(p + .25), p > .85 && settle(); if (e.key === 'ArrowLeft') set(p - .25); });
  function open() { go(`#/cs/${level}`); }
  const lv = h('div', { class: 'tag' }, ...['f1', 'f2'].map(f => h('button', { class: f === level ? 'on' : '', onclick: () => { level = f; lv.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['f1', 'f2'][i] === level)); } }, form(f).title)));
  const badge = h('div', { class: 'bando', role: 'status' }, '⏳ Preparing offline… / Inaandaa');
  (async () => { try { if (navigator.serviceWorker?.controller && await caches.has(CACHE_V)) { badge.textContent = '🟢 Offline Ready • 0 MB Bando Used / Inafanya kazi bila bando'; badge.classList.add('ok'); } } catch {} })();
  const cont = S.last.f ? h('button', { class: 'pri', onclick: () => go(`#/cs/${S.last.f}/p/${S.last.n}`) }, 'Continue where you left off') : null;
  scene(h('h1', { style: 'margin:0;font-family:var(--hand)' }, 'MANOLO Backpack'), badge, lv, bagEl, h('button', { onclick: () => set(p > .5 ? 0 : 1) }, 'Zip / Unzip (button)'), cont, h('small', {}, 'Drag the zipper, then pick a notebook. Buruta zipu kisha chagua daftari.'));
}

// ---- original hardware notebook (legacy), embedded with its simulators ----
function hardware() {
  scene(h('iframe', { class: 'legacy', src: 'legacy/handwritten_notebook_web_app.html', title: 'Hardware notebook' }), h('button', { onclick: () => go('#/bag') }, '🎒 Back to bag'));
}

// ---- cover ----
function cover(f) {
  let r = 0, dragging = false, x0 = 0;
  const stop = e => e.stopPropagation(), keep = { onclick: stop, onpointerdown: stop, onkeydown: stop };
  const field = (l, k) => h('label', {}, h('b', {}, l), h('input', { value: S[k] || '', 'aria-label': l, oninput: e => { S[k] = e.target.value; save(); } }));
  const add = h('input', { placeholder: '+ Add learner', 'aria-label': 'Add learner name', onkeydown: e => { const n = add.value.trim().replace(/[^\w\- ]/g, ''); if (e.key !== 'Enter' || !n || profiles.includes(n)) return; profiles.push(n); ls('manolo.profiles', JSON.stringify(profiles)); switchProfile(n); S.name = n; save(); route(); } });
  const who = h('div', { class: 'who', ...keep }, h('small', {}, 'Who is studying? / Nani anasoma?'), ['', ...profiles].map(id => h('button', { class: id === active ? 'on' : '', onclick: () => { if (id === active) return; switchProfile(id); chime(600, .05); route(); } }, nameOf(id))), add);
  const lid = h('div', { class: 'lid counter', tabindex: 0, role: 'button', 'aria-label': 'Open notebook' }, h('i', { class: 'spine' }),
    h('div', { class: 'label', ...keep }, h('small', {}, 'COUNTER BOOK · 2 QUIRE'), field('JINA / NAME: ', 'name'), h('div', {}, h('b', {}, 'SOMO / SUBJECT: '), 'Computer Science'), h('div', {}, h('b', {}, 'KIDATO / FORM: '), form(f).title), field('SHULE / SCHOOL: ', 'school')),
    who, h('small', { class: 'hint' }, 'Tap or drag to open · TIE 2023 syllabus'));
  const setR = v => { r = v; lid.style.setProperty('--r', v + 'deg'); };
  const finish = () => { if (reduced()) return go(`#/cs/${f}/toc`); spring(r, -165, setR, 120, 14); setTimeout(() => go(`#/cs/${f}/toc`), 450); chime(500, .1); };
  lid.onclick = () => { if (!dragging) finish(); };
  lid.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') finish(); };
  lid.onpointerdown = e => { x0 = e.clientX; dragging = false; lid.setPointerCapture(e.pointerId); };
  lid.onpointermove = e => { if (!lid.hasPointerCapture(e.pointerId)) return; const dx = x0 - e.clientX; if (dx > 8) { dragging = true; setR(-Math.min(165, dx * .8)); } };
  lid.onpointerup = () => { if (dragging) { if (r < -58) finish(); else spring(r, 0, setR); setTimeout(() => dragging = false, 0); } };
  scene(h('div', { class: 'cover' }, h('div', { class: 'in' }, 'Yaliyomo…'), lid), h('button', { onclick: () => go('#/bag') }, '🎒 Back to bag'));
}

// ---- contents ----
function toc(f) {
  const pgs = pagesOf(f), sheet = h('div', { class: 'sheet toc' }, h('h2', {}, `Yaliyomo / Contents — ${form(f).title}`));
  const topics = form(f).units.flatMap(u => u.topics), weak = Lr().weakest(topics), missed = Lr().missed().filter(k => topics.some(t => k.startsWith(t.id + ':')));
  if (weak.length || missed.length) sheet.append(h('h3', {}, '🧠 Uelewa wako / Your understanding'), ...weak.map(t => { const tag = Lr().tagsFor(t.id)[0], n = pgs.findIndex(x => x.t === t); return h('button', { class: 'row', onclick: () => riffle(f, n) }, h('span', { class: 'tick mdot ' + Lr().level(t.id) }, '●'), `Revise: ${t.title}${tag ? ' — ' + MIS[tag][1] : ''}`, h('span', { class: 'dots' }), Math.round((Lr().mastery(t.id) ?? 0) * 100) + '%'); }),
    missed.length ? h('button', { class: 'row', onclick: () => go(`#/cs/${f}/review`) }, h('span', { class: 'tick' }, '🔁'), `Marudio / Review ${missed.length} missed question${missed.length > 1 ? 's' : ''}`, h('span', { class: 'dots' }), 'go') : null);
  const ears = pgs.map((x, i) => [x, i]).filter(([x]) => S.dogear[x.id]);
  if (ears.length) sheet.append(h('h3', {}, '📑 Folded corners / Kurasa zilizokunjwa'), ...ears.map(([x, i]) => h('button', { class: 'row', onclick: () => riffle(f, i) }, h('span', { class: 'tick' }, '◥'), x.t ? `${x.t.title} · ${x.type}` : 'Checkpoint', h('span', { class: 'dots' }), 'p.' + (i + 1))));
  for (const u of form(f).units) {
    sheet.append(h('h3', {}, `${u.id} ${u.title} (${u.periods} periods) `, h('small', {}, unitPct(u) + '%')), h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': unitPct(u) }, h('i', { style: `width:${unitPct(u)}%` })));
    for (const t of u.topics) {
      const n = pgs.findIndex(x => x.t === t);
      sheet.append(h('button', { class: 'row', onclick: () => riffle(f, n) }, h('span', { class: 'tick' }, topicDone(t) ? '✔' : ''), t.title, h('span', { class: 'mdot ' + Lr().level(t.id), title: 'Understanding: ' + Lr().level(t.id) }, '●'), h('span', { class: 'dots' }), 'p.' + (n + 1)));
    }
    sheet.append(h('button', { class: 'row', onclick: () => riffle(f, pgs.findIndex(x => x.u === u && x.kind === 'cp')) }, h('span', { class: 'tick' }, S.quiz[u.id] >= .6 ? '✔' : ''), '📝 Checkpoint', h('span', { class: 'dots' }), 'test'));
  }
  scene(spread(sheet), h('button', { onclick: () => go(`#/cs/${f}`) }, '← Close notebook'));
  sheet.focus?.();
}
function riffle(f, n) {
  const from = S.last.f === f ? S.last.n || 0 : 0, gap = Math.abs(n - from);
  if (reduced() || gap < 2) return go(`#/cs/${f}/p/${n}`);
  const steps = Math.min(5, gap); let i = 0;
  rt = setInterval(() => { pageScene(f, Math.round(from + (n - from) * (++i / (steps + 1))), true); if (i >= steps) { clearInterval(rt); go(`#/cs/${f}/p/${n}`); } }, 110);
}

// ---- pages ----
function pageScene(f, n, ghost = false) {
  const pgs = pagesOf(f); n = Math.max(0, Math.min(pgs.length - 1, n)); const pg = pgs[n];
  if (!ghost) { S.last = { f, n }; S.page[pg.id] = 1; S.dates[pg.id] ||= new Date().toLocaleDateString('en-GB'); save(); }
  const sheet = h('div', { class: 'sheet' + (reduced() ? '' : ' flip'), tabindex: 0 });
  const pencil = h('div', { class: 'pencil', hidden: true, role: 'status' });
  if (pg.kind === 'cp') checkpoint(sheet, pg.u);
  else renderPage(sheet, pg, pencil);
  sheet.append(pencil);
  const dg = sheet._dg, tray = h('div', { class: 'tray', hidden: true }), hud = h('div', { class: 'hud2', hidden: true, role: 'status' });
  const topicFirst = pg.t ? pgs.findIndex(x => x.t === pg.t) : -1, want = pg.t && DIAGRAMS[pg.t.id];
  const withDiagram = what => () => { if (!want) return; if (dg) { what === 'sim' ? dg.sim(hud) : dg.recalling ? dg.stopRecall() : dg.recall(tray); } else { try { sessionStorage.setItem('manolo.pending', what); } catch {} go(`#/cs/${f}/p/${topicFirst}`); } };
  let talking = false; const stopTalk = () => { talking = false; ttsStop(); sheet.querySelectorAll('.hl').forEach(x => x.classList.remove('hl')); voice.classList.remove('on'); };
  const talk = () => {
    if (talking) return stopTalk();
    const blocks = [...sheet.querySelectorAll(':scope > p:not([contenteditable]), :scope > h3, :scope > ul > li')].filter(b => b.textContent.trim()); let i = 0; talking = true; voice.classList.add('on');
    const next = () => { sheet.querySelectorAll('.hl').forEach(x => x.classList.remove('hl')); if (!talking || i >= blocks.length) return stopTalk(); const b = blocks[i++]; b.classList.add('hl'); b.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); if (blocks[i]) ttsPrefetch(blocks[i].textContent); ttsSpeak(b.textContent, { rate: S.set.rate, onEnd: next, onError: stopTalk }); };
    next();
  };
  const voice = tool('voice', 'Mwalimu', { onclick: talk, 'aria-label': 'Mwalimu voice', title: 'Mwalimu reads the page and highlights each line' });
  const clip = h('button', { class: 'clip', onclick: talk, title: 'Tap to hear Mwalimu', 'aria-label': 'Hear Mwalimu' }, h('span', {}, '📎'));
  let wl = null; const copyOff = () => { sheet.classList.remove('copymode'); copyBtn.classList.remove('on'); copyBtn.querySelector('.lbl').textContent = 'Copy'; wl?.release?.().catch(() => {}); wl = null; };
  const copyBtn = tool('copy', 'Copy', { title: 'Nakili Daftarini — number the lines and keep the screen on while you copy into your exercise book', onclick: async () => {
    if (sheet.classList.contains('copymode')) return copyOff();
    sheet.classList.add('copymode'); copyBtn.classList.add('on'); pencil.hidden = true;
    const lh = parseFloat(getComputedStyle(sheet).lineHeight) || 28, lines = Math.round(sheet.scrollHeight / lh);
    say(`Copy mode: about ${(lines / 32).toFixed(1)} Counter Book pages. Screen stays on.`); copyBtn.querySelector('.lbl').textContent = `≈ ${(lines / 32).toFixed(1)} pg`;
    try { wl = await navigator.wakeLock?.request('screen'); } catch {} } });
  const editable = type => type.startsWith('notes'), blocksOf = () => [...sheet.querySelectorAll(':scope > p:not([contenteditable]), :scope > ul > li')];
  const saved = S.edits[pg.id]; if (saved) blocksOf().forEach((b, k) => { if (saved[k] != null) b.textContent = saved[k]; });
  let editing = false; const edit = tool('edit', 'Edit', { onclick: () => { editing = !editing; sheet.classList.toggle('editing', editing); edit.classList.toggle('on', editing); blocksOf().forEach((b, k) => { b.contentEditable = editing; b.oninput = () => { (S.edits[pg.id] ||= {})[k] = b.textContent; save(); }; }); say(editing ? 'Edit mode on: tap any line and type.' : 'Edit mode off.'); }, disabled: !editable(pg.type || '') });
  const inkBtn = tool('ink', INKS[S.set.ink][2], { title: 'Change pen colour', onclick: () => { S.set.ink = (S.set.ink + 1) % INKS.length; save(); applySettings(); inkBtn.lastChild.textContent = INKS[S.set.ink][2]; inkBtn.style.setProperty('--tint', INKS[S.set.ink][0]); } });
  inkBtn.style.setProperty('--tint', INKS[S.set.ink][0]);
  const light = h('input', { type: 'range', min: 0, max: 100, value: S.set.light, 'aria-label': 'Lighting', oninput: e => { S.set.light = +e.target.value; applySettings(); }, onchange: save });
  const pop = h('div', { class: 'dk-pop', hidden: true, role: 'dialog', 'aria-label': 'Lighting' }, icon('light'), light, icon('light'));
  const lightBtn = tool('light', 'Light', { 'aria-haspopup': 'dialog', 'aria-expanded': 'false', onclick: e => { e.stopPropagation(); setPop(pop.hidden); } });
  const setPop = open => { pop.hidden = !open; lightBtn.classList.toggle('on', open); lightBtn.setAttribute('aria-expanded', open); };
  const outside = e => { if (!pop.hidden && !pop.contains(e.target) && !lightBtn.contains(e.target)) setPop(false); if (open && !dock.contains(e.target)) setOpen(false); }, esc = e => { if (e.key === 'Escape') setPop(false); };
  let open = false, hid = false;
  const grab = h('button', { class: 'dk-grab', 'aria-label': 'Show or hide tools', 'aria-expanded': 'false' }, h('i'), h('span', { class: 'dk-peek', 'aria-hidden': 'true' }, `${n + 1} / ${pgs.length}`));
  const sync = () => { const full = dock.offsetHeight; document.documentElement.style.setProperty('--dock-h', (hid ? 34 : full) + 'px'); };
  const setOpen = o => { open = o; dock.classList.toggle('tools-off', !o); grab.setAttribute('aria-expanded', o); tools.inert = !o || hid; moreBtn.classList.toggle('on', o); moreBtn.setAttribute('aria-expanded', o); if (!o) setPop(false); };
  // Reading mode: the bar slides away while you scroll down and returns the moment you scroll up, reach the end, or tap the peek tab.
  const setHide = x => { if (x === hid) return; hid = x; dock.classList.toggle('hide', x); mainRow.inert = x; tools.inert = !open || x; if (x) { setOpen(false); setPop(false); } sync(); };
  let ly = null, acc = 0;
  const onScroll = e => { const t = e.target; if (t.closest?.('.dock,.dk-pop')) return; const el = t === document ? document.scrollingElement : t; if (!el || el.clientHeight === undefined) return; const y = el.scrollTop; if (ly == null) { ly = y; return; } const d = y - ly; ly = y; acc = Math.sign(d) === Math.sign(acc) ? acc + d : d;
    const end = el.scrollHeight - el.clientHeight - y < 90;
    if (y < 40 || end || acc < -14) { setHide(false); } else if (acc > 18 && y > 140) setHide(true); };
  let gy = null; grab.addEventListener('pointerdown', e => { gy = e.clientY; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointerup', e => { if (gy == null) return; const dy = e.clientY - gy; gy = null;
    if (hid) return setHide(false);
    if (dy < -14) setOpen(true); else if (dy > 14) { if (open) setOpen(false); else setHide(true); } else setOpen(!open); });
  grab.addEventListener('pointercancel', () => { gy = null; });
  const total = pgs.length;
  const pager = h('button', { class: 'dk-pg', onclick: () => go(`#/cs/${f}/toc`), 'aria-label': `Page ${n + 1} of ${total}. Open contents` }, h('b', {}, n + 1), h('span', {}, `of ${total}`), h('i', { style: `--p:${total > 1 ? n / (total - 1) : 1}` }));
  const step = (name, label, to, off) => h('button', { class: 'dk-step', disabled: off, onclick: () => go(`#/cs/${f}/p/${to}`), 'aria-label': label }, icon(name));
  const moreBtn = h('button', { class: 'dk-step dk-more', 'aria-label': 'Study tools', 'aria-expanded': 'false', title: 'Study tools', onclick: () => setOpen(!open) }, icon('apps'));
  const tools = h('div', { class: 'dk-tools' }, h('div', { class: 'dk-scroll', role: 'toolbar', 'aria-label': 'Study tools' },
    tool('translate', 'Fafanua', { class: 'dk-tool' + (S.set.sw ? ' on' : ''), 'aria-pressed': !!S.set.sw, onclick: () => { S.set.sw = !S.set.sw; save(); route(); }, title: 'Show Swahili explanations' }),
    tool('flow', 'Data Flow', { onclick: withDiagram('sim'), disabled: !(want && DIAGRAMS[pg.t.id].sim), title: 'Animated step-by-step simulator' }),
    tool('recall', 'Recall', { onclick: withDiagram('recall'), disabled: !want, title: 'Active recall: hide the labels and put them back' }),
    voice, copyBtn, edit, inkBtn, lightBtn));
  const dock = h('nav', { class: 'dock', 'aria-label': 'Page navigation' }, pop, grab,
    h('div', { class: 'dk-main' }, h('button', { class: 'dk-step', onclick: () => go(`#/cs/${f}/toc`), 'aria-label': 'Contents', title: 'Contents' }, icon('contents')), h('span', { class: 'dk-sp' }), step('prev', 'Previous page', n - 1, n === 0), pager, step('next', 'Next page', n + 1, n === total - 1), h('span', { class: 'dk-sp' }), h('button', { class: 'dk-step', onclick: () => go('#/bag'), 'aria-label': 'Backpack', title: 'Backpack' }, icon('pack'))),
    tools);
  setOpen(open);
  const ro = new ResizeObserver(() => { if (!dock.isConnected) return ro.disconnect(); document.documentElement.style.setProperty('--dock-h', dock.offsetHeight + 'px'); }); ro.observe(dock);
  const nav = dock;

  const ear = h('button', { class: 'dogear' + (S.dogear[pg.id] ? ' on' : ''), 'aria-label': 'Fold page corner for revision', 'aria-pressed': !!S.dogear[pg.id], onclick() { if (S.dogear[pg.id]) delete S.dogear[pg.id]; else S.dogear[pg.id] = 1; save(); this.classList.toggle('on'); this.setAttribute('aria-pressed', !!S.dogear[pg.id]); chime(420, .04); say(S.dogear[pg.id] ? 'Corner folded. Listed in Contents.' : 'Corner unfolded.'); } });
  const datebox = h('div', { class: 'datebox' }, 'Date: ', h('span', { class: 'pen' }, S.dates[pg.id] || '__/__/____'), h('br'), 'Page No. ', h('span', { class: 'pen' }, n + 1));
  const sp = spread(sheet, clip); sp.querySelector('.pages').append(ear, datebox);
  scene(sp, tray, hud, nav);
  applyJitter(sheet);
  if (dg && !ghost) { let p; try { p = sessionStorage.getItem('manolo.pending'); sessionStorage.removeItem('manolo.pending'); } catch {} if (p) setTimeout(() => p === 'sim' ? dg.sim(hud) : dg.recall(tray), 350); }
  if (!ghost) { addEventListener('pointerdown', outside); addEventListener('keydown', esc); const key = e => { if (/INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.key === 'ArrowRight' && n < pgs.length - 1) go(`#/cs/${f}/p/${n + 1}`); if (e.key === 'ArrowLeft' && n > 0) go(`#/cs/${f}/p/${n - 1}`); }; addEventListener('keydown', key); cur = () => { removeEventListener('keydown', key); removeEventListener('pointerdown', outside); removeEventListener('keydown', esc); ro.disconnect(); document.documentElement.style.removeProperty('--dock-h'); dg?.destroy(); stopTalk(); copyOff(); }; }
}
function diagramBlock(sheet, t, pencil) {
  const dg = makeDiagram(DIAGRAMS[t.id], { chime, say, onInfo: (label, info) => { pencil.hidden = false; pencil.replaceChildren(h('b', {}, '✏ ' + label), h('br'), info); } });
  sheet._dg = dg; return h('figure', { class: 'diagram' }, dg.el, h('figcaption', {}, 'Tap any part · Bofya sehemu'));
}
// Handwriting wobble: each line sits a hair off the ruling, like real ink.
function applyJitter(sheet) { sheet.querySelectorAll(':scope > p, :scope > h3, :scope > ul > li').forEach((b, i) => { const k = ((i * 9301 + 49297) % 233280) / 233280 - .5; b.style.setProperty('--jy', (k * 1.1).toFixed(2) + 'px'); b.style.setProperty('--jr', (k * .28).toFixed(2) + 'deg'); }); }
function block(n, rich) {
  if (n.startsWith('## ')) return h('h3', { class: 'ink-head' }, n.slice(3));
  if (n.startsWith('```')) { const m = n.match(/^```(\w*)\n([\s\S]*?)\n?```$/), code = m ? m[2] : n, out = h('pre', { class: 'out', hidden: true });
    const box = h('div', { class: 'codeblock' }, h('pre', { class: 'code' }, code));
    if (m && m[1] === 'py') box.append(h('button', { onclick: () => { const sample = /int\(input/.test(code) ? '72' : 'Amina', r = runSync(code, [sample]); out.hidden = false; out.replaceChildren(/input\(/.test(code) ? `(sample input: ${sample})\n` : '', r.error ? h('span', { class: 'e' }, `${r.error.kind} (line ${r.error.line}): ${r.error.msg.en}`) : r.out || '(no output)'); chime(660, .05); } }, '▶ Run'), out); return box; }
  if (n.startsWith('- ')) return h('ul', {}, n.split('\n').map(l => h('li', {}, rich(l.replace(/^- /, '')))));
  const cls = /^(Remember|Example|Try|Rules?):/.test(n) ? n.split(':')[0].toLowerCase() : '';
  return h('p', cls ? { class: 'callout ' + cls } : {}, rich(n));
}
function renderPage(sheet, { type, t, u }, pencil) {
  sheet.append(h('span', { class: 'code-tag' }, t.code), h('h2', {}, t.title + (S.set.sw ? ` · ${t.sw}` : '')));
  if (topicDone(t)) sheet.append(h('div', { class: 'seen', 'aria-label': 'Checked by teacher' }, '✓ Seen', h('br'), 'Mwl. Manolo', h('br'), h('small', {}, S.dates[`${t.id}.practice`] || '')));
  const speak = w => ttsSpeak(w, { rate: .85 });
  const term = k => { const d = t.terms[k.toLowerCase()], ph = PHON[k.toLowerCase()]; return h('button', { class: 'term', onclick: e => { e.stopPropagation(); if (!S.set.sw) return; pencil.hidden = false; pencil.replaceChildren(h('b', {}, '✏ ' + k + ' = ' + d[0]), ph ? h('span', { class: 'phon' }, ` [${ph[0]}] `) : '', ph ? h('button', { class: 'chip', onclick: () => speak(k) }, '🔊 Tamka') : '', h('br'), d[1], h('br'), h('i', {}, 'NECTA: ' + d[2])); chime(520, .05); } }, k); };
  const trap = () => TRAPS[t.id] && h('div', { class: 'trap', role: 'note' }, h('b', {}, '⚠ Mtego wa Mtihani / Exam Trap'), h('p', {}, rich(TRAPS[t.id][0])), S.set.sw ? h('p', {}, h('i', {}, TRAPS[t.id][1])) : null);
  const marksView = () => { const box = h('div', { class: 'marks' }); const draw = () => box.replaceChildren(h('button', { class: 'chip' + (S.set.marks ? ' sel' : ''), onclick: () => { S.set.marks = !S.set.marks; save(); draw(); } }, '🎯 Alama za NECTA'), ...(S.set.marks ? Object.keys(t.terms).filter(k => PHON[k]).map(k => { const [, def, [a, b]] = PHON[k], [x, y] = [def.indexOf(a), def.indexOf(b)], parts = x < y ? [[x, a], [y, b]] : [[y, b], [x, a]]; let i = 0; const out = [h('b', {}, k[0].toUpperCase() + k.slice(1) + ' is ')]; for (const [at, ph] of parts) { out.push(def.slice(i, at), h('u', { class: 'mark' }, ph)); i = at + ph.length; } out.push(def.slice(i) + '. ', h('small', { class: 'mk' }, '(1 mark + 1 mark = 2 marks)')); return h('p', {}, out); }) : [])); draw(); return box; };
  if (S.set.sw && type.startsWith('notes')) sheet.addEventListener('click', e => {
    const p = e.target.closest('p,li'); if (!p || p.parentElement === null || e.target.closest('button,input,textarea,.codeblock') || p.isContentEditable || sheet.classList.contains('copymode')) return;
    sheet.querySelector('.whisper')?.remove(); const txt = p.textContent.toLowerCase(), hits = Object.entries(t.terms).filter(([k]) => txt.includes(k)).map(([k, d]) => `${k} = ${d[0]}`);
    p.after(h('div', { class: 'whisper', role: 'note' }, '🇹🇿 ', GIST[t.id] || '', hits.length ? h('small', {}, hits.join(' · ')) : null)); });
  const rich = s => s.split(/(\[\[.+?\]\]|`.+?`)/).map(x => x.startsWith('[[') ? term(x.slice(2, -2)) : x.startsWith('`') ? h('span', { class: 'code' }, x.slice(1, -1)) : x);
  if (type.startsWith('notes')) {
    const part = +type.slice(5) || 0, total = noteParts(t).length;
    if (part === 0 && t.hook) sheet.append(h('p', { class: 'callout try' }, `Think: ${t.hook}`));
    if (part === 0 && TRAPS[t.id]) sheet.append(trap());
    if (part === 0) { const tg = Lr().tagsFor(t.id)[0]; if (tg) sheet.append(helpCard(tg, 'Added for you because of earlier answers or code errors.')); else if (Lr().level(t.id) === 'weak') sheet.append(h('div', { class: 'help', role: 'note' }, h('b', {}, '🧠 Msaada kwako'), h('p', {}, 'Your answers show this topic is still new. Read slowly, try every ▶ Run, then do the lab before the quiz.'), S.set.sw ? h('p', {}, h('i', {}, GIST[t.id] || '')) : null)); }
    noteChunk(t, part).forEach((n, i) => { sheet.append(block(n, rich)); if (part === 0 && i === 0 && DIAGRAMS[t.id]) sheet.append(diagramBlock(sheet, t, pencil)); });
    if (total > 1) sheet.append(h('small', {}, `Notes ${part + 1}/${total}`));
    if (part < total - 1) return;
    const mine = h('p', { contenteditable: true, 'aria-label': 'My notes', style: 'border-top:1px dashed #888;min-height:var(--line)', oninput: e => notePut(t.id, e.target.textContent) });
    noteGet(t.id).then(v => { mine.textContent = v; });
    sheet.append(h('small', {}, '✎ My notes / Maelezo yangu:'), mine);
    sheet.append(h('button', { onclick: () => ttsSpeak(t.notes.join('. ').replace(/```[\s\S]*?```/g, ' ').replace(/^## /gm, '').replace(/[\[\]`]/g, ''), { rate: S.set.rate }) }, '🔊 Read aloud'));
  } else if (type === 'glossary') {
    sheet.append(h('p', {}, h('b', {}, 'Glossary / Msamiati')), ...Object.entries(t.terms).map(([k, d]) => h('p', {}, h('b', {}, k), PHON[k] ? h('span', { class: 'phon' }, ` [${PHON[k][0]}]`) : '', ` = ${S.set.sw ? d[0] : '—'} · ${d[2]}`)), marksView());
  } else if (type === 'recall') {
    sheet.append(h('p', {}, h('b', {}, 'Quick recall: tap a keyword, say the term aloud, tap again to check.')), ...Object.entries(t.terms).map(([k, d]) => h('p', {}, h('button', { class: 'chip', onclick() { this.textContent = this.textContent === d[2] ? k : d[2]; } }, d[2]))));
  } else if (type.startsWith('lab')) {
    sheet.append(h('p', {}, 'Maabara / Lab'), lab(t, +type.slice(3) || 0));
  } else if (type === 'practice') {
    quiz(sheet, t.id, t.quiz, null, t.quiz.map((_, i) => ({ topic: t.id, qi: i })));
  } else {
    sheet.append(h('p', {}, h('b', {}, 'Key points / Mambo muhimu')), ...t.summary.map(s => h('p', {}, '• ' + s)), h('p', {}, h('b', {}, 'NECTA keywords: '), Object.values(t.terms).map(d => d[2]).join('; ')), trap(), ...Lr().tagsFor(t.id).map(tg => helpCard(tg)), marksView());
  }
}

// ---- understanding engine UI ----
const plain = s => s.split(/(`.+?`)/).map(x => x.startsWith('`') ? h('span', { class: 'code' }, x.slice(1, -1)) : x);
function helpCard(tag, why) {
  const [topic, title, en, sw, analogy, code, [q, opts, ans]] = MIS[tag], res = h('div', { 'aria-live': 'polite' });
  const card = h('div', { class: 'help', role: 'note' }, h('b', {}, '🧠 Msaada kwako · ' + title), why ? h('small', {}, why) : null, h('p', {}, plain(en)), S.set.sw ? h('p', {}, h('i', {}, sw)) : null, h('p', {}, '💡 ', analogy), code ? block('```py\n' + code + '\n```', plain) : null,
    h('p', {}, h('b', {}, 'Check: '), q), h('div', { class: 'items' }, opts.map((o, j) => h('button', { class: 'chip', onclick: () => { const ok = j === ans; Lr().observe(topic, ok, { tag }); chime(ok ? 880 : 240, .12); res.replaceChildren(redMark(ok), ok ? ' Umeelewa! Got it.' : ` Not yet — the answer is "${opts[ans]}". Read the explanation again.`); if (ok) card.classList.add('solved'); } }, o))), res);
  return card;
}
function review(f) {
  const topics = form(f).units.flatMap(u => u.topics), keys = Lr().missed().filter(k => topics.some(t => k.startsWith(t.id + ':'))).slice(0, 5);
  const sheet = h('div', { class: 'sheet' }, h('h2', {}, 'Marudio / Review'));
  if (!keys.length) sheet.append(h('p', {}, 'Nothing to review. Hongera!'));
  else { const meta = keys.map(k => { const [id, qi] = k.split(':'); return { topic: id, qi: +qi, q: topics.find(t => t.id === id).quiz[+qi] }; }); sheet.append(h('p', {}, h('small', {}, 'Questions you missed earlier. Answer them right and they leave the list.'))); quiz(sheet, 'review', meta.map(x => x.q), null, meta); }
  scene(spread(sheet), h('button', { onclick: () => go(`#/cs/${f}/toc`) }, '← Contents'));
}

// ---- quiz & red pen ----
const redMark = good => { const e = h('span', { class: 'redpen ' + (good ? 'ok' : 'no'), 'aria-label': good ? 'correct' : 'wrong' }); e.innerHTML = `<svg viewBox="0 0 24 24"><path d="${good ? 'M4 12l6 6L20 6' : 'M6 6l12 12M6 18L18 6'}"/></svg>`; return e; };
function quiz(host, id, qs, extra, meta) {
  const form_ = h('div', {}), res = h('div', { 'aria-live': 'polite' }), turns = [];
  const setTurns = () => turns.forEach((el, i) => el.textContent = S.set.group > 1 ? ` 👥 Swali la ${i + 1} · Mwanafunzi ${'ABCD'[i % S.set.group]}` : '');
  const grp = h('button', { class: 'chip', title: 'Pass-the-phone: friends take turns, one question each', onclick: () => { S.set.group = S.set.group % 4 + 1; save(); grp.textContent = `👥 Kikundi: ${S.set.group}`; setTurns(); } }, `👥 Kikundi: ${S.set.group}`);
  host.append(grp);
  // Options are shuffled per question (stable for this page) so the answer is not always the first one.
  const order = (n, seed) => { const r = [...Array(n).keys()]; let x = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); for (let k = n - 1; k > 0; k--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (k + 1); [r[k], r[j]] = [r[j], r[k]]; } return r; };
  qs.forEach(([q, o, a], i) => form_.append(h('div', { class: 'q' }, h('b', {}, `${i + 1}. ${q}`), turns[i] = h('small', { class: 'turn' }), ...order(o.length, id + q).map(j => h('label', {}, h('input', { type: 'radio', name: `${id}${i}`, value: j }), ' ' + o[j])), h('span', { id: `${id}r${i}` }))));
  setTurns();
  host.append(form_, h('button', { class: 'pri', onclick: () => {
    let ok = 0;
    const wrongTags = new Set();
    qs.forEach(([, o, a], i) => { const v = form_.querySelector(`input[name="${id}${i}"]:checked`), good = v && +v.value === a; ok += good ? 1 : 0;
      if (meta?.[i] && v) { Lr().answer(meta[i].topic, meta[i].qi, !!good); const tg = Lr().tagsFor(meta[i].topic)[0]; if (!good && tg) wrongTags.add(tg); } form_.querySelector(`#${CSS.escape(id)}r${i}`).replaceChildren(redMark(!!good), good ? '' : h('span', { class: 'no pen-fix' }, ` → ${o[a]}`)); });
    S.quiz[id] = Math.max(S.quiz[id] || 0, ok / qs.length); save();
    const r = ok / qs.length; res.replaceChildren(h('span', { class: 'score' }, `${ok}/${qs.length}`), h('div', { class: 'teacher' }, r === 1 ? 'Excellent! Hongera sana!' : r >= .6 ? 'Good. Revise the red ones. Sawa.' : 'Revise the notes and try again. Jaribu tena.'));
    chime(ok === qs.length ? 880 : 300, .2); say(`Score ${ok} of ${qs.length}`);
    for (const tg of [...wrongTags].slice(0, 2)) res.append(helpCard(tg, 'Based on the questions you just missed.'));
    extra?.(r);
  } }, 'Check / Kagua'), h('button', { onclick: () => { form_.querySelectorAll('input').forEach(i => i.checked = false); form_.querySelectorAll('[id^="' + id + 'r"]').forEach(x => x.replaceChildren()); res.replaceChildren(); } }, '🔄 Futa / Jaribu tena'), res);
}
function checkpoint(sheet, u) {
  sheet.append(h('h2', {}, `Checkpoint — ${u.title}`), h('p', {}, h('small', {}, 'Practice material in NECTA style. Not an official paper.')));
  const qs = u.topics.flatMap(t => t.quiz); quiz(sheet, u.id, qs, null, u.topics.flatMap(t => t.quiz.map((_, i) => ({ topic: t.id, qi: i }))));
  for (const [i, sq] of (SHORT[u.id] || []).entries()) {
    const ta = h('textarea', { 'aria-label': 'Your answer', rows: 3 }), out = h('div', { 'aria-live': 'polite' });
    sheet.append(h('div', { class: 'lab' }, h('b', {}, `Section B · Q${i + 1}: `), sq.q, ta, h('button', { onclick: () => { const got = markShort(ta.value, sq.keys), sc = got.filter(Boolean).length; S.quiz[`${u.id}.sa${i}`] = Math.max(S.quiz[`${u.id}.sa${i}`] || 0, sc / got.length); save(); out.replaceChildren(...got.map((g, j) => h('div', {}, redMark(g), ` Mark ${j + 1}: ${g ? 'awarded' : 'missing — e.g. "' + sq.keys[j][0] + '"'}`)), h('span', { class: 'score' }, `${sc}/${got.length}`)); chime(sc === got.length ? 880 : 300, .2); } }, 'Sahihisha / Mark'), out));
  }
  for (const [i, cq] of (codeQs[u.id] || []).entries()) {
    const ta = h('textarea', { 'aria-label': 'Your code', spellcheck: false }), out = h('div', {});
    sheet.append(h('div', { class: 'lab' }, h('b', {}, `Code Q${i + 1}: `), cq.prompt, ta, h('button', { onclick: () => { out.replaceChildren(...cq.tests.map((t, j) => { const r = runSync(ta.value, [...t.in]), good = !r.error && r.out === t.out; if (good) S.lab[`${u.id}.cq${i}.${j}`] = 1; return h('div', { class: good ? 'ok' : 'no' }, `${good ? '✔' : '✘'} test ${j + 1}: input ${t.in.join(', ')} → expected ${t.out}${good ? '' : ` got ${r.error ? r.error.msg.en : JSON.stringify(r.out)}`}`); })); save(); } }, 'Run tests'), out));
  }
}

// ---- labs ----
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
function done(t, m = 'Lab complete! / Umemaliza!') { if (!S.lab[t.id]) { S.lab[t.id] = 1; Lr().observe(t.id.split('.')[0], true); } chime(880, .2); say(m); }
function lab(t0, k) {
  const t = k ? { ...t0, id: `${t0.id}.${k}` } : t0, L = k ? t0.labs[k - 2] : t0.lab, box = h('div', { class: 'lab' }, h('h4', {}, t.title));
  const types = {
    console: () => consoleLab(box, t),
    html: () => htmlLab(box, t, L),
    sort() {
      let sel = null, left = L.items.length; const items = h('div', { class: 'items' }), cats = h('div', { class: 'cats' });
      L.cats.forEach((c, ci) => cats.append(h('div', { class: 'cat', role: 'button', tabindex: 0, onclick() { if (!sel) return; if (sel.ci === ci) { this.append(h('div', {}, sel.txt)); sel.el.remove(); sel = null; chime(700, .05); if (!--left) done(t); } else { sel.el.classList.add('bad'); chime(200, .1); setTimeout(() => sel?.el.classList.remove('bad'), 350); } } }, h('b', {}, c))));
      shuffle(L.items).forEach(([txt, ci]) => { const el = h('button', { class: 'chip', onclick() { items.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); sel = { txt, ci, el }; } }, txt); items.append(el); });
      box.append(h('small', {}, 'Tap an item, then tap its box.'), items, cats);
    },
    order() {
      let next = 0; const items = h('div', { class: 'items' }), got = h('ol', {});
      shuffle(L.steps).forEach(s => { const el = h('button', { class: 'chip', onclick() { if (s === L.steps[next]) { got.append(h('li', {}, s)); el.remove(); chime(700, .05); if (++next === L.steps.length) done(t); } else { el.classList.add('bad'); chime(200, .1); setTimeout(() => el.classList.remove('bad'), 350); } } }, s); items.append(el); });
      box.append(h('small', {}, 'Tap the steps in the correct order.'), items, got);
    },
    ladder() {
      const sl = h('input', { type: 'range', min: 0, max: L.stages.length - 1, value: 0, 'aria-label': 'Language level' }), v = h('div', {}); const seen = new Set();
      const upd = () => { const [a, b] = L.stages[+sl.value]; v.replaceChildren(h('b', {}, a), h('pre', { class: 'code' }, b)); seen.add(sl.value); if (seen.size === L.stages.length) done(t); };
      sl.oninput = upd; upd(); box.append(sl, v);
    },
    hot() {
      const seen = new Set(), d = h('p', {}, 'Tap each part.');
      box.append(h('div', { class: 'items' }, L.spots.map(([n, x]) => h('button', { class: 'chip', onclick() { d.textContent = `${n}: ${x}`; seen.add(n); if (seen.size === L.spots.length) done(t); } }, n))), d);
    },
    flow() {
      const seq = [], list = h('ol', {}), pseudo = h('pre', { class: 'code' }), msg = h('p', {});
      const P = { Start: 'START', 'Input': 'READ x', 'Process': 'total = x * 2', 'Decision': 'IF x >= 50 THEN', 'Output': 'PRINT total', End: 'END' };
      const upd = () => { list.replaceChildren(...seq.map(x => h('li', {}, { Start: '⬭ ', Input: '▱ ', Process: '▭ ', Decision: '◇ ', Output: '▱ ', End: '⬭ ' }[x] + x))); pseudo.textContent = seq.map(x => P[x]).join('\n'); const ok = seq[0] === 'Start' && seq.at(-1) === 'End' && seq.includes('Input') && seq.includes('Output') && seq.filter(x => x === 'Start').length === 1; msg.textContent = ok ? '✔ Valid flowchart!' : 'Rules: begin with Start, end with End, include Input and Output.'; if (ok) done(t); };
      box.append(h('small', {}, 'Build a flowchart: tap symbols in order.'), h('div', { class: 'items' }, Object.keys(P).map(k => h('button', { class: 'chip', onclick: () => { seq.push(k); upd(); } }, k)), h('button', { onclick: () => { seq.pop(); upd(); } }, '↶ Undo')), list, h('b', {}, 'Pseudocode'), pseudo, msg);
    },
    pwd() {
      const i = h('input', { type: 'text', 'aria-label': 'Practice password', autocomplete: 'off', placeholder: 'type a practice password' }), m = h('div', { class: 'bar' }, h('i')), msg = h('p', {});
      i.oninput = () => { const v = i.value; let s = Math.min(v.length, 12) * 5; for (const r of [/[a-z]/, /[A-Z]/, /\d/, /[^\w]/]) if (r.test(v)) s += 10; if (/^(password|12345|qwerty)/i.test(v)) s = 5; s = Math.min(100, s); m.firstChild.style.width = s + '%'; msg.textContent = (s < 40 ? '🔓 Weak' : s < 75 ? '🔒 OK' : '🔐 Strong') + '. Everything stays on this device.'; if (s >= 75) done(t); };
      box.append(h('small', {}, 'Do NOT type a real password. Hii ni mazoezi tu.'), i, m, msg);
    },
  };
  if (bespoke[L.type]) bespoke[L.type](box, t, { h, done, chime }); else types[L.type](); return box;
}

function consoleLab(box, t) {
  const L = t.lab, ta = h('textarea', { spellcheck: false, autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', 'aria-label': 'Code editor' }, L.code), out = h('div', { class: 'out', 'aria-live': 'off' }), boxes = h('div', { class: 'boxes' }), view = h('div', { class: 'codeview', hidden: true });
  const vars = new Map(); let gen = null, pending = null, timer = null;
  const keys = h('div', { class: 'keys' }, [':', '(', ')', '"', '=', '==', '>=', '<=', '!=', '[', ']', '_', '#', '+', 'print()', 'input()', '    '].map(k => h('button', { onclick: () => { const s = ta.selectionStart; ta.setRangeText(k, s, ta.selectionEnd, 'end'); if (k.endsWith('()')) ta.selectionStart = ta.selectionEnd = ta.selectionEnd - 1; ta.focus(); heal(); } }, k === '    ' ? 'Tab' : k)));
  // Phone keyboards: curly quotes are fixed silently; auto-capitals get a one-tap fix.
  const CAPS = /\b(Print|Input|If|Elif|Else|For|While|Range|Int|Float|Str|Len)\b/, capsFix = h('div', { class: 'capsfix', hidden: true });
  const outsideStrings = (src, f) => src.split(/("[^"\n]*"|'[^'\n]*')/).map((x, i) => i % 2 ? x : f(x)).join('');
  function heal() {
    if (/[“”„‘’‚\u00a0]/.test(ta.value)) { const p = ta.selectionStart; ta.value = ta.value.replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'").replace(/\u00a0/g, ' '); ta.selectionStart = ta.selectionEnd = p; }
    const hit = outsideStrings(ta.value, x => { const m = x.match(CAPS); return m ? '\0' + m[1] + '\0' : ''; }).match(/\0(\w+)\0/);
    capsFix.hidden = !hit; if (hit) capsFix.replaceChildren(`📱 Simu imeweka herufi kubwa "${hit[1]}". Rekebisha iwe "${hit[1].toLowerCase()}"? `, h('button', { class: 'chip', onclick: () => { ta.value = outsideStrings(ta.value, x => x.replace(new RegExp(CAPS.source, 'g'), w => w.toLowerCase())); heal(); chime(700, .05); } }, '🔧 Fix Auto-Caps'));
  }
  ta.addEventListener('input', heal);
  // Dry-run scratchpad: predict each step, then Run compares with the real trace.
  const trace = [], tbody = h('tbody', {}), tableWrap = h('div', { class: 'tracepad', hidden: true });
  const addRow = () => tbody.append(h('tr', {}, h('td', {}, tbody.children.length + 1), h('td', {}, h('input', { 'aria-label': 'Variables after step' })), h('td', {}, h('input', { 'aria-label': 'Printed output' })), h('td', { class: 'res' })));
  for (let i = 0; i < 6; i++) addRow();
  tableWrap.append(h('small', {}, 'Write what you expect after each step (e.g. age=15), then press ▶ Run.'), h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Step'), h('th', {}, 'Variables'), h('th', {}, 'Output'), h('th', {}, ''))), tbody), h('button', { class: 'chip', onclick: addRow }, '+ row'));
  const norm = x => String(x).toLowerCase().replace(/[\s'"]/g, '');
  const compare = () => { if (tableWrap.hidden) return; [...tbody.children].forEach((tr, i) => { const [vi, oi] = tr.querySelectorAll('input'), want = trace[i], res = tr.querySelector('.res'); if (!want) return res.replaceChildren(vi.value || oi.value ? redMark(false) : ''); const ok = norm(vi.value) === norm(want[0]) && norm(oi.value) === norm(want[1]); res.replaceChildren(redMark(ok), ok ? '' : h('small', { class: 'no' }, `${want[0]} | ${want[1] || '—'}`)); }); };
  const traceBtn = h('button', { onclick: () => { tableWrap.hidden = !tableWrap.hidden; traceBtn.classList.toggle('on', !tableWrap.hidden); } }, '📋 Kikaratasi cha Trace');
  ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); } if (e.key === 'Enter') { const s = ta.value.slice(0, ta.selectionStart), l = s.slice(s.lastIndexOf('\n') + 1), ind = l.match(/^ */)[0] + (l.trimEnd().endsWith(':') ? '    ' : ''); e.preventDefault(); ta.setRangeText('\n' + ind, ta.selectionStart, ta.selectionEnd, 'end'); } };
  const reset = () => { clearTimeout(timer); gen = null; pending = null; vars.clear(); trace.length = 0; out.replaceChildren(); boxes.replaceChildren(); view.hidden = true; };
  const mark = n => { view.querySelectorAll('div').forEach((d, i) => d.classList.toggle('cur', i + 1 === n)); };
  function start() { heal(); reset(); gen = run(ta.value); view.replaceChildren(...ta.value.split('\n').map((l, i) => h('div', {}, `${String(i + 1).padStart(2)}  ${l}`))); view.hidden = false; }
  function advance(stopAtLine, val) {
    for (let guard = 0; gen && guard < 100000; guard++) {
      const r = gen.next(val); val = undefined;
      if (r.done) { gen = null; return false; }
      const e = r.value;
      const snap = () => [...vars].map(([n, v]) => `${n}=${fmt(v.value)}`).join(', ');
      if (e.t === 'print') { out.append(e.text + '\n'); trace.push([snap(), e.text]); }
      else if (e.t === 'assign') { const old = vars.get(e.name); vars.set(e.name, e); trace.push([snap(), '']); boxes.replaceChildren(...[...vars].map(([n, v]) => h('div', { class: 'vbox' }, h('small', {}, n + ' : ' + v.typ), fmt(v.value)))); void old; }
      else if (e.t === 'input') { const i = h('input', { 'aria-label': e.prompt || 'input' }), form2 = h('form', { onsubmit: ev => { ev.preventDefault(); out.append(i.value + '\n'); form2.remove(); advance(stopAtLine, i.value); } }, e.prompt + ' ', i, h('button', {}, 'OK')); out.append(form2); i.focus(); return true; }
      else if (e.t === 'error') { Lr().codeError(t.id.split('.')[0], e); const tg = MIS[errTagOf(e)]; out.append(h('div', { class: 'e' }, `${e.kind} (line ${e.line}): ${e.msg.en}`, S.set.sw ? h('i', {}, ` — ${e.msg.sw}`) : '')); if (tg && !box.querySelector('.help')) out.after(helpCard(errTagOf(e), 'Added because of this error.')); mark(e.line); gen = null; return false; }
      else if (e.t === 'done') { gen = null; mark(0); compare(); done(t); return false; }
      else if (e.t === 'line') { mark(e.line); if (stopAtLine) return true; }
    }
    return false;
  }
  const runAll = () => { start(); advance(false); if (gen === null && !out.querySelector('.e')) done(t); };
  box.append(h('p', {}, L.task || ''), keys, capsFix, ta, h('div', { class: 'labnav' },
    h('button', { class: 'pri', onclick: runAll }, '▶ Run'),
    h('button', { onclick: () => { if (!gen) start(); advance(true); } }, 'Step'),
    h('button', { onclick: reset }, 'Reset'), traceBtn), tableWrap, view, h('b', {}, 'Variable Boxes'), boxes, out);
}

// ---- demo mode (#/demo): scripted tour for presenters ----
function demo() {
  const steps = ['#/bag', '#/cs/f2', '#/cs/f2/toc', `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.t?.id === 'vars' && x.type === 'lab')}`, `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.t?.id === 'debug' && x.type === 'lab')}`, `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.kind === 'cp' && x.u.id === 'F2-2.2')}`];
  let i = 0; const next = () => { if (i < steps.length) go(steps[i++]); else { clearInterval(demoT); } };
  clearInterval(demoT); demoT = setInterval(next, 6000); next();
}
let demoT;

// ---- install / update prompts ----
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); if (+(localStorage['manolo.visits'] || 0) >= 2) { deferred = e; document.body.append(h('button', { class: 'install', style: 'bottom:calc(var(--dock-h,0px) + 12px)', onclick() { deferred.prompt(); this.remove(); } }, icon('install'), 'Install app')); } });
try { localStorage['manolo.visits'] = +(localStorage['manolo.visits'] || 0) + 1; } catch {}

// ---- settings: an iOS-style sheet (grouped list, switches, segmented controls) ----
function settings() {
  const done = () => { removeEventListener('keydown', onKey); if (reduced()) return ov.remove(); ov.classList.add('out'); setTimeout(() => ov.remove(), 280); };
  const onKey = e => { if (e.key === 'Escape') done(); };
  const group = (head, ...rows) => h('section', { class: 'sx-g' }, head ? h('h3', {}, head) : null, h('div', { class: 'sx-list' }, ...rows));
  const row = (label, el, sub) => h('label', { class: 'sx-row' }, h('span', { class: 'sx-l' }, label, sub ? h('small', {}, sub) : null), el);
  const sw = (k, fn) => h('input', { type: 'checkbox', role: 'switch', class: 'sx-sw', ...(S.set[k] ? { checked: true } : {}), onchange: e => { S.set[k] = e.target.checked; save(); applySettings(); fn?.(); } });
  const seg = (key, opts, cur) => { const box = h('div', { class: 'sx-seg', role: 'radiogroup', style: `--n:${opts.length};--i:${Math.max(0, opts.findIndex(o => o[0] === cur))}` }, h('i')); opts.forEach(([v, l], i) => box.append(h('button', { role: 'radio', 'aria-checked': v === cur, onclick: () => { S.set[key] = v; save(); applySettings(); box.style.setProperty('--i', i); box.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-checked', j === i)); } }, l))); return box; };
  const stack = (label, el, sub) => h('div', { class: 'sx-row stack' }, h('span', { class: 'sx-l' }, label, sub ? h('small', {}, sub) : null), el);
  const action = (label, fn, cls = '') => h('button', { class: 'sx-row sx-act ' + cls, onclick: fn }, h('span', { class: 'sx-l' }, label));
  let armed = 0;
  const reset = action('Reset progress', () => { if (!armed) { armed = setTimeout(() => { armed = 0; reset.firstChild.textContent = 'Reset progress'; reset.classList.remove('armed'); }, 4000); reset.firstChild.textContent = 'Tap again to erase all progress'; reset.classList.add('armed'); return; } clearTimeout(armed); S = structuredClone(DEF); save(); applySettings(); done(); route(); }, 'danger');
  const grab = h('div', { class: 'sx-grab' }, h('i'));
  const panel = h('div', { class: 'sx', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Settings' }, grab,
    h('header', {}, h('span', {}), h('b', {}, 'Settings'), h('button', { class: 'sx-done', onclick: done }, 'Done')),
    h('div', { class: 'sx-body' },
      group('Learning', row('Swahili layer', sw('sw'), 'Mipangilio: margin notes and error hints in Kiswahili')),
      group('Display', row('Reduce motion', sw('reduce')), row('Readable font', sw('readable'), 'Plain system type instead of handwriting'),
        stack('Text size', seg('fs', [[.9, 'Small'], [1, 'Medium'], [1.2, 'Large']], S.set.fs)), stack('Quality', seg('quality', [['auto', 'Auto'], ['low', 'Low'], ['high', 'High']], S.set.quality), 'Lower quality saves battery on older phones')),
      group('Voice', stack('Speaking speed', h('div', { class: 'sx-rate' }, h('small', {}, 'Slow'), h('input', { type: 'range', min: .5, max: 1.5, step: .1, value: S.set.rate, 'aria-label': 'Speaking speed', onchange: e => { S.set.rate = +e.target.value; save(); } }), h('small', {}, 'Fast')))),
      group('Data', action('Export progress (teacher view)', exportProgress), reset)));
  const ov = h('div', { class: 'sx-ov', onpointerdown: e => { if (e.target === ov) done(); } }, panel);
  // drag the handle down: 1:1 tracking, then dismiss by position or velocity, else spring back
  let y0 = null, last = 0, vel = 0, t0 = 0;
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; t0 = e.timeStamp; vel = 0; grab.setPointerCapture(e.pointerId); panel.style.transition = 'none'; });
  grab.addEventListener('pointermove', e => { if (y0 == null) return; const dy = Math.max(0, e.clientY - y0); vel = (dy - last) / Math.max(1, e.timeStamp - t0); last = dy; t0 = e.timeStamp; panel.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 == null) return; y0 = null; panel.style.transition = ''; if (last > 120 || vel > .6) { panel.style.transform = 'translateY(100%)'; done(); } else panel.style.transform = ''; last = 0; };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  addEventListener('keydown', onKey); document.body.append(ov); ov.querySelector('.sx-done').focus();
}
function exportProgress() {
  const rows = ['learner,topic,lab,best_quiz,understanding_pct,level,misconceptions']; for (const f of Object.values(forms)) for (const u of f.units) for (const t of u.topics) rows.push(`${(S.name || 'Learner').replace(/,/g, ' ')},${t.code.replace(/,/g, ';')} ${t.id},${S.lab[t.id] ? 1 : 0},${Math.round((S.quiz[t.id] || 0) * 100)},${Lr().mastery(t.id) === null ? '' : Math.round(Lr().mastery(t.id) * 100)},${Lr().level(t.id)},${Lr().tagsFor(t.id).join(' ')}`);
  const a = h('a', { href: URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' })), download: 'progress.csv' }); a.click();
}

const CACHE_V = 'manolo-v8';
window.__manolo = { pagesOf }; // test hook
// ---- deep-link scene for settings via hash is not needed; start ----
applySettings(); route();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').then(r => r.addEventListener('updatefound', () => r.installing.addEventListener('statechange', function () { if (this.state === 'installed' && navigator.serviceWorker.controller) document.body.append(h('button', { class: 'install', style: 'bottom:calc(var(--dock-h,0px) + 12px);left:auto;right:12px', onclick: () => location.reload() }, 'New lessons available — tap to refresh')); }))).catch(() => {});

// ---- HTML lab: write a page, see it live, tick the checks ----
function htmlLab(box, t, L) {
  const ta = h('textarea', { spellcheck: false, autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', 'aria-label': 'HTML editor' }, L.code),
    frame = h('iframe', { class: 'htmlview', title: 'Preview of your page', sandbox: '' }), list = h('ul', { class: 'checks' });
  const ok = (re, src) => re[0] === '!' ? !new RegExp(re.slice(1), 'i').test(src) : new RegExp(re, 'i').test(src);
  const heal = () => { if (/[“”„‘’‚\u00a0]/.test(ta.value)) { const p = ta.selectionStart; ta.value = ta.value.replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'").replace(/\u00a0/g, ' '); ta.selectionStart = ta.selectionEnd = p; } };
  const update = () => {
    heal(); frame.srcdoc = ta.value;
    const res = L.checks.map(([re, label]) => [ok(re, ta.value), label]);
    list.replaceChildren(...res.map(([pass, label]) => h('li', { class: pass ? 'pass' : '' }, (pass ? '✓ ' : '○ ') + label)));
    if (res.every(r => r[0])) done(t, 'Well done! Your page passes every check. / Hongera!');
  };
  ta.addEventListener('input', update);
  ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); } };
  const keys = h('div', { class: 'keys' }, ['<', '>', '/', '"', '=', '</p>', '<p>', '<li>', '  '].map(k => h('button', { onclick: () => { const s = ta.selectionStart; ta.setRangeText(k, s, ta.selectionEnd, 'end'); ta.focus(); update(); } }, k.trim() || '⇥')));
  box.append(h('p', {}, h('b', {}, 'Task: '), L.task), keys, ta, h('small', {}, 'Your page updates as you type. Tick every check to finish.'), frame, list);
  update();
}
