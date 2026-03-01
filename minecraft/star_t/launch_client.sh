#!/bin/bash
set -e

# Environment variables
STAR_T_CLIENT_DIR="${STAR_T_CLIENT_DIR:?STAR_T_CLIENT_DIR must be set}"

# The mod jar is passed as the first argument by Bazel
MOD_JAR="$1"

echo "Copying mod to client directory..."
cp "$MOD_JAR" "$STAR_T_CLIENT_DIR/mods/"

echo "Launching PrismLauncher..."
prismlauncher --launch 'KomaruBrowser' -s 'localhost:26767' 2>/dev/null
