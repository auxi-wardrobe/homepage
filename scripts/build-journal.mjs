import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchArticles } from './lib/strapi.mjs';
import { processCover } from './lib/images.mjs';
import { renderIndex, renderArticle, renderSitemap } from './lib/render.mjs';
import { localizeEn, localizeToVi } from './lib/localize.mjs';
import { flushCache, hasKey, provider } from './lib/translate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const articles = await fetchArticles();
if (!articles.length) throw new Error('No published articles from Strapi — aborting.');

// attach optimized cover to each article
for (const a of articles) {
  a.img = await processCover(a, { outDir: join(pub, 'img', 'journal'), width: 1200 });
}

const indexTpl = await readFile(join(root, 'scripts/templates/journal-index.html'), 'utf8');
const articleTpl = await readFile(join(root, 'scripts/templates/article.html'), 'utf8');
await mkdir(join(pub, 'journal'), { recursive: true });
await mkdir(join(pub, 'vi', 'journal'), { recursive: true });

// Remove stale article pages whose slug is no longer published (keeps the pre-
// existing committed 'article.html' demo stray). Prevents unpublished posts from
// lingering on the deployed site.
const validSlugs = new Set(articles.map((a) => a.slug));
for (const dir of [join(pub, 'journal'), join(pub, 'vi', 'journal')]) {
  for (const f of await readdir(dir).catch(() => [])) {
    if (!f.endsWith('.html') || f === 'article.html') continue;
    if (!validSlugs.has(f.slice(0, -5))) {
      await rm(join(dir, f));
      console.log(`  removed stale ${dir.includes('/vi/') ? 'vi/' : ''}journal/${f}`);
    }
  }
}

console.log(`i18n: translation ${hasKey() ? `ON (${provider()})` : 'OFF — /vi falls back to EN text'}`);

// EN + VI journal index
const enIndex = renderIndex(articles, indexTpl);
await writeFile(join(pub, 'journal.html'), localizeEn(enIndex, { enPath: '/journal' }));
await writeFile(join(pub, 'vi', 'journal.html'), await localizeToVi(enIndex, { enPath: '/journal' }));
console.log(`✓ journal.html (en + vi) — ${articles.length} posts`);

// EN + VI article pages
for (const a of articles) {
  const enPath = `/journal/${a.slug}`;
  const en = renderArticle(a, articles, articleTpl);
  await writeFile(join(pub, 'journal', `${a.slug}.html`), localizeEn(en, { enPath }));
  await writeFile(join(pub, 'vi', 'journal', `${a.slug}.html`), await localizeToVi(en, { enPath }));
}
console.log(`✓ ${articles.length} article pages (en + vi)`);

const staticPaths = ['/', '/features', '/pricing', '/journal'];
await writeFile(join(pub, 'sitemap.xml'), renderSitemap(articles, staticPaths));
flushCache();
console.log('✓ sitemap (both locales) + translation cache');
