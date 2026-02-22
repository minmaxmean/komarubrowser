#!/bin/bash
# Usage: ./verify_names.sh path/to/your/output.json
FILE="$1"
if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found!"
    exit 1
fi
echo "Scanning '$FILE' for unlocalized display names..."
# jq filters through the array and selects any object whose displayName contains raw translation keys or formatting args
# The '-r' flag outputs raw text instead of JSON strings for readability
BAD_ENTRIES=$(jq -r '.[] | select(.displayName | test("material\\.|tagprefix\\.|item\\.|block\\.|fluid\\.")) | "- \(.id): \(.displayName)"' "$FILE")
if [ -n "$BAD_ENTRIES" ]; then
    echo "❌ Found entries with broken display names:"
    echo "$BAD_ENTRIES"
    
    # Exit with a non-zero status so it can be used in a CI/CD pipeline or build script
    exit 1
fi

SEMI_BAD_ENTRIES=$(jq -r '.[] | select(.displayName | test("%s")) | "- \(.id): \(.displayName)"' "$FILE")
if [ -z "$SEMI_BAD_ENTRIES" ]; then
    echo "✅ Success! No unlocalized display names found."
    exit 0
else
    echo "⚠️ Found entries with non complete display names:"
    echo "$SEMI_BAD_ENTRIES"
    
    # Exit with a non-zero status so it can be used in a CI/CD pipeline or build script
    exit 1
fi

