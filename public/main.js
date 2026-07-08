// Macgie landing — progressive enhancement only (page works without JS)
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var docEl = document.documentElement;

  // --- nav active tab on scroll (spy) ---
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".nav__tab"));
  var targets = tabs.map(function (t) {
    var id = t.getAttribute("href");
    return id && id.charAt(0) === "#" && id.length > 1 ? document.querySelector(id) : null;
  });
  function setActive(idx) {
    tabs.forEach(function (t, i) { t.classList.toggle("is-active", i === idx); });
  }
  var spy = function () {
    var y = window.scrollY + window.innerHeight * 0.35;
    var best = 0;
    targets.forEach(function (el, i) {
      if (el && el.offsetTop <= y) best = i;
    });
    setActive(best);
  };
  window.addEventListener("scroll", spy, { passive: true });

  // --- pinned horizontal scroll sections ---
  var pins = Array.prototype.slice.call(document.querySelectorAll("[data-pin]"));
  var headerEl = document.querySelector(".site-header");
  function headerH() { return headerEl ? headerEl.offsetHeight : 94; }
  var HEADER = headerH();
  var pinData = [];

  function canPin() {
    return !reduce && window.innerWidth >= 1024;
  }

  function measure() {
    if (!canPin()) {
      docEl.classList.remove("pin-ready");
      pins.forEach(function (p) {
        p.style.height = "";
        var track = p.querySelector(".pin__track");
        if (track) track.style.transform = "";
      });
      pinData = [];
      return;
    }
    docEl.classList.add("pin-ready");
    HEADER = headerH();
    var viewH = window.innerHeight - HEADER;
    pinData = pins.map(function (p) {
      var track = p.querySelector(".pin__track");
      var extra = Math.max(0, track.scrollWidth - window.innerWidth);
      p.style.height = viewH + extra + "px";
      return { section: p, track: track, extra: extra };
    });
    update();
  }

  function update() {
    if (!pinData.length) return;
    var y = window.scrollY;
    pinData.forEach(function (d) {
      var start = d.section.offsetTop - HEADER;
      var p = (y - start) / (d.extra || 1);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      d.track.style.transform = "translateX(" + (-p * d.extra) + "px)";
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { update(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(measure, 150);
  });

  // Recalculate once fonts/images settle (track width depends on them).
  window.addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }
  measure();
  spy();

  // --- scroll reveal (progressive enhancement) ---
  // Invariant (CLAUDE.md): content must NEVER stay hidden because of JS. JS only
  // animates it in. We drive the reveal off plain scroll geometry (bulletproof —
  // scroll/resize events fire in every context) rather than an IntersectionObserver,
  // whose callbacks can be silently dropped (bfcache restore, prefetch, print, some
  // headless renders) and leave the whole page blank.
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !items.length) return; // leave content visible (CSS-default, no .reveal-ready)

  docEl.classList.add("reveal-ready");

  var reveal = function () {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    items = items.filter(function (el) {
      var r = el.getBoundingClientRect();
      // reveal once the element's top crosses 90% of the viewport (and it's on-screen)
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add("is-in"); return false; }
      return true;
    });
    if (!items.length) {
      window.removeEventListener("scroll", onReveal);
      window.removeEventListener("resize", onReveal);
    }
  };

  var revealTicking = false;
  var onReveal = function () {
    if (revealTicking) return;
    revealTicking = true;
    window.requestAnimationFrame(function () { reveal(); revealTicking = false; });
  };

  window.addEventListener("scroll", onReveal, { passive: true });
  window.addEventListener("resize", onReveal, { passive: true });
  reveal(); // reveal whatever is already in view on load

  // Absolute failsafe: if some environment never fires scroll/rAF, never leave
  // content hidden — force-show everything after a short grace period.
  window.setTimeout(function () {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-in");
    });
  }, 3000);
})();
