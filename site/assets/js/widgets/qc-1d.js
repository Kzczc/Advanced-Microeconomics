// qc-1d: one-variable picture of quasi-concavity (page 20).
// Compare f(λx + (1−λ)y) with min{f(x), f(y)} (quasi-concavity) and with
// λf(x) + (1−λ)f(y) (concavity).
import {
  C, s, h, makeSvg, plotFrame, draggable, segmented, slider, statusPanel, skeleton, fmt, clamp, pathD,
} from './_shared.js';

const W = 560;
const H = 380;

const FUNCS = {
  bell: { label: '钟形', f: (x) => Math.exp(-((x - 5) ** 2) / 4), x: 1.2, y: 5.6, lam: 0.5 },
  sqrt: { label: '√x（凹）', f: (x) => Math.sqrt(Math.max(0, x)) / Math.sqrt(10), x: 1, y: 8, lam: 0.5 },
  twin: { label: '双峰（反例）', f: (x) => 0.9 * Math.exp(-((x - 2.5) ** 2) / 1.2) + Math.exp(-((x - 7.5) ** 2) / 1.2), x: 2.5, y: 7.5, lam: 0.5 },
};
const FORMULA = {
  bell: '<i class="w-var">f</i>(<i class="w-var">x</i>) = e<sup>−(<i class="w-var">x</i>−5)²/4</sup>',
  sqrt: '<i class="w-var">f</i>(<i class="w-var">x</i>) = √<i class="w-var">x</i> / √10',
  twin: '两个小山包叠在一起',
};

export function mount(stage) {
  let fk = 'bell';
  let xv = FUNCS[fk].x;
  let yv = FUNCS[fk].y;
  let lam = FUNCS[fk].lam;
  const { root, plot, side } = skeleton(stage);
  const seg = segmented(Object.entries(FUNCS).map(([k, f]) => [k, f.label]), fk, (k) => {
    fk = k; xv = FUNCS[k].x; yv = FUNCS[k].y; lam = FUNCS[k].lam; ls.set(lam); draw();
  }, '函数');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, seg.el));

  const svg = makeSvg(W, H, '一元函数的拟凹性');
  plot.append(svg);
  const { X, Y, mid, front } = plotFrame(svg, {
    W, H, x: [0, 10], y: [0, 1.15], xlabel: 'x', ylabel: 'f(x)', xticks: [0, 2, 4, 6, 8, 10], yticks: [0.5, 1],
  });
  const curve = s('path', { fill: 'none', stroke: C.navy, 'stroke-width': 2.4 }, mid);
  const chord = s('line', { stroke: C.purple, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, mid);
  const minLine = s('line', { stroke: C.orange, 'stroke-width': 1.6, 'stroke-dasharray': '7 4' }, mid);
  const minLab = s('text', { fill: C.orange, class: 'w-small', 'text-anchor': 'end' }, mid);
  const vz = s('line', { stroke: C.gray, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, mid);
  const ptChord = s('circle', { r: 4.5, fill: '#fff', stroke: C.purple, 'stroke-width': 2 }, mid);
  const ptZ = s('circle', { r: 6.5, stroke: '#fff', 'stroke-width': 2 }, mid);
  const zLab = s('text', { 'text-anchor': 'middle', 'font-weight': 700 }, mid);

  function handle(color, name) {
    const g = s('g', {}, front);
    s('line', { y1: 0, y2: 0, stroke: color, 'stroke-width': 1, 'stroke-dasharray': '3 3', class: 'w-drop' }, g);
    s('circle', { r: 18, fill: 'transparent' }, g);
    s('circle', { r: 6.5, fill: color, stroke: '#fff', 'stroke-width': 2 }, g);
    const t = s('text', { y: 24, 'text-anchor': 'middle', fill: color, 'font-weight': 700, class: 'w-var' }, g);
    t.textContent = name;
    return g;
  }
  const hx = handle(C.navy, 'x');
  const hy = handle(C.teal, 'y');
  draggable(svg, hx, (pt) => { xv = clamp(X.invert(pt.x), 0, 10); draw(); });
  draggable(svg, hy, (pt) => { yv = clamp(X.invert(pt.x), 0, 10); draw(); });

  const ls = slider({ label: 'λ =', min: 0, max: 1, step: 0.01, value: lam, onInput: (v) => { lam = v; draw(); } });
  side.append(ls.el);
  side.append(h('p', { class: 'w-note', style: 'margin:0', html: '左右拖动曲线上的两个点 <i class="w-var">x</i>、<i class="w-var">y</i>；λ 决定混合点 <i class="w-var">z</i> = λ<i class="w-var">x</i> + (1−λ)<i class="w-var">y</i> 落在两者之间的哪里。' }));
  const status = statusPanel();
  side.append(status.el);

  function draw() {
    const F = FUNCS[fk];
    const pts = [];
    for (let i = 0; i <= 300; i += 1) {
      const x = (10 * i) / 300;
      pts.push([X(x), Y(F.f(x))]);
    }
    curve.setAttribute('d', pathD(pts));
    const fx = F.f(xv);
    const fy = F.f(yv);
    const z = lam * xv + (1 - lam) * yv;
    const fz = F.f(z);
    const lo = Math.min(fx, fy);
    const ch = lam * fx + (1 - lam) * fy;
    hx.setAttribute('transform', `translate(${X(xv)},${Y(fx)})`);
    hy.setAttribute('transform', `translate(${X(yv)},${Y(fy)})`);
    hx.querySelector('.w-drop').setAttribute('y2', Y(0) - Y(fx));
    hy.querySelector('.w-drop').setAttribute('y2', Y(0) - Y(fy));
    chord.setAttribute('x1', X(xv)); chord.setAttribute('y1', Y(fx));
    chord.setAttribute('x2', X(yv)); chord.setAttribute('y2', Y(fy));
    minLine.setAttribute('x1', X(0)); minLine.setAttribute('x2', X(10));
    minLine.setAttribute('y1', Y(lo)); minLine.setAttribute('y2', Y(lo));
    minLab.setAttribute('x', X(10) - 4); minLab.setAttribute('y', Y(lo) - 6);
    minLab.textContent = `min{f(x), f(y)} = ${fmt(lo)}`;
    vz.setAttribute('x1', X(z)); vz.setAttribute('x2', X(z));
    vz.setAttribute('y1', Y(0)); vz.setAttribute('y2', Y(Math.max(fz, ch)));
    ptChord.setAttribute('cx', X(z)); ptChord.setAttribute('cy', Y(ch));
    const qcOk = fz >= lo - 1e-9;
    const cvOk = fz >= ch - 1e-9;
    ptZ.setAttribute('cx', X(z)); ptZ.setAttribute('cy', Y(fz));
    ptZ.setAttribute('fill', qcOk ? C.green : C.red);
    zLab.setAttribute('x', X(z)); zLab.setAttribute('y', Y(fz) - 12);
    zLab.setAttribute('fill', qcOk ? C.green : C.red);
    zLab.textContent = 'z';

    const qcLine = qcOk
      ? `<span class="w-ok">拟凹的要求成立：</span><i class="w-var">f</i>(<i class="w-var">z</i>) = ${fmt(fz)} ≥ min{<i class="w-var">f</i>(<i class="w-var">x</i>), <i class="w-var">f</i>(<i class="w-var">y</i>)} = ${fmt(lo)}（绿点不低于橙色虚线）。`
      : `<span class="w-bad">拟凹的要求不成立：</span><i class="w-var">f</i>(<i class="w-var">z</i>) = ${fmt(fz)} &lt; min{<i class="w-var">f</i>(<i class="w-var">x</i>), <i class="w-var">f</i>(<i class="w-var">y</i>)} = ${fmt(lo)}（红点掉到了橙色虚线下面）。混合以后比两个端点中较差的那个还差。`;
    const cvLine = cvOk
      ? `凹函数的要求（更强）也成立：<i class="w-var">f</i>(<i class="w-var">z</i>) ≥ λ<i class="w-var">f</i>(<i class="w-var">x</i>) + (1−λ)<i class="w-var">f</i>(<i class="w-var">y</i>) = ${fmt(ch)}（不低于紫色弦上的空心点）。`
      : `凹函数的要求（更强）这里不成立：<i class="w-var">f</i>(<i class="w-var">z</i>) = ${fmt(fz)} &lt; 紫色弦上的值 ${fmt(ch)}。`;
    let lesson = '';
    if (fk === 'bell') lesson = '钟形函数：把 <i class="w-var">x</i> 拖到左边山脚、<i class="w-var">y</i> 拖到山顶附近，凹的要求会失败，但拟凹的要求始终成立——它<b>拟凹但不凹</b>。';
    if (fk === 'sqrt') lesson = '√<i class="w-var">x</i> 是凹函数：怎么拖两个要求都成立。凹函数一定是拟凹函数。';
    if (fk === 'twin') lesson = '双峰：把 <i class="w-var">x</i>、<i class="w-var">y</i> 放在两个山顶，中间的山谷比两个山顶都低——<b>不是拟凹函数</b>。';
    status.set(`<p><i class="w-var">x</i> = ${fmt(xv)}，<i class="w-var">y</i> = ${fmt(yv)}，<i class="w-var">z</i> = λ<i class="w-var">x</i> + (1−λ)<i class="w-var">y</i> = ${fmt(z)}。${FORMULA[fk]}。</p><p>${qcLine}</p><p>${cvLine}</p><p class="w-note">${lesson}</p>`, qcOk ? 'ok' : 'bad');
  }

  draw();
}
