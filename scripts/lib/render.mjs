// Render the journal index + article pages from templates + Strapi articles.
export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function readMin(a) { return a.readingTime || Math.max(1, Math.round((a.body.split(/\s+/).length) / 200)); }

function meta(a) {
  return `<div style="font-family: Poppins, sans-serif; font-weight: 400; font-size: 14px; color: rgb(111, 106, 99); display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap;"><span>${escapeHtml(a.author)}</span><span>${fmtDate(a.date)}</span><span>${readMin(a)} min read</span></div>`;
}

function featuredCard(a) {
  return `<a class="post" href="/journal/${escapeHtml(a.slug)}" style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; align-items: stretch;">
  <div style="border-radius: 24px; overflow: hidden; background: rgb(242, 244, 247); height: 427px;"><img class="pimg" src="${a.img.src}" width="${a.img.width}" height="${a.img.height}" alt="${escapeHtml(a.cover.alt)}" loading="eager" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;"></div>
  <div style="display: flex; flex-direction: column; justify-content: center;">
    <div style="font-family: Poppins, sans-serif; font-weight: 300; font-size: 13px; letter-spacing: .12px; text-transform: uppercase; color: rgb(107,76,205);">${escapeHtml(a.category)}</div>
    <div class="ptitle" style="font-family: Poppins, sans-serif; font-weight: 800; font-size: 30px; line-height: 1.16; color: rgb(23,24,28); margin-top: 10px;">${escapeHtml(a.title)}</div>
    <p style="font-family: Poppins, sans-serif; font-weight: 400; font-size: 16px; line-height: 27px; color: rgb(38,38,38); margin: 12px 0 0;">${escapeHtml(a.excerpt)}</p>
    ${meta(a)}
  </div></a>`;
}

function gridCard(a, h = 318) {
  return `<a class="post" href="/journal/${escapeHtml(a.slug)}" style="display: flex; flex-direction: column; gap: 16px;">
  <div style="border-radius: 24px; overflow: hidden; background: rgb(242, 244, 247); height: ${h}px;"><img class="pimg" src="${a.img.src}" width="${a.img.width}" height="${a.img.height}" alt="${escapeHtml(a.cover.alt)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>
  <div>
    <div style="font-family: Poppins, sans-serif; font-weight: 300; font-size: 12px; letter-spacing: .12px; text-transform: uppercase; color: rgb(107,76,205);">${escapeHtml(a.category)}</div>
    <div class="ptitle" style="font-family: Poppins, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.18; color: rgb(23,24,28); margin-top: 10px;">${escapeHtml(a.title)}</div>
    <p style="font-family: Poppins, sans-serif; font-weight: 400; font-size: 15px; line-height: 26px; color: rgb(38,38,38); margin: 10px 0 0;">${escapeHtml(a.excerpt)}</p>
    ${meta(a)}
  </div></a>`;
}

export function renderIndex(articles, template) {
  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a !== featured);
  const cards =
    `<section style="max-width: 1170px; margin: 0px auto; padding: 38px 40px 0px; display: flex; flex-direction: column; align-items: center;"><div style="width:100%;">${featured ? featuredCard(featured) : ''}</div></section>` +
    `<section style="max-width: 1170px; margin: 0px auto; padding: 40px 40px 88px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">${rest.map((a) => gridCard(a)).join('\n')}</section>`;
  return template.replace('<!--JOURNAL_CARDS-->', cards);
}

import { marked } from 'marked';

function readMinPublic(a) { return a.readingTime || Math.max(1, Math.round(a.body.split(/\s+/).length / 200)); }

function relatedCard(a) {
  return `<a class="post" href="/journal/${escapeHtml(a.slug)}" style="display:flex;flex-direction:column;gap:12px;">
    <div style="border-radius:20px;overflow:hidden;background:rgb(242,244,247);height:180px;"><img class="pimg" src="${a.img.src}" width="${a.img.width}" height="${a.img.height}" alt="${escapeHtml(a.cover.alt)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>
    <div class="ptitle" style="font-family:Poppins,sans-serif;font-weight:700;font-size:18px;line-height:1.2;color:rgb(23,24,28);">${escapeHtml(a.title)}</div>
  </a>`;
}

export function renderArticle(a, all, template) {
  const title = escapeHtml(a.seoTitle || a.title);
  const desc = escapeHtml(a.seoDescription || a.excerpt);
  const canonical = `https://macgie.com/journal/${a.slug}`;
  const ogImage = `https://macgie.com${a.img.src}`;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.title, description: a.seoDescription || a.excerpt, image: ogImage,
    author: { '@type': 'Person', name: a.author }, datePublished: a.date,
    publisher: { '@type': 'Organization', name: 'Macgie', logo: { '@type': 'ImageObject', url: 'https://macgie.com/assets/brand/macgie.svg' } },
    mainEntityOfPage: canonical,
  });
  const related = all.filter((x) => x.slug !== a.slug).slice(0, 3).map(relatedCard).join('\n');
  return template
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESC}}', desc)
    .replaceAll('{{CANONICAL}}', canonical)
    .replaceAll('{{OG_IMAGE}}', ogImage)
    .replaceAll('{{AUTHOR}}', escapeHtml(a.author))
    .replaceAll('{{DATE}}', fmtDate(a.date))
    .replaceAll('{{READ}}', String(readMinPublic(a)))
    .replace('<!--JSONLD-->', `<script type="application/ld+json">${jsonld}</script>`)
    .replace('{{BODY}}', marked.parse(a.body || ''))
    .replace('<!--RELATED-->', related);
}

export function renderSitemap(articles, staticPaths) {
  const urls = [
    ...staticPaths.map((p) => `https://macgie.com${p}`),
    ...articles.map((a) => `https://macgie.com/journal/${a.slug}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
}
