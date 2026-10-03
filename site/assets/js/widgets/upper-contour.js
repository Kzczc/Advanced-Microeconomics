// upper-contour: shade U_α = {x : f(x) ≥ α} and test whether the segment
// between two points of U_α stays inside (pages 19–20).
import {
  C, s, h, makeSvg, plotFrame, handlePoint, draggable, selectBox, slider, statusPanel, skeleton, fmt, clamp, pathD,
} from './_shared.js';

const W = 520;
const H = 440;
const MAX = 5;

// g(x1) = smallest x2 ≥ 0 with f(x1, x2) ≥ α (every f below is increasing in x2).
const FUNCS = {
  prod: {
    label: 'f = x₁·x₂', name: '<i class="w-var">x</i><sub>1</sub><i class="w-var">x</i><sub>2</sub>',
    f: (a, b) => a * b, g: (x1, al) => (x1 <= 0 ? Infinity : al / x1),
    range: [0.5, 12, 0.1], alpha: 4, P: [1, 4.5], Q: [4.5, 1], qc: true,
  },
  sqrt: {
    label: 'f = √x₁ + √x₂', name: '√<i class="w-var">x</i><sub>1</sub> + √<i class="w-var">x</i><sub>2</sub>',
    f: (a, b) => Math.sqrt(a) + Math.sqrt(b), g: (x1, al) => (Math.sqrt(x1) >= al ? 0 : (al - Math.sqrt(x1)) ** 2),
    range: [0.4, 3.6, 0.05], alpha: 2, P: [0.3, 3.6], Q: [3.6, 0.3], qc: true,
  },
  min: {
    label: 'f = min{x₁, x₂}', name: 'min{<i class="w-var">x</i><sub>1</sub>, <i class="w-var">x</i><sub>2</sub>}',
    f: (a, b) => Math.min(a, b), g: (x1, al) => (x1 >= al ? al : Infinity),
    range: [0.2, 4.5, 0.05], alpha: 1.5, P: [1.8, 4.3], Q: [4.3, 1.8], qc: true,
  },
  sq: {
    label: 'f = x₁² + x₂²（反例）', name: '<i class="w-var">x</i><sub>1</sub><sup>2</sup> + <i class="w-var">x</i><sub>2</sub><sup>2</sup>',
    f: (a, b) => a * a + b * b, g: (x1, al) => (x1 * x1 >= al ? 0 : Math.sqrt(al - x1 * x1)),
    range: [1, 30, 0.5], alpha: 9, P: [0.4, 3.3], Q: [3.3, 0.4], qc: false,
  },
};

export function mount(stage, opts = {}) {
  let fk = FUNCS[opts.f] ? opts.f : 'prod';
  let alpha = FUNCS[fk].alpha;
  const P = [...FUNCS[fk].P];
  const Q = [...FUNCS[fk].Q];
  const { plot, side } = skeleton(stage);
  const svg = makeSvg(W, H, '上等高集与线段检验');
  plot.append(svg);
  const { X, Y, back, mid, front } = plotFrame(svg, {
    W, H, x: [0, MAX], y: [0, MAX], xlabel: 'x_1', ylabel: 'x_2', xticks: [1, 2, 3, 4, 5], yticks: [1, 2, 3, 4, 5],
  });
  const area = s('path', { fill: C.fillBlue, stroke: 'none', opacity: 0.9 }, back);
  back.insertBefore(area, back.firstChild);
  const boundary = s('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2 }, mid);
  const label = s('text', { 'text-anchor': 'end', class: 'w-small' }, mid);
  const seg = s('g', {}, mid);
  const worst = s('circle', { r: 5, fill: C.red, stroke: '#fff', 'stroke-width': 1.5 }, mid);
  const hp = handlePoint(svg, front, { color: C.navy, label: 'P' });
  const hq = handlePoint(svg, front, { color: C.teal, label: 'Q' });
  const toData = (pt) => [clamp(X.invert(pt.x), 0.02, MAX - 0.02), clamp(Y.invert(pt.y), 0.02, MAX - 0.02)];
  draggable(svg, hp.g, (pt) => { [P[0], P[1]] = toData(pt); draw(); });
  draggable(svg, hq.g, (pt) => { [Q[0], Q[1]] = toData(pt); draw(); });

  const sel = selectBox('函数：', Object.entries(FUNCS).map(([k, f]) => [k, f.label]), fk, (k) => {
    fk = k;
    const F = FUNCS[k];
    alpha = F.alpha;
    [P[0], P[1]] = F.P;
    [Q[0], Q[1]] = F.Q;
    sl.setRange(F.range[0], F.range[1], F.range[2]);
    sl.set(alpha);
    draw();
  });
  const sl = slider({
    label: 'α =', min: FUNCS[fk].range[0], max: FUNCS[fk].range[1], step: FUNCS[fk].range[2], value: alpha,
    onInput: (v) => { alpha = v; draw(); },
  });
  const demo = h('button', { type: 'button', class: 'w-btn is-preset', text: '演示反例（x₁² + x₂²）' });
  demo.addEventListener('click', () => { sel.set('sq'); sel.sel.dispatchEvent(new Event('change')); });
  side.append(h('div', { class: 'w-controls' }, sel.el), sl.el, h('div', { class: 'w-controls' }, demo));
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '浅蓝阴影是 <i class="w-var">U</i><sub>α</sub>：函数值至少为 α 的点。把 P、Q 拖进阴影里，看它们的连线有没有跑出去。' }));
  const status = statusPanel();
  side.append(status.el);

  function draw() {
    const F = FUNCS[fk];
    // Region {x2 ≥ g(x1)} inside the square.
    const N = 360;
    const lower = [];
    for (let i = 0; i <= N; i += 1) {
      const x1 = (MAX * i) / N;
      lower.push([x1, Math.min(MAX, Math.max(0, F.g(x1, alpha)))]);
    }
    const poly = [...lower, [MAX, MAX], [0, MAX]];
    area.setAttribute('d', `${pathD(poly.map(([a, b]) => [X(a), Y(b)]))}Z`);
    boundary.setAttribute('d', pathD(lower.filter(([, b]) => b < MAX - 1e-6).map(([a, b]) => [X(a), Y(b)])));
    label.setAttribute('x', X(MAX) - 6);
    label.setAttribute('y', Y(MAX) + 16);
    label.textContent = `深蓝线：f(x) = α = ${fmt(alpha)}`;

    hp.move(X(P[0]), Y(P[1]));
    hq.move(X(Q[0]), Y(Q[1]));
    const fP = F.f(...P);
    const fQ = F.f(...Q);

    // Sample the segment and colour the parts outside U_α in red.
    seg.replaceChildren();
    const M = 200;
    let minF = Infinity;
    let minPt = P;
    let run = null;
    const flush = () => {
      if (run && run.pts.length > 1) {
        s('path', {
          d: pathD(run.pts), fill: 'none', stroke: run.inside ? C.navy : C.red,
          'stroke-width': run.inside ? 2.6 : 3.6, 'stroke-linecap': 'round',
        }, seg);
      }
    };
    for (let i = 0; i <= M; i += 1) {
      const t = i / M;
      const pt = [P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])];
      const fv = F.f(...pt);
      if (fv < minF) { minF = fv; minPt = pt; }
      const inside = fv >= alpha - 1e-9;
      const scr = [X(pt[0]), Y(pt[1])];
      if (!run || run.inside !== inside) {
        flush();
        run = { inside, pts: run ? [run.pts[run.pts.length - 1], scr] : [scr] };
      } else run.pts.push(scr);
    }
    flush();
    worst.setAttribute('cx', X(minPt[0]));
    worst.setAttribute('cy', Y(minPt[1]));

    const inP = fP >= alpha - 1e-9;
    const inQ = fQ >= alpha - 1e-9;
    const vals = `<i class="w-var">f</i>(P) = ${fmt(fP)}，<i class="w-var">f</i>(Q) = ${fmt(fQ)}，α = ${fmt(alpha)}。`;
    worst.style.display = inP && inQ ? '' : 'none';
    if (!inP || !inQ) {
      status.set(`<p>${vals}</p><p>${!inP ? 'P' : 'Q'} 不在阴影里（函数值小于 α）。先把 P、Q 都拖进浅蓝阴影 <i class="w-var">U</i><sub>α</sub>，再看它们的连线。</p>`, 'info');
      return;
    }
    if (minF >= alpha - 1e-9) {
      status.set(`<p>${vals}</p>
<p><span class="w-ok">整条线段都留在 <i class="w-var">U</i><sub>α</sub> 里</span>：线段上函数值最小的地方（小红点）也有 ${fmt(minF)} ≥ α。</p>
<p>${F.qc
    ? `对 <i class="w-var">f</i> = ${F.name}，不管你怎么换 α、怎么放 P 和 Q，线段都不会跑出去：它的每一个上等高集都是<b>凸集</b>，所以它是<b>拟凹函数</b>。换句话说：两个“够好”的组合混合以后，仍然“够好”。`
    : '这一次碰巧没跑出去。把 P、Q 分别放到靠近两条坐标轴的地方，或者点“演示反例”，再看看。'}</p>`, 'ok');
    } else {
      status.set(`<p>${vals}</p>
<p><span class="w-bad">线段有一段跑出了 <i class="w-var">U</i><sub>α</sub></span>（红色部分）：P、Q 都在阴影里，可它们中间的点（小红点）函数值只有 ${fmt(minF)} &lt; α。</p>
<p>所以这个上等高集<b>不是凸集</b>（它像是被挖掉了一个四分之一圆），<i class="w-var">f</i> = ${F.name} <b>不是拟凹函数</b>。对应到偏好：两个“够好”的组合混合以后反而变差了，这种偏好不是凸偏好。</p>`, 'bad');
    }
  }

  draw();
}
