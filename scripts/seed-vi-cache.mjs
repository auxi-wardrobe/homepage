// Seed the Vietnamese translation cache from a Claude Design export.
//
// The design project carries hand-authored Vietnamese for the marketing copy —
// as `window.MACGIE_VI={…}` on most pages and as an `i18n = {…}` class field on
// the home page. Those strings are dropped during flattening (the site
// translates at BUILD time, not in the browser), but they are strictly better
// than machine translation, so fold them into scripts/i18n/vi-cache.json before
// running the i18n build. Entries already in the cache are left alone unless
// --overwrite is passed.
//
// Usage: node scripts/seed-vi-cache.mjs <export-dir> [--overwrite]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_FILE = join(root, 'scripts', 'i18n', 'vi-cache.json');

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const exportDir = args.find((a) => !a.startsWith('--'));
if (!exportDir) {
  console.error('usage: node scripts/seed-vi-cache.mjs <export-dir> [--overwrite]');
  process.exit(1);
}

// Must match keyFor() in scripts/lib/translate.mjs.
const keyFor = (text) => createHash('sha1').update(`vi\ntext\n${text}`).digest('hex');

/** Pull the balanced {...} object literal that starts at `from` and JSON.parse it. */
function objectAt(src, from) {
  const start = src.indexOf('{', from);
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) {
      try { return JSON.parse(src.slice(start, i + 1)); } catch { return null; }
    }
  }
  return null;
}

const pairs = {};
let files = 0;
for (const f of readdirSync(exportDir).filter((f) => f.endsWith('.dc.html')).sort()) {
  const src = readFileSync(join(exportDir, f), 'utf8');
  let found = 0;
  for (const marker of [/window\.MACGIE_VI\s*=/g, /\bi18n\s*=\s*(?=\{)/g]) {
    for (const m of src.matchAll(marker)) {
      const obj = objectAt(src, m.index + m[0].length);
      if (!obj) continue;
      for (const [en, vi] of Object.entries(obj)) {
        if (typeof vi === 'string' && vi.trim() && en.trim() && en !== vi) {
          pairs[en] = vi;
          found++;
        }
      }
    }
  }
  if (found) files++;
  console.log(`  ${f}: ${found} pairs`);
}

let cache = {};
try { cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8')); } catch { cache = {}; }
const before = Object.keys(cache).length;

let added = 0, replaced = 0, skipped = 0;
for (const [en, vi] of Object.entries(pairs)) {
  const k = keyFor(en);
  if (cache[k] == null) { cache[k] = vi; added++; }
  else if (overwrite && cache[k] !== vi) { cache[k] = vi; replaced++; }
  else skipped++;
}

const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
writeFileSync(CACHE_FILE, JSON.stringify(sorted, null, 2) + '\n');

console.log(
  `\n${files} file(s) with VI dictionaries | ${Object.keys(pairs).length} unique EN strings\n` +
  `cache ${before} -> ${Object.keys(cache).length}  (added ${added}, replaced ${replaced}, already-cached ${skipped})`,
);
