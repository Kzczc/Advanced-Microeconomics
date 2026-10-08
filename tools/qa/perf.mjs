import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const [w, name] of [[1440, 'desk'], [390, 'mob']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://127.0.0.1:8766/lecture1/restrictions.html', { waitUntil: 'load' });
  const nodes = await page.evaluate(() => document.getElementsByTagName('*').length);
  const fps = await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    let frames = 0; let worst = 0; let last = performance.now();
    const t0 = last;
    await new Promise((res) => {
      function step(now) {
        frames += 1; worst = Math.max(worst, now - last); last = now;
        const y = ((now - t0) / 4000) * H;
        window.scrollTo(0, y);
        if (now - t0 < 4000) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
    return { fps: Math.round(frames / 4), worstFrameMs: Math.round(worst) };
  });
  console.log(name, 'DOM nodes', nodes, JSON.stringify(fps));
  await page.close();
}
await browser.close();
