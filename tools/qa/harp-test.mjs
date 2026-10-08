// Verify the dessert preset of harp-checker on page 24 and the default on page 9.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://127.0.0.1:8766/lecture1/behavioral.html#p24');
const w = page.locator('#p24 .widget');
await w.scrollIntoViewIfNeeded();
await page.waitForSelector('#p24 .widget .w-status');
console.log('pressed preset:', await w.locator('.w-seg .w-btn[aria-pressed="true"]').allInnerTexts());
console.log('legend:', await w.locator('.w-plot > p.w-note').first().innerText());
console.log('status:', (await w.locator('.w-status').innerText()).slice(0, 160));
const row = w.locator('.w-menu-row').nth(2); // C({y,z})
await row.locator('.w-chip').nth(0).click(); // add y
await row.locator('.w-chip').nth(1).click(); // remove z
console.log('after fix:', (await w.locator('.w-status').innerText()).slice(0, 200));

await page.goto('http://127.0.0.1:8766/lecture1/revealed.html#p09');
const w9 = page.locator('#p09 .widget');
await w9.scrollIntoViewIfNeeded();
await page.waitForSelector('#p09 .widget .w-status');
console.log('p09 presets:', await w9.locator('.w-seg .w-btn').allInnerTexts(),
  'pressed:', await w9.locator('.w-seg .w-btn[aria-pressed="true"]').allInnerTexts());
console.log('errors:', errors);
await browser.close();
