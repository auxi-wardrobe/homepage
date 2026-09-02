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
│   ├── app.js                    # tiny progressive-enhancement JS (mobile menu, feature carousel, FAQ accordion)
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

## Updating the site (re-flatten from the design)

> **The top of the home page is hand-authored and NOT in the design project.**
> The 2026-09 redesign — `<section class="hero">`, `.cby` ("This could be you"),
> `.steps` ("Your stylist, 4 simple steps") and `.pcards` (the three tinted
> cards) in `public/index.html`, plus their `.hero-* / .sec-* / .cby-* /
> .step* / .pcard-*` rules in the page's inlined `<style>` — was written by hand
> from mockups, because the Claude Design project could not be reached from the
> session that built it. It **replaced** the design's own `#problem` ("The 8AM
> problem"), `#different` ("Meet Macgie") and `#how` ("How it works") sections.
> **A re-flatten will silently bring all three back and drop these four.**
> Before re-running the pipeline below, either port this work into "Macgie
> design home page" first, or re-apply it afterwards from git history.
> `finalize-static.py`'s `wire_how_it_works` still targets the design's old
> step-card markup, which no longer ships — it is a no-op on the current page.
> Two things ride on the hero specifically:
> - `public/img/hero-before.webp` (494×807) and `hero-after.webp` (723×1063) are
>   the final photography, and the two card slots carry their **exact** aspect
>   ratios (0.612 / 0.680) so `object-fit: cover` crops nothing. Swapping in a
>   differently-shaped photo means re-deriving `width` on `.hero-card--before`
>   and `.hero-card--after`, or accepting a centre crop and steering it with
>   `.hero-card--* img { object-position }`. Both render at ~2.2× density.
> - **No social proof in the hero, deliberately.** A "Loved by 100,000+ people"
>   line and a "★★★★★ 4.8 average rating" row were both drawn in the mockup and
>   both removed: on 2026-09-02 the App Store reported 0 ratings and no average
>   for id6766749757 in every storefront checked (US/VN/GB/SG), and the App
>   Store button sits in the same header. Don't reinstate either without a real,
>   current figure — and never mirror one into the page's JSON-LD as an
>   `aggregateRating`.
>
> **Artwork.** The seven `.cby-tile` collage images (`/img/you-1.webp` …
> `you-7.webp`) each ship with their own rounded, coloured ground baked in, so
> the tile sets no background, radius or aspect-ratio — the image sizes it.
> Don't reintroduce a CSS background there: it squares off the corners the
> artwork already rounds. All four step phones are in (`/img/step-find.webp`,
> `step-tryon.webp`, and `assets/feature/closet.webp` + `recommend.webp`).
>
> Still missing: the three `.pcard` visuals — `/img/card-inspire.webp`,
> `card-wardrobe.webp`, `card-results.webp`, roughly 16:11. They render as a
> dashed box, deliberately obvious so nobody publishes them by accident; each
> carries an HTML comment naming its file.
>
> Three sources are under-resolution for their slots and will look soft on a
> retina display: `you-5.webp` (222px into a 190px slot, 1.17×) and the two new
> step phones (262px into 178px, 1.47× — against 6.2× for the two beside them).
> Everything else lands near 2.3×.

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
  face; **Playfair Display** is the marketing display face (hero headline only)
  and ships as *static weight-500 instances* of the latin / latin-ext /
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
