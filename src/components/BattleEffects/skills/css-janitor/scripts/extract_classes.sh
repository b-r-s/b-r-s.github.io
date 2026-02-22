#!/bin/bash
# Optimized for: /src/components/[ComponentName]/ folders
# Logic: Checks .css against .tsx in the same folder

REPORT_FILE="unused_css_report.txt"

# Clear/Initialize the report file
echo "VANILLA CSS AUDIT: $(date)" > "$REPORT_FILE"
echo "Target Directory: ./src/components" >> "$REPORT_FILE"
echo "------------------------------------------" >> "$REPORT_FILE"

echo "Starting audit of /src/components..."

# Only find .css files within the components sub-directory
find ./src/components -name "*.css" | while read -r css_file; do
  folder=$(dirname "$css_file")
  component_name=$(basename "$folder")
  
  # Extract unique class names from the CSS file
  classes=$(grep -ohPo '(?<=\.)[a-zA-Z0-9_-]+(?=[\s,{:])' "$css_file" | sort | uniq)

  for class in $classes; do
    # Search for the class ONLY in .tsx files within that specific component folder
    if ! grep -q "$class" "$folder"/*.tsx; then
      # Print to console for AI and append to the report file
      echo "[$component_name] Unused class: .$class" | tee -a "$REPORT_FILE"
    fi
  done
done

echo "------------------------------------------"
echo "Audit Complete. Summary saved to $REPORT_FILE"