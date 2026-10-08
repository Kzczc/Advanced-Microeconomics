// separability: Definition 10 and Proposition 6 with a drinks-and-dishes table (page 21).
// Rows fix one component, the chips choose the menu for the other; the best choice in each row is
// highlighted, so the reader can see whether x*(S, y) moves with y — and that the reverse
// direction can behave differently (the asymmetry stressed in the reading).
import { h, segmented, statusPanel, skeleton } from './_shared.js';

const DRINKS = ['红酒', '白葡萄酒', '啤酒', '果汁'];
const DISHES = ['牛排', '清蒸鱼', '烧烤'];

// Xiao Lin: u(x, y) = m(y) · v(x) + w(y), i.e. U(v(x), y) with U increasing in v.
const V = [4, 3, 2, 1];
const M = [1.5, 1, 1.2];
const W = [5, 6.2, 4];
// Xiao Zhou: which drink is best depends on the dish (wine pairing).
const ZHOU = [
  [9, 5, 6, 3],
  [4, 9, 5, 4],
  [5, 4, 9, 6],
];

const PEOPLE = {
  lin: { name: '小林', tag: '可分', u: (d, k) => M[k] * V[d] + W[k] },
  zhou: { name: '小周', tag: '不可分', u: (d, k) => ZHOU[k][d] },
};

const num = (v) => {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};
const sameSet = (a, b) => a.length === b.length && a.every((v) => b.includes(v));
const names = (list, idx) => idx.map((i) => list[i]).join('、');

export function mount(stage, opts = {}) {
  let person = PEOPLE[opts.person] ? opts.person : 'lin';
  let dir = opts.dir === 'y' ? 'y' : 'x';
  const menus = { x: [0, 1, 2, 3], y: [0, 1, 2] };

  const { root, plot, side } = skeleton(stage);
  const segPerson = segmented([['lin', '小林（可分）'], ['zhou', '小周（不可分）']], person, (v) => {
    person = v; draw();
  }, '选择人物');
  const segDir = segmented([['x', '固定主菜，选饮料'], ['y', '固定饮料，选主菜']], dir, (v) => {
    dir = v; draw();
  }, '选择方向');
  root.prepend(h('div', { class: 'w-controls', style: 'margin-bottom:10px' }, segPerson.el, segDir.el));

  const tableWrap = h('div', { class: 'w-table-wrap' });
  const formula = h('p', { class: 'w-note', style: 'margin:8px 0 0' });
  plot.append(tableWrap, formula);

  const chipLabel = h('div', { class: 'w-field-label', style: 'margin-bottom:4px' });
  const chips = h('div', { class: 'w-chips' });
  const checkAll = h('button', { type: 'button', class: 'w-btn is-preset' });
  const status = statusPanel();
  side.append(h('div', {}, chipLabel, chips), h('div', { class: 'w-controls' }, checkAll), status.el);

  // Rows are the fixed component, columns the options being chosen.
  const layout = () => (dir === 'x'
    ? { rows: DISHES, cols: DRINKS, u: (r, c) => PEOPLE[person].u(c, r), rowName: '主菜 y', colName: '饮料' }
    : { rows: DRINKS, cols: DISHES, u: (r, c) => PEOPLE[person].u(r, c), rowName: '饮料 x', colName: '主菜' });

  function bestIn(menu, r, L) {
    const top = Math.max(...menu.map((c) => L.u(r, c)));
    return menu.filter((c) => Math.abs(L.u(r, c) - top) < 1e-9);
  }

  function rowsAgree(menu, L) {
    const first = bestIn(menu, 0, L);
    return L.rows.every((_, r) => sameSet(bestIn(menu, r, L), first));
  }

  function allMenus(n) {
    const out = [];
    for (let mask = 1; mask < 1 << n; mask += 1) {
      out.push([...Array(n).keys()].filter((i) => mask & (1 << i)));
    }
    return out;
  }

  checkAll.addEventListener('click', () => {
    const L = layout();
    const list = allMenus(L.cols.length);
    const bad = list.filter((menu) => !rowsAgree(menu, L));
    if (bad.length) {
      const pick = bad.find((m) => m.length === 2) ?? bad[0];
      menus[dir] = pick;
      draw(`<p><b>检查了全部 ${list.length} 个菜单：</b>有 ${bad.length} 个菜单的最优选择会随着${L.rowName.slice(0, 2)}改变。已把菜单换成其中一个：{${names(L.cols, pick)}}。</p>`);
    } else {
      draw(`<p><b>检查了全部 ${list.length} 个菜单：</b>每一个菜单下，各行的最优选择都一样。</p>`);
    }
  });

  function draw(extra = '') {
    const L = layout();
    const menu = menus[dir];
    const P = PEOPLE[person];

    chipLabel.innerHTML = `菜单（${L.colName}里能选哪些，至少留一样）：`;
    chips.replaceChildren(...L.cols.map((name, c) => {
      const on = menu.includes(c);
      const b = h('button', { type: 'button', class: 'w-chip', 'aria-pressed': String(on), text: name });
      b.addEventListener('click', () => {
        if (on && menu.length === 1) return;
        menus[dir] = on ? menu.filter((i) => i !== c) : [...menu, c].sort((a, z) => a - z);
        draw();
      });
      return b;
    }));
    checkAll.textContent = `检查所有 ${2 ** L.cols.length - 1} 个菜单`;

    const head = h('tr', {}, h('th', { text: L.rowName }),
      ...L.cols.map((name, c) => h('th', { text: name, style: menu.includes(c) ? '' : 'opacity:.4' })),
      h('th', { text: '最优' }));
    const body = L.rows.map((rowName, r) => {
      const best = bestIn(menu, r, L);
      return h('tr', {}, h('th', { text: rowName }),
        ...L.cols.map((_, c) => {
          const val = num(L.u(r, c));
          if (!menu.includes(c)) return h('td', { class: 'is-no', style: 'opacity:.45', text: val });
          return best.includes(c)
            ? h('td', { text: val, style: 'background:#edf7ef;color:#2f7d32;font-weight:700' })
            : h('td', { text: val });
        }),
        h('td', { text: names(L.cols, best), style: 'font-weight:700' }));
    });
    const table = h('table', { class: 'w-table is-compact' }, h('thead', {}, head), h('tbody', {}, ...body));
    if (person === 'lin' && dir === 'x') {
      table.append(h('tfoot', {}, h('tr', {}, h('th', { text: '分数 v(x)' }),
        ...V.map((v) => h('td', { text: String(v) })), h('td', { text: '' }))));
    }
    tableWrap.replaceChildren(table);
    formula.innerHTML = person === 'lin'
      ? '表中是效用分数。小林：<i class="w-var">u</i>(<i class="w-var">x</i>, <i class="w-var">y</i>) = <i class="w-var">m</i>(<i class="w-var">y</i>)·<i class="w-var">v</i>(<i class="w-var">x</i>) + <i class="w-var">w</i>(<i class="w-var">y</i>)，主菜只把饮料分数放大（<i class="w-var">m</i> &gt; 0）再加一个数。'
      : '表中是效用分数。小周讲究搭配：牛排配红酒、清蒸鱼配白葡萄酒、烧烤配啤酒。';

    const agree = rowsAgree(menu, L);
    const bestRows = L.rows.map((_, r) => bestIn(menu, r, L));
    const listRows = L.rows.map((rowName, r) => `${rowName}→${names(L.cols, bestRows[r])}`).join('，');
    let msg;
    if (dir === 'x') {
      if (person === 'lin') {
        msg = `<p><span class="w-ok">每一行的最优饮料都一样</span>（${listRows}）：<i class="w-var">x</i>*(<i class="w-var">S</i>, <i class="w-var">y</i>) 不随主菜 <i class="w-var">y</i> 改变。</p>
<p>换任何菜单都是这样（可以点“检查所有菜单”）。原因就是命题 6：小林的效用能写成 <i class="w-var">U</i>(<i class="w-var">v</i>(<i class="w-var">x</i>), <i class="w-var">y</i>)。饮料先得到一个固定分数 <i class="w-var">v</i>（最后一行），主菜只会把分数放大、再加一个数，不会改变饮料之间谁高谁低。注意各行的数字并不相同，但<b>排序</b>相同。</p>`;
      } else if (agree) {
        msg = `<p>这个菜单下，各行碰巧选的一样（${listRows}）。</p>
<p>但定义 10 要求对<b>每一个</b>菜单都成立。点“检查所有菜单”，或者把菜单换成 {红酒、白葡萄酒} 看看。</p>`;
      } else {
        msg = `<p><span class="w-bad">最优饮料随主菜改变</span>：${listRows}。<i class="w-var">x</i>*(<i class="w-var">S</i>, <i class="w-var">y</i>) 依赖 <i class="w-var">y</i>，不满足定义 10。</p>
<p>按命题 6，小周的效用写不成 <i class="w-var">U</i>(<i class="w-var">v</i>(<i class="w-var">x</i>), <i class="w-var">y</i>)：找不到一个“只看饮料”的分数，因为红酒和白葡萄酒谁更好，要看配什么菜。</p>`;
      }
    } else if (agree) {
      msg = `<p>这个菜单下，各行选的主菜一样（${listRows}）。换几个菜单，或者点“检查所有菜单”。</p>`;
    } else {
      msg = `<p><span class="w-bad">最优主菜随饮料改变</span>：${listRows}。</p>
${person === 'lin'
    ? '<p>小林的<b>饮料</b>选择不依赖主菜，可她的<b>主菜</b>选择却依赖饮料。这就是阅读材料强调的<b>不对称</b>：“<i class="w-var">x</i> 的选择不依赖 <i class="w-var">y</i>”和“<i class="w-var">y</i> 的选择不依赖 <i class="w-var">x</i>”是两回事，命题 6 只保证前一个。</p>'
    : '<p>小周两个方向都依赖：饮料要看主菜，主菜也要看饮料。</p>'}`;
    }
    status.set(`${extra}${msg}`, dir === 'x' && person === 'lin' ? 'ok' : (agree ? 'info' : 'bad'));
    segPerson.set(person);
    segDir.set(dir);
  }

  draw();
}
