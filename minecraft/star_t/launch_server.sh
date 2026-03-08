#!/bin/bash
set -e

# 1. Handle the Mod Jar (this remains in the Bazel sandbox)
MOD_JAR_SANDBOX="${1?Error: MOD_JAR not provided}"
# Convert relative sandbox path to absolute path
MOD_JAR_ABS=$(realpath "$MOD_JAR_SANDBOX")

# 2. Locate the real server_data directory
# $BUILD_WORKSPACE_DIRECTORY is provided by 'bazel run'
if [ -z "$BUILD_WORKSPACE_DIRECTORY" ]; then
  echo "Error: This script must be run via 'bazel run'"
  exit 1
fi

# Adjust this path to match the actual path from your workspace root
STAR_T_SERVER_DIR="$BUILD_WORKSPACE_DIRECTORY/minecraft/star_t/server_data"

echo "Workspace Root: $BUILD_WORKSPACE_DIRECTORY"
echo "Server Directory: $STAR_T_SERVER_DIR"

# 3. Deploy the mod to the real server folder
echo "Updating mod jar..."
rm -f "$STAR_T_SERVER_DIR/mods/"komarubrowser-*.jar
cp "$MOD_JAR_ABS" "$STAR_T_SERVER_DIR/mods/."

# 4. Launch
cd "$STAR_T_SERVER_DIR"
echo "Launching Star Technology server in place..."
./run.sh --nogui --port 26767
