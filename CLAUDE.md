# homepage — Macgie Landing Site (CLAUDE.md)

> Marketing / landing website for **Macgie** (personal-wardrobe + AI outfit
> recommender). Submodule of the `wardrobe_project` umbrella, alongside `auxi`
> (mobile), `auxi-web`, and `wardrobe-backend`. This file is authoritative for
> anything done inside `homepage/`.

## What this is

A **plain static site** — HTML + CSS + vanilla JS. **No build step**, no
framework, no bundler, no package.json. Built faithfully from Figma
(`Macgie` file, node `4294:13535`). One page: the Macgie landing page.

## Layout

```
homepage/
├── public/             # ← THE DEPLOYABLE SITE. Edit here. This is all that ships.
│   ├── index.html      # the landing page (6 sections)
│   ├── styles.css      # all styles + design tokens (:root)
│   ├── main.js         # progressive enhancement only (nav, scroll-reveal)
│   ├── 404.html        # branded not-found page
│   └── assets/img/     # hero, model photos, outfit cutouts, logo, face collage
├── scripts/deploy.sh   # Cloudflare Pages deploy (sandbox / prod)
├── README.md
└── CLAUDE.md           # this file
```

Only `public/` is uploaded on deploy. Never put deployable content outside it.

## Design system (match it — don't drift)

- **Palette**: cream `#F2EFEC` (light sections) · near-black `#070707` (dark
  sections) · `#17181C` ink · `#262626`/`#DDDBDC` grays · white. All as CSS vars
  in `styles.css` `:root` — use the vars, no new raw hex.
- **Type**: **Poppins** (display/headings, 700/600) + **Inter** (body, 400) via
  Google Fonts. Don't swap fonts — they come straight from the Figma.
- **Layout**: mobile-first, `clamp()` for fluid type/space, 3 breakpoints
  (720 / 1024). Sections alternate light/dark.
- **Motion**: CSS + a tiny IntersectionObserver reveal in `main.js`. Content is
  visible by default (no-JS / reduced-motion safe) — only hidden once JS adds
  `.reveal-ready`. Keep that invariant; never let content depend on JS to show.

## Deploy (Cloudflare Pages — project `macgie-homepage`)

Use the **`deploy-homepage-web`** skill (umbrella `.claude/skills/`), or directly:

```bash
./scripts/deploy.sh          # SANDBOX  → sandbox.macgie-homepage.pages.dev  (default)
./scripts/deploy.sh prod     # PROD     → macgie-homepage.pages.dev
```

- **Sandbox first.** It's the designer's vibe surface; production is untouched
  until you explicitly run `prod`. Say "sandbox đi" / "deploy homepage" in a
  session and the skill runs the sandbox deploy.
- Deploy is **preview-first and NEVER touches git** — it just uploads `public/`.
  Committing source + bumping the umbrella submodule pointer are separate steps.
- Needs `wrangler` auth (`wrangler whoami`, `pages (write)` scope). No build.

## Conventions

- Keep it dependency-free and buildless (KISS). Don't introduce a framework or a
  package.json unless explicitly asked.
- Edit `public/` directly; verify in a browser (`cd public && python3 -m http.server`).
- Optimizing the big PNGs (hero, collage) → WebP is a welcome perf win.
- Figma is the source of truth for visuals; match tokens/spacing, don't invent.
