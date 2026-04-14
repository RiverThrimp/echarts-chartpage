#!/bin/sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CACHE_DIR=/tmp/echarts-chartpage-npm-cache

cd "$PROJECT_ROOT"
npm_config_cache="$CACHE_DIR" npm pack >/tmp/echarts-chartpage-pack.txt
TARBALL=$(tail -n 1 /tmp/echarts-chartpage-pack.txt)

TMPDIR=$(mktemp -d /tmp/echarts-chartpage-pkg-verify-XXXXXX)
cd "$TMPDIR"
printf '{}\n' > package.json

npm_config_cache="$CACHE_DIR" npm install "$PROJECT_ROOT/$TARBALL"

./node_modules/.bin/echarts-chartpage generate \
  --input "$PROJECT_ROOT/examples/inputs/line-chart.json" \
  --output "$TMPDIR/out.html"

node -e "const fs=require('fs'); const html=fs.readFileSync(process.argv[1],'utf8'); console.log(JSON.stringify({ok: html.toLowerCase().includes('doctype html') && html.includes('echarts.min.js'), size: html.length}, null, 2));" "$TMPDIR/out.html"
