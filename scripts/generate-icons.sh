#!/bin/bash
# generates app icons from svg
# needs imagemagick: sudo apt install imagemagick

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ICONS_DIR="$SCRIPT_DIR/../assets/icons"
SVG="$ICONS_DIR/icon.svg"

sizes=(16 32 48 64 128 256 512)

for size in "${sizes[@]}"; do
  convert -background none -resize ${size}x${size} "$SVG" "$ICONS_DIR/icon-${size}x${size}.png"
  echo "created icon-${size}x${size}.png"
done

# also create icon.png (256x256 default)
cp "$ICONS_DIR/icon-256x256.png" "$ICONS_DIR/icon.png"
echo "done generating icons"

