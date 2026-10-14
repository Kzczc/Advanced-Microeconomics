// assumption-predictions: the more we assume about preferences, the fewer bundles the theory
// allows (page 18). Budget: 10 yuan, apples and bananas 1 yuan each.
import {
  C, s, h, makeSvg, plotFrame, draggable, handlePoint, segmented, slider, statusPanel, skeleton, fmt, clamp, pathD, isNarrow,
} from './_shared.js';

const M = 10;
const ON_LINE = 0.25;

const LEVELS = [
  ['a', '（a）只假设理性'],
  ['b', '（b）再加单调、局部非饱和'],
  ['c', '（c）再加严格凸'],
];

const num = (x) => fmt(x, 1).replace(/\.0$/, '');

export function mount(stage, opts = {}) {
  const narrow = isNarrow(stage);
  const W = narrow ? 420 : 560;
  const H = narrow ? 400 : 420;
  let level = ['a', 'b', 'c'].includes(opts.level) ? opts.level : 'a';
  let alpha = 0.5;
  let obs = { x: 3, y: 4 };
  const { root, plot, side } = skeleton(stage);
  const seg = segmented(LEVELS, level, (k) => { level = k; draw(); }, '假设');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, seg.el));

  const svg = makeSvg(W, H, '预算集里哪些组合可能被选');
  plot.append(svg);
  const { X, Y, back, mid, front } = plotFrame(svg, {
    W, H, x: [0, 11], y: [0, 11], xlabel: 'x_1 苹果', ylabel: 'x_2 香蕉', xticks: [0, 2, 4, 6, 8, 10], yticks: [2, 4, 6, 8, 10],
  });
  const triangle = s('polygon', { points: `${X(0)},${Y(0)} ${X(M)},${Y(0)} ${X(0)},${Y(M)}`, stroke: 'none' }, back);
  const budget = s('line', { x1: X(0), y1: Y(M), x2: X(M), y2: Y(0), stroke: C.navy }, mid);
  const curve = s('path', { fill: 'none', stroke: C.purple, 'stroke-width': 2 }, mid);
  const best = s('circle', { r: 7, fill: C.navy, stroke: '#fff', 'stroke-width': 2 }, mid);
  const bestLabel = s('text', { class: 'w-small', style: `fill:${C.navy}`, 'font-weight': 700 }, mid);
  const regionLabel = s('text', { class: 'w-small', 'font-weight': 700 }, mid);

  const point = handlePoint(svg, front, { color: C.red, label: '观察到的选择' });
  point.g.setAttribute('aria-label', '观察到的选择：用方向键移动');
  draggable(svg, point.g, (pt) => {
    obs = { x: clamp(X.invert(pt.x), 0, 11), y: clamp(Y.invert(pt.y), 0, 11) };
    draw();
  });

  const alphaSlider = slider({
    label: '这个人有多爱苹果 α', min: 0.1, max: 0.9, step: 0.05, value: alpha, format: (val) => fmt(val, 2),
    onInput: (val) => { alpha = val; draw(); },
  });
  const alphaNote = h('p', { class: 'w-note', style: 'margin:0 0 8px', html: '图中这个人的效用是 <i class="w-var">u</i> = <i class="w-var">x</i><sub>1</sub><sup>α</sup><i class="w-var">x</i><sub>2</sub><sup>1−α</sup>（严格凸）。α 越大越爱苹果。' });
  side.append(
    h('p', { class: 'w-note', style: 'margin:0 0 8px', html: '有 10 元，苹果、香蕉各 1 元。切换上面三档假设，看理论允许的范围怎么缩小；拖动红点，看每档假设能不能解释这个观察。' }),
    alphaSlider.el, alphaNote,
  );
  const status = statusPanel();
  side.append(status.el);

  function drawLevel() {
    const fill = { a: C.fillBlue, b: C.fillGray, c: C.fillGray }[level];
    triangle.setAttribute('fill', fill);
    triangle.setAttribute('opacity', level === 'a' ? 0.9 : 0.6);
    budget.setAttribute('stroke-width', level === 'b' ? 5 : 2.2);
    budget.setAttribute('stroke', level === 'a' ? C.ink2 : C.navy);
    const showC = level === 'c';
    for (const el of [curve, best, bestLabel]) el.style.display = showC ? '' : 'none';
    alphaSlider.el.style.display = showC ? '' : 'none';
    alphaNote.style.display = showC ? '' : 'none';
    const text = { a: '可能被选：整个三角形', b: '可能被选：只有预算线', c: '对这个人：只有一个点' }[level];
    regionLabel.textContent = text;
    regionLabel.setAttribute('style', `fill:${level === 'a' ? C.blue : C.navy}`);
    regionLabel.setAttribute('x', X(level === 'a' ? 1.2 : 5.6));
    regionLabel.setAttribute('y', Y(level === 'a' ? 2.2 : 6.2));
    if (!showC) return;
    const bx = M * alpha;
    const by = M * (1 - alpha);
    const ub = bx ** alpha * by ** (1 - alpha);
    const pts = [];
    for (let i = 1; i <= 400; i += 1) {
      const x1 = (11 * i) / 400;
      const x2 = (ub / x1 ** alpha) ** (1 / (1 - alpha));
      if (x2 <= 11) pts.push([X(x1), Y(x2)]);
    }
    curve.setAttribute('d', pathD(pts));
    best.setAttribute('cx', X(bx));
    best.setAttribute('cy', Y(by));
    bestLabel.textContent = `唯一最优点 (${num(bx)}, ${num(by)})`;
    const onRight = bx > 6;
    bestLabel.setAttribute('text-anchor', onRight ? 'end' : 'start');
    bestLabel.setAttribute('x', X(bx) + (onRight ? -10 : 10));
    bestLabel.setAttribute('y', Y(by) - 10);
  }

  function explain() {
    const spend = obs.x + obs.y;
    const left = M - spend;
    const where = `（${num(obs.x)} 个苹果、${num(obs.y)} 根香蕉，花 ${num(spend)} 元）`;
    if (spend > M + ON_LINE) {
      status.set(`<p><span class="w-bad">买不起。</span>这个组合${where}超出了 10 元，不在预算集里，任何理论都不会预测它。</p>`, 'bad');
      return;
    }
    if (level === 'a') {
      status.set(`<p><span class="w-ok">能解释。</span>只假设理性（完备、传递），总能找到一个人，觉得${where}刚刚好、再多就撑了。</p>
<p>可是预算集里的任何一点也都能这样解释：理论没有排除任何结果，也就什么都没预测。</p>`, 'ok');
      return;
    }
    if (left > ON_LINE) {
      status.set(`<p><span class="w-bad">不能解释。</span>这个组合${where}还剩 ${num(left)} 元。多一点总有好处、永远不会完全满足的人（单调、局部非饱和），一定会把剩下的钱花掉。</p>
<p>理论预测“不会剩钱”，观察到剩钱，就<b>否定</b>了这组假设。假设越多，能被数据否定的机会越多。</p>`, 'bad');
      return;
    }
    if (level === 'b') {
      status.set(`<p><span class="w-ok">能解释。</span>钱花光了，落在预算线上。</p><p>不过预算线上的每一点都还可能：这组假设只排除了“剩钱”的组合，没说会选线上的哪一点。</p>`, 'ok');
      return;
    }
    const bx = M * alpha;
    if (Math.abs(obs.x - bx) <= 0.3) {
      status.set(`<p><span class="w-ok">能解释，而且正好是这个人的唯一最优点。</span>无差异曲线和预算线在这里相切。</p><p>严格凸保证：同一个人在这份预算下只会选这一个点。</p>`, 'ok');
      return;
    }
    const need = obs.x / M;
    const advice = need > 0.9 ? '需要一个几乎只爱苹果的人' : need < 0.1 ? '需要一个几乎只爱香蕉的人' : `把 α 调到 ${fmt(need, 2)} 左右，这个组合就成了唯一最优点`;
    status.set(`<p><span class="w-ok">能解释，</span>但不是图中这个人（α = ${fmt(alpha, 2)}）的选择：他唯一的最优点是 (${num(bx)}, ${num(M - bx)})。</p>
<p>${advice}。每个人的最优点只有一个，不同的人可以不同。</p>`, 'info');
  }

  function draw() {
    drawLevel();
    point.move(X(obs.x), Y(obs.y), 10, -12);
    explain();
  }

  draw();
}
