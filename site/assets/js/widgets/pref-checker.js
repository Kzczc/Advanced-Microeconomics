// pref-checker: set the preference between each pair of three fruits and see
// whether completeness and transitivity hold (pages 3–4).
import {
  C, s, h, makeSvg, arrowMarker, segmented, selectBox, statusPanel, skeleton,
} from './_shared.js';

const DEFAULT_ITEMS = [
  { k: 'a', name: '苹果' },
  { k: 'b', name: '香蕉' },
  { k: 'c', name: '橙子' },
];
const PAIRS = [[0, 1], [0, 2], [1, 2]];
const PRESETS = {
  rational: ['gt', 'gt', 'eq'],
  cycle: ['gt', 'lt', 'gt'],
  incomplete: ['gt', 'na', 'gt'],
};
const POS = [[180, 54], [66, 236], [294, 236]];
const R = 38;
const STATES = ['gt', 'eq', 'lt', 'na'];

// opts.items: three { k, name } to relabel the options (e.g. page 4 uses x, y, z);
// opts.state: initial answers for the pairs (1st,2nd), (1st,3rd), (2nd,3rd).
export function mount(stage, opts = {}) {
  const ITEMS = Array.isArray(opts.items) && opts.items.length === 3 ? opts.items : DEFAULT_ITEMS;
  const nm = (i) => `${ITEMS[i].name} <i class="w-var">${ITEMS[i].k}</i>`;
  const v = (i) => `<i class="w-var">${ITEMS[i].k}</i>`;
  const initial = Array.isArray(opts.state) && opts.state.every((x) => STATES.includes(x)) ? opts.state : PRESETS.rational;
  const state = [...initial];
  const { plot, side } = skeleton(stage);

  const svg = makeSvg(360, 300, '三种水果之间的偏好关系图');
  plot.append(svg);
  const arrowNavy = arrowMarker(svg, C.navy, 11);
  const arrowRed = arrowMarker(svg, C.red, 11);
  const edges = s('g', {}, svg);
  const nodes = s('g', {}, svg);
  ITEMS.forEach((it, i) => {
    const [x, y] = POS[i];
    s('circle', { cx: x, cy: y, r: R, fill: C.fillBlue, stroke: C.navy, 'stroke-width': 1.6 }, nodes);
    const t = s('text', { x, y: y - 2, 'text-anchor': 'middle' }, nodes);
    t.textContent = it.name;
    const t2 = s('text', { x, y: y + 16, 'text-anchor': 'middle', class: 'w-var' }, nodes);
    t2.textContent = it.k;
  });
  const legend = s('text', { x: 180, y: 292, 'text-anchor': 'middle', class: 'w-small' }, svg);
  legend.textContent = '箭头：从更好的指向更差的　双线：一样好　虚线：说不出';

  const presets = segmented([
    ['rational', '理性的例子'],
    ['cycle', '循环（石头剪刀布）'],
    ['incomplete', '说不出（不完备）'],
  ], initial === PRESETS.rational ? 'rational' : null, (p) => {
    PRESETS[p].forEach((val, i) => { state[i] = val; selects[i].set(val); });
    update();
  }, '预设');
  side.append(h('div', { class: 'w-controls' }, presets.el));

  const selects = PAIRS.map(([i, j], idx) => {
    const box = selectBox(`${ITEMS[i].name}与${ITEMS[j].name}：`, [
      ['gt', `${ITEMS[i].name}更好`],
      ['eq', '一样好'],
      ['lt', `${ITEMS[j].name}更好`],
      ['na', '说不出'],
    ], state[idx], (val) => { state[idx] = val; presets.set(null); update(); });
    side.append(h('div', { class: 'w-pair-row' }, box.el));
    return box;
  });

  const status = statusPanel();
  side.append(status.el);

  function weak() {
    // W[i][j] = "i ⪰ j"; every option is at least as good as itself.
    const W = ITEMS.map((_, i) => ITEMS.map((__, j) => i === j));
    PAIRS.forEach(([i, j], idx) => {
      const st = state[idx];
      W[i][j] = st === 'gt' || st === 'eq';
      W[j][i] = st === 'lt' || st === 'eq';
    });
    return W;
  }

  function rel(W, i, j) {
    if (W[i][j] && W[j][i]) return `${v(i)} ∼ ${v(j)}`;
    if (W[i][j]) return `${v(i)} ≻ ${v(j)}`;
    if (W[j][i]) return `${v(j)} ≻ ${v(i)}`;
    return `${v(i)}、${v(j)} 说不出谁好`;
  }

  function update() {
    const W = weak();
    const incomplete = PAIRS.filter(([i, j]) => !W[i][j] && !W[j][i]);
    const broken = [];
    const badPairs = new Set();
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        for (let k = 0; k < 3; k += 1) {
          if (i === j || j === k || i === k) continue;
          if (W[i][j] && W[j][k] && !W[i][k]) {
            const actual = W[k][i]
              ? `你设定的却是 ${v(k)} ≻ ${v(i)}`
              : `你却说不出 ${v(i)} 和 ${v(k)} 谁好`;
            broken.push(`由 ${rel(W, i, j)}、${rel(W, j, k)}，传递性要求 ${v(i)} ⪰ ${v(k)}，${actual}。`);
            [[i, j], [j, k], [i, k]].forEach(([p, q]) => badPairs.add([p, q].sort().join('')));
          }
        }
      }
    }
    incomplete.forEach(([i, j]) => badPairs.add([i, j].sort().join('')));
    draw(W, badPairs);

    const parts = [];
    parts.push(incomplete.length
      ? `<p><span class="w-bad">完备性不成立。</span>${incomplete.map(([i, j]) => `${nm(i)} 和 ${nm(j)}：你说不出哪个好，而完备性要求 ${v(i)} ⪰ ${v(j)} 与 ${v(j)} ⪰ ${v(i)} 至少有一个成立。`).join('')}</p>`
      : '<p><span class="w-ok">完备性成立：</span>每一对都能比较（“一样好”也算能比较）。</p>');
    parts.push(broken.length
      ? `<p><span class="w-bad">传递性不成立：</span></p><ul>${[...new Set(broken)].slice(0, 3).map((b) => `<li>${b}</li>`).join('')}</ul>`
      : '<p><span class="w-ok">传递性成立：</span>所有“接力”都检查过了，没有兜圈子。</p>');

    if (!incomplete.length && !broken.length) {
      const score = ITEMS.map((_, i) => W[i].filter(Boolean).length);
      const order = [0, 1, 2].sort((p, q) => score[q] - score[p]);
      let line = nm(order[0]);
      for (let t = 1; t < 3; t += 1) {
        const p = order[t - 1];
        const q = order[t];
        line += W[q][p] ? ` ∼ ${nm(q)}` : ` ≻ ${nm(q)}`;
      }
      parts.push(`<p><b>结论：这是理性偏好</b>，可以把三种水果排成一行：${line}。</p>`);
      status.set(parts.join(''), 'ok');
    } else {
      parts.push('<p><b>结论：不是理性偏好。</b>理性偏好必须同时满足完备性和传递性。</p>');
      status.set(parts.join(''), 'bad');
    }
  }

  function draw(W, badPairs) {
    edges.replaceChildren();
    PAIRS.forEach(([i, j]) => {
      const bad = badPairs.has([i, j].sort().join(''));
      const color = bad ? C.red : C.navy;
      let [x1, y1] = POS[i];
      let [x2, y2] = POS[j];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const L = Math.hypot(dx, dy);
      const ux = dx / L;
      const uy = dy / L;
      const ax = x1 + ux * (R + 6);
      const ay = y1 + uy * (R + 6);
      const bx = x2 - ux * (R + 6);
      const by = y2 - uy * (R + 6);
      if (W[i][j] && W[j][i]) {
        const nx = -uy * 3.5;
        const ny = ux * 3.5;
        for (const sgn of [1, -1]) {
          s('line', { x1: ax + nx * sgn, y1: ay + ny * sgn, x2: bx + nx * sgn, y2: by + ny * sgn, stroke: bad ? C.red : C.teal, 'stroke-width': 2 }, edges);
        }
        label((ax + bx) / 2, (ay + by) / 2, '∼', bad ? C.red : C.teal, ux, uy);
      } else if (W[i][j] || W[j][i]) {
        if (W[j][i]) { [x1, y1, x2, y2] = [bx, by, ax, ay]; } else { [x1, y1, x2, y2] = [ax, ay, bx, by]; }
        s('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 2.2, 'marker-end': bad ? arrowRed : arrowNavy }, edges);
        label((ax + bx) / 2, (ay + by) / 2, '≻', color, ux, uy);
      } else {
        s('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: bad ? C.red : C.gray, 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }, edges);
        label((ax + bx) / 2, (ay + by) / 2, '?', bad ? C.red : C.gray, ux, uy);
      }
    });
  }

  function label(x, y, text, color, ux, uy) {
    const off = 15;
    const t = s('text', {
      x: x - uy * off, y: y + ux * off + 5, 'text-anchor': 'middle', fill: color, 'font-weight': 700,
    }, edges);
    t.textContent = text;
  }

  update();
}
