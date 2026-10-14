// one-over-n: the 1/n rule of thumb in retirement plans (page 25, Benartzi & Thaler 2001).
// Splitting money evenly over the funds on offer lets the menu decide how much goes into stocks.
import { C, s, h, makeSvg, segmented, slider, statusPanel, skeleton, isNarrow } from './_shared.js';

const H = 250;
const BAR_X = 30;
const BAR_H = 36;
const PLANS = {
  twa: { label: 'TWA 的计划', stocks: 5, bonds: 1, actual: 75, name: '环球航空（TWA）' },
  uc: { label: '加州大学的计划', stocks: 1, bonds: 4, actual: 34, name: '加州大学' },
};

const pct = (x) => `${Math.round(x)}%`;

export function mount(stage) {
  const W = isNarrow(stage) ? 400 : 560;
  const BAR_W = W - 60;
  let stocks = PLANS.twa.stocks;
  let bonds = PLANS.twa.bonds;
  let target = 50;
  const { root, plot, side } = skeleton(stage);
  const presets = segmented([...Object.entries(PLANS).map(([k, p]) => [k, p.label])], 'twa', (k) => {
    stocks = PLANS[k].stocks;
    bonds = PLANS[k].bonds;
    stockSlider.set(stocks);
    bondSlider.set(bonds);
    draw();
  }, '养老计划');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, presets.el));

  const svg = makeSvg(W, H, '两种分钱方法下放在股票上的比例');
  plot.append(svg);
  const rows = [
    { y: 58, title: '按 1/n 平均分：每只基金放一样多' },
    { y: 168, title: '按自己的风险偏好分：不看菜单' },
  ].map(({ y, title }) => {
    s('text', { x: BAR_X, y: y - 12, class: 'w-small', 'font-weight': 700 }, svg).textContent = title;
    const g = s('g', {}, svg);
    const stockText = s('text', { y: y + BAR_H / 2 + 5, 'text-anchor': 'middle', 'font-weight': 700, fill: '#fff' }, svg);
    const bondText = s('text', { y: y + BAR_H / 2 + 5, 'text-anchor': 'middle', 'font-weight': 700, fill: C.navy }, svg);
    return { y, g, stockText, bondText };
  });
  const actualMark = s('g', {}, svg);

  const stockSlider = slider({ label: '股票基金几只', min: 1, max: 8, step: 1, value: stocks, format: (x) => `${x} 只`, onInput: (x) => { stocks = x; presets.set(null); draw(); } });
  const bondSlider = slider({ label: '债券基金几只', min: 1, max: 8, step: 1, value: bonds, format: (x) => `${x} 只`, onInput: (x) => { bonds = x; presets.set(null); draw(); } });
  const targetSlider = slider({ label: '你本来想放在股票上的比例', min: 0, max: 100, step: 5, value: target, format: pct, onInput: (x) => { target = x; draw(); } });
  side.append(
    h('p', { class: 'w-note', style: 'margin:0 0 8px', html: '股票风险大、长期收益高，债券稳但收益低。放多少在股票上，本该取决于你能承受多大风险。' }),
    stockSlider.el, bondSlider.el, targetSlider.el,
  );
  const status = statusPanel();
  side.append(status.el);

  function bar(row, parts) {
    row.g.replaceChildren();
    let x = BAR_X;
    for (const { width, color } of parts) {
      s('rect', { x, y: row.y, width, height: BAR_H, fill: color, stroke: '#fff', 'stroke-width': 1.5 }, row.g);
      x += width;
    }
  }

  // Write "股票 83%" inside its part of the bar; fall back to "83%", or nothing, when the part is too narrow.
  function fit(textEl, width, name, share) {
    for (const text of [`${name} ${pct(share)}`, pct(share)]) {
      textEl.textContent = text;
      if (textEl.getComputedTextLength() <= width - 8) return;
    }
    textEl.textContent = '';
  }

  function label(row, share) {
    const stockW = (BAR_W * share) / 100;
    row.stockText.setAttribute('x', BAR_X + stockW / 2);
    fit(row.stockText, stockW, '股票', share);
    row.bondText.setAttribute('x', BAR_X + stockW + (BAR_W - stockW) / 2);
    fit(row.bondText, BAR_W - stockW, '债券', 100 - share);
  }

  function matchingPlan() {
    return Object.values(PLANS).find((p) => p.stocks === stocks && p.bonds === bonds) ?? null;
  }

  function draw() {
    const n = stocks + bonds;
    const even = (100 * stocks) / n;
    const fund = BAR_W / n;
    bar(rows[0], [
      ...Array.from({ length: stocks }, () => ({ width: fund, color: C.orange })),
      ...Array.from({ length: bonds }, () => ({ width: fund, color: C.fillBlue })),
    ]);
    label(rows[0], even);
    bar(rows[1], [
      { width: (BAR_W * target) / 100, color: C.orange },
      { width: (BAR_W * (100 - target)) / 100, color: C.fillBlue },
    ]);
    label(rows[1], target);

    actualMark.replaceChildren();
    const plan = matchingPlan();
    if (plan) {
      const ax = BAR_X + (BAR_W * plan.actual) / 100;
      const y = rows[0].y + BAR_H + 6;
      s('path', { d: `M${ax},${y} l-7,12 h14 z`, fill: C.red }, actualMark);
      s('text', { x: ax, y: y + 28, 'text-anchor': 'middle', class: 'w-small', style: `fill:${C.red}`, 'font-weight': 700 }, actualMark).textContent = `员工实际约 ${plan.actual}% 在股票`;
    }

    const evenText = `菜单里 ${stocks} 只股票基金、${bonds} 只债券基金，每只放 1/${n}，股票就占 ${stocks}/${n} ≈ ${pct(even)}。`;
    if (plan) {
      status.set(`<p>${evenText}</p><p>${plan.name}的员工实际约把 ${plan.actual}% 放在股票上，和 1/n 的预测（${pct(even)}）方向一致：股票基金多的计划，员工就多买股票。两家员工的风险偏好不该差这么多，差的是菜单。</p>`, 'info');
      return;
    }
    const gap = Math.abs(even - target);
    status.set(`<p>${evenText}</p><p>按你自己的风险偏好，股票该占 ${pct(target)}，${gap < 5 ? '这次两者刚好差不多。' : `两者差了 ${Math.round(gap)} 个百分点。`}理性选择说配置只取决于偏好，和菜单里各有几只基金无关；1/n 法则却让菜单替你做了决定。</p>`, gap < 5 ? 'ok' : 'bad');
  }

  draw();
}
