#!/bin/bash

# Find all .js files in the current directory and subdirectories
find . -type f -name "*.js" | while read -r file; do
    # Rename the file by changing the extension to .jsx
    # echo "$file"
    mv "$file" "${file%.js}.jsx"
done

echo "Conversion from .js to .jsx completed."
