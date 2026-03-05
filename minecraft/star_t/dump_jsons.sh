#!/usr/bin/env bash
set -e

export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"

if ! command -v http &> /dev/null; then
    echo "Error: 'http' (HTTPie) could not be found."
    exit 1
fi

OUTPUT_DIR="${1?Error: <output_dir> arg not provided}"
mkdir -p "$OUTPUT_DIR"

# Function to safely fetch and save
fetch_api() {
    local url=$1
    local dest=$2
    
    echo "Dumping to $dest..."
    # 1. Capture output to a variable. 
    # 2. --check-status ensures httpie exits with non-zero on 4xx/5xx errors.
    if response=$(http --check-status --sorted --pretty=format "$url"); then
        echo "$response" > "$dest"
        echo "  Done."
    else
        echo "  Error: Failed to fetch $url" >&2
        echo "  $response"
        return 1
    fi
}

fetch_api ":6767/api/recipes" "$OUTPUT_DIR/recipes.json"
fetch_api ":6767/api/recipeCategories" "$OUTPUT_DIR/recipeCategories.json"
fetch_api ":7676/api/ingredients" "$OUTPUT_DIR/ingredients.json"
