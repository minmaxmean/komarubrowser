#!/usr/bin/env bash
set -e

OUTPUT_DIR="${1?Error: <output_dir> arg not provided}"

mkdir -p $OUTPUT_DIR

echo "Dumping recipes to $OUTPUT_DIR/recipes.json..."
http ":6767/api/recipes" --sorted --pretty=format > "$OUTPUT_DIR/recipes.json"

echo "Dumping ingredients to $OUTPUT_DIR/ingredients.json..."
http ":7676/api/ingredients" --sorted --pretty=format > "$OUTPUT_DIR/ingredients.json"

echo "Done!"
