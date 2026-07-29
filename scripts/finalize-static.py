#!/usr/bin/env python3
"""Finalize flattened Macgie pages: strip the design's dead language pill,
inject FAQ answers (content/SEO), and wire mobile-menu/FAQ JS.

Usage: finalize-static.py [page.html ...]   (defaults to every page in public/)
"""
import re, glob, os, sys, hashlib

PUB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))

# The FAQ block lived on the pricing page, which was removed from the site.
# Guard the read so a re-flatten without a pricing page no-ops cleanly instead of crashing.
_mirror_path = os.path.join(PUB, "pricing.html")
mirror = open(_mirror_path, encoding="utf-8").read() if os.path.exists(_mirror_path) else ""
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
  // Cat eyes follow the cursor. The design does this in its canvas runtime
  // (componentDidMount -> _eyeMove), which flattening strips, leaving the cats
  // staring blankly. Same maths as the original; #hpL/#hpR/#scL/#scR already
  // carry `transition: transform .09s linear` from the design CSS.
  var EYES=['hpL','hpR','scL','scR'];
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&document.getElementById('hpL')){
    var pending=null;
    window.addEventListener('mousemove',function(e){
      if(pending)return;
      pending=requestAnimationFrame(function(){
        pending=null;
        EYES.forEach(function(id){
          var el=document.getElementById(id); if(!el)return;
          var r=el.getBoundingClientRect();
          var dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
          var d=Math.hypot(dx,dy)||1, m=2.4;
          el.setAttribute('transform','translate('+(dx/d*m).toFixed(2)+' '+(dy/d*m).toFixed(2)+')');
        });
      });
    },{passive:true});
  }
  // "How it works" step switcher — click a step, the phone shows that screen.
  // Design state (step 0|1|2) lived in the stripped runtime; wire_how_it_works
  // in finalize-static.py re-materialises the hidden photos + highlights.
  var cards=Array.prototype.slice.call(document.querySelectorAll('.step-card'));
  var photos=Array.prototype.slice.call(document.querySelectorAll('.how-photo'));
  if(cards.length&&photos.length>1){
    var pick=function(i){
      photos.forEach(function(p,j){ p.style.display = j===i ? 'block' : 'none'; });
      cards.forEach(function(c,j){
        var hl=c.querySelector('.step-hl');
        if(hl) hl.style.display = j===i ? 'block' : 'none';
        c.setAttribute('aria-selected', j===i ? 'true' : 'false');
      });
    };
    cards.forEach(function(c,j){
      c.setAttribute('role','button');
      c.setAttribute('tabindex','0');
      c.addEventListener('click',function(){pick(j);});
      c.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(j);}
      });
    });
    pick(0);
  }
  // Feature carousel. The design drives this from its canvas runtime, which we
  // strip — without this the dots are inert and slide 2's cards are unreachable
  // behind overflow:hidden. Re-implement the same behaviour as plain JS.
  var track=document.getElementById('featTrack');
  var dots=Array.prototype.slice.call(document.querySelectorAll('.featdot'));
  if(track&&dots.length>1){
    var page=0;
    var show=function(i){
      page=Math.max(0,Math.min(i,dots.length-1));
      track.style.transform='translateX(-'+(page*100)+'%)';
      dots.forEach(function(d,j){
        d.style.width=j===page?'24px':'8px';
        d.style.background=j===page?'rgb(29, 31, 35)':'rgba(29, 31, 35, 0.22)';
        d.setAttribute('aria-current',j===page?'true':'false');
      });
    };
    dots.forEach(function(d,j){
      d.setAttribute('role','button');
      d.setAttribute('tabindex','0');
      d.setAttribute('aria-label','Show feature group '+(j+1));
      d.addEventListener('click',function(){show(j);});
      d.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();show(j);}
      });
    });
    // horizontal swipe on touch
    var x0=null;
    track.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    track.addEventListener('touchend',function(e){
      if(x0===null)return;
      var dx=e.changedTouches[0].clientX-x0; x0=null;
      if(Math.abs(dx)>40)show(page+(dx<0?1:-1));
    },{passive:true});
    show(0);
  }
  // Journal category filter. render.mjs emits the chips, the [data-post]
  // [data-category] cards and the .is-hidden rule, but nothing ever wired the
  // click — the chips looked live (cursor:pointer, hover state) and did nothing.
  var bar=document.querySelector('[data-filter-bar]');
  if(bar){
    var chips=Array.prototype.slice.call(bar.querySelectorAll('.jchip'));
    var posts=Array.prototype.slice.call(document.querySelectorAll('[data-post]'));
    chips.forEach(function(chip){
      chip.addEventListener('click',function(){
        var want=chip.getAttribute('data-filter');
        chips.forEach(function(c){ c.classList.toggle('is-active', c===chip); });
        posts.forEach(function(p){
          var show = want==='*' || p.getAttribute('data-category')===want;
          p.classList.toggle('is-hidden', !show);
        });
      });
    });
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

# Cache-bust by content hash. public/_headers asks for max-age=0 on /app.js but
# the zone serves max-age=14400, so a returning visitor can sit on a 4-hour-old
# app.js and lose whatever interaction we just fixed. A hashed URL sidesteps any
# cache TTL entirely, and only changes when the file actually changes.
APP_JS_V = hashlib.md5(APP_JS.encode("utf-8")).hexdigest()[:8]
APP_JS_REF = re.compile(r'(<script[^>]*\bsrc=")(\.?/?app\.js)(\?[^"]*)?(")')

MOBILE_CSS = ("<style>#m-nav{position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;"
              "background:#faf7f2;display:none;flex-direction:column;gap:4px;padding:84px 24px 32px;"
              "font-family:Geist,system-ui,sans-serif}#m-nav.open{display:flex}"
              "#m-nav a{color:#14110f;text-decoration:none;font-size:20px;font-weight:600;"
              "padding:14px 0;border-bottom:1px solid #e6e1d8}</style>")

# The design ships its own EN/VI pill driven by a client-side dictionary. This
# site translates at BUILD time instead (scripts/lib/localize.mjs emits /vi/…
# and injects the real switcher into <nav>), so flattening leaves the pill
# behind as a dead control. Drop it — two sibling spans, EN then VI.
LANG_PILL = re.compile(
    r'<div[^>]*>\s*<span[^>]*>EN</span>\s*<span[^>]*>VI</span>\s*</div>', re.S)


def strip_lang_pill(html):
    return LANG_PILL.sub("", html)


# --- "How it works" step switcher -------------------------------------------
# The design renders this with <sc-if>, so the pre-rendered DOM only ever
# contains the ACTIVE branch: photo 0 and step-card 0's highlight. Photos 1-2
# and the other highlights never make it into the static HTML, which leaves the
# step cards looking clickable (cursor:pointer) but doing nothing. Re-materialise
# the missing branches here, hidden, and let app.js toggle them.
HOW_ALTS = {
    0: "Macgie app showing today's outfit",
    1: "Saving a favourite outfit in Macgie",
    2: "Previewing an outfit on yourself in Macgie",
}
STEP_HL = ('<div class="step-hl" style="position:absolute;inset:0;'
           'background:rgba(242,239,236,.07);border-radius:16px;'
           'border:1px solid rgba(242,239,236,.16);display:{D}"></div>')


# --- cat eyes on pages that reference the standalone SVG ---------------------
# The home/journal cats are INLINE svg whose pupils carry ids, so app.js can
# move them. The features cat is the same artwork shipped as a separate file and
# dropped in via <img> — identical path data, just missing the two ids, and an
# <img> is a closed document that outer JS cannot reach into. Inline it and
# restore the ids so the eyes track there too. Keyed by `d` prefix (the pupil
# geometry is byte-identical to the inline version).
CAT_PUPILS = {
    "M54.3488 37.0215": "hpL",
    "M70.3488 38.0215": "hpR",
}


def wire_cat_eyes(html, pubdir):
    m = re.search(r'<img[^>]*src="\.?/?(cattongle-[a-z0-9]+\.svg)"[^>]*>', html)
    if not m:
        return html
    tag, fname = m.group(0), m.group(1)
    path = os.path.join(pubdir, fname)
    if not os.path.exists(path):
        return html

    svg = open(path, encoding="utf-8").read().strip()
    added = 0
    for d_prefix, pid in CAT_PUPILS.items():
        pat = re.compile(r'<path (d="' + re.escape(d_prefix) + r'[^"]*")')
        svg, n = pat.subn(lambda mo, p=pid: f'<path id="{p}" {mo.group(1)}', svg, count=1)
        added += n
    if added != len(CAT_PUPILS):
        print(f"  warn: {fname} — matched {added}/{len(CAT_PUPILS)} pupils, leaving <img> as-is")
        return html

    # carry the <img>'s rendering over to the inline <svg>
    style = (re.search(r'style="([^"]*)"', tag) or [None, ""])[1]
    alt = (re.search(r'alt="([^"]*)"', tag) or [None, ""])[1]
    svg = re.sub(
        r"^<svg ",
        '<svg role="img" aria-label="%s" style="%s" ' % (alt, style),
        svg, count=1,
    )
    print(f"  inlined {fname} with {added} tracking pupils")
    return html.replace(tag, svg, 1)


def set_display(tag, value):
    """Force exactly one `display` declaration in the tag's style attribute.

    repl_slot (flatten-static.py) already appends `display:block`, so merely
    prepending `display:none` yields two declarations and the LAST one wins —
    the element stays visible. Drop any existing one first.
    """
    def repl(mo):
        css = re.sub(r'display\s*:[^;]*;?\s*', '', mo.group(1)).strip()
        if css and not css.endswith(";"):
            css += ";"
        return 'style="%sdisplay:%s;"' % (css + (" " if css else ""), value)

    return re.sub(r'style="([^"]*)"', repl, tag, count=1)


def wire_how_it_works(html):
    m = re.search(r'<img src="img/how-photo-0\.webp"[^>]*>', html)
    if not m:
        return html

    # 1. photo 0 gets a class; photos 1-2 are cloned from it, hidden.
    tag0 = m.group(0)
    out = [set_display(tag0.replace("<img ", '<img class="how-photo" ', 1), "block")]
    for i in (1, 2):
        rel = f"img/how-photo-{i}.webp"
        path = os.path.join(PUB, rel)
        if not os.path.exists(path):
            print(f"  warn: {rel} missing — step {i} will have no photo")
            continue
        t = tag0.replace("how-photo-0.webp", f"how-photo-{i}.webp")
        t = re.sub(r'alt="[^"]*"', 'alt="%s"' % HOW_ALTS[i], t)
        try:
            from PIL import Image
            with Image.open(path) as im:
                w, h = im.size
            t = re.sub(r'width="\d+" height="\d+"', f'width="{w}" height="{h}"', t)
        except Exception:
            pass
        t = t.replace("<img ", '<img class="how-photo" ', 1)
        out.append(set_display(t, "none"))
    html = html.replace(tag0, "".join(out), 1)

    # 2. every step-card needs a highlight layer; only the first starts visible.
    idx = [0]

    def add_hl(mo):
        card = mo.group(0)
        i = idx[0]
        idx[0] += 1
        nxt = html[mo.end():mo.end() + 300]
        already = re.match(r'\s*<div style="position: absolute; inset: 0px;', nxt)
        if already:  # card 0: tag the highlight the pre-render already emitted
            return card
        return card + STEP_HL.format(D="none")

    html = re.sub(r'<div class="step-card"[^>]*>', add_hl, html)
    # tag the pre-rendered highlight so app.js can treat all three alike
    html = html.replace(
        '<div style="position: absolute; inset: 0px; background: rgba(242, 239, 236, 0.07);',
        '<div class="step-hl" style="display:block; position: absolute; inset: 0px; background: rgba(242, 239, 236, 0.07);',
        1)
    return html


targets = [os.path.abspath(p) for p in sys.argv[1:]] or sorted(
    p for p in glob.glob(os.path.join(PUB, "*.html"))
    # preview.html is client-rendered on purpose and 404 has no chrome to wire
    if os.path.basename(p) not in {"preview.html", "404.html"}
)

for hp in targets:
    html = open(hp, encoding="utf-8").read()
    pills = len(LANG_PILL.findall(html))
    html = strip_lang_pill(html)
    html = wire_how_it_works(html)
    html = wire_cat_eyes(html, PUB)
    if os.path.basename(hp) == "pricing.html":
        html = inject_faq(html)
    if "app.js" not in html:
        html = html.replace("</head>", MOBILE_CSS + "</head>", 1)
        html = html.replace(
            "</body>", f'<script src="app.js?v={APP_JS_V}" defer></script></body>', 1)
    else:
        html = APP_JS_REF.sub(lambda m: m.group(1) + m.group(2) + f"?v={APP_JS_V}" + m.group(4), html)
    open(hp, "w", encoding="utf-8").write(html)
    print(f"wired: {os.path.basename(hp)} faq-a: {html.count('class=\"faq-a\"')} lang-pill removed: {pills}")
