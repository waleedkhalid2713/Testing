#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/waleedkhalid2713/friendly-greetings.git"

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "main" ]]; then
  echo "Switching to main branch..."
  git checkout -B main
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Origin remote already set."
else
  echo "Adding origin remote: $REPO_URL"
  git remote add origin "$REPO_URL"
fi

echo "Current git status:"
git status -sb

echo "Remotes:"
git remote -v
