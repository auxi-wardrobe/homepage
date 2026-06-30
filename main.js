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

  // --- scroll reveal (respects reduced-motion + no-JS via CSS fallback) ---
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  // Bail out -> content stays visible by default (CSS only hides when .reveal-ready set).
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("reveal-ready");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var el = entry.target;
        // light stagger for siblings entering together
        setTimeout(function () { el.classList.add("is-in"); }, (i % 4) * 80);
        io.unobserve(el);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();
