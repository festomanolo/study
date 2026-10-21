import { readFileSync, readdirSync } from 'node:fs'; import { gzipSync } from 'node:zlib';
// App shell = every root .html/.css/.js file. Fonts are reported separately (woff2 is already compressed).
const app = readdirSync('.').filter(f => /\.(html|css|js)$/.test(f));
let total = 0; for (const f of app) { const n = gzipSync(readFileSync(f)).length; total += n; console.log(f.padEnd(26), (n / 1024).toFixed(1) + ' KB gz'); }
const fonts = readdirSync('fonts').filter(f => f.endsWith('.woff2')).reduce((a, f) => a + readFileSync('fonts/' + f).length, 0);
console.log('TOTAL', (total / 1024).toFixed(1), 'KB gz (budget 500)'); console.log('FONTS', (fonts / 1024).toFixed(1), 'KB woff2 (budget 120)');
process.exit(total > 500 * 1024 ? 1 : 0);
