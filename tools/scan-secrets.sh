#!/bin/sh
set -eu

cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

rg -n --hidden \
  --glob '!.git' \
  --glob '!node_modules' \
  --glob '!dist' \
  --glob '!*.tgz' \
  '(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|BEGIN [A-Z ]*PRIVATE KEY|password\s*=|secret\s*=|token\s*=)' \
  . && {
  echo "Potential secret-like content detected."
  exit 1
}

echo "No secret-like patterns detected."
