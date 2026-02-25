#!/usr/bin/env bash
set -e

if [ -z "$star_t_data_dir" ]; then
  echo "Error: star_t_data_dir environment variable is not set"
  exit 1
fi
if [ ! -d "$star_t_data_dir" ] || [ -z "$(ls -A "$star_t_data_dir")" ]; then
  echo "Error: star_t_data_dir is empty or doesn't exist"
  exit 1
fi

if [ -z "$dumps_from_mod_dir" ]; then
  echo "Error: dumps_from_mod_dir environment variable is not set"
  exit 1
fi

OUTPUT_DIR="$dumps_from_mod_dir"
mkdir -p $OUTPUT_DIR

LOG_FILE="/tmp/komaru/star_t.log"

echo "Dumping recipes to $OUTPUT_DIR/recipes.json..."
http ":6767/api/recipes" --sorted --pretty=format > "$OUTPUT_DIR/recipes.json"

echo "Dumping ingredients to $OUTPUT_DIR/ingredients.json..."
http ":7676/api/ingredients" --sorted --pretty=format > "$OUTPUT_DIR/ingredients.json"

echo "Done!"
