# homepage — Macgie Landing Site (CLAUDE.md)

> Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit
> recommender). Submodule of the `wardrobe_project` umbrella, alongside `auxi`
> (mobile), `auxi-web`, and `wardrobe-backend`. This file is authoritative for
> anything done inside `homepage/`.

## What this is

A **faithful mirror of a Claude Design project** — the project
**"Macgie design home page"** (`e0ce1eb4-0493-4f29-b99a-08288e1be2f9`) on
claude.ai/design. It is a **5-page marketing site** (home, features, pricing,
journal, article).

The pages render via the Claude **design-canvas runtime**: each page is an
`.dc.html` document wrapped in `<x-dc>` that `support.js` renders with React
(React + ReactDOM + Babel are loaded from **unpkg** at view time), and
`<image-slot>` images are hydrated from the shared `.image-slots.state.json`
sidecar. **This is not hand-written HTML — do not hand-edit page bodies.**
Edit the design in claude.ai/design and re-import (see below).

> Previous versions of this site were a hand-built plain-static site from Figma.
> That is gone — the current site is the design-canvas mirror described here.

## Layout

```
homepage/
├── public/                       # ← THE DEPLOYABLE SITE. This is all that ships.
│   ├── index.html                # home  (renamed from "Macgie Home.dc.html")
│   ├── features.html             # /features
│   ├── pricing.html              # /pricing
│   ├── journal.html              # /journal
│   ├── article.html              # /article
│   ├── 404.html                  # branded not-found (generated, self-contained)
│   ├── support.js                # design-canvas runtime (loads React/Babel from unpkg)
│   ├── image-slot.js             # <image-slot> web component
│   ├── .image-slots.state.json   # image data for every slot (base64), shared by all pages
│   ├── _ds/                       # bundled design system (tokens, fonts, styles, _ds_bundle.js)
│   ├── assets/                    # brand, feature, garments, icons, journal, testimonials
│   ├── screenshots/ · uploads/    # in-app screenshots + uploaded imagery
│   └── *.svg · *.png              # loose brand/decorative assets
├── scripts/
│   ├── deploy.sh                 # Cloudflare Pages deploy (sandbox / prod)
│   └── postprocess-import.py     # turns a fresh export into the deployable site
├── README.md
└── CLAUDE.md                     # this file
```

Only `public/` is uploaded on deploy. Never put deployable content outside it.

## Updating the site (round-trip through the design tool)

Do **not** edit the `.dc.html` bodies by hand. To change the site:

1. Edit the design in **claude.ai/design** → project "Macgie design home page".
2. **Export the project as a ZIP** (··· menu → Download).
3. Replace `public/` with the export and post-process it:
   ```bash
   rm -rf public/* public/.image-slots.state.json public/.thumbnail
   unzip "Macgie design home page.zip" -d public
   python3 scripts/postprocess-import.py     # clean URLs, titles/meta/favicon, 404
   ```
4. Deploy: `./scripts/deploy.sh sandbox` → verify → `./scripts/deploy.sh prod`.

`postprocess-import.py` is the **only** transform layered on the raw export:
clean URLs (`/features`, `/pricing`, `/journal`, `/article`), per-page
`<title>` + meta description + Open Graph + SVG favicon, and the branded
`404.html`. Keep all edits in that script so re-imports stay reproducible.

## Design system

Comes bundled in `public/_ds/` (tokens + fonts + `styles.css`) straight from
the design project — **the tokens are the source of truth**, don't invent new
values. Register: **Fraunces** (editorial display serif) + **Inter** (body) for
the marketing surface; warm paper / near-black ink / terracotta accent. Fonts
ship bundled (Poppins/Inter/Roboto TTF) with Fraunces via Google Fonts.

## Deploy (Cloudflare Pages — project `macgie-homepage`)

Use the **`deploy-homepage-web`** skill (umbrella `.claude/skills/`), or directly:

```bash
./scripts/deploy.sh          # SANDBOX  → sandbox.macgie-homepage.pages.dev  (default)
./scripts/deploy.sh prod     # PROD     → macgie-homepage.pages.dev
```

- **Sandbox first.** It's the vibe surface; production is untouched until you
  explicitly run `prod`. Say "sandbox đi" / "deploy homepage" in a session and
  the skill runs the sandbox deploy.
- Deploy is **preview-first and NEVER touches git** — it just uploads `public/`.
  Committing source + bumping the umbrella submodule pointer are separate steps.
- Needs `wrangler` auth (`wrangler whoami`, Pages write). No build step.

## Custom domain — `macgie.com`

`macgie.com` (+ `www.macgie.com`) are attached as **custom domains** on the
`macgie-homepage` Pages project. DNS lives in the same Cloudflare account
(zone `0b09f0c7aa95d76501e70668389c7232`): both web records are **proxied
CNAMEs → `macgie-homepage.pages.dev`**. A `prod` deploy updates the live site
automatically.

- **Do NOT touch the email/verification DNS** — the MX (Google Workspace),
  SPF / DKIM / DMARC TXT, and `send.` / `tracking.` records must stay as-is or
  mail breaks. Only the apex + `www` web records point at Pages.
- The site previously ran on Vercel; DNS was repointed to Cloudflare Pages.

## Conventions & don'ts

- **Don't hand-edit `.dc.html` page bodies** — round-trip through claude.ai/design.
- **Don't hand-edit `.image-slots.state.json`** — it's generated image data.
- Keep post-export edits inside `postprocess-import.py`.
- Verify locally before deploy: `cd public && python3 -m http.server 8799`
  (needs internet — the runtime pulls React/Babel from unpkg).
- **Known tradeoff:** the mirror renders client-side via unpkg React + in-browser
  Babel, so it's heavier / less SEO-optimal than static HTML. If speed/SEO
  becomes a priority, flatten the export to plain static HTML in a future pass.
