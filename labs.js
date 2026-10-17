// Bespoke labs. Each: (box, t, {h, done, chime}).
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
};
