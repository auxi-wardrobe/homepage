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
  var HEADER = 86;
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

  // --- scroll reveal (content visible by default; only hidden once JS ready) ---
  if (reduce || !("IntersectionObserver" in window)) return;
  docEl.classList.add("reveal-ready");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var el = entry.target;
        setTimeout(function () { el.classList.add("is-in"); }, (i % 4) * 80);
        io.unobserve(el);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
