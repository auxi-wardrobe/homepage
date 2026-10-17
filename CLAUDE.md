# homepage — Macgie Landing Site (CLAUDE.md)

> Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit
> recommender). Submodule of the `wardrobe_project` umbrella, alongside `auxi`
> (mobile), `auxi-web`, and `wardrobe-backend`. This file is authoritative for
> anything done inside `homepage/`.
>
> **Served at `macgie.com` (apex, live since 2026-07-29) and `beta.macgie.com`
> (staging).** `www.macgie.com` is still pending — still on the old Vercel site,
> not yet added as a custom domain on the `macgie-homepage` Cloudflare Pages
> project. Move it the same way the apex was done: add `www.macgie.com` as a
> custom domain on `macgie-homepage` in the Cloudflare dashboard (Workers &
> Pages → macgie-homepage → Custom domains) — the dashboard auto-creates the
> DNS record. That's a Cloudflare dashboard change outside this repo — do it
> manually, then update the "Custom domain" note below.

## What this is

A **static, hand-optimized marketing site** — home, features, journal, article,
plus the legal/policy set (privacy, terms, ai-policy, subscription) —
**plain HTML + CSS, no client-side framework/runtime.**

The visual design comes from the Claude Design project **"Macgie design home
page"** (`e0ce1eb4-0493-4f29-b99a-08288e1be2f9`). That project renders via a
heavy client runtime (unpkg React + in-browser Babel + a base64 image sidecar),
which is fine for a design tool but terrible for a real site (Lighthouse perf
~62, LCP ~9s). So we **flatten** it: pre-render each page to static HTML, strip
the runtime, and optimize. Result: **Lighthouse ≈ perf 100 / a11y 100 / SEO 92 /
best-practices 100**, LCP ~1.2s.

> Earlier this repo shipped the raw canvas mirror. It's now the flattened static
> build described here. The Claude Design project stays the visual source of
> truth — re-flatten when the design changes (see below).

## Journal CMS (Strapi → static build)

The **journal** is the one section NOT flattened from the design — it's driven by
a **Strapi CMS** so posts can be managed without editing HTML. The site stays
100% static: Strapi is read **only at build time**, never by the visitor.

- **Edit content:** Strapi admin at `https://strapi-production-12be.up.railway.app/admin`
  (Railway project `wardrobe-backend`, service `strapi`). Collection: **Article**
  (title, slug, excerpt, category, cover, author, displayDate, readingTime,
  Markdown body, featured, SEO overrides). Draft & Publish is on — only
  **published** posts are built.
- **Preview (staging) before going live:** `cd homepage && npm run preview`
  (= `build-journal.mjs && deploy.sh sandbox`). Builds the latest published
  content from Strapi and deploys it to the stable staging URL
  **`https://sandbox.macgie-homepage.pages.dev`** (production untouched). Use this
  to eyeball the whole site, then promote with `npm run publish`.
- **Draft preview (Strapi "Open preview" button):** in the Article editor, click
  **Open preview** → opens `/preview?documentId=…&status=draft&secret=…` (the
  static `public/preview.html`) in a new tab, rendering the **draft** before it's
  published. It client-side-fetches a **secret-gated** Strapi route
  (`/api/preview-article/:id`, gated by `PREVIEW_SECRET`) so drafts aren't public.
  Configured in the Strapi source's `config/admin.js` + `config/middlewares.js`
  (CORS). Strapi CE = button/new-tab only (the paid Growth/Ent Live-Preview iframe
  isn't available). This page is `noindex` and intentionally client-rendered
  (preview-only, not part of the public perf story).
- **Publish to the live site:** `cd homepage && npm run publish`
  (= `node scripts/build-journal.mjs && ./scripts/deploy.sh prod`). The build
  fetches published articles, downloads + re-encodes covers to sized webp under
  `public/img/journal/`, and regenerates `public/journal.html` +
  `public/journal/<slug>.html` + `sitemap.xml` from `scripts/templates/*.html`.
- **Build modules:** `scripts/lib/strapi.mjs` (fetch + v5 normalize) ·
  `scripts/lib/images.mjs` (cwebp) · `scripts/lib/render.mjs` (templating).
  One build-time dep: `marked`. Never ships to `public/`.
- **Strapi source** lives outside this repo at `~/dev/macgie-strapi` (Railway
  Strapi template + the `article` type + a bootstrap that auto-grants Public read
  and seeded the original posts). Redeploy it with `railway up --service strapi`.
- **Media persistence:** a Railway volume is mounted at `/app/public/uploads` on
  the strapi service — uploads survive redeploys. Don't remove it.
- **TODO (not built):** auto-publish via a Strapi webhook → CI rebuild. For now
  publishing is the one manual `npm run publish`.

## Layout

```
homepage/
├── public/                       # ← THE DEPLOYABLE SITE (static)
│   ├── index.html · features.html · journal.html · article.html
│   ├── privacy.html · terms.html · ai-policy.html · subscription.html   # legal set (EN-only)
│   ├── 404.html
│   ├── app.js                    # progressive-enhancement JS — GENERATED, see the warning below
│   ├── robots.txt · sitemap.xml
│   ├── img/                       # slot images extracted from the design, as webp
│   ├── _ds/…/assets/fonts/*.woff2 # self-hosted fonts (woff2); @font-face is INLINED in each page
│   └── assets/ · *.svg            # optimized webp imagery + brand svgs
└── scripts/
    ├── deploy.sh                 # Cloudflare Pages deploy (sandbox / prod)
    ├── postprocess-import.py     # step 2: clean URLs + titles/meta/favicon on a fresh export
    ├── seed-vi-cache.mjs         # step 1: fold the export's hand-authored VI copy into the translation cache
    ├── flatten-static.py         # step 4: pre-rendered DOM -> static (strip runtime, slots->webp, inline tokens, SEO head)
    └── finalize-static.py        # step 5: strip the dead lang pill + wire mobile-menu/carousel/FAQ JS
```

> **`public/app.js` is generated — edit it in `scripts/finalize-static.py`.**
> That script holds the whole file as the `APP_JS` constant and line ~194
> overwrites `public/app.js` with it, so a hand-edit there survives only until
> the next re-flatten. It had already drifted twice (the hero carousel and the
> cat-eye fix were written straight into `public/app.js`); 2026-10 ported the
> live file back into `APP_JS`, and the two are byte-identical again — keep
> them that way. The script also derives the cache-buster from that constant
> (`APP_JS_V = md5(APP_JS)[:8]`, written into every `app.js?v=…`), so while
> they are out of sync the URL does not change when the file does and
> returning visitors sit on a stale script behind the zone's 4-hour TTL.
> That is exactly what happened: pages shipped `?v=53e5d3fa` against an
> app.js hashing `1c900b9d`, so nobody who had already visited was getting
> the hero carousel. They have matched on every change since. Note that
> `scripts/templates/article.html` and `journal-index.html` hardcode the
> query instead of deriving it, so a journal rebuild can reintroduce the
> skew — bump those two by hand whenever app.js changes.
>
> `finalize-static.py` needs **Python 3.12+** (it puts backslashes inside
> f-strings); plain `python3` here is 3.11 and will not even parse it.

## Updating the site (re-flatten from the design)

> **The top of the home page is hand-authored and NOT in the design project.**
> The 2026-09 redesign — `<section class="hero">`, `.insp` ("Discover the looks
> you want to wear", which replaced the original `.cby` "This could be you"
> collage in 2026-10), `.mz` ("One piece. More possibilities.", which replaced
> `.steps` "Your stylist, 4 simple steps" in 2026-10) and `.fcards` (the four
> tinted feature cards, which replaced the three `.pcards` in 2026-10) in
> `public/index.html`, plus their `.hero-* / .sec-* / .insp-* / .mz-* /
> .fcard-*` rules in the page's inlined `<style>`
> — was written by hand
> from mockups, because the Claude Design project could not be reached from the
> session that built it. It **replaced** the design's own `#problem` ("The 8AM
> problem"), `#different` ("Meet Macgie") and `#how` ("How it works") sections.
> **A re-flatten will silently bring all three back and drop these four.**
> Before re-running the pipeline below, either port this work into "Macgie
> design home page" first, or re-apply it afterwards from git history.
> `finalize-static.py`'s `wire_how_it_works` still targets the design's old
> step-card markup, which no longer ships — it is a no-op on the current page.
> Two things ride on the hero specifically:
> - The collage is `.hs`: a peach `.hs-stage`, the cut-out `.hs-figure`
>   standing over its bottom edge, the `.hs-item` card and the `.hs-shot`
>   closet photo it was built from, a floating `.hs-pill`, and the two halves
>   of one sentence as captions ("From an item" / "to a look that feels like
>   you."). Every box is a percentage of `.hs`, so the whole composition
>   scales as one unit — change `.hs`'s `aspect-ratio` and everything moves
>   together.
> - **Never use percentage padding inside `.hs`.** Those boxes are
>   `position: absolute`, and percentage padding resolves against the
>   *containing block's* width (`.hs`, ~594px), not the element's own ~100px.
>   A `padding: 12%` on `.hs-item` collapsed its content box to 0px wide. Inset
>   with percentages on the child instead, which do resolve against the parent.
> - `hero-figure*.webp` are cut-outs keyed off the flat yellow / orange / green
>   grounds the originals shipped on, so they stand on the peach stage instead
>   of carrying a clashing background. `.hs-figure` sizes them by **height**,
>   not width: the three are not the same width and they must share a baseline.
>   The `.hs-shot` photos keep their 0.612 ratio.
> - Each `hero-item*.webp` is a real garment out of the look beside it: the
>   pleated skirt, the charcoal wide-leg trousers, the white cropped tee. All
>   three slots carry three shots, so the all-three rule below holds.
>   The card ground is `#f7f1e8`, **not white** — look 3's tee is white and
>   vanished on a white card. The artwork box is `76% × 80%` of the card, wide
>   enough for a top; a tall garment is height-constrained and unaffected by
>   the width.
>   Both trouser shots are supplied at ~1–1.6× their retina size, so they are
>   softer than the rest of the page (which lands near 2.3×) — re-request at
>   2× if a sharper original turns up.
> - Cut-outs arrive with a lot of empty margin; **trim to the alpha bbox before
>   committing one**. `.hs-figure` sizes by height, so the margin would shrink
>   the person inside the slot rather than crop away. Look 1's figure came in at
>   1200×1817 with 82% of that transparent — 438×1425 of actual subject.
> - The item card sits **24px** from the stage on its right and 24px from the
>   closet shot below it, written as percentages of `.hs` (4.04% / 3.55%) so
>   the gap scales with everything else rather than growing at small sizes.
> - The accent green is `#5a7b2c`. The mockup's lighter green measured 2.88:1
>   on white — under AA even for display text — so it was darkened until one
>   value cleared 4.5:1 and could serve both the headline and the 11px labels.
> - Every `.hs-slot` — `.hs-item`, `.hs-shot`, `.hs-figure` — holds one `<img>`
>   per look, and `heroShots()` in `app.js` advances them together, so an item,
>   the wardrobe it sits in and the look it builds are never out of sync. The
>   old set flies out sideways while the new one rises in, left to right. Add a
>   look by appending one `<img>` to *each* slot in the same order; no JS
>   change. A slot holding **fewer** shots than the longest sits out and stays
>   on its first image rather than drifting out of step, and with a single look
>   nothing cycles — a fallback for a half-finished set, never a state to ship.
>   **All three slots must change on every advance.** A look is one garment, the
>   wardrobe it came out of and the outfit it ends up in; show two of the three
>   moving and the sentence the collage is telling breaks. So artwork is
>   supplied and swapped **as a set of three** — item + closet shot + figure for
>   the same look, in one go — never a slot at a time.
>   It auto-advances every 3s, so per
>   WCAG 2.2.2 it pauses on hover, on focus, off-screen and on a hidden tab,
>   and is off entirely under `prefers-reduced-motion` — leaving look 1 static,
>   the same thing JS-off visitors get.
> - **No social proof in the hero, deliberately.** A "Loved by 100,000+ people"
>   line and a "★★★★★ 4.8 average rating" row were both drawn in the mockup and
>   both removed: on 2026-09-02 the App Store reported 0 ratings and no average
>   for id6766749757 in every storefront checked (US/VN/GB/SG), and the App
>   Store button sits in the same header. Don't reinstate either without a real,
>   current figure — and never mirror one into the page's JSON-LD as an
>   `aggregateRating`.
>
> **The inspiration rail** (`.insp`). A three-column head — the `1000+` stat
> block, the Playfair headline, the lede + "Make it yours" CTA — over a
> full-bleed strip of look cards. It is the one band on an otherwise white
> page: `background: #fbfaf7`, full viewport width, with white sections
> either side. The head's columns (`219 / 354 / 399`, 74px
> gaps) and the 50px headline were measured off the mockup and scaled to this
> page's **1120px** content box (the 1200 max-width *less* the 40px gutters —
> scaling to 1200 instead is what first broke the headline onto four lines
> rather than the mockup's three). Cards are a fixed 240px wide (182px under
> 640px) and keep each photo's own height, top-aligned, as the mockup does.
>
> The strip is a marquee, not a carousel: `inspRail()` in `app.js` clones the
> ten cards once so the loop has no seam, measures one period as the first
> clone's `offsetLeft` (exact, gap included) and drives a single `translate3d`
> from `requestAnimationFrame`. Speed is **eased toward** a target rather than
> switched, so hover reads as a glide down to a crawl (34 → 5 px/s) instead of
> a gear change. Three inputs feed one target: hover slows it; keyboard focus
> or press-and-hold stops it dead. That stop matters — WCAG 2.2.2 wants a
> pause for content that moves on its own and **slowing is not pausing**, so
> don't drop the focus/hold branch when tuning speeds. It also idles
> off-screen and on a hidden tab, and under `prefers-reduced-motion` it never
> starts: the rail stays `overflow-x: auto`, the plain scroll-by-hand row that
> JS-off visitors get. `app.js` adds `.is-live` to take scrolling over.
>
> The rail deliberately runs edge to edge rather than stopping at the content
> gutter: it moves, so a gutter it only respects at rest reads as a clipped
> row.
>
> **The match stage** (`.mz`). "One piece. More possibilities." — the section
> that replaced "Your stylist, 4 simple steps". It **keeps `id="how"`**,
> because two footer links point at it. Background `#e2e3de`, from the mockup.
>
> Running order on the page (2026-10): **hero → `.mz` → `.insp` → `.fcards`**.
> `.mz` was moved ahead of the rail; nothing in `app.js` depends on the order,
> since all three behaviours find their own section by class.
>
> Below the centred head sits `.mz-stage`, a fixed-ratio block (`1215 / 863`,
> the mockup's own composition) holding four product cards pinned around a
> figure. Everything inside is a percentage of the stage, like the hero's
> `.hs`, and the same rule applies: **never percentage padding on those
> absolutely positioned boxes.** Card geometry is measured, not guessed —
> `16.95%` wide, `206 / 266` ratio, at `11.69 / 72.02 / 0 / 83.13` percent.
>
> One garment is **pinned** — the charcoal trousers, `.mz-card--item` — and
> the figure, the shirt, the shoes, the knit *and their captions* advance
> together through three looks. Each `.mz-slot` holds one shot per look in the
> same order and `matchLooks()` in `app.js` moves them as a set. The caption
> is a slot too, since the garment it names changes with the picture, and
> `.mz-cap` reserves two lines (`min-height: 2.7em`) so a one-line caption in
> one look and a two-line caption in the next don't shunt the pill up and down.
>
> The "Find the best match" pill is a **real `<button>`**: clicking it advances
> a look, and the auto-advance replays the same `.is-pressed` press on it —
> which is the effect the mockup asks for. Don't turn it back into a decoration
> that only animates; it would be a button that lies about being clicked. The
> dots jump straight to a look. WCAG 2.2.2 as everywhere else: stops on hover,
> on focus inside the stage, off-screen and on a hidden tab, and never starts
> under `prefers-reduced-motion` — leaving look 1 static with the pill and dots
> still working by hand, which is also the JS-off view.
>
> Under 860px the stage leaves absolute positioning for a plain grid: figure
> across the top, cards two-up. One trap there — `.mz-figure` goes
> **`position: relative`, not `static`**. Its shots are absolute, and a static
> parent hands them to `.mz-stage`, so the figure escapes its grid cell and
> renders behind the cards.
>
> **Its artwork** is twelve transparent cut-outs — `match-figure-1…3`,
> `match-shirt-1…3`, `match-shoes-1…3`, `match-knit-1…3` — each trimmed to its
> alpha bbox before committing, as the hero cut-outs are. Every `<figcaption>`
> is the supplied file's own name (so renaming the source renames the caption)
> and the `alt` beneath it describes the garment; they are two separate pieces
> of copy, and the Vietnamese for both is hand-seeded.
>
> `match-item.webp` — the pinned trousers — is the one stand-in left: a copy of
> `hero-item-2.webp`. Everything in this stage lands around **1.6–1.8×** its
> retina size rather than the 2.3× the rest of the page manages, because the
> sources arrive 180–460px wide. Noticeable but not bad; re-request at 2× if
> sharper originals turn up.
>
> **Guest style match** (`.gm`, `id="try"`), right after `.mz`. The live
> version of the match-stage demo: a visitor uploads one garment, the backend
> tags it **synchronously** (`POST /api/public/style-match/tag`, anonymous,
> capped at 5 tags per IP per day) and "Find the best match" fetches the
> Discovery looks built around it (`/find`). Its JS is **`public/style-match.js`
> — hand-written, not generated, loaded by `index.html` only** — so it is NOT
> in `finalize-static.py`'s `APP_JS`. Bump its `?v=` (md5 of the file, first 8)
> whenever it changes. The API origin is the section's `data-api`; on
> localhost the script uses `http://localhost:5001` instead. With JS off,
> `.gm-body` stays `hidden` and only the head + App Store link show.
>
> **Artwork.** The four step phones from the old section are now unused but
> still on disk (`/img/step-find.webp`, `step-tryon.webp`, and
> `assets/feature/closet.webp` + `recommend.webp` — the last two are still
> referenced from `features.html`).
>
> **The ten rail photos** are `/img/look-1.webp` … `look-10.webp`, all 503px
> wide into a 240px slot (2.1×) with their own natural heights. Each
> `<figcaption>` is the supplied file's own name — that is how they arrive, so
> renaming the source file renames the caption — and the `alt` beneath it
> describes the photograph. They are two different pieces of copy: change them
> together, and seed the Vietnamese for any caption you touch
> (`scripts/i18n/vi-cache.json`, key `sha1("vi\ntext\n" + text)`).
>
> Like the `.pcard` visuals, each one ships with its **rounded corners baked
> into the alpha** (~10.5px at the rendered size). `.insp-card img` therefore
> sets no `border-radius` — it would double up — and above all **no
> background**, which would fill the transparent corners and square the
> artwork off.
>
> **The four feature cards** (`.fcards`) — Canvas / Outfit planning / See it
> on you / Capsule wardrobe. Equal columns with **content-driven heights**,
> top-aligned, as the mockup draws them; 28px padding, 10px gutters, one image
> at the foot of each. Two up under 900px, one up under 640px.
>
> Their headings are **small caps**, and our Playfair subsets carry no `smcp`
> feature (they have only calt/ccmp/dnom/frac/liga/lnum/locl/numr/rlig), so
> `font-variant-caps: small-caps` is **synthesised** by the browser from
> scaled capitals — which is what the mockup's own webfont does. The small
> positive `letter-spacing` compensates for how tight synthesised small caps
> set. Don't "fix" this with `text-transform: uppercase`: that loses the tall
> initial letter the design depends on.
>
> Their four visuals carry their own rounded corners in the alpha, so
> `.fcard img` sets **no radius** — it would double up. Three were supplied
> for these cards at 498px wide into a 227px box (2.2×): `feat-canvas.webp`
> 498×406, `feat-planning.webp` 498×304, `feat-capsule.webp` 498×352.
> `feat-tryon.webp` (622×426) is the one inherited from the old `.pcard` set —
> it was already the before/after pair this card wants. The three `card-*`
> names were `git mv`'d to `feat-*` to match the card each now sits in.
>
> Soft sources: everything in the match stage (~1.6–1.8×) and both hero item
> shots (~1–1.6×). Everything else on the page lands near 2.3×.
>
> **The feature grid** (`#features` on the home page, and the plain grid on
> `features.html`) is the one part of this run that is still flattened design
> markup — inline styles, Figma metadata blobs and all. The three newest cards
> (Style Discovery / Find the Best Match / Make It Yours) were hand-added to
> both, with inline SVG icons drawn to match the supplied mockup.
>
> **The two pages carry different sets, deliberately.** The home carousel is
> **12 cards, two slides of 6** — `Auto Background Removal` was dropped from
> it to make that round, and `Capsule Wardrobe` is only there.
> `features.html` is the full catalogue: **12 cards** including
> `Auto Background Removal`, in a plain 3-column grid (four clean rows), with
> no `Capsule Wardrobe`. Don't "sync" them without being asked.
>
> `featTrack`'s slides are flex items, so they all take the height of the
> tallest. Slides of 6 and 7 made the 7-card slide three rows deep and
> **stretched every card on the six-card slide** to fill a row it didn't have.
> Keep the slides the same number of grid rows. `align-content: start` on each
> slide grid stops rows stretching if that balance is ever broken again. The
> carousel JS is generic — it reads `dots.length` — so changing the slide count
> only means adding or removing a `.featdot` span, and the track's own closing
> `</div>` is easy to drop when rebuilding the slides (it swallows the dots
> row into the track).
>
> **No "coming soon" tag anywhere** (2026-10): the one on Wardrobe Insights
> was removed from both pages, and the flex wrapper it shared with the icon
> went with it so the icon sits like every other card's.

Design edits happen in **claude.ai/design**. Unzip the export into a **scratch
dir** — do NOT wipe `public/`, which also holds build outputs the export doesn't
carry (Strapi `journal/`, the `vi/` mirrors, optimized `img/`). Overlay the
repo's `img/`, `assets/` and `_ds/` onto the scratch dir so pre-render resolves
real images, then:

```bash
EXPORT=/tmp/macgie-export        # unzipped design export (+ overlaid public/ assets)

# 1. fold the design's hand-authored Vietnamese into the translation cache.
#    The CEO writes VI in the design tool; it beats machine translation.
node scripts/seed-vi-cache.mjs "$EXPORT" --overwrite

# 2. clean URLs + head meta (writes into the scratch dir, not public/)
python3 scripts/postprocess-import.py "$EXPORT"

# 3. pre-render each page with a headless browser (resolves the runtime):
#    (serve $EXPORT on a port, then for each page)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --dump-dom \
  --virtual-time-budget=25000 http://127.0.0.1:PORT/index.html > /tmp/index_rendered.html

# 4. flatten pre-rendered -> static. Handles the whole optimize pass: strips
#    scripts + Google Fonts, <image-slot> and PNG/JPG -> sized webp with
#    width/height/lazy/alt, inlines the _ds token CSS, adds the SEO head.
python3 scripts/flatten-static.py /tmp/index_rendered.html public/index.html index public

# 5. strip the design's dead EN/VI pill + wire mobile-menu / carousel / FAQ JS
python3 scripts/finalize-static.py public/index.html public/features.html …

# 6. regenerate the /vi mirrors, the Strapi journal, and sitemap.xml
npm run build:site
```

**New raster assets** still need a one-time `cwebp` conversion before step 4 —
`flatten-static.py` only swaps to a `.webp` that already exists on disk (a
missing one is left alone rather than turned into a broken image). Renames go in
its `IMG_ALIASES`, and any image the design ships without alt text goes in
`IMG_ALT`.

**Machine-translation sanity.** `scripts/lib/translate.mjs` rejects any provider
output that isn't a translation — a refusal ("I'm sorry, but I can't assist with
that.") or a runaway (output wildly longer than the source, or with lines the
source never had). Those are never cached; the build falls back to the English
source. This is not hypothetical: colon-terminated fragments ("Examples:",
"Think about:", "Ask yourself:") got *answered* rather than translated, baking
tens of KB of invented Vietnamese app-UI copy into every `/vi` page, where it
read like keyword stuffing. Image filenames used as `alt` text drew the refusal.
Run `npm run audit:i18n` to re-check the committed cache against that guard
(`node scripts/audit-vi-cache.mjs --prune` drops anything it flags, then
rebuild). Hand-authored Vietnamese always wins over MT — seed it into
`scripts/i18n/vi-cache.json`.

**Legal pages are English-only.** `EN_ONLY_HREF` in `scripts/lib/localize.mjs`
keeps links to `/privacy`, `/terms`, `/ai-policy` and `/subscription` pointing at
the EN URL even from a `/vi` page, and `enOnlyPaths` in `build-journal.mjs` keeps
`/vi/…` variants out of `sitemap.xml`. Machine-translating legal copy would put
unreviewed Vietnamese terms in front of users — if VI legal pages are ever
wanted, have them human-authored.

Then deploy (below). The pipeline is intentionally scriptable so re-imports stay
faithful; keep any hand-edits inside these scripts, not in the generated HTML.

## Performance rules (don't regress these)

- **No client framework/runtime.** Content ships in the initial HTML.
- **Critical CSS is inlined** into each page `<head>` (the `_ds` token CSS +
  page style). No render-blocking external stylesheets.
- **Fonts self-hosted as woff2**, `font-display: swap`; the LCP face is
  `<link rel="preload">`ed. No Google Fonts at runtime. Geist is the body/UI
  face; **Playfair Display** is the marketing display face — every `h1`/`h2` on
  `index.html`, `features.html` and `404.html`, always at weight 500, since the
  files carry no other weight and a heavier request only gets a synthetic bold.
  (`journal.html` and the article pages still set Geist on their headings; they
  come from `scripts/templates/`, and changing them means a journal rebuild.)
  It ships as *static weight-500 instances* of the latin / latin-ext /
  vietnamese subsets — roman + italic, six files. Both families' `@font-face`
  blocks live in `scripts/flatten-static.py` (`GEIST_FACES`, `PLAYFAIR_FACES`),
  not in the design system's `fonts.css`, so a re-flatten keeps them. Need a
  different Playfair weight? Re-fetch the subsets from Google Fonts and
  re-instance with fontTools — don't declare a weight the files don't carry.
- **All raster images are sized webp** with `width`/`height` + `loading="lazy"`
  (hero is `eager` + `fetchpriority=high` + preloaded).
- **SEO:** per-page `<title>`/meta/canonical, `lang="en"`, JSON-LD, Open Graph,
  `sitemap.xml`, `robots.txt`.

> **Known SEO note:** Cloudflare injects a `Content-Signal:` block into
> `robots.txt` at the edge (its Content Signals default). Lighthouse flags it as
> an unknown directive (SEO 92 instead of 100). It does **not** hurt real Google
> SEO. To get 100, disable Content Signals for the zone in the Cloudflare
> dashboard.

## Deploy (Cloudflare Pages — project `macgie-homepage`)

```bash
./scripts/deploy.sh          # SANDBOX  → sandbox.macgie-homepage.pages.dev  (default)
./scripts/deploy.sh prod     # PROD     → macgie-homepage.pages.dev → macgie.com
```

- **Sandbox first** to vibe-check; production is untouched until you run `prod`.
  Deploy is preview-first and never touches git — it just uploads `public/`.
- **`main` also deploys itself.** `.github/workflows/auto-publish-journal.yml`
  runs every 30 min, and when Strapi content has changed it commits the
  regenerated journal and then uploads the **whole** `public/` directory to the
  production branch. So anything merged to `main` reaches macgie.com on the next
  content change (or immediately via a forced `workflow_dispatch`) with no
  further action — `npm run publish` is the manual path, not the only one.
- Needs `wrangler` auth (`wrangler whoami`, Pages write). No build step.
- **Custom domain:** **`beta.macgie.com`** and **`macgie.com`** (apex, live
  since 2026-07-29) are both attached to the `macgie-homepage` project.
  **`www.macgie.com`** is still on the old Vercel site (CNAME
  `cname.vercel-dns.com`) — pending manual move, see the note at the top.
  Email DNS (MX / SPF / DKIM / DMARC / `send` / `tracking`) is independent —
  **don't touch it.**

## Verifying

```bash
cd public && python3 -m http.server 8799          # local preview
# Lighthouse (real numbers vary run-to-run; take a median of 3):
npx lighthouse@12 https://macgie.com/ --form-factor=mobile --screenEmulation.mobile=true
```

Local `python -m http.server` is single-threaded and Lighthouse's Lantern
simulation misreports it badly — trust the deployed-URL / preview-URL numbers,
not localhost.
