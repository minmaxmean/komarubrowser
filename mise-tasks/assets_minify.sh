#!/usr/bin/env bash
#MISE description="Minify all JSON files"
#MISE dir="{{config_root}}"

# 1. Reference the environment variables for Mise's cache tracking
#MISE sources=["{{env.json_input_dir}}/*.json"]
#MISE outputs=["{{env.json_output_dir}}/*.json"]

# 2. Define args WITHOUT templates. 
# If not provided on CLI, the shell logic below will handle the defaults.
#USAGE arg "input_dir" env="json_input_dir" help="Source folder"
#USAGE arg "output_dir" env="json_output_dir" help="Destination folder"

set -e

# 3. Use Bash "Parameter Expansion" to set defaults.
# This says: Use the CLI arg if it exists; otherwise use the ENV var; 
# otherwise use a hardcoded fallback string.
input_path="${usage_input_dir?}"
output_path="${usage_output_dir?}"

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
    jq -c . "$file" > "$output_path/${filename%.json}.min.json"
done

echo "Successfully minified ${#files[@]} files."
