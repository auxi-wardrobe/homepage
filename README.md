# Auxi / Macgie — Homepage

Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit recommender).

Part of the `wardrobe_project` umbrella monorepo, wired in as a git submodule
alongside `auxi` (mobile), `auxi-web`, and `wardrobe-backend`.

Built faithfully from Figma (`Macgie` file, node `4294:13535`). Plain static
site — HTML + CSS + vanilla JS, **no build step**.

## Layout

```
homepage/
├── public/            # ← the deployable site (this is what ships)
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── 404.html
│   └── assets/img/    # hero, model photos, outfit cutouts, logo, collage
└── scripts/
    └── deploy.sh      # sandbox / prod deploy to Cloudflare Pages
```

## Deploy (Cloudflare Pages — project `macgie-homepage`)

```bash
./scripts/deploy.sh            # SANDBOX preview  → sandbox.macgie-homepage.pages.dev
./scripts/deploy.sh prod       # PRODUCTION       → macgie-homepage.pages.dev
```

- **Sandbox** is the designer's vibe surface — deploy here first, look at it,
  then promote to prod. Production stays untouched until you run `prod`.
- No build, no git — just uploads `public/` via `wrangler`. Requires wrangler
  auth (OAuth or `CLOUDFLARE_API_TOKEN`).
- In a Claude Code session, just say **"sandbox đi"** / **"deploy homepage"** —
  the `deploy-homepage-web` skill runs the sandbox deploy for you.

## Local preview

```bash
cd public && python3 -m http.server 8799   # → http://localhost:8799
```
