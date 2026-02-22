#!/bin/bash

# Configuration
MODS_DIR="./workdata/star_t_server/mods"
OUTPUT_BASE="./workdata/assets"
INGREDIENTS_FILE="./workdata/ingredients.json"

if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed."
    exit 1
fi

SUCCESS_COUNT=0

echo "Reading JAR list from $INGREDIENTS_FILE..."

while IFS= read -r JAR; do
    [ -z "$JAR" ] && continue

    case "$JAR" in
        "thermal_core-1.20.1-11.0.6.24.jar") EXTRACT_JAR="cofh_core-1.20.1-11.0.2.56.jar" ;;
        "server-1.20.1-20230612.114412-srg.jar") EXTRACT_JAR="1.20.1.jar" ;;
        *) EXTRACT_JAR="$JAR" ;;
    esac

    JAR_PATH="$MODS_DIR/$EXTRACT_JAR"
    # Temp dir for extraction
    TEMP_DIR="$OUTPUT_BASE/temp_$JAR"
    # Final flat dir for this jar
    FINAL_DIR="$OUTPUT_BASE/$JAR"

    if [ -f "$JAR_PATH" ]; then
        echo "Processing: $JAR"
        rm -rf "$TEMP_DIR" "$FINAL_DIR"
        mkdir -p "$TEMP_DIR"

        # Extract everything in assets
        echo "  unzipping..."
        unzip -nq "$JAR_PATH" "assets/*/textures/item/**" "assets/*/textures/block/**" -d "$TEMP_DIR" 2>/dev/null
        
        # Check if we got anything
        if [ -d "$TEMP_DIR/assets" ]; then
            # Create the final flat structure: assets/<jar>/<namespace>/<file>.png
            # We look for any png in item or block folders
            echo "  flattenning..."
            find "$TEMP_DIR/assets" -name "*.png" | while read -r PNG_PATH; do
                # Extract namespace from path: assets/<namespace>/textures/...
                NAMESPACE=$(echo "$PNG_PATH" | cut -d'/' -f4)
                FILE_NAME=$(basename "$PNG_PATH")
                
                DEST_DIR="$FINAL_DIR/$NAMESPACE"
                mkdir -p "$DEST_DIR"
                
                # Move and flatten
                mv "$PNG_PATH" "$DEST_DIR/$FILE_NAME"
            done
            
            ((SUCCESS_COUNT++))
            echo "  Flattened assets"
        fi
        rm -rf "$TEMP_DIR"
    fi
done < <(jq -r 'map(.sourceJar) | unique | .[]' "$INGREDIENTS_FILE")

echo -e "\nExtraction and Flattening complete."
