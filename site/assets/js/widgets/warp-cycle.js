// warp-cycle: with only the two-element menus observed, WARP can hold while the choices cycle
// (page 13, the MWG example). Adding the menu {x, y, z} lets WARP catch the cycle.
import { C, s, h, makeSvg, arrowMarker, segmented, statusPanel, skeleton } from './_shared.js';

const PAIRS = [['x', 'y'], ['y', 'z'], ['x', 'z']];
const PRESETS = {
  mwg: { label: 'MWG 的例子', pick: ['x', 'y', 'z'] },
  ranked: { label: '没有循环', pick: ['x', 'y', 'x'] },
};
const NODE = { x: [150, 38], y: [52, 206], z: [248, 206] };

const v = (e) => `<i class="w-var">${e}</i>`;
const menu = (items) => `{${items.map(v).join(', ')}}`;

export function mount(stage) {
  const pick = [...PRESETS.mwg.pick];
  let withTriple = false;
  let triple = 'x';
  const { root, plot, side } = skeleton(stage);
  const presets = segmented(Object.entries(PRESETS).map(([k, p]) => [k, p.label]), 'mwg', (k) => {
    PRESETS[k].pick.forEach((e, i) => { pick[i] = e; });
    draw();
  }, '预设');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, presets.el));

  plot.append(h('p', { class: 'w-note', style: 'margin:0 0 6px', html: '每一行是一份观察到的菜单，点选他选了哪一个。' }));
  function chipRow(items, current, onPick) {
    const chips = items.map((e) => {
      const b = h('button', { type: 'button', class: 'w-chip', html: v(e) });
      b.addEventListener('click', () => onPick(e));
      return [e, b];
    });
    const row = h('div', { class: 'w-menu-row' },
      h('span', { class: 'w-menu-name', html: `<i class="w-var">C</i>(${menu(items)})` }),
      h('span', { class: 'w-arrow', text: '=' }),
      h('div', { class: 'w-chips' }, chips.map(([, b]) => b)));
    return { row, sync: () => chips.forEach(([e, b]) => b.setAttribute('aria-pressed', String(e === current()))) };
  }
  const rows = PAIRS.map((items, i) => chipRow(items, () => pick[i], (e) => { pick[i] = e; presets.set(null); draw(); }));
  rows.forEach(({ row }) => plot.append(row));
  const tripleRow = chipRow(['x', 'y', 'z'], () => triple, (e) => { triple = e; draw(); });
  const toggle = h('input', { type: 'checkbox' });
  toggle.addEventListener('change', () => { withTriple = toggle.checked; draw(); });
  plot.append(h('label', { class: 'w-check', style: 'display:block;margin:10px 0 4px' }, toggle, h('span', { html: ` 也观察到三元素菜单 ${menu(['x', 'y', 'z'])} 上的选择` })));
  plot.append(tripleRow.row);

  const svg = makeSvg(300, 240, '三个选项之间的显示偏好箭头');
  svg.style.maxWidth = '300px';
  side.append(svg);
  side.append(h('p', { class: 'w-note', style: 'margin:0 0 8px', html: '箭头从被选中的指向落选的：<i class="w-var">a</i> → <i class="w-var">b</i> 表示两者都在菜单里时选了 <i class="w-var">a</i>。' }));
  const status = statusPanel();
  side.append(status.el);
  const arrowBlue = arrowMarker(svg, C.navy, 9);
  const arrowRed = arrowMarker(svg, C.red, 9);
  const edgeLayer = s('g', {}, svg);
  for (const [name, [cx, cy]] of Object.entries(NODE)) {
    s('circle', { cx, cy, r: 19, fill: '#fff', stroke: C.ink2, 'stroke-width': 1.4 }, svg);
    s('text', { x: cx, y: cy + 6, 'text-anchor': 'middle', class: 'w-var', 'font-size': 18 }, svg).textContent = name;
  }

  const winsOver = () => PAIRS.map(([a, b], i) => (pick[i] === a ? [a, b] : [b, a]));
  const isCycle = () => {
    const [xy, yz, xz] = pick;
    return (xy === 'x' && yz === 'y' && xz === 'z') || (xy === 'y' && yz === 'z' && xz === 'x');
  };

  function drawEdges(cycle) {
    edgeLayer.replaceChildren();
    for (const [w, l] of winsOver()) {
      const [x1, y1] = NODE[w];
      const [x2, y2] = NODE[l];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len;
      const uy = (y2 - y1) / len;
      s('line', {
        x1: x1 + ux * 22, y1: y1 + uy * 22, x2: x2 - ux * 24, y2: y2 - uy * 24,
        stroke: cycle ? C.red : C.navy, 'stroke-width': 2, 'marker-end': cycle ? arrowRed : arrowBlue,
      }, edgeLayer);
    }
  }

  function ranking() {
    const wins = { x: 0, y: 0, z: 0 };
    for (const [w] of winsOver()) wins[w] += 1;
    return Object.keys(wins).sort((p, q) => wins[q] - wins[p]);
  }

  function draw() {
    rows.forEach(({ sync }) => sync());
    tripleRow.sync();
    tripleRow.row.style.display = withTriple ? '' : 'none';
    const cycle = isCycle();
    drawEdges(cycle);
    const chain = winsOver().map(([w, l]) => `${v(w)} ≻ ${v(l)}`).join('，');

    if (!withTriple) {
      if (cycle) {
        status.set(`<p><span class="w-ok">WARP 成立：</span>任意两份菜单只有一个共同选项，找不到“两份菜单都含同一对选项”的情况，WARP 根本没机会检查。</p>
<p><span class="w-bad">却不能被合理化：</span>${chain}，绕成了一个圈。没有哪套完备、传递的偏好能产生它。这就是数据不全时 WARP 的弱点；勾选下面的三元素菜单试试。</p>`, 'bad');
      } else {
        const [top, middle, bottom] = ranking();
        status.set(`<p><span class="w-ok">WARP 成立，也能被合理化：</span>${chain}，没有循环，排成 ${v(top)} ≻ ${v(middle)} ≻ ${v(bottom)}。每份菜单里选的都是这个排序下更好的那个。</p>`, 'ok');
      }
      return;
    }

    // WARP with {x,y,z}: the item chosen there must also be chosen in every pair menu it shares with another item.
    const broken = PAIRS.map((items, i) => ({ items, chosen: pick[i] }))
      .filter(({ items, chosen }) => items.includes(triple) && chosen !== triple);
    if (broken.length) {
      const lines = broken.map(({ items, chosen }) => `<li>${menu(['x', 'y', 'z'])} 里选了 ${v(triple)}，${v(chosen)} 也在场；${menu(items)} 里两者都在，却选了 ${v(chosen)}。WARP 要求 ${v(triple)} 在 ${menu(items)} 里也被选中。</li>`).join('');
      const why = cycle ? '原来的选择本身就是一个圈，不管三元素菜单选哪个，都会和某份两元素菜单冲突。菜单齐全时，WARP 就和 HARP 一样能抓住循环。' : `换成选 ${v(ranking()[0])} 就不会冲突。`;
      status.set(`<p><span class="w-bad">WARP 不成立：</span></p><ul>${lines}</ul><p>${why}</p>`, 'bad');
      return;
    }
    const [top, middle, bottom] = ranking();
    status.set(`<p><span class="w-ok">WARP 成立，也能被合理化：</span>排序 ${v(top)} ≻ ${v(middle)} ≻ ${v(bottom)} 解释了全部四份菜单上的选择。</p>`, 'ok');
  }

  draw();
}
