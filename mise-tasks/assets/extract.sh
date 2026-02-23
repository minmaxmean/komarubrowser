#!/usr/bin/env bash
#MISE description="Exctracrt assets from Jar mods"
#MISE dir="{{config_root}}"

#MISE sources=["{{env.raw_assets_dir}}/dump/ingredients.json"]
#MISE outputs=["{{env.assets_dir}}/extracted"]

set -e 

# Configuration
MODS_DIR="$star_t_dir/mods"
INGREDIENTS_FILE="$raw_assets_dir/dump/ingredients.json"
OUTPUT_BASE="$assets_dir/extracted"

if ! command -v jq &> /dev/null; then
  echo "Error: 'jq' is not installed."
  exit 1
fi

SUCCESS_COUNT=0
echo "Reading JAR list from $INGREDIENTS_FILE..."

# Get absolute path for output
mkdir -p "$OUTPUT_BASE"
ABS_OUTPUT_BASE=$(cd "$OUTPUT_BASE" && pwd)

jq -r 'map(.sourceJar) | unique | .[]' "$INGREDIENTS_FILE" | while IFS= read -r JAR; do
  [ -z "$JAR" ] && continue

  case "$JAR" in
    "thermal_core-1.20.1-11.0.6.24.jar") EXTRACT_JAR="cofh_core-1.20.1-11.0.2.56.jar" ;;
    "server-1.20.1-20230612.114412-srg.jar") EXTRACT_JAR="1.20.1.jar" ;;
    *) EXTRACT_JAR="$JAR" ;;
  esac

  JAR_PATH="$MODS_DIR/$EXTRACT_JAR"
  TEMP_DIR="$ABS_OUTPUT_BASE/temp_$JAR"
  FINAL_DIR="$ABS_OUTPUT_BASE/$JAR"

  if [ -f "$JAR_PATH" ]; then
    echo "Processing: $JAR"
    rm -rf "$TEMP_DIR" "$FINAL_DIR"
    mkdir -p "$TEMP_DIR"

    # Extract PNGs
    echo "  unzipping: $JAR_PATH"
    unzip -nq "$JAR_PATH" 'assets/*/textures/item/*.png' 'assets/*/textures/block/*.png' -d "$TEMP_DIR" 2>/dev/null || [ $? -eq 11 ]
    
    if [ -d "$TEMP_DIR/assets" ]; then
      # Walk through each namespace
      for NS_PATH in "$TEMP_DIR/assets"/*; do
        [ ! -d "$NS_PATH" ] && continue
        NAMESPACE=$(basename "$NS_PATH")
        
        # We want to preserve 'item' and 'block' categories
        for TYPE in item block; do
          TYPE_PATH="$NS_PATH/textures/$TYPE"
          if [ -d "$TYPE_PATH" ]; then
            DEST_DIR="$FINAL_DIR/$NAMESPACE/$TYPE"
            mkdir -p "$DEST_DIR"
            
            # Move all PNGs from any subfolder into the flat TYPE folder
            echo "  moving: $TYPE_PATH"
            find "$TYPE_PATH" -name "*.png" -type f -exec cp -f {} "$DEST_DIR/" ';'
          fi
        done
      done
      ((SUCCESS_COUNT++))
      # break
    fi
    rm -rf "$TEMP_DIR"
  else
    echo "Warning: JAR not found: $JAR_PATH"
  fi
done

echo "===================="
echo "Extraction complete. Assets stored in $OUTPUT_BASE"
