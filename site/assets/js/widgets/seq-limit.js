// seq-limit: the ε-band picture of a limit (basics/sequences-continuity).
// Pick a sequence, set the band half-width ε and its centre L, and see from which
// index N on every term stays inside (L − ε, L + ε) — or why no such N exists.
import {
  C, s, h, makeSvg, plotFrame, handlePoint, draggable, segmented, slider, statusPanel, skeleton, fmt, clamp,
} from './_shared.js';

const W = 560;
const H = 360;
const NMAX = 40;

// For the three convergent sequences |x_n − limit| = 1/n, which makes N exact (see findN).
const SEQS = {
  inv: { label: '1/n', html: '1/<i class="w-var">n</i>', f: (n) => 1 / n, limit: 0, y: [-0.6, 1.2], yticks: [-0.5, 0.5, 1] },
  alt: { label: '(−1)ⁿ/n', html: '(−1)<sup><i class="w-var">n</i></sup>/<i class="w-var">n</i>', f: (n) => (n % 2 ? -1 : 1) / n, limit: 0, y: [-1.1, 0.8], yticks: [-1, -0.5, 0.5] },
  one: { label: '1 + 1/n', html: '1 + 1/<i class="w-var">n</i>', f: (n) => 1 + 1 / n, limit: 1, y: [-0.4, 2.2], yticks: [1, 2] },
  pm: { label: '(−1)ⁿ', html: '(−1)<sup><i class="w-var">n</i></sup>', f: (n) => (n % 2 ? -1 : 1), limit: null, y: [-1.7, 1.7], yticks: [-1, 1] },
};

function findN(seq, L, eps) {
  if (seq.limit === null) {
    return Math.abs(1 - L) < eps && Math.abs(-1 - L) < eps ? 1 : null;
  }
  const d = Math.abs(seq.limit - L);
  if (d >= eps) return null;
  // Beyond nSafe every term is within ε − d of the limit, hence within ε of L.
  const nSafe = Math.floor(1 / (eps - d)) + 1;
  let last = 0;
  for (let n = 1; n <= nSafe; n += 1) if (Math.abs(seq.f(n) - L) >= eps) last = n;
  return last + 1;
}

export function mount(stage, opts = {}) {
  let key = SEQS[opts.seq] ? opts.seq : 'inv';
  let eps = 0.25;
  let L = SEQS[key].limit ?? 0;
  const { root, plot, side } = skeleton(stage);

  const seg = segmented(Object.entries(SEQS).map(([k, q]) => [k, q.html]), key, (k) => {
    key = k;
    L = SEQS[k].limit ?? 0;
    build();
  }, '选择序列');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, seg.el));

  const epsSlider = slider({ label: 'ε =', min: 0.03, max: 1.2, step: 0.01, value: eps, onInput: (v) => { eps = v; draw(); } });
  const lSlider = slider({ label: '带子中心 <i class="w-var">L</i> =', min: -1, max: 1, step: 0.01, value: L, onInput: (v) => { L = v; draw(); } });
  const snap = h('button', { type: 'button', class: 'w-btn is-preset', text: '把中心放到极限上' });
  snap.addEventListener('click', () => {
    if (SEQS[key].limit === null) return;
    L = SEQS[key].limit;
    draw();
  });
  side.append(epsSlider.el, lSlider.el, h('div', { class: 'w-controls' }, snap));
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '浅色带子是 (<i class="w-var">L</i> − ε, <i class="w-var">L</i> + ε)。绿点在带子里，红点在带子外。也可以直接拖动带子右端的圆点来移动中心。' }));
  const status = statusPanel();
  side.append(status.el);

  let svg;
  let X;
  let Y;
  let bandLayer;
  let layer;
  let handle;

  function build() {
    const q = SEQS[key];
    plot.replaceChildren();
    svg = makeSvg(W, H, '序列与 ε 带子');
    plot.append(svg);
    const frame = plotFrame(svg, {
      W, H, x: [0, NMAX + 1], y: q.y, xlabel: 'n', ylabel: 'x_n', xticks: [1, 10, 20, 30, 40], yticks: q.yticks,
    });
    ({ X, Y } = frame);
    bandLayer = s('g', {});
    frame.back.insertBefore(bandLayer, frame.back.firstChild);
    layer = s('g', {}, frame.mid);
    handle = handlePoint(svg, frame.front, { color: C.orange, label: 'L', r: 6 });
    draggable(svg, handle.g, (pt) => { L = clamp(Y.invert(pt.y), q.y[0] + 0.1, q.y[1] - 0.1); draw(); });
    lSlider.setRange(q.y[0] + 0.1, q.y[1] - 0.1, 0.01);
    snap.disabled = q.limit === null;
    seg.set(key);
    draw();
  }

  function draw() {
    const q = SEQS[key];
    L = clamp(L, q.y[0] + 0.1, q.y[1] - 0.1);
    epsSlider.set(eps);
    lSlider.set(L);
    layer.replaceChildren();
    bandLayer.replaceChildren();
    const top = clamp(L + eps, q.y[0], q.y[1]);
    const bottom = clamp(L - eps, q.y[0], q.y[1]);
    s('rect', { x: X(0), y: Y(top), width: X(NMAX + 1) - X(0), height: Y(bottom) - Y(top), fill: C.fillOrange, opacity: 0.75 }, bandLayer);
    s('line', { x1: X(0), y1: Y(L), x2: X(NMAX + 1), y2: Y(L), stroke: C.orange, 'stroke-width': 1.2, 'stroke-dasharray': '6 4' }, bandLayer);
    if (q.limit !== null && Math.abs(q.limit - L) > 1e-9) {
      s('line', { x1: X(0), y1: Y(q.limit), x2: X(NMAX + 1), y2: Y(q.limit), stroke: C.gray, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, bandLayer);
      s('text', { x: X(NMAX + 1) - 2, y: Y(q.limit) - 5, 'text-anchor': 'end', class: 'w-small', fill: C.gray }, bandLayer).textContent = `极限 ${fmt(q.limit, 0)}`;
    }

    const N = findN(q, L, eps);
    if (N !== null && N <= NMAX) {
      s('line', { x1: X(N), y1: Y(q.y[0]), x2: X(N), y2: Y(q.y[1]), stroke: C.teal, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, layer);
      s('text', { x: X(N) + 4, y: Y(q.y[1]) + 14, class: 'w-small', fill: C.teal }, layer).textContent = `N = ${N}`;
    }
    for (let n = 1; n <= NMAX; n += 1) {
      const v = q.f(n);
      const inside = Math.abs(v - L) < eps;
      s('circle', { cx: X(n), cy: Y(v), r: 3.6, fill: inside ? C.teal : C.red, stroke: '#fff', 'stroke-width': 1 }, layer);
    }
    handle.move(X(NMAX + 1) - 8, Y(L), -16, -10);

    const band = `(${fmt(L - eps)}, ${fmt(L + eps)})`;
    const lim = q.limit === null ? null : fmt(q.limit, 0);
    let msg;
    let tone;
    if (q.limit === null) {
      if (N !== null) {
        msg = `<p>带子 ${band} 宽到能同时装下 −1 和 1，所以从第 1 项起都在里面。</p><p>但收敛要求<b>任意小</b>的 ε 都能找到 <i class="w-var">N</i>。把 ε 拖到 1 以下，就再也找不到了。</p>`;
        tone = 'info';
      } else {
        msg = `<p><span class="w-bad">找不到 <i class="w-var">N</i>。</span>−1 和 1 交替出现，相差 2；带子只有 2ε = ${fmt(2 * eps)} 宽${2 * eps < 2 ? '，不可能同时装下两者' : '，可它没对准两者'}。不管从第几项起，后面总有点跑出带子。</p><p>不管把中心 <i class="w-var">L</i> 放在哪里都一样，所以 ${q.html} <b>发散</b>，不收敛到任何数。</p>`;
        tone = 'bad';
      }
    } else if (N === null) {
      const d = Math.abs(q.limit - L);
      msg = `<p><span class="w-bad">找不到 <i class="w-var">N</i>。</span>后面的点越来越靠近 ${lim}，而 ${lim} 离带子中心 ${fmt(d)}，不小于 ε = ${fmt(eps)}，在带子外面（或边上），后面的点迟早都跑出带子。</p><p>所以序列不收敛到 <i class="w-var">L</i> = ${fmt(L)}。点“把中心放到极限上”试试。</p>`;
      tone = 'bad';
    } else if (Math.abs(q.limit - L) < 0.005) {
      const where = N <= NMAX ? `图上绿色竖线` : `第 ${N} 项，已超出图的范围`;
      msg = `<p><span class="w-ok">从第 ${N} 项起，所有点都在带子 ${band} 里</span>（${where}）。即只要 <i class="w-var">n</i> ≥ ${N}，就有 |<i class="w-var">x<sub>n</sub></i> − ${lim}| &lt; ${fmt(eps)}。</p><p>把 ε 拖小：<i class="w-var">N</i> 会往后移，但总找得到。“不管 ε 多小都找得到 <i class="w-var">N</i>”，这就是 ${q.html} 收敛到 ${lim}。</p>`;
      tone = 'ok';
    } else {
      const d = Math.abs(q.limit - L);
      msg = `<p>这一次从第 ${N} 项起都在带子里，但带子中心 ${fmt(L)} 不是极限 ${lim}。</p><p>把 ε 拖到 ${fmt(d)} 以下，就找不到 <i class="w-var">N</i> 了。收敛要求<b>任意小</b>的 ε 都行，所以序列不收敛到 ${fmt(L)}，只收敛到 ${lim}。</p>`;
      tone = 'info';
    }
    status.set(msg, tone);
  }

  build();
}
