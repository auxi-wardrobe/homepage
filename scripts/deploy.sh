#!/usr/bin/env bash
# Deploy the Macgie homepage to Cloudflare Pages (project: macgie-homepage).
#
#   ./scripts/deploy.sh            -> PREVIEW  (commit-hash URL + sandbox alias)  [default]
#   ./scripts/deploy.sh sandbox    -> same as above
#   ./scripts/deploy.sh prod       -> PRODUCTION  (macgie-homepage.pages.dev)
#
# Preview gives the designer a fresh, per-build link prefixed with the homepage
# git commit — https://<sha>.macgie-homepage.pages.dev — so each deploy is a
# unique URL that never serves a stale cache. It also refreshes the stable
# "latest" bookmark https://sandbox.macgie-homepage.pages.dev.
#
# Static site — no build step. Uploads homepage/public/ via wrangler.
# Never touches git. Requires wrangler auth (OAuth or CLOUDFLARE_API_TOKEN).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$REPO_ROOT/public"
PROJECT="macgie-homepage"
TARGET="${1:-sandbox}"

# ---- production: single deterministic alias, unchanged posture ----------------
if [ "$TARGET" = "prod" ] || [ "$TARGET" = "production" ] || [ "$TARGET" = "main" ]; then
  echo "▸ Deploying homepage → PRODUCTION  (branch=main)"
  wrangler pages deploy "$DIR" --project-name="$PROJECT" --branch="main" --commit-dirty=true
  echo ""
  echo "✅ production live: https://${PROJECT}.pages.dev  (allow ~30s, hard-refresh)"
  exit 0
fi

if [ "$TARGET" != "sandbox" ] && [ "$TARGET" != "preview" ]; then
  echo "usage: $(basename "$0") [sandbox|preview|prod]" >&2
  exit 1
fi

# ---- preview: commit-hash-prefixed, unique-per-build URL ----------------------
# REF becomes the branch alias, i.e. the subdomain: https://<REF>.<project>.pages.dev
# clean tree -> <sha> (immutable, re-deployable to the same link)
# dirty tree -> <sha>-<HHMMSS> (still tags the base commit, but unique per deploy
#               so a rapid vibe loop never reuses a cached alias)
SHA="$(git -C "$REPO_ROOT" rev-parse --short=7 HEAD 2>/dev/null || true)"
DIRTY=0
if [ -z "$SHA" ]; then
  REF="build-$(date +%Y%m%d-%H%M%S)"          # not a git checkout — fall back to a timestamp
elif [ -n "$(git -C "$REPO_ROOT" status --porcelain -- public 2>/dev/null)" ]; then
  REF="${SHA}-$(date +%H%M%S)"; DIRTY=1
else
  REF="$SHA"
fi

PREVIEW_URL="https://${REF}.${PROJECT}.pages.dev"
LATEST_URL="https://sandbox.${PROJECT}.pages.dev"

echo "▸ Deploying homepage preview  (ref=${REF})"
wrangler pages deploy "$DIR" --project-name="$PROJECT" --branch="$REF" --commit-dirty=true

# Refresh the stable "latest" bookmark. Files are content-addressed, so this
# re-uploads nothing; it just repoints the sandbox alias at this build.
echo "▸ Refreshing latest bookmark (sandbox alias)…"
wrangler pages deploy "$DIR" --project-name="$PROJECT" --branch="sandbox" --commit-dirty=true \
  >/dev/null 2>&1 || echo "   (warn: sandbox 'latest' alias refresh failed — the commit link above is still live)"

echo ""
echo "✅ Preview (this build):  ${PREVIEW_URL}"
echo "   Latest:                ${LATEST_URL}"
if [ "$DIRTY" = "1" ]; then
  echo "   Built from: ${SHA} (homepage) + uncommitted changes"
elif [ -n "${SHA:-}" ]; then
  echo "   Built from: ${SHA} (homepage)"
fi
echo "   (the commit-hash URL is unique to this build — no hard-refresh needed)"
echo "   production untouched: https://${PROJECT}.pages.dev"
