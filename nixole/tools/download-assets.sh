#!/usr/bin/env bash
# Fetches the nine production assets into src/assets/, replacing the local
# stand-ins produced by generate-placeholder-assets.py.
#
# Run this from a network that can reach qclay.design. It is blocked by the
# egress policy of the sandbox this project was built in.
set -euo pipefail

BASE="https://qclay.design/lovable/nixole"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/assets"
mkdir -p "$DEST"

FILES=(
  main-logo.svg
  nixole-logo.svg
  browser-mockup.png
  nurse-video.mp4
  nutanix-avatar.svg
  frame-207.svg
  programming-arrow.svg
  upside-logo.svg
  nurse-icon.svg
)

for f in "${FILES[@]}"; do
  echo "→ $f"
  curl -fsSL "$BASE/$f" -o "$DEST/$f"
done

echo "Done. ${#FILES[@]} assets written to $DEST"
