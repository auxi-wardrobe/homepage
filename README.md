# Auxi / Macgie — Homepage

Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit recommender).
Currently served at **[beta.macgie.com](https://beta.macgie.com)** (staging) — `macgie.com` is temporarily on the old site until the app ships.

Part of the `wardrobe_project` umbrella monorepo, wired in as a git submodule
alongside `auxi` (mobile), `auxi-web`, and `wardrobe-backend`.

A **static, hand-optimized 5-page marketing site** (home, features, pricing,
journal, article) — plain HTML + CSS, **no client-side framework/runtime**.
Lighthouse ≈ **perf 100 / a11y 100 / SEO 92 / best-practices 100**, LCP ~1.2s.

The visual design is authored in the Claude Design project "Macgie design home
page" (`e0ce1eb4-0493-4f29-b99a-08288e1be2f9`), which renders via a heavy client
runtime. We **flatten** that into static HTML for speed + SEO (pre-render → strip
runtime → optimize images/fonts). See `CLAUDE.md` for the full pipeline.

## Layout

```
homepage/
├── public/                       # ← the deployable static site
│   ├── index.html · features.html · pricing.html · journal.html · article.html · 404.html
│   ├── app.js                    # tiny JS: mobile menu + FAQ accordion
│   ├── robots.txt · sitemap.xml
│   ├── img/ (webp) · assets/ (webp) · _ds/…/fonts/*.woff2 · *.svg
└── scripts/
    ├── deploy.sh                 # Cloudflare Pages deploy (sandbox / prod)
    ├── postprocess-import.py     # clean URLs + head meta on a fresh design export
    ├── flatten-static.py         # pre-rendered DOM -> static HTML
    └── finalize-static.py        # FAQ answers + mobile-menu/FAQ JS
```

## Deploy (Cloudflare Pages — project `macgie-homepage`)

```bash
./scripts/deploy.sh            # SANDBOX preview  → sandbox.macgie-homepage.pages.dev
./scripts/deploy.sh prod       # PRODUCTION       → macgie-homepage.pages.dev → macgie.com
```

- **Sandbox first**, then promote to `prod`. No build step — uploads `public/`
  via `wrangler` (needs auth). In a Claude Code session, "sandbox đi" runs it.
- `macgie.com` + `www` are custom domains on the project (proxied CNAMEs →
  `macgie-homepage.pages.dev`). Email DNS (MX/SPF/DKIM/DMARC) is separate — don't touch.

## Local preview

```bash
cd public && python3 -m http.server 8799   # → http://localhost:8799
```

> Local `http.server` is single-threaded; Lighthouse misreports it. Trust the
> deployed / preview URL numbers, not localhost.
