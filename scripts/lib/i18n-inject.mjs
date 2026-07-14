// Shared i18n page-chrome: host config, EN<->VI path mapping, hreflang tags, the
// inline geo-redirect script, and the EN|VI switcher. Used by BOTH the journal
// renderer and the marketing-page translator so behaviour is identical everywhere.

export const SITE_URL = (process.env.SITE_URL || 'https://beta.macgie.com').replace(/\/$/, '');
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

/** Everything that goes in <head>: hreflang + the geo-redirect script. */
export function headInjection(enPath) {
  return hreflangTags(enPath) + '\n' + REDIRECT_SCRIPT;
}

/** The EN|VI switcher. `locale` is the current page's locale; `enPath` its EN path. */
export function switcherHtml(locale, enPath) {
  const base =
    'padding:3px 8px;border-radius:7px;text-decoration:none;font-family:Inter,sans-serif;font-size:13px;font-weight:600;line-height:1;';
  const on = 'color:rgb(29,31,35);background:rgba(29,31,35,0.07);';
  const off = 'color:rgb(154,149,141);';
  const a = (lang, href, label) =>
    `<a href="${href}" data-lang="${lang}" style="${base}${locale === lang ? on : off}">${label}</a>`;
  return (
    `<div class="lang-switch" style="display:inline-flex;align-items:center;gap:1px;">` +
    a('en', enPath, 'EN') +
    a('vi', toVi(enPath), 'VI') +
    `</div>`
  );
}
