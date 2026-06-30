#!/usr/bin/env bash
# Deploy the Macgie homepage to Cloudflare Pages (project: macgie-homepage).
#
#   ./scripts/deploy.sh            -> SANDBOX preview  (sandbox.macgie-homepage.pages.dev)
#   ./scripts/deploy.sh sandbox    -> same as above
#   ./scripts/deploy.sh prod       -> PRODUCTION       (macgie-homepage.pages.dev)
#
# Static site — no build step. Uploads homepage/public/ via wrangler.
# Never touches git. Requires wrangler auth (OAuth or CLOUDFLARE_API_TOKEN).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../public" && pwd)"
PROJECT="macgie-homepage"
TARGET="${1:-sandbox}"

case "$TARGET" in
  sandbox)            BRANCH="sandbox"; URL="https://sandbox.${PROJECT}.pages.dev" ;;
  prod|production|main) BRANCH="main";  URL="https://${PROJECT}.pages.dev" ;;
  *) echo "usage: $(basename "$0") [sandbox|prod]" >&2; exit 1 ;;
esac

echo "▸ Deploying homepage → ${TARGET}  (branch=${BRANCH})"
wrangler pages deploy "$DIR" \
  --project-name="$PROJECT" \
  --branch="$BRANCH" \
  --commit-dirty=true

echo ""
echo "✅ ${TARGET} live: ${URL}  (allow ~30s, hard-refresh)"
if [ "$TARGET" = "sandbox" ]; then
  echo "   production untouched: https://${PROJECT}.pages.dev"
fi
