import { forms, labTypes } from '../content.js';
let bad = 0; const fail = m => { console.error('✗', m); bad++; };
for (const f of Object.values(forms)) for (const u of f.units) for (const t of u.topics) {
  if (!t.code) fail(t.id + ': no syllabus code');
  if (!labTypes.includes(t.lab?.type)) fail(t.id + ': unknown lab');
  if (t.lab2 && !labTypes.includes(t.lab2.type)) fail(t.id + ': unknown lab2');
  if ((t.quiz || []).length < 3) fail(t.id + ': <3 questions');
  for (const [q, o, a] of t.quiz) if (!q || o[a] === undefined) fail(t.id + ': bad answer in ' + q);
  const used = [...t.notes.join(' ').matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1].toLowerCase());
  for (const k of used) if (!t.terms[k]?.[0]) fail(`${t.id}: term "${k}" lacks Swahili`);
  if (!t.sw) fail(t.id + ': title lacks Swahili');
}
console.log(bad ? `${bad} problem(s)` : 'content OK'); process.exit(bad ? 1 : 0);
