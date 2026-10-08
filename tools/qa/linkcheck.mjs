// Internal link + anchor checker for a built static site.
//   node /tmp/pw/linkcheck.mjs <dist-dir>
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(root);

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) {
    const html = readFileSync(file, 'utf8');
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(file);
};

const problems = [];
let checked = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:|javascript:)/.test(url)) continue;
    if (/['+]/.test(url)) continue; // string concatenation inside inline scripts, not a link
    checked += 1;
    const [pathPart, hash] = url.split('#');
    let target = pathPart ? path.resolve(path.dirname(file), pathPart.split('?')[0]) : file;
    if (pathPart && (pathPart.endsWith('/') || (existsSync(target) && statSync(target).isDirectory()))) target = path.join(target, 'index.html');
    if (!existsSync(target)) { problems.push(`${path.relative(root, file)} → ${url} (missing file)`); continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(hash))) {
      problems.push(`${path.relative(root, file)} → ${url} (missing anchor)`);
    }
  }
}
console.log(`${files.length} pages, ${checked} internal links checked, ${problems.length} problem(s)`);
for (const p of [...new Set(problems)].slice(0, 40)) console.log('  ' + p);
