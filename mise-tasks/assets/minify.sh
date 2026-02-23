#!/usr/bin/env bash
#MISE description="Minify all JSON files"
#MISE dir="{{config_root}}"

#MISE sources=["{{env.raw_assets_dir}}/dump/*.json"]
#MISE outputs=["{{env.assets_dir}}/dump/*.min.json"]
#MISE depends=["assets:manifest"]

set -e

# 3. Use Bash "Parameter Expansion" to set defaults.
# This says: Use the CLI arg if it exists; otherwise use the ENV var; 
# otherwise use a hardcoded fallback string.
input_path="${raw_assets_dir?}/dump"
output_path="${assets_dir?}/dump"

mkdir -p "$output_path"

echo "Looking for JSON files in: $input_path"

# Check if directory exists
if [ ! -d "$input_path" ]; then
    echo "Error: Directory $input_path does not exist."
    exit 1
fi

# Run the loop
# We use nullglob so the loop doesn't run if no files are found
shopt -s nullglob
files=("$input_path"/*.json)

if [ ${#files[@]} -eq 0 ]; then
    echo "No JSON files found in $input_path"
    exit 0
fi

for file in "${files[@]}"; do
    filename=$(basename "$file")
    echo "Minifying $filename..."
    output_file="$output_path/${filename%.json}.min.json"
    jq -c . "$file" > "$output_file"
    echo " minifed to $output_file"
done

echo "Successfully minified ${#files[@]} files."
echo "  Output folder: $output_path"
