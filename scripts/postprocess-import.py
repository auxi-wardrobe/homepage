#!/usr/bin/env python3
"""
Post-process a fresh Claude Design export into the deployable Macgie site.

This homepage is a *faithful mirror* of the Claude Design project
"Macgie design home page" (project e0ce1eb4-0493-4f29-b99a-08288e1be2f9).
Design changes happen in claude.ai/design, NOT by hand-editing HTML here.

To update the site:
  1. Open the project at claude.ai/design and edit the design.
  2. Export the project as a ZIP (··· menu -> Download).
  3. Wipe public/ and unzip the export into it:
         rm -rf public/* public/.image-slots.state.json public/.thumbnail
         unzip "Macgie design home page.zip" -d public
  4. Run this script from the repo root:
         python3 scripts/postprocess-import.py
  5. Deploy:
         ./scripts/deploy.sh sandbox   # verify, then:
         ./scripts/deploy.sh prod

What this script does (the only edits we layer on top of the raw export):
  1. Rewrites cross-page links "Macgie X.dc.html" -> clean paths (/features, ...).
  2. Renames the .dc.html files to clean names (index/features/pricing/journal/article).
  3. Injects <title> + meta description + Open Graph tags + an SVG favicon into
     each page's <helmet> block.
  4. Writes a branded, self-contained 404.html.

The pages render via the Claude design-canvas runtime (support.js + image-slot.js),
which loads React/ReactDOM/Babel from unpkg at view time and hydrates <image-slot>
images from the shared .image-slots.state.json sidecar. Do not hand-edit the
.dc.html bodies — round-trip through the design tool instead.
"""
import os
import sys
import glob

PUB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))

# source .dc.html  ->  (clean filename, <title>, meta description)
PAGES = {
    "Macgie Home.dc.html": (
        "index.html",
        "Macgie — Get dressed in seconds",
        "Macgie turns the clothes you already own into outfits worth wearing — "
        "AI outfit recommendations built from your real wardrobe.",
    ),
    "Macgie Feature.dc.html": (
        "features.html",
        "Features — Macgie",
        "Outfit Canvas, scheduler, instant visualization, auto background removal "
        "and more — one app that knows your closet, calendar and weather.",
    ),
    "Macgie Pricing.dc.html": (
        "pricing.html",
        "Pricing — Macgie",
        "Everything you need to get dressed easier is free. Macgie+ is $3.33/month "
        "when you want more — cancel anytime.",
    ),
    "Macgie Journal.dc.html": (
        "journal.html",
        "Journal — Macgie",
        "Notes on dressing with less friction — capsules, color, packing and "
        "getting more out of the wardrobe you own.",
    ),
    "Macgie Article.dc.html": (
        "article.html",
        "Journal — Macgie",
        "Notes on dressing with less friction, from the Macgie team.",
    ),
}

# substring -> clean path. Also covers "Macgie Home.dc.html#how" -> "/#how".
LINK_REWRITES = {
    "Macgie Home.dc.html": "/",
    "Macgie Feature.dc.html": "/features",
    "Macgie Journal.dc.html": "/journal",
    "Macgie Pricing.dc.html": "/pricing",
    "Macgie Article.dc.html": "/article",
}


def head_block(title, desc):
    return (
        "<helmet>\n"
        f"<title>{title}</title>\n"
        f'<meta name="description" content="{desc}">\n'
        '<link rel="icon" type="image/svg+xml" href="/assets/brand/macgie.svg">\n'
        f'<meta property="og:title" content="{title}">\n'
        f'<meta property="og:description" content="{desc}">\n'
        '<meta property="og:type" content="website">'
    )


def find_fonts_css():
    """Locate the bundled design-system fonts.css (folder name carries a hash)."""
    hits = glob.glob(os.path.join(PUB, "_ds", "*", "tokens", "fonts.css"))
    if hits:
        return os.path.relpath(hits[0], PUB)
    return None


def not_found_html():
    fonts = find_fonts_css()
    font_link = f'<link rel="stylesheet" href="/{fonts}">' if fonts else (
        '<link rel="stylesheet" '
        'href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400&display=swap">'
    )
    return f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — Macgie</title>
<link rel="icon" type="image/svg+xml" href="/assets/brand/macgie.svg">
{font_link}
<style>
  html,body{{margin:0;height:100%}}
  body{{background:#faf7f2;color:#14110f;font-family:'Inter',system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}}
  .wrap{{max-width:420px}}
  img{{width:56px;height:auto;margin-bottom:24px}}
  h1{{font-family:'Fraunces',Georgia,serif;font-size:40px;margin:0 0 8px;font-weight:600}}
  p{{color:#6f6a63;font-size:16px;line-height:1.5;margin:0 0 24px}}
  a{{display:inline-block;background:#14110f;color:#faf7f2;text-decoration:none;
    padding:12px 22px;border-radius:100px;font-weight:600;font-size:15px}}
</style></head>
<body><div class="wrap">
  <img src="/assets/brand/macgie.svg" alt="Macgie">
  <h1>Nothing to wear here.</h1>
  <p>This page wandered off. Let's get you back to the closet.</p>
  <a href="/">Back to Macgie</a>
</div></body></html>"""


def main():
    if not os.path.isdir(PUB):
        sys.exit(f"public/ not found at {PUB}")
    for src, (dst, title, desc) in PAGES.items():
        path = os.path.join(PUB, src)
        if not os.path.exists(path):
            print(f"skip (missing): {src}")
            continue
        html = open(path, encoding="utf-8").read()
        for a, b in LINK_REWRITES.items():
            html = html.replace(a, b)
        if "<helmet>" in html:
            html = html.replace("<helmet>", head_block(title, desc), 1)
        else:
            print(f"  warn: no <helmet> in {src}")
        open(path, "w", encoding="utf-8").write(html)
        if src != dst:
            os.rename(path, os.path.join(PUB, dst))
        print(f"processed {src} -> {dst}")
    open(os.path.join(PUB, "404.html"), "w", encoding="utf-8").write(not_found_html())
    print("wrote 404.html")


if __name__ == "__main__":
    main()
