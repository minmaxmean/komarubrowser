#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"

echo "=== Building //ts/web:build_pkg ==="
cd "$REPO_ROOT"
bazel build //ts/web:build_pkg

TAR_PATH="bazel-bin/ts/web/build_pkg.tar"
if [[ ! -f "$TAR_PATH" ]]; then
    echo "Error: Build output not found at $TAR_PATH"
    exit 1
fi

echo "=== Extracting build to temporary directory ==="
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT
tar -xf "$TAR_PATH" -C "$TMP_DIR"

DIST_DIR="$TMP_DIR/dist"
if [[ ! -d "$DIST_DIR" ]]; then
    echo "Error: dist directory not found in tar. Contents:"
    ls -la "$TMP_DIR"
    exit 1
fi

echo "=== Switching to gh-pages branch ==="
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
fi

echo "=== Clearing old content ==="
git rm -rf .

echo "=== Copying new content ==="
cp -r "$DIST_DIR"/* .
git add .

echo "=== Committing ==="
COMMIT_MSG="Deploy to GitHub Pages $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
git commit -m "$COMMIT_MSG"

echo "=== Pushing to origin/gh-pages ==="
git push -u origin gh-pages

echo "=== Switching back to $CURRENT_BRANCH ==="
git checkout "$CURRENT_BRANCH"

echo "=== Done! ==="
echo "Your site should be available at: https://minmaxmean.github.io/komarubrowser/"
