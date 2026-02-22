#!/bin/bash

# Configuration
MODS_DIR="./workdata/star_t_server/mods"
OUTPUT_BASE="./workdata/assets"
INGREDIENTS_FILE="./workdata/ingredients.json"

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed."
    exit 1
fi

# Arrays to track results
MISSING_TEXTURES=()
MISSING_JARS=()
SUCCESS_COUNT=0

echo "Reading JAR list from $INGREDIENTS_FILE..."

# Pipe unique JAR names into a while loop to handle spaces
while IFS= read -r JAR; do
    [ -z "$JAR" ] && continue

    JAR_PATH="$MODS_DIR/$JAR"
    TARGET_DIR="$OUTPUT_BASE/$JAR"

    if [ -f "$JAR_PATH" ]; then
        echo "Processing: $JAR"
        rm -rf "$TARGET_DIR"
        mkdir -p "$TARGET_DIR"

        # Extract item and block textures
        # 2>/dev/null suppresses "filename not found" warnings from unzip
        unzip -nq "$JAR_PATH" "assets/*/textures/item/*" "assets/*/textures/block/*" -d "$TARGET_DIR" 2>/dev/null
        
        # Check if the assets folder exists and is not empty
        if [ -d "$TARGET_DIR/assets" ]; then
            ((SUCCESS_COUNT++))
        else
            MISSING_TEXTURES+=("$JAR")
            rm -rf "$TARGET_DIR"
        fi
    else
        MISSING_JARS+=("$JAR")
    fi
done < <(jq -r 'map(.sourceJar) | unique | .[]' "$INGREDIENTS_FILE")

# Summary Report
echo -e "\n--- Extraction Summary ---"
echo "Successfully extracted from: $SUCCESS_COUNT jars"

if [ ${#MISSING_TEXTURES[@]} -ne 0 ]; then
    echo -e "\n[!] No static item/block textures found in (${#MISSING_TEXTURES[@]}):"
    for mod in "${MISSING_TEXTURES[@]}"; do
        echo "  - $mod"
    done
fi

if [ ${#MISSING_JARS[@]} -ne 0 ]; then
    echo -e "\n[!] JAR files not found in $MODS_DIR (${#MISSING_JARS[@]}):"
    for jar in "${MISSING_JARS[@]}"; do
        echo "  - $jar"
    done
fi

echo -e "\nAssets stored in $OUTPUT_BASE"
