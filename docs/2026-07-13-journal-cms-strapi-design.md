# Journal CMS — Strapi → static build design

> **Date:** 2026-07-13
> **Repo:** `homepage/` (Macgie landing site) + a new local Strapi source for the
> Railway `strapi` service.
> **Goal:** Manage the journal (blog) content of the Macgie site in a CMS
> (Strapi, already hosted on Railway) instead of hand-editing HTML — **without**
> giving up the site's static, runtime-free, Lighthouse-≈100 posture.

## 1. Problem

`homepage/public/journal.html` is hand-flattened static HTML. It has **6
hardcoded post cards that all link to one `/article` page** — there is no real
content source and no per-post pages. We want an editor (CEO/designer) to create
and edit journal posts in a CMS and have the live site reflect them.

## 2. Constraints (do not regress)

- **Site stays 100% static.** No client framework/runtime; content ships in the
  initial HTML. Visitor's browser **never** calls Strapi. (Client-side fetch is
  rejected — it wrecks perf + SEO.)
- Lighthouse ≈ perf 100 / a11y 100 / BP 100; images sized webp; critical CSS
  inlined; fonts self-hosted woff2. The build must preserve all of this.
- Deploy is `wrangler pages deploy public/` to Cloudflare Pages project
  `macgie-homepage` (currently `beta.macgie.com`). No CF git-build; direct upload.

## 3. Current infra (verified 2026-07-13)

| Item | State |
|---|---|
| Strapi | v5 CE, live `https://strapi-production-12be.up.railway.app`, admin created, Postgres-backed (Railway project `wardrobe-backend`) |
| Content model | **Empty** — no `article`/`post` type (all `/api/*` probes 404) |
| Media | **No volume, no S3/R2/Cloudinary provider** → default local `public/uploads` on ephemeral disk → **wiped on every redeploy** |
| Source | Deployed from the Railway Strapi **template** image (author `Milo123459`); not a user-editable repo |
| Env vars already set | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `DATABASE_URL`, `HOST`, `URL` (a fresh scaffold reuses exactly these) |

## 4. Architecture — build-time static generation

```
Strapi (Railway)  ──REST (build time only)──►  scripts/build-journal.mjs  ──►  wrangler deploy
  article[]                                      • fetch published articles       public/journal.html
  (title, slug, cover, author,                   • download+webp covers           public/journal/<slug>.html
   date, readingTime, body, …)                   • render index + per-post        public/img/journal/*.webp
                                                  • update sitemap.xml             → Cloudflare Pages
```

Strapi is the content store + editor. A Node script reads it **at build time**,
renders static pages from templates lifted from today's `journal.html` /
`article.html`, optimizes images, and the existing `deploy.sh` ships `public/`.
Real per-post URLs (`/journal/<slug>`) replace today's single shared `/article`.

## 5. Content model — Strapi `article` collection

Draft & Publish **enabled** (editors draft; build fetches only `published`).

| Field | Type | Notes |
|---|---|---|
| `title` | Text (short), required | |
| `slug` | UID (target `title`), required | → `/journal/<slug>` |
| `excerpt` | Text (long) | card subtitle + meta description |
| `category` | Text (short) | kicker label (e.g. "Capsules", "Color") |
| `cover` | Media (single image), required | card thumb + article hero |
| `author` | Text (short) | plain string (e.g. "Elise Tran"). KISS — no author relation yet |
| `displayDate` | Date, optional | shown date; defaults to `publishedAt` if empty |
| `readingTime` | Number (int), optional | minutes; if empty, **build computes** from body word count |
| `body` | Rich text (Markdown) | rendered MD→HTML at build with `marked` |
| `featured` | Boolean, default false | the large 2fr hero card on the index |
| `seoTitle` / `seoDescription` | Text, optional | override; default to `title` / `excerpt` |

Out of scope (YAGNI): author profiles, tag/category index pages, pagination UI,
search, comments, journal i18n, RSS. Revisit if asked.

## 6. Getting the content type into prod (decision A — `railway up`)

Prod Strapi can't use the Content-Type Builder (disabled in production) and its
uploads disk is ephemeral. Plan:

1. **Attach a Railway volume** to the `strapi` service mounted at its uploads
   dir (Railway Strapi template runs at `/app` → `/app/public/uploads`; **verify
   exact path** before mounting). Do this **first** so later uploads persist.
2. **Local Strapi source matching the running version.** Clone the Railway
   Strapi template (guarantees version/config/deploy parity) — fallback
   `create-strapi-app@5` pinned to the same minor. Reuses the env vars in §3.
3. **Define `article`** — author the content-type files
   (`src/api/article/content-types/article/schema.json` + factory
   controller/route/service), or create via local dev Content-Type Builder.
4. **`railway up`** from that dir → replaces the service source, redeploys.
   On boot Strapi **auto-migrates** Postgres (adds the `articles` table);
   existing admin user + secrets are preserved (DB + env unchanged).
5. **Expose read** — in live admin, enable Public role `find`/`findOne` for
   `article` (public marketing content). Alternative: a read-only API token
   passed to the build as `STRAPI_TOKEN`. Default: **public read**.
6. Create 1–2 real posts with covers to validate end-to-end.

## 7. Build script — `homepage/scripts/build-journal.mjs`

- Node ≥18 (global `fetch`). One npm dep: **`marked`** (MD→HTML). Images via the
  existing **`cwebp`** CLI (already in the pipeline) — no native `sharp` dep.
- Env: `STRAPI_URL` (default the Railway URL), optional `STRAPI_TOKEN`.
- Fetch `GET /api/articles?populate=cover&sort=publishedAt:desc&pagination[pageSize]=100`
  (published only). Normalize Strapi v5 flat shape (`documentId`, flat attrs).
- Per article: download `cover` (absolute provider URL or `${STRAPI_URL}${cover.url}`
  for local), re-encode to sized webp → `public/img/journal/<slug>.webp`
  (+ larger `<slug>-hero.webp`). `width`/`height` set; index images `lazy`
  except featured `eager`+`fetchpriority=high`.
- Render from JS template functions (no template engine):
  - `public/journal.html` — featured post as the big card, rest in the grid;
    markup/styles reused from today's flattened `journal.html`.
  - `public/journal/<slug>.html` — per post from an `article.html`-derived
    template: MD body, SEO head (title/description/canonical/OG), JSON-LD
    `Article`, shared header/footer, inlined critical CSS.
- Regenerate `sitemap.xml` to include every `/journal/<slug>`.
- Preserve all §2 perf rules.

Templates live in `scripts/templates/` (or reuse `public/*.html` with markers) to
stay DRY with the header/footer already on the site.

## 8. Publish workflow (decision — manual first)

```bash
cd homepage
npm run build:journal        # node scripts/build-journal.mjs  (pull Strapi → regen public/)
./scripts/deploy.sh prod     # existing wrangler upload
```

Wrap as one `npm run publish`. **Later upgrade path (out of scope now):** Strapi
`entry.publish` webhook → GitHub Actions (`repository_dispatch`) → run the two
steps above → self-serve, ~1–2 min. Documented, not built yet.

## 9. Risks & mitigations

- **Version mismatch on `railway up`** → bad DB migration. Mitigate: clone the
  exact template repo (version parity); take a Postgres backup before first
  `railway up`.
- **Volume mount path wrong** → uploads still ephemeral. Verify container
  uploads path before mounting; test by redeploying and confirming an uploaded
  image survives.
- **`railway up` switches source** from template-git to uploaded dir —
  intended, but note it in the Strapi repo README so future redeploys use the
  same dir.
- **Public API exposes all published fields** — fine for marketing; never put
  secrets in `article` fields.
- Homepage repo gains a `package.json` + one dep — build-time only, never shipped
  in `public/`.

## 10. Definition of done

- `article` type live in prod Strapi; Public read works
  (`GET /api/articles` returns published posts).
- Strapi uploads persist across a redeploy (volume verified).
- `npm run build:journal` regenerates `journal.html` + `/journal/<slug>.html`
  for every published post, with optimized webp covers and updated `sitemap.xml`.
- Lighthouse on the built journal pages stays ≈ perf 100 / a11y 100 / BP 100.
- One-command publish documented in `homepage/CLAUDE.md`.

## 11. Open questions

- Exact running Strapi version (to pin the local clone) — resolve during impl by
  cloning the template / reading the deployed image.
- Container uploads path for the volume mount — verify against the template.
