// Single source of truth for the Markdown extensions used in content/.
// Both the site build (site/build.mjs) and the checker (tools/check_content.mjs)
// import these tables, so an unknown name fails in both places the same way.

import { readFileSync } from 'node:fs';

export const KATEX_MACROS = JSON.parse(
  readFileSync(new URL('./katex-macros.json', import.meta.url), 'utf8'),
);

// Container directives (:::name[title] ... :::) rendered as boxes.
// `tag` is the label printed in the box header; `title` in brackets is optional.
export const BOXES = {
  def: { tag: '定义', en: 'Definition' },
  prop: { tag: '命题', en: 'Proposition' },
  intuition: { tag: '直观理解', en: 'Intuition' },
  example: { tag: '例子', en: 'Example' },
  pitfall: { tag: '易错点', en: 'Pitfall' },
  prereq: { tag: '先补基础', en: 'Background' },
  proof: { tag: '证明拆解', en: 'Proof' },
  orig: { tag: '课件原文', en: 'Original' },
  note: { tag: '补充', en: 'Note' },
  check: { tag: '核对', en: 'Check' },
  summary: { tag: '要点', en: 'Key points' },
  quiz: { tag: '自测', en: 'Quiz' },
};

// Containers that only make sense inside another container.
export const INNER_CONTAINERS = {
  answer: { parent: 'quiz', label: '看答案与解析' },
};

// Leaf directives (::name{attrs}).
export const LEAVES = {
  fig: { required: ['src', 'caption'], optional: ['alt', 'width'] },
  widget: { required: ['name'], optional: ['caption', 'opts'] },
};

// Text directives (:name[text]{attrs}).
export const TEXTS = {
  term: { required: ['k'] }, // glossary tooltip, k = key in content/glossary/*.yaml
  en: { required: [] }, // English term styling
  go: { required: ['to'] }, // link: to="basics/convexity#convex-set" or "lecture1#p05"
  slide: { required: ['n'] }, // link to slide n of the current lecture
  why: { required: [] }, // justification badge inside proof steps
  hl: { required: [] }, // highlight
};

// Interactive widgets implemented in site/assets/js/widgets/<name>.js.
export const WIDGETS = [
  'pref-checker',
  'choice-rule',
  'harp-checker',
  'utility-transform',
  'lexi-continuity',
  'diagonal-utility',
  'upper-contour',
  'qc-1d',
  'quasilinear',
];

// Headings allowed inside a slide file (the page title is h1, the slide title is h2).
export const SLIDE_HEADING_DEPTHS = [3, 4];

// Fixed anchors of the basics pages, so lecture pages can link to them
// before those pages are written. Keys are "page#anchor".
export const BASICS_ANCHORS = {
  'sets-logic': ['set', 'subset', 'set-builder', 'cardinality', 'real-numbers', 'cartesian',
    'logic', 'quantifiers', 'iff-proof', 'induction', 'contradiction'],
  'functions-relations': ['function', 'image-range', 'increasing', 'composition', 'argmax',
    'relation', 'relation-properties', 'order'],
  'sequences-continuity': ['sequence', 'limit', 'distance-ball', 'closed-set',
    'continuity-function', 'countable'],
  convexity: ['convex-combination', 'convex-set', 'upper-contour', 'concave', 'quasi-concave',
    'strict'],
};
