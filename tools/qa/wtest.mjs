// Screenshot widgets from tools/widget_preview.html with given opts and report console errors.
//   node /tmp/pw/wtest.mjs <base> <out-dir> "<name>|<opts json>|<shot name>|<width>" ...
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, out, ...specs] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const spec of specs) {
  const [name, opts, shot, width = '780'] = spec.split('|');
  const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const q = new URLSearchParams({ only: name, ...(opts ? { opts } : {}) });
  await page.goto(`${base}tools/widget_preview.html?${q}`);
  await page.waitForSelector('body[data-ready="1"]');
  await page.waitForTimeout(300);
  const el = page.locator(`#w-${name}`);
  await el.screenshot({ path: `${out}/${shot}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(JSON.stringify({ shot, overflow, errors }));
  await page.close();
}
await browser.close();
