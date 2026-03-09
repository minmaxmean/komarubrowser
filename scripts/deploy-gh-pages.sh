#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd $SCRIPT_DIR/.. && pwd)"

echo "=== Building //ts/web:build_pkg ==="
cd "$REPO_ROOT"
pnpm install
bazel build //ts/web:build_pkg

TAR_PATH="bazel-bin/ts/web/build_pkg.tar"
if [[ ! -f "$TAR_PATH" ]]; then
    echo "Error: Build output not found at $TAR_PATH"
    exit 1
fi

echo "=== Setting up tmp JJ workspace ==="
TMP_DIR=$(mktemp -d)
DIST_DIR="$TMP_DIR/dist"


echo "DIST_DIR: $DIST_DIR"
jj workspace forget gh-pages
jj workspace add --name gh-pages -r gh-pages "$DIST_DIR"
jj workspace list

echo "=== Extracting build to temporary directory ==="
tar -xf "$TAR_PATH" -C "$TMP_DIR"

if [[ ! -d "$DIST_DIR" ]]; then
    echo "Error: dist directory not found in tar. Contents:"
    ls -la "$TMP_DIR"
    exit 1
fi

echo "=== Committing ==="
cd "$DIST_DIR"
echo $PWD
COMMIT_MSG="Deploy to GitHub Pages $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
jj file track --include-ignored assets/
jj commit -m "$COMMIT_MSG"
jj bookmark move gh-pages --to @-

echo "=== Pushing to origin/gh-pages ==="
jj git push -b gh-pages

echo "=== Done! ==="
echo "Your site should be available at: https://minmaxmean.github.io/komarubrowser/"

jj workspace forget gh-pages
rm -rf $TMP_DIR
