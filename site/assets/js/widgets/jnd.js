// jnd: just noticeable differences (page 17). x ≻ y iff u(x) ≥ u(y) + 1, so "a ∼ b" means the
// scores differ by less than 1 — and that kind of indifference need not be transitive.
import { C, s, h, makeSvg, draggable, segmented, statusPanel, skeleton, fmt, clamp, isNarrow } from './_shared.js';

const H = 250;
const U_MAX = 3.5;
const LINE_Y = 178;
const NAMES = ['a', 'b', 'c'];
const COLORS = [C.navy, C.teal, C.orange];
const PRESETS = {
  coffee: { label: '三杯咖啡', u: [0, 0.6, 1.2] },
  far: { label: '差别都很大', u: [0.2, 1.5, 2.8] },
  near: { label: '都差不多', u: [0.6, 0.9, 1.3] },
};

const v = (name) => `<i class="w-var">${name}</i>`;
const num = (x) => fmt(x, 2).replace(/\.?0+$/, '');
const noticed = (d) => d >= 1 - 1e-9;

export function mount(stage) {
  const W = isNarrow(stage) ? 400 : 560;
  const u = [...PRESETS.coffee.u];
  const { root, plot, side } = skeleton(stage);
  const presets = segmented(Object.entries(PRESETS).map(([k, p]) => [k, p.label]), 'coffee', (k) => {
    PRESETS[k].u.forEach((val, i) => { u[i] = val; });
    draw();
  }, '预设');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, presets.el));

  const svg = makeSvg(W, H, '三杯咖啡的分数和“喝不喝得出”');
  plot.append(svg);
  const X = (val) => 40 + (val / U_MAX) * (W - 80);
  X.invert = (px) => ((px - 40) / (W - 80)) * U_MAX;

  // Number line with ticks every 0.5 and a ruler showing one noticeable step.
  s('line', { x1: X(0), y1: LINE_Y, x2: X(U_MAX), y2: LINE_Y, stroke: C.ink2, 'stroke-width': 1.2 }, svg);
  for (let t = 0; t <= U_MAX + 1e-9; t += 0.5) {
    const major = Number.isInteger(t);
    s('line', { x1: X(t), y1: LINE_Y, x2: X(t), y2: LINE_Y + (major ? 6 : 4), stroke: C.ink2, 'stroke-width': 1 }, svg);
    if (major) s('text', { x: X(t), y: LINE_Y + 20, 'text-anchor': 'middle', class: 'w-tick' }, svg).textContent = String(t);
  }
  s('text', { x: X(U_MAX), y: LINE_Y + 38, 'text-anchor': 'end', class: 'w-small', fill: C.ink2 }, svg).textContent = '分数 u（越甜越高）';
  s('path', { d: `M${X(0)},${LINE_Y + 30} v5 H${X(1)} v-5`, fill: 'none', stroke: C.muted, 'stroke-width': 1.2 }, svg);
  s('text', { x: X(0.5), y: LINE_Y + 50, 'text-anchor': 'middle', class: 'w-small', style: `fill:${C.muted}` }, svg).textContent = '相差 1 = 刚好能察觉';

  const arcLayer = s('g', {}, svg);
  const handles = NAMES.map((name, i) => {
    const g = s('g', { 'aria-label': `咖啡 ${name} 的分数：用左右方向键调整` }, svg);
    s('circle', { r: 18, fill: 'transparent' }, g);
    s('circle', { r: 8, fill: COLORS[i], stroke: '#fff', 'stroke-width': 2 }, g);
    const label = s('text', { y: -14, 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 17, fill: COLORS[i], class: 'w-var' }, g);
    label.textContent = name;
    draggable(svg, g, (pt) => {
      u[i] = Math.round(clamp(X.invert(pt.x), 0, U_MAX) * 20) / 20;
      presets.set(null);
      draw();
    });
    return { g };
  });

  side.append(h('p', { class: 'w-note', style: 'margin:0 0 8px', html: `左右拖动三个点，改变三杯咖啡的分数。分数相差不到 1，就喝不出区别，记作 ${v('a')} ∼ ${v('b')}；相差 1 或更多，才喝得出，例如 ${v('c')} ≻ ${v('a')}。` }));
  const scores = h('p', { style: 'margin:0 0 6px' });
  const tableWrap = h('div', { class: 'w-table-wrap' });
  side.append(scores, tableWrap);
  const status = statusPanel();
  side.append(status.el);

  const PAIRS = [[0, 1], [1, 2], [0, 2]];

  function relation(i, j) {
    const d = Math.abs(u[i] - u[j]);
    if (!noticed(d)) return { d, same: true, text: `${v(NAMES[i])} ∼ ${v(NAMES[j])}` };
    const [hi, lo] = u[i] > u[j] ? [i, j] : [j, i];
    return { d, same: false, text: `${v(NAMES[hi])} ≻ ${v(NAMES[lo])}` };
  }

  // Labels of neighbouring arcs sit at the same height when the cups are close; lift any label that
  // would overlap one already placed.
  function separate(labels) {
    const placed = [];
    for (const t of labels) {
      const x = Number(t.getAttribute('x'));
      const w = t.getComputedTextLength();
      let y = Number(t.getAttribute('y'));
      while (y > 14 && placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 6 && Math.abs(p.y - y) < 15)) y -= 16;
      t.setAttribute('y', y);
      placed.push({ x, y, w });
    }
  }

  function drawArcs() {
    arcLayer.replaceChildren();
    const labels = [];
    for (const [i, j] of PAIRS) {
      const r = relation(i, j);
      const x1 = X(u[i]);
      const x2 = X(u[j]);
      const base = LINE_Y - 34;
      const lift = Math.min(18 + Math.abs(x2 - x1) * 0.36, base - 26);
      const mx = (x1 + x2) / 2;
      const color = r.same ? C.teal : C.red;
      s('path', {
        d: `M${x1},${base} Q${mx},${base - 2 * lift} ${x2},${base}`,
        fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': r.same ? '5 4' : null,
      }, arcLayer);
      const t = s('text', {
        x: mx, y: base - lift - 6, 'text-anchor': 'middle', class: 'w-small',
        style: `fill:${color}; paint-order:stroke; stroke:#fffefb; stroke-width:4px`,
      }, arcLayer);
      t.textContent = `差 ${num(r.d)}：${r.same ? '喝不出' : '喝得出'}`;
      labels.push(t);
    }
    separate(labels);
  }

  function intransitiveTriple() {
    for (const p of [0, 1, 2]) {
      for (const q of [0, 1, 2]) {
        for (const r of [0, 1, 2]) {
          if (p === q || q === r || p === r) continue;
          if (relation(p, q).same && relation(q, r).same && !relation(p, r).same) return [p, q, r];
        }
      }
    }
    return null;
  }

  function draw() {
    handles.forEach(({ g }, i) => g.setAttribute('transform', `translate(${X(u[i])},${LINE_Y})`));
    scores.innerHTML = `分数：${NAMES.map((name, i) => `<span style="color:${COLORS[i]}">${v(name)} = ${num(u[i])}</span>`).join('，')}`;
    drawArcs();
    const rows = PAIRS.map(([i, j]) => {
      const r = relation(i, j);
      return `<tr><td>${v(NAMES[i])} 和 ${v(NAMES[j])}</td><td>${num(r.d)}${r.same ? ' &lt; 1' : ' ≥ 1'}</td><td class="${r.same ? 'is-yes' : 'is-no'}">${r.text}</td></tr>`;
    }).join('');
    tableWrap.innerHTML = `<table class="w-table"><tr><th>比较</th><th>分数差</th><th>结果</th></tr>${rows}</table>`;

    const bad = intransitiveTriple();
    if (bad) {
      const [p, q, r] = bad;
      const end = relation(p, r);
      status.set(`<p><span class="w-bad">“一样好”不传递。</span>${v(NAMES[p])} ∼ ${v(NAMES[q])}，${v(NAMES[q])} ∼ ${v(NAMES[r])}，可是 ${v(NAMES[p])} 和 ${v(NAMES[r])} 差了 ${num(end.d)}，喝得出来：${end.text}。</p>
<p>理性偏好要求“一样好”能接力：${v(NAMES[p])} 和 ${v(NAMES[q])} 一样好、${v(NAMES[q])} 和 ${v(NAMES[r])} 一样好，${v(NAMES[p])} 就该和 ${v(NAMES[r])} 一样好。每一步的小差别都察觉不到，攒起来就察觉到了。</p>`, 'bad');
      return;
    }
    const allSame = PAIRS.every(([i, j]) => relation(i, j).same);
    if (allSame) {
      status.set(`<p>三杯两两都喝不出区别，暂时没有矛盾。</p><p>把 ${v('c')} 往右拖，让它和 ${v('a')} 相差 1 以上，但和 ${v('b')} 相差不到 1，看看会发生什么。</p>`, 'info');
      return;
    }
    status.set(`<p><span class="w-ok">这一组没有矛盾。</span>喝得出的差别（≻）总是能接力：${v('a')} 比 ${v('b')} 高至少 1、${v('b')} 比 ${v('c')} 高至少 1，${v('a')} 就比 ${v('c')} 高至少 2。</p><p>出问题的只会是“喝不出”（∼）。试试把中间那杯放在另两杯之间，和两边都相差不到 1。</p>`, 'ok');
  }

  draw();
}
