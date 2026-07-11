# Auxi Design System

Auxi turns the clothes you already own into outfits worth wearing. It is an
AI wardrobe assistant: photograph your garments, tell it the day (weather,
occasion, how dressy), and it proposes **one** outfit built from pieces you
actually own — swap any item, save the look, move on with your morning.

The product has two surfaces, and this system covers both:

1. **Auxi mobile app** — a React Native app (iOS + Android). The *canonical*
   design language: warm paper neutrals, near-black ink, Poppins / Inter /
   Roboto. Home recommendations, wardrobe management, item detail, virtual
   try-on ("see this on me"), and settings. Mascot: **Macgie**, a black cat.
2. **Auxi marketing web** — an Astro/Tailwind landing site with a distinct
   *editorial* voice: warm paper, terracotta accent, Fraunces serif display +
   Inter body.

> The two surfaces share warmth and restraint but are intentionally different
> registers — the app is a calm tool; the marketing site is a confident
> editorial. Keep them apart: don't put Fraunces in the app or Poppins CTAs on
> the web.

---

## Sources (for whoever maintains this)

This system was extracted from materials provided by the Auxi team. You may not
have access; values here are the source of truth regardless.

- **Figma:** `auxi_design_system.fig` — a large working file (140 component
  sets, 639 Figma variables, 20+ pages incl. Hifi RFD, Concept, Marketing,
  166-common-items garment library, clothes-icons). Token values + garment
  photography were lifted from it.
- **Codebase — mobile app:** `wardrobe_project/auxi/` (React Native 0.83,
  React 19, TypeScript). The canonical token layer is `src/theme/theme.ts`
  (`theme.ds`), mirrored by the in-app `DesignSystemScreen`. Fonts + SVG icons
  live under `src/assets/`. **This was the primary source of truth** — the
  Figma file is a sprawling exploration; the app code is the shipped system.
- **Codebase — marketing web:** `wardrobe_project/auxi-web/` (Astro + Tailwind 4).
  Editorial tokens in `src/styles/global.css`; copy in `src/data/copy.ts`.
- **Docs:** `wardrobe_project/docs/`, `wardrobe_project/auxi/AGENTS.md`.

---

## Content fundamentals — how Auxi writes

**App voice — calm, plain, second-person, lowercase-leaning.** The app speaks
like a level-headed friend who removes pressure. Short. Declarative. Never
hype.

- *Second person, imperative for actions:* "Wear this", "Swipe right to save,
  swipe left to skip", "Take a photo", "Snap your clothes".
- *Reassuring, low-pressure framing:* "Get dressed with more clarity, less
  pressure.", "Auxi will revert to day one. This cannot be undone."
- *Honest about AI:* "AI-generated — may be inaccurate" with a quiet "Report"
  link. The product never over-claims.
- *Sentence case everywhere.* Buttons are sentence case ("Continue with
  Email", "Wear this") — never ALL CAPS except mono overlines/specs.
- *No emoji.* The brand does not use emoji in product UI.
- *Outfit captions are descriptive, not salesy:* "Clean weekday: crisp oxford
  with tailored trousers."

**Marketing voice — confident editorial, still warm.** Tighter, wittier, a
touch literary; short serif headlines + plain Inter body.

- *Headlines are clipped and assured:* "Outfits, sorted.", "Ready to dress
  easier?", "Built for daily wear."
- *Body acknowledges the real problem:* "A wardrobe of decisions, made every
  morning." / "You own enough. The friction is choosing."
- *Three-step rhythm:* "Snap your clothes → Tell us the day → Wear the result."
- Still sentence case; still no emoji.

**Casing summary:** Sentence case for everything human-readable. UPPERCASE only
for mono overlines / field labels / item tags. Numerals are real (24°c,
07 : 30, "3 items").

---

## Visual foundations

**Overall vibe.** Warm, paper-toned, quiet. A near-white/cream canvas does the
heavy lifting; near-black **ink** (#1d1f23) carries text and primary actions;
functional color (teal, green, red) appears only for state. Photography
(garments on light seamless backgrounds) provides nearly all the color. The
feeling is a calm, well-lit wardrobe — not a flashy fashion app.

**Color.** Warm neutral spine: ink → slate → warm-700 → warm-500 for text and
strokes; white → surface → cream → warm-100 → tan for surfaces. Accents are
rare and functional: teal #16a085 (switch on / success), green #039855
(confirm), danger #bb251a (destructive — standardise here, **never** raw
#ff0000), info #1465b4, and a purple #822be6 reserved for the AI "see this on
me" sparkle. No blue-purple gradients, no decorative color.

**Type.** App: Poppins (display / large numerics, 400–700), Roboto Regular
(button labels, MD3 base), Inter (dense UI, captions, body), JetBrains Mono
(overlines / specs — falls back to platform mono, not bundled). Scale: h1
Poppins Bold 32/40 (−0.02em), h2 Poppins SemiBold 24/32, h3 Inter SemiBold
20/26, body Inter 16/24, caption Inter 12/16, overline mono 10. Marketing:
Fraunces (display serif, often *italic* for the hero) + Inter body with fluid
clamp sizes. *Known type sprawl:* the Figma carries 40+ styles (Manrope, DM
Sans, Archivo Narrow, Playfair…) — treat anything outside Poppins / Roboto /
Inter (app) or Fraunces / Inter (web) as exploratory, not system.

**Spacing & layout.** 8-pt base (4 / 8 / 16 / 24 / 32 / 48). Screen body
padding 24. Primary CTA height 56; list rows + touch targets ≥ 44/56. Generous
vertical rhythm; content breathes on the cream canvas.

**Corner radii.** xs 2 (checkbox), sm 12 (text button / image tile), md 16
(primary button / dialog), lg 17 (secondary button), xl 18 (sheet / screen),
full 100 (pills). Cards are soft-but-not-bubbly — 12–16px.

**Borders.** Hairlines are low-opacity ink: `--auxi-line` rgba(29,31,35,.10)
and the fainter `--auxi-line-2` (.06); warm list dividers use #eee6df. On the
dark ink menu, dividers are cream at 10%. Inputs use a 1.5px hairline that goes
solid ink on focus.

**Shadows / elevation.** Warm, low-opacity ink lifts. `card` 0 8 16 /.12
(tiles, segmented active), `floating` 0 4 12 /.12 (the round white Home header
buttons), `dialog` 0 −4 40 /.15 and `sheet` 0 −8 40 /.25 both cast *upward*
(modals rise from the bottom). No hard or colored drop shadows.

**Cards & tiles.** White (or cream) fill, 12–16px radius, 1px hairline, no
heavy shadow at rest. Item/outfit tiles are 3:4 photos on a warm placeholder
with an optional white pin badge (top-right) and an uppercase mono category tag
(bottom-left).

**Transparency & blur.** Used sparingly and purposefully: the Home view-toggle
footer and onboarding sticky bar are white @ 60–80% over a light BlurView; the
guidance overlay scrim is ink @ 70%; dialog/sheet scrims are ink @ 30%.

**Motion.** Restrained. Short fades + ease transitions (~160–200ms), iOS spring
on the switch knob. Macgie's idle loop is the one playful moment. No bounces on
content, no infinite decorative loops, full reduced-motion respect.

**Hover / press.** Touch-first. Primary button darkens ink → near-black on
press; ghost/text/icon buttons fill with cream on press; disabled drops to ~50%
opacity. (Web marketing adds hover: ink @ 90%, ghost inverts to ink fill.)

**Imagery.** Garment cutouts and lifestyle shots on **light, warm seamless
backgrounds** — soft daylight, neutral, never moody or high-contrast. The
palette of the photography matches the cream canvas.

---

## Iconography

- **Line icons, ~1.6–2px stroke, ink-colored, 24px grid.** The app ships its
  own curated SVG set (`src/assets/images/*.svg`, indexed in
  `src/assets/icons/index.ts`) — copied here into `assets/icons/`. These are
  the real product icons (menu, heart, pin, wardrobe, grid, user, body,
  camera, setting, trash, edit, plus, close, chevrons, sparkle, remix, sort,
  send, globe, logout, feedback, check, swipe, change, get-dressed…). Prefer
  these; they are simple, consistent, and already in production.
- A few are **filled** (heart-filled / favourite-active, pin) for active
  states; most are outline.
- The **AI sparkle** icon marks generative actions ("see this on me") and is
  the one place the purple accent appears.
- **No emoji. No unicode-as-icon.** The mascot **Macgie** (`assets/brand/
  macgie.svg`) is a brand mark, not an icon — solid ink, never recolored.
- The Figma also contains a large `clothes-icons` family + an Arrows&Directions
  set; if you need a glyph the product set lacks, match the same 1.6–2px /
  ink / 24px line style rather than importing a heavier third-party set.
- *Substitution note:* `assets/brand/logo.png` shipped in the repo is a stray
  water-drop glyph, **not** the Auxi mark — ignore it; use `macgie.svg`.

---

## Index — what's in this system

**Foundations**
- `styles.css` — global entry (import this one file).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`.
- `guidelines/*.card.html` — foundation specimens (Colors, Type, Spacing,
  Brand) shown in the Design System tab.

**Components** (`components/<group>/` — React, consumed via the compiled
bundle as `window.AuxiDesignSystem_*`):
- `core/` — Button, IconButton, Badge, Chip, StatusPill, Tag
- `forms/` — Input, Checkbox, Radio, Switch, SegmentedControl
- `feedback/` — Dialog, ActionSheet, Snackbar, Tooltip
- `display/` — ItemTile, ListRow, Avatar
- `navigation/` — SideMenu, AppHeader

**UI kits** (`ui_kits/<product>/` — full-screen recreations):
- `mobile-app/` — Auxi app: welcome, home recommendation, wardrobe, item
  detail, settings (interactive click-through).
- `marketing-web/` — Auxi editorial landing page.

**Assets** (`assets/`)
- `fonts/` — Poppins (4 weights), Inter (3), Roboto Regular (bundled webfonts).
- `icons/` — product line icons (SVG).
- `brand/` — `macgie.svg` (mascot).
- `garments/` — real garment cutout photography (from the Figma item library).
- `images/` — style/onboarding/weather product imagery.

**Other**
- `SKILL.md` — Agent-Skill front-matter so this system is usable in Claude Code.
