// Shared i18n page-chrome: host config, EN<->VI path mapping, hreflang tags, the
// inline geo-redirect script, and the EN|VI switcher. Used by BOTH the journal
// renderer and the marketing-page translator so behaviour is identical everywhere.

export const SITE_URL = (process.env.SITE_URL || 'https://macgie.com').replace(/\/$/, '');
export const LOCALES = ['en', 'vi'];

/** '/x' -> '/vi/x' ; '/' -> '/vi/' ; already-vi paths are returned unchanged. */
export function toVi(p) {
  if (p === '/vi' || p.indexOf('/vi/') === 0) return p;
  return '/vi' + (p === '/' ? '/' : p);
}
/** '/vi/x' -> '/x' ; '/vi/' -> '/' ; non-vi paths returned unchanged. */
export function toEn(p) {
  if (p === '/vi' || p === '/vi/') return '/';
  if (p.indexOf('/vi/') === 0) return p.slice(3) || '/';
  return p;
}

/** Reciprocal hreflang + x-default for a page identified by its EN path. */
export function hreflangTags(enPath) {
  const en = SITE_URL + enPath;
  const vi = SITE_URL + toVi(enPath);
  return [
    `<link rel="alternate" hreflang="en" href="${en}">`,
    `<link rel="alternate" hreflang="vi" href="${vi}">`,
    `<link rel="alternate" hreflang="x-default" href="${en}">`,
  ].join('\n');
}

// Inline <head> script. A returning visitor with a lang cookie redirects
// synchronously = no flash; a first-time VN visitor fetches /cdn-cgi/trace once
// (one frame). We ONLY auto-push VN visitors to VI and NEVER auto-force /vi->EN,
// so a foreign-IP crawler landing on /vi stays there and Vietnamese pages stay
// indexable. Only an explicit EN choice (cookie=en, set by the switcher) sends
// /vi->EN. The same script makes the switcher sticky by writing the cookie on click.
const REDIRECT_SCRIPT = `<script>(function(){
var p=location.pathname,q=location.search+location.hash;
if(p.indexOf('/preview')===0)return;
function isVi(x){return x==='/vi'||x.indexOf('/vi/')===0;}
function toVi(x){return isVi(x)?x:'/vi'+(x==='/'?'/':x);}
function toEn(x){if(x==='/vi'||x==='/vi/')return '/';if(x.indexOf('/vi/')===0)return x.slice(3)||'/';return x;}
function ck(){var m=document.cookie.match(/(?:^|;\\s*)lang=([^;]+)/);return m?m[1]:'';}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-lang]');if(a){document.cookie='lang='+a.getAttribute('data-lang')+';path=/;max-age=31536000;samesite=lax';}});
var want=ck();
if(want==='vi'){if(!isVi(p))location.replace(toVi(p)+q);return;}
if(want==='en'){if(isVi(p))location.replace(toEn(p)+q);return;}
fetch('/cdn-cgi/trace').then(function(r){return r.text();}).then(function(t){
var loc=(t.match(/loc=([A-Z]+)/)||[])[1]||'';
if(loc==='VN'){document.cookie='lang=vi;path=/;max-age=31536000;samesite=lax';if(!isVi(p))location.replace(toVi(p)+q);}
}).catch(function(){});
})();</script>`;

// Google Analytics 4 (gtag.js) — site-wide measurement (id G-BV41NVY90Z). Placed at
// the END of the head-chrome block so a returning visitor's SYNCHRONOUS locale
// redirect (see REDIRECT_SCRIPT) aborts the page before GA fires on the wrong-locale
// URL. (A first-time VN visitor still double-counts once — that redirect is async.)
// Lives inside the idempotent <!--i18n-head--> markers, so rebuilds never duplicate it.
const GA4 = `<!-- Google Analytics (GA4) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-BV41NVY90Z"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BV41NVY90Z');</script>`;

/** Everything that goes in <head>: hreflang + geo-redirect script + GA4. */
export function headInjection(enPath) {
  return hreflangTags(enPath) + '\n' + REDIRECT_SCRIPT + '\n' + GA4;
}

// Live locales (a page actually exists at this path) vs. announced-but-not-built
// ones. FR/ES have no translated content yet — see the "Soon" entries below —
// so they're listed in the dropdown but not wired as real destinations.
const CURRENT = { en: 'EN', vi: 'VI' };

/**
 * The language dropdown: a button (current locale's code) that reveals a menu
 * of language options, text-only (no flag icons — a flag maps to a country,
 * not a language, and doesn't reliably represent one: English isn't the UK's
 * alone, Spanish isn't Spain's alone). Pure inline styles (no page stylesheet
 * dependency, matches how the rest of this chrome is injected) — app.js wires
 * the open/close behavior (`.lang-switch-btn` / `.lang-switch-menu`), the same
 * progressive-enhancement pattern used for the mobile menu and FAQ accordion.
 * `locale` is the current page's locale; `enPath` its EN path.
 */
export function switcherHtml(locale, enPath) {
  const cur = CURRENT[locale] || CURRENT.en;
  const itemBase =
    'display:flex;align-items:center;padding:8px 10px;border-radius:7px;border:none;' +
    'box-sizing:border-box;text-decoration:none;font-family:Geist,sans-serif;font-size:13px;' +
    'font-weight:600;line-height:1.2;white-space:nowrap;';
  const on = 'color:rgb(29,31,35);background:rgba(29,31,35,0.07);';
  const off = 'color:rgb(84,88,96);';
  const soon = 'color:rgb(154,149,141);cursor:default;';
  const item = (lang, href, label) =>
    `<a href="${href}" data-lang="${lang}" role="menuitem" style="${itemBase}${locale === lang ? on : off}">${label}</a>`;
  const soonItem = (label) =>
    `<span role="menuitem" aria-disabled="true" style="${itemBase}${soon}">${label}` +
    `<span style="margin-left:auto;padding-left:10px;font-size:10px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:rgb(154,149,141);">Soon</span></span>`;
  return (
    `<div class="lang-switch" style="position:relative;display:inline-block;">` +
    `<button type="button" class="lang-switch-btn" aria-haspopup="true" aria-expanded="false" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:none;border-radius:8px;background:rgba(29,31,35,0.07);font-family:Geist,sans-serif;font-size:13px;font-weight:600;line-height:1;color:rgb(29,31,35);cursor:pointer;">` +
    cur +
    `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style="margin-left:1px;"><path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `<div class="lang-switch-menu" role="menu" style="display:none;position:absolute;top:calc(100% + 6px);right:0;min-width:170px;background:#fff;border-radius:10px;box-shadow:0 8px 28px rgba(29,31,35,0.16);padding:6px;z-index:80;">` +
    item('en', enPath, 'English') +
    item('vi', toVi(enPath), 'Tiếng Việt') +
    soonItem('Français') +
    soonItem('Español') +
    `</div>` +
    `</div>`
  );
}
