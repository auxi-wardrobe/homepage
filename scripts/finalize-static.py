#!/usr/bin/env python3
"""Finalize flattened Macgie pages: inject FAQ answers (content/SEO) + mobile-menu/FAQ JS."""
import re, glob, os

PUB = "/Users/nguyenminhduc/dev/wardrobe_project/homepage/public"

mirror = open(os.path.join(PUB, "pricing.html"), encoding="utf-8").read()
faq = re.findall(r'\{\s*q:\s*"((?:[^"\\]|\\.)*)"\s*,\s*a:\s*"((?:[^"\\]|\\.)*)"\s*\}', mirror)
faq = [(q, a.encode().decode('unicode_escape')) for q, a in faq]
print("recovered FAQ pairs:", len(faq))

ANS_TPL = ('<div class="faq-a" style="font-family: Poppins, sans-serif; font-weight: 400; '
           'font-size: 16px; line-height: 28px; color: rgb(29, 31, 35); margin-top: 12px;">'
           '<span>{A}</span></div>')

def inject_faq(html):
    for q, a in faq:
        pat = re.compile(r'(<span class="sc-interp">' + re.escape(q) + r'</span></div>)(\s*)(<div[^>]*font-weight: 400)?', re.S)
        def rep(m):
            if m.group(3):
                return m.group(0).replace(m.group(3), m.group(3).replace('<div ', '<div class="faq-a" ', 1), 1)
            return m.group(1) + ANS_TPL.format(A=a.replace("<", "&lt;"))
        html = pat.sub(rep, html, count=1)
    return html

APP_JS = r"""(function(){
  var btn=document.querySelector('.hamburger'), nav=document.querySelector('header nav');
  if(btn&&nav){
    var p=document.createElement('nav'); p.id='m-nav'; p.setAttribute('aria-label','Mobile menu');
    p.innerHTML=nav.innerHTML; document.body.appendChild(p);
    var open=false;
    function set(o){open=o;p.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);document.documentElement.style.overflow=o?'hidden':'';}
    btn.addEventListener('click',function(){set(!open);});
    p.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  }
  var answers=Array.prototype.slice.call(document.querySelectorAll('.faq-a'));
  answers.forEach(function(a,i){ if(i>0) a.style.display='none'; });
  answers.forEach(function(a){
    var col=a.parentElement, rowEl=col&&col.parentElement;
    if(!rowEl) return;
    rowEl.style.cursor='pointer';
    rowEl.addEventListener('click',function(){ a.style.display=(a.style.display==='none')?'block':'none'; });
  });
})();"""
open(os.path.join(PUB, "app.js"), "w", encoding="utf-8").write(APP_JS)

MOBILE_CSS = ("<style>#m-nav{position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;"
              "background:#faf7f2;display:none;flex-direction:column;gap:4px;padding:84px 24px 32px;"
              "font-family:Inter,system-ui,sans-serif}#m-nav.open{display:flex}"
              "#m-nav a{color:#14110f;text-decoration:none;font-size:20px;font-weight:600;"
              "padding:14px 0;border-bottom:1px solid #e6e1d8}</style>")

for hp in glob.glob(os.path.join(PUB, "_flat_*.html")):
    html = open(hp, encoding="utf-8").read()
    if os.path.basename(hp) == "_flat_pricing.html":
        html = inject_faq(html)
    if "app.js" not in html:
        html = html.replace("</head>", MOBILE_CSS + "</head>", 1)
        html = html.replace("</body>", '<script src="app.js" defer></script></body>', 1)
    open(hp, "w", encoding="utf-8").write(html)
    print("wired:", os.path.basename(hp), "faq-a:", html.count('class="faq-a"'))
