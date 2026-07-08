/* Macgie — shared progressive enhancement for all interior pages.
   The page is fully functional without JS (menu is a pure-CSS checkbox,
   content is visible by default). JS only sharpens the experience. */
(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- sticky header shadow ---
  var header = document.querySelector("[data-header]");
  if (header) {
    var onStuck = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onStuck, { passive: true });
    onStuck();
  }

  // --- close mobile menu after tapping a link ---
  var toggle = document.getElementById("navtoggle");
  if (toggle) {
    document.querySelectorAll(".topnav__menu a").forEach(function (a) {
      a.addEventListener("click", function () { toggle.checked = false; });
    });
  }

  // --- scroll reveal (geometry-driven; never leaves content hidden) ---
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !items.length) return;
  docEl.classList.add("reveal-ready");

  var reveal = function () {
    var vh = window.innerHeight || docEl.clientHeight;
    items = items.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add("is-in"); return false; }
      return true;
    });
    if (!items.length) {
      window.removeEventListener("scroll", onReveal);
      window.removeEventListener("resize", onReveal);
    }
  };
  var ticking = false;
  var onReveal = function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { reveal(); ticking = false; });
  };
  window.addEventListener("scroll", onReveal, { passive: true });
  window.addEventListener("resize", onReveal, { passive: true });
  reveal();

  // failsafe: never leave content hidden
  window.setTimeout(function () {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }, 3000);
})();
