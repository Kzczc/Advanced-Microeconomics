// convex-mix: the convex combination t·x + (1 − t)·x′ of two baskets, and the
// segment test for convex sets (basics/convexity).
import {
  C, s, h, uid, makeSvg, plotFrame, handlePoint, draggable, selectBox, slider, statusPanel, skeleton, fmt, clamp, pathD,
} from './_shared.js';

const W = 440;
const H = 440;
const MAX = 8;
const BIG = { cx: 4, cy: 4, r: 3.3 };
const BITE = { cx: 5.3, cy: 5.3, r: 2.4 };
const TRI = [[0.8, 0.8], [7.6, 1.2], [1.2, 7.6]];
const ELL = [[1, 1], [7.5, 1], [7.5, 3.5], [3.5, 3.5], [3.5, 7.5], [1, 7.5]];

const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const inDisc = (p, d) => (p[0] - d.cx) ** 2 + (p[1] - d.cy) ** 2 <= d.r ** 2;

const SHAPES = {
  none: { label: '不画集合', convex: null, inside: () => true },
  triangle: {
    label: '三角形（凸集）', convex: true,
    inside: (p) => [0, 1, 2].every((i) => cross(TRI[i], TRI[(i + 1) % 3], p) >= 0),
  },
  disc: { label: '圆盘（凸集）', convex: true, inside: (p) => inDisc(p, BIG) },
  crescent: { label: '月牙（不是凸集）', convex: false, inside: (p) => inDisc(p, BIG) && !inDisc(p, BITE) },
  lshape: {
    label: 'L 形（不是凸集）', convex: false,
    inside: (p) => (p[0] >= 1 && p[0] <= 3.5 && p[1] >= 1 && p[1] <= 7.5) || (p[0] >= 1 && p[0] <= 7.5 && p[1] >= 1 && p[1] <= 3.5),
  },
};

const pt = (p) => `(${fmt(p[0])}, ${fmt(p[1])})`;

export function mount(stage, opts = {}) {
  let shape = SHAPES[opts.shape] ? opts.shape : 'none';
  let t = Number.isFinite(opts.t) ? clamp(opts.t, 0, 1) : 0.3;
  const P = [2, 6];
  const Q = [6, 2];
  const { plot, side } = skeleton(stage);
  const svg = makeSvg(W, H, '凸组合与凸集');
  plot.append(svg);
  const { X, Y, back, mid, front } = plotFrame(svg, {
    W, H, x: [0, MAX], y: [0, MAX], xlabel: 'x_1', ylabel: 'x_2', xticks: [2, 4, 6, 8], yticks: [2, 4, 6, 8], grid: true,
  });
  const k = (X(1) - X(0));

  // Shapes (all drawn once, shown one at a time).
  const shapeLayer = s('g', {});
  back.insertBefore(shapeLayer, back.firstChild);
  const style = { fill: C.fillBlue, stroke: C.navy, 'stroke-width': 1.6 };
  const polyD = (pts) => `${pathD(pts.map(([a, b]) => [X(a), Y(b)]))}Z`;
  const nodes = {
    triangle: s('path', { d: polyD(TRI), ...style }, shapeLayer),
    disc: s('circle', { cx: X(BIG.cx), cy: Y(BIG.cy), r: BIG.r * k, ...style }, shapeLayer),
    lshape: s('path', { d: polyD(ELL), ...style }, shapeLayer),
  };
  const defs = s('defs', {}, svg);
  const maskId = uid('bite');
  const mask = s('mask', { id: maskId }, defs);
  s('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, mask);
  s('circle', { cx: X(BITE.cx), cy: Y(BITE.cy), r: BITE.r * k, fill: '#000' }, mask);
  const clipId = uid('big');
  s('circle', { cx: X(BIG.cx), cy: Y(BIG.cy), r: BIG.r * k }, s('clipPath', { id: clipId }, defs));
  nodes.crescent = s('g', {}, shapeLayer);
  s('circle', { cx: X(BIG.cx), cy: Y(BIG.cy), r: BIG.r * k, ...style, mask: `url(#${maskId})` }, nodes.crescent);
  s('circle', { cx: X(BITE.cx), cy: Y(BITE.cy), r: BITE.r * k, fill: 'none', stroke: C.navy, 'stroke-width': 1.6, 'clip-path': `url(#${clipId})` }, nodes.crescent);

  const seg = s('g', {}, mid);
  const ticks = s('g', {}, mid);
  const mixDot = s('circle', { r: 6.5, fill: C.orange, stroke: '#fff', 'stroke-width': 2 }, front);
  const mixLabel = s('text', { class: 'w-point-label', fill: C.orange }, front);
  const hp = handlePoint(svg, front, { color: C.navy, label: 'x' });
  const hq = handlePoint(svg, front, { color: C.teal, label: 'x′' });
  const toData = (p) => [clamp(X.invert(p.x), 0.1, MAX - 0.1), clamp(Y.invert(p.y), 0.1, MAX - 0.1)];
  draggable(svg, hp.g, (p) => { [P[0], P[1]] = toData(p); draw(); });
  draggable(svg, hq.g, (p) => { [Q[0], Q[1]] = toData(p); draw(); });

  const sel = selectBox('集合：', Object.entries(SHAPES).map(([key, v]) => [key, v.label]), shape, (key) => {
    shape = key;
    P.splice(0, 2, 2, 6);
    Q.splice(0, 2, 6, 2);
    draw();
  });
  const ts = slider({ label: '<i class="w-var">t</i> =', min: 0, max: 1, step: 0.01, value: t, onInput: (v) => { t = v; draw(); } });
  const calc = h('p', { class: 'w-note', style: 'margin:0;color:inherit' });
  side.append(h('div', { class: 'w-controls' }, sel.el), ts.el, calc);
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '拖动 <i class="w-var">x</i>、<i class="w-var">x</i>′ 两个篮子，拖滑块改 <i class="w-var">t</i>。橙色点是混合篮子 <i class="w-var">t</i><i class="w-var">x</i> + (1 − <i class="w-var">t</i>)<i class="w-var">x</i>′。' }));
  const status = statusPanel();
  side.append(status.el);

  function draw() {
    const S = SHAPES[shape];
    for (const [key, node] of Object.entries(nodes)) node.style.display = key === shape ? '' : 'none';
    const M = [t * P[0] + (1 - t) * Q[0], t * P[1] + (1 - t) * Q[1]];

    // Segment, red where it leaves the set.
    seg.replaceChildren();
    const steps = 240;
    let run = null;
    let leaves = false;
    const flush = () => {
      if (run && run.pts.length > 1) {
        s('path', { d: pathD(run.pts), fill: 'none', stroke: run.ok ? C.ink2 : C.red, 'stroke-width': run.ok ? 2 : 3.4, 'stroke-linecap': 'round' }, seg);
      }
    };
    for (let i = 0; i <= steps; i += 1) {
      const u = i / steps;
      const p = [u * P[0] + (1 - u) * Q[0], u * P[1] + (1 - u) * Q[1]];
      const ok = S.inside(p);
      if (!ok) leaves = true;
      const scr = [X(p[0]), Y(p[1])];
      if (!run || run.ok !== ok) {
        flush();
        run = { ok, pts: run ? [run.pts[run.pts.length - 1], scr] : [scr] };
      } else run.pts.push(scr);
    }
    flush();
    ticks.replaceChildren();
    for (const u of [0.25, 0.5, 0.75]) {
      s('circle', { cx: X(u * P[0] + (1 - u) * Q[0]), cy: Y(u * P[1] + (1 - u) * Q[1]), r: 2.6, fill: C.gray }, ticks);
    }

    hp.move(X(P[0]), Y(P[1]));
    hq.move(X(Q[0]), Y(Q[1]));
    mixDot.setAttribute('cx', X(M[0]));
    mixDot.setAttribute('cy', Y(M[1]));
    mixLabel.setAttribute('x', X(M[0]) + 10);
    mixLabel.setAttribute('y', Y(M[1]) + 18);
    mixLabel.textContent = `t = ${fmt(t)}`;

    const a = fmt(t);
    const b = fmt(1 - t);
    calc.innerHTML = `<b>逐项计算：</b>${a}×${pt(P)} + ${b}×${pt(Q)} = (${fmt(t * P[0])} + ${fmt((1 - t) * Q[0])}, ${fmt(t * P[1])} + ${fmt((1 - t) * Q[1])}) = <b>${pt(M)}</b>`;

    const inP = S.inside(P);
    const inQ = S.inside(Q);
    const mixIn = S.inside(M);
    let msg;
    let tone = 'info';
    if (S.convex === null) {
      msg = `<p><i class="w-var">t</i> = 1 时混合篮子就是 <i class="w-var">x</i>，<i class="w-var">t</i> = 0 时就是 <i class="w-var">x</i>′。<i class="w-var">t</i> 从 1 变到 0，橙色点沿着线段从 <i class="w-var">x</i> 走到 <i class="w-var">x</i>′；三个灰点是 <i class="w-var">t</i> = 0.25、0.5、0.75 的位置。</p><p><i class="w-var">t</i> 越大，混合篮子越像 <i class="w-var">x</i>：它到 <i class="w-var">x</i>′ 的距离正好是全长的 <i class="w-var">t</i> 倍。</p>`;
    } else if (!inP || !inQ) {
      msg = `<p>${!inP ? '<i class="w-var">x</i>' : '<i class="w-var">x</i>′'} 不在集合里。先把两个篮子都拖进浅蓝区域，再看它们的连线。</p>`;
    } else if (!leaves) {
      tone = 'ok';
      msg = `<p><span class="w-ok">整条线段都留在集合里</span>，混合篮子 ${pt(M)} 也在里面。</p><p>${S.convex
        ? '这是凸集：不管把两个篮子放在里面哪里、<i class="w-var">t</i> 取多少，混合都跑不出去。'
        : '这一次碰巧没跑出去。把两个篮子分别放到缺口的两边（比如回到默认位置），再看看。'}</p>`;
    } else {
      tone = 'bad';
      msg = `<p><span class="w-bad">线段有一段跑出了集合</span>（红色部分）。两个篮子都在集合里，它们之间的某些混合却不在。当前的混合篮子 ${pt(M)} ${mixIn ? '还在集合里，拖动 <i class="w-var">t</i> 让它走进红色部分' : '就在集合外面'}。</p><p>只要找到一对这样的点，就说明这个集合<b>不是凸集</b>。</p>`;
    }
    status.set(msg, tone);
    sel.set(shape);
    ts.set(t);
  }

  draw();
}
