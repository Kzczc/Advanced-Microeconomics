// harp-checker: choose C(A) for every menu A ⊆ {x, y, z}, check HARP and
// build the revealed preference relation ⪰_c (pages 9–12).
import { h, segmented, statusPanel, skeleton } from './_shared.js';

const X = ['x', 'y', 'z'];
const MENUS = [['x', 'y'], ['x', 'z'], ['y', 'z'], ['x', 'y', 'z']];
const PRESETS = {
  rational: [['x'], ['x'], ['y'], ['x']],
  violate: [['y'], ['x'], ['y'], ['x']],
  indiff: [['x', 'y'], ['x', 'z'], ['y', 'z'], ['x', 'y', 'z']],
};

const v = (e) => `<i class="w-var">${e}</i>`;
const set = (arr) => `{${arr.map(v).join(', ')}}`;

export function mount(stage) {
  const choice = PRESETS.rational.map((c) => new Set(c));
  const { plot, side } = skeleton(stage);

  const presets = segmented([
    ['rational', '理性的例子'],
    ['violate', '违反 HARP'],
    ['indiff', '全部无差异'],
  ], 'rational', (p) => {
    PRESETS[p].forEach((c, i) => { choice[i] = new Set(c); });
    update();
  }, '预设');
  plot.append(h('div', { class: 'w-controls', style: 'margin-bottom:8px' }, presets.el));
  plot.append(h('p', { class: 'w-note', style: 'margin:0 0 4px', html: '每一行是一个菜单 <i class="w-var">A</i>。点选这个人从菜单里选了哪些（可以多选，表示一样好，但不能一个都不选）。单元素菜单只能选它自己：<i class="w-var">C</i>({<i class="w-var">x</i>}) = {<i class="w-var">x</i>}。' }));

  const rows = MENUS.map((menu, mi) => {
    const chips = menu.map((e) => {
      const b = h('button', { type: 'button', class: 'w-chip', html: v(e) });
      b.addEventListener('click', () => {
        const c = choice[mi];
        if (c.has(e) && c.size === 1) { flash(mi); return; }
        if (c.has(e)) c.delete(e); else c.add(e);
        presets.set(null);
        update();
      });
      return [e, b];
    });
    const hint = h('span', { class: 'w-note' });
    const row = h('div', { class: 'w-menu-row' },
      h('span', { class: 'w-menu-name', html: `<i class="w-var">C</i>(${set(menu)})` }),
      h('span', { class: 'w-arrow', text: '=' }),
      h('div', { class: 'w-chips' }, chips.map(([, b]) => b)),
      hint);
    plot.append(row);
    return { chips, hint };
  });
  const tableWrap = h('div', { class: 'w-table-wrap', style: 'margin-top:12px' });
  plot.append(tableWrap);

  const status = statusPanel();
  side.append(status.el);

  function flash(mi) {
    rows[mi].hint.textContent = '至少要选一个（选择规则不能是空集）';
    setTimeout(() => { rows[mi].hint.textContent = ''; }, 2200);
  }

  // All menus including singletons, with their choices.
  function allMenus() {
    const list = X.map((e) => ({ menu: [e], c: new Set([e]) }));
    MENUS.forEach((menu, i) => list.push({ menu, c: choice[i] }));
    return list;
  }

  function update() {
    rows.forEach(({ chips }, mi) => {
      for (const [e, b] of chips) b.setAttribute('aria-pressed', String(choice[mi].has(e)));
    });

    // HARP: x, y ∈ A ∩ B, x ∈ C(A), y ∈ C(B)  ⇒  x ∈ C(B) and y ∈ C(A).
    const violations = [];
    const seen = new Set();
    MENUS.forEach((A, ia) => {
      MENUS.forEach((B, ib) => {
        if (ia === ib) return;
        for (const x of A) {
          for (const y of B) {
            if (x === y || !A.includes(y) || !B.includes(x)) continue;
            if (!choice[ia].has(x) || !choice[ib].has(y)) continue;
            const okX = choice[ib].has(x);
            const okY = choice[ia].has(y);
            if (okX && okY) continue;
            const key = [ia, ib].sort().join('-') + [x, y].sort().join('');
            if (seen.has(key)) continue;
            seen.add(key);
            const miss = [];
            if (!okX) miss.push(`${v(x)} 不在 <i class="w-var">C</i>(${set(B)}) 里`);
            if (!okY) miss.push(`${v(y)} 不在 <i class="w-var">C</i>(${set(A)}) 里`);
            violations.push(`菜单 ${set(A)} 选了 ${v(x)}，菜单 ${set(B)} 选了 ${v(y)}，而 ${v(x)}、${v(y)} 两个菜单里都有。HARP 要求 ${v(x)} 也被 ${set(B)} 选中、${v(y)} 也被 ${set(A)} 选中，但${miss.join('，')}。`);
          }
        }
      });
    });

    // Revealed preference: a ⪰_c b  iff some menu contains b and chooses a.
    const menus = allMenus();
    const rp = X.map((a) => X.map((b) => menus.find(({ menu, c }) => menu.includes(b) && c.has(a))));
    const head = `<tr><th>a ⪰<sub>c</sub> b ?</th>${X.map((b) => `<th>b = ${v(b)}</th>`).join('')}</tr>`;
    const body = X.map((a, i) => `<tr><th>a = ${v(a)}</th>${X.map((b, j) => {
      const m = rp[i][j];
      return m ? `<td class="is-yes">是 <span class="w-note">（${set(m.menu)}）</span></td>` : '<td class="is-no">否</td>';
    }).join('')}</tr>`).join('');
    tableWrap.innerHTML = `<p class="w-note" style="margin:0 0 4px">显示偏好表：如果某个菜单里有 b、而且选了 a，就说 a 被<b>显示偏好</b>于 b（括号里是证据来自哪个菜单）。</p><table class="w-table">${head}${body}</table>`;

    if (violations.length) {
      status.set(`<p><span class="w-bad">HARP 不成立。</span></p><ul>${violations.slice(0, 3).map((t) => `<li>${t}</li>`).join('')}</ul>
<p><b>结论：</b>找不到任何一套完备、传递的偏好，能同时解释这些选择（命题 2 的“只有当”方向）。</p>`, 'bad');
      return;
    }
    // HARP holds: ⪰_c is complete and transitive; read off a ranking.
    const W = rp.map((r) => r.map(Boolean));
    const score = X.map((_, i) => W[i].filter(Boolean).length);
    const order = [0, 1, 2].sort((p, q) => score[q] - score[p]);
    let line = v(X[order[0]]);
    for (let t = 1; t < 3; t += 1) line += W[order[t]][order[t - 1]] ? ` ∼ ${v(X[order[t]])}` : ` ≻ ${v(X[order[t]])}`;
    status.set(`<p><span class="w-ok">HARP 成立：</span>任何两个菜单都没有互相矛盾的选择。</p>
<p><b>结论：</b>这些选择可以被一套理性偏好解释，就是上表的显示偏好：${line}。在每个菜单里，被选中的正好是这套排序下最好的那些（命题 2 的“当”方向）。</p>`, 'ok');
  }

  update();
}
