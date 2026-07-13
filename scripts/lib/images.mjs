// Download a Strapi cover and encode a sized webp via the cwebp CLI.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
const run = promisify(execFile);

export async function processCover(article, { outDir, width = 1200 }) {
  if (!article.cover) throw new Error(`article ${article.slug} has no cover`);
  await mkdir(outDir, { recursive: true });
  const res = await fetch(article.cover.url);
  if (!res.ok) throw new Error(`cover ${article.cover.url} → ${res.status}`);
  const tmp = join(outDir, `${article.slug}.src`);
  await writeFile(tmp, Buffer.from(await res.arrayBuffer()));
  const out = join(outDir, `${article.slug}.webp`);
  // -resize W 0 keeps aspect ratio; -q 82 matches the site's existing webp quality.
  await run('cwebp', ['-quiet', '-q', '82', '-resize', String(width), '0', tmp, '-o', out]);
  await rm(tmp, { force: true });
  const w = Math.min(width, article.cover.width || width);
  const h = article.cover.height && article.cover.width
    ? Math.round((article.cover.height / article.cover.width) * w) : Math.round(w * 0.66);
  return { src: `/img/journal/${article.slug}.webp`, width: w, height: h };
}
