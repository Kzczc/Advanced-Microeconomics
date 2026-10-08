// QA helper: screenshots + layout checks for the micro notes site.
//   node /tmp/pw/qa.mjs <base-url> <out-dir> [page ...]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://127.0.0.1:8766/', out = '/tmp/qa', ...pages] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const targets = pages.length ? pages : ['index.html', 'lecture1/preferences.html'];

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const views = [
  { name: 'desk', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mob', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

for (const v of views) {
  const ctx = await browser.newContext(v);
  for (const p of targets) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const [url, hash] = p.split('#');
    await page.goto(base + url, { waitUntil: 'networkidle' });
    const tag = `${v.name}-${url.replace(/[/.]/g, '_')}${hash ? `-${hash}` : ''}`;
    if (hash) {
      await page.evaluate((h) => document.getElementById(h)?.scrollIntoView({ block: 'start' }), hash);
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: `${out}/${tag}.png` });
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const res = { overflowX: de.scrollWidth - de.clientWidth };
      const block = document.querySelector('.slide-block');
      if (block) {
        // Scroll to the middle of the first slide block and measure the slide figure.
        const r = block.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + r.top + Math.min(r.height * 0.5, 1400));
        const fig = block.querySelector('.slide-figure').getBoundingClientRect();
        res.figTopAfterScroll = Math.round(fig.top);
        res.blockHeight = Math.round(r.height);
      }
      return res;
    });
    if (info.figTopAfterScroll !== undefined) {
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/${tag}-scrolled.png` });
    }
    console.log(JSON.stringify({ view: v.name, page: p, ...info, errors }));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
