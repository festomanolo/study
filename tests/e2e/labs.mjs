// Bespoke labs reach completion. Run with npm run serve in another shell.
import { chromium } from 'playwright';
const url = process.env.URL || 'http://localhost:8080/';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
await p.goto(url); await p.evaluate(() => localStorage['manolo.v1'] = JSON.stringify({ v: 1, seen: true, set: { reduce: true } })); await p.reload();
const open = async (f, id, type = 'lab2') => { const n = await p.evaluate(([f, id, type]) => window.__manolo.pagesOf(f).findIndex(x => x.t?.id === id && x.type === type), [f, id, type]); await p.goto(`${url}#/cs/${f}/p/${n}`); await p.reload(); await p.waitForSelector('.lab'); };
const lab = () => p.evaluate(() => JSON.parse(localStorage['manolo.v1']).lab);
await open('f2', 'lang'); for (const k of 'RFLFFFRF') await p.click(`button.chip:text-is("${k}")`); await p.click('text=▶ Go'); await p.waitForTimeout(500); ok((await lab())['lang.2'], 'boda');
await open('f2', 'tools'); await p.click('text=Compile & run'); await p.click('text=▶ Interpret'); await p.waitForTimeout(300);
await p.click('button:text-is("Fix line 3")'); await p.click('text=Compile & run'); await p.click('text=▶ Interpret'); await p.waitForTimeout(300); ok((await lab())['tools.2'], 'conveyor');
await open('f2', 'internet'); await p.click('text=Send message'); await p.waitForTimeout(300); await p.click('g[aria-label="Router B"]'); await p.click('text=Send message'); await p.waitForTimeout(500); ok((await lab())['internet.2'], 'packets');
await open('f1', 'install-files'); await p.click('button:text-is("📁 Downloads")'); await p.click('button:text-is("📄 notes.txt")'); await p.click('button:text-is("Cut")'); await p.click('button:text-is("⬆ ..")'); await p.click('button:text-is("📁 Documents")'); await p.click('button:text-is("📁 School")'); await p.click('button:text-is("Paste")'); await p.waitForTimeout(200); ok((await lab())['install-files.2'], 'files');
ok(!errs.length, 'no page errors ' + errs); await b.close();
