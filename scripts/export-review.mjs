// Writes docs/SWAHILI_REVIEW.csv: every Swahili string for a teacher to mark reviewed.
import { forms } from '../content.js'; import { writeFileSync } from 'node:fs';
const q = s => '"' + String(s).replace(/"/g, '""') + '"', rows = ['topic,field,english,swahili,reviewed,reviewer_notes'];
for (const f of Object.values(forms)) for (const u of f.units) for (const t of u.topics) {
  rows.push([t.id, 'title', t.title, t.sw, 'no', ''].map(q).join(','));
  for (const [k, d] of Object.entries(t.terms)) { rows.push([t.id, 'term:' + k, d[2], d[0], 'no', ''].map(q).join(',')); rows.push([t.id, 'analogy:' + k, '', d[1], 'no', ''].map(q).join(',')); }
}
writeFileSync('docs/SWAHILI_REVIEW.csv', rows.join('\n')); console.log(rows.length - 1, 'strings exported');
