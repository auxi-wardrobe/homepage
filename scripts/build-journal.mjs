import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchArticles } from './lib/strapi.mjs';
import { processCover } from './lib/images.mjs';
import { renderIndex, renderArticle, renderSitemap } from './lib/render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const articles = await fetchArticles();
if (!articles.length) throw new Error('No published articles from Strapi — aborting.');

// attach optimized cover to each article
for (const a of articles) {
  a.img = await processCover(a, { outDir: join(pub, 'img', 'journal'), width: 1200 });
}

const indexTpl = await readFile(join(root, 'scripts/templates/journal-index.html'), 'utf8');
await writeFile(join(pub, 'journal.html'), renderIndex(articles, indexTpl));
console.log(`✓ journal.html — ${articles.length} posts`);

const articleTpl = await readFile(join(root, 'scripts/templates/article.html'), 'utf8');
await mkdir(join(pub, 'journal'), { recursive: true });
for (const a of articles) {
  await writeFile(join(pub, 'journal', `${a.slug}.html`), renderArticle(a, articles, articleTpl));
}

const staticPaths = ['/', '/features', '/pricing', '/journal'];
await writeFile(join(pub, 'sitemap.xml'), renderSitemap(articles, staticPaths));
console.log(`✓ ${articles.length} article pages + sitemap`);
