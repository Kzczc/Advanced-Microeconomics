// lexi-continuity: lexicographic preferences violate continuity (page 15).
// Mode 1: x_n = (1/n, 0) ≻ y = (0, 1) for every n, but the limit (0,0) ≺ y.
// Mode 2: drag P and Q and compare them lexicographically.
import {
  C, s, h, makeSvg, plotFrame, handlePoint, draggable, segmented, slider, statusPanel, skeleton, fmt, clamp,
  mathText,
} from './_shared.js';

const W = 520;
const H = 400;

function lexCompare(p, q) {
  const eps = 1e-9;
  if (p[0] > q[0] + eps) return 1;
  if (p[0] < q[0] - eps) return -1;
  if (p[1] > q[1] + eps) return 1;
  if (p[1] < q[1] - eps) return -1;
  return 0;
}

export function mount(stage) {
  const { root, plot, side } = skeleton(stage);
  const modes = segmented([['seq', '序列 x_n 与连续性'.replace('x_n', '<i class="w-var">x</i><sub>n</sub>')], ['cmp', '字典序比较器']], 'seq', (m) => show(m), '模式');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, modes.el));

  const svg = makeSvg(W, H, '平面上的点与字典序');
  plot.append(svg);
  const { X, Y, mid, front } = plotFrame(svg, {
    W, H, x: [-0.08, 1.2], y: [-0.08, 1.2], xlabel: 'x_1（第一个分量）', ylabel: 'x_2（第二个分量）',
    xticks: [0, 0.5, 1], yticks: [0.5, 1],
  });

  // ---- sequence layer ----
  const seq = s('g', {}, mid);
  const seqDots = s('g', {}, seq);
  const yPt = s('g', {}, seq);
  s('circle', { cx: X(0), cy: Y(1), r: 7, fill: C.orange, stroke: '#fff', 'stroke-width': 2 }, yPt);
  s('text', { x: X(0) + 12, y: Y(1) - 8, fill: C.orange, 'font-weight': 700 }, yPt).textContent = 'y = (0, 1)';
  const limit = s('g', {}, seq);
  s('circle', { cx: X(0), cy: Y(0), r: 7, fill: '#fff', stroke: C.red, 'stroke-width': 2.4 }, limit);
  s('text', { x: X(0) + 10, y: Y(0) + 22, fill: C.red, 'font-weight': 700 }, limit).textContent = '极限 (0, 0)';
  const cur = s('g', {}, seq);
  const curDot = s('circle', { r: 7.5, fill: C.navy, stroke: '#fff', 'stroke-width': 2 }, cur);
  const curLab = s('text', { fill: C.navy, 'font-weight': 700, 'text-anchor': 'middle' }, cur);
  let n = 3;
  const ns = slider({ label: '序列的第 <i class="w-var">n</i> 项：<i class="w-var">n</i> =', min: 1, max: 50, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; drawSeq(); } });

  // ---- comparator layer ----
  const cmp = s('g', {}, mid);
  const upper = s('g', {}, cmp);
  const P = [0.4, 0.7];
  const Q = [0.4, 0.3];
  const hp = handlePoint(svg, front, { color: C.navy, label: 'P' });
  const hq = handlePoint(svg, front, { color: C.teal, label: 'Q' });
  const toData = (pt) => [clamp(X.invert(pt.x), 0, 1.15), clamp(Y.invert(pt.y), 0, 1.15)];
  draggable(svg, hp.g, (pt) => { [P[0], P[1]] = toData(pt); drawCmp(); });
  draggable(svg, hq.g, (pt) => { [Q[0], Q[1]] = toData(pt); drawCmp(); });
  const snap = h('label', { class: 'w-check' }, h('input', { type: 'checkbox', checked: true }), h('span', { text: '拖动时第一分量对齐到 0.05 的格点（方便做出“第一分量相等”）' }));
  const snapBox = snap.querySelector('input');

  const controls = h('div', { class: 'w-controls' });
  side.append(controls);
  const status = statusPanel();
  side.append(status.el);

  function drawSeq() {
    seqDots.replaceChildren();
    for (let k = 1; k <= Math.min(n, 50); k += 1) {
      s('circle', { cx: X(1 / k), cy: Y(0), r: k === n ? 0 : 3.2, fill: C.blue, opacity: 0.45 }, seqDots);
    }
    const x = 1 / n;
    curDot.setAttribute('cx', X(x));
    curDot.setAttribute('cy', Y(0));
    curLab.setAttribute('x', X(x));
    curLab.setAttribute('y', Y(0) - 14);
    mathText(curLab, `x_{${n}} = (${fmt(x, 3)}, 0)`);
    status.set(`<p><b>每一项都比 <i class="w-var">y</i> 好：</b><i class="w-var">x</i><sub>${n}</sub> = (1/${n}, 0) = (${fmt(x, 3)}, 0)。和 <i class="w-var">y</i> = (0, 1) 比第一个分量：${fmt(x, 3)} &gt; 0，字典序下第一个分量大的直接胜出，所以 <i class="w-var">x</i><sub>${n}</sub> ≻ <i class="w-var">y</i>。不管 <i class="w-var">n</i> 多大都是这样。</p>
<p><b>但极限比 <i class="w-var">y</i> 差：</b><i class="w-var">n</i> 越来越大时 <i class="w-var">x</i><sub>n</sub> → (0, 0)。(0, 0) 和 (0, 1) 的第一个分量相等，再比第二个分量：0 &lt; 1，所以 (0, 0) ≺ <i class="w-var">y</i>。</p>
<p><span class="w-bad">连续性被打破：</span>连续性要求“每一项都 ⪰ <i class="w-var">y</i>，极限也要 ⪰ <i class="w-var">y</i>”。这里每一项都比 <i class="w-var">y</i> 好，到了极限却突然变差了——偏好在极限处“跳”了一下。</p>`, 'bad');
  }

  function drawCmp() {
    if (snapBox.checked) { P[0] = Math.round(P[0] / 0.05) * 0.05; Q[0] = Math.round(Q[0] / 0.05) * 0.05; }
    hp.move(X(P[0]), Y(P[1]));
    hq.move(X(Q[0]), Y(Q[1]));
    // Upper contour set of P: {x1 > p1}  ∪  {x1 = p1, x2 ≥ p2}
    upper.replaceChildren();
    s('rect', { x: X(P[0]), y: Y(1.2), width: X(1.2) - X(P[0]), height: Y(-0.08) - Y(1.2), fill: C.fillBlue, opacity: 0.75 }, upper);
    s('line', { x1: X(P[0]), y1: Y(-0.08), x2: X(P[0]), y2: Y(1.2), stroke: C.navy, 'stroke-width': 1, 'stroke-dasharray': '5 4' }, upper);
    s('line', { x1: X(P[0]), y1: Y(P[1]), x2: X(P[0]), y2: Y(1.2), stroke: C.navy, 'stroke-width': 4 }, upper);
    s('text', { x: X(1.17), y: Y(1.13), 'text-anchor': 'end', class: 'w-small' }, upper).textContent = '浅蓝区域 + 粗竖线：比 P 好或和 P 一样好的点';
    const c = lexCompare(P, Q);
    const p = `(${fmt(P[0])}, ${fmt(P[1])})`;
    const q = `(${fmt(Q[0])}, ${fmt(Q[1])})`;
    let text;
    if (Math.abs(P[0] - Q[0]) > 1e-9) {
      const big = P[0] > Q[0] ? 'P' : 'Q';
      text = `第一个分量不同：${fmt(P[0])} ${P[0] > Q[0] ? '&gt;' : '&lt;'} ${fmt(Q[0])}，所以 <b>${big} 更好</b>，第二个分量根本不用看。`;
    } else if (c !== 0) {
      text = `第一个分量相等（都是 ${fmt(P[0])}），再比第二个分量：${fmt(P[1])} ${P[1] > Q[1] ? '&gt;' : '&lt;'} ${fmt(Q[1])}，所以 <b>${c > 0 ? 'P' : 'Q'} 更好</b>。`;
    } else {
      text = '两个分量都相等：P 和 Q 是同一个点。字典序下只有“同一个点”才是无差异的。';
    }
    status.set(`<p>P = ${p}，Q = ${q}。${text}</p>
<p class="w-note">看浅蓝区域：比 P 好的点，是 P 右边的整片区域，加上 P 正上方那一段竖线；P 正下方那一段竖线不算。这个集合缺了一条边，不是“闭”的——这就是字典序偏好不连续的根源，也是它画不出无差异曲线的原因（每条“无差异曲线”只剩一个点）。</p>`, 'info');
  }

  function show(mode) {
    seq.style.display = mode === 'seq' ? '' : 'none';
    cmp.style.display = mode === 'cmp' ? '' : 'none';
    hp.g.style.display = mode === 'cmp' ? '' : 'none';
    hq.g.style.display = mode === 'cmp' ? '' : 'none';
    controls.replaceChildren(mode === 'seq' ? ns.el : snap);
    if (mode === 'seq') drawSeq(); else drawCmp();
  }
  snapBox.addEventListener('change', drawCmp);
  show('seq');
}
