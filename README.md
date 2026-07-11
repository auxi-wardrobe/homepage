# Auxi / Macgie — Homepage

Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit recommender).
Live at **[macgie.com](https://macgie.com)**.

Part of the `wardrobe_project` umbrella monorepo, wired in as a git submodule
alongside `auxi` (mobile), `auxi-web`, and `wardrobe-backend`.

This is a **faithful mirror of a Claude Design project** — "Macgie design home
page" on claude.ai/design (`e0ce1eb4-0493-4f29-b99a-08288e1be2f9`). Five pages
(home, features, pricing, journal, article) rendered by the Claude design-canvas
runtime (`support.js` + `image-slot.js`, which load React/Babel from unpkg at
view time). It is **not** hand-written HTML — see "Updating" below.

## Layout

```
homepage/
├── public/                       # ← the deployable site (this is what ships)
│   ├── index.html · features.html · pricing.html · journal.html · article.html
│   ├── 404.html
│   ├── support.js · image-slot.js · .image-slots.state.json
│   ├── _ds/                      # bundled design system (tokens, fonts, styles)
│   └── assets/ · screenshots/ · uploads/ · *.svg · *.png
└── scripts/
    ├── deploy.sh                 # sandbox / prod deploy to Cloudflare Pages
    └── postprocess-import.py     # turns a fresh design export into the deployable site
```

## Updating the site

Design edits happen in **claude.ai/design**, not by hand:

```bash
# 1. edit the design in claude.ai/design, then Export the project as a ZIP
# 2. replace public/ with the export:
rm -rf public/* public/.image-slots.state.json public/.thumbnail
unzip "Macgie design home page.zip" -d public
# 3. apply the clean-URL / <title> / favicon / 404 transform:
python3 scripts/postprocess-import.py
```

## Deploy (Cloudflare Pages — project `macgie-homepage`)

```bash
./scripts/deploy.sh            # SANDBOX preview  → sandbox.macgie-homepage.pages.dev
./scripts/deploy.sh prod       # PRODUCTION       → macgie-homepage.pages.dev → macgie.com
```

- **Sandbox** is the vibe surface — deploy here first, look at it, then promote
  to prod. Production stays untouched until you run `prod`.
- No build step — just uploads `public/` via `wrangler`. Requires wrangler auth
  (OAuth or `CLOUDFLARE_API_TOKEN`).
- In a Claude Code session, just say **"sandbox đi"** / **"deploy homepage"** —
  the `deploy-homepage-web` skill runs the sandbox deploy for you.

`macgie.com` + `www.macgie.com` are attached as custom domains on the
`macgie-homepage` project (proxied CNAMEs → `macgie-homepage.pages.dev`). Email
DNS (MX / SPF / DKIM / DMARC) is independent — don't touch it.

## Local preview

```bash
cd public && python3 -m http.server 8799   # → http://localhost:8799
# needs internet: the design-canvas runtime pulls React/Babel from unpkg
```
