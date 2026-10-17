// Run: npm run serve (in another shell), then npm run e2e   (needs `playwright` installed)
import { chromium } from 'playwright';
const url = process.env.URL || 'http://localhost:8080/';
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}), p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok', m); };
await p.goto(url); await p.waitForSelector('.bag');
await p.focus('.pull'); for (let i = 0; i < 4; i++) await p.keyboard.press('ArrowRight');
await p.waitForTimeout(800); await p.click('.book:not(.soon)'); await p.click('.lid h2'); await p.waitForSelector('.toc');
await p.click('text=Variables, data types'); await p.waitForTimeout(1200); await p.click('button[aria-label="Next page"]');
await p.waitForSelector('textarea'); await p.click('button.pri');
ok((await p.textContent('.out')).includes('Total TZS 1500'), 'interpreter output');
ok(await p.locator('.vbox').count() === 3, 'variable boxes');
await p.goto(url + '#/cs/f1/p/0'); await p.waitForSelector('.sheet'); ok(true, 'deep link');
ok(!errs.length, 'no page errors ' + errs); await b.close();
