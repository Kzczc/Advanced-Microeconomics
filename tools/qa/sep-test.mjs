// Click through the separability widget and print the status text after each step.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:8766/lecture1/restrictions.html#p21');
const w = page.locator('#p21 .widget');
await w.scrollIntoViewIfNeeded();
await page.waitForSelector('#p21 .widget .w-status');
const status = async (label) => console.log(`--- ${label}\n${(await w.locator('.w-status').innerText()).slice(0, 220)}`);

await status('initial (Lin, x)');
await w.getByRole('button', { name: '小周（不可分）' }).click();
await status('Zhou, full menu');
await w.getByRole('button', { name: /检查所有/ }).click();
await status('Zhou, after check-all');
console.log('chips pressed:', await w.locator('.w-chip[aria-pressed="true"]').allInnerTexts());
await w.getByRole('button', { name: '小林（可分）' }).click();
await w.getByRole('button', { name: /检查所有/ }).click();
await status('Lin, after check-all');
await w.getByRole('button', { name: '固定饮料，选主菜' }).click();
await status('Lin, direction y');
console.log('errors:', errors);
await browser.close();
