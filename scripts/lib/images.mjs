// Download a Strapi cover and encode a sized webp via the cwebp CLI.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
const run = promisify(execFile);

// Two derivatives per cover:
//   full (1200px) — the featured/hero card (~705px CSS) and the OG image
//   card ( 680px) — the 3-up grid and "related" cards, which render at ~337px CSS
// Serving the 1200px file into a 337px slot is a 3.5x overdraw; on the index that
// is 18 needlessly heavy lazy images, so the cards sit grey far longer than they
// should and the grid reads as broken.
export async function processCover(article, { outDir, width = 1200, cardWidth = 680 }) {
  if (!article.cover) throw new Error(`article ${article.slug} has no cover`);
  await mkdir(outDir, { recursive: true });
  const res = await fetch(article.cover.url);
  if (!res.ok) throw new Error(`cover ${article.cover.url} → ${res.status}`);
  const tmp = join(outDir, `${article.slug}.src`);
  await writeFile(tmp, Buffer.from(await res.arrayBuffer()));

  const out = join(outDir, `${article.slug}.webp`);
  const cardOut = join(outDir, `${article.slug}-card.webp`);
  // -resize W 0 keeps aspect ratio; -q 82 matches the site's existing webp quality.
  await run('cwebp', ['-quiet', '-q', '82', '-resize', String(width), '0', tmp, '-o', out]);
  await run('cwebp', ['-quiet', '-q', '82', '-resize', String(cardWidth), '0', tmp, '-o', cardOut]);
  await rm(tmp, { force: true });

  const dims = (target) => {
    const w = Math.min(target, article.cover.width || target);
    const h = article.cover.height && article.cover.width
      ? Math.round((article.cover.height / article.cover.width) * w) : Math.round(w * 0.66);
    return { width: w, height: h };
  };
  return {
    src: `/img/journal/${article.slug}.webp`,
    ...dims(width),
    card: { src: `/img/journal/${article.slug}-card.webp`, ...dims(cardWidth) },
  };
}
