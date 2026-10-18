import { forms, codeQs } from './content.js';
import { run, runSync, fmt } from './interp.js';
import { bespoke } from './labs.js';
import { DIAGRAMS } from './diagrams.js';
import { makeDiagram } from './notebook.js';
const $ = document.getElementById('app'), live = document.getElementById('live');
const h = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [n, v] of Object.entries(a)) n.startsWith('on') ? e.addEventListener(n.slice(2), v) : n === 'class' ? e.className = v : v !== false && e.setAttribute(n, v === true ? '' : v); for (const c of k.flat()) if (c != null) e.append(c); return e; };
const say = m => { live.textContent = ''; setTimeout(() => live.textContent = m, 30); };

// ---- store (versioned) ----
const KEY = 'manolo.v1', DEF = { v: 1, set: { sw: true, reduce: false, readable: false, fs: 1, quality: 'auto', rate: 0.9, ink: 0, light: 88 }, page: {}, edits: {}, lab: {}, quiz: {}, name: '', seen: false, last: {} };
let S; try { S = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; S.set = { ...DEF.set, ...S.set }; } catch { S = structuredClone(DEF); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
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

// ---- audio: synthetic chimes (0 KB) ----
let ac; function chime(f = 660, d = .08) { try { ac ||= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch {} }

// ---- spring ----
function spring(from, to, cb, k = 180, c = 18) { let x = from, v = 0, stop = false; (function f() { if (stop) return; v += (-k * (x - to) - c * v) / 60; x += v / 60; cb(x); if (Math.abs(x - to) > .001 || Math.abs(v) > .01) requestAnimationFrame(f); else cb(to); })(); return () => stop = true; }

// ---- notes in IndexedDB (localStorage fallback) ----
const idb = new Promise(r => { try { const q = indexedDB.open('manolo', 1); q.onupgradeneeded = () => q.result.createObjectStore('notes'); q.onsuccess = () => r(q.result); q.onerror = () => r(null); } catch { r(null); } });
const noteGet = async id => { const d = await idb; if (!d) return S.mine?.[id] || ''; return new Promise(r => { const q = d.transaction('notes').objectStore('notes').get(id); q.onsuccess = () => r(q.result || ''); q.onerror = () => r(''); }); };
const notePut = async (id, v) => { const d = await idb; if (!d) { (S.mine ||= {})[id] = v; return save(); } d.transaction('notes', 'readwrite').objectStore('notes').put(v, id); };

// ---- model ----
// Split long notes at "## " headings so each page holds about one screen of text.
const noteParts = t => { const parts = []; let n = 0; for (const e of t.notes) { const len = e.length; if (e.startsWith('## ') && n > 700) { parts.push(1); n = 0; } n += len; } parts.push(1); return parts.map((_, i) => i ? 'notes' + i : 'notes'); };
const noteChunk = (t, i) => { const out = [[]]; let n = 0; for (const e of t.notes) { if (e.startsWith('## ') && n > 700) { out.push([]); n = 0; } out.at(-1).push(e); n += e.length; } return out[i] || []; };
const form = f => forms[f];
function pagesOf(f) {
  const out = [];
  for (const u of form(f).units) {
    for (const t of u.topics) for (const type of ['hook', 'notes', 'glossary', 'lab', ...(t.lab2 ? ['lab2'] : []), 'recall', 'practice', 'summary']) out.push({ kind: 'page', type, t, u, id: `${t.id}.${type}` });
    out.push({ kind: 'cp', u, id: 'cp.' + u.id });
  }
  return out;
}
const topicDone = t => S.lab[t.id] && (!t.lab2 || S.lab[t.id + '.2']) && (S.quiz[t.id] || 0) >= .6;
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
    if (p[2] === 'p') return pageScene(p[1], +p[3] || 0);
    return cover(p[1]);
  }
  if (p[0] === 'demo') return demo();
  bag();
}
function scene(...k) { cur?.(); cur = null; $.replaceChildren(h('div', { class: 'scene' }, ...k), hud()); $.firstChild.focus?.(); }
function hud() {
  return h('div', { class: 'hud' }, h('button', { 'aria-label': 'Settings', onclick: settings }, '⚙ Settings'));
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
  const cont = S.last.f ? h('button', { class: 'pri', onclick: () => go(`#/cs/${S.last.f}/p/${S.last.n}`) }, 'Continue where you left off') : null;
  scene(h('h1', { style: 'margin:0;font-family:var(--hand)' }, 'MANOLO Backpack'), lv, bagEl, h('button', { onclick: () => set(p > .5 ? 0 : 1) }, 'Zip / Unzip (button)'), cont, h('small', {}, 'Drag the zipper, then pick a notebook. Buruta zipu kisha chagua daftari.'));
}

// ---- cover ----
function cover(f) {
  let r = 0, dragging = false, x0 = 0;
  const lid = h('div', { class: 'lid', tabindex: 0, role: 'button', 'aria-label': 'Open notebook' }, h('small', {}, 'Syllabus: TIE 2023'), h('h2', {}, 'Computer Science'), h('div', {}, form(f).title), h('label', {}, 'Name: ', h('input', { value: S.name, 'aria-label': 'Student name', onclick: e => e.stopPropagation(), oninput: e => { S.name = e.target.value; save(); } })), h('small', {}, 'Tap or drag to open'));
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
  for (const u of form(f).units) {
    sheet.append(h('h3', {}, `${u.id} ${u.title} (${u.periods} periods) `, h('small', {}, unitPct(u) + '%')), h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': unitPct(u) }, h('i', { style: `width:${unitPct(u)}%` })));
    for (const t of u.topics) {
      const n = pgs.findIndex(x => x.t === t);
      sheet.append(h('button', { class: 'row', onclick: () => riffle(f, n) }, h('span', { class: 'tick' }, topicDone(t) ? '✔' : ''), t.title, h('span', { class: 'dots' }), 'p.' + (n + 1)));
    }
    sheet.append(h('button', { class: 'row', onclick: () => riffle(f, pgs.findIndex(x => x.u === u && x.kind === 'cp')) }, h('span', { class: 'tick' }, S.quiz[u.id] >= .6 ? '✔' : ''), '📝 Checkpoint', h('span', { class: 'dots' }), 'test'));
  }
  scene(sheet, h('button', { onclick: () => go(`#/cs/${f}`) }, '← Close notebook'));
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
  if (!ghost) { S.last = { f, n }; S.page[pg.id] = 1; save(); }
  const sheet = h('div', { class: 'sheet' + (reduced() ? '' : ' flip'), tabindex: 0 });
  const pencil = h('div', { class: 'pencil', hidden: true, role: 'status' });
  if (pg.kind === 'cp') checkpoint(sheet, pg.u);
  else renderPage(sheet, pg, pencil);
  sheet.append(pencil);
  const nav = h('div', { class: 'nav' }, h('button', { onclick: () => go(`#/cs/${f}/toc`), 'aria-label': 'Contents' }, '☰'), h('button', { disabled: n === 0, onclick: () => go(`#/cs/${f}/p/${n - 1}`), 'aria-label': 'Previous page' }, '◀'), h('span', { class: 'pg' }, `${n + 1} / ${pgs.length}`), h('button', { disabled: n === pgs.length - 1, onclick: () => go(`#/cs/${f}/p/${n + 1}`), 'aria-label': 'Next page' }, '▶'), h('button', { onclick: () => go('#/bag') }, '🎒'));
  scene(sheet, nav);
  if (!ghost) { const key = e => { if (/INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.key === 'ArrowRight' && n < pgs.length - 1) go(`#/cs/${f}/p/${n + 1}`); if (e.key === 'ArrowLeft' && n > 0) go(`#/cs/${f}/p/${n - 1}`); }; addEventListener('keydown', key); cur = () => removeEventListener('keydown', key); }
}
function renderPage(sheet, { type, t, u }, pencil) {
  sheet.append(h('span', { class: 'code-tag' }, t.code), h('h2', {}, t.title + (S.set.sw ? ` · ${t.sw}` : '')));
  const term = k => { const d = t.terms[k.toLowerCase()]; return h('button', { class: 'term', onclick: () => { if (!S.set.sw) return; pencil.hidden = false; pencil.replaceChildren(h('b', {}, '✏ ' + k + ' = ' + d[0]), h('br'), d[1], h('br'), h('i', {}, 'NECTA: ' + d[2])); chime(520, .05); } }, k); };
  const rich = s => s.split(/(\[\[.+?\]\]|`.+?`)/).map(x => x.startsWith('[[') ? term(x.slice(2, -2)) : x.startsWith('`') ? h('span', { class: 'code' }, x.slice(1, -1)) : x);
  if (type === 'notes') {
    t.notes.forEach(n => sheet.append(h('p', {}, rich(n))));
    const mine = h('p', { contenteditable: true, 'aria-label': 'My notes', style: 'border-top:1px dashed #888;min-height:var(--line)', oninput: e => notePut(t.id, e.target.textContent) });
    noteGet(t.id).then(v => { mine.textContent = v; });
    sheet.append(h('small', {}, '✎ My notes / Maelezo yangu:'), mine);
    if ('speechSynthesis' in window) sheet.append(h('button', { onclick: () => { speechSynthesis.cancel(); const m = new SpeechSynthesisUtterance(t.notes.join(' ').replace(/[\[\]`]/g, '')); m.rate = S.set.rate; speechSynthesis.speak(m); } }, '🔊 Read aloud'));
  } else if (type === 'hook') {
    sheet.append(h('p', {}, h('b', {}, 'Hook · '), t.hook || t.notes[0].replace(/\[\[|\]\]/g, '')), h('p', {}, h('i', {}, 'Think: where have you seen this in daily life? Tazama maisha ya kila siku.')));
  } else if (type === 'glossary') {
    sheet.append(h('p', {}, h('b', {}, 'Glossary / Msamiati')), ...Object.entries(t.terms).map(([k, d]) => h('p', {}, h('b', {}, k), ` = ${S.set.sw ? d[0] : '—'} · ${d[2]}`)));
  } else if (type === 'recall') {
    sheet.append(h('p', {}, h('b', {}, 'Quick recall: tap a keyword, say the term aloud, tap again to check.')), ...Object.entries(t.terms).map(([k, d]) => h('p', {}, h('button', { class: 'chip', onclick() { this.textContent = this.textContent === d[2] ? k : d[2]; } }, d[2]))));
  } else if (type === 'lab' || type === 'lab2') {
    sheet.append(h('p', {}, 'Maabara / Lab'), lab(t, type === 'lab2'));
  } else if (type === 'practice') {
    quiz(sheet, t.id, t.quiz);
  } else {
    sheet.append(h('p', {}, h('b', {}, 'Key points / Mambo muhimu')), ...t.summary.map(s => h('p', {}, '• ' + s)), h('p', {}, h('b', {}, 'NECTA keywords: '), Object.values(t.terms).map(d => d[2]).join('; ')));
  }
}

// ---- quiz & red pen ----
function quiz(host, id, qs, extra) {
  const form_ = h('div', {}), res = h('div', { 'aria-live': 'polite' });
  qs.forEach(([q, o, a], i) => form_.append(h('div', { class: 'q' }, h('b', {}, `${i + 1}. ${q}`), ...o.map((x, j) => h('label', {}, h('input', { type: 'radio', name: `${id}${i}`, value: j }), ' ' + x)), h('span', { id: `${id}r${i}` }))));
  host.append(form_, h('button', { class: 'pri', onclick: () => {
    let ok = 0;
    qs.forEach(([, o, a], i) => { const v = form_.querySelector(`input[name="${id}${i}"]:checked`), good = v && +v.value === a; ok += good ? 1 : 0; form_.querySelector(`#${CSS.escape(id)}r${i}`).replaceChildren(h('span', { class: good ? 'ok' : 'no' }, good ? ' ✔' : ` ✘ → ${o[a]}`)); });
    S.quiz[id] = Math.max(S.quiz[id] || 0, ok / qs.length); save(); res.replaceChildren(h('span', { class: 'score' }, `${ok}/${qs.length}`)); chime(ok === qs.length ? 880 : 300, .2); say(`Score ${ok} of ${qs.length}`);
    extra?.(ok / qs.length);
  } }, 'Check / Kagua'), res);
}
function checkpoint(sheet, u) {
  sheet.append(h('h2', {}, `Checkpoint — ${u.title}`), h('p', {}, h('small', {}, 'Practice material in NECTA style. Not an official paper.')));
  const qs = u.topics.flatMap(t => t.quiz); quiz(sheet, u.id, qs);
  for (const [i, cq] of (codeQs[u.id] || []).entries()) {
    const ta = h('textarea', { 'aria-label': 'Your code', spellcheck: false }), out = h('div', {});
    sheet.append(h('div', { class: 'lab' }, h('b', {}, `Code Q${i + 1}: `), cq.prompt, ta, h('button', { onclick: () => { out.replaceChildren(...cq.tests.map((t, j) => { const r = runSync(ta.value, [...t.in]), good = !r.error && r.out === t.out; if (good) S.lab[`${u.id}.cq${i}.${j}`] = 1; return h('div', { class: good ? 'ok' : 'no' }, `${good ? '✔' : '✘'} test ${j + 1}: input ${t.in.join(', ')} → expected ${t.out}${good ? '' : ` got ${r.error ? r.error.msg.en : JSON.stringify(r.out)}`}`); })); save(); } }, 'Run tests'), out));
  }
}

// ---- labs ----
const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
function done(t, m = 'Lab complete! / Umemaliza!') { if (!S.lab[t.id]) { S.lab[t.id] = 1; save(); } chime(880, .2); say(m); }
function lab(t0, two) {
  const t = two ? { ...t0, id: t0.id + '.2' } : t0, L = two ? t0.lab2 : t0.lab, box = h('div', { class: 'lab' }, h('h4', {}, t.title));
  const types = {
    console: () => consoleLab(box, t),
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
  const L = t.lab, ta = h('textarea', { spellcheck: false, 'aria-label': 'Code editor' }, L.code), out = h('div', { class: 'out', 'aria-live': 'off' }), boxes = h('div', { class: 'boxes' }), view = h('div', { class: 'codeview', hidden: true });
  const vars = new Map(); let gen = null, pending = null, timer = null;
  const keys = h('div', { class: 'keys' }, [':', '(', ')', '"', '=', '[', ']', '    '].map(k => h('button', { onclick: () => { const s = ta.selectionStart; ta.setRangeText(k, s, ta.selectionEnd, 'end'); ta.focus(); } }, k === '    ' ? 'Tab' : k)));
  ta.onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); } if (e.key === 'Enter') { const s = ta.value.slice(0, ta.selectionStart), l = s.slice(s.lastIndexOf('\n') + 1), ind = l.match(/^ */)[0] + (l.trimEnd().endsWith(':') ? '    ' : ''); e.preventDefault(); ta.setRangeText('\n' + ind, ta.selectionStart, ta.selectionEnd, 'end'); } };
  const reset = () => { clearTimeout(timer); gen = null; pending = null; vars.clear(); out.replaceChildren(); boxes.replaceChildren(); view.hidden = true; };
  const mark = n => { view.querySelectorAll('div').forEach((d, i) => d.classList.toggle('cur', i + 1 === n)); };
  function start() { reset(); gen = run(ta.value); view.replaceChildren(...ta.value.split('\n').map((l, i) => h('div', {}, `${String(i + 1).padStart(2)}  ${l}`))); view.hidden = false; }
  function advance(stopAtLine, val) {
    for (let guard = 0; gen && guard < 100000; guard++) {
      const r = gen.next(val); val = undefined;
      if (r.done) { gen = null; return false; }
      const e = r.value;
      if (e.t === 'print') out.append(e.text + '\n');
      else if (e.t === 'assign') { const old = vars.get(e.name); vars.set(e.name, e); boxes.replaceChildren(...[...vars].map(([n, v]) => h('div', { class: 'vbox' }, h('small', {}, n + ' : ' + v.typ), fmt(v.value)))); void old; }
      else if (e.t === 'input') { const i = h('input', { 'aria-label': e.prompt || 'input' }), form2 = h('form', { onsubmit: ev => { ev.preventDefault(); out.append(i.value + '\n'); form2.remove(); advance(stopAtLine, i.value); } }, e.prompt + ' ', i, h('button', {}, 'OK')); out.append(form2); i.focus(); return true; }
      else if (e.t === 'error') { out.append(h('div', { class: 'e' }, `${e.kind} (line ${e.line}): ${e.msg.en}`, S.set.sw ? h('i', {}, ` — ${e.msg.sw}`) : '')); mark(e.line); gen = null; return false; }
      else if (e.t === 'done') { gen = null; mark(0); done(t); return false; }
      else if (e.t === 'line') { mark(e.line); if (stopAtLine) return true; }
    }
    return false;
  }
  const runAll = () => { start(); advance(false); if (gen === null && !out.querySelector('.e')) done(t); };
  box.append(h('p', {}, L.task || ''), keys, ta, h('div', { class: 'nav' },
    h('button', { class: 'pri', onclick: runAll }, '▶ Run'),
    h('button', { onclick: () => { if (!gen) start(); advance(true); } }, 'Step'),
    h('button', { onclick: reset }, 'Reset')), view, h('b', {}, 'Variable Boxes'), boxes, out);
}

// ---- demo mode (#/demo): scripted tour for presenters ----
function demo() {
  const steps = ['#/bag', '#/cs/f2', '#/cs/f2/toc', `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.t.id === 'vars' && x.type === 'lab')}`, `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.t.id === 'debug' && x.type === 'lab')}`, `#/cs/f2/p/${pagesOf('f2').findIndex(x => x.kind === 'cp' && x.u.id === 'F2-2.2')}`];
  let i = 0; const next = () => { if (i < steps.length) go(steps[i++]); else { clearInterval(demoT); } };
  clearInterval(demoT); demoT = setInterval(next, 6000); next();
}
let demoT;

// ---- install / update prompts ----
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); if (+(localStorage['manolo.visits'] || 0) >= 2) { deferred = e; document.body.append(h('button', { class: 'pri', style: 'position:fixed;bottom:8px;left:8px;z-index:8', onclick() { deferred.prompt(); this.remove(); } }, '📲 Install app')); } });
try { localStorage['manolo.visits'] = +(localStorage['manolo.visits'] || 0) + 1; } catch {}

// ---- settings ----
function settings() {
  const row = (label, el) => h('label', {}, label, el);
  const chk = (k, fn) => h('input', { type: 'checkbox', ...(S.set[k] ? { checked: true } : {}), onchange: e => { S.set[k] = e.target.checked; save(); applySettings(); fn?.(); } });
  const dlg = h('div', { class: 'scene', style: 'background:#000a;z-index:9' }, h('div', { class: 'settings', role: 'dialog', 'aria-label': 'Settings' },
    h('b', {}, 'Settings / Mipangilio'),
    row('Swahili layer (margins, errors)', chk('sw')), row('Reduced motion', chk('reduce')), row('Readable font (no handwriting)', chk('readable')),
    row('Text size', h('select', { onchange: e => { S.set.fs = +e.target.value; save(); applySettings(); } }, [[.9, 'S'], [1, 'M'], [1.2, 'L']].map(([v, l]) => h('option', { value: v, ...(S.set.fs === v ? { selected: true } : {}) }, l)))),
    row('Quality', h('select', { onchange: e => { S.set.quality = e.target.value; save(); applySettings(); } }, ['auto', 'low', 'high'].map(v => h('option', { value: v, ...(S.set.quality === v ? { selected: true } : {}) }, v)))),
    row('Voice speed', h('input', { type: 'range', min: .5, max: 1.5, step: .1, value: S.set.rate, onchange: e => { S.set.rate = +e.target.value; save(); } })),
    h('button', { onclick: exportProgress }, 'Export progress (teacher view)'),
    h('button', { onclick: () => { if (confirm('Reset all progress?')) { S = structuredClone(DEF); save(); applySettings(); dlg.remove(); route(); } } }, 'Reset progress'),
    h('button', { class: 'pri', onclick: () => dlg.remove() }, 'Close')));
  document.body.append(dlg); dlg.querySelector('input,button')?.focus();
}
function exportProgress() {
  const rows = ['topic,lab,best_quiz']; for (const f of Object.values(forms)) for (const u of f.units) for (const t of u.topics) rows.push(`${t.code.replace(/,/g, ';')} ${t.id},${S.lab[t.id] ? 1 : 0},${Math.round((S.quiz[t.id] || 0) * 100)}`);
  const a = h('a', { href: URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' })), download: 'progress.csv' }); a.click();
}

// ---- deep-link scene for settings via hash is not needed; start ----
applySettings(); route();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').then(r => r.addEventListener('updatefound', () => r.installing.addEventListener('statechange', function () { if (this.state === 'installed' && navigator.serviceWorker.controller) document.body.append(h('button', { class: 'pri', style: 'position:fixed;bottom:8px;right:8px;z-index:8', onclick: () => location.reload() }, 'New lessons available — tap to refresh')); }))).catch(() => {});
