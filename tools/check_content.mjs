// Validate content/*.md before building: KaTeX errors, unknown directives,
// missing figures, bad links, forbidden phrases, stray Unicode math symbols.
//
//   node tools/check_content.mjs                     # check everything
//   node tools/check_content.mjs content/lecture1/p03.md content/lecture1/p04.md
//
// Exit code 1 if any error was found (warnings do not fail).

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';
import { katex } from '../site/lib/katex.mjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import {
  BASICS_ANCHORS, BOXES, INNER_CONTAINERS, KATEX_MACROS, LEAVES, SLIDE_HEADING_DEPTHS, TEXTS,
  WIDGETS,
} from '../site/lib/spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const FORBIDDEN = ['显然', '易知', '不难看出', '易证', '同理可得'];
const STRAY_SYMBOLS = /[⪰⪯≿≾≻≺∼∈∉⊆⊂⊇⊃∀∃⇒⇔⟺⟹→↦≥≤≠∅ℝ∪∩×]/;

const problems = [];
const report = (level, file, line, msg) =>
  problems.push({ level, file: path.relative(ROOT, file), line: line ?? 0, msg });

function listMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listMarkdown(full));
    else if (name.endsWith('.md')) out.push(full);
  }
  return out;
}

function loadGlossaryKeys() {
  const dir = path.join(CONTENT, 'glossary');
  const keys = new Map();
  if (!existsSync(dir)) return keys;
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.yaml'))) {
    const file = path.join(dir, name);
    let entries;
    try {
      entries = yaml.load(readFileSync(file, 'utf8')) || [];
    } catch (err) {
      report('error', file, err.mark?.line + 1, `YAML parse error: ${err.reason || err.message}`);
      continue;
    }
    for (const entry of entries) {
      for (const field of ['k', 'zh', 'en', 'short']) {
        if (!entry?.[field]) report('error', file, 0, `glossary entry missing "${field}": ${JSON.stringify(entry)}`);
      }
      if (entry?.k && keys.has(entry.k)) {
        report('error', file, 0, `duplicate glossary key "${entry.k}" (also in ${keys.get(entry.k)})`);
      }
      if (entry?.k) keys.set(entry.k, name);
      if (entry?.short) checkMath(entry.short, file, 0, `glossary "${entry.k}"`);
    }
  }
  return keys;
}

function checkMath(text, file, line, where) {
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let m;
  while ((m = re.exec(text))) renderMath(m[1] ?? m[2], Boolean(m[1]), file, line, where);
}

function renderMath(tex, display, file, line, where = '') {
  try {
    katex.renderToString(tex, {
      displayMode: display, throwOnError: true, strict: 'ignore', macros: { ...KATEX_MACROS },
    });
  } catch (err) {
    report('error', file, line, `KaTeX${where ? ` (${where})` : ''}: ${err.message.split('\n')[0]}`);
  }
}

function slideCount(lecture) {
  const course = yaml.load(readFileSync(path.join(CONTENT, 'course.yaml'), 'utf8'));
  return course.lectures.find((l) => l.id === lecture)?.n_slides ?? 0;
}

function checkFile(file, glossaryKeys) {
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const offset = raw.split('\n').length - content.split('\n').length;
  const rel = path.relative(CONTENT, file);
  const slideMatch = rel.match(/^(lecture\d+)\/p(\d\d)\.md$/);

  if (slideMatch) {
    const n = Number(slideMatch[2]);
    for (const key of ['slide', 'title_en', 'title_zh', 'summary']) {
      if (data[key] === undefined || data[key] === '') report('error', file, 1, `front matter missing "${key}"`);
    }
    if (data.slide !== undefined && Number(data.slide) !== n) {
      report('error', file, 1, `front matter slide=${data.slide} but file name says ${n}`);
    }
  }

  // A "[" or "]" inside a box label (e.g. an interval $[0,1)$) ends the label early
  // and silently breaks the directive, so reject it before parsing.
  content.split('\n').forEach((text, i) => {
    const label = text.match(/^:{3,}[a-z]+\[(.*)\]\s*(\{.*\})?\s*$/);
    if (label && /[[\]]/.test(label[1])) {
      report('error', file, i + 1 + offset, 'box label contains "[" or "]" — move intervals or brackets into the box body');
    }
  });

  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkDirective)
    .parse(content);
  const lineOf = (node) => (node.position?.start.line ?? 0) + offset;

  visit(tree, (node, _index, parent) => {
    switch (node.type) {
      case 'math':
      case 'inlineMath':
        renderMath(node.value, node.type === 'math', file, lineOf(node));
        break;
      case 'heading':
        if (slideMatch && !SLIDE_HEADING_DEPTHS.includes(node.depth)) {
          report('error', file, lineOf(node), `heading level ${node.depth} not allowed in slide files (use ### or ####)`);
        }
        break;
      case 'containerDirective': {
        if (INNER_CONTAINERS[node.name]) {
          const want = INNER_CONTAINERS[node.name].parent;
          if (parent?.type !== 'containerDirective' || parent.name !== want) {
            report('error', file, lineOf(node), `:::${node.name} must be inside ::::${want}`);
          }
        } else if (!BOXES[node.name]) {
          report('error', file, lineOf(node), `unknown box ":::${node.name}" (allowed: ${Object.keys(BOXES).join(', ')})`);
        }
        break;
      }
      case 'leafDirective': {
        const spec = LEAVES[node.name];
        if (!spec) {
          report('error', file, lineOf(node), `unknown leaf directive "::${node.name}"`);
          break;
        }
        for (const attr of spec.required) {
          if (!node.attributes?.[attr]) report('error', file, lineOf(node), `::${node.name} needs ${attr}="..."`);
        }
        if (node.name === 'fig' && node.attributes?.src) {
          const src = path.join(ROOT, 'public', node.attributes.src);
          if (!existsSync(src)) report('error', file, lineOf(node), `figure not found: public/${node.attributes.src}`);
          if (node.attributes.caption) checkMath(node.attributes.caption, file, lineOf(node), 'caption');
        }
        if (node.name === 'widget' && node.attributes?.name && !WIDGETS.includes(node.attributes.name)) {
          report('error', file, lineOf(node), `unknown widget "${node.attributes.name}" (allowed: ${WIDGETS.join(', ')})`);
        }
        break;
      }
      case 'textDirective': {
        const spec = TEXTS[node.name];
        if (!spec) {
          // A colon followed by letters in plain text is parsed as a directive.
          report('error', file, lineOf(node), `unknown text directive ":${node.name}" (if this is plain text, write "\\:" or add a space after the colon)`);
          break;
        }
        for (const attr of spec.required) {
          if (!node.attributes?.[attr]) report('error', file, lineOf(node), `:${node.name} needs ${attr}=...`);
        }
        if (node.name === 'term' && node.attributes?.k && !glossaryKeys.has(node.attributes.k)) {
          report('warn', file, lineOf(node), `glossary key "${node.attributes.k}" not defined yet`);
        }
        if (node.name === 'go' && node.attributes?.to) {
          const [page, anchor] = node.attributes.to.split('#');
          const basics = page.match(/^basics\/(.+)$/);
          if (basics) {
            const anchors = BASICS_ANCHORS[basics[1]];
            if (!anchors) report('error', file, lineOf(node), `unknown basics page "${page}"`);
            else if (anchor && !anchors.includes(anchor)) report('error', file, lineOf(node), `unknown anchor "#${anchor}" on ${page} (allowed: ${anchors.join(', ')})`);
          } else if (/^lecture\d+$/.test(page)) {
            const n = Number(anchor?.replace(/^p/, ''));
            if (!anchor || !n || n > slideCount(page)) report('error', file, lineOf(node), `bad slide link "${node.attributes.to}" (use lecture1#p05)`);
          } else if (!['index', 'symbols', 'glossary'].includes(page)) {
            report('error', file, lineOf(node), `unknown link target "${node.attributes.to}"`);
          }
        }
        if (node.name === 'slide' && slideMatch) {
          const n = Number(node.attributes?.n);
          if (!n || n > slideCount(slideMatch[1])) report('error', file, lineOf(node), `bad slide number n=${node.attributes?.n}`);
        }
        break;
      }
      case 'text': {
        for (const phrase of FORBIDDEN) {
          if (node.value.includes(phrase)) report('warn', file, lineOf(node), `avoid "${phrase}" — explain the step instead`);
        }
        if (STRAY_SYMBOLS.test(node.value)) {
          report('warn', file, lineOf(node), `math symbol outside $...$: "${node.value.match(STRAY_SYMBOLS)[0]}" — write it in LaTeX`);
        }
        break;
      }
      default:
        break;
    }
  });
}

const targets = process.argv.slice(2).map((p) => path.resolve(p));
const files = targets.length ? targets : listMarkdown(CONTENT);
const glossaryKeys = loadGlossaryKeys();
for (const file of files) checkFile(file, glossaryKeys);

const errors = problems.filter((p) => p.level === 'error');
for (const p of problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
  console.log(`${p.file}:${p.line}: ${p.level}: ${p.msg}`);
}
console.log(`\n${files.length} file(s) checked: ${errors.length} error(s), ${problems.length - errors.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
