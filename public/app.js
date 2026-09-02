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
  // Hero shot carousel. Each .hero-card holds one <img> per pair; the two cards
  // advance together so a before/after pair is never split. The outgoing pair
  // flies out sideways (each card toward its own edge) while the incoming pair
  // rises into place, with the "before" card leading by a beat so it reads as a
  // sequence rather than a cut.
  //
  // WCAG 2.2.2: this auto-advances, so it stops on hover, on keyboard focus
  // inside the hero, when the tab is hidden, when the hero scrolls out of view,
  // and entirely under prefers-reduced-motion — which leaves the first pair as
  // a plain static hero, exactly as it renders with JS off.
  (function heroShots(){
    var art = document.querySelector('.hero-art');
    if (!art) return;
    var cards = [art.querySelector('.hero-card--before'), art.querySelector('.hero-card--after')];
    if (!cards[0] || !cards[1]) return;

    var shots = cards.map(function (c) {
      return Array.prototype.slice.call(c.querySelectorAll('img'));
    });
    var pairs = Math.min(shots[0].length, shots[1].length);
    if (pairs < 2) return;                       // one pair — nothing to cycle

    var motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!motionOK) return;

    shots.forEach(function (list) {
      list.forEach(function (img, i) {
        img.classList.toggle('is-active', i === 0);
        img.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      });
    });

    var EXIT = ['translate(-26%, -4%) rotate(-5deg) scale(.94)',
                'translate(26%, -4%) rotate(5deg) scale(.94)'];
    var ENTER = 'translate(0, 9%) scale(.96)';
    var HOLD = 3000, LEAD = 140, SETTLE = 700;
    var idx = 0, timer = null, busy = false;

    function swap(card, from, to, exit) {
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
      var cur = idx, next = (idx + 1) % pairs;
      cards.forEach(function (card, i) {
        setTimeout(function () { swap(card, shots[i][cur], shots[i][next], EXIT[i]); }, i * LEAD);
      });
      idx = next;
      setTimeout(function () { busy = false; }, SETTLE + LEAD);
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