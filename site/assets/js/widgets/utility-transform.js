// utility-transform: an increasing transformation v(u) keeps the ranking,
// a decreasing one reverses it (pages 14, 16). Drag the bars to change u.
import {
  C, s, h, makeSvg, linear, selectBox, statusPanel, skeleton, fmt, clamp, svgPoint,
} from './_shared.js';

const NAMES = ['A', 'B', 'C', 'D'];
const COLORS = [C.navy, C.teal, C.orange, C.purple];
const TRANSFORMS = {
  id: { label: 'v(t) = t（不变换）', short: 'v(t) = t', f: (t) => t, inc: true },
  lin: { label: 'v(t) = 2t + 1', short: 'v(t) = 2t + 1', f: (t) => 2 * t + 1, inc: true },
  cube: { label: 'v(t) = t³', short: 'v(t) = t³', f: (t) => t ** 3, inc: true },
  exp: { label: 'v(t) = eᵗ', short: 'v(t) = eᵗ', f: (t) => Math.exp(t), inc: true },
  neg: { label: 'v(t) = −t（递减！）', short: 'v(t) = −t', f: (t) => -t, inc: false },
};

const W = 600;
const H = 300;
const TOP = 42;
const BOTTOM = H - 44;

export function mount(stage) {
  const u = [2.4, 0.6, 1.6, 1.1];
  let tk = 'lin';
  const { plot, side } = skeleton(stage);
  const svg = makeSvg(W, H, '变换前后的效用柱状图');
  plot.append(svg);
  plot.append(h('p', { class: 'w-note', style: 'margin:6px 0 0', text: '上下拖动左图的柱子，可以改变原来的效用值。' }));

  const panels = [
    { x0: 40, x1: 280, title: '原来的效用 u' },
    { x0: 340, x1: 580, title: '变换后的效用 v(u)' },
  ].map((p) => {
    const g = s('g', {}, svg);
    s('text', { x: (p.x0 + p.x1) / 2, y: 20, 'text-anchor': 'middle', 'font-weight': 700 }, g).textContent = p.title;
    const zero = s('line', { x1: p.x0, x2: p.x1, stroke: C.ink2, 'stroke-width': 1 }, g);
    const bw = (p.x1 - p.x0) / 4;
    const bars = NAMES.map((name, i) => {
      const x = p.x0 + i * bw + bw * 0.18;
      const w = bw * 0.64;
      const rect = s('rect', { x, width: w, rx: 3, fill: COLORS[i], opacity: 0.88 }, g);
      const val = s('text', { x: x + w / 2, 'text-anchor': 'middle', class: 'w-small' }, g);
      s('text', { x: x + w / 2, y: BOTTOM + 18, 'text-anchor': 'middle', 'font-weight': 700 }, g).textContent = name;
      return { rect, val, x, w };
    });
    const order = s('text', { x: (p.x0 + p.x1) / 2, y: H - 6, 'text-anchor': 'middle', class: 'w-small' }, g);
    return { ...p, zero, bars, order };
  });

  // Left panel has a fixed scale so dragging feels stable.
  const YL = linear(0, 3.3, BOTTOM, TOP);
  panels[0].bars.forEach((b, i) => {
    b.rect.classList.add('w-handle');
    b.rect.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.rect.setPointerCapture(e.pointerId);
      let frame = 0;
      let last = null;
      const move = (ev) => {
        last = svgPoint(svg, ev);
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; u[i] = clamp(YL.invert(last.y), 0.1, 3); draw(); });
      };
      const up = () => {
        b.rect.removeEventListener('pointermove', move);
        b.rect.removeEventListener('pointerup', up);
        b.rect.removeEventListener('pointercancel', up);
      };
      b.rect.addEventListener('pointermove', move);
      b.rect.addEventListener('pointerup', up);
      b.rect.addEventListener('pointercancel', up);
    });
  });

  const sel = selectBox('选择变换', Object.entries(TRANSFORMS).map(([k, t]) => [k, t.label]), tk, (k) => { tk = k; draw(); });
  side.append(h('div', { class: 'w-controls' }, sel.el));
  const status = statusPanel();
  side.append(status.el);

  function orderText(vals) {
    const idx = [0, 1, 2, 3].sort((a, b) => vals[b] - vals[a]);
    let str = NAMES[idx[0]];
    for (let i = 1; i < 4; i += 1) {
      str += Math.abs(vals[idx[i]] - vals[idx[i - 1]]) < 1e-9 ? ` ∼ ${NAMES[idx[i]]}` : ` ≻ ${NAMES[idx[i]]}`;
    }
    return str;
  }

  function paint(p, vals, Y) {
    p.zero.setAttribute('y1', Y(0));
    p.zero.setAttribute('y2', Y(0));
    vals.forEach((val, i) => {
      const b = p.bars[i];
      const y0 = Y(0);
      const y1 = Y(val);
      b.rect.setAttribute('y', Math.min(y0, y1));
      b.rect.setAttribute('height', Math.max(1, Math.abs(y1 - y0)));
      b.val.setAttribute('y', val >= 0 ? y1 - 6 : y1 + 15);
      b.val.textContent = fmt(val, Math.abs(val) >= 10 ? 1 : 2);
    });
    p.order.textContent = `排序：${orderText(vals)}`;
  }

  function draw() {
    const T = TRANSFORMS[tk];
    const v = u.map(T.f);
    paint(panels[0], u, YL);
    const lo = Math.min(0, ...v);
    const hi = Math.max(0, ...v);
    const span = hi - lo || 1;
    paint(panels[1], v, linear(lo - (lo < 0 ? span * 0.08 : 0), hi + span * 0.12, BOTTOM, TOP));
    if (T.inc) {
      status.set(`<p><b>${T.short}</b> 是递增函数：分数大的，变换后还是大。</p>
<p>每个选项的分数都变了（例如 A：${fmt(u[0])} → ${fmt(v[0])}），但<span class="w-ok">排序没变</span>：${orderText(v)}。</p>
<p>所以 <i class="w-var">v</i>(<i class="w-var">u</i>(·)) 和 <i class="w-var">u</i> 表示<b>同一个偏好</b>。效用的具体数值没有意义，有意义的只是排序。</p>`, 'ok');
    } else {
      status.set(`<p><b>v(t) = −t</b> 是递减函数：原来分数最高的，现在最低。</p>
<p><span class="w-bad">排序完全颠倒了</span>：原来 ${orderText(u)}，现在 ${orderText(v)}。</p>
<p>所以 −<i class="w-var">u</i> 表示的是一个<b>相反的偏好</b>。只有<b>递增</b>变换才能保持偏好不变。</p>`, 'bad');
    }
  }

  draw();
}
