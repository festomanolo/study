// Bespoke labs. Each: (box, t, {h, done, chime}).
import { runSync } from './interp.js';
const NS = 'http://www.w3.org/2000/svg';
const frame = () => new Promise(r => requestAnimationFrame(r));
async function tween(ms, fn, reduce) { if (reduce) return fn(1); const t0 = performance.now(); for (;;) { const k = Math.min(1, (performance.now() - t0) / ms); fn(k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2); if (k >= 1) return; await frame(); } }
const red = () => document.documentElement.classList.contains('reduce');

export const bespoke = {
  // Boda rider: queue F/L/R commands; one wrong or ambiguous step fails.
  boda(box, t, { h, done, chime }) {
    const N = 5, WALLS = [[0, 2]], GOAL = [2, 1], S = 50, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    const cv = h('canvas', { width: N * S, height: N * S, role: 'img', 'aria-label': 'Boda map: start bottom-left, flag at column 3 row 2, wall at column 1 row 3' }), c = cv.getContext('2d');
    const cmds = [], q = h('p', { 'aria-live': 'polite' }, 'Commands: (none)'), msg = h('p', {});
    let b = { x: 0, y: 4, a: 0 }, busy = false;
    const draw = () => {
      c.clearRect(0, 0, N * S, N * S); c.font = '28px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { c.fillStyle = WALLS.some(w => w[0] === x && w[1] === y) ? '#7a4a2a' : (x + y) % 2 ? '#e9dcb0' : '#f3ead0'; c.fillRect(x * S, y * S, S, S); }
      c.fillText('🧱', .5 * S, 2.5 * S); c.fillText('🏁', (GOAL[0] + .5) * S, (GOAL[1] + .5) * S);
      c.save(); c.translate((b.x + .5) * S, (b.y + .5) * S); c.rotate(b.a * Math.PI / 2); c.fillText('🏍️', 0, 0); c.fillText('▲', 0, -20); c.restore();
    };
    const add = k => { if (busy) return; cmds.push(k); q.textContent = 'Commands: ' + cmds.join(' '); };
    const reset = () => { b = { x: 0, y: 4, a: 0 }; draw(); msg.textContent = ''; };
    async function go() {
      if (busy) return; busy = true; reset(); let d = 0, gx = 0, gy = 4;
      for (const k of cmds) {
        if (k === 'F') {
          const nx = gx + DX[d], ny = gy + DY[d];
          if (nx < 0 || ny < 0 || nx >= N || ny >= N || WALLS.some(w => w[0] === nx && w[1] === ny)) { const sx = b.x, sy = b.y; await tween(160, e => { b.x = sx + DX[d] * .3 * e; b.y = sy + DY[d] * .3 * e; draw(); }, red()); await tween(160, e => { b.x = sx + DX[d] * .3 * (1 - e); b.y = sy + DY[d] * .3 * (1 - e); draw(); }, red()); chime(150, .25); msg.textContent = '💥 Crash! The computer did exactly what you said. Ajali! Computer hufuata amri kama zilivyo.'; busy = false; return; }
          const sx = b.x, sy = b.y; await tween(350, e => { b.x = sx + (nx - sx) * e; b.y = sy + (ny - sy) * e; draw(); }, red()); gx = nx; gy = ny;
        } else { const nd = (d + (k === 'R' ? 1 : 3)) % 4, sa = b.a, ea = sa + (k === 'R' ? 1 : -1); await tween(250, e => { b.a = sa + (ea - sa) * e; draw(); }, red()); d = nd; }
      }
      busy = false;
      if (gx === GOAL[0] && gy === GOAL[1]) { msg.textContent = '🏁 Arrived! Exact, ordered instructions work.'; done(t); } else msg.textContent = 'Not at the flag yet. Try again. Bado hujafika.';
    }
    box.append(h('small', {}, 'Guide the boda-boda to the flag. F = forward, L/R = turn. The wall blocks the way.'), cv, h('div', { class: 'items' }, ['F', 'L', 'R'].map(k => h('button', { class: 'chip', onclick: () => add(k) }, k)), h('button', { onclick: () => { cmds.pop(); q.textContent = 'Commands: ' + cmds.join(' '); } }, '↶'), h('button', { onclick: () => { cmds.length = 0; q.textContent = 'Commands: (none)'; reset(); } }, 'Clear'), h('button', { class: 'pri', onclick: go }, '▶ Go')), q, msg);
    draw();
  },

  // Compiler vs Interpreter lanes with a seeded error on line 3.
  conveyor(box, t, { h, done, chime }) {
    let fixed = false; const ran = new Set(), sleep = ms => new Promise(r => setTimeout(r, red() ? 0 : ms));
    const code = () => ['print("Start")', 'print("Hello")', fixed ? 'print("Done")' : 'prnt("Oops")', 'print("End")'];
    const lane = (title) => { const o = h('div', { class: 'out', style: 'min-height:70px' }); return { o, el: h('div', { class: 'cat' }, h('b', {}, title), o) }; };
    const C = lane('📚 Compiler'), I = lane('🗣 Interpreter'), view = h('div', { class: 'codeview' }), bad = () => !fixed;
    const show = (cur = -1, tr = -1) => view.replaceChildren(...code().map((l, i) => h('div', { class: i === cur ? 'cur' : '' }, `${i + 1}  ${l}${i <= tr ? '  ⇒ [machine code]' : ''}`)));
    const tog = h('button', { onclick() { fixed = !fixed; this.textContent = fixed ? 'Re-introduce the error' : 'Fix line 3'; show(); } }, 'Fix line 3');
    async function runC() { C.o.replaceChildren(); for (let i = 0; i < 4; i++) { show(-1, i); await sleep(300); chime(300 + i * 80, .04); } if (bad()) C.o.append(h('div', { class: 'e' }, '⛔ Refused to start: error on line 3. Nothing ran.')); else code().forEach(l => C.o.append(l.slice(7, -2).replace(/"/g, '') + '\n')); ran.add('C' + bad()); chk(); }
    async function runI() { I.o.replaceChildren(); const L = code(); for (let i = 0; i < 4; i++) { show(i); await sleep(400); if (bad() && i === 2) { I.o.append(h('div', { class: 'e' }, '⛔ Stopped at line 3. Lines 1–2 already ran.')); break; } I.o.append(L[i].slice(7, -2).replace(/"/g, '') + '\n'); chime(500, .04); } ran.add('I' + bad()); chk(); }
    const chk = () => { if (['Ctrue', 'Itrue', 'Cfalse', 'Ifalse'].every(k => ran.has(k))) done(t); };
    box.append(h('small', {}, 'Run both lanes with the error, then fix line 3 and run again.'), view, h('div', { class: 'cats' }, C.el, I.el), h('div', { class: 'items' }, h('button', { class: 'pri', onclick: runC }, '▶ Compile & run'), h('button', { class: 'pri', onclick: runI }, '▶ Interpret'), tog));
    show();
  },

  // Packet journey over a small network; click a router to drop it.
  packets(box, t, { h, done, chime }) {
    const P = { A: [25, 100], B: [95, 35], C: [95, 165], D: [175, 35], E: [175, 165], F: [250, 100] };
    const E = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F'], ['B', 'C'], ['D', 'E']], dropped = new Set();
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 280 200'); svg.setAttribute('width', '100%'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Network map');
    const el = (n, a, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.append(e); return e; };
    E.forEach(([a, b]) => el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: '#888', 'stroke-width': 3 }));
    const msg = h('p', { 'aria-live': 'polite' }, 'Send a message. Then click a router (B–E) to drop it and send again.'); let delivered = 0, sentWithDrop = false;
    const nodes = {};
    for (const k in P) { const g = el('g', { tabindex: 0, role: 'button', 'aria-label': 'Router ' + k, style: 'cursor:pointer' }); const ci = el('circle', { cx: P[k][0], cy: P[k][1], r: 14, fill: k === 'A' || k === 'F' ? '#244a9a' : '#2e8b57' }, g); el('text', { x: P[k][0], y: P[k][1] + 4, 'text-anchor': 'middle', fill: '#fff', 'font-size': 12 }, g).textContent = k; nodes[k] = ci;
      if (k !== 'A' && k !== 'F') { const tg = () => { dropped.has(k) ? dropped.delete(k) : dropped.add(k); ci.setAttribute('fill', dropped.has(k) ? '#c0392b' : '#2e8b57'); }; g.onclick = tg; g.onkeydown = e => e.key === 'Enter' && tg(); } }
    const route = () => { const prev = { A: null }, q = ['A']; while (q.length) { const n = q.shift(); for (const [a, b] of E) { const m = a === n ? b : b === n ? a : null; if (m && !(m in prev) && !dropped.has(m)) { prev[m] = n; q.push(m); } } } if (!('F' in prev)) return null; const r = []; for (let n = 'F'; n; n = prev[n]) r.unshift(n); return r; };
    async function send() {
      const r = route(); if (!r) { msg.textContent = '❌ No route: every path is blocked.'; return; } sentWithDrop = dropped.size > 0; delivered = 0;
      msg.textContent = `Message split into 4 packets. Route: ${r.join(' → ')}`;
      await Promise.all([0, 1, 2, 3].map(async i => {
        const dot = el('circle', { r: 6, fill: ['#ffd54a', '#ff8a65', '#4fc3f7', '#aed581'][i] }); await new Promise(res => setTimeout(res, red() ? 0 : i * 250));
        for (let s = 0; s < r.length - 1; s++) { const [x1, y1] = P[r[s]], [x2, y2] = P[r[s + 1]]; await tween(450, e => { dot.setAttribute('cx', x1 + (x2 - x1) * e); dot.setAttribute('cy', y1 + (y2 - y1) * e); }, red()); chime(400 + s * 100, .03); }
        dot.remove(); delivered++;
      }));
      msg.textContent = `✔ 4/4 packets arrived and were reassembled${sentWithDrop ? ' — even with a router down (rerouting)!' : '.'}`; if (sentWithDrop) done(t);
    }
    box.append(svg, h('button', { class: 'pri', onclick: send }, '✉ Send message'), msg);
  },

  // File Explorer sim with Windows/Linux path skins.
  files(box, t, { h, done, chime }) {
    const root = { Documents: { School: {}, Photos: {} }, Downloads: { 'notes.txt': null } }; let cwd = [], os = 'win', sel = null, clip = null;
    const nm = h('input', { 'aria-label': 'Name', placeholder: 'name' }), list = h('div', { class: 'items' }), pathEl = h('code', { class: 'code' }), msg = h('p', {});
    const here = () => cwd.reduce((o, k) => o[k], root), isDir = v => v !== null;
    const render = () => {
      pathEl.textContent = os === 'win' ? 'C:\\Users\\Asha\\' + cwd.join('\\') : '/home/asha/' + cwd.join('/');
      list.replaceChildren(...(cwd.length ? [h('button', { class: 'chip', onclick: () => { cwd.pop(); sel = null; render(); } }, '⬆ ..')] : []), ...Object.entries(here()).map(([k, v]) => h('button', { class: 'chip' + (sel === k ? ' sel' : ''), onclick: () => { if (isDir(v)) { cwd.push(k); sel = null; } else sel = k; render(); } }, (isDir(v) ? '📁 ' : '📄 ') + k)));
      const ok = root.Documents.School['notes.txt'] === null; if (ok) { msg.textContent = '✔ notes.txt is in Documents/School!'; done(t); }
    };
    const act = f => () => { f(); render(); };
    box.append(h('p', {}, h('b', {}, 'Task: '), 'move notes.txt from Downloads into Documents/School.'),
      h('div', { class: 'items' }, ['win', 'linux'].map(o => h('button', { onclick: act(() => { os = o; }) }, o === 'win' ? 'Windows' : 'Linux'))), pathEl, list, nm,
      h('div', { class: 'items' },
        h('button', { onclick: act(() => { if (nm.value && !(nm.value in here())) here()[nm.value] = {}; nm.value = ''; }) }, 'New folder'),
        h('button', { onclick: act(() => { if (sel && nm.value) { const o = here(); o[nm.value] = o[sel]; delete o[sel]; sel = nm.value; nm.value = ''; } }) }, 'Rename'),
        h('button', { onclick: act(() => { if (sel) { clip = { o: here(), k: sel }; msg.textContent = 'Cut ' + sel + '. Open the target folder and press Paste.'; } }) }, 'Cut'),
        h('button', { onclick: act(() => { if (clip) { here()[clip.k] = clip.o[clip.k]; if (clip.o !== here()) delete clip.o[clip.k]; clip = null; chime(600, .05); } }) }, 'Paste')), msg);
    render();
  },

  // ---- F2-2.2 Lab I: shaped type tiles; a wrong socket bounces the tile back.
  types(box, t, { h, done, chime }) {
    const T = [['15', 'int'], ['3.5', 'float'], ['"Juma"', 'str'], ['True', 'bool'], ['"5"', 'str'], ['-7', 'int'], ['0.0', 'float'], ['False', 'bool']], SH = { int: '⬤', float: '▢', str: '💬', bool: '⏻' };
    let sel = null, left = T.length; const msg = h('p', { 'aria-live': 'polite' }, 'Tap a tile, then the socket of its type.'), tiles = h('div', { class: 'items' }), socks = h('div', { class: 'cats' });
    for (const ty of Object.keys(SH)) socks.append(h('div', { class: 'cat', role: 'button', tabindex: 0, onclick() { if (!sel) return; if (sel[1] === ty) { this.append(h('div', {}, sel[0])); sel.el.remove(); sel = null; chime(700, .05); msg.textContent = '✔'; if (!--left) { msg.textContent = 'All sorted! Now try "5" + 5 below.'; } } else { sel.el.classList.add('bad'); chime(200, .12); msg.textContent = `↩ Bounced: ${sel[0]} is ${sel[1]}, not ${ty}.${sel[1] === 'str' ? ' Quotes make it text.' : ''}`; const e = sel.el; setTimeout(() => e.classList.remove('bad'), 350); } } }, h('b', {}, `${SH[ty]} ${ty}`)));
    for (const x of T) { const el = h('button', { class: 'chip', onclick() { tiles.querySelectorAll('.sel').forEach(y => y.classList.remove('sel')); el.classList.add('sel'); sel = Object.assign([...x], { el }); } }, `${SH[x[1]]} ${x[0]}`); tiles.append(el); }
    const out = h('pre', { class: 'code' });
    box.append(msg, tiles, socks, h('button', { onclick: () => { const r = runSync('print("5" + 5)'); out.textContent = `>>> "5" + 5\n${r.error.kind}: ${r.error.msg.en}\n${r.error.msg.sw}\nFix: int("5") + 5 = ${runSync('print(int("5") + 5)').out}`; if (!left) done(t); } }, '▶ Try "5" + 5'), out);
  },

  // ---- Lab J: pick the operator that balances the scale; then watch precedence on an assembly line.
  ops(box, t, { h, done, chime }) {
    const P = [[7, 2, 3], [10, 3, 1], [2, 3, 8], [9, 2, 4.5], [6, 4, 24]], OPS = ['+', '-', '*', '/', '//', '%', '**'];
    let i = 0; const q = h('p', { class: 'code' }), beam = h('div', { class: 'beam' }, h('span', {}, '⚖')), msg = h('p', { 'aria-live': 'polite' });
    const show = () => { const [a, b, c] = P[i]; q.textContent = `${a} ? ${b} == ${c}`; beam.style.transform = 'rotate(-12deg)'; };
    const chips = h('div', { class: 'items' }, OPS.map(op => h('button', { class: 'chip', onclick: () => { const [a, b, c] = P[i], r = runSync(`print(${a} ${op} ${b} == ${c})`).out; beam.style.transform = r === 'True' ? 'rotate(0)' : 'rotate(12deg)'; chime(r === 'True' ? 800 : 220, .1); msg.textContent = `${a} ${op} ${b} == ${c} → ${r}`; if (r === 'True') setTimeout(() => { if (++i < P.length) show(); else { msg.textContent = 'Balanced all five! Mizani imesawazika.'; line(); } }, 700); } }, op)));
    const belt = h('ol', {}), line = () => { const steps = ['2 + 3 * 4 ** 2', '2 + 3 * 16     (** first)', '2 + 48         (* next)', '50             (+ last)']; belt.replaceChildren(); steps.forEach((s, k) => setTimeout(() => { belt.append(h('li', { class: 'code' }, s)); chime(400 + k * 100, .05); if (k === 3) done(t); }, red() ? 0 : k * 500)); };
    box.append(h('small', {}, 'Choose the operator that makes it True.'), q, beam, chips, msg, h('b', {}, 'Order of operations line'), belt); show();
  },

  // ---- Lab K: a padlocked constant next to a free variable.
  constants(box, t, { h, done, chime }) {
    let PI = 3.14, r = 5; const tried = new Set(), lock = h('span', { class: 'lock' }, '🔒'), out = h('pre', { class: 'code' }), msg = h('p', { 'aria-live': 'polite' });
    const calc = () => { out.textContent = runSync(`PI = ${PI}\nradius = ${r}\narea = PI * radius * radius\nprint("Area:", round(area, 2))`).out; };
    box.append(h('div', { class: 'boxes' }, h('div', { class: 'vbox' }, lock, h('small', {}, 'PI (constant)'), h('span', { class: 'pv' }, PI)), h('div', { class: 'vbox' }, h('small', {}, 'radius (variable)'), h('span', { class: 'rv' }, r))),
      h('div', { class: 'items' }, h('button', { onclick: () => { r = 7; box.querySelector('.rv').textContent = r; calc(); tried.add('r'); msg.textContent = 'Variables may change. ✔'; chime(700, .05); fin(); } }, 'radius = 7'),
        h('button', { onclick: () => { PI = 3; box.querySelector('.pv').textContent = PI; lock.textContent = '🔓💥'; calc(); tried.add('pi'); msg.textContent = 'Python allowed it, but you broke the CAPITALS promise: constants should never change. Ahadi imevunjwa!'; chime(180, .25); fin(); } }, 'PI = 3')), out, msg);
    const fin = () => tried.size === 2 && done(t); calc();
  },

  // ---- Lab L: a marble rolls through an if/elif grade ladder computed by the real interpreter.
  fork(box, t, { h, done, chime }) {
    const code = m => `marks = ${m}\nif marks >= 75:\n    print("A")\nelif marks >= 65:\n    print("B")\nelif marks >= 45:\n    print("C")\nelif marks >= 30:\n    print("D")\nelse:\n    print("F")`;
    const G = ['A', 'B', 'C', 'D', 'F'], seen = new Set(), sl = h('input', { type: 'range', min: 0, max: 100, value: 62, 'aria-label': 'Marks' }), lbl = h('b', {}, 'marks = 62'), pre = h('pre', { class: 'code' }, code(62));
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%');
    const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
    G.forEach((g, k) => { mk('line', { x1: 150, y1: 10, x2: 30 + k * 60, y2: 120, stroke: '#94a3b8', 'stroke-width': 2 }); mk('rect', { x: 10 + k * 60, y: 120, width: 40, height: 26, rx: 4, fill: '#fffdf5', stroke: '#1b387b' }); const tx = mk('text', { x: 30 + k * 60, y: 138, 'text-anchor': 'middle', 'font-size': 14 }); tx.textContent = g; });
    const ball = mk('circle', { cx: 150, cy: 10, r: 8, fill: '#c0392b' }), msg = h('p', { 'aria-live': 'polite' });
    sl.oninput = () => { lbl.textContent = 'marks = ' + sl.value; pre.textContent = code(sl.value); };
    const roll = async () => { const g = runSync(code(+sl.value)).out, k = G.indexOf(g); await tween(600, e => { ball.setAttribute('cx', 150 + (30 + k * 60 - 150) * e); ball.setAttribute('cy', 10 + 110 * e); }, red()); chime(500 + k * 80, .1); seen.add(g); msg.textContent = `Grade ${g}. Bins reached: ${[...seen].join(' ')}. Reach 3 different grades.`; if (seen.size >= 3) done(t); };
    box.append(h('small', {}, 'Grade bands follow common NECTA practice; check your school\'s current scheme.'), lbl, sl, h('button', { class: 'pri', onclick: roll }, '● Drop marble'), svg, msg, pre);
  },

  // ---- Lab M: indentation decides which room a line lives in.
  rooms(box, t, { h, done, chime }) {
    let inside = true; const runs = new Set(), out = h('pre', { class: 'out' }), roomIn = h('div', { class: 'room inner' }, h('small', {}, 'if marks >= 50: (inside room)'), h('div', { class: 'code' }, '    print("Pass")')), roomOut = h('div', { class: 'room' }, h('small', {}, 'main room'), h('div', { class: 'code' }, 'marks = ?'), roomIn);
    const line = h('div', { class: 'code moving' }, '    print("Well done")');
    const place = () => { line.textContent = (inside ? '    ' : '') + 'print("Well done")'; (inside ? roomIn : roomOut).append(line); };
    const src = m => `marks = ${m}\nif marks >= 50:\n    print("Pass")\n${inside ? '    ' : ''}print("Well done")`;
    const go = m => { out.textContent = `marks = ${m} →\n` + runSync(src(m)).out; runs.add(`${inside}${m}`); chime(600, .05); if (runs.size >= 4) done(t); };
    box.append(h('small', {}, 'Move the line in and out of the if-room, then run with both marks. Try all 4 combinations.'), roomOut, h('div', { class: 'items' }, h('button', { onclick: () => { inside = !inside; place(); chime(400, .05); } }, '⇆ Indent / Unindent'), h('button', { onclick: () => go(70) }, '▶ marks = 70'), h('button', { onclick: () => go(30) }, '▶ marks = 30')), out); place();
  },

  // ---- Lab N: for-loop stamping belt, and a while loop that never stops until fixed.
  loopbelt(box, t, { h, done, chime }) {
    const sl = h('input', { type: 'range', min: 1, max: 6, value: 3, 'aria-label': 'range(n)' }), belt = h('div', { class: 'belt' }), lamp = h('p', { 'aria-live': 'polite' }), steps = new Set();
    const stamp = async () => { belt.replaceChildren(); const r = runSync(`for i in range(${sl.value}):\n    print(i)`).out.split('\n'); for (const v of r) { belt.append(h('span', { class: 'item' }, '📦' + v)); chime(500 + +v * 60, .05); await new Promise(z => setTimeout(z, red() ? 0 : 250)); } lamp.textContent = `range(${sl.value}) ran the body ${r.length} times (0 to ${sl.value - 1}).`; steps.add('for'); fin(); };
    let fixed = false; const wcode = () => `count = 0\nwhile count < 3:\n    print("tick", count)\n${fixed ? '    count += 1\n' : ''}`, pre = h('pre', { class: 'code' }, wcode());
    const wrun = () => { const r = runSync(wcode(), [], { maxSteps: 400 }); belt.classList.toggle('spin', !!r.error); lamp.textContent = r.error ? `🔴 Belt never stops! ${r.error.msg.en} ${r.error.msg.sw}` : `🟢 Stopped after:\n${r.out}`; chime(r.error ? 150 : 880, .2); steps.add(r.error ? 'inf' : 'ok'); fin(); };
    const fin = () => steps.has('for') && steps.has('inf') && steps.has('ok') && done(t);
    box.append(h('b', {}, 'for i in range(n)'), sl, h('button', { class: 'pri', onclick: stamp }, '▶ Run belt'), belt, h('b', {}, 'while loop'), pre, h('div', { class: 'items' }, h('button', { onclick: wrun }, '▶ Run while'), h('button', { onclick: () => { fixed = !fixed; pre.textContent = wcode(); } }, '🔧 Toggle count += 1')), lamp);
  },

  // ---- Lab O: three bug levels; the bug sits on the faulty line until you patch it.
  bughunt(box, t, { h, done, chime }) {
    const L = [['Syntax', 'marks = 70\nif marks >= 50\n    print("Pass")', 'Pass', 2], ['Runtime', 'price = 500\nqty = 3\nprint(price * qtty)', '1500', 3], ['Logic', 'price = 500\nqty = 3\ntotal = price + qty\nprint(total)', '1500', 3]];
    let lv = 0; const ta = h('textarea', { spellcheck: false, autocapitalize: 'off', 'aria-label': 'Buggy code' }), lines = h('div', { class: 'codeview' }), msg = h('p', { 'aria-live': 'polite' });
    const draw = (bugLine) => lines.replaceChildren(...ta.value.split('\n').map((l, k) => h('div', { class: k + 1 === bugLine ? 'cur' : '' }, `${k + 1 === bugLine ? '🐞' : '  '} ${l}`)));
    const load = () => { ta.value = L[lv][1]; draw(L[lv][3]); msg.textContent = `Level ${lv + 1}/3: ${L[lv][0]} bug. Expected output: ${L[lv][2]}`; };
    const test = () => { const r = runSync(ta.value); if (!r.error && r.out === L[lv][2]) { chime(1000, .1); draw(0); msg.textContent = '💥 Squashed! Mdudu amekufa!'; if (++lv < 3) setTimeout(load, red() ? 0 : 900); else { msg.textContent = '🏆 All three bugs squashed.'; done(t); } } else { draw(r.error ? r.error.line : L[lv][3]); chime(220, .1); msg.textContent = r.error ? `${r.error.kind}: ${r.error.msg.en}` : `Runs, but prints ${r.out} — a logic bug.`; } };
    box.append(msg, lines, ta, h('button', { class: 'pri', onclick: test }, '▶ Run & check')); load();
  },

  // ---- Lab P: fill the trace table, red pen marks mismatches.
  tracetable(box, t, { h, done, chime }) {
    const code = 'total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)', rows = [];
    let iVal = null; for (const e of runSync(code).events) { if (e.t === 'assign' && e.name === 'i') iVal = e.value; if (e.t === 'assign' && e.name === 'total' && iVal !== null) rows.push([iVal, e.value]); }
    const body = h('tbody', {}, rows.map((_, k) => h('tr', {}, h('td', {}, k + 1), h('td', {}, h('input', { 'aria-label': 'i' })), h('td', {}, h('input', { 'aria-label': 'total' })), h('td', { class: 'res' }))));
    const msg = h('p', { 'aria-live': 'polite' });
    box.append(h('pre', { class: 'code' }, code), h('div', { class: 'tracepad' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Iteration'), h('th', {}, 'i'), h('th', {}, 'total'), h('th', {}, ''))), body)),
      h('button', { class: 'pri', onclick: () => { let ok = 0; [...body.children].forEach((tr, k) => { const [a, b] = tr.querySelectorAll('input'), good = a.value.trim() === String(rows[k][0]) && b.value.trim() === String(rows[k][1]); ok += good; tr.querySelector('.res').replaceChildren(good ? '✔' : h('span', { class: 'no' }, `✘ ${rows[k][0]}, ${rows[k][1]}`)); }); msg.textContent = `${ok}/${rows.length} rows correct.`; chime(ok === rows.length ? 880 : 300, .15); if (ok === rows.length) done(t); } }, 'Check / Kagua'), msg);
  },

  // ---- F2-1.5: build a sharper search query (results are simulated, nothing is searched).
  search(box, t, { h, done, chime }) {
    const W = ['NECTA', 'FTNA', '"Computer Science"', 'past papers', '2023', 'please', 'I want', 'nice', 'free download', 'Form 2'], KEY = ['NECTA', 'FTNA', '"Computer Science"', 'past papers', 'Form 2', '2023'];
    const q = [], qEl = h('p', { class: 'code' }, '🔍 '), res = h('p', { 'aria-live': 'polite' });
    const upd = () => { qEl.textContent = '🔍 ' + q.join(' '); const good = q.filter(w => KEY.includes(w)).length, filler = q.length - good, n = Math.max(3, Math.round(2400000 / 10 ** good) + filler * 50000); res.textContent = `≈ ${n.toLocaleString()} results (simulated). ${filler ? 'Filler words add noise.' : ''}`; if (good >= 4 && !filler) { res.textContent += ' 🎯 Sharp query!'; done(t); } };
    box.append(h('p', {}, 'Goal: find Form 2 Computer Science past papers from NECTA. Tap words to build a query.'), h('div', { class: 'items' }, W.map(w => h('button', { class: 'chip', onclick() { const k = q.indexOf(w); k < 0 ? q.push(w) : q.splice(k, 1); this.classList.toggle('sel'); chime(600, .03); upd(); } }, w))), qEl, res); upd();
  },

  // ---- F2-1.5: pretend inbox — fill the anatomy of an email correctly.
  email(box, t, { h, done, chime }) {
    const f = (l, ph) => h('label', { class: 'mailf' }, h('b', {}, l), h('input', { placeholder: ph, 'aria-label': l }));
    const to = f('To:', 'teacher address'), cc = f('Cc:', 'parent address'), sub = f('Subject:', ''), body = h('textarea', { rows: 3, 'aria-label': 'Body', placeholder: 'Message' }), att = h('label', {}, h('input', { type: 'checkbox' }), ' 📎 attach homework.pdf'), msg = h('p', { 'aria-live': 'polite' });
    const v = l => l.querySelector('input').value.trim();
    box.append(h('p', {}, 'Task: email mwalimu@shule.example (fictional), copy your parent mzazi@nyumbani.example, subject "Homework", attach the file.'), h('div', { class: 'mail' }, to, cc, sub, body, att),
      h('button', { class: 'pri', onclick: () => { const errs = []; if (v(to).toLowerCase() !== 'mwalimu@shule.example') errs.push('To must be the teacher'); if (v(cc).toLowerCase() !== 'mzazi@nyumbani.example') errs.push('Cc is the person who gets a copy (parent)'); if (!/homework/i.test(v(sub))) errs.push('Subject should say "Homework"'); if (!att.querySelector('input').checked) errs.push('Attachment missing'); if (!body.value.trim()) errs.push('Write a short polite message'); msg.textContent = errs.length ? '✘ ' + errs.join('; ') : '📨 Sent (pretend). Well structured!'; chime(errs.length ? 220 : 880, .15); if (!errs.length) done(t); } }, 'Send (pretend)'), msg);
  },

  // ---- F1-1.2: Build-a-PC — parts into slots, then boot.
  buildpc(box, t, { h, done, chime }) {
    const P = [['CPU', 'CPU socket'], ['RAM stick', 'RAM slot'], ['SSD', 'Storage bay'], ['SMPS (power)', 'Power connector']]; let sel = null, left = P.length;
    const msg = h('p', { 'aria-live': 'polite' }, 'Tap a part, then its slot on the motherboard.'), log = h('pre', { class: 'out', hidden: true });
    const board = h('div', { class: 'board' }, P.map(([, slot]) => h('div', { class: 'cat slot', role: 'button', tabindex: 0, onclick() { if (!sel) return; if (sel[1] === slot) { this.append(h('div', {}, '✔ ' + sel[0])); sel.el.remove(); sel = null; chime(700, .05); if (!--left) boot(); } else { sel.el.classList.add('bad'); chime(200, .1); msg.textContent = `${sel[0]} does not fit the ${slot}.`; const e = sel.el; setTimeout(() => e.classList.remove('bad'), 350); } } }, h('b', {}, slot))));
    const parts = h('div', { class: 'items' }, P.map(p => { const el = h('button', { class: 'chip', onclick: () => { parts.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); sel = Object.assign([...p], { el }); } }, p[0]); return el; }));
    const boot = () => { log.hidden = false; log.textContent = ''; ['⚡ Power on (SMPS)', 'POST: checking CPU… OK', 'POST: checking RAM… OK', 'BIOS: found SSD', 'Loading operating system…', '✅ Welcome!'].forEach((l, k) => setTimeout(() => { log.textContent += l + '\n'; chime(300 + k * 100, .05); if (k === 5) done(t); }, red() ? 0 : k * 400)); };
    box.append(msg, parts, board, log);
  },

  // ---- F1-1.2: computer generations timeline with size and speed comparison.
  generations(box, t, { h, done }) {
    const G = [['1st · 1940s', 'Vacuum tubes', 'Filled a whole room', 1, 100], ['2nd · 1950s', 'Transistors', 'Size of a big cupboard', 10, 60], ['3rd · 1960s', 'Integrated circuits', 'Size of a desk', 100, 35], ['4th · 1970s→', 'Microprocessors', 'Fits on a desk / in a pocket', 10000, 12], ['5th · today', 'AI & parallel processing', 'Phones, smart devices', 1000000, 6]];
    const seen = new Set(), sl = h('input', { type: 'range', min: 0, max: 4, value: 0, 'aria-label': 'Generation' }), v = h('div', {});
    const upd = () => { const [g, tech, size, speed, sz] = G[+sl.value]; seen.add(sl.value); v.replaceChildren(h('b', {}, `${g}: ${tech}`), h('p', {}, size), h('small', {}, 'Size'), h('div', { class: 'bar' }, h('i', { style: `width:${sz}%` })), h('small', {}, 'Speed (relative, log scale)'), h('div', { class: 'bar' }, h('i', { style: `width:${Math.log10(speed) * 16 + 4}%;background:#1b7f5a` }))); if (seen.size === 5) done(t); };
    sl.oninput = upd; upd(); box.append(h('small', {}, 'Slide through all five generations.'), sl, v);
  },

  // ---- F1-1.2: software layer cake; a request travels down and back up, then sort items into layers.
  layercake(box, t, { h, done, chime }) {
    const LY = ['Application (WhatsApp, Word)', 'Operating system (Android, Windows)', 'Hardware (CPU, screen, storage)'], cake = h('div', { class: 'cake' }, LY.map(l => h('div', { class: 'layer' }, l))), msg = h('p', { 'aria-live': 'polite' });
    const flow = async () => { const ls = [...cake.children], path = [0, 1, 2, 1, 0], cap = ['App asks: "save this photo"', 'OS passes the request to the driver', 'Storage writes the data', 'OS reports success', 'App shows "Saved ✓"']; for (let k = 0; k < path.length; k++) { ls.forEach(x => x.classList.remove('on')); ls[path[k]].classList.add('on'); msg.textContent = cap[k]; chime(400 + k * 80, .05); await new Promise(z => setTimeout(z, red() ? 0 : 700)); } ls.forEach(x => x.classList.remove('on')); seenFlow = true; fin(); };
    let seenFlow = false, sel = null, left = 4; const I = [['Antivirus', 1], ['Linux', 1], ['Web browser', 0], ['Keyboard', 2]];
    const items = h('div', { class: 'items' }, I.map(x => { const el = h('button', { class: 'chip', onclick: () => { items.querySelectorAll('.sel').forEach(y => y.classList.remove('sel')); el.classList.add('sel'); sel = Object.assign([...x], { el }); } }, x[0]); return el; }));
    [...cake.children].forEach((ly, k) => ly.addEventListener('click', () => { if (!sel) return; if (sel[1] === k) { ly.append(h('small', {}, ' · ' + sel[0])); sel.el.remove(); sel = null; chime(700, .05); left--; fin(); } else { chime(200, .1); msg.textContent = `${sel[0]} is not in that layer. (Utilities like antivirus run on the OS layer here.)`; } }));
    const fin = () => seenFlow && !left && done(t);
    box.append(h('button', { class: 'pri', onclick: flow }, '▶ Send a request'), cake, h('small', {}, 'Then tap an item and its layer.'), items, msg);
  },

  // ---- F1-1.2: Backup 3-2-1 disaster simulator.
  backup(box, t, { h, done, chime }) {
    const C = [['Phone', 'phone', 'home'], ['Laptop', 'disk', 'home'], ['Flash disk in school bag', 'flash', 'bag'], ['Flash disk at grandma\'s house', 'flash', 'away'], ['Cloud storage (online)', 'cloud', 'away']], E = [['🦹 Theft of your bag', ['bag', 'home-phone']], ['🌊 Flood at home', ['home']], ['⚡ Power surge', ['disk']]];
    const picks = new Set(), msg = h('pre', { class: 'out' }), list = h('div', { class: 'items' }, C.map((c, k) => h('button', { class: 'chip', onclick() { picks.has(k) ? picks.delete(k) : picks.add(k); this.classList.toggle('sel'); } }, c[0])));
    const lost = (c, ev) => ev.some(x => x === c[2] || x === c[1] || (x === 'home-phone' && c[0] === 'Phone'));
    const sim = () => { const ch = [...picks].map(k => C[k]); let all = true, log = ''; for (const [name, ev] of E) { const left = ch.filter(c => !lost(c, ev)); log += `${name}: ${left.length ? '✔ still have ' + left.map(c => c[0]).join(', ') : '✘ ALL COPIES LOST'}\n`; if (!left.length) all = false; }
      const rule = ch.length >= 3 && new Set(ch.map(c => c[1])).size >= 2 && ch.some(c => c[2] === 'away'); log += rule ? '3-2-1 rule met ✔' : 'Rule 3-2-1: 3 copies, 2 kinds of media, 1 away from home.'; msg.textContent = log; chime(all && rule ? 880 : 220, .2); if (all && rule) done(t); };
    box.append(h('p', {}, 'Choose where to keep copies of your project, then face three disasters.'), list, h('button', { class: 'pri', onclick: sim }, '⚠ Run disasters'), msg);
  },

  // ---- F1-2.1: fill the flowchart with the right symbols, then a token runs it.
  flowrun(box, t, { h, done, chime }) {
    const SLOTS = [['oval', 'Start', 160, 20], ['para', 'Input n', 160, 70], ['diamond', 'n % 2 == 0 ?', 160, 125], ['para', 'Print "Even"', 60, 185], ['para', 'Print "Odd"', 260, 185], ['oval', 'End', 160, 240]], SH = { oval: '⬭ Oval', para: '▱ Parallelogram', diamond: '◇ Diamond', rect: '▭ Rectangle' };
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 320 270'); svg.setAttribute('width', '100%');
    const mk = (n, a, txt) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt) e.textContent = txt; svg.append(e); return e; };
    [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]].forEach(([a, b]) => mk('line', { x1: SLOTS[a][2], y1: SLOTS[a][3], x2: SLOTS[b][2], y2: SLOTS[b][3], stroke: '#94a3b8', 'stroke-width': 2 }));
    mk('text', { x: 95, y: 160, 'font-size': 11, fill: '#1b7f5a' }, 'Yes'); mk('text', { x: 215, y: 160, 'font-size': 11, fill: '#c0392b' }, 'No');
    let shape = null, placed = 0; const msg = h('p', { 'aria-live': 'polite' }, 'Pick a symbol, then tap the box where it belongs.'), filled = [];
    const draw = (k, sh) => { const [, label, x, y] = SLOTS[k], g = { oval: () => mk('ellipse', { cx: x, cy: y, rx: 46, ry: 16 }), para: () => mk('polygon', { points: `${x - 50},${y + 15} ${x - 38},${y - 15} ${x + 50},${y - 15} ${x + 38},${y + 15}` }), diamond: () => mk('polygon', { points: `${x},${y - 22} ${x + 58},${y} ${x},${y + 22} ${x - 58},${y}` }), rect: () => mk('rect', { x: x - 48, y: y - 15, width: 96, height: 30 }) }[sh](); g.setAttribute('fill', '#fffdf5'); g.setAttribute('stroke', '#1b387b'); mk('text', { x, y: y + 4, 'text-anchor': 'middle', 'font-size': 10, 'pointer-events': 'none' }, label); };
    SLOTS.forEach(([want, label, x, y], k) => { const r = mk('rect', { x: x - 50, y: y - 18, width: 100, height: 36, fill: '#fef9c3', stroke: '#ca8a04', 'stroke-dasharray': 4, tabindex: 0, role: 'button', 'aria-label': 'Empty slot: ' + label, style: 'cursor:pointer' }); mk('text', { x, y: y + 4, 'text-anchor': 'middle', 'font-size': 10, fill: '#a16207', 'pointer-events': 'none' }, '? ' + label);
      r.addEventListener('click', () => { if (!shape || filled[k]) return; if (shape === want) { filled[k] = 1; draw(k, want); placed++; chime(700, .05); msg.textContent = placed === SLOTS.length ? 'Valid flowchart! Enter n and run the token.' : `${SLOTS.length - placed} left`; } else { chime(200, .1); msg.textContent = `${SH[shape]} is wrong for "${label}".`; } }); });
    const n = h('input', { type: 'number', value: 7, 'aria-label': 'n', style: 'width:70px' }), pseudo = h('pre', { class: 'code' }, 'START\nREAD n\nIF n MOD 2 = 0 THEN\n    PRINT "Even"\nELSE\n    PRINT "Odd"\nENDIF\nEND');
    const runTok = async () => { if (placed < SLOTS.length) return (msg.textContent = 'Fill every box first.'); const tok = mk('circle', { r: 7, fill: '#c0392b' }), even = +n.value % 2 === 0, path = [0, 1, 2, even ? 3 : 4, 5]; for (let k = 0; k < path.length - 1; k++) { const [, , x1, y1] = SLOTS[path[k]], [, , x2, y2] = SLOTS[path[k + 1]]; await tween(450, e => { tok.setAttribute('cx', x1 + (x2 - x1) * e); tok.setAttribute('cy', y1 + (y2 - y1) * e); }, red()); chime(400 + k * 80, .05); } msg.textContent = `Output: ${even ? 'Even' : 'Odd'}`; setTimeout(() => tok.remove(), 800); done(t); };
    box.append(msg, h('div', { class: 'items' }, Object.entries(SH).map(([k, l]) => h('button', { class: 'chip', onclick() { box.querySelectorAll('.chip.sel').forEach(x => x.classList.remove('sel')); this.classList.add('sel'); shape = k; } }, l))), svg, h('label', {}, 'n = ', n), h('button', { class: 'pri', onclick: runTok }, '▶ Run token'), h('b', {}, 'Pseudocode'), pseudo);
  },
};
