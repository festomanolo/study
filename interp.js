// Python-subset interpreter. run(src,{maxSteps}) is a generator yielding StepEvents; for 'input' events send the answer via next(value).
export class Fl { constructor(v) { this.v = v; } }
class PyErr extends Error { constructor(kind, en, sw, line) { super(en); this.kind = kind; this.sw = sw; this.line = line; } }
const err = (k, en, sw, line) => new PyErr(k, en, sw, line);
export const typeOf = v => v === null ? 'NoneType' : v instanceof Fl ? 'float' : Array.isArray(v) ? 'list' : typeof v === 'number' ? 'int' : typeof v === 'string' ? 'str' : 'bool';
const isNum = v => typeof v === 'number' || v instanceof Fl;
const nv = v => v instanceof Fl ? v.v : v;
export function fmt(v) {
  if (v === null) return 'None';
  if (v === true) return 'True'; if (v === false) return 'False';
  if (v instanceof Fl) return Number.isInteger(v.v) && Math.abs(v.v) < 1e16 ? v.v.toFixed(1) : String(v.v);
  if (Array.isArray(v)) return '[' + v.map(rep).join(', ') + ']';
  return String(v);
}
const rep = v => typeof v === 'string' ? "'" + v + "'" : fmt(v);

// Phone keyboards insert curly quotes and non-breaking spaces; treat them as plain ASCII.
export const heal = src => src.replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'").replace(/\u00a0/g, ' ');

// ---- lexer ----
const OPS = ['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', '[', ']', ',', ':', '.'];
export function lex(src) {
  const toks = [], stack = [0];
  src.split('\n').forEach((raw, i) => {
    const line = i + 1;
    if (/^\s*(#.*)?$/.test(raw)) return;
    if (raw.includes('\t')) throw err('IndentationError', 'Use spaces, not tabs.', 'Tumia nafasi (spaces), si tab.', line);
    const ind = raw.match(/^ */)[0].length;
    if (ind > stack[stack.length - 1]) { stack.push(ind); toks.push({ t: 'INDENT', line }); }
    else while (ind < stack[stack.length - 1]) {
      stack.pop(); toks.push({ t: 'DEDENT', line });
      if (ind > stack[stack.length - 1]) throw err('IndentationError', 'Indentation does not match any outer block.', 'Mpangilio wa nafasi haulingani na kizuizi cha nje.', line);
    }
    let p = ind;
    while (p < raw.length) {
      const c = raw[p];
      if (c === ' ') { p++; continue; }
      if (c === '#') break;
      let m;
      if ((m = /^\d+(\.\d+)?/.exec(raw.slice(p)))) { toks.push({ t: 'num', v: m[1] ? new Fl(parseFloat(m[0])) : parseInt(m[0], 10), line }); p += m[0].length; }
      else if ((m = /^[A-Za-z_]\w*/.exec(raw.slice(p)))) { toks.push({ t: 'name', v: m[0], line }); p += m[0].length; }
      else if (c === '"' || c === "'") {
        const e = raw.indexOf(c, p + 1);
        if (e < 0) throw err('SyntaxError', 'This text is missing its closing quote.', 'Maneno haya hayana alama ya kufunga nukuu.', line);
        toks.push({ t: 'str', v: raw.slice(p + 1, e), line }); p = e + 1;
      } else {
        const op = OPS.find(o => raw.startsWith(o, p));
        if (!op) throw err('SyntaxError', `Unexpected character "${c}".`, `Herufi "${c}" haitarajiwi hapa.`, line);
        toks.push({ t: 'op', v: op, line }); p += op.length;
      }
    }
    toks.push({ t: 'NL', line });
  });
  while (stack.length > 1) { stack.pop(); toks.push({ t: 'DEDENT', line: 0 }); }
  toks.push({ t: 'EOF', line: 0 });
  return toks;
}

// ---- parser ----
export function parse(src) {
  const T = lex(heal(src)); let i = 0;
  const pk = () => T[i], nx = () => T[i++];
  const isOp = v => pk().t === 'op' && pk().v === v;
  const isKw = v => pk().t === 'name' && pk().v === v;
  const bad = (en, sw) => err('SyntaxError', en, sw, pk().line || T[i - 1]?.line);
  const expectOp = v => { if (!isOp(v)) throw bad(`Expected "${v}" here.`, `Tulitarajia "${v}" hapa.`); return nx(); };
  function block() {
    expectOp(':');
    if (pk().t !== 'NL') throw bad('Put the block on the next lines.', 'Weka vitendo kwenye mistari inayofuata.');
    nx();
    if (pk().t !== 'INDENT') throw err('IndentationError', 'Expected an indented block.', 'Tulitarajia mistari iliyoingizwa ndani (indent).', pk().line || T[i - 1].line);
    nx(); const b = [];
    while (pk().t !== 'DEDENT' && pk().t !== 'EOF') b.push(stmt());
    nx(); return b;
  }
  function stmt() {
    const tk = pk(), line = tk.line;
    if (tk.t === 'INDENT') throw err('IndentationError', 'Unexpected indent.', 'Nafasi ya ndani isiyotarajiwa.', line);
    if (tk.t === 'name') {
      if (tk.v === 'if') {
        nx(); const br = []; let els = null; br.push([expr(), block()]);
        while (isKw('elif')) { nx(); br.push([expr(), block()]); }
        if (isKw('else')) { nx(); els = block(); }
        return { k: 'if', br, els, line };
      }
      if (tk.v === 'while') { nx(); const c = expr(); return { k: 'while', c, body: block(), line }; }
      if (tk.v === 'for') {
        nx(); const v = nx().v; if (!isKw('in')) throw bad('Expected "in".', 'Tulitarajia "in".'); nx();
        const it = expr(); return { k: 'for', v, it, body: block(), line };
      }
      if (['pass', 'break', 'continue'].includes(tk.v)) { nx(); eol(); return { k: tk.v, line }; }
    }
    const e = expr();
    let s;
    if (pk().t === 'op' && ['=', '+=', '-=', '*=', '/=', '%='].includes(pk().v)) {
      const op = nx().v;
      if (e.k !== 'name' && e.k !== 'idx') throw bad('You can only assign to a variable.', 'Unaweza kuipa thamani kibadilishi tu.');
      s = { k: 'assign', target: e, op, e: expr(), line };
    } else s = { k: 'expr', e, line };
    eol(); return s;
  }
  function eol() { if (pk().t !== 'NL' && pk().t !== 'EOF') throw bad('Unexpected text at the end of the line.', 'Kuna maandishi yasiyotarajiwa mwishoni mwa mstari.'); if (pk().t === 'NL') nx(); }
  const BIN = [['or'], ['and'], ['not'], ['==', '!=', '<', '>', '<=', '>=', 'in'], ['+', '-'], ['*', '/', '//', '%']];
  function expr(l = 0) {
    if (l === BIN.length) return unary();
    if (BIN[l][0] === 'not') {
      if (isKw('not')) { nx(); return { k: 'not', e: expr(l), line: pk().line }; }
      return expr(l + 1);
    }
    let a = expr(l + 1);
    while ((pk().t === 'op' || pk().t === 'name') && BIN[l].includes(pk().v)) {
      const op = nx().v, line = T[i - 1].line; a = { k: 'bin', op, a, b: expr(l + 1), line };
    }
    return a;
  }
  function unary() {
    if (isOp('-')) { const line = nx().line; return { k: 'neg', e: unary(), line }; }
    return power();
  }
  function power() {
    const a = postfix();
    if (isOp('**')) { const line = nx().line; return { k: 'bin', op: '**', a, b: unary(), line }; }
    return a;
  }
  function postfix() {
    let a = atom();
    for (;;) {
      if (isOp('(')) { const line = nx().line; const args = []; while (!isOp(')')) { args.push(expr()); if (isOp(',')) nx(); else break; } expectOp(')'); a = { k: 'call', f: a, args, line }; }
      else if (isOp('[')) { const line = nx().line; const x = expr(); expectOp(']'); a = { k: 'idx', a, x, line }; }
      else if (isOp('.')) { nx(); a = { k: 'attr', a, n: nx().v, line: a.line }; }
      else return a;
    }
  }
  function atom() {
    const tk = nx();
    if (tk.t === 'num' || tk.t === 'str') return { k: 'lit', v: tk.v, line: tk.line };
    if (tk.t === 'name') {
      if (tk.v === 'True') return { k: 'lit', v: true, line: tk.line };
      if (tk.v === 'False') return { k: 'lit', v: false, line: tk.line };
      if (tk.v === 'None') return { k: 'lit', v: null, line: tk.line };
      if (['if', 'while', 'for', 'elif', 'else', 'in', 'and', 'or', 'not'].includes(tk.v)) { i--; throw bad(`"${tk.v}" is not allowed here.`, `"${tk.v}" haliruhusiwi hapa.`); }
      return { k: 'name', n: tk.v, line: tk.line };
    }
    if (tk.t === 'op' && tk.v === '(') { const e = expr(); expectOp(')'); return e; }
    if (tk.t === 'op' && tk.v === '[') { const xs = []; while (!isOp(']')) { xs.push(expr()); if (isOp(',')) nx(); else break; } expectOp(']'); return { k: 'list', xs, line: tk.line }; }
    i--; throw bad('Incomplete or unexpected expression.', 'Usemi haujakamilika au haukutarajiwa.');
  }
  const prog = []; while (pk().t !== 'EOF') prog.push(stmt());
  return prog;
}

// ---- evaluator ----
const tyErr = (op, a, b, line) => err('TypeError', `You cannot use "${op}" between ${typeOf(a)} and ${typeOf(b)}.`, `Huwezi kutumia "${op}" kati ya ${typeOf(a)} na ${typeOf(b)}.`, line);
const mk = (x, flt) => flt ? new Fl(x) : x;
function binop(op, a, b, line) {
  if (op === '==') return isNum(a) && isNum(b) ? nv(a) === nv(b) : JSON.stringify(a) === JSON.stringify(b) && typeOf(a) === typeOf(b);
  if (op === '!=') return !binop('==', a, b, line);
  if (op === 'in') { if (typeof b === 'string' && typeof a === 'string') return b.includes(a); if (Array.isArray(b)) return b.some(x => binop('==', a, x)); throw tyErr(op, a, b, line); }
  if (['<', '>', '<=', '>='].includes(op)) {
    if (!(isNum(a) && isNum(b)) && !(typeof a === 'string' && typeof b === 'string')) throw tyErr(op, a, b, line);
    const x = nv(a), y = nv(b); return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
  if (op === '+') {
    if (typeof a === 'string' && typeof b === 'string') return a + b;
    if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
  }
  if (op === '*') {
    if (typeof a === 'string' && Number.isInteger(b) && typeof b === 'number') return a.repeat(Math.max(0, b));
    if (typeof b === 'string' && typeof a === 'number' && Number.isInteger(a)) return b.repeat(Math.max(0, a));
  }
  if (!isNum(a) || !isNum(b) || typeof a === 'boolean' || typeof b === 'boolean') {
    if (typeof a === 'boolean' && isNum(b) || typeof b === 'boolean' && isNum(a)) { a = +a; b = +b; } else throw tyErr(op, a, b, line);
  }
  const fl = a instanceof Fl || b instanceof Fl, x = nv(a), y = nv(b);
  if ((op === '/' || op === '//' || op === '%') && y === 0) throw err('ZeroDivisionError', 'You cannot divide by zero.', 'Huwezi kugawanya kwa sifuri.', line);
  switch (op) {
    case '+': return mk(x + y, fl);
    case '-': return mk(x - y, fl);
    case '*': return mk(x * y, fl);
    case '/': return new Fl(x / y);
    case '//': return mk(Math.floor(x / y), fl);
    case '%': return mk(x - y * Math.floor(x / y), fl);
    case '**': return mk(x ** y, fl || y < 0);
  }
}
const truthy = v => v === null ? false : v instanceof Fl ? v.v !== 0 : Array.isArray(v) ? v.length > 0 : !!v;
const conv = (name, f) => (args, line) => { try { return f(...args); } catch (e) { if (e instanceof PyErr) throw e; throw err('ValueError', `Cannot convert this value with ${name}().`, `Haiwezi kubadilishwa kwa ${name}().`, line); } };
const BUILTINS = {
  int: conv('int', x => { if (typeof x === 'string') { if (!/^\s*[+-]?\d+\s*$/.test(x)) throw 0; return parseInt(x, 10); } return Math.trunc(nv(x)); }),
  float: conv('float', x => { if (typeof x === 'string' && !/^\s*[+-]?(\d+\.?\d*|\.\d+)\s*$/.test(x)) throw 0; return new Fl(parseFloat(nv(x))); }),
  str: ([x]) => fmt(x), bool: ([x]) => truthy(x),
  len: ([x], l) => { if (typeof x === 'string' || Array.isArray(x)) return x.length; throw err('TypeError', `${typeOf(x)} has no len().`, `${typeOf(x)} haina len().`, l); },
  type: ([x]) => `<class '${typeOf(x)}'>`,
  abs: ([x]) => x instanceof Fl ? new Fl(Math.abs(x.v)) : Math.abs(x),
  round: ([x, d]) => { if (d === undefined) return Math.round(nv(x)); const m = 10 ** d; return new Fl(Math.round(nv(x) * m) / m); },
};
for (const k of Object.keys(BUILTINS)) { const f = BUILTINS[k]; BUILTINS[k] = (a, l) => f(a, l); }
BUILTINS.int = (a, l) => conv('int', x => { if (typeof x === 'string') { if (!/^\s*[+-]?\d+\s*$/.test(x)) throw 0; return parseInt(x, 10); } return Math.trunc(nv(x)); })(a, l);

export function* run(src, { maxSteps = 20000, maxOut = 5000 } = {}) {
  let prog, steps = 0, outLen = 0;
  try { prog = parse(src); } catch (e) { if (e instanceof PyErr) { yield errEv(e); return; } throw e; }
  const vars = new Map();
  function errEv(e) { return { t: 'error', kind: e.kind, line: e.line, msg: { en: e.message, sw: e.sw } }; }
  const BRK = Symbol('break'), CNT = Symbol('continue');
  function* ev(n) {
    switch (n.k) {
      case 'lit': return n.v;
      case 'name': if (!vars.has(n.n)) throw err('NameError', `"${n.n}" has no value yet. Give it a value first.`, `Hujaipa "${n.n}" thamani bado.`, n.line); return vars.get(n.n);
      case 'list': { const r = []; for (const x of n.xs) r.push(yield* ev(x)); return r; }
      case 'neg': { const v = yield* ev(n.e); if (!isNum(v)) throw err('TypeError', `Cannot negate ${typeOf(v)}.`, `Huwezi kuweka alama ya kuondoa kwenye ${typeOf(v)}.`, n.line); return v instanceof Fl ? new Fl(-v.v) : -v; }
      case 'not': return !truthy(yield* ev(n.e));
      case 'bin': {
        if (n.op === 'and') { const a = yield* ev(n.a); return truthy(a) ? yield* ev(n.b) : a; }
        if (n.op === 'or') { const a = yield* ev(n.a); return truthy(a) ? a : yield* ev(n.b); }
        const a = yield* ev(n.a), b = yield* ev(n.b); return binop(n.op, a, b, n.line);
      }
      case 'idx': {
        const a = yield* ev(n.a), x = yield* ev(n.x);
        if (!(typeof a === 'string' || Array.isArray(a))) throw err('TypeError', `${typeOf(a)} cannot be indexed.`, `${typeOf(a)} haiwezi kuwekewa namba ya nafasi.`, n.line);
        if (typeof x !== 'number' || !Number.isInteger(x)) throw err('TypeError', 'Index must be an int.', 'Namba ya nafasi lazima iwe int.', n.line);
        const j = x < 0 ? a.length + x : x;
        if (j < 0 || j >= a.length) throw err('IndexError', 'Index is outside the list/text.', 'Namba ya nafasi iko nje ya orodha/maandishi.', n.line);
        return a[j];
      }
      case 'call': {
        if (n.f.k === 'attr') {
          const o = yield* ev(n.f.a), args = []; for (const a of n.args) args.push(yield* ev(a));
          if (Array.isArray(o) && n.f.n === 'append') { o.push(args[0]); return null; }
          if (typeof o === 'string' && ['upper', 'lower', 'strip'].includes(n.f.n)) return n.f.n === 'upper' ? o.toUpperCase() : n.f.n === 'lower' ? o.toLowerCase() : o.trim();
          throw err('AttributeError', `${typeOf(o)} has no method "${n.f.n}" here.`, `${typeOf(o)} haina "${n.f.n}" hapa.`, n.line);
        }
        const name = n.f.n, args = []; for (const a of n.args) args.push(yield* ev(a));
        if (name === 'print') { const text = args.map(fmt).join(' '); if ((outLen += text.length) > maxOut) throw err('OutputError', 'Too much output.', 'Matokeo ni mengi mno.', n.line); yield { t: 'print', text }; return null; }
        if (name === 'input') { const v = yield { t: 'input', prompt: args[0] === undefined ? '' : fmt(args[0]) }; return v === undefined ? '' : String(v); }
        if (name === 'range') { const [a, b, s = 1] = args.length === 1 ? [0, args[0]] : args; if (!args.every(x => typeof x === 'number')) throw err('TypeError', 'range() needs whole numbers.', 'range() inahitaji namba kamili.', n.line); const r = []; for (let x = a; s > 0 ? x < b : x > b; x += s) r.push(x); return r; }
        if (BUILTINS[name] && !vars.has(name)) return BUILTINS[name](args, n.line);
        throw err('NameError', `"${name}" is not a function I know.`, `"${name}" si kitendakazi ninachokijua.`, n.line);
      }
    }
    throw err('SyntaxError', 'Unsupported expression.', 'Usemi huu haujaungwa mkono.', n.line);
  }
  function* exec(body) {
    for (const s of body) {
      if (++steps > maxSteps) throw err('LoopError', 'Your loop never ends (too many steps). Check its condition.', 'Kitanzi chako hakiishi. Angalia sharti lake.', s.line);
      yield { t: 'line', line: s.line };
      switch (s.k) {
        case 'expr': yield* ev(s.e); break;
        case 'pass': break;
        case 'break': return BRK;
        case 'continue': return CNT;
        case 'assign': {
          let v = yield* ev(s.e);
          const t = s.target;
          if (s.op !== '=') v = binop(s.op[0], yield* ev(t), v, s.line);
          if (t.k === 'name') { const isNew = !vars.has(t.n); vars.set(t.n, v); yield { t: 'assign', name: t.n, value: v, typ: typeOf(v), isNew, line: s.line }; }
          else { const a = yield* ev(t.a), x = yield* ev(t.x); if (!Array.isArray(a)) throw err('TypeError', 'Only lists can be changed by index.', 'Orodha pekee ndizo hubadilishwa kwa namba ya nafasi.', s.line); const j = x < 0 ? a.length + x : x; if (j < 0 || j >= a.length) throw err('IndexError', 'Index is outside the list.', 'Namba ya nafasi iko nje ya orodha.', s.line); a[j] = v; }
          break;
        }
        case 'if': {
          let taken = false;
          for (const [c, b] of s.br) {
            const ok = truthy(yield* ev(c)); yield { t: 'branch', taken: ok, line: c.line || s.line };
            if (ok) { taken = true; const r = yield* exec(b); if (r) return r; break; }
          }
          if (!taken && s.els) { const r = yield* exec(s.els); if (r) return r; }
          break;
        }
        case 'while': {
          let i = 0;
          for (;;) {
            if (++steps > maxSteps) throw err('LoopError', 'Your loop never ends (too many steps). Check its condition.', 'Kitanzi chako hakiishi. Angalia sharti lake.', s.line);
            const ok = truthy(yield* ev(s.c)); yield { t: 'branch', taken: ok, line: s.line };
            if (!ok) break;
            yield { t: 'loopIter', i: i++, line: s.line };
            const r = yield* exec(s.body); if (r === BRK) break;
          }
          break;
        }
        case 'for': {
          const it = yield* ev(s.it);
          if (!(typeof it === 'string' || Array.isArray(it))) throw err('TypeError', `Cannot loop over ${typeOf(it)}.`, `Huwezi kuzunguka ${typeOf(it)}.`, s.line);
          let i = 0;
          for (const x of [...it]) {
            const isNew = !vars.has(s.v); vars.set(s.v, x); yield { t: 'assign', name: s.v, value: x, typ: typeOf(x), isNew, line: s.line };
            yield { t: 'loopIter', i: i++, line: s.line };
            const r = yield* exec(s.body); if (r === BRK) break;
          }
          break;
        }
      }
    }
  }
  try { yield* exec(prog); } catch (e) { if (e instanceof PyErr) { yield errEv(e); return; } throw e; }
  yield { t: 'done' };
}

// Convenience: run to completion with canned inputs. Returns {out, error, events}.
export function runSync(src, inputs = [], opts) {
  const g = run(src, opts), out = [], events = []; let error = null, r = g.next();
  while (!r.done) {
    const e = r.value; events.push(e);
    if (e.t === 'print') out.push(e.text); else if (e.t === 'error') error = e;
    r = g.next(e.t === 'input' ? inputs.shift() : undefined);
  }
  return { out: out.join('\n'), error, events };
}
