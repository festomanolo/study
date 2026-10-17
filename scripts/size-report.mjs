import { readFileSync } from 'node:fs'; import { gzipSync } from 'node:zlib';
let total = 0; for (const f of ['index.html', 'style.css', 'app.js', 'interp.js', 'content.js', 'labs.js', 'sw.js']) { const n = gzipSync(readFileSync(f)).length; total += n; console.log(f.padEnd(26), (n / 1024).toFixed(1) + ' KB gz'); }
console.log('TOTAL', (total / 1024).toFixed(1), 'KB gz (budget 500)'); process.exit(total > 500 * 1024 ? 1 : 0);
