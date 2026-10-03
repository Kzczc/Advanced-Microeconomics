// choice-rule: build a menu B and see C(B; ⪰) (page 5).
// Mode 1: five fruits with a fixed preference (with a tie).
// Mode 2: B = [0,1) with "bigger is better" — no best element, so C(B) is empty.
import {
  C, s, h, makeSvg, linear, segmented, slider, statusPanel, skeleton, fmt,
} from './_shared.js';

const FRUITS = [
  { k: 'mango', name: '芒果', r: 4 },
  { k: 'apple', name: '苹果', r: 3 },
  { k: 'banana', name: '香蕉', r: 3 },
  { k: 'orange', name: '橙子', r: 2 },
  { k: 'pear', name: '梨', r: 1 },
];

export function mount(stage) {
  const { root, plot, side } = skeleton(stage);
  const modes = segmented([['finite', '有限菜单（5 种水果）'], ['interval', '无限菜单 [0, 1)']], 'finite', (m) => show(m), '模式');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, modes.el));

  // ---------------- finite mode ----------------
  const chosen = new Set(['apple', 'banana', 'orange']);
  const finite = h('div', { class: 'w-finite' });
  finite.append(h('div', {
    class: 'w-pref-line',
    html: '这个人的偏好（固定不变）：<b>芒果 ≻ 苹果 ∼ 香蕉 ≻ 橙子 ≻ 梨</b><br><span class="w-note">点下面的水果，把它放进 / 拿出菜单 <i class="w-var">B</i>。蓝底：在菜单里；绿圈：被选中，属于 <i class="w-var">C</i>(<i class="w-var">B</i>;⪰)。</span>',
  }));
  const chips = h('div', { class: 'w-chips', style: 'margin-top:10px' });
  const chipEls = new Map();
  for (const f of FRUITS) {
    const b = h('button', { type: 'button', class: 'w-chip', text: f.name });
    b.addEventListener('click', () => {
      if (chosen.has(f.k)) chosen.delete(f.k); else chosen.add(f.k);
      updateFinite();
    });
    chipEls.set(f.k, b);
    chips.append(b);
  }
  finite.append(chips);
  const tableWrap = h('div', { class: 'w-table-wrap', style: 'margin-top:12px' });
  finite.append(tableWrap);

  // ---------------- interval mode ----------------
  const interval = h('div', { class: 'w-interval' });
  const W = 560;
  const H = 150;
  const svg = makeSvg(W, H, '数轴上的菜单 B');
  interval.append(svg);
  const X = linear(0, 1, 40, W - 40);
  s('line', { x1: X(0), y1: 80, x2: X(1), y2: 80, stroke: C.navy, 'stroke-width': 5, 'stroke-linecap': 'butt', opacity: 0.85 }, svg);
  s('circle', { cx: X(0), cy: 80, r: 6, fill: C.navy }, svg);
  const endDot = s('circle', { cx: X(1), cy: 80, r: 6, fill: '#fff', stroke: C.navy, 'stroke-width': 2.2 }, svg);
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const tx = s('text', { x: X(t), y: 108, 'text-anchor': 'middle', class: 'w-tick' }, svg);
    tx.textContent = String(t);
  }
  const mark = s('g', {}, svg);
  const better = s('g', {}, svg);
  const arc = s('path', { fill: 'none', stroke: C.green, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, svg);
  let closed = false;
  let xv = 0.8;
  const xs = slider({
    label: '你从菜单里选 <i class="w-var">x</i> =', min: 0, max: 0.99, step: 0.01, value: xv,
    format: (val) => fmt(val, 2), onInput: (val) => { xv = val; updateInterval(); },
  });
  const closedBox = h('input', { type: 'checkbox' });
  closedBox.addEventListener('change', () => {
    closed = closedBox.checked;
    xs.setRange(0, closed ? 1 : 0.99, 0.01);
    if (!closed && xv > 0.99) { xv = 0.99; xs.set(xv); }
    updateInterval();
  });
  interval.append(h('div', { class: 'w-controls', style: 'margin-top:8px' }, xs.el,
    h('label', { class: 'w-check' }, closedBox, h('span', { html: '把菜单换成闭区间 [0, 1]（包含 1）' }))));

  plot.append(finite, interval);
  const status = statusPanel();
  side.append(status.el);

  function updateFinite() {
    const B = FRUITS.filter((f) => chosen.has(f.k));
    const best = B.length ? Math.max(...B.map((f) => f.r)) : null;
    const CB = B.filter((f) => f.r === best);
    for (const f of FRUITS) {
      const el = chipEls.get(f.k);
      el.setAttribute('aria-pressed', String(chosen.has(f.k)));
      el.classList.toggle('is-chosen', CB.includes(f));
    }
    if (!B.length) {
      tableWrap.replaceChildren();
      status.set('<p>菜单 <i class="w-var">B</i> 是空集：一个选项都没有，当然什么也选不出来，<i class="w-var">C</i>(∅) = ∅。</p><p class="w-note">命题 1 只保证“<b>非空的</b>有限菜单”一定选得出东西。</p>', 'info');
      return;
    }
    // Comparison table: row x, column y, cell = "x ⪰ y ?"
    const head = `<tr><th><i class="w-var">x</i> ⪰ <i class="w-var">y</i> ?</th>${B.map((f) => `<th>${f.name}</th>`).join('')}<th>结论</th></tr>`;
    const rows = B.map((x) => {
      const cells = B.map((y) => (x.r >= y.r ? '<td class="is-yes">是</td>' : '<td class="is-no">否</td>')).join('');
      const ok = x.r === best;
      return `<tr class="${ok ? 'is-chosen' : ''}"><th>${x.name}</th>${cells}<td>${ok ? '<span class="w-ok">选中</span>' : '—'}</td></tr>`;
    }).join('');
    tableWrap.innerHTML = `<table class="w-table">${head}${rows}</table>
<p class="w-note" style="margin:6px 0 0">表格读法：第 x 行、第 y 列写的是“x ⪰ y 吗”。整行都是“是”的选项，和菜单里每一个都比过、都不差，就进入 C(B;⪰)。</p>`;
    const names = CB.map((f) => f.name).join('、');
    let why = `<p><i class="w-var">B</i> = {${B.map((f) => f.name).join('，')}}，<i class="w-var">C</i>(<i class="w-var">B</i>;⪰) = {${names}}。</p>`;
    why += `<p>${names}${CB.length > 1 ? '彼此一样好，而且都' : ''}和菜单里的每一个选项比都“不差”，所以被选中。</p>`;
    const loser = B.find((f) => f.r < best);
    if (loser) why += `<p>${loser.name}没被选中：菜单里有比它更好的${CB[0].name}，它那一行出现了“否”。</p>`;
    if (CB.length > 1) why += '<p class="w-note">注意：C(B;⪰) 可以有不止一个元素——几个选项并列最好时，它们都在里面。</p>';
    if (!chosen.has('mango')) why += '<p class="w-note">芒果最好，但它不在这次的菜单里，所以不能选它。</p>';
    status.set(why, 'ok');
  }

  function updateInterval() {
    endDot.setAttribute('fill', closed ? C.navy : '#fff');
    mark.replaceChildren();
    better.replaceChildren();
    s('circle', { cx: X(xv), cy: 80, r: 8, fill: C.orange, stroke: '#fff', 'stroke-width': 2 }, mark);
    const lt = s('text', { x: X(xv), y: 56, 'text-anchor': 'middle', fill: C.orange, 'font-weight': 700 }, mark);
    lt.textContent = `x = ${fmt(xv, 2)}`;
    if (closed && xv >= 1) {
      arc.setAttribute('d', '');
      status.set('<p>你选了 <i class="w-var">x</i> = 1。闭区间 [0, 1] <b>包含 1</b>，而菜单里没有比 1 更大的数，所以 1 就是最好的：</p><p><i class="w-var">C</i>([0, 1]) = {1}。</p><p class="w-note">把右端点“补上”，最好的选项就出现了。差别只在 1 在不在菜单里。</p>', 'ok');
      return;
    }
    const y = (xv + 1) / 2;
    s('circle', { cx: X(y), cy: 80, r: 7, fill: C.green, stroke: '#fff', 'stroke-width': 2 }, better);
    const tt = s('text', { x: X(y), y: 132, 'text-anchor': 'middle', fill: C.green, 'font-weight': 700 }, better);
    tt.textContent = `(x+1)/2 = ${fmt(y, 3)}`;
    const mx = (X(xv) + X(y)) / 2;
    arc.setAttribute('d', `M${X(xv)},70 Q${mx},${30} ${X(y)},70`);
    status.set(`<p>你选了 <i class="w-var">x</i> = ${fmt(xv, 2)}。但 (<i class="w-var">x</i>+1)/2 = ${fmt(y, 3)} 也在菜单里（它仍然小于 1），而且比 <i class="w-var">x</i> 大，按“越大越好”它更好。</p>
<p>不管你选哪个 <i class="w-var">x</i> &lt; 1，这个办法总能找到更好的，所以<b>没有最好的选项</b>：<i class="w-var">C</i>([0, 1)) = ∅。</p>
<p class="w-note">${closed ? '现在菜单是 [0, 1]：把滑块拖到 1 试试。' : '原因是 1 不在 [0, 1) 里（右端是空心圆）。勾选上面的“闭区间”再看看。'}</p>`, closed ? 'info' : 'bad');
  }

  function show(mode) {
    finite.hidden = mode !== 'finite';
    interval.hidden = mode !== 'interval';
    if (mode === 'finite') updateFinite(); else updateInterval();
  }
  show('finite');
}
