import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchArticles } from './lib/strapi.mjs';
import { processCover } from './lib/images.mjs';
import { renderIndex, renderArticle, renderSitemap } from './lib/render.mjs';
import { localizeEn, localizeToVi, localizeViChrome } from './lib/localize.mjs';
import { flushCache, hasKey, provider } from './lib/translate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const articles = await fetchArticles();
if (!articles.length) throw new Error('No published articles from Strapi — aborting.');

// attach optimized cover to each article
for (const a of articles) {
  a.img = await processCover(a, { outDir: join(pub, 'img', 'journal'), width: 1200 });
}

// Human-authored Vietnamese localizations (Strapi i18n). Matched to EN by
// documentId; a post with no VI localization falls back to auto-translation.
const viRaw = await fetchArticles({ locale: 'vi' }).catch((e) => {
  console.warn(`[i18n] vi fetch failed — all posts fall back to auto-translate: ${String(e).slice(0, 120)}`);
  return [];
});
const viByDoc = new Map(viRaw.map((v) => [v.documentId, v]));
// Per-post display model for VI index/related cards: authored VI title/excerpt
// where present (marked _viAuthored so the localizer leaves it verbatim),
// else the EN card (auto-translated at page level as before).
const viList = articles.map((a) => {
  const vi = viByDoc.get(a.documentId);
  return vi ? { ...a, title: vi.title, excerpt: vi.excerpt, _viAuthored: true } : a;
});

// Stamp the templates' /app.js reference with that file's content hash.
// public/_headers asks for max-age=0 on /app.js but the zone actually serves
// max-age=14400, so a returning visitor can sit on a 4-hour-old app.js and lose
// whatever interaction we just fixed. A hashed URL sidesteps any cache TTL and
// only changes when app.js really changes.
const appJsV = createHash('md5')
  .update(await readFile(join(pub, 'app.js'), 'utf8').catch(() => ''))
  .digest('hex')
  .slice(0, 8);
const stampAppJs = (tpl) => tpl.replace(/(src="\.?\/?app\.js)(\?[^"]*)?"/g, `$1?v=${appJsV}"`);

const indexTpl = stampAppJs(await readFile(join(root, 'scripts/templates/journal-index.html'), 'utf8'));
const articleTpl = stampAppJs(await readFile(join(root, 'scripts/templates/article.html'), 'utf8'));
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
// …and their covers. Unpublishing a post used to leave its webp behind forever;
// they are invisible but still ship on every deploy.
const imgDir = join(pub, 'img', 'journal');
for (const f of await readdir(imgDir).catch(() => [])) {
  if (!f.endsWith('.webp')) continue;
  const slug = f.replace(/-card\.webp$/, '').replace(/\.webp$/, '');
  if (!validSlugs.has(slug)) {
    await rm(join(imgDir, f));
    console.log(`  removed stale img/journal/${f}`);
  }
}

console.log(`i18n: translation ${hasKey() ? `ON (${provider()})` : 'OFF — /vi falls back to EN text'}`);

// EN + VI journal index. VI index is rendered from viList so authored cards
// show their VI title/excerpt verbatim; un-authored cards still auto-translate.
const enIndex = renderIndex(articles, indexTpl);
await writeFile(join(pub, 'journal.html'), localizeEn(enIndex, { enPath: '/journal' }));
const viIndex = renderIndex(viList, indexTpl);
await writeFile(join(pub, 'vi', 'journal.html'), await localizeToVi(viIndex, { enPath: '/journal' }));
console.log(`✓ journal.html (en + vi) — ${articles.length} posts`);

// EN + VI article pages. A post with an authored VI localization renders its
// Vietnamese content directly (chrome only, no MT); otherwise it falls back to
// auto-translating the EN page exactly as before.
let authoredCount = 0;
for (const a of articles) {
  const enPath = `/journal/${a.slug}`;
  const en = renderArticle(a, articles, articleTpl);
  await writeFile(join(pub, 'journal', `${a.slug}.html`), localizeEn(en, { enPath }));

  const vi = viByDoc.get(a.documentId);
  if (vi) {
    const viA = { ...a, title: vi.title, excerpt: vi.excerpt, body: vi.body, seoTitle: vi.seoTitle, seoDescription: vi.seoDescription };
    const viHtml = renderArticle(viA, viList, articleTpl);
    await writeFile(join(pub, 'vi', 'journal', `${a.slug}.html`), await localizeViChrome(viHtml, { enPath }));
    authoredCount++;
  } else {
    await writeFile(join(pub, 'vi', 'journal', `${a.slug}.html`), await localizeToVi(en, { enPath }));
  }
}
console.log(`✓ ${articles.length} article pages (en + vi; ${authoredCount} authored VI, ${articles.length - authoredCount} auto-translated)`);

const staticPaths = ['/', '/features', '/journal'];
// Legal/policy pages are English-only — no /vi mirror (see EN_ONLY_HREF in lib/localize.mjs).
const enOnlyPaths = ['/privacy', '/terms', '/ai-policy', '/subscription'];
await writeFile(join(pub, 'sitemap.xml'), renderSitemap(articles, staticPaths, enOnlyPaths));
flushCache();
console.log('✓ sitemap (both locales) + translation cache');
