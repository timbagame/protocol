#!/usr/bin/env bash
set -euo pipefail

# Resolve the current main branch, not the release's user-supplied target label.
git fetch --no-tags origin +refs/heads/main:refs/remotes/origin/main
if ! git merge-base --is-ancestor HEAD refs/remotes/origin/main; then
  echo "Release commit must be merged into main before publishing." >&2
  exit 1
fi
