#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p _site
# Only public static assets. Never copy local runner, credentials, or backups.
EXCLUDES=(
  --exclude='.git' --exclude='.github' --exclude='node_modules'
  --exclude='scripts/' --exclude='test/' --exclude='tests/' --exclude='docs/'
  --exclude='deploy/' --exclude='deliverables/' --exclude='output/' --exclude='src/'
  --exclude='server/' --exclude='server.mjs' --exclude='*.log'
  --exclude='.env*' --exclude='*.db' --exclude='*.db-*' --exclude='*.sqlite*'
  --exclude='*.pem' --exclude='*.key' --exclude='*.bak' --exclude='backups/'
  --exclude='package-lock.json' --exclude='package.json' --exclude='/.well-known/private/'
)
rsync -a --delete --delete-excluded "${EXCLUDES[@]}" --exclude='/audio/' "app luật y tế/" _site/
mkdir -p _site/hoc-test
rsync -a --delete --delete-excluded "${EXCLUDES[@]}" hoc-test/ _site/hoc-test/
cp 404.html CNAME _site/
node scripts/verify-pages-stage.mjs
echo "Files: $(find _site -type f | wc -l); size: $(du -sh _site | cut -f1)"
