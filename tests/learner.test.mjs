import test from 'node:test'; import assert from 'node:assert/strict';
import { learner, MIS, errTag } from '../learner.js';
import { runSync } from '../interp.js';
const mk = () => { const S = {}; return [S, learner(S, () => {})]; };
test('correct answers raise mastery, wrong answers lower it', () => {
  const [, L] = mk(); L.answer('vars', 0, true); const a = L.mastery('vars'); L.answer('vars', 0, true); assert.ok(L.mastery('vars') > a);
  const [, M] = mk(); M.answer('vars', 0, false); assert.ok(M.mastery('vars') < .3); assert.equal(M.level('vars'), 'weak');
});
test('a mapped wrong answer records a misconception and queues review', () => {
  const [, L] = mk(); L.answer('vars', 2, false); assert.deepEqual(L.tagsFor('vars'), ['str-int-concat']); assert.deepEqual(L.missed(), ['vars:2']);
  L.answer('vars', 2, true); assert.deepEqual(L.tagsFor('vars'), []); assert.deepEqual(L.missed(), []);
});
test('interpreter errors map to misconceptions', () => {
  const e = src => errTag(runSync(src).error);
  assert.equal(e('print(x)'), 'name-before-assign'); assert.equal(e('print("5" + 5)'), 'str-int-concat');
  assert.equal(e('if 1 > 0\n    print(1)'), 'missing-colon'); assert.equal(e('while True:\n    pass'), 'infinite-loop'); assert.equal(e('if 1:\nprint(1)'), 'indent');
});
test('every misconception example runs and its check answer exists', () => {
  for (const [tag, [, , , , , code, [, o, a]]] of Object.entries(MIS)) { if (code) assert.equal(runSync(code).error, null, tag); assert.ok(o[a], tag); }
});
