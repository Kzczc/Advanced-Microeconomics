// Exercise the reading features end to end and print what happened.
//   node features.mjs [base-url] [out-dir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://127.0.0.1:8766/', out = '/tmp/qa-features'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const log = (k, v) => console.log(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);

// Review page: marks, filter, shuffle, restore.
await page.goto(`${base}lecture1/review.html`);
const items = page.locator('.rv-item');
log('review items', await items.count());
await items.nth(0).locator('[data-mark="ok"]').click();
await items.nth(1).locator('[data-mark="bad"]').click();
log('count text', await page.locator('.rv-count').innerText());
await page.locator('[data-filter="bad"]').click();
log('visible with filter bad', await page.locator('.rv-item:not([hidden])').count());
await page.locator('[data-filter="all"]').click();
await page.locator('.rv-shuffle').click();
log('after shuffle: flat items', await page.locator('.rv-flat .rv-item').count());
await page.locator('.rv-sorted').click();
log('after restore: grouped items', await page.locator('.rv-group .rv-item').count());
await page.reload();
log('marks kept after reload', await page.locator('.rv-item[data-mark="ok"], .rv-item[data-mark="bad"]').count());

// Sheet page.
await page.goto(`${base}lecture1/sheet.html`);
log('sheet entries', await page.locator('.sheet-body h3').count());
log('sheet one-liners', await page.locator('.sh-sums li').count());
log('sheet toc links resolve', await page.evaluate(() => [...document.querySelectorAll('.page-toc a')].every((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))));

// Search highlight.
await page.goto(`${base}lecture1/restrictions.html?hl=${encodeURIComponent('拟凹')}#p20`);
log('search highlights in #p20', await page.locator('#p20 mark.search-hl').count());

// Keyboard on a draggable handle.
await page.goto(`${base}lecture1/restrictions.html#p19`);
const w = page.locator('#p19 .widget');
await w.scrollIntoViewIfNeeded();
await page.waitForSelector('#p19 .widget .w-handle');
const before = await w.locator('.w-status').innerText();
await w.locator('.w-handle').first().focus();
for (let i = 0; i < 6; i += 1) await page.keyboard.press('Shift+ArrowRight');
const after = await w.locator('.w-status').innerText();
log('keyboard moved handle (status changed)', before !== after);

// Night mode and a widget in night mode.
await page.locator('.theme-toggle').click();
log('theme', await page.evaluate(() => document.documentElement.dataset.theme || 'light'));
await page.screenshot({ path: `${out}/dark-viewport.png` });
await w.screenshot({ path: `${out}/dark-widget.png` });
await page.locator('.theme-toggle').click();

// Print layout (light, single column).
await page.emulateMedia({ media: 'print' });
await page.goto(`${base}lecture1/restrictions.html`);
await page.screenshot({ path: `${out}/print-top.png` });
await page.emulateMedia({ media: 'screen' });

// Home: export learning record.
await page.goto(`${base}index.html`);
const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('.progress-export').click()]);
log('export file', dl.suggestedFilename());

log('errors', errors);
await browser.close();
