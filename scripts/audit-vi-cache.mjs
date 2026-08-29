// Audit the committed translation cache for entries that are not translations.
//
// The build now refuses to cache a runaway or refusal output (see rejectReason
// in lib/translate.mjs), but entries cached before that guard existed can still
// be sitting in vi-cache.json — that is how a wall of invented Vietnamese
// app-UI copy ended up rendered on /vi, reading like keyword stuffing. This
// re-derives each cached entry's English source from the built EN pages, runs
// the same guard over it, and reports (or with --prune, deletes) every failure.
//
//   node scripts/audit-vi-cache.mjs           # report only, exits 1 if dirty
//   node scripts/audit-vi-cache.mjs --prune   # delete the bad entries
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse, NodeType } from 'node-html-parser';
import { rejectReason } from './lib/translate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_FILE = join(root, 'scripts', 'i18n', 'vi-cache.json');
const PRUNE = process.argv.includes('--prune');

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CODE', 'PRE', 'TEMPLATE']);
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;
const keyFor = (format, lang, text) => createHash('sha1').update(`${lang}\n${format}\n${text}`).digest('hex');

function textNodes(node, out, skip) {
  for (const child of node.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const tag = child.rawTagName ? child.rawTagName.toUpperCase() : '';
      textNodes(child, out, skip || SKIP_TAGS.has(tag));
    } else if (child.nodeType === NodeType.TEXT_NODE && !skip) {
      out.push(child.rawText.replace(/^\s+|\s+$/g, ''));
    }
  }
}

// Every English string the VI build could have asked the translator for.
function sourceStrings() {
  const out = [];
  for (const dir of [join(root, 'public'), join(root, 'public', 'journal')]) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.html')) continue;
      const doc = parse(readFileSync(join(dir, f), 'utf8'), { comment: true });
      textNodes(doc, out, false);
      for (const el of doc.querySelectorAll('[alt], [aria-label], [placeholder], meta[name="description"], meta[property="og:title"], meta[property="og:description"]')) {
        for (const a of ['alt', 'aria-label', 'placeholder', 'content']) {
          const v = el.getAttribute(a);
          if (v) out.push(v);
        }
      }
    }
  }
  return out.filter((s) => HAS_LETTER.test(s));
}

const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
const bySource = new Map();
for (const src of sourceStrings()) {
  for (const format of ['text', 'markdown']) {
    const k = keyFor(format, 'vi', src);
    if (cache[k] != null && !bySource.has(k)) bySource.set(k, src);
  }
}

const bad = [];
for (const [k, src] of bySource) {
  const why = rejectReason(src, cache[k]);
  if (why) bad.push({ k, src, why });
}

console.log(`vi-cache: ${Object.keys(cache).length} entries, ${bySource.size} resolved to an EN source`);
for (const { src, why, k } of bad) {
  console.log(`  ✗ ${why}\n      src: ${JSON.stringify(src.slice(0, 70))}\n      out: ${JSON.stringify(cache[k].slice(0, 70))}`);
}
if (!bad.length) {
  console.log('✓ no bad entries');
} else if (PRUNE) {
  for (const { k } of bad) delete cache[k];
  const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
  writeFileSync(CACHE_FILE, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`✓ pruned ${bad.length} entries — rebuild (npm run build:site) to re-translate them`);
} else {
  console.log(`${bad.length} bad entries — re-run with --prune to remove them`);
  process.exit(1);
}
