// Site behaviour: font size, nav drawer, scrollspy, keyboard paging, lightbox,
// search, glossary pop-ups and lazy-loaded interactive widgets.
// Nothing here runs on every scroll frame except the cheap progress bar.

const root = document.documentElement;
const body = document.body;
const rel = body.dataset.rel || '';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const isTyping = (el) => Boolean(el?.closest?.('input, textarea, select, [contenteditable="true"], .widget'));

// ---------------------------------------------------------------------------
// Font size
// ---------------------------------------------------------------------------

const FONT_KEY = 'am-font-scale';
function setFontScale(value) {
  const v = Math.min(1.3, Math.max(0.86, Math.round(value * 100) / 100));
  root.style.setProperty('--font-scale', String(v));
  try { localStorage.setItem(FONT_KEY, String(v)); } catch { /* private mode */ }
}
document.querySelectorAll('[data-font]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cur = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
    setFontScale(cur + 0.06 * Number(btn.dataset.font));
  });
});

// ---------------------------------------------------------------------------
// Nav drawer (narrow screens)
// ---------------------------------------------------------------------------

const nav = document.getElementById('sidenav');
const navToggle = document.querySelector('.nav-toggle');
const scrim = document.querySelector('.nav-scrim');
const narrow = matchMedia('(max-width: 1199px)');

function setNav(open) {
  body.classList.toggle('nav-open', open);
  navToggle?.setAttribute('aria-expanded', String(open));
  if (scrim) scrim.hidden = !open;
}
navToggle?.addEventListener('click', () => setNav(!body.classList.contains('nav-open')));
scrim?.addEventListener('click', () => setNav(false));
nav?.addEventListener('click', (e) => {
  if (e.target.closest('a') && narrow.matches) setNav(false);
});

// Keep the current entry of the nav in view when a page opens.
const currentNav = nav?.querySelector('.is-current');
if (currentNav && nav.scrollHeight > nav.clientHeight) {
  nav.scrollTop = Math.max(0, currentNav.offsetTop - nav.clientHeight / 3);
}

// ---------------------------------------------------------------------------
// Reading progress (one transform per animation frame)
// ---------------------------------------------------------------------------

const bar = document.querySelector('.read-progress span');
let barQueued = false;
function updateBar() {
  barQueued = false;
  const max = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
}
if (bar) {
  addEventListener('scroll', () => {
    if (!barQueued) { barQueued = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();
}

// ---------------------------------------------------------------------------
// Scrollspy for slide blocks + keyboard paging
// ---------------------------------------------------------------------------

const blocks = [...document.querySelectorAll('.slide-block')];
let currentBlock = null;

if (blocks.length) {
  const links = new Map([...document.querySelectorAll('.nav-slide')].map((a) => [a.dataset.slide, a]));
  const crumb = document.querySelector('.crumb-live');

  const setCurrent = (block) => {
    if (currentBlock === block) return;
    currentBlock = block;
    links.forEach((a) => a.classList.remove('is-active'));
    const link = links.get(block.id);
    if (link) {
      link.classList.add('is-active');
      if (nav && !narrow.matches) {
        const r = link.getBoundingClientRect();
        const nr = nav.getBoundingClientRect();
        if (r.top < nr.top + 48 || r.bottom > nr.bottom - 48) {
          nav.scrollTop += r.top - nr.top - nr.height / 3;
        }
      }
    }
    if (crumb) crumb.textContent = `第 ${block.dataset.slide} 页 · ${block.dataset.title}`;
    updateFab();
  };

  const spy = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target);
  }, { rootMargin: '-38% 0px -58% 0px' });
  blocks.forEach((b) => spy.observe(b));
}

function jumpSlide(step) {
  if (!blocks.length) return;
  const i = currentBlock ? blocks.indexOf(currentBlock) : -1;
  const target = blocks[Math.max(0, Math.min(blocks.length - 1, i + step))];
  target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

// ---------------------------------------------------------------------------
// Lightbox for slide images
// ---------------------------------------------------------------------------

const lightbox = document.querySelector('.lightbox');
const zooms = [...document.querySelectorAll('.slide-zoom')];
let lbIndex = -1;
let lbReturnFocus = null;

function showLightbox(i) {
  if (!lightbox || !zooms[i]) return;
  lbIndex = i;
  const z = zooms[i];
  const img = lightbox.querySelector('img');
  img.src = z.dataset.src;
  img.alt = z.querySelector('img')?.alt ?? '';
  lightbox.querySelector('figcaption').textContent = z.dataset.caption ?? '';
  lightbox.querySelector('.lb-prev').hidden = i === 0;
  lightbox.querySelector('.lb-next').hidden = i === zooms.length - 1;
  if (lightbox.hidden) {
    lbReturnFocus = document.activeElement;
    lightbox.hidden = false;
    lightbox.querySelector('.lb-close').focus();
  }
}
function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lbReturnFocus?.focus?.();
}
zooms.forEach((z, i) => z.addEventListener('click', () => showLightbox(i)));

// Narrow screens: once the slide image of the current page has scrolled away,
// a floating button reopens it in the lightbox.
const fab = document.querySelector('.slide-fab');
const stacked = matchMedia('(max-width: 1023px)');
const visibleFigures = new Set();
function updateFab() {
  if (!fab) return;
  const fig = currentBlock?.querySelector('.slide-figure');
  const show = Boolean(stacked.matches && fig && !visibleFigures.has(fig));
  fab.hidden = !show;
  if (show) fab.querySelector('span').textContent = `看课件 · 第 ${currentBlock.dataset.slide} 页`;
}
if (fab && blocks.length) {
  const figSpy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleFigures.add(entry.target); else visibleFigures.delete(entry.target);
    }
    updateFab();
  });
  document.querySelectorAll('.slide-figure').forEach((f) => figSpy.observe(f));
  stacked.addEventListener('change', updateFab);
  fab.addEventListener('click', () => {
    const z = currentBlock?.querySelector('.slide-zoom');
    if (z) showLightbox(zooms.indexOf(z));
  });
}
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightbox?.querySelector('.lb-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lb-prev')?.addEventListener('click', () => showLightbox(lbIndex - 1));
lightbox?.querySelector('.lb-next')?.addEventListener('click', () => showLightbox(lbIndex + 1));

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

const panel = document.querySelector('.search-panel');
const input = panel?.querySelector('input');
const list = panel?.querySelector('.search-results');
let index = null;
let indexPromise = null;
let results = [];
let active = 0;

function loadIndex() {
  indexPromise ??= fetch(`${rel}search-index.json`)
    .then((r) => r.json())
    .then((data) => {
      index = data.map((it) => ({
        ...it,
        head: `${it.t} ${it.e}`.toLowerCase(),
        hay: `${it.t} ${it.e} ${it.s} ${it.x}`.toLowerCase(),
      }));
      return index;
    })
    .catch(() => { index = []; return index; });
  return indexPromise;
}

function openSearch() {
  if (!panel) return;
  panel.hidden = false;
  input.focus();
  input.select();
  loadIndex().then(runSearch);
}
function closeSearch() {
  if (panel) panel.hidden = true;
}

function snippet(text, terms) {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  if (at < 0) at = 0;
  const start = Math.max(0, at - 36);
  let s = escapeHtml(text.slice(start, start + 110));
  if (start > 0) s = `…${s}`;
  if (start + 110 < text.length) s += '…';
  for (const t of terms) {
    const re = new RegExp(escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    s = s.replace(re, (m) => `<mark>${m}</mark>`);
  }
  return s;
}

function runSearch() {
  if (!index || !list) return;
  const q = input.value.trim().toLowerCase();
  if (!q) {
    results = [];
    list.innerHTML = '<li class="search-empty">输入关键词开始搜索，例如“完备性”“HARP”“拟凹”“第 15 页”。</li>';
    return;
  }
  const terms = q.split(/\s+/).filter(Boolean);
  results = [];
  for (const it of index) {
    if (!terms.every((t) => it.hay.includes(t))) continue;
    let score = 0;
    for (const t of terms) {
      if (it.head.includes(t)) score += 20;
      score += Math.min(8, it.hay.split(t).length - 1);
    }
    results.push({ it, score });
  }
  results.sort((a, b) => b.score - a.score);
  results = results.slice(0, 40);
  active = 0;
  if (!results.length) {
    list.innerHTML = '<li class="search-empty">没有找到。换个说法试试，或者用英文术语搜索。</li>';
    return;
  }
  list.innerHTML = results.map(({ it }, i) => `<li><a href="${rel}${it.u}"${i === 0 ? ' class="is-active"' : ''}>
<span class="sr-title">${escapeHtml(it.t)}</span>
<span class="sr-meta">${escapeHtml(it.s)}${it.e ? ` · ${escapeHtml(it.e)}` : ''}</span>
<span class="sr-snippet">${snippet(it.x || it.t, terms)}</span></a></li>`).join('');
}

function moveActive(step) {
  const anchors = list.querySelectorAll('a');
  if (!anchors.length) return;
  anchors[active]?.classList.remove('is-active');
  active = (active + step + anchors.length) % anchors.length;
  anchors[active].classList.add('is-active');
  anchors[active].scrollIntoView({ block: 'nearest' });
}

input?.addEventListener('input', () => { if (index) runSearch(); });
input?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
  if (e.key === 'Enter') {
    const a = list.querySelectorAll('a')[active];
    if (a) { e.preventDefault(); closeSearch(); location.href = a.href; }
  }
});
panel?.addEventListener('click', (e) => {
  if (e.target === panel) closeSearch();
  if (e.target.closest('a')) closeSearch();
});
document.querySelector('.search-open')?.addEventListener('click', openSearch);

// ---------------------------------------------------------------------------
// Glossary pop-ups
// ---------------------------------------------------------------------------

const pop = document.querySelector('.term-pop');
let glossary = null;
let glossaryPromise = null;
let popFor = null;
let hideTimer = 0;
let showTimer = 0;

function loadGlossary() {
  glossaryPromise ??= fetch(`${rel}glossary.json`)
    .then((r) => r.json())
    .then((d) => { glossary = d; return d; })
    .catch(() => { glossary = {}; return glossary; });
  return glossaryPromise;
}

async function showTerm(el) {
  await loadGlossary();
  const t = glossary[el.dataset.k];
  if (!t || !pop) return;
  pop.innerHTML = `<div class="tp-head"><span class="tp-zh">${escapeHtml(t.zh)}</span><span class="tp-en">${escapeHtml(t.en)}</span></div>
<div class="tp-body">${t.html}</div>${t.where ? `<a class="tp-where" href="${rel}${t.where}">去看首次讲解 →</a>` : ''}`;
  pop.hidden = false;
  const r = el.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  let left = r.left + scrollX;
  left = Math.max(scrollX + 8, Math.min(left, scrollX + innerWidth - w - 12));
  let top = r.bottom + scrollY + 8;
  if (r.bottom + h + 16 > innerHeight && r.top - h - 8 > 0) top = r.top + scrollY - h - 8;
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  popFor = el;
}
function hideTerm() {
  clearTimeout(showTimer);
  if (pop) pop.hidden = true;
  popFor = null;
}

document.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const term = e.target.closest?.('.term');
  if (term) {
    clearTimeout(hideTimer);
    if (term !== popFor) {
      clearTimeout(showTimer);
      showTimer = setTimeout(() => showTerm(term), 140);
    }
  } else if (e.target.closest?.('.term-pop')) {
    clearTimeout(hideTimer);
  }
});
document.addEventListener('pointerout', (e) => {
  if (e.pointerType !== 'mouse') return;
  if (e.target.closest?.('.term, .term-pop')) {
    clearTimeout(showTimer);
    hideTimer = setTimeout(hideTerm, 220);
  }
});
document.addEventListener('click', (e) => {
  const term = e.target.closest('.term');
  if (term) {
    if (popFor === term) hideTerm(); else showTerm(term);
    return;
  }
  if (!e.target.closest('.term-pop')) hideTerm();
});
document.addEventListener('focusin', (e) => {
  const term = e.target.closest?.('.term');
  if (term) showTerm(term);
});
document.addEventListener('focusout', (e) => {
  if (e.target.closest?.('.term')) hideTimer = setTimeout(hideTerm, 220);
});

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

addEventListener('keydown', (e) => {
  if (lightbox && !lightbox.hidden) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbIndex > 0) showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight' && lbIndex < zooms.length - 1) showLightbox(lbIndex + 1);
    return;
  }
  if (panel && !panel.hidden) {
    if (e.key === 'Escape') closeSearch();
    return;
  }
  if (e.key === 'Escape') { hideTerm(); setNav(false); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
  if (e.key === '/') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'ArrowRight') { e.preventDefault(); jumpSlide(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); jumpSlide(-1); }
});

// ---------------------------------------------------------------------------
// Interactive widgets: load only when close to the viewport
// ---------------------------------------------------------------------------

async function mountWidget(fig) {
  const name = fig.dataset.widget;
  const stage = fig.querySelector('.widget-stage');
  let opts = {};
  try { opts = JSON.parse(fig.dataset.opts || '{}'); } catch { /* keep defaults */ }
  try {
    const mod = await import(new URL(`./widgets/${name}.js`, import.meta.url).href);
    stage.replaceChildren();
    mod.mount(stage, opts);
  } catch (err) {
    console.error(`widget ${name} failed`, err);
    stage.innerHTML = '<p class="widget-error">这个交互图暂时没能加载。可以先看正文里的文字讲解和例子，或者刷新页面再试。</p>';
  }
}

const widgets = document.querySelectorAll('.widget[data-widget]');
if (widgets.length) {
  const wio = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      wio.unobserve(entry.target);
      mountWidget(entry.target);
    }
  }, { rootMargin: '700px 0px' });
  widgets.forEach((w) => wio.observe(w));
}

// ---------------------------------------------------------------------------
// Glossary page filter
// ---------------------------------------------------------------------------

const glFilter = document.querySelector('.gl-filter');
glFilter?.addEventListener('input', () => {
  const q = glFilter.value.trim().toLowerCase();
  document.querySelectorAll('.gl-item').forEach((li) => {
    li.hidden = Boolean(q) && !li.dataset.filter.includes(q);
  });
});
