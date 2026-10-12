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

# NOTE (2026-10): this constant is the source of truth for public/app.js —
# line ~194 overwrites the file with it. It had drifted: the hero carousel
# and the cat-eye fix were hand-edited into public/app.js and a re-flatten
# would have wiped both, while APP_JS_V below kept hashing the stale copy.
# Edit app.js HERE, not in public/.
APP_JS = r"""(function(){
  var btn=document.querySelector('.hamburger'), nav=document.querySelector('header nav');
  if(btn&&nav){
    var p=document.createElement('nav'); p.id='m-nav'; p.setAttribute('aria-label','Mobile menu');
    p.innerHTML=nav.innerHTML;
    var logoLink=document.querySelector('header a');
    var homeLink=document.createElement('a');
    homeLink.className='navlink'; homeLink.href=logoLink?logoLink.getAttribute('href'):'/'; homeLink.textContent='Home';
    p.insertBefore(homeLink, p.firstChild);
    var closeBtn=document.createElement('button');
    closeBtn.type='button'; closeBtn.className='m-close'; closeBtn.setAttribute('aria-label','Close menu');
    closeBtn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
    p.insertBefore(closeBtn, p.firstChild);
    var headerBadge=document.querySelector('header .store-badge');
    if(headerBadge){
      var mBadge=headerBadge.cloneNode(true);
      mBadge.classList.add('m-store-badge');
      p.appendChild(mBadge);
    }
    document.body.appendChild(p);
    var open=false;
    function set(o){open=o;p.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);document.documentElement.style.overflow=o?'hidden':'';}
    btn.addEventListener('click',function(){set(!open);});
    closeBtn.addEventListener('click',function(){set(false);});
    p.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  }
  // Language dropdown (EN / VI / FR-soon). The header nav and the cloned mobile
  // nav above each carry their own .lang-switch-btn + .lang-switch-menu pair —
  // wire each independently so opening one doesn't affect the other.
  var langBtns=Array.prototype.slice.call(document.querySelectorAll('.lang-switch-btn'));
  if(langBtns.length){
    var closeAll=function(except){
      langBtns.forEach(function(b){
        if(b===except)return;
        b.setAttribute('aria-expanded','false');
        var m=b.nextElementSibling;
        if(m)m.style.display='none';
      });
    };
    langBtns.forEach(function(btn){
      var menu=btn.nextElementSibling;
      if(!menu)return;
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var wasOpen=btn.getAttribute('aria-expanded')==='true';
        closeAll(btn);
        btn.setAttribute('aria-expanded',String(!wasOpen));
        menu.style.display=wasOpen?'none':'block';
      });
    });
    document.addEventListener('click',function(){closeAll();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
  }
  // Hero shot carousel. The closet shot and the styled figure each hold one
  // <img> per look; the two advance together so a look and the wardrobe it came
  // from are never shown out of sync. The outgoing pair flies out sideways
  // (each away from the other) while the incoming pair rises into place, with
  // the closet shot leading by a beat so it reads as a sequence, not a cut.
  //
  // WCAG 2.2.2: this auto-advances, so it stops on hover, on keyboard focus
  // inside the hero, when the tab is hidden, when the hero scrolls out of view,
  // and entirely under prefers-reduced-motion — which leaves the first pair as
  // a plain static hero, exactly as it renders with JS off.
  (function heroShots(){
    var art = document.querySelector('.hs');
    if (!art) return;

    // Left to right, which is also the order they animate in. Each flies out
    // away from the middle of the composition.
    var SPEC = [
      { sel: '.hs-item',   exit: 'translate(-34%, -7%) rotate(-7deg) scale(.90)' },
      { sel: '.hs-shot',   exit: 'translate(-26%, -4%) rotate(-5deg) scale(.94)' },
      { sel: '.hs-figure', exit: 'translate(26%, -4%) rotate(5deg) scale(.94)' }
    ];
    var ENTER = 'translate(0, 9%) scale(.96)';
    var HOLD = 3000, LEAD = 120, SETTLE = 700;

    var slots = [];
    SPEC.forEach(function (spec) {
      var el = art.querySelector(spec.sel);
      if (!el) return;
      spec.el = el;
      spec.shots = Array.prototype.slice.call(el.querySelectorAll('img'));
      if (spec.shots.length) slots.push(spec);
    });
    if (!slots.length) return;

    // Every shot after the first starts hidden, whether or not its slot turns
    // out to cycle — so a half-filled slot shows its first shot, not a stack.
    slots.forEach(function (s) {
      s.shots.forEach(function (img, i) {
        img.classList.toggle('is-active', i === 0);
        img.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      });
    });

    // Slots advance together or not at all: a slot with fewer shots than the
    // longest would drift out of step with the look it belongs to, so it stays
    // on its first shot until it has a shot per look.
    var cycle = slots.reduce(function (n, s) { return Math.max(n, s.shots.length); }, 0);
    var moving = slots.filter(function (s) { return s.shots.length === cycle; });
    if (cycle < 2 || !moving.length) return;

    var motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!motionOK) return;

    var idx = 0, timer = null, busy = false;

    function swap(from, to, exit) {
      to.classList.remove('is-moving');
      to.style.transform = ENTER;
      to.style.opacity = '0';
      to.classList.add('is-active');
      void to.offsetWidth;                       // commit the start state
      to.classList.add('is-moving');
      from.classList.add('is-moving');
      from.style.transform = exit;
      from.style.opacity = '0';
      to.style.transform = '';
      to.style.opacity = '';
      from.setAttribute('aria-hidden', 'true');
      to.setAttribute('aria-hidden', 'false');
      setTimeout(function () {
        from.classList.remove('is-active', 'is-moving');
        from.style.transform = '';
        from.style.opacity = '';
        to.classList.remove('is-moving');
      }, SETTLE);
    }

    function step() {
      if (busy) return;
      busy = true;
      var cur = idx, next = (idx + 1) % cycle;
      moving.forEach(function (s, i) {
        setTimeout(function () { swap(s.shots[cur], s.shots[next], s.exit); }, i * LEAD);
      });
      idx = next;
      setTimeout(function () { busy = false; }, SETTLE + moving.length * LEAD);
    }

    function play() { if (!timer) timer = setInterval(step, HOLD); }
    function pause() { if (timer) { clearInterval(timer); timer = null; } }

    art.addEventListener('mouseenter', pause);
    art.addEventListener('mouseleave', play);
    art.addEventListener('focusin', pause);
    art.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? pause() : play();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? play() : pause();
      }, { threshold: 0.2 }).observe(art);
    } else {
      play();
    }
  })();

  // Cat eyes follow the cursor. The design does this in its canvas runtime
  // (componentDidMount -> _eyeMove), which flattening strips, leaving the cats
  // staring blankly. Same maths as the original; #hpL/#hpR/#scL/#scR already
  // carry `transition: transform .09s linear` from the design CSS.
  var EYES=['hpL','hpR','scL','scR'];
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&EYES.some(function(id){return document.getElementById(id);})){
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
})();
/* ---- Inspiration rail -------------------------------------------------
   A continuous horizontal strip of looks. The ten cards are cloned once so
   the loop has no seam, then a requestAnimationFrame drives one transform.

   Speed is eased rather than switched, so "slow down on hover" reads as a
   glide, not a gear change. Three states feed one target speed: hovering
   drops it to a crawl, and a keyboard focus or a press-and-hold stops it
   outright — the stop WCAG 2.2.2 wants for content that moves on its own.
   It also idles off-screen and on a hidden tab, and under
   prefers-reduced-motion it never starts: the rail stays the plain
   scroll-by-hand row that visitors without JS get. ------------------- */
(function inspRail(){
  var rail = document.querySelector('[data-marquee]');
  var track = rail && rail.firstElementChild;
  if (!track) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cards = Array.prototype.slice.call(track.children);
  if (cards.length < 2) return;
  cards.forEach(function (card) {
    var copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(copy.querySelectorAll('a'), function (a) { a.tabIndex = -1; });
    track.appendChild(copy);
  });
  rail.classList.add('is-live');

  var FAST = 34, SLOW = 5;                    // px per second
  var hover = false, held = false, focused = false;
  var speed = FAST, target = FAST, x = 0, period = 0, prev = 0, raf = 0, visible = true, shown = true;

  // One period is the offset of the first clone — exact, gap included.
  function measure() { period = track.children[cards.length].offsetLeft - track.children[0].offsetLeft; }
  function sync() { target = (held || focused) ? 0 : (hover ? SLOW : FAST); }

  function frame(now) {
    var dt = prev ? Math.min((now - prev) / 1000, 0.05) : 0;
    prev = now;
    speed += (target - speed) * Math.min(dt * 3.2, 1);
    x += speed * dt;
    if (period > 0 && x >= period) x -= period;
    track.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
    raf = requestAnimationFrame(frame);
  }
  function play() { if (!raf && visible && shown) { prev = 0; raf = requestAnimationFrame(frame); } }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  measure();
  window.addEventListener('resize', function () { measure(); if (period > 0) x %= period; });
  rail.addEventListener('mouseenter', function () { hover = true; sync(); });
  rail.addEventListener('mouseleave', function () { hover = false; sync(); });
  rail.addEventListener('focusin', function () { focused = true; sync(); });
  rail.addEventListener('focusout', function () { focused = false; sync(); });
  rail.addEventListener('pointerdown', function () { held = true; sync(); });
  window.addEventListener('pointerup', function () { held = false; sync(); });
  window.addEventListener('pointercancel', function () { held = false; sync(); });
  document.addEventListener('visibilitychange', function () {
    shown = !document.hidden; shown ? play() : pause();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting; visible ? play() : pause();
    }, { rootMargin: '150px' }).observe(rail);
  }
  play();
})();

/* ---- "One piece. More possibilities." — the match stage ---------------
   One garment is pinned (the trousers) and everything else — the figure,
   the shirt, the shoes, the knit, and each of their captions — advances
   together through three looks, so a look is never shown half-changed.

   The "Find the best match" pill is a real control: clicking it advances,
   and the auto-advance replays the same press on it, which is the effect
   the design asks for. The dots jump straight to a look.

   WCAG 2.2.2, same discipline as the hero: it stops on hover, on keyboard
   focus inside the stage, off-screen and on a hidden tab, and under
   prefers-reduced-motion it never starts — leaving look 1 as a static
   composition with the dots and the pill still working by hand, which is
   also exactly what a visitor with JS off gets. --------------------- */
(function matchLooks(){
  var stage = document.querySelector('.mz-stage');
  if (!stage) return;
  var slots = Array.prototype.slice.call(stage.querySelectorAll('.mz-slot')).map(function (el) {
    return { el: el, shots: Array.prototype.slice.call(el.children) };
  }).filter(function (s) { return s.shots.length > 1; });
  if (!slots.length) return;

  var looks = slots.reduce(function (n, s) { return Math.max(n, s.shots.length); }, 0);
  var moving = slots.filter(function (s) { return s.shots.length === looks; });
  if (looks < 2 || !moving.length) return;

  var dots = Array.prototype.slice.call(stage.querySelectorAll('.mz-dot'));
  var btn = stage.querySelector('[data-mz-next]');
  var HOLD = 3000, FADE = 420;
  var idx = 0, timer = 0, hover = false, focused = false, onScreen = true, shown = true;

  moving.forEach(function (s) {
    s.shots.forEach(function (shot, i) {
      shot.classList.toggle('is-active', i === 0);
      if (shot.tagName === 'IMG' || shot.tagName === 'SPAN') shot.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    });
  });

  function press() {
    if (!btn) return;
    btn.classList.add('is-pressed');
    setTimeout(function () { btn.classList.remove('is-pressed'); }, 220);
  }
  function show(next, withPress) {
    if (next === idx) return;
    moving.forEach(function (s) {
      var from = s.shots[idx], to = s.shots[next];
      if (!from || !to) return;
      from.classList.add('is-fading'); to.classList.add('is-fading');
      from.classList.remove('is-active'); to.classList.add('is-active');
      from.setAttribute('aria-hidden', 'true'); to.setAttribute('aria-hidden', 'false');
      setTimeout(function () { from.classList.remove('is-fading'); to.classList.remove('is-fading'); }, FADE);
    });
    idx = next;
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    if (withPress) press();
  }
  function advance() { show((idx + 1) % looks, true); }

  function running() { return !hover && !focused && onScreen && shown; }
  function play() { if (!timer && running()) timer = setInterval(advance, HOLD); }
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }
  function sync() { running() ? play() : stop(); }

  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { stop(); show(i, false); sync(); });
  });
  if (btn) btn.addEventListener('click', function () { stop(); advance(); sync(); });

  stage.addEventListener('mouseenter', function () { hover = true; sync(); });
  stage.addEventListener('mouseleave', function () { hover = false; sync(); });
  stage.addEventListener('focusin', function () { focused = true; sync(); });
  stage.addEventListener('focusout', function () { focused = false; sync(); });
  document.addEventListener('visibilitychange', function () { shown = !document.hidden; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; sync(); },
      { rootMargin: '120px' }).observe(stage);
  }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  play();
})();
"""
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
              "padding:14px 0;border-bottom:1px solid #e6e1d8}"
              "#m-nav .m-close{position:absolute;top:24px;right:20px;width:40px;height:40px;"
              "display:flex;align-items:center;justify-content:center;background:none;border:0;"
              "padding:0;color:#14110f;cursor:pointer}"
              "#m-nav .m-store-badge{width:100%;justify-content:center;margin-top:24px;"
              "border-bottom:none}</style>")

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
