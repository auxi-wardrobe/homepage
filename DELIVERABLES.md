# Macgie Marketing Website — Strategy & Deliverables

> Companion document to the built site in `public/`. Covers the ten strategic
> deliverables requested. The site itself is a plain, buildless static site
> (HTML + CSS + vanilla JS) extending the existing Figma-faithful design system.
> Foundation lives in `public/site.css`; the homepage keeps its bespoke
> hero/pinned sections in `public/styles.css`.

---

## 1. Full sitemap

```
/                         Homepage
├── /features.html        Features overview (7 pillars + 9 capabilities)
├── /ai-stylist.html      AI Stylist — the styling engine
├── /visualization.html   Visualization — see it on you first
├── /wardrobe.html        Digital Wardrobe — organize, import, tag
├── /pricing.html         Free · Pro · Pro+
├── /about.html           Story, mission, principles
├── /blog.html            The Macgie Journal
│   ├── /blog/capsule-wardrobe-guide.html
│   ├── /blog/pack-a-carry-on.html
│   └── /blog/color-theory-basics.html
├── /faq.html             24–30 grouped questions (FAQPage schema)
├── /contact.html         Contact form + info
├── /help.html            Help Center (category hub)
├── /careers.html         Roles + why Macgie
├── /press.html           Press & media kit
├── /community.html       Social + beta program
├── /changelog.html       Release notes
├── /privacy.html         Privacy Policy
├── /terms.html           Terms of Service
├── /404.html             Branded not-found
├── /sitemap.xml          XML sitemap
└── /robots.txt           Crawl directives
```

**Phase 1 (launch) priority pages:** Homepage, Features, Pricing, About, Blog,
FAQ, Privacy, Terms, Contact. All are built; AI Stylist, Visualization, Digital
Wardrobe, Help, Careers, Press, Community and Changelog round out the full set.

**Navigation:** Top nav = Features · AI Stylist · Visualization · Pricing · Blog ·
**Download** (sticky CTA). Footer = Product / Resources / Company / Legal / Social.

---

## 2. User journey map

| Stage | User mindset | Touchpoint | Macgie's job | Primary CTA |
|-------|--------------|-----------|--------------|-------------|
| **Aware** | "I have nothing to wear" frustration | Ad, TikTok, App Store, search | Name the pain in one line | Scroll / Watch |
| **Interested** | "Is this different from closet apps?" | Homepage hero → Problem → Why different | Differentiate: OS for your wardrobe, not inventory | Explore features |
| **Considering** | "Would it work for *me*?" | Features, AI Stylist, Visualization, Wardrobe | Show the styling engine + visualization + instant start | Download / See pricing |
| **Evaluating** | "What's it cost? Is my data safe?" | Pricing, FAQ, Privacy | Free start, fair tiers, honest data promise | Start free |
| **Converting** | "Okay, I'm in" | App Store / TestFlight, waitlist | Frictionless: sample wardrobe = value in 60s | Download on App Store |
| **Onboarding** | "Show me it works" | In-app sample wardrobe | Instant recommendation, no empty screen | Add your clothes |
| **Retaining** | "Getting dressed is easy now" | Daily outfits, calendar, insights | Learn + improve; reduce daily friction | Upgrade to Pro |
| **Advocating** | "I've wanted this my whole life" | Community, referrals, reviews | Give them something to share | Share / review |

**Key insight driving the journey:** the "aha" is *value before setup*. The sample
wardrobe lets a user feel the product in the first minute — this is the conversion
lever the whole site points at.

---

## 3. Homepage wireframe (section order + intent)

```
┌────────────────────────────────────────────┐
│ Announcement bar — early access → beta      │
│ Sticky nav — links + Download CTA           │
├────────────────────────────────────────────┤
│ HERO  eyebrow · huge title · people image   │  emotion + App Store + waitlist
│       App Store pill · Join waitlist         │
├────────────────────────────────────────────┤
│ PROBLEM  "full closet, nothing to wear"      │  4 pain cards (fatigue, 80%, dupes, anxiety)
├────────────────────────────────────────────┤
│ WHY DIFFERENT  (pinned horizontal, light)    │  instant · your closet · learns you
├────────────────────────────────────────────┤
│ DOWNLOAD→FIRST OUTFIT (pinned, dark)         │  4-step product story
├────────────────────────────────────────────┤
│ EVERYTHING YOU NEED (typographic grid)       │  6 signature features
├────────────────────────────────────────────┤
│ THE NINE (feature cards, 3×3)                │  full capability set → /features
├────────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                        │  add · learn · get dressed
├────────────────────────────────────────────┤
│ SAMPLE WARDROBE (dark, image bleed)          │  why we start pre-filled
├────────────────────────────────────────────┤
│ SOCIAL PROOF  testimonials + stats           │  "I've wanted this my whole life"
├────────────────────────────────────────────┤
│ COMPARISON table                              │  vs Whering/Indyx/Stylebook/stylist
├────────────────────────────────────────────┤
│ EVERYDAY DECISIONS (speech-bubble collage)   │  relatable voice
├────────────────────────────────────────────┤
│ FAQ (condensed 6) → /faq                      │  objection handling
├────────────────────────────────────────────┤
│ FINAL CTA band (dark, glow)                   │  App Store + beta
├────────────────────────────────────────────┤
│ FOOTER  Product/Resources/Company/Legal/Social│
└────────────────────────────────────────────┘
```

---

## 4. Content outline (per page)

- **Homepage** — see wireframe above. Hero headline: *"You don't need more clothes"*
  with eyebrow *"Your wardrobe finally has a brain."*
- **Features** — interior hero; 7 alternating pillars (AI Stylist, Visualization,
  Digital Wardrobe, Insights, Travel, Import/Background removal, Style Memory);
  9-capability card grid; how-it-works; CTA.
- **AI Stylist** — not-random positioning; 7 signals it reasons over (style, body,
  weather, occasion, mood, availability, wear history); context/mood/learning-loop/
  explanation-engine splits; learning-loop steps; CTA.
- **Visualization** — see-it-on-you; what you can see; preview/confidence/combinations
  splits; before/after; steps; CTA.
- **Digital Wardrobe** — organization, best-in-class import, auto background removal,
  auto-tagging, management; import + management cards; stats; steps; cross-links.
- **Pricing** — Free / Pro (featured) / Pro+; who each is for; pricing FAQ; Product schema.
- **About** — 15–30 min/morning origin story; use-more-not-buy-more mission; principles;
  stats; values; hiring nudge.
- **Blog** — featured post + 6-card grid; 3 full SEO articles (capsule wardrobe, carry-on
  packing, color theory); newsletter CTA.
- **FAQ** — 24–30 questions in 5 groups; FAQPage schema.
- **Contact** — form + info list + quick links.
- **Help / Careers / Press / Community / Changelog** — support hub, roles, media kit,
  social hub, release notes.
- **Privacy / Terms** — full readable legal with TOC anchors.

---

## 5. SEO strategy

- **Technical:** semantic HTML5, one `<h1>` per page, descriptive `<title>` +
  `meta description`, canonical URLs, Open Graph + Twitter cards, `robots.txt`,
  `sitemap.xml`, mobile-first + fast (no framework, no bundle, lazy images,
  `fetchpriority` on hero). Fonts preconnected.
- **Structured data (JSON-LD):** Organization + WebSite + SoftwareApplication on
  the homepage; BreadcrumbList on product pages; FAQPage on `/faq`; Article on each
  blog post; Product/Offer on `/pricing`; Blog on `/blog`.
- **Keyword map (intent → page):**
  - "what should I wear app", "AI stylist app", "outfit recommendation app" → Homepage / AI Stylist
  - "digital wardrobe app", "closet organizer app" → Digital Wardrobe
  - "AI try-on", "visualize outfits" → Visualization
  - "capsule wardrobe", "how to pack a carry-on", "color theory outfits" → Blog (top-of-funnel)
  - "Whering alternative", "Stylebook vs" → Homepage comparison section
- **Content/SEO engine:** the blog targets high-volume informational queries
  (capsule wardrobe, travel packing, color theory, organization, fashion
  psychology, outfit ideas) and funnels to product pages.
- **Internal linking:** every product page cross-links siblings; blog posts link to
  relevant feature pages; footer provides sitewide equity distribution; homepage
  links out to Features/FAQ/Pricing.
- **Performance win available:** convert the large hero/collage PNGs to WebP
  (welcome per `CLAUDE.md`) for Core Web Vitals.

---

## 6. Conversion strategy

- **One primary action, repeated:** *Download on the App Store* (real TestFlight
  beta link) appears in hero, mid-page, final CTA band, and footer.
- **Secondary capture:** *Join the waitlist / Become a beta tester* for users not
  ready to install.
- **Reduce risk before the ask:** sample-wardrobe = value in 60 seconds (removes the
  "empty app" objection), honest comparison table, transparent Free tier, privacy
  promise, testimonials + rating stat bar.
- **Objection handling:** condensed homepage FAQ + full `/faq` answer the top
  hesitations (not-a-closet-app, upload burden, accuracy, privacy, price).
- **Emotional > feature-led:** hero leads with feeling ("You don't need more
  clothes"), then proves with capability. The recurring line *"I've wanted this my
  whole life"* is the target reaction.
- **Friction removal:** sticky nav CTA, buttons work without JS, fast load, mobile
  menu is pure-CSS.
- **Measurement plan (post-launch):** track hero-CTA CTR, scroll depth to comparison,
  FAQ opens, pricing → App Store handoff, blog → product-page flow.

---

## 7. Component inventory (`site.css`)

- **Chrome:** `.site-header` (announcement `.ann` + `.topnav` with pure-CSS mobile
  menu), `.site-footer` (4 link columns + social + download).
- **Layout:** `.container` (+`--wide`/`--narrow`), `.section` (+`--cream`/`--cream2`/
  `--ink`/`--black`/`--grad`/`--tight`).
- **Type:** `.display .h1 .h2 .h3 .h4 .lead .eyebrow .muted .grad-text`.
- **Actions:** `.btn` (`--dark/--cream/--light/--ghost/--lg`), `.appstore` pill, `.btn-row`.
- **Content blocks:** `.head-block`, `.card` grid (`.grid--2/3/4`), `.split` alternating
  feature rows, `.media-frame`, `.steps3`, `.stats`, `.testi-grid`, `.compare` table,
  `.pricing` plans, `.faq` accordion (`<details>`), `.blog-grid`/`.post-card`/
  `.featured-post`, `.prose` (articles + legal), `.legal-toc`, `.form`/`.field`,
  `.info-list`, `.pill`/`.pill-row`, `.logos`, `.cta-band`.
- **Homepage bespoke (`styles.css`):** `.hero`, `.pin`/`.why`/`.steps`, `.features`,
  `.sample`, `.decisions` speech bubbles.
- **Motion:** `.reveal` (+`d1/d2/d3` stagger) scroll-reveal, reduced-motion safe.

---

## 8. Design system recommendations

- **Palette:** cream `#F2EFEC` / near-black `#070707` / ink `#17181C` / grays, plus a
  restrained "intelligence" accent gradient (violet→peach) used *sparingly* for icons,
  focus rings and one gradient word — never as a wash. All tokens live in `:root`.
- **Type:** Poppins (display, 300–800) + Inter (body). Large, tight-tracked headings;
  `clamp()` fluid scale.
- **Space & shape:** generous white space, `--r-sm…--r-xl` radii, three shadow tiers,
  sections alternate light/dark for rhythm.
- **Motion:** subtle fade-up reveal + pinned horizontal scroll on the homepage;
  everything visible without JS (progressive enhancement is an invariant).
- **Glassmorphism:** used once, tastefully — the translucent blurred sticky nav.
- **Accessibility:** skip link, visible focus, semantic landmarks, `aria-label`s,
  reduced-motion handling, AA contrast, keyboard-operable menu/accordions.
- **Recommendation going forward:** keep it buildless; add real product screenshots to
  replace placeholder image frames; ship WebP; add OG images per template page.

---

## 9. Mobile strategy

- **Mobile-first** CSS; every component is single-column by default and expands at
  720/900/1000/1024px breakpoints.
- **Pure-CSS hamburger menu** (checkbox hack) — works with JS disabled; `site.js` only
  adds close-on-tap.
- **Pinned horizontal homepage sections unpin** into vertical stacks under 1024px.
- **Tap targets** ≥44px, fluid type via `clamp()`, tables scroll inside
  `.compare-wrap` so the page body never scrolls sideways.
- **Performance:** lazy-loaded imagery, `fetchpriority=high` hero, system-font
  fallbacks, no framework payload.
- **Primary CTA (App Store)** is always one tap away in the sticky header.

---

## 10. Launch recommendations

1. **Ship Phase 1** (Homepage, Features, Pricing, About, Blog, FAQ, Privacy, Terms,
   Contact) — all built and ready. The remaining pages are also done and can go live
   together.
2. **Replace placeholders** with real product screenshots/video in the `.media-frame`
   blocks and blog thumbnails; add per-page OG images.
3. **Wire the forms & waitlist** to a real backend/ESP (contact form and any email
   capture are currently static demos pointing at the TestFlight link).
4. **Convert hero/collage PNGs → WebP**, then run Lighthouse; target 90+ across the board.
5. **Deploy sandbox first** (`./scripts/deploy.sh`) for the designer's review, then
   `prod`. Verify sitemap/robots resolve at the domain root.
6. **Instrument analytics** (privacy-respecting) for the conversion metrics in §6; set
   up App Store Connect + the review-support pages (FAQ, Privacy, Terms, Contact) which
   the review process expects.
7. **Content cadence:** publish 1–2 blog posts/week against the keyword map to compound
   organic traffic into the funnel.
8. **Pre-launch QA:** cross-browser, real devices, keyboard/screen-reader pass,
   no-JS pass, and 404 behavior.
```
```
