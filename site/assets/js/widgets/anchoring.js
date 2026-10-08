// anchoring: simulate the Ariely–Loewenstein–Prelec experiment (page 26).
// Each simulated student has a private value v for an ordinary wine and a premium
// delta > 0 for a rare wine; the stated bid is value + k·(digits − 50) + noise.
// The anchor shifts absolute levels (arbitrariness) but not the ranking (coherence).
import { C, h, s, makeSvg, plotFrame, slider, statusPanel, skeleton, fmt, clamp } from './_shared.js';

const CLASS_SIZE = 50;
const BATCH = 20;
const SEED = 2003;
const GROUPS = ['00–19', '20–39', '40–59', '60–79', '80–99'];

/** Small seeded generator so every reset reproduces the same classes. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNormal(rand) {
  return (mean, sd) => {
    const u = Math.max(rand(), 1e-12);
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
}

/** Pearson correlation of two equal-length arrays. */
function correlation(xs, ys) {
  const n = xs.length;
  if (n < 3) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0; let sxx = 0; let syy = 0;
  for (let i = 0; i < n; i += 1) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
}

const legendItem = (fill, stroke, label) => h('span', { style: 'white-space:nowrap;margin-right:12px' },
  h('span', {
    'aria-hidden': 'true',
    style: `display:inline-block;width:11px;height:11px;margin-right:5px;vertical-align:-1px;background:${fill};border:1.5px solid ${stroke}`,
  }), label);

export function mount(stage, opts = {}) {
  let anchorWeight = clamp(Number(opts.k ?? 0.35), 0, 0.8);
  let rand = mulberry32(SEED);
  let normal = makeNormal(rand);
  let classes = [];
  let animationId = 0;

  const { plot, side } = skeleton(stage);

  // Scatter of the latest class: one ordinary and one rare-wine bid per student.
  const SW = 520; const SH = 280;
  const scatterSvg = makeSvg(SW, SH, '最近一个班：社保号末两位与出价的散点图');
  const scatter = plotFrame(scatterSvg, {
    W: SW, H: SH, pad: { l: 46, r: 18, t: 22, b: 40 }, x: [0, 100], y: [0, 160],
    xlabel: '社保号末两位', ylabel: '出价（美元）', xticks: [0, 20, 40, 60, 80, 100], yticks: [40, 80, 120, 160], grid: true,
  });
  const scatterLayer = s('g', {}, scatter.mid);

  // Paired bars: average bid by anchor group, accumulated over all classes.
  const BW = 520; const BH = 240;
  const barSvg = makeSvg(BW, BH, '按末两位分 5 组的平均出价');
  const barPad = { l: 46, r: 18, t: 22, b: 40 };
  const barFrameLayer = s('g', {}, barSvg);
  const barLayer = s('g', {}, barSvg);

  const legend = h('p', { class: 'w-note w-small', style: 'margin:0 0 6px' },
    legendItem(C.fillBlue, C.navy, '普通红酒'), legendItem(C.fillRed, C.red, '稀有红酒'));
  plot.append(
    legend,
    h('p', { class: 'w-note', style: 'margin:0 0 4px', text: '最近一个班：每个学生两个点，竖线连着同一个人的两次出价' }),
    scatterSvg,
    h('p', { class: 'w-note', style: 'margin:10px 0 4px', text: '所有班合起来：按末两位分 5 组的平均出价' }),
    barSvg,
  );

  const runOnce = h('button', { type: 'button', class: 'w-btn', text: `做一次实验（一个班 ${CLASS_SIZE} 人）` });
  const runBatch = h('button', { type: 'button', class: 'w-btn', text: `再做 ${BATCH} 个班` });
  const resetBtn = h('button', { type: 'button', class: 'w-btn', text: '重置' });
  const kSlider = slider({
    label: '锚的影响 <i class="w-var">k</i>', min: 0, max: 0.8, step: 0.05, value: anchorWeight,
    format: (v) => fmt(v, 2),
    onInput: (v) => { anchorWeight = v; cancelAnimation(); drawAll(); },
  });
  const status = statusPanel();
  side.append(
    h('div', { class: 'w-controls' }, runOnce, runBatch, resetBtn),
    h('div', { class: 'w-controls' }, kSlider.el),
    h('p', { class: 'w-note w-small', html: '出价 = 真实评价 + <i class="w-var">k</i> ×（末两位 − 50）+ 随机误差。学生和误差固定不变，拖动 <i class="w-var">k</i> 只改变锚的作用。' }),
    status.el,
  );

  function newStudent() {
    const value = clamp(normal(40, 15), 10, 90);
    return {
      digits: Math.floor(rand() * 100),
      value,
      premium: Math.max(5, normal(25, 6)),
      noiseOrdinary: normal(0, 5),
      noiseRare: normal(0, 5),
    };
  }

  function newClass() {
    return Array.from({ length: CLASS_SIZE }, newStudent);
  }

  function bids(student) {
    const pull = anchorWeight * (student.digits - 50);
    return {
      ordinary: Math.max(1, student.value + pull + student.noiseOrdinary),
      rare: Math.max(1, student.value + student.premium + pull + student.noiseRare),
    };
  }

  function cancelAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
  }

  /** Draw the first `count` students of the latest class. */
  function drawScatter(count) {
    scatterLayer.replaceChildren();
    const latest = classes[classes.length - 1];
    if (!latest) {
      s('text', { x: SW / 2, y: SH / 2, 'text-anchor': 'middle', class: 'w-tick' }, scatterLayer).textContent = '点“做一次实验”开始';
      return;
    }
    const { X, Y } = scatter;
    latest.slice(0, count).forEach((student) => {
      const b = bids(student);
      const x = X(student.digits);
      const yo = Y(Math.min(b.ordinary, 160));
      const yr = Y(Math.min(b.rare, 160));
      s('line', { x1: x, y1: yo, x2: x, y2: yr, stroke: C.muted, 'stroke-width': 0.8, opacity: 0.7 }, scatterLayer);
      s('circle', { cx: x, cy: yo, r: 3.6, fill: C.navy, opacity: 0.85 }, scatterLayer);
      s('circle', { cx: x, cy: yr, r: 3.6, fill: C.red, opacity: 0.85 }, scatterLayer);
    });
  }

  function groupMeans(students) {
    const sums = GROUPS.map(() => ({ ordinary: 0, rare: 0, n: 0 }));
    students.forEach((student) => {
      const g = Math.min(4, Math.floor(student.digits / 20));
      const b = bids(student);
      sums[g].ordinary += b.ordinary;
      sums[g].rare += b.rare;
      sums[g].n += 1;
    });
    return sums.map((g) => (g.n ? { ordinary: g.ordinary / g.n, rare: g.rare / g.n, n: g.n } : null));
  }

  function drawBars(means) {
    barFrameLayer.replaceChildren();
    barLayer.replaceChildren();
    const top = Math.max(60, ...means.filter(Boolean).map((g) => g.rare));
    const yMax = Math.ceil(top / 20) * 20;
    const yticks = [];
    for (let t = 20; t <= yMax; t += 20) yticks.push(t);
    const { X, Y } = plotFrame(barFrameLayer, {
      W: BW, H: BH, pad: barPad, x: [0, 5], y: [0, yMax], ylabel: '平均出价（美元）', yticks, grid: true,
    });
    GROUPS.forEach((label, i) => {
      const cx = X(i + 0.5);
      s('text', { x: cx, y: BH - barPad.b + 17, 'text-anchor': 'middle', class: 'w-tick' }, barLayer).textContent = label;
      const g = means[i];
      if (!g) return;
      const w = (X(1) - X(0)) * 0.3;
      [[g.ordinary, C.fillBlue, C.navy, -w], [g.rare, C.fillRed, C.red, 0]].forEach(([v, fill, stroke, dx]) => {
        s('rect', { x: cx + dx, y: Y(v), width: w, height: Y(0) - Y(v), fill, stroke, 'stroke-width': 1.2 }, barLayer);
      });
    });
  }

  function updateStatus(students, means) {
    if (!students.length) {
      status.set('还没有数据。点“做一次实验”，让一个班的学生先写下社保号末两位，再给两瓶红酒出价。', 'info');
      return;
    }
    const bidsAll = students.map(bids);
    const r = correlation(students.map((st) => st.digits), bidsAll.map((b) => b.ordinary));
    const coherent = bidsAll.filter((b) => b.rare > b.ordinary).length / students.length;
    const low = means[0]; const high = means[4];
    const lines = [`共 ${classes.length} 个班、${students.length} 名学生。`];
    if (low && high) {
      lines.push(`普通红酒：末两位最大一组平均出 <b>${fmt(high.ordinary, 1)}</b> 美元，最小一组 <b>${fmt(low.ordinary, 1)}</b> 美元，`
        + `相差 ${fmt(high.ordinary - low.ordinary, 1)} 美元（${fmt(high.ordinary / low.ordinary, 2)} 倍）。`);
    }
    lines.push(`末两位与出价的相关系数 <i class="w-var">r</i> = <b>${fmt(r, 2)}</b>。`);
    lines.push(`给稀有红酒出价更高的学生：<b>${fmt(coherent * 100, 1)}%</b>。`);
    if (anchorWeight === 0) {
      lines.push('<span class="w-ok">现在 <i class="w-var">k</i> = 0：锚不起作用，五组之间的差别只是随机误差，<i class="w-var">r</i> 接近 0。</span>');
      status.set(lines.join('<br>'), 'ok');
    } else {
      lines.push(`<span class="w-bad">任意：</span>一个随机号码拉动了出价的整体水平。`
        + `<span class="w-ok">一致：</span>几乎人人仍觉得稀有红酒更值钱。这就是“一致的任意性”。`);
      status.set(lines.join('<br>'), 'info');
    }
  }

  function drawAll(scatterCount = CLASS_SIZE) {
    const students = classes.flat();
    const means = groupMeans(students);
    drawScatter(scatterCount);
    drawBars(means);
    updateStatus(students, means);
  }

  function animateLatest() {
    cancelAnimation();
    const start = performance.now();
    const duration = 700;
    const students = classes.flat();
    const means = groupMeans(students);
    drawBars(means);
    updateStatus(students, means);
    const step = (now) => {
      const count = Math.ceil(clamp((now - start) / duration, 0, 1) * CLASS_SIZE);
      drawScatter(count);
      animationId = count < CLASS_SIZE ? requestAnimationFrame(step) : 0;
    };
    animationId = requestAnimationFrame(step);
  }

  runOnce.addEventListener('click', () => {
    classes.push(newClass());
    animateLatest();
  });
  runBatch.addEventListener('click', () => {
    for (let i = 0; i < BATCH; i += 1) classes.push(newClass());
    cancelAnimation();
    drawAll();
  });
  resetBtn.addEventListener('click', () => {
    cancelAnimation();
    rand = mulberry32(SEED);
    normal = makeNormal(rand);
    classes = [];
    anchorWeight = clamp(Number(opts.k ?? 0.35), 0, 0.8);
    kSlider.set(anchorWeight);
    drawAll();
  });

  drawAll();
}
