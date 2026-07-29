#!/usr/bin/env python3
"""Flatten a pre-rendered Macgie mirror page into clean static HTML.
Input: dump-dom capture (runtime already ran, bindings resolved, scripts still present).
Output: static HTML — scripts stripped, <image-slot> -> optimized <img>, SEO head added.
"""
import re, sys, json, os, glob
from PIL import Image

# Geist is the body/UI face (self-hosted since 428548b). It is NOT in the design
# system's bundled fonts.css, so the three subset faces live here — {REL} is the
# hashed _ds folder, filled in by token_css().
GEIST_FACES = """
@font-face {
  font-family: 'Geist';
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  src: url('{REL}/assets/fonts/Geist-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Geist';
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  src: url('{REL}/assets/fonts/Geist-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Geist';
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  src: url('{REL}/assets/fonts/Geist-vietnamese.woff2') format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
"""


def ds_dir(pubdir):
    """The bundled design-system folder (its name carries a content hash)."""
    hits = glob.glob(os.path.join(pubdir, "_ds", "*", "tokens", "fonts.css"))
    return os.path.dirname(os.path.dirname(hits[0])) if hits else None


def token_css(pubdir):
    """Design-system token CSS, ready to inline: fonts + Geist + colors.

    The export's fonts.css points at bundled TTFs via relative URLs. Pages are
    served from arbitrary depths (/, /features, /vi/…), and TTF is ~3x the bytes
    of woff2 — so rewrite both: TTF -> woff2, relative -> root-absolute.
    """
    d = ds_dir(pubdir)
    if not d:
        print("  warn: no _ds/*/tokens/fonts.css — token CSS not inlined")
        return ""
    rel = "/_ds/" + os.path.basename(d)
    fonts = open(os.path.join(d, "tokens", "fonts.css"), encoding="utf-8").read()
    colors = open(os.path.join(d, "tokens", "colors.css"), encoding="utf-8").read()
    def to_woff2(m):
        name = m.group(1)
        # Only point at woff2 that actually shipped. Some bundled faces (Inter)
        # were never converted; silently rewriting them yields 404ing @font-face.
        if os.path.exists(os.path.join(d, "assets", "fonts", name + ".woff2")):
            return f"url('{rel}/assets/fonts/{name}.woff2') format('woff2')"
        return f"url('{rel}/assets/fonts/{name}.ttf') format('truetype')"

    fonts = re.sub(
        r"url\('\.\./assets/fonts/([^']+)\.ttf'\)\s*format\('truetype'\)", to_woff2, fonts
    )
    return fonts + "\n" + GEIST_FACES.replace("{REL}", rel) + "\n" + colors


# Raster images the design references under a different name than the one we
# deploy (renamed during optimization). Same-stem .png/.jpg -> .webp swaps are
# handled generically by repl_raster and don't need an entry here.
IMG_ALIASES = {
    "./viet-mrfxd5ud.png": "assets/testimonials/tranv.webp",
}

# Alt text for images the design ships without a usable one, keyed by deployed
# src. "" marks a decorative image (the logo sits next to the "Macgie" wordmark,
# so announcing it again is noise) — an empty alt is the correct a11y answer,
# and every <img> needs SOME alt for the Lighthouse a11y score.
IMG_ALT = {
    "./m-lg-mrfpjcc9.svg": "",
    "assets/brand/macgie.svg": "",
    "./man1-mrfqu2wj.webp": "",
    "./seeonme-2-mrfvxkkw.webp": "",
    "assets/feature/recommend.webp": "Macgie app feature preview",
    "assets/feature/closet.webp": "Macgie app feature preview",
    "assets/feature/pack.webp": "Macgie app feature preview",
}


def repl_raster(html, pubdir):
    """Point <img> at the optimized webp, add intrinsic dims + lazy load + alt.

    The design exports PNG/JPG; the deployed site ships sized webp beside them.
    Swap only when the webp is actually on disk, so a not-yet-optimized asset
    keeps working instead of turning into a broken image. Alt text is applied to
    every <img> (svg included) and never overwrites one the design provided.
    """
    def fix(m):
        tag = m.group(0)
        sm = re.search(r'src="([^"]+)"', tag)
        if not sm:
            return tag
        src = new = sm.group(1)

        # raster -> optimized webp
        alias = IMG_ALIASES.get(src)
        cand_new = alias or (re.sub(r'\.(png|jpe?g)$', '.webp', src, flags=re.I)
                             if re.search(r'\.(png|jpe?g)$', src, re.I) else None)
        if cand_new:
            rel = cand_new.lstrip("/") if cand_new.startswith("/") else cand_new.replace("./", "")
            if os.path.exists(os.path.join(pubdir, rel)):
                new = cand_new
                w, h = img_dims(os.path.join(pubdir, rel))
                extra = f' width="{w}" height="{h}"' if w and "width=" not in tag else ""
                if "loading=" not in tag:
                    extra += ' loading="lazy" decoding="async"'
                tag = tag.replace(f'src="{src}"', f'src="{new}"{extra}')

        if "alt=" not in tag and new in IMG_ALT:
            tag = tag.replace("<img", f'<img alt="{IMG_ALT[new]}"', 1)
        return tag

    return re.sub(r'<img[^>]*>', fix, html)

CANON = {"index":"https://macgie.com/","features":"https://macgie.com/features",
         "journal":"https://macgie.com/journal",
         "article":"https://macgie.com/article",
         "privacy":"https://macgie.com/privacy","terms":"https://macgie.com/terms",
         "ai-policy":"https://macgie.com/ai-policy",
         "subscription":"https://macgie.com/subscription"}

# per-slot: alt, fit override, eager(bool)
SLOT_META = {
 "hero-p2":     ("People wearing everyday outfits picked by Macgie", "contain", True),
 "diff-1":      ("Browsing outfit suggestions in the Macgie app", "cover", False),
 "diff-2":      ("Macgie building an outfit from your own clothes", "cover", False),
 "diff-3":      ("A finished outfit recommendation in Macgie", "cover", False),
 "how-photo-0": ("Macgie app showing today's outfit", "cover", False),
 "how-photo-1": ("Saving a favourite outfit in Macgie", "cover", False),
 "how-photo-2": ("Previewing an outfit on yourself in Macgie", "cover", False),
}

def img_dims(path):
    try:
        with Image.open(path) as im: return im.size
    except Exception: return (None, None)

# Policy/legal pages are documents, not the product. Describing them with the
# SoftwareApplication node — which carries an Offer at price 0 — is inaccurate
# structured data on a page that sells nothing.
LEGAL_SLUGS = {"privacy", "terms", "ai-policy", "subscription"}
# The design ships a standalone article demo. It duplicates real journal posts
# and nothing links to it, so keep it reachable but out of the index.
NOINDEX_SLUGS = {"article"}


def build_seo(slug):
    url = CANON.get(slug, "https://macgie.com/")
    hero = '<link rel="preload" as="image" href="/img/hero-p2.webp" fetchpriority="high">\n' if slug=="index" else ""
    org = {"@type":"Organization","@id":"https://macgie.com/#org","name":"Macgie",
           "url":"https://macgie.com/","logo":"https://macgie.com/assets/brand/macgie.svg"}
    site = {"@type":"WebSite","@id":"https://macgie.com/#site","url":"https://macgie.com/",
            "name":"Macgie","publisher":{"@id":"https://macgie.com/#org"}}
    if slug in LEGAL_SLUGS:
        main = {"@type":"WebPage","@id":url + "#page","url":url,
                "isPartOf":{"@id":"https://macgie.com/#site"},
                "publisher":{"@id":"https://macgie.com/#org"}}
    else:
        main = {"@type":"SoftwareApplication","name":"Macgie","applicationCategory":"LifestyleApplication",
                "operatingSystem":"iOS","description":"AI outfit recommendations built from the clothes you already own.",
                "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
    ld = {"@context":"https://schema.org","@graph":[org, site, main]}
    robots = '<meta name="robots" content="noindex, follow">\n' if slug in NOINDEX_SLUGS else ""
    return (f'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">\n'
      '<meta property="og:image" content="https://macgie.com/img/hero-p2.webp">\n'
      '<meta name="twitter:card" content="summary_large_image">\n'
      # No Google Fonts preconnect: every face is self-hosted from /_ds.
      + robots + hero + '<script type="application/ld+json">' + json.dumps(ld) + '</script>\n')

def repl_slot(m, pubdir):
    tag = m.group(0)
    idm = re.search(r'id="([^"]*)"', tag); sm = re.search(r'style="([^"]*)"', tag)
    fm = re.search(r'fit="([^"]*)"', tag)
    sid = idm.group(1) if idm else ""
    style = sm.group(1) if sm else ""
    meta = SLOT_META.get(sid)
    alt, fit, eager = meta if meta else (sid.replace("-"," "), (fm.group(1) if fm else "cover"), False)
    w,h = img_dims(os.path.join(pubdir, "img", sid+".webp"))
    s = style.rstrip("; ").strip()
    if s: s += "; "
    s += f"object-fit:{fit}; display:block;"
    if "width" not in style: s += " width:100%; height:100%;"
    wh = f' width="{w}" height="{h}"' if w else ""
    load = ('loading="eager" fetchpriority="high"' if eager else 'loading="lazy"') + ' decoding="async"'
    return f'<img src="img/{sid}.webp" alt="{alt}"{wh} {load} style="{s}">'

def flatten(infile, outfile, slug, pubdir):
    html = open(infile, encoding="utf-8").read()
    html = re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.S|re.I)
    html = re.sub(r'<html\b[^>]*>', '<html lang="en">', html, count=1)
    html = re.sub(r'<image-slot\b[^>]*>.*?</image-slot>', lambda m: repl_slot(m, pubdir), html, flags=re.S|re.I)
    html = re.sub(r'<image-slot\b[^>]*/>', lambda m: repl_slot(m, pubdir), html, flags=re.I)
    html = repl_raster(html, pubdir)
    # Render-blocking external CSS -> inlined token CSS. The design exports the
    # DS tokens as two <link>s and pulls Geist off Google Fonts; we self-host
    # every face, so drop both and inline instead (critical-CSS rule).
    html = re.sub(r'<link[^>]+tokens/(?:fonts|colors)\.css[^>]*>', '', html)
    html = re.sub(r'<link[^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>', '', html)
    tokens = token_css(pubdir)
    if tokens:
        html = html.replace('<head>', '<head>\n<style>\n' + tokens + '\n</style>', 1)
    html = html.replace('</head>', build_seo(slug) + '</head>', 1)
    html = re.sub(r'\sdata-dc-tpl="[^"]*"', '', html)
    open(outfile, "w", encoding="utf-8").write(html)
    left = len(re.findall(r'<image-slot', html)); scripts = len(re.findall(r'<script', html))
    gfonts = len(re.findall(r'fonts\.(?:googleapis|gstatic)\.com', html))
    print(f"{slug}: wrote {outfile} ({len(html)//1024}KB) | image-slots left={left} "
          f"scripts left={scripts} google-fonts refs={gfonts}")

if __name__ == "__main__":
    infile, outfile, slug, pubdir = sys.argv[1:5]
    flatten(infile, outfile, slug, pubdir)
