// quasilinear: u(a, y) = a + v(y) with v(y) = 4√y (page 22).
// Indifference curves are vertical shifts of each other; adding the same
// amount of money t to both options never changes their ranking.
import {
  C, s, h, makeSvg, plotFrame, handlePoint, draggable, slider, statusPanel, skeleton, fmt, clamp, pathD,
} from './_shared.js';

const W = 540;
const H = 440;
const YMAX = 10;
const AMAX = 24;
const v = (y) => 4 * Math.sqrt(Math.max(0, y));

export function mount(stage) {
  const P = [2, 7];
  const Q = [7, 3];
  let t = 0;
  const { plot, side } = skeleton(stage);
  const svg = makeSvg(W, H, '拟线性偏好的无差异曲线');
  plot.append(svg);
  const { X, Y, mid, front } = plotFrame(svg, {
    W, H, x: [0, YMAX], y: [0, AMAX], xlabel: 'y（非货币商品）', ylabel: 'a（钱）',
    xticks: [2, 4, 6, 8, 10], yticks: [5, 10, 15, 20],
  });
  // Background family of indifference curves a = k − 4√y.
  const family = s('g', {}, mid);
  for (let k = 4; k <= 36; k += 4) {
    const pts = [];
    for (let i = 0; i <= 80; i += 1) {
      const y = (YMAX * i) / 80;
      const a = k - v(y);
      if (a >= 0 && a <= AMAX) pts.push([X(y), Y(a)]);
    }
    if (pts.length > 1) s('path', { d: pathD(pts), fill: 'none', stroke: C.gray, 'stroke-width': 1, opacity: 0.35 }, family);
  }
  const curveP = s('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2.2 }, mid);
  const curveQ = s('path', { fill: 'none', stroke: C.teal, 'stroke-width': 2.2 }, mid);
  const ghosts = s('g', {}, mid);
  const ghostP = s('circle', { r: 5, fill: 'none', stroke: C.navy, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }, ghosts);
  const ghostQ = s('circle', { r: 5, fill: 'none', stroke: C.teal, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }, ghosts);
  const shiftP = s('line', { stroke: C.navy, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, ghosts);
  const shiftQ = s('line', { stroke: C.teal, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, ghosts);
  const hp = handlePoint(svg, front, { color: C.navy, label: 'P' });
  const hq = handlePoint(svg, front, { color: C.teal, label: 'Q' });
  const toData = (pt) => [clamp(X.invert(pt.x), 0, YMAX), clamp(Y.invert(pt.y) - t, 0, AMAX - Math.max(0, t))];
  draggable(svg, hp.g, (pt) => { [P[0], P[1]] = toData(pt); draw(); });
  draggable(svg, hq.g, (pt) => { [Q[0], Q[1]] = toData(pt); draw(); });

  const ts = slider({
    label: '给两人都多给 <i class="w-var">t</i> 元：<i class="w-var">t</i> =', min: -3, max: 8, step: 0.5, value: t,
    format: (val) => (val > 0 ? `+${fmt(val, 1)}` : fmt(val, 1)), onInput: (val) => { t = val; draw(); },
  });
  side.append(ts.el);
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '拖动 P、Q 设定两个选项（横轴是商品 <i class="w-var">y</i> 的数量，纵轴是钱 <i class="w-var">a</i>）；再拖滑块，给两个选项加上同样多的钱。效用 <i class="w-var">u</i> = <i class="w-var">a</i> + 4√<i class="w-var">y</i>。' }));
  const status = statusPanel();
  side.append(status.el);

  const curveD = (k) => {
    const pts = [];
    for (let i = 0; i <= 120; i += 1) {
      const y = (YMAX * i) / 120;
      const a = k - v(y);
      if (a >= -0.01 && a <= AMAX) pts.push([X(y), Y(a)]);
    }
    return pathD(pts);
  };

  function draw() {
    const aP = P[1] + t;
    const aQ = Q[1] + t;
    const uP = aP + v(P[0]);
    const uQ = aQ + v(Q[0]);
    curveP.setAttribute('d', curveD(uP));
    curveQ.setAttribute('d', curveD(uQ));
    hp.move(X(P[0]), Y(clamp(aP, 0, AMAX)));
    hq.move(X(Q[0]), Y(clamp(aQ, 0, AMAX)));
    const showGhost = Math.abs(t) > 1e-9;
    ghosts.style.display = showGhost ? '' : 'none';
    ghostP.setAttribute('cx', X(P[0])); ghostP.setAttribute('cy', Y(P[1]));
    ghostQ.setAttribute('cx', X(Q[0])); ghostQ.setAttribute('cy', Y(Q[1]));
    shiftP.setAttribute('x1', X(P[0])); shiftP.setAttribute('x2', X(P[0])); shiftP.setAttribute('y1', Y(P[1])); shiftP.setAttribute('y2', Y(clamp(aP, 0, AMAX)));
    shiftQ.setAttribute('x1', X(Q[0])); shiftQ.setAttribute('x2', X(Q[0])); shiftQ.setAttribute('y1', Y(Q[1])); shiftQ.setAttribute('y2', Y(clamp(aQ, 0, AMAX)));

    const u0P = P[1] + v(P[0]);
    const u0Q = Q[1] + v(Q[0]);
    const rank = (a, b) => (Math.abs(a - b) < 0.005 ? 'P ∼ Q' : (a > b ? 'P ≻ Q' : 'Q ≻ P'));
    const neg = aP < 0 || aQ < 0;
    const after = Math.abs(t) < 1e-9
      ? '<p><b>现在还没加钱。</b>拖动上面的滑块，给 P 和 Q 都加（或减）同样多的钱，看排序会不会变。</p>'
      : `<p><b>两个选项都${t > 0 ? '多给' : '少给'} ${fmt(Math.abs(t), 1)} 元之后：</b><i class="w-var">u</i>(P) = ${fmt(uP)}，<i class="w-var">u</i>(Q) = ${fmt(uQ)}——两个效用都正好变了 ${fmt(t, 1)}，差距仍是 ${fmt(Math.abs(uP - uQ))}，排序仍是 <span class="w-ok">${rank(uP, uQ)}</span>。</p>`;
    status.set(`<p><b>加钱之前：</b><i class="w-var">u</i>(P) = ${fmt(P[1], 1)} + 4√${fmt(P[0], 1)} = ${fmt(u0P)}，<i class="w-var">u</i>(Q) = ${fmt(Q[1], 1)} + 4√${fmt(Q[0], 1)} = ${fmt(u0Q)}，所以 ${rank(u0P, u0Q)}。</p>
${after}
<p>原因：<i class="w-var">u</i> = <i class="w-var">a</i> + <i class="w-var">v</i>(<i class="w-var">y</i>) 里，钱 <i class="w-var">a</i> 是“单独加上去”的。不管手里本来有多少钱，你愿意为多一点 <i class="w-var">y</i> 付出的钱都一样多——这就是<b>没有财富效应</b>。图上看：所有无差异曲线都是同一条曲线上下平移得到的。</p>
${neg ? '<p class="w-note">注意：t 是负数且太大时，钱会变成负数。课件的设定里钱 a ≥ 0，这里只是为了演示算术。</p>' : ''}`, 'ok');
  }

  draw();
}
