#!/usr/bin/env python3
"""Beginner-readability audit: lists the places where a reader with no background may get stuck.

    python3 tools/qa/audit.py              # lecture pages and basics pages
    python3 tools/qa/audit.py lecture1     # only content/lecture1

Reports
  1. LaTeX commands used in formulas that the symbol table (content/symbols.md) never shows.
  2. Glossary terms mentioned on a page that has no :term link for them.
  3. Paragraphs longer than LONG_PARAGRAPH characters (formulas count as one character).
  4. Slide pages with no figure and no widget.
  5. Latin abbreviations (two or more capitals) in the Chinese prose, with the pages they appear on.

Nothing here is an error: each line is a place to look at and decide.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / 'content'
LONG_PARAGRAPH = 220

# Commands that only lay out a formula; a reader never needs them explained.
LAYOUT_COMMANDS = {
    'text', 'mathrm', 'mathbf', 'textbf', 'operatorname', 'quad', 'qquad', 'left', 'right', 'big', 'Big',
    'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'frac', 'tfrac', 'dfrac', 'displaystyle', 'begin', 'end',
    'hline', 'color', 'boxed', 'underbrace', 'overbrace', 'phantom', 'hphantom', 'vphantom', 'mathstrut',
    'cdot', 'cdots', 'dots', 'ldots', 'vdots', 'ddots', 'colon', 'mid', 'lvert', 'rvert', 'lVert', 'rVert',
    'langle', 'rangle', 'tag', 'notag', 'nonumber', 'limits', 'nolimits', 'textsf', 'texttt', 'emph',
    'mathit', 'it', 'rm', 'bf', 'scriptstyle', 'textstyle', 'stackrel', 'overset', 'underset', 'substack',
    'quad', 'enspace', 'thinspace', 'hspace', 'vspace', 'kern', 'mkern', 'raisebox', 'smash', 'llap', 'rlap',
    'checkmark', 'times', 'pm', 'le', 'ge', 'leq', 'geq', 'ne', 'neq', 'approx', 'infty', 'circ', 'prime',
    'sqrt', 'ln', 'log', 'exp', 'min', 'max', 'sin', 'cos', 'lfloor', 'rfloor', 'lceil', 'rceil',
    'div', 'underline', 'overline',
}
MATH = re.compile(r'\$\$(.+?)\$\$|(?<![\\$])\$(?!\$)(.+?)(?<!\\)\$', re.S)
COMMAND = re.compile(r'\\([A-Za-z]+)')


def strip_front_matter(text):
    return re.sub(r'\A---\n.*?\n---\n', '', text, flags=re.S)


def math_spans(text):
    return [a or b for a, b in MATH.findall(text)]


def prose(text):
    """Chinese prose of a page: no formulas, no slide quotes, no directive syntax."""
    text = re.sub(r'^:::+orig.*?^:::+\s*$', '', text, flags=re.S | re.M)
    text = MATH.sub(' ', text)
    text = re.sub(r':en\[[^\]]*\]', ' ', text)
    text = re.sub(r'::?(fig|widget)\{[^}]*\}', ' ', text)
    text = re.sub(r'\{[^}]*\}', ' ', text)
    return text


def load_pages(only):
    folders = [only] if only else ['lecture1', 'basics']
    pages = []
    for folder in folders:
        for path in sorted((CONTENT / folder).glob('*.md')):
            if path.name == 'sheet.md':
                continue
            pages.append((f'{folder}/{path.stem}', strip_front_matter(path.read_text(encoding='utf8'))))
    return pages


def report_symbols(pages):
    known = set()
    for span in math_spans((CONTENT / 'symbols.md').read_text(encoding='utf8')):
        known.update(COMMAND.findall(span))
    first_seen = {}
    for name, text in pages:
        for span in math_spans(text):
            for cmd in COMMAND.findall(span):
                if cmd not in known and cmd not in LAYOUT_COMMANDS:
                    first_seen.setdefault(cmd, set()).add(name)
    print(f'\n## 1. 公式里用到、符号速查没收录的命令（{len(first_seen)} 个）')
    for cmd, where in sorted(first_seen.items(), key=lambda kv: -len(kv[1])):
        print(f'  \\{cmd:<14} {len(where):>2} 页  例如 {", ".join(sorted(where)[:4])}')


def report_terms(pages):
    """The build links the first mention of every other term by itself (rehypeAutoTerms in site/build.mjs)."""
    terms = []
    for path in sorted((CONTENT / 'glossary').glob('*.yaml')):
        for entry in yaml.safe_load(path.read_text(encoding='utf8')) or []:
            if entry.get('auto') is False:
                terms.append((entry['k'], entry['zh']))
    missing = defaultdict(list)
    for name, text in pages:
        body = prose(text)
        for key, zh in terms:
            if zh in body and f'k={key}' not in text:
                missing[name].append(zh)
    total = sum(len(v) for v in missing.values())
    print(f'\n## 2. 标了 auto: false 的术语：提到了、却没有手动加悬停（{total} 处，确认是不是日常用法）')
    for name, words in missing.items():
        print(f'  {name:<26} {"、".join(words)}')


def report_long_paragraphs(pages):
    print(f'\n## 3. 超过 {LONG_PARAGRAPH} 字的段落')
    count = 0
    for name, text in pages:
        for block in re.split(r'\n\s*\n', text):
            first = block.lstrip()
            if not first or first[0] in '-|#:>*' or re.match(r'\d+\.\s', first) or first.startswith('$$'):
                continue
            plain = MATH.sub('x', block)
            plain = re.sub(r':\w+\[([^\]]*)\]\{[^}]*\}', r'\1', plain)
            plain = re.sub(r'\s+', '', plain)
            if len(plain) > LONG_PARAGRAPH:
                count += 1
                print(f'  {name:<26} {len(plain):>4} 字  {plain[:36]}…')
    print(f'  共 {count} 段')


def report_visuals(pages):
    bare = [name for name, text in pages if name.startswith('lecture') and '::fig' not in text and '::widget' not in text]
    print(f'\n## 4. 没有插图也没有交互图的课件页（{len(bare)} 页）')
    if bare:
        print('  ' + '、'.join(bare))


def report_abbreviations(pages):
    seen = defaultdict(set)
    for name, text in pages:
        for word in re.findall(r'(?<![A-Za-z])[A-Z]{2,}[a-z]?(?![A-Za-z])', prose(text)):
            seen[word].add(name)
    print(f'\n## 5. 中文正文里的英文缩写（{len(seen)} 个）')
    for word, where in sorted(seen.items(), key=lambda kv: -len(kv[1])):
        print(f'  {word:<10} {len(where):>2} 页  例如 {", ".join(sorted(where)[:5])}')


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    pages = load_pages(only)
    print(f'审查 {len(pages)} 个页面')
    report_symbols(pages)
    report_terms(pages)
    report_long_paragraphs(pages)
    report_visuals(pages)
    report_abbreviations(pages)


if __name__ == '__main__':
    main()
