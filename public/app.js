(function(){
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
