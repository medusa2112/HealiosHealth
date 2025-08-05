#!/bin/bash

# Script to rename all images (including screenshots) in attached_assets to healios-health naming convention for SEO

cd attached_assets

# Counter for sequential numbering
counter=1

# Create a list of image files (png, jpg, jpeg, webp, gif, bmp)
# NOW INCLUDING screenshots for SEO benefits, exclude only text files and targeted elements
find . -maxdepth 1 -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" -o -iname "*.gif" -o -iname "*.bmp" \) \
    ! -iname "pasted*" \
    ! -iname "targeted_element*" \
    | sort > /tmp/image_list.txt

# Display what will be renamed
echo "=== PREVIEW: Files to be renamed ==="
while read -r file; do
    if [ -f "$file" ]; then
        # Extract file extension
        extension="${file##*.}"
        new_name="healios-health${counter}.${extension}"
        echo "$(basename "$file") -> $new_name"
        ((counter++))
    fi
done < /tmp/image_list.txt

echo ""
echo "=== Total images to rename: $((counter-1)) ==="
echo ""

# Ask for confirmation
read -p "Do you want to proceed with renaming? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Reset counter
    counter=1
    
    # Actually rename the files
    echo "=== RENAMING FILES ==="
    while read -r file; do
        if [ -f "$file" ]; then
            # Extract file extension
            extension="${file##*.}"
            new_name="healios-health${counter}.${extension}"
            
            # Rename the file
            mv "$file" "$new_name"
            echo "Renamed: $(basename "$file") -> $new_name"
            ((counter++))
        fi
    done < /tmp/image_list.txt
    
    echo ""
    echo "=== COMPLETED: $((counter-1)) files renamed (including screenshots) ==="
    echo "📈 SEO Benefits: All images now have consistent 'healios-health' naming for better search optimization"
else
    echo "Renaming cancelled."
fi

# Clean up
rm -f /tmp/image_list.txt