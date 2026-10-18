// Interactive ink diagram: tap a part for details, Active Recall (label scramble), and the step-by-step simulator.
const NS = 'http://www.w3.org/2000/svg';
const el = (t, a = {}, ...k) => { const e = document.createElementNS(NS, t); for (const [n, v] of Object.entries(a)) e.setAttribute(n, v); for (const c of k) e.append(c); return e; };
const html = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [n, v] of Object.entries(a)) n.startsWith('on') ? e.addEventListener(n.slice(2), v) : n === 'class' ? e.className = v : e.setAttribute(n, v); e.append(...k); return e; };
const shuffled = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function makeDiagram(spec, { onInfo, chime = () => {}, say = () => {} }) {
  const svg = el('svg', { viewBox: '0 0 600 252', class: 'ink-svg', role: 'group', 'aria-label': 'Diagram. Tap a part to learn about it.' });
  svg.append(el('defs', {}, el('marker', { id: 'ah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, el('path', { d: 'M1 1L9 5L1 9', class: 'ah' }))));
  for (const [x1, y1, x2, y2, dash] of spec.arrows || []) svg.append(el('line', { x1, y1, x2, y2, class: 'arrow' + (dash ? ' dash' : ''), 'marker-end': 'url(#ah)' }));
  const nodes = new Map(); let recallOn = false, target = null, left = 0, timer = null, tray = null;
  for (const [id, label, x, y, w, h, info, shape] of spec.parts) {
    const g = el('g', { class: 'part', tabindex: 0, role: 'button', 'aria-label': label, 'data-part': id });
    const body = shape === 'ellipse' ? el('ellipse', { cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2 })
      : shape === 'diamond' ? el('polygon', { points: `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}` })
      : el('rect', { x, y, width: w, height: h, rx: 8 });
    const fs = Math.max(11, Math.min(17, (w - 16) / (label.length * 0.52)));
    const text = el('text', { x: x + w / 2, y: y + h / 2 + fs * 0.35, 'text-anchor': 'middle', 'font-size': fs, class: 'lbl' }); text.textContent = label;
    g.append(body, text); svg.append(g); nodes.set(id, { g, label, info, text });
    const act = () => {
      if (recallOn) return attempt(id);
      chime(520, .05); onInfo?.(label, info);
    };
    g.addEventListener('click', act); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  }
  function attempt(id) {
    const n = nodes.get(id); if (n.g.classList.contains('solved')) return;
    if (!target) { chime(300, .1); say('First tap a paper slip, then tap the box where it belongs.'); tray.msg.textContent = 'First tap a slip, then tap its box. Kwanza chagua kipande.'; return; }
    if (target === id) {
      chime(880, .2); n.g.classList.add('solved'); n.text.style.opacity = 1; tray.slips.get(id).classList.add('placed'); target = null; tray.slips.forEach(s => s.classList.remove('sel'));
      if (!--left) { chime(1050, .35); tray.msg.textContent = '🌟 Hongera! You labelled everything.'; say('All labels placed. Well done!'); } else tray.msg.textContent = `${left} left`;
    } else { chime(280, .2); n.g.classList.add('wrong'); setTimeout(() => n.g.classList.remove('wrong'), 400); }
  }
  const api = {
    el: svg, hasSim: !!spec.sim,
    recall(host) {
      api.stopRecall(); api.stopSim(); recallOn = true; target = null; left = nodes.size;
      const slips = new Map(), msg = html('span', { class: 'rmsg' }, 'Tap a slip, then tap its box. Chagua kipande kisha bofya kisanduku.');
      tray = { slips, msg };
      for (const [id, n] of nodes) { n.g.classList.add('dz'); n.g.classList.remove('solved'); n.text.style.opacity = 0; }
      for (const id of shuffled([...nodes.keys()])) { const b = html('button', { class: 'slip', style: `--rot:${(Math.random() * 4 - 2).toFixed(1)}deg`, onclick: () => { target = id; slips.forEach(s => s.classList.remove('sel')); b.classList.add('sel'); chime(600, .08); } }, nodes.get(id).label); slips.set(id, b); }
      host.replaceChildren(html('b', {}, '🧩 Recall: '), ...slips.values(), msg, html('button', { class: 'x', onclick: () => api.stopRecall() }, '✖')); host.hidden = false; api.host = host;
    },
    stopRecall() { recallOn = false; target = null; for (const n of nodes.values()) { n.g.classList.remove('dz', 'solved', 'wrong'); n.text.style.opacity = 1; } if (api.host) api.host.hidden = true; },
    get recalling() { return recallOn; },
    sim(hud, done) {
      api.stopRecall(); api.stopSim(); let i = 0; hud.hidden = false;
      const next = () => {
        for (const n of nodes.values()) n.g.classList.remove('pulse');
        if (i >= spec.sim.length) { hud.hidden = true; timer = null; done?.(); return; }
        const [text, ids] = spec.sim[i++]; hud.textContent = text; say(text); chime(500 + i * 90, .12);
        for (const id of ids) nodes.get(id)?.g.classList.add('pulse');
        timer = setTimeout(next, 2200);
      };
      next();
    },
    stopSim() { clearTimeout(timer); timer = null; for (const n of nodes.values()) n.g.classList.remove('pulse'); },
    get simulating() { return timer !== null; },
    destroy() { api.stopSim(); api.stopRecall(); },
  };
  return api;
}
