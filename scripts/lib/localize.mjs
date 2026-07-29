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
// Legal/policy pages ship English-only — machine-translating them would put
// unreviewed Vietnamese legal text in front of users. Links to them must stay
// on the EN URL even from a /vi page, otherwise they'd 404 at /vi/privacy.
const EN_ONLY_HREF = /^\/(privacy|terms|ai-policy|subscription)(\/|\?|#|$)/i;

// Idempotent escape. The text we get back from the parser is ALREADY escaped
// source ("AI &amp; Image"), so a blanket &->&amp; double-escapes it and the
// entity renders literally. Only escape a bare & — one that doesn't already
// start an entity.
function esc(s) {
  return s
    .replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- chrome strip/inject (string-level, marker-bounded) ----
function stripChrome(html) {
  // Consume the trailing newline too — injectChrome writes `${head}\n</head>`,
  // so leaving it behind makes every rebuild append one more blank line.
  return html
    .replace(/<!--i18n-head-->[\s\S]*?<!--\/i18n-head-->\n?/g, '')
    .replace(/<!--i18n-sw-->[\s\S]*?<!--\/i18n-sw-->\n?/g, '');
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

// Parse a page, optionally machine-translate its text/attrs, and ALWAYS rewrite
// internal links -> /vi + absolutize relative asset paths (VI pages live one
// level deep). `translate:false` is used for human-authored VI pages whose text
// is already Vietnamese — they still need the link/asset rewrites, just no MT.
async function rewriteDoc(html, { enPath, translate = true }) {
  const dm = html.match(/^\s*<!doctype[^>]*>/i);
  const doctype = dm ? dm[0] : '';
  const root = parse(dm ? html.slice(dm[0].length) : html, { comment: true });

  const jobs = [];

  if (translate) {
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
  }

  await pool(jobs);

  // internal page links -> /vi (sync)
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href && href[0] === '/' && href[1] !== '/' && !href.startsWith('/vi/')
        && !ASSET_HREF.test(href) && !EN_ONLY_HREF.test(href)) {
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
  html = await rewriteDoc(html, { enPath, translate: true });
  html = html.replaceAll('https://macgie.com', SITE_URL);
  return injectChrome(html, { locale: 'vi', enPath });
}

// VI page whose content is ALREADY Vietnamese (human-authored in Strapi):
// apply only the VI chrome + internal-link/asset rewrites — NO machine
// translation. Used by the journal build for posts that have an authored VI
// localization; un-authored posts still fall back to localizeToVi (auto-MT).
export async function localizeViChrome(html, { enPath }) {
  html = stripChrome(html);
  html = await rewriteDoc(html, { enPath, translate: false });
  html = html.replaceAll('https://macgie.com', SITE_URL);
  return injectChrome(html, { locale: 'vi', enPath });
}
