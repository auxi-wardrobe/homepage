// Fetch + normalize Macgie journal articles from Strapi v5.
const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi-production-12be.up.railway.app';

function absUrl(url, base) {
  if (!url) return null;
  return url.startsWith('http') ? url : base.replace(/\/$/, '') + url;
}

function normalize(entry, base) {
  const c = entry.cover || null;
  return {
    id: entry.id,
    documentId: entry.documentId,
    title: entry.title,
    slug: entry.slug,
    excerpt: entry.excerpt || '',
    category: entry.category || '',
    author: entry.author || 'The Macgie Team',
    date: entry.displayDate || entry.publishedAt,
    readingTime: entry.readingTime || null,
    body: entry.body || '',
    featured: !!entry.featured,
    seoTitle: entry.seoTitle || '',
    seoDescription: entry.seoDescription || '',
    cover: c ? { url: absUrl(c.url, base), width: c.width, height: c.height, alt: c.alternativeText || entry.title } : null,
  };
}

export async function fetchArticles({ baseUrl = STRAPI_URL, token = process.env.STRAPI_TOKEN } = {}) {
  const url = `${baseUrl}/api/articles?populate=cover&sort=publishedAt:desc&pagination[pageSize]=100`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data.map((e) => normalize(e, baseUrl));
}

export { STRAPI_URL };
