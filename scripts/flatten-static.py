#!/usr/bin/env python3
"""Flatten a pre-rendered Macgie mirror page into clean static HTML.
Input: dump-dom capture (runtime already ran, bindings resolved, scripts still present).
Output: static HTML — scripts stripped, <image-slot> -> optimized <img>, SEO head added.
"""
import re, sys, json, os
from PIL import Image

CANON = {"index":"https://macgie.com/","features":"https://macgie.com/features",
         "pricing":"https://macgie.com/pricing","journal":"https://macgie.com/journal",
         "article":"https://macgie.com/article"}

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

def build_seo(slug):
    url = CANON.get(slug, "https://macgie.com/")
    hero = '<link rel="preload" as="image" href="/img/hero-p2.webp" fetchpriority="high">\n' if slug=="index" else ""
    ld = {"@context":"https://schema.org","@graph":[
        {"@type":"Organization","@id":"https://macgie.com/#org","name":"Macgie",
         "url":"https://macgie.com/","logo":"https://macgie.com/assets/brand/macgie.svg"},
        {"@type":"WebSite","@id":"https://macgie.com/#site","url":"https://macgie.com/",
         "name":"Macgie","publisher":{"@id":"https://macgie.com/#org"}},
        {"@type":"SoftwareApplication","name":"Macgie","applicationCategory":"LifestyleApplication",
         "operatingSystem":"iOS","description":"AI outfit recommendations built from the clothes you already own.",
         "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}]}
    return (f'<link rel="canonical" href="{url}">\n<meta property="og:url" content="{url}">\n'
      '<meta property="og:image" content="https://macgie.com/img/hero-p2.webp">\n'
      '<meta name="twitter:card" content="summary_large_image">\n'
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      + hero + '<script type="application/ld+json">' + json.dumps(ld) + '</script>\n')

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
    html = html.replace('</head>', build_seo(slug) + '</head>', 1)
    html = re.sub(r'\sdata-dc-tpl="[^"]*"', '', html)
    open(outfile, "w", encoding="utf-8").write(html)
    left = len(re.findall(r'<image-slot', html)); scripts = len(re.findall(r'<script', html))
    print(f"{slug}: wrote {outfile} ({len(html)//1024}KB) | image-slots left={left} scripts left={scripts}")

if __name__ == "__main__":
    infile, outfile, slug, pubdir = sys.argv[1:5]
    flatten(infile, outfile, slug, pubdir)
