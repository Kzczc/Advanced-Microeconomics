// Shared helpers for the interactive widgets (plain DOM + SVG, no libraries).

export const C = {
  ink: '#1d2433', ink2: '#4a5263', muted: '#8a90a0', line: '#e3dfd6', grid: '#ece8df',
  navy: '#1f4e8c', blue: '#3b73c4', red: '#c0392b', teal: '#0f7b6c', orange: '#d97706',
  purple: '#6d28d9', green: '#2f7d32', gray: '#6b7280',
  fillBlue: '#dbe7f6', fillRed: '#f8dcd8', fillTeal: '#d5efe9', fillOrange: '#fdecd3',
  fillGray: '#eceae4', fillPurple: '#ebe4fb',
};

const NS = 'http://www.w3.org/2000/svg';
let counter = 0;
export const uid = (p = 'w') => `${p}-${(counter += 1)}-${Math.random().toString(36).slice(2, 6)}`;

/** Create an SVG element. */
export function s(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined && v !== false) el.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(el);
  return el;
}

/** Create an HTML element. `attrs.class`, `attrs.html`, `attrs.text`, `attrs.onclick`… */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** Linear scale with .invert. */
export function linear(d0, d1, r0, r1) {
  const k = (r1 - r0) / (d1 - d0);
  const f = (v) => r0 + (v - d0) * k;
  f.invert = (p) => d0 + (p - r0) / k;
  return f;
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const fmt = (v, d = 2) => {
  const r = Number(v).toFixed(d);
  return r === `-${(0).toFixed(d)}` ? (0).toFixed(d) : r;
};

/** Put simple math into an SVG <text>: letters become italic, `_1` subscripts, `^2` superscripts. */
export function mathText(textEl, str) {
  textEl.textContent = '';
  const re = /([_^])(\{[^}]*\}|.)|([A-Za-z])|([^A-Za-z_^]+)/g;
  let m;
  while ((m = re.exec(str))) {
    if (m[1]) {
      const body = m[2].startsWith('{') ? m[2].slice(1, -1) : m[2];
      const t = s('tspan', { 'font-size': '0.72em', 'baseline-shift': m[1] === '_' ? 'sub' : 'super' }, textEl);
      t.textContent = body;
    } else if (m[3]) {
      const t = s('tspan', { class: 'w-var' }, textEl);
      t.textContent = m[3];
    } else {
      textEl.appendChild(document.createTextNode(m[4]));
    }
  }
  return textEl;
}

/** HTML version of mathText for status panels and labels. */
export function mathHtml(str) {
  return String(str)
    .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .replace(/_(\{[^}]*\}|.)/g, (_, b) => `<sub>${b.replace(/^\{|\}$/g, '')}</sub>`)
    .replace(/\^(\{[^}]*\}|.)/g, (_, b) => `<sup>${b.replace(/^\{|\}$/g, '')}</sup>`)
    .replace(/(^|[^A-Za-z<\/])([A-Za-z])(?![A-Za-z>])/g, '$1<i class="w-var">$2</i>');
}

/** An <svg> that scales with its container. */
export function makeSvg(W, H, label) {
  return s('svg', {
    viewBox: `0 0 ${W} ${H}`, class: 'w-svg', role: 'img', 'aria-label': label ?? '交互图',
    preserveAspectRatio: 'xMidYMid meet',
  });
}

/** Arrow-head marker; returns the url(#id) string. */
export function arrowMarker(svgEl, color = C.ink2, size = 7) {
  let defs = svgEl.querySelector('defs');
  if (!defs) defs = s('defs', {}, svgEl);
  const id = uid('arrow');
  const m = s('marker', {
    id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: size, markerHeight: size,
    orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse',
  }, defs);
  s('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }, m);
  return `url(#${id})`;
}

/**
 * Draw a textbook-style plot frame: axes with arrows from the lower-left
 * corner, axis labels at the tips, optional ticks. Returns scales and layers.
 */
export function plotFrame(svgEl, {
  W, H, pad = { l: 46, r: 22, t: 18, b: 40 }, x, y, xlabel, ylabel, xticks = [], yticks = [], grid = false,
}) {
  const X = linear(x[0], x[1], pad.l, W - pad.r);
  const Y = linear(y[0], y[1], H - pad.b, pad.t);
  const back = s('g', { class: 'w-layer-back' }, svgEl);
  const mid = s('g', { class: 'w-layer-mid' }, svgEl);
  const front = s('g', { class: 'w-layer-front' }, svgEl);
  const axisColor = C.ink2;
  if (grid) {
    for (const t of xticks) s('line', { x1: X(t), y1: Y(y[0]), x2: X(t), y2: Y(y[1]), stroke: C.grid, 'stroke-width': 1 }, back);
    for (const t of yticks) s('line', { x1: X(x[0]), y1: Y(t), x2: X(x[1]), y2: Y(t), stroke: C.grid, 'stroke-width': 1 }, back);
  }
  const marker = arrowMarker(svgEl, axisColor);
  // Axes go through 0 when 0 is inside the range, otherwise along the lower/left edge.
  const ox = X(x[0] <= 0 && x[1] >= 0 ? 0 : x[0]);
  const oy = Y(y[0] <= 0 && y[1] >= 0 ? 0 : y[0]);
  s('line', { x1: X(x[0]), y1: oy, x2: X(x[1]) + 6, y2: oy, stroke: axisColor, 'stroke-width': 1.1, 'marker-end': marker }, back);
  s('line', { x1: ox, y1: Y(y[0]), x2: ox, y2: Y(y[1]) - 6, stroke: axisColor, 'stroke-width': 1.1, 'marker-end': marker }, back);
  for (const t of xticks) {
    s('line', { x1: X(t), y1: oy, x2: X(t), y2: oy + 4, stroke: axisColor, 'stroke-width': 1 }, back);
    const tx = s('text', { x: X(t), y: oy + 17, 'text-anchor': 'middle', class: 'w-tick' }, back);
    tx.textContent = String(t);
  }
  for (const t of yticks) {
    s('line', { x1: ox - 4, y1: Y(t), x2: ox, y2: Y(t), stroke: axisColor, 'stroke-width': 1 }, back);
    const ty = s('text', { x: ox - 8, y: Y(t) + 4, 'text-anchor': 'end', class: 'w-tick' }, back);
    ty.textContent = String(t);
  }
  if (xlabel) mathText(s('text', { x: X(x[1]) + 4, y: oy + 34, 'text-anchor': 'end', class: 'w-axis-label' }, back), xlabel);
  if (ylabel) mathText(s('text', { x: ox + 8, y: Y(y[1]) + 4, 'text-anchor': 'start', class: 'w-axis-label' }, back), ylabel);
  return { X, Y, back, mid, front };
}

/** Convert a pointer event to SVG user coordinates. */
export function svgPoint(svgEl, evt) {
  const pt = svgEl.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
}

/** Make an SVG element draggable (mouse + touch). onDrag receives SVG coordinates. */
export function draggable(svgEl, el, onDrag, onEnd) {
  el.classList.add('w-handle');
  let frame = 0;
  let last = null;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
    const move = (ev) => {
      last = svgPoint(svgEl, ev);
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; onDrag(last); });
    };
    const up = () => {
      el.classList.remove('is-dragging');
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      onEnd?.();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
}

/** A draggable point: a big transparent hit area plus a visible dot. */
export function handlePoint(svgEl, layer, { color = C.navy, r = 7, label = '' } = {}) {
  const g = s('g', { class: 'w-point' }, layer);
  const hit = s('circle', { r: 18, fill: 'transparent' }, g);
  const dot = s('circle', { r, fill: color, stroke: '#fff', 'stroke-width': 2 }, g);
  const text = s('text', { class: 'w-point-label', fill: color }, g);
  if (label) mathText(text, label);
  return {
    g, hit, dot, text,
    move(x, y, lx = 10, ly = -10) {
      g.setAttribute('transform', `translate(${x},${y})`);
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
    },
  };
}

/** Segmented buttons. options: [[value, label], ...] */
export function segmented(options, value, onChange, ariaLabel) {
  const wrap = h('div', { class: 'w-seg', role: 'group', 'aria-label': ariaLabel ?? '' });
  const btns = options.map(([v, label]) => {
    const b = h('button', { type: 'button', class: 'w-btn', html: label });
    b.addEventListener('click', () => { set(v); onChange(v); });
    wrap.append(b);
    return [v, b];
  });
  function set(v) {
    for (const [bv, b] of btns) b.setAttribute('aria-pressed', String(bv === v));
  }
  set(value);
  return { el: wrap, set };
}

/** Labelled <select>. options: [[value, label], ...] */
export function selectBox(label, options, value, onChange) {
  const sel = h('select', { class: 'w-select' });
  for (const [v, l] of options) sel.append(h('option', { value: v, text: l }));
  sel.value = value;
  sel.addEventListener('change', () => onChange(sel.value));
  const el = h('label', { class: 'w-field' }, h('span', { class: 'w-field-label', html: label }), sel);
  return { el, sel, set(v) { sel.value = v; } };
}

/** Labelled range slider with live value. */
export function slider({ label, min, max, step, value, format = (v) => fmt(v, 2), onInput }) {
  const input = h('input', { type: 'range', class: 'w-range', min, max, step, value });
  const out = h('output', { class: 'w-range-value', text: format(Number(value)) });
  input.addEventListener('input', () => {
    out.textContent = format(Number(input.value));
    onInput(Number(input.value));
  });
  const el = h('label', { class: 'w-field w-field-range' }, h('span', { class: 'w-field-label', html: label }), input, out);
  return {
    el, input,
    set(v) { input.value = v; out.textContent = format(Number(v)); },
    setRange(lo, hi, st) { input.min = lo; input.max = hi; if (st) input.step = st; },
  };
}

/** Status panel: explanation in plain Chinese. tone: 'ok' | 'bad' | 'info' */
export function statusPanel() {
  const el = h('div', { class: 'w-status', 'aria-live': 'polite' });
  return {
    el,
    set(html, tone = 'info') {
      el.className = `w-status is-${tone}`;
      el.innerHTML = html;
    },
  };
}

/** Standard widget skeleton: plot area + side column (controls, status). */
export function skeleton(stage, { title } = {}) {
  stage.replaceChildren();
  const root = h('div', { class: 'w-root' });
  if (title) root.append(h('div', { class: 'w-title', html: title }));
  const grid = h('div', { class: 'w-grid' });
  const plot = h('div', { class: 'w-plot' });
  const side = h('div', { class: 'w-side' });
  grid.append(plot, side);
  root.append(grid);
  stage.append(root);
  return { root, grid, plot, side };
}

/** Polyline "d" attribute from [[x,y], ...] in screen coordinates. */
export const pathD = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
