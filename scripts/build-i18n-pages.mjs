// Localize the hand-authored marketing pages (home / features / pricing / 404).
// Runs on demand when marketing copy changes — NOT in the cron (the cron only
// rebuilds the Strapi journal). Writes the EN page back in place (adds i18n
// chrome + host fix) and emits the VI mirror under public/vi/. Idempotent.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { localizeEn, localizeToVi } from './lib/localize.mjs';
import { flushCache, hasKey, provider } from './lib/translate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const PAGES = [
  { file: 'index.html', enPath: '/' },
  { file: 'features.html', enPath: '/features' },
  { file: 'pricing.html', enPath: '/pricing' },
  { file: '404.html', enPath: '/404' },
];

console.log(`i18n pages: translation ${hasKey() ? `ON (${provider()})` : 'OFF — /vi falls back to EN text'}`);
await mkdir(join(pub, 'vi'), { recursive: true });

for (const { file, enPath } of PAGES) {
  const src = await readFile(join(pub, file), 'utf8');
  await writeFile(join(pub, file), localizeEn(src, { enPath }));
  await writeFile(join(pub, 'vi', file), await localizeToVi(src, { enPath }));
  console.log(`✓ ${file} (en + vi)`);
}

flushCache();
console.log('✓ marketing pages localized');
