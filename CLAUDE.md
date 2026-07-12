# homepage — Macgie Landing Site (CLAUDE.md)

> Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit
> recommender). Live at **macgie.com**. Submodule of the `wardrobe_project`
> umbrella, alongside `auxi` (mobile), `auxi-web`, and `wardrobe-backend`.
> This file is authoritative for anything done inside `homepage/`.

## What this is

A **static, hand-optimized 5-page marketing site** (home, features, pricing,
journal, article) — **plain HTML + CSS, no client-side framework/runtime.**

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

## Layout

```
homepage/
├── public/                       # ← THE DEPLOYABLE SITE (static)
│   ├── index.html · features.html · pricing.html · journal.html · article.html
│   ├── 404.html
│   ├── app.js                    # tiny progressive-enhancement JS (mobile menu, FAQ accordion)
│   ├── robots.txt · sitemap.xml
│   ├── img/                       # slot images extracted from the design, as webp
│   ├── _ds/…/assets/fonts/*.woff2 # self-hosted fonts (woff2); @font-face is INLINED in each page
│   └── assets/ · *.svg            # optimized webp imagery + brand svgs
└── scripts/
    ├── deploy.sh                 # Cloudflare Pages deploy (sandbox / prod)
    ├── postprocess-import.py     # step 1: clean URLs + titles/meta/favicon on a fresh export
    ├── flatten-static.py         # step 3: pre-rendered DOM -> static (strip runtime, slots->img, SEO head)
    └── finalize-static.py        # step 4: inject FAQ answers + wire mobile-menu/FAQ JS
```

## Updating the site (re-flatten from the design)

Design edits happen in **claude.ai/design**; then re-run the flatten pipeline:

```bash
# 1. export the project ZIP from claude.ai/design, unzip into public/, then:
python3 scripts/postprocess-import.py          # clean URLs + head meta

# 2. pre-render each page with a headless browser (resolves the runtime):
#    (serve public/ on a port, then for each page)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --dump-dom \
  --virtual-time-budget=25000 http://127.0.0.1:PORT/index.html > /tmp/index_rendered.html

# 3. flatten pre-rendered -> static (strip scripts, <image-slot> -> optimized <img>, SEO head)
python3 scripts/flatten-static.py /tmp/index_rendered.html public/index.html index public

# 4. inject FAQ answers + wire mobile-menu/FAQ JS
python3 scripts/finalize-static.py

# 5. optimize: slot images -> webp (cwebp), heavy asset PNGs -> sized webp,
#    fonts TTF -> woff2 (fonttools), inline token CSS, preload the LCP font.
```

Then deploy (below). The pipeline is intentionally scriptable so re-imports stay
faithful; keep any hand-edits inside these scripts, not in the generated HTML.

## Performance rules (don't regress these)

- **No client framework/runtime.** Content ships in the initial HTML.
- **Critical CSS is inlined** into each page `<head>` (the `_ds` token CSS +
  page style). No render-blocking external stylesheets.
- **Fonts self-hosted as woff2**, `font-display: swap`; the LCP font
  (Poppins-Bold) + Inter-Regular are `<link rel="preload">`ed. No Google Fonts.
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
- Needs `wrangler` auth (`wrangler whoami`, Pages write). No build step.
- **Custom domain:** `macgie.com` + `www.macgie.com` are attached to the
  `macgie-homepage` project (proxied CNAMEs → `macgie-homepage.pages.dev`).
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
