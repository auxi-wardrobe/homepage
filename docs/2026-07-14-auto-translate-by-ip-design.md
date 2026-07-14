# Auto-translate the macgie site by visitor IP — Design

**Date:** 2026-07-14
**Status:** Approved (CEO delegated all decisions — "bạn tự quyết cách tốt nhất")
**Owner:** homepage (macgie marketing site + Strapi journal)

## Goal

A visitor in **Vietnam** automatically sees the site in **Vietnamese**; everyone
else sees **English**. A manual **EN | VI** switcher always lets anyone override.
Translation is **fully automatic** (machine, at build time) so new journal posts
translate themselves. The site stays **100% static** — no runtime translation, no
visitor→server round-trip, Lighthouse untouched.

## Locked decisions

| Decision | Choice |
|---|---|
| Languages | `en` (default, at `/`) + `vi` (at `/vi/`) |
| Detection | Cloudflare edge country via **`/cdn-cgi/trace`** (same-origin, no key, no external call) |
| Routing | Client-side redirect + sticky `lang` cookie + manual switcher |
| Translation | **Auto machine-translate at build**, cached. Provider-aware engine: **OpenAI `gpt-4o-mini`** primary (backend's funded key), **Gemini** fallback. (Gemini alone hit a free-tier 429, hence OpenAI-first.) |
| Engine key | Reuse backend's `OPENAI_API_KEY` (+ `GOOGLE_STUDIO_KEY` fallback), wired as GitHub Actions secrets on the homepage repo |
| Scope | Whole site — marketing pages (`index`, `features`, `pricing`, `404`) + journal (index + every article) |
| Canonical host | `https://beta.macgie.com` (also **fixes the existing bug** where canonical/sitemap point at the 404ing apex `macgie.com`) |

## Why this architecture

"Auto-translate by IP" is normally a *runtime* concern, but the site must stay
static. We split it into two layers that both respect that:

1. **Build time** pre-generates a complete `/vi/` static mirror (translation runs
   in Node during the build, never in the visitor's browser).
2. **Edge detection** uses Cloudflare's own `/cdn-cgi/trace` endpoint (returns
   `loc=VN`) — same-origin, instant, no API key, no third-party geo service.

Rejected alternatives:
- **Cloudflare Pages Function `_middleware`** (reads `request.cf.country`,
  flash-free) — cleaner redirect but adds a serverless edge function; less "pure
  static." Kept as a documented future upgrade if the first-load flash matters.
- **Runtime Google-Translate widget** — poor quality, hurts SEO/Lighthouse, not
  actually "by IP." Rejected.

## Components

### 1. `scripts/lib/translate.mjs` — translation engine + cache
- `translateText(text, {targetLang})` and `translateMarkdown(md, {targetLang})`.
- Backed by Gemini `generateContent` REST (`GOOGLE_STUDIO_KEY`). Prompt preserves
  markdown/HTML structure, keeps the brand token **Macgie/macgie** untranslated,
  never translates code/URLs, returns only the translation.
- **Cache:** `scripts/i18n/vi-cache.json`, keyed by `sha1(format + '\n' + source)`.
  Loaded once, checked before every API call, written back at end. Committed to the
  repo → CI re-uses it, so only *new/changed* strings ever cost an API call and
  builds are deterministic + cheap.
- **Graceful degradation:** if `GOOGLE_STUDIO_KEY` is unset, log a warning and
  return the source text unchanged (build never hard-fails; `/vi` falls back to EN
  copy rather than crashing the deploy).

### 2. `scripts/lib/i18n-inject.mjs` — shared per-page i18n chrome
One source of truth used by BOTH the journal renderer and the marketing-page
translator, so behavior is identical everywhere:
- `hreflangTags(enPath)` → `<link rel="alternate" hreflang="en|vi|x-default">`.
- `geoRedirectScript()` → the inline `<head>` script (below).
- `switcherHtml(locale, enPath)` → the **EN | VI** control.

### 3. Geo-redirect (inline `<head>` script, runs on every page)
- Current locale = `vi` if path starts with `/vi/`, else `en`.
- Desired locale = `lang` cookie if present (sticky), else geo: `VN → vi`, else `en`.
- Cookie present → decide + `location.replace()` **synchronously** before paint →
  **returning visitors get no flash**.
- No cookie → `fetch('/cdn-cgi/trace')`, parse `loc=`, set cookie, redirect. Only a
  **first-time VN visitor** sees a one-frame flash (accepted tradeoff of Approach A).
- Path mapping: `toVi('/x') → '/vi/x'`, `toEn('/vi/x') → '/x'` (root `'/' ↔ '/vi/'`).

### 4. Language switcher (UI)
Minimal **EN · VI** toggle injected into the `<header><nav>` of every page (marketing
pages have a consistent nav; journal templates get it too). Click → set `lang`
cookie + navigate to the equivalent path in the other locale. Sticky thereafter.

### 5. Marketing-page translation — `scripts/build-i18n-pages.mjs`
- Parses `public/{index,features,pricing,404}.html` with `node-html-parser` (new dep).
- Walks text nodes and translates them; **skips** `<script>`, `<style>`, `<code>`,
  `<pre>`, and any element with `translate="no"` / `data-no-translate`; skips the
  brand token. Also translates `<title>`, `<meta name=description>`,
  `<meta property=og:title|og:description>`, and `alt` / `aria-label` / `placeholder`.
- Rewrites internal links (`/features`, `/pricing`, `/journal`, `#anchors`) to their
  `/vi/...` equivalents; leaves external + app-store links untouched.
- Injects hreflang + geo-redirect + switcher into **both** the EN page (in place) and
  the emitted `public/vi/{...}.html`.
- Round-trip safety: serialized EN output must be byte-diff-reviewed on first run to
  confirm the parser preserves layout; skip-list widened if anything visual breaks.
- Runs on demand (marketing copy changes rarely), output committed. NOT in the cron.

### 6. Journal translation — extend `scripts/build-journal.mjs` + `render.mjs`
- After building EN journal, for each article translate `{title, excerpt, body,
  seoTitle, seoDescription}`; map `category` through a fixed EN→VI label table (stable
  wording, not re-translated each run).
- `render.mjs` gains a `locale` param → URL prefixing (`/vi/journal/<slug>`), switcher,
  hreflang. Emits `public/vi/journal.html` + `public/vi/journal/<slug>.html`.
- Runs inside `build:journal` → **this is the part that must work unattended in CI**.

### 7. SEO / host
- `render.mjs` + sitemap read `SITE_URL` (default `https://beta.macgie.com`).
- `sitemap.xml` lists both locales; every page pair carries reciprocal `hreflang`
  + per-locale `canonical`.

### 8. CI (`.github/workflows/auto-publish-journal.yml`)
- Add repo secret **`GOOGLE_STUDIO_KEY`** (set via `gh secret set` from backend `.env`).
- Build step gets it as `env`. Commit set extends to `public/vi/**` and
  `scripts/i18n/vi-cache.json` so newly-translated posts + cache persist.

## Data flow

```
Publish (Strapi)  ─cron─▶  build:journal
                            ├─ fetch EN articles (Strapi)
                            ├─ render EN → public/journal + /journal/<slug>
                            └─ translate (Gemini+cache) → render VI → public/vi/journal…
                                                     │
marketing copy change ─manual▶ build-i18n-pages ─────┤ (shares translate.mjs + cache)
                                                     ▼
                                            wrangler deploy public/  (EN + /vi mirror)
                                                     ▼
Visitor ─▶ edge static page ─▶ inline script reads /cdn-cgi/trace ─▶ VN? → /vi/  (cookie-sticky)
                                                     ▲
                                         EN·VI switcher overrides anytime
```

## Error handling
- No `GOOGLE_STUDIO_KEY` → warn, `/vi` falls back to EN text, build still deploys.
- Gemini call fails/timeouts → retry once, then fall back to source text for that
  string (never blocks the build); the miss is not cached, so a later build retries it.
- `/cdn-cgi/trace` fetch fails → no redirect, visitor stays on EN (safe default).
- Parser breaks a marketing page → caught by first-run byte-diff review + skip-list.

## Testing
- `translate.mjs`: unit test cache hit/miss + no-key fallback (stub the fetch).
- `i18n-inject.mjs`: path-mapping unit tests (`/`↔`/vi/`, nested, anchors).
- Journal VI: build locally, assert `public/vi/journal.html` exists with VI title +
  correct `/vi/journal/<slug>` links + hreflang.
- Marketing VI: build locally, assert `public/vi/index.html` renders, nav links point
  to `/vi/...`, EN page unchanged except injected chrome.
- Redirect: manual — VN VPN → root redirects to `/vi/`; switcher flips + sticks.

## Out of scope (YAGNI)
- French/other locales (EN+VI only for now; the design generalizes to add later).
- Strapi i18n plugin / human-authored translations (machine-only, per decision).
- The flash-free Pages Function middleware (documented as a future upgrade).
