#!/usr/bin/env bash
set -e # Stop the script immediately if any command fails

# Define paths
# Note: Double check if this should be "../workdata/..." instead of "/workdata/..."
SERVER_DIR="${MISE_PROJECT_ROOT}/workdata/star_t_server"
MOD_ID="komarubrowser"

echo "🧹 Removing old mod versions from the server..."
echo "rm -f $SERVER_DIR/mods/${MOD_ID}*.jar"
rm -f "$SERVER_DIR/mods/${MOD_ID}"*.jar

echo "📦 Copying the new mod jar..."
# Copies the newly built jar to the server's mods folder (ignoring source/api jars if they exist)
find "${MISE_PROJECT_ROOT}"/forgemod/build/libs -maxdepth 1 -name "${MOD_ID}*.jar" ! -name "*-sources.jar" -exec cp {} "$SERVER_DIR/mods/" \;
