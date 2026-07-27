import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
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
await writeFile(join(pub, 'sitemap.xml'), renderSitemap(articles, staticPaths));
flushCache();
console.log('✓ sitemap (both locales) + translation cache');
