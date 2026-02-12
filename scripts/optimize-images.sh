#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TÉFA Image Optimization Script
# Converts all PNG/JPG images to WebP format and generates
# responsive sizes for different device types.
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites:
#   brew install webp imagemagick
#
# Usage:
#   chmod +x scripts/optimize-images.sh
#   ./scripts/optimize-images.sh
#
# ═══════════════════════════════════════════════════════════════

set -e

ASSETS_DIR="public/assets"
QUALITY=80
SIZES=(400 800 1200 1920)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TÉFA Image Optimization Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check for required tools
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}Error: cwebp not found. Install with: brew install webp${NC}"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}Warning: ImageMagick not found. Responsive sizes will be skipped.${NC}"
    echo -e "${YELLOW}Install with: brew install imagemagick${NC}"
    HAS_MAGICK=false
else
    HAS_MAGICK=true
fi

# Track stats
TOTAL_ORIGINAL=0
TOTAL_OPTIMIZED=0
FILE_COUNT=0

echo -e "${GREEN}[1/3] Converting images to WebP format...${NC}"
echo ""

# Find all PNG and JPG files
find "$ASSETS_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r file; do
    BASENAME="${file%.*}"
    EXT="${file##*.}"
    WEBP_FILE="${BASENAME}.webp"

    # Skip if WebP already exists and is newer
    if [ -f "$WEBP_FILE" ] && [ "$WEBP_FILE" -nt "$file" ]; then
        echo -e "  ${YELLOW}SKIP${NC} $file (WebP exists)"
        continue
    fi

    # Get original size
    ORIG_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    ORIG_KB=$((ORIG_SIZE / 1024))

    # Convert to WebP
    cwebp -q "$QUALITY" "$file" -o "$WEBP_FILE" 2>/dev/null

    # Get new size
    NEW_SIZE=$(stat -f%z "$WEBP_FILE" 2>/dev/null || stat -c%s "$WEBP_FILE" 2>/dev/null)
    NEW_KB=$((NEW_SIZE / 1024))

    # Calculate savings
    if [ "$ORIG_SIZE" -gt 0 ]; then
        SAVINGS=$(( (ORIG_SIZE - NEW_SIZE) * 100 / ORIG_SIZE ))
    else
        SAVINGS=0
    fi

    echo -e "  ${GREEN}DONE${NC} $file: ${ORIG_KB}KB → ${NEW_KB}KB (${SAVINGS}% smaller)"

    FILE_COUNT=$((FILE_COUNT + 1))
done

echo ""
echo -e "${GREEN}[2/3] Generating responsive image sizes...${NC}"
echo ""

if [ "$HAS_MAGICK" = true ]; then
    # Generate responsive sizes for hero and category images
    for dir in "Hero" "categories"; do
        FULL_DIR="$ASSETS_DIR/$dir"
        if [ ! -d "$FULL_DIR" ]; then
            continue
        fi

        find "$FULL_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r file; do
            BASENAME="${file%.*}"
            EXT="${file##*.}"

            for SIZE in "${SIZES[@]}"; do
                RESIZED="${BASENAME}-${SIZE}w.webp"

                # Skip if already exists
                if [ -f "$RESIZED" ] && [ "$RESIZED" -nt "$file" ]; then
                    continue
                fi

                # Get original width
                ORIG_WIDTH=$(identify -format "%w" "$file" 2>/dev/null)

                # Only create if the target size is smaller than original
                if [ -n "$ORIG_WIDTH" ] && [ "$ORIG_WIDTH" -gt "$SIZE" ]; then
                    convert "$file" -resize "${SIZE}x" -quality "$QUALITY" "$RESIZED" 2>/dev/null
                    NEW_SIZE=$(stat -f%z "$RESIZED" 2>/dev/null || stat -c%s "$RESIZED" 2>/dev/null)
                    NEW_KB=$((NEW_SIZE / 1024))
                    echo -e "  ${GREEN}DONE${NC} ${RESIZED}: ${NEW_KB}KB (${SIZE}w)"
                fi
            done
        done
    done
else
    echo -e "  ${YELLOW}Skipped (ImageMagick not installed)${NC}"
fi

echo ""
echo -e "${GREEN}[3/3] Identifying duplicate images...${NC}"
echo ""

# Check for duplicate hero images (both PNG and JPG versions)
for png_file in "$ASSETS_DIR"/Hero/*.png; do
    if [ ! -f "$png_file" ]; then
        continue
    fi

    BASENAME=$(basename "${png_file%.*}")
    JPG_FILE="$ASSETS_DIR/Hero/${BASENAME}.jpg"

    if [ -f "$JPG_FILE" ]; then
        PNG_SIZE=$(stat -f%z "$png_file" 2>/dev/null || stat -c%s "$png_file" 2>/dev/null)
        JPG_SIZE=$(stat -f%z "$JPG_FILE" 2>/dev/null || stat -c%s "$JPG_FILE" 2>/dev/null)
        PNG_KB=$((PNG_SIZE / 1024))
        JPG_KB=$((JPG_SIZE / 1024))

        echo -e "  ${YELLOW}DUPLICATE${NC} $BASENAME"
        echo -e "    PNG: ${PNG_KB}KB | JPG: ${JPG_KB}KB"

        if [ "$JPG_SIZE" -lt "$PNG_SIZE" ]; then
            echo -e "    ${BLUE}→ Recommend keeping .jpg (smaller)${NC}"
            echo -e "    ${RED}→ Safe to delete: ${png_file}${NC}"
        else
            echo -e "    ${BLUE}→ Recommend keeping .png (smaller)${NC}"
            echo -e "    ${RED}→ Safe to delete: ${JPG_FILE}${NC}"
        fi
        echo ""
    fi
done

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Done! Review the output above.${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Delete the larger duplicate hero images (PNG versions)"
echo -e "  2. Update image references in code to use .webp versions"
echo -e "  3. Run ${YELLOW}npm run build${NC} to verify everything works"
echo -e "  4. Deploy to Vercel"
