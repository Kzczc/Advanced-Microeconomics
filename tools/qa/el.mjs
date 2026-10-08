// Element screenshots for QA.
//   node /tmp/pw/el.mjs <base-url> <out-dir> "<page>|<css selector>|<name>" ...
// Waits for widgets inside the element to mount, reports console errors.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, out, ...specs] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const width = Number(process.env.W || 1440);
const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });

for (const spec of specs) {
  const [url, selector, name] = spec.split('|');
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + url, { waitUntil: 'networkidle' });
  const el = page.locator(selector).first();
  if (!(await el.count())) {
    console.log(JSON.stringify({ name, error: 'selector not found', selector }));
    await page.close();
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await el.screenshot({ path: `${out}/${name}.png` });
  const box = await el.boundingBox();
  console.log(JSON.stringify({ name, w: Math.round(box.width), h: Math.round(box.height), errors }));
  await page.close();
}
await browser.close();
