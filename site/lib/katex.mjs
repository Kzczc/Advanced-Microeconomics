// The KaTeX copy that rehype-katex renders with. Its CSS and fonts must come from
// the same version as the generated HTML (class names such as .inner/.fix differ
// between KaTeX releases), so the build and the content checker both use this one.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requireFromRehypeKatex = createRequire(fileURLToPath(import.meta.resolve('rehype-katex')));

export const katex = requireFromRehypeKatex('katex');
export const katexDistDir = path.join(path.dirname(requireFromRehypeKatex.resolve('katex/package.json')), 'dist');
