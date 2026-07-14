// One localizer used for EVERY page (journal + marketing):
//   localizeEn(html, {enPath})   -> EN page + injected i18n chrome + host fix (sync)
//   localizeToVi(html, {enPath}) -> full VI page: text + attrs translated, internal
//                                   links -> /vi, chrome injected (async)
// Both are idempotent: injected chrome sits between markers and is stripped before
// re-injection, so re-running a build never double-injects.
import { parse, NodeType } from 'node-html-parser';
import { translate } from './translate.mjs';
import { SITE_URL, toVi, headInjection, switcherHtml } from './i18n-inject.mjs';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CODE', 'PRE', 'TEMPLATE']);
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;
const BRAND_ONLY = /^(macgie)$/i;
const ASSET_HREF = /^\/(assets|img|_ds|app\.js|sitemap\.xml|favicon)|\.(svg|png|jpe?g|webp|gif|css|js|xml|ico)(\?|#|$)/i;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- chrome strip/inject (string-level, marker-bounded) ----
function stripChrome(html) {
  return html
    .replace(/<!--i18n-head-->[\s\S]*?<!--\/i18n-head-->/g, '')
    .replace(/<!--i18n-sw-->[\s\S]*?<!--\/i18n-sw-->/g, '');
}

function injectChrome(html, { locale, enPath }) {
  const canonical = SITE_URL + (locale === 'vi' ? toVi(enPath) : enPath);
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}">`);
  const head = `<!--i18n-head-->\n${headInjection(enPath)}\n<!--/i18n-head-->`;
  html = html.replace('</head>', `${head}\n</head>`);
  const sw = `<!--i18n-sw-->${switcherHtml(locale, enPath)}<!--/i18n-sw-->`;
  html = html.replace('</nav>', `${sw}</nav>`);
  return html;
}

// ---- translation (parse-based) ----
function collectTextNodes(node, out, skip) {
  for (const child of node.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      const tag = child.rawTagName ? child.rawTagName.toUpperCase() : '';
      const noTr = child.getAttribute && (child.getAttribute('translate') === 'no' || child.getAttribute('data-no-translate') != null);
      collectTextNodes(child, out, skip || SKIP_TAGS.has(tag) || noTr);
    } else if (child.nodeType === NodeType.TEXT_NODE && !skip) {
      out.push(child);
    }
  }
}

const tr = (s) => translate(s, { format: 'text', targetLang: 'vi' });

async function pool(thunks, limit = 8) {
  let i = 0;
  const worker = async () => { while (i < thunks.length) { const j = i++; await thunks[j](); } };
  await Promise.all(Array.from({ length: Math.min(limit, thunks.length) }, worker));
}

async function translateDoc(html, { enPath }) {
  const dm = html.match(/^\s*<!doctype[^>]*>/i);
  const doctype = dm ? dm[0] : '';
  const root = parse(dm ? html.slice(dm[0].length) : html, { comment: true });

  const jobs = [];

  // text nodes
  const nodes = [];
  collectTextNodes(root, nodes, false);
  for (const tn of nodes) {
    const m = tn.rawText.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2];
    if (!HAS_LETTER.test(core) || BRAND_ONLY.test(core.trim())) continue;
    jobs.push(async () => { tn.rawText = m[1] + esc(await tr(core)) + m[3]; });
  }

  // translatable attributes
  for (const el of root.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')) {
    const c = el.getAttribute('content');
    if (c && HAS_LETTER.test(c)) jobs.push(async () => el.setAttribute('content', await tr(c)));
  }
  for (const el of root.querySelectorAll('[alt], [aria-label], [placeholder]')) {
    for (const attr of ['alt', 'aria-label', 'placeholder']) {
      const v = el.getAttribute(attr);
      if (v && HAS_LETTER.test(v)) jobs.push(async () => el.setAttribute(attr, await tr(v)));
    }
  }

  await pool(jobs);

  // internal page links -> /vi (sync)
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href && href[0] === '/' && href[1] !== '/' && !href.startsWith('/vi/') && !ASSET_HREF.test(href)) {
      a.setAttribute('href', toVi(href));
    }
  }

  // VI pages live one level deep (/vi/…), so RELATIVE asset paths (src="img/x",
  // "./x", "assets/x") would resolve to /vi/img/x and 404. Root-absolutize them.
  const absUrl = (u) => (!u || /^(https?:|\/\/|\/|#|data:|mailto:|tel:)/.test(u) ? u : '/' + u.replace(/^\.\//, ''));
  for (const el of root.querySelectorAll('[src]')) el.setAttribute('src', absUrl(el.getAttribute('src')));
  for (const el of root.querySelectorAll('[poster]')) el.setAttribute('poster', absUrl(el.getAttribute('poster')));
  for (const el of root.querySelectorAll('link[href]')) el.setAttribute('href', absUrl(el.getAttribute('href')));
  for (const el of root.querySelectorAll('[srcset]')) {
    el.setAttribute('srcset', el.getAttribute('srcset').split(',').map((part) => {
      const seg = part.trim().split(/\s+/); seg[0] = absUrl(seg[0]); return seg.join(' ');
    }).join(', '));
  }

  // relative url(...) inside CSS (background-image, fonts) -> absolute
  return (doctype + root.toString()).replace(
    /url\((['"]?)(?!https?:|\/\/|\/|data:|#)([^)'"]+)\1\)/g,
    (_m, q, u) => `url(${q}/${u.replace(/^\.\//, '')}${q})`,
  );
}

// ---- public API ----
export function localizeEn(html, { enPath }) {
  html = stripChrome(html).replaceAll('https://macgie.com', SITE_URL);
  return injectChrome(html, { locale: 'en', enPath });
}

export async function localizeToVi(html, { enPath }) {
  html = stripChrome(html);
  html = await translateDoc(html, { enPath });
  html = html.replaceAll('https://macgie.com', SITE_URL);
  return injectChrome(html, { locale: 'vi', enPath });
}
