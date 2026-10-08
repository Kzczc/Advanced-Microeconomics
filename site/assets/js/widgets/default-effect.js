// default-effect: a switching-cost model of defaults (page 27).
// Each of 1000 people gains b from joining a savings plan; changing the status quo
// costs c. Default "not enrolled": join iff b > c. Default "enrolled": stay iff b ≥ −c.
// The participation gap between the two designs equals the share with |b| ≤ c.
import { C, h, s, makeSvg, plotFrame, segmented, slider, statusPanel, skeleton, fmt, clamp } from './_shared.js';

const PEOPLE = 1000;
const MEAN_BENEFIT = 600;
const SD_BENEFIT = 600;
const BIN_WIDTH = 100;
const B_MIN = -1200;
const B_MAX = 2400;
const DEFAULT_COST = 200;
const OBSERVED_GAP = 0.49;

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

function drawPopulation(seed) {
  const rand = mulberry32(seed);
  return Array.from({ length: PEOPLE }, () => {
    const u = Math.max(rand(), 1e-12);
    return MEAN_BENEFIT + SD_BENEFIT * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  });
}

const share = (arr, test) => arr.filter(test).length / arr.length;
const pct = (v) => `${fmt(v * 100, 1)}%`;

const legendItem = (fill, stroke, label) => h('span', { style: 'white-space:nowrap;margin-right:12px' },
  h('span', {
    'aria-hidden': 'true',
    style: `display:inline-block;width:11px;height:11px;margin-right:5px;vertical-align:-1px;background:${fill};border:1.5px solid ${stroke}`,
  }), label);

export function mount(stage, opts = {}) {
  let seed = 2001;
  let benefits = drawPopulation(seed);
  let defaultJoin = opts.default === 'in';
  let cost = clamp(Number(opts.c ?? DEFAULT_COST), 0, 1000);

  const { plot, side } = skeleton(stage);

  const HW = 520; const HH = 260;
  const histSvg = makeSvg(HW, HH, '每个人加入的好处 b 的分布，按结果着色');
  const histLayer = s('g', {}, histSvg);
  const PW = 400; const PH = 136;
  const partSvg = makeSvg(PW, PH, '两种默认下的参加率');
  const partLayer = s('g', {}, partSvg);
  const legend = h('p', { class: 'w-note w-small', style: 'margin:0 0 6px' },
    legendItem(C.fillTeal, C.teal, '加入（本来就想加入）'), legendItem(C.fillGray, C.gray, '没加入（本来就不想）'),
    legendItem(C.fillOrange, C.orange, '跟着默认走、违背本意'));
  plot.append(
    legend,
    h('p', { class: 'w-note', style: 'margin:0 0 4px', html: '1000 个人加入的好处 <i class="w-var">b</i>（元，示意数据），按最后加没加入着色' }),
    histSvg,
    h('p', { class: 'w-note', style: 'margin:10px 0 4px', text: '参加率：两种默认对比' }),
    partSvg,
  );

  const seg = segmented([['out', '默认不加入'], ['in', '默认加入']], defaultJoin ? 'in' : 'out', (v) => {
    defaultJoin = v === 'in';
    draw();
  }, '默认选项');
  const costSlider = slider({
    label: '改变的代价 <i class="w-var">c</i>（元）', min: 0, max: 1000, step: 10, value: cost,
    format: (v) => fmt(v, 0),
    onInput: (v) => { cost = v; draw(); },
  });
  const reshuffle = h('button', { type: 'button', class: 'w-btn', text: '换一群人' });
  const resetBtn = h('button', { type: 'button', class: 'w-btn', text: '重置' });
  const status = statusPanel();
  side.append(
    h('div', { class: 'w-controls' }, seg.el),
    h('div', { class: 'w-controls' }, costSlider.el),
    h('div', { class: 'w-controls' }, reshuffle, resetBtn),
    h('p', { class: 'w-note w-small', html: '默认不加入：<i class="w-var">b</i> &gt; <i class="w-var">c</i> 的人才去报名。默认加入：<i class="w-var">b</i> &lt; −<i class="w-var">c</i> 的人才去退出。' }),
    status.el,
  );

  /** Outcome of one person under the current design. */
  function outcome(b) {
    const joined = defaultJoin ? b >= -cost : b > cost;
    const wantsToJoin = b > 0;
    if (joined === wantsToJoin) return joined ? 'join' : 'stay';
    return 'stuck';
  }

  function drawHistogram() {
    histLayer.replaceChildren();
    const bins = Math.round((B_MAX - B_MIN) / BIN_WIDTH);
    const counts = Array.from({ length: bins }, () => ({ join: 0, stay: 0, stuck: 0 }));
    benefits.forEach((b) => {
      const i = clamp(Math.floor((b - B_MIN) / BIN_WIDTH), 0, bins - 1);
      counts[i][outcome(b)] += 1;
    });
    const tallest = Math.max(...counts.map((c) => c.join + c.stay + c.stuck));
    const yMax = Math.max(40, Math.ceil(tallest / 20) * 20);
    const yticks = [];
    for (let t = 20; t <= yMax; t += 20) yticks.push(t);
    const { X, Y } = plotFrame(histLayer, {
      W: HW, H: HH, pad: { l: 40, r: 16, t: 26, b: 40 }, x: [B_MIN, B_MAX], y: [0, yMax],
      xlabel: '好处 b（元）', ylabel: '人数', xticks: [-1000, 0, 1000, 2000], yticks,
    });
    const colors = { join: [C.fillTeal, C.teal], stay: [C.fillGray, C.gray], stuck: [C.fillOrange, C.orange] };
    counts.forEach((c, i) => {
      let base = 0;
      const x0 = X(B_MIN + i * BIN_WIDTH) + 0.5;
      const w = X(B_MIN + (i + 1) * BIN_WIDTH) - X(B_MIN + i * BIN_WIDTH) - 1;
      ['stay', 'stuck', 'join'].forEach((key) => {
        if (!c[key]) return;
        const [fill, stroke] = colors[key];
        s('rect', { x: x0, y: Y(base + c[key]), width: w, height: Y(base) - Y(base + c[key]), fill, stroke, 'stroke-width': 0.8 }, histLayer);
        base += c[key];
      });
    });
    const line = (bx, color, width, label) => {
      if (bx < B_MIN || bx > B_MAX) return;
      // Stop below the y-axis title and label beside the line (right of c, left of −c).
      s('line', { x1: X(bx), y1: Y(0), x2: X(bx), y2: Y(yMax) + 16, stroke: color, 'stroke-width': width, 'stroke-dasharray': '5 4' }, histLayer);
      const right = bx >= 0;
      if (label) s('text', { x: X(bx) + (right ? 4 : -4), y: Y(yMax) + 28, 'text-anchor': right ? 'start' : 'end', class: 'w-tick', fill: color }, histLayer).textContent = label;
    };
    line(0, C.ink2, 1, '');
    if (cost > 0) {
      line(cost, C.orange, defaultJoin ? 1 : 2, defaultJoin ? '' : 'c');
      line(-cost, C.orange, defaultJoin ? 2 : 1, defaultJoin ? '−c' : '');
    }
  }

  function drawParticipation(rates) {
    partLayer.replaceChildren();
    const left = 100; const right = PW - 52; const rowH = 32;
    const X = (v) => left + (right - left) * v;
    const rows = [
      ['默认不加入', rates.optIn, !defaultJoin, C.fillBlue, C.navy],
      ['默认加入', rates.optOut, defaultJoin, C.fillTeal, C.teal],
      ['改变没有代价', rates.ideal, false, 'none', C.gray],
    ];
    rows.forEach(([label, v, active, fill, stroke], i) => {
      const y = 14 + i * (rowH + 8);
      s('text', { x: left - 8, y: y + rowH / 2 + 4, 'text-anchor': 'end', class: 'w-tick', 'font-weight': active ? 700 : 400 }, partLayer).textContent = label;
      s('rect', { x: left, y, width: right - left, height: rowH, fill: C.fillGray, opacity: 0.35 }, partLayer);
      s('rect', {
        x: left, y, width: Math.max(0, X(v) - left), height: rowH, fill, stroke,
        'stroke-width': active ? 2 : 1.2, 'stroke-dasharray': fill === 'none' ? '5 4' : null,
      }, partLayer);
      s('text', { x: X(v) + 6, y: y + rowH / 2 + 4, class: 'w-tick', fill: stroke }, partLayer).textContent = pct(v);
    });
  }

  /** Smallest cost on a 10-yuan grid at which the gap reaches the observed 49 points. */
  function costForObservedGap() {
    for (let c = 0; c <= 3000; c += 10) {
      if (share(benefits, (b) => Math.abs(b) <= c) >= OBSERVED_GAP) return c;
    }
    return null;
  }

  function draw() {
    const rates = {
      optIn: share(benefits, (b) => b > cost),
      optOut: share(benefits, (b) => b >= -cost),
      ideal: share(benefits, (b) => b > 0),
    };
    drawHistogram();
    drawParticipation(rates);
    const gap = rates.optOut - rates.optIn;
    const stuck = share(benefits, (b) => outcome(b) === 'stuck');
    const needed = costForObservedGap();
    const lines = [
      `默认不加入时参加率 <b>${pct(rates.optIn)}</b>，默认加入时 <b>${pct(rates.optOut)}</b>，相差 <b>${fmt(gap * 100, 1)}</b> 个百分点。`,
      `这个差距正好是好处夹在 −<i class="w-var">c</i> 到 <i class="w-var">c</i> 之间的人的比例。当前默认下，<span class="w-bad">${pct(stuck)}</span> 的人违背本意跟着默认走。`,
    ];
    if (cost === 0) {
      lines.push('<span class="w-ok"><i class="w-var">c</i> = 0：改变没有代价，两种默认下参加率完全一样，默认不起作用。</span>');
      status.set(lines.join('<br>'), 'ok');
      return;
    }
    if (needed !== null) {
      lines.push(`Madrian 和 Shea 观察到的差距是 49 个百分点；在这群人里，要 <i class="w-var">c</i> ≈ <b>${needed}</b> 元才能做到。填一张表的麻烦值这么多钱吗？`);
    }
    status.set(lines.join('<br>'), gap >= OBSERVED_GAP ? 'bad' : 'info');
  }

  reshuffle.addEventListener('click', () => {
    seed += 1;
    benefits = drawPopulation(seed);
    draw();
  });
  resetBtn.addEventListener('click', () => {
    seed = 2001;
    benefits = drawPopulation(seed);
    defaultJoin = opts.default === 'in';
    cost = clamp(Number(opts.c ?? DEFAULT_COST), 0, 1000);
    seg.set(defaultJoin ? 'in' : 'out');
    costSlider.set(cost);
    draw();
  });

  draw();
}
