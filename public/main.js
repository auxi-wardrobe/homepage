// Macgie landing — progressive enhancement only (page works without JS)
(function () {
  "use strict";

  // --- mobile nav toggle ---
  var burger = document.querySelector(".nav__burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // --- nav shadow on scroll ---
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- scroll reveal (progressive enhancement) ---
  // Invariant (CLAUDE.md): content must NEVER stay hidden because of JS. JS only
  // animates it in. We drive the reveal off plain scroll geometry (bulletproof —
  // scroll/resize events fire in every context) rather than an IntersectionObserver,
  // whose callbacks can be silently dropped (bfcache restore, prefetch, print, some
  // headless renders) and leave the whole page blank.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduce || !items.length) return; // leave content visible (CSS-default, no .reveal-ready)

  document.documentElement.classList.add("reveal-ready");

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

  var ticking = false;
  var onReveal = function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { reveal(); ticking = false; });
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
