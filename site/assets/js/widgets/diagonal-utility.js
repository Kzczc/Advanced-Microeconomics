// diagonal-utility: the construction behind Proposition 4 (page 16).
// Follow the indifference curve through x down to the 45° line; where it
// crosses at (α, α), set u(x) = α(x).
import {
  C, s, h, makeSvg, plotFrame, handlePoint, draggable, selectBox, statusPanel, skeleton, fmt, clamp, pathD, mathText,
} from './_shared.js';

const W = 520;
const H = 440;
const MAX = 10;

const PREFS = {
  cd: {
    label: 'u = √(x₁x₂)（柯布–道格拉斯）',
    alpha: ([a, b]) => Math.sqrt(a * b),
    curve: (al) => {
      const pts = [];
      const k = al * al;
      if (k <= 0) return [[0, MAX], [0, 0], [MAX, 0]];
      const start = Math.max(k / MAX, 0.02);
      for (let i = 0; i <= 120; i += 1) {
        const x1 = start * (MAX / start) ** (i / 120);
        pts.push([x1, k / x1]);
      }
      return pts;
    },
  },
  sub: {
    label: 'u = x₁ + x₂（完全替代）',
    alpha: ([a, b]) => (a + b) / 2,
    // The line x1 + x2 = 2α, clipped to the visible square.
    curve: (al) => {
      const sum = 2 * al;
      return sum <= MAX ? [[0, sum], [sum, 0]] : [[sum - MAX, MAX], [MAX, sum - MAX]];
    },
  },
  min: {
    label: 'u = min{x₁, x₂}（完全互补）',
    alpha: ([a, b]) => Math.min(a, b),
    curve: (al) => [[al, MAX], [al, al], [MAX, al]],
  },
};

export function mount(stage) {
  let pk = 'cd';
  const P = [2, 7];
  const Q = [6.5, 3];
  const { plot, side } = skeleton(stage);
  const svg = makeSvg(W, H, '用 45° 线给偏好打分');
  plot.append(svg);
  const { X, Y, mid, front } = plotFrame(svg, {
    W, H, x: [0, MAX], y: [0, MAX], xlabel: 'x_1', ylabel: 'x_2', xticks: [2, 4, 6, 8, 10], yticks: [2, 4, 6, 8, 10], grid: true,
  });
  s('line', { x1: X(0), y1: Y(0), x2: X(MAX), y2: Y(MAX), stroke: C.gray, 'stroke-width': 1.2, 'stroke-dasharray': '7 5' }, mid);
  s('text', { x: X(9.6), y: Y(9.95), 'text-anchor': 'end', class: 'w-small' }, mid).textContent = '45° 线：x₁ = x₂';

  const curveQ = s('path', { fill: 'none', stroke: C.teal, 'stroke-width': 1.6, opacity: 0.7 }, mid);
  const curveP = s('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2.2 }, mid);
  const guide = s('path', { fill: 'none', stroke: C.orange, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, mid);
  const hitP = s('circle', { r: 7, fill: '#fff', stroke: C.orange, 'stroke-width': 2.6 }, mid);
  const hitQ = s('circle', { r: 5, fill: '#fff', stroke: C.teal, 'stroke-width': 2 }, mid);
  const hitLabel = s('text', { fill: C.orange, 'font-weight': 700 }, mid);
  const alphaTick = s('text', { fill: C.orange, 'text-anchor': 'middle', 'font-weight': 700 }, mid);

  const hp = handlePoint(svg, front, { color: C.navy, label: 'x' });
  const hq = handlePoint(svg, front, { color: C.teal, label: 'y' });
  const toData = (pt) => [clamp(X.invert(pt.x), 0.2, MAX - 0.2), clamp(Y.invert(pt.y), 0.2, MAX - 0.2)];
  draggable(svg, hp.g, (pt) => { [P[0], P[1]] = toData(pt); draw(); });
  draggable(svg, hq.g, (pt) => { [Q[0], Q[1]] = toData(pt); draw(); });

  const sel = selectBox('偏好：', Object.entries(PREFS).map(([k, p]) => [k, p.label]), pk, (k) => { pk = k; draw(); });
  side.append(h('div', { class: 'w-controls' }, sel.el));
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '拖动深蓝点 <i class="w-var">x</i> 和青色点 <i class="w-var">y</i>。橙色圈是 <i class="w-var">x</i> 的无差异曲线与 45° 线的交点 (α, α)。' }));
  const status = statusPanel();
  side.append(status.el);

  function draw() {
    const pref = PREFS[pk];
    const aP = pref.alpha(P);
    const aQ = pref.alpha(Q);
    const clip = (pts) => pts.filter(([a, b]) => a >= -1e-9 && b >= -1e-9 && a <= MAX + 1e-9 && b <= MAX + 1e-9);
    curveP.setAttribute('d', pathD(clip(pref.curve(aP)).map(([a, b]) => [X(a), Y(b)])));
    curveQ.setAttribute('d', pathD(clip(pref.curve(aQ)).map(([a, b]) => [X(a), Y(b)])));
    hp.move(X(P[0]), Y(P[1]));
    hq.move(X(Q[0]), Y(Q[1]));
    const inBox = aP <= MAX;
    hitP.setAttribute('cx', X(Math.min(aP, MAX)));
    hitP.setAttribute('cy', Y(Math.min(aP, MAX)));
    hitP.style.display = inBox ? '' : 'none';
    hitQ.setAttribute('cx', X(Math.min(aQ, MAX)));
    hitQ.setAttribute('cy', Y(Math.min(aQ, MAX)));
    hitQ.style.display = aQ <= MAX ? '' : 'none';
    guide.setAttribute('d', inBox ? `M${X(aP)},${Y(aP)}L${X(aP)},${Y(0)}` : '');
    hitLabel.setAttribute('x', X(aP) + 10);
    hitLabel.setAttribute('y', Y(aP) + 18);
    hitLabel.textContent = inBox ? `(α, α) = (${fmt(aP)}, ${fmt(aP)})` : '';
    alphaTick.setAttribute('x', X(aP));
    alphaTick.setAttribute('y', Y(0) - 6);
    mathText(alphaTick, inBox ? 'α' : '');

    const verdict = Math.abs(aP - aQ) < 0.005
      ? '<i class="w-var">x</i> ∼ <i class="w-var">y</i>（打分一样）'
      : (aP > aQ ? '<i class="w-var">x</i> ≻ <i class="w-var">y</i>（<i class="w-var">x</i> 的分数更高）' : '<i class="w-var">y</i> ≻ <i class="w-var">x</i>（<i class="w-var">y</i> 的分数更高）');
    status.set(`<p><i class="w-var">x</i> = (${fmt(P[0])}, ${fmt(P[1])})。沿着经过 <i class="w-var">x</i> 的无差异曲线（深蓝线）走到 45° 线上，交点是 (${fmt(aP)}, ${fmt(aP)})，也就是 α(<i class="w-var">x</i>)<i class="w-var">e</i>。</p>
<p>于是给 <i class="w-var">x</i> 打分 <b><i class="w-var">u</i>(<i class="w-var">x</i>) = α(<i class="w-var">x</i>) = ${fmt(aP)}</b>：<i class="w-var">x</i> 和“每样东西都是 ${fmt(aP)} 个”的组合一样好。</p>
<p>同样，<i class="w-var">u</i>(<i class="w-var">y</i>) = α(<i class="w-var">y</i>) = ${fmt(aQ)}。比较分数就是比较偏好：${verdict}。</p>
<p class="w-note">换一种偏好试试：曲线形状变了，但“滑到 45° 线上读出 α”的办法始终有效——这正是命题 4 的证明思路。</p>`, 'info');
  }

  draw();
}
