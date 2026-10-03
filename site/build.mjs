// Build the static site:  content/ + public/ + site/assets/  ->  dist/
//
//   node site/build.mjs          # build everything
//
// All math is rendered here with KaTeX; the browser never typesets formulas.
// Every link in the output is relative, because the site is served from the
// sub-path /Advanced-Microeconomics/ on GitHub Pages and from / locally.

import {
  cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString as hastToString } from 'hast-util-to-string';
import {
  BASICS_ANCHORS, BOXES, INNER_CONTAINERS, KATEX_MACROS, WIDGETS,
} from './lib/spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const DIST = path.join(ROOT, 'dist');
const SITE_NAME = '高级微观经济学 · 逐页精讲';

const problems = [];
const report = (level, where, msg) => problems.push({ level, where, msg });

const readText = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
const pid = (n) => `p${String(n).padStart(2, '0')}`;
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Course structure
// ---------------------------------------------------------------------------

const course = yaml.load(readText('content/course.yaml'));
const lectures = course.lectures;
for (const lec of lectures) {
  lec.sectionOf = new Map();
  (lec.sections ?? []).forEach((sec, i) => {
    sec.index = i;
    for (const n of sec.slides) lec.sectionOf.set(n, sec);
  });
}
const basicsPages = course.basics ?? [];

const relFor = (outPath) => '../'.repeat(outPath.split('/').length - 1);

function resolveTo(to, rel, where) {
  const [page, anchor] = String(to ?? '').split('#');
  const hash = anchor ? `#${anchor}` : '';
  if (page.startsWith('basics/')) return `${rel}${page}.html${hash}`;
  const lec = lectures.find((l) => l.id === page);
  if (lec) {
    if (!anchor) return `${rel}${lec.id}/index.html`;
    const n = Number(anchor.replace(/^p/, ''));
    const sec = lec.sectionOf.get(n);
    if (sec) return `${rel}${lec.id}/${sec.id}.html#${pid(n)}`;
    report('warn', where, `link to ${to}: slide not in any section`);
    return `${rel}${lec.id}/index.html`;
  }
  if (['index', 'symbols', 'glossary'].includes(page)) return `${rel}${page}.html${hash}`;
  report('error', where, `unknown link target "${to}"`);
  return '#';
}

// ---------------------------------------------------------------------------
// Markdown pipeline
// ---------------------------------------------------------------------------

// Helper to create an mdast node that turns into a given HTML element.
const el = (tag, props, children = []) => ({
  type: 'siteElement', data: { hName: tag, hProperties: props ?? {} }, children,
});
const txt = (value) => ({ type: 'text', value });

const inlineParser = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkDirective);
function parseInline(text) {
  const root = inlineParser.parse(String(text ?? ''));
  const first = root.children[0];
  return first?.type === 'paragraph' ? first.children : root.children;
}

function mdastText(node) {
  if (node.type === 'text' || node.type === 'inlineMath' || node.type === 'inlineCode') return node.value;
  return (node.children ?? []).map(mdastText).join('');
}

function svgDims(file) {
  if (!existsSync(file) || !file.endsWith('.svg')) return null;
  const head = readFileSync(file, 'utf8').slice(0, 2000);
  const w = head.match(/\swidth="([\d.]+)(pt|px)?"/);
  const h = head.match(/\sheight="([\d.]+)(pt|px)?"/);
  if (!w || !h) return null;
  const k = w[2] === 'pt' ? 4 / 3 : 1;
  return { w: Math.round(Number(w[1]) * k), h: Math.round(Number(h[1]) * k) };
}

// Turns our directives into plain elements, assigns heading ids, numbers figures.
function remarkSite(ctx) {
  return (tree) => {
    visit(tree, (node) => {
      switch (node.type) {
        case 'containerDirective': container(node, ctx); break;
        case 'leafDirective': leaf(node, ctx); break;
        case 'textDirective': textDirective(node, ctx); break;
        case 'heading': heading(node, ctx); break;
        default: break;
      }
    });
  };
}

function container(node, ctx) {
  let label = [];
  if (node.children[0]?.data?.directiveLabel) label = node.children.shift().children;

  if (INNER_CONTAINERS[node.name]) {
    node.data = { hName: 'details', hProperties: { className: ['answer'] } };
    node.children = [
      el('summary', {}, label.length ? label : [txt(INNER_CONTAINERS[node.name].label)]),
      el('div', { className: ['answer-body'] }, node.children),
    ];
    return;
  }
  const box = BOXES[node.name];
  if (!box) {
    report('error', ctx.where, `unknown box ":::${node.name}"`);
    node.data = { hName: 'div', hProperties: {} };
    return;
  }
  const head = [el('span', { className: ['box-tag'] }, [txt(box.tag)])];
  if (label.length) head.push(el('span', { className: ['box-title'] }, label));
  node.data = { hName: 'aside', hProperties: { className: ['box', `box-${node.name}`] } };
  node.children = [
    el('div', { className: ['box-head'] }, head),
    el('div', { className: ['box-body'] }, node.children),
  ];
}

function leaf(node, ctx) {
  const a = node.attributes ?? {};
  if (node.name === 'fig') {
    ctx.figNo += 1;
    const file = path.join(ROOT, 'public', a.src ?? '');
    if (!a.src || !existsSync(file)) report('error', ctx.where, `figure not found: public/${a.src}`);
    const dims = svgDims(file);
    const width = a.width ? Math.max(20, Math.min(100, Number(a.width) || 100)) : 100;
    const img = {
      src: ctx.rel + a.src,
      alt: a.alt || mdastText({ children: parseInline(a.caption) }),
      loading: 'lazy',
      decoding: 'async',
      ...(dims ? { width: dims.w, height: dims.h } : {}),
    };
    node.data = { hName: 'figure', hProperties: { className: ['fig'], style: `--fig-w:${width}%` } };
    node.children = [
      el('img', img),
      el('figcaption', {}, [el('span', { className: ['fig-no'] }, [txt(`图 ${ctx.figNo}`)]), ...parseInline(a.caption)]),
    ];
    return;
  }
  if (node.name === 'widget') {
    ctx.widgetNo += 1;
    if (!WIDGETS.includes(a.name)) report('error', ctx.where, `unknown widget "${a.name}"`);
    let opts = '{}';
    if (a.opts) {
      try { JSON.parse(a.opts); opts = a.opts; } catch { report('error', ctx.where, `widget ${a.name}: opts is not JSON`); }
    }
    node.data = {
      hName: 'figure',
      hProperties: { className: ['widget'], dataWidget: a.name, dataOpts: opts },
    };
    const caption = [el('span', { className: ['fig-no'] }, [txt(`交互图 ${ctx.widgetNo}`)])];
    if (a.caption) caption.push(...parseInline(a.caption));
    node.children = [
      el('div', { className: ['widget-stage'] }, [el('p', { className: ['widget-loading'] }, [txt('交互图加载中……')])]),
      el('figcaption', {}, caption),
    ];
    return;
  }
  report('error', ctx.where, `unknown leaf directive "::${node.name}"`);
  node.data = { hName: 'div', hProperties: {} };
}

function textDirective(node, ctx) {
  const a = node.attributes ?? {};
  switch (node.name) {
    case 'term':
      if (a.k && !ctx.glossary.has(a.k)) report('warn', ctx.where, `glossary key "${a.k}" not defined`);
      node.data = { hName: 'span', hProperties: { className: ['term'], dataK: a.k, tabIndex: 0 } };
      break;
    case 'en':
      node.data = { hName: 'span', hProperties: { className: ['en'] } };
      break;
    case 'go':
      node.data = { hName: 'a', hProperties: { className: ['go'], href: resolveTo(a.to, ctx.rel, ctx.where) } };
      break;
    case 'slide':
      node.data = {
        hName: 'a',
        hProperties: {
          className: ['go', 'slide-link'],
          href: resolveTo(`${ctx.lecture ?? 'lecture1'}#p${a.n}`, ctx.rel, ctx.where),
        },
      };
      break;
    case 'why':
      node.data = { hName: 'span', hProperties: { className: ['why'] } };
      break;
    case 'hl':
      node.data = { hName: 'mark', hProperties: { className: ['hl'] } };
      break;
    default:
      // "a:b" in prose is parsed as a directive; put the colon back.
      report('warn', ctx.where, `unknown text directive ":${node.name}" rendered as plain text`);
      node.data = { hName: 'span', hProperties: {} };
      node.children = [txt(`:${node.name}`), ...node.children];
  }
}

function heading(node, ctx) {
  const last = node.children[node.children.length - 1];
  let id;
  if (last?.type === 'text') {
    const m = last.value.match(/\s*\{#([A-Za-z0-9_-]+)\}\s*$/);
    if (m) {
      id = m[1];
      last.value = last.value.slice(0, m.index);
    }
  }
  if (!id) id = `${ctx.idPrefix}-h${(ctx.headCount += 1)}`;
  node.data = { ...(node.data ?? {}), hProperties: { ...(node.data?.hProperties ?? {}), id } };
  ctx.headings.push({ depth: node.depth, id, text: mdastText(node).trim() });
}

function rehypeTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || parent.properties?.className?.includes('table-wrap')) return;
      parent.children[index] = {
        type: 'element', tagName: 'div', properties: { className: ['table-wrap'] }, children: [node],
      };
    });
  };
}

// Keep a plain-text copy (without TeX source) for the search index.
function rehypeCaptureText(ctx) {
  return (tree) => {
    const clone = structuredClone(tree);
    visit(clone, 'element', (node, index, parent) => {
      const cls = node.properties?.className ?? [];
      if (parent && (cls.includes('math-inline') || cls.includes('math-display'))) {
        parent.children[index] = { type: 'text', value: ' ' };
      }
    });
    ctx.text = hastToString(clone).replace(/\s+/g, ' ').trim();
  };
}

async function renderMarkdown(md, ctx) {
  ctx.figNo ??= 0;
  ctx.widgetNo ??= 0;
  ctx.headCount ??= 0;
  ctx.headings = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDirective)
    .use(remarkSite, ctx)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeTables)
    .use(rehypeCaptureText, ctx)
    .use(rehypeKatex, {
      macros: { ...KATEX_MACROS }, strict: 'ignore', throwOnError: false, errorColor: '#b91c1c',
    })
    .use(rehypeStringify)
    .process(md);
  for (const msg of file.messages) report('error', ctx.where, `KaTeX: ${msg.reason}`);
  return { html: String(file), text: ctx.text, headings: ctx.headings };
}

async function renderInline(md, ctx) {
  const { html } = await renderMarkdown(md, { ...ctx, idPrefix: 'x', headCount: 0 });
  return html.replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1');
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

function loadGlossary() {
  const dir = path.join(CONTENT, 'glossary');
  const map = new Map();
  if (!existsSync(dir)) return map;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.yaml')).sort()) {
    let entries = [];
    try {
      entries = yaml.load(readFileSync(path.join(dir, name), 'utf8')) ?? [];
    } catch (err) {
      report('error', `content/glossary/${name}`, `YAML: ${err.message.split('\n')[0]}`);
      continue;
    }
    for (const e of entries) {
      if (!e?.k) continue;
      if (map.has(e.k)) report('error', `content/glossary/${name}`, `duplicate key "${e.k}"`);
      map.set(e.k, { ...e, file: name });
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Page chrome
// ---------------------------------------------------------------------------

const ICON = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

function sideNav(rel, cur, slideMeta) {
  const out = ['<nav class="sidenav" id="sidenav" aria-label="目录">'];
  out.push(`<a class="nav-home${cur.kind === 'home' ? ' is-current' : ''}" href="${rel}index.html">课程首页</a>`);
  for (const lec of lectures) {
    const ready = lec.status === 'ready';
    const open = cur.lecture === lec.id;
    out.push(`<div class="nav-group${open ? ' is-open' : ''}">`);
    out.push(`<div class="nav-lecture"><span class="nav-no">第 ${lec.no} 讲</span>${esc(lec.title_zh)}</div>`);
    if (!ready) {
      out.push('<p class="nav-soon">整理中，敬请期待</p></div>');
      continue;
    }
    out.push('<ul class="nav-list">');
    out.push(`<li><a class="nav-link${cur.kind === 'lecture' && open ? ' is-current' : ''}" href="${rel}${lec.id}/index.html">导读</a></li>`);
    for (const sec of lec.sections) {
      const here = cur.section === sec.id && open;
      const range = sec.slides.length > 1 ? `${sec.slides[0]}–${sec.slides.at(-1)}` : `${sec.slides[0]}`;
      out.push(`<li class="nav-sec${here ? ' is-here' : ''}"><a class="nav-link${here ? ' is-current' : ''}" href="${rel}${lec.id}/${sec.id}.html"><span class="nav-sec-no">${sec.index + 1}</span><span class="nav-sec-title">${esc(sec.title_zh)}</span><span class="nav-range">${range}</span></a>`);
      if (here) {
        out.push('<ol class="nav-slides">');
        for (const n of sec.slides) {
          const m = slideMeta.get(`${lec.id}/${n}`);
          out.push(`<li><a class="nav-slide${m ? '' : ' is-todo'}" href="#${pid(n)}" data-slide="${pid(n)}"><span class="nav-pno">${n}</span><span>${esc(m?.title_zh ?? '（编写中）')}</span></a></li>`);
        }
        out.push('</ol>');
      }
      out.push('</li>');
    }
    out.push('</ul></div>');
  }
  out.push('<div class="nav-group nav-tools"><div class="nav-lecture">补课与速查</div><ul class="nav-list">');
  for (const b of basicsPages) {
    const here = cur.kind === 'basics' && cur.id === b.id;
    out.push(`<li><a class="nav-link${here ? ' is-current' : ''}" href="${rel}basics/${b.id}.html">${esc(b.title_zh)}</a></li>`);
  }
  out.push(`<li><a class="nav-link${cur.kind === 'symbols' ? ' is-current' : ''}" href="${rel}symbols.html">符号速查</a></li>`);
  out.push(`<li><a class="nav-link${cur.kind === 'glossary' ? ' is-current' : ''}" href="${rel}glossary.html">术语表</a></li>`);
  out.push('</ul></div></nav>');
  return out.join('\n');
}

function layout({ title, rel, crumbs = [], nav, main, bodyClass = '', description = '' }) {
  const crumbHtml = crumbs.map((c, i) => (c.href
    ? `<a href="${c.href}">${esc(c.text)}</a>`
    : `<span${i === crumbs.length - 1 ? ' class="crumb-live"' : ''}>${esc(c.text)}</span>`)).join('<span class="crumb-sep">›</span>');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || SITE_NAME)}">
<link rel="icon" href="${rel}assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${rel}assets/katex/katex.min.css">
<link rel="stylesheet" href="${rel}assets/css/site.css">
<link rel="stylesheet" href="${rel}assets/css/widgets.css">
<script>try{var s=localStorage.getItem('am-font-scale');if(s)document.documentElement.style.setProperty('--font-scale',s)}catch(e){}</script>
<script type="module" src="${rel}assets/js/site.js"></script>
</head>
<body class="${bodyClass}" data-rel="${rel}">
<a class="skip-link" href="#main">跳到正文</a>
<header class="topbar">
  <div class="topbar-inner">
    <button class="icon-btn nav-toggle" type="button" aria-controls="sidenav" aria-expanded="false" aria-label="打开目录">${ICON.menu}</button>
    <a class="brand" href="${rel}index.html">高级微观经济学<span>逐页精讲</span></a>
    <nav class="crumbs" aria-label="当前位置">${crumbHtml}</nav>
    <div class="tools">
      <button class="tool-btn search-open" type="button" aria-label="搜索">${ICON.search}<span>搜索</span><kbd>/</kbd></button>
      <div class="font-tools" role="group" aria-label="字号">
        <button class="tool-btn" type="button" data-font="-1" aria-label="缩小字号">A−</button>
        <button class="tool-btn" type="button" data-font="1" aria-label="放大字号">A+</button>
      </div>
    </div>
  </div>
  <div class="read-progress" aria-hidden="true"><span></span></div>
</header>
<div class="layout">
${nav}
<div class="nav-scrim" hidden></div>
<main id="main" class="main">
${main}
</main>
</div>
<div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="课件大图">
  <button class="lb-btn lb-close" type="button" aria-label="关闭">${ICON.close}</button>
  <button class="lb-btn lb-prev" type="button" aria-label="上一页">${ICON.prev}</button>
  <figure class="lb-figure"><img alt=""><figcaption></figcaption></figure>
  <button class="lb-btn lb-next" type="button" aria-label="下一页">${ICON.next}</button>
</div>
<div class="search-panel" hidden role="dialog" aria-modal="true" aria-label="搜索">
  <div class="search-box">
    <div class="search-input-row">${ICON.search}<input type="search" placeholder="搜索概念、符号、页码……（例如：传递性、HARP、拟凹）" aria-label="搜索关键词"><kbd>Esc</kbd></div>
    <ol class="search-results"></ol>
    <p class="search-hint">支持中文和英文；多个关键词用空格分开。↑ ↓ 选择，Enter 打开。</p>
  </div>
</div>
<div class="term-pop" hidden role="tooltip"></div>
<button class="slide-fab" type="button" hidden>${ICON.zoom}<span>看课件</span></button>
</body>
</html>
`;
}

function pager(prev, next) {
  const side = (item, cls, label) => (item
    ? `<a class="pager-link ${cls}" href="${item.href}"><span class="pager-label">${label}</span><span class="pager-title">${esc(item.text)}</span></a>`
    : '<span></span>');
  return `<nav class="pager" aria-label="翻页">${side(prev, 'is-prev', '← 上一部分')}${side(next, 'is-next', '下一部分 →')}</nav>`;
}

function writePage(outPath, html) {
  const file = path.join(DIST, outPath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function main() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // Static assets.
  cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
  cpSync(path.join(ROOT, 'site/assets'), path.join(DIST, 'assets'), { recursive: true });
  const katexDist = path.join(ROOT, 'node_modules/katex/dist');
  mkdirSync(path.join(DIST, 'assets/katex/fonts'), { recursive: true });
  cpSync(path.join(katexDist, 'katex.min.css'), path.join(DIST, 'assets/katex/katex.min.css'));
  for (const f of readdirSync(path.join(katexDist, 'fonts')).filter((n) => n.endsWith('.woff2'))) {
    cpSync(path.join(katexDist, 'fonts', f), path.join(DIST, 'assets/katex/fonts', f));
  }
  for (const f of ['css/site.css', 'css/widgets.css', 'js/site.js']) {
    if (!existsSync(path.join(DIST, 'assets', f))) writeFileSync(path.join(DIST, 'assets', f), '');
  }
  writeFileSync(path.join(DIST, '.nojekyll'), '');

  const glossary = loadGlossary();
  const search = [];

  // Slide front matter for navigation (titles), read once.
  const slideMeta = new Map();
  for (const lec of lectures) {
    for (const n of lec.sectionOf.keys()) {
      const file = path.join(CONTENT, lec.id, `${pid(n)}.md`);
      if (!existsSync(file)) continue;
      const { data, content } = matter(readFileSync(file, 'utf8'));
      slideMeta.set(`${lec.id}/${n}`, { ...data, body: content });
    }
  }

  // ---- Section pages -------------------------------------------------------
  for (const lec of lectures.filter((l) => l.status === 'ready')) {
    const sections = lec.sections;
    for (const sec of sections) {
      const outPath = `${lec.id}/${sec.id}.html`;
      const rel = relFor(outPath);
      const blocks = [];
      sec.slides.forEach((n, i) => {
        blocks.push({ n, first: i === 0 });
      });
      const rendered = [];
      const counters = { figNo: 0, widgetNo: 0 };
      for (const { n, first } of blocks) {
        const meta = slideMeta.get(`${lec.id}/${n}`);
        const where = `content/${lec.id}/${pid(n)}.md`;
        const img = `${rel}slides/${lec.id}/${pid(n)}.webp`;
        let notes;
        if (meta) {
          const ctx = {
            rel, lecture: lec.id, where, glossary, idPrefix: pid(n), ...counters,
          };
          const r = await renderMarkdown(meta.body, ctx);
          counters.figNo = ctx.figNo;
          counters.widgetNo = ctx.widgetNo;
          notes = `<header class="slide-head">
  <div class="kicker">第 ${n} 页 <span class="kicker-of">/ 共 ${lec.n_slides} 页</span></div>
  <h2 id="${pid(n)}-title">${esc(meta.title_zh)}</h2>
  <p class="slide-en">${esc(meta.title_en)}</p>
  ${meta.summary ? `<p class="slide-summary">${await renderInline(meta.summary, { rel, lecture: lec.id, where, glossary })}</p>` : ''}
</header>
${r.html}`;
          search.push({
            t: `第 ${lec.no} 讲 · 第 ${n} 页 · ${meta.title_zh}`,
            e: meta.title_en ?? '',
            s: sec.title_zh,
            u: `${lec.id}/${sec.id}.html#${pid(n)}`,
            x: `${meta.summary ?? ''} ${r.text}`.slice(0, 6000),
          });
        } else {
          report('warn', where, 'missing — placeholder rendered');
          notes = `<header class="slide-head">
  <div class="kicker">第 ${n} 页 <span class="kicker-of">/ 共 ${lec.n_slides} 页</span></div>
  <h2 id="${pid(n)}-title">（这一页的精讲正在编写中）</h2>
</header>
<p class="todo-note">左边是课件原页。这一页的讲解还没有写好，可以先读本节的其他页。</p>`;
        }
        rendered.push(`<section class="slide-block" id="${pid(n)}" data-slide="${n}" data-title="${esc(meta?.title_zh ?? `第 ${n} 页`)}">
<div class="slide-col">
  <figure class="slide-figure">
    <button class="slide-zoom" type="button" data-src="${img}" data-caption="第 ${n} / ${lec.n_slides} 页 · ${esc(meta?.title_en ?? '')}" aria-label="放大查看第 ${n} 页课件">
      <img src="${img}" width="1400" height="1050" alt="课件第 ${n} 页：${esc(meta?.title_en ?? '')}"${first ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
      <span class="zoom-hint">${ICON.zoom}放大</span>
    </button>
    <figcaption><span class="pno">第 ${n} / ${lec.n_slides} 页</span><span class="ptitle">${esc(meta?.title_en ?? '')}</span></figcaption>
  </figure>
</div>
<article class="notes">
${notes}
</article>
</section>`);
      }

      const toc = sec.slides.map((n) => {
        const m = slideMeta.get(`${lec.id}/${n}`);
        return `<li><a href="#${pid(n)}"><span class="toc-pno">第 ${n} 页</span>${esc(m?.title_zh ?? '（编写中）')}</a></li>`;
      }).join('');
      const range = sec.slides.length > 1 ? `第 ${sec.slides[0]}–${sec.slides.at(-1)} 页` : `第 ${sec.slides[0]} 页`;
      const prevSec = sections[sec.index - 1];
      const nextSec = sections[sec.index + 1];
      const prev = prevSec
        ? { href: `${prevSec.id}.html`, text: prevSec.title_zh }
        : { href: 'index.html', text: `第 ${lec.no} 讲导读` };
      const next = nextSec ? { href: `${nextSec.id}.html`, text: nextSec.title_zh } : { href: '../index.html', text: '回到课程首页' };

      const main = `<div class="page page-section">
<header class="section-head">
  <div class="kicker">第 ${lec.no} 讲 · 第 ${sec.index + 1} 部分 · ${range}</div>
  <h1>${esc(sec.title_zh)}</h1>
  ${sec.intro ? `<p class="section-intro">${esc(sec.intro)}</p>` : ''}
  <ol class="section-toc">${toc}</ol>
  <p class="section-tip">读法：左边是课件原页（点击可放大），右边是讲解；宽屏时左边的课件会跟着你往下走。键盘 <kbd>←</kbd> <kbd>→</kbd> 跳到上一页 / 下一页课件。</p>
</header>
${rendered.join('\n')}
${pager(prev, next)}
</div>`;
      writePage(outPath, layout({
        title: `${sec.title_zh} · 第 ${lec.no} 讲 · ${SITE_NAME}`,
        rel,
        crumbs: [
          { text: `第 ${lec.no} 讲`, href: 'index.html' },
          { text: sec.title_zh },
          { text: '' },
        ],
        nav: sideNav(rel, { kind: 'section', lecture: lec.id, section: sec.id }, slideMeta),
        main,
        bodyClass: 'is-section',
        description: sec.intro,
      }));
    }

    // ---- Lecture overview --------------------------------------------------
    const outPath = `${lec.id}/index.html`;
    const rel = relFor(outPath);
    const where = `content/${lec.id}/index.md`;
    let intro = '';
    if (existsSync(path.join(ROOT, where))) {
      const { content } = matter(readText(where));
      const r = await renderMarkdown(content, { rel, lecture: lec.id, where, glossary, idPrefix: 'ov' });
      intro = r.html;
      search.push({ t: `第 ${lec.no} 讲导读 · ${lec.title_zh}`, e: lec.title_en, s: '导读', u: outPath, x: r.text.slice(0, 6000) });
    }
    const cards = sections.map((sec) => {
      const items = sec.slides.map((n) => {
        const m = slideMeta.get(`${lec.id}/${n}`);
        return `<li><a href="${sec.id}.html#${pid(n)}"><span class="toc-pno">${n}</span>${esc(m?.title_zh ?? '（编写中）')}</a></li>`;
      }).join('');
      return `<section class="sec-card">
  <a class="sec-card-head" href="${sec.id}.html"><span class="sec-card-no">${sec.index + 1}</span><span class="sec-card-title">${esc(sec.title_zh)}</span></a>
  <p class="sec-card-intro">${esc(sec.intro ?? '')}</p>
  <ol class="sec-card-slides">${items}</ol>
</section>`;
    }).join('\n');
    const main = `<div class="page page-article">
<header class="article-head">
  <div class="kicker">第 ${lec.no} 讲 · 共 ${lec.n_slides} 页课件</div>
  <h1>${esc(lec.title_zh)}</h1>
  <p class="article-en">${esc(lec.title_en)}</p>
</header>
<div class="prose">${intro}</div>
<h2 class="cards-title">按部分阅读</h2>
<div class="sec-cards">${cards}</div>
${pager({ href: '../index.html', text: '课程首页' }, { href: `${sections[0].id}.html`, text: sections[0].title_zh })}
</div>`;
    writePage(outPath, layout({
      title: `第 ${lec.no} 讲导读：${lec.title_zh} · ${SITE_NAME}`,
      rel,
      crumbs: [{ text: `第 ${lec.no} 讲` }, { text: '导读' }],
      nav: sideNav(rel, { kind: 'lecture', lecture: lec.id }, slideMeta),
      main,
      bodyClass: 'is-article',
    }));
  }

  // ---- Basics pages --------------------------------------------------------
  for (const b of basicsPages) {
    const outPath = `basics/${b.id}.html`;
    const rel = relFor(outPath);
    const where = `content/basics/${b.id}.md`;
    let body;
    let headings = [];
    if (existsSync(path.join(ROOT, where))) {
      const { content } = matter(readText(where));
      const r = await renderMarkdown(content, { rel, lecture: 'lecture1', where, glossary, idPrefix: 'b' });
      body = r.html;
      headings = r.headings.filter((h) => h.depth === 2);
      const missing = (BASICS_ANCHORS[b.id] ?? []).filter((a) => !headings.some((h) => h.id === a));
      if (missing.length) report('error', where, `missing required anchors: ${missing.join(', ')}`);
      // One search entry per h2 section.
      const parts = r.html.split(/<h2 /);
      headings.forEach((h, i) => {
        const chunk = (parts[i + 1] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        search.push({ t: `数学基础 · ${h.text}`, e: '', s: b.title_zh, u: `${outPath}#${h.id}`, x: chunk.slice(0, 3000) });
      });
    } else {
      report('warn', where, 'missing — placeholder rendered');
      headings = (BASICS_ANCHORS[b.id] ?? []).map((a) => ({ depth: 2, id: a, text: a }));
      body = `<p class="todo-note">这一页正在编写中。</p>${headings.map((h) => `<h2 id="${h.id}">${h.id}</h2><p class="todo-note">（编写中）</p>`).join('')}`;
    }
    const toc = headings.length
      ? `<nav class="page-toc" aria-label="本页目录"><div class="page-toc-title">本页目录</div><ol>${headings.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ol></nav>`
      : '';
    const i = basicsPages.indexOf(b);
    const prev = basicsPages[i - 1] ? { href: `${basicsPages[i - 1].id}.html`, text: basicsPages[i - 1].title_zh } : { href: '../index.html', text: '课程首页' };
    const next = basicsPages[i + 1] ? { href: `${basicsPages[i + 1].id}.html`, text: basicsPages[i + 1].title_zh } : { href: '../symbols.html', text: '符号速查' };
    writePage(outPath, layout({
      title: `${b.title_zh} · 数学基础 · ${SITE_NAME}`,
      rel,
      crumbs: [{ text: '数学基础' }, { text: b.title_zh }],
      nav: sideNav(rel, { kind: 'basics', id: b.id }, slideMeta),
      main: `<div class="page page-article">
<header class="article-head"><div class="kicker">数学基础 · 零基础补课</div><h1>${esc(b.title_zh)}</h1></header>
${toc}
<div class="prose">${body}</div>
${pager(prev, next)}
</div>`,
      bodyClass: 'is-article',
    }));
  }

  // ---- Symbols -------------------------------------------------------------
  {
    const outPath = 'symbols.html';
    const where = 'content/symbols.md';
    let body = '<p class="todo-note">符号表正在编写中。</p>';
    if (existsSync(path.join(ROOT, where))) {
      const r = await renderMarkdown(matter(readText(where)).content, { rel: '', lecture: 'lecture1', where, glossary, idPrefix: 'sym' });
      body = r.html;
      search.push({ t: '符号速查', e: 'Symbols', s: '速查', u: outPath, x: r.text.slice(0, 8000) });
    }
    writePage(outPath, layout({
      title: `符号速查 · ${SITE_NAME}`,
      rel: '',
      crumbs: [{ text: '符号速查' }],
      nav: sideNav('', { kind: 'symbols' }, slideMeta),
      main: `<div class="page page-article"><header class="article-head"><div class="kicker">速查</div><h1>符号速查</h1><p class="article-en">看到一个符号不认识？在这里查它怎么读、什么意思、第一次在哪一页出现。</p></header><div class="prose">${body}</div></div>`,
      bodyClass: 'is-article',
    }));
  }

  // ---- Glossary ------------------------------------------------------------
  {
    const terms = [];
    const json = {};
    for (const [k, e] of glossary) {
      const where = `content/glossary/${e.file}`;
      const short = await renderInline(e.short ?? '', { rel: '', lecture: 'lecture1', where, glossary });
      const href = e.where ? resolveTo(e.where, '', where) : '';
      json[k] = { zh: e.zh, en: e.en, html: short, where: e.where ? resolveTo(e.where, '', where) : '' };
      terms.push({ k, ...e, short, href });
      search.push({ t: `术语 · ${e.zh}（${e.en}）`, e: e.en, s: '术语表', u: `glossary.html#t-${k}`, x: (e.short ?? '').replace(/\$[^$]*\$/g, ' ') });
    }
    terms.sort((a, b) => a.en.localeCompare(b.en, 'en'));
    writeFileSync(path.join(DIST, 'glossary.json'), JSON.stringify(json));
    const items = terms.map((t) => `<li class="gl-item" id="t-${t.k}" data-filter="${esc(`${t.zh} ${t.en} ${t.k}`.toLowerCase())}">
  <div class="gl-head"><span class="gl-zh">${esc(t.zh)}</span><span class="gl-en">${esc(t.en)}</span></div>
  <div class="gl-short">${t.short}</div>
  ${t.href ? `<a class="gl-where" href="${t.href}">去看首次讲解 →</a>` : ''}
</li>`).join('\n');
    writePage('glossary.html', layout({
      title: `术语表 · ${SITE_NAME}`,
      rel: '',
      crumbs: [{ text: '术语表' }],
      nav: sideNav('', { kind: 'glossary' }, slideMeta),
      main: `<div class="page page-article">
<header class="article-head"><div class="kicker">速查</div><h1>术语表</h1><p class="article-en">中英对照。正文里带虚线下划线的词，鼠标停上去（手机上点一下）也能看到解释。</p></header>
<input class="gl-filter" type="search" placeholder="筛选术语（中文或英文）" aria-label="筛选术语">
<ol class="gl-list">${items}</ol>
</div>`,
      bodyClass: 'is-article',
    }));
  }

  // ---- Home ----------------------------------------------------------------
  {
    const where = 'content/home.md';
    let body = '';
    if (existsSync(path.join(ROOT, where))) {
      const r = await renderMarkdown(matter(readText(where)).content, { rel: '', lecture: 'lecture1', where, glossary, idPrefix: 'home' });
      body = r.html;
    }
    const lecCards = lectures.map((lec) => {
      const ready = lec.status === 'ready';
      const written = [...lec.sectionOf.keys()].filter((n) => slideMeta.has(`${lec.id}/${n}`)).length;
      return `<article class="lec-card${ready ? '' : ' is-planned'}">
  <div class="lec-card-no">第 ${lec.no} 讲</div>
  <h3>${ready ? `<a href="${lec.id}/index.html">${esc(lec.title_zh)}</a>` : esc(lec.title_zh)}</h3>
  <p class="lec-card-en">${esc(lec.title_en)}</p>
  <p class="lec-card-meta">${lec.n_slides} 页课件 · ${ready ? `已完成精讲 ${written} 页` : '整理中'}</p>
  ${ready ? `<ol class="lec-card-secs">${lec.sections.map((s) => `<li><a href="${lec.id}/${s.id}.html">${esc(s.title_zh)}</a></li>`).join('')}</ol>` : ''}
</article>`;
    }).join('\n');
    const basicsCards = basicsPages.map((b) => `<li><a href="basics/${b.id}.html">${esc(b.title_zh)}</a></li>`).join('');
    writePage('index.html', layout({
      title: SITE_NAME,
      rel: '',
      crumbs: [{ text: '课程首页' }],
      nav: sideNav('', { kind: 'home' }, slideMeta),
      main: `<div class="page page-article page-home">
<header class="hero">
  <div class="kicker">${esc(course.course.instructor)} · ${esc(course.course.term)}</div>
  <h1>${esc(course.course.title_zh)}</h1>
  <p class="article-en">${esc(course.course.title_en)}</p>
</header>
<div class="prose">${body}</div>
<h2 class="cards-title">课程内容</h2>
<div class="lec-cards">${lecCards}</div>
<h2 class="cards-title">补课与速查</h2>
<div class="tool-cards">
  <section class="tool-card"><h3>数学基础</h3><ol>${basicsCards}</ol></section>
  <section class="tool-card"><h3>速查</h3><ol><li><a href="symbols.html">符号速查</a></li><li><a href="glossary.html">术语表（中英对照）</a></li></ol></section>
</div>
</div>`,
      bodyClass: 'is-article is-home',
    }));
  }

  // ---- 404 -------------------------------------------------------------------
  writeFileSync(path.join(DIST, '404.html'), `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>页面不存在 · ${SITE_NAME}</title>
<script>(function(){var p=location.pathname,b=p.indexOf('/Advanced-Microeconomics/')===0?'/Advanced-Microeconomics/':'/';document.write('<base href="'+b+'">');})();</script>
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/site.css"></head>
<body class="is-article"><main class="main"><div class="page page-article"><header class="article-head"><h1>这个页面不存在</h1>
<p>可能是链接写错了，或者这一部分还没上线。</p></header><p><a href="index.html">回到课程首页 →</a></p></div></main></body></html>`);

  writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(search));

  // ---- Report -------------------------------------------------------------
  const errors = problems.filter((p) => p.level === 'error');
  const warns = problems.filter((p) => p.level === 'warn');
  for (const p of [...errors, ...warns]) console.log(`${p.level}: ${p.where}: ${p.msg}`);
  console.log(`\nbuilt dist/ — ${search.length} search entries, ${glossary.size} terms, ${errors.length} error(s), ${warns.length} warning(s)`);
  if (errors.length) process.exitCode = 1;
}

await main();
