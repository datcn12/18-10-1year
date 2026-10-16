#!/usr/bin/env bash
# Converts every photo (HEIC/PNG/WEBP/JPG) under assets/photos to a lowercase .jpg, max 1600px long edge,
# ~80% quality, under 400 KB.
# GitHub Pages is case-sensitive and HEIC does not render in Chrome/Android, hence the conversion.
# Replaced originals are moved to assets/photos/.originals (git-ignored), never deleted.
# Finally strips GPS location from every photo, since the repo is public (needs swift, Xcode command line tools).
set -euo pipefail

cd "$(dirname "$0")/.."
root="assets/photos"
backup="$root/.originals"
max_edge=1600
max_kb=400
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

kb() { echo $(( $(stat -f %z "$1") / 1024 )); }

# encode <src> <quality> <long edge> <out>. sips -Z also upscales, so only resize photos that are bigger.
encode() {
  if (( long > $3 )); then
    sips -s format jpeg -s formatOptions "$2" -Z "$3" "$1" --out "$4" >/dev/null
  else
    sips -s format jpeg -s formatOptions "$2" "$1" --out "$4" >/dev/null
  fi
}

find "$root" -path "$backup" -prune -o -type f \( -iname '*.heic' -o -iname '*.heif' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0 |
while IFS= read -r -d '' src; do
  [[ -f "$src" ]] || continue
  dir=$(dirname "$src")
  base=$(basename "$src")
  name=$(printf '%s' "${base%.*}" | tr '[:upper:]' '[:lower:]')
  out="$dir/$name.jpg"
  long=$(sips -g pixelWidth -g pixelHeight "$src" | awk '/pixel/ && $2 > max { max = $2 } END { print max }')

  if [[ "$src" == "$out" ]] && (( long <= max_edge )) && (( $(kb "$src") <= max_kb )); then
    echo "ok    $out ($(kb "$out") KB)"
    continue
  fi

  # Lower the quality first; very detailed photos (branches, foliage) also get a smaller size.
  for step in "$max_edge:80" "$max_edge:70" "$max_edge:60" 1280:60 1024:60; do
    encode "$src" "${step#*:}" "${step%:*}" "$work/out.jpg"
    if (( $(kb "$work/out.jpg") <= max_kb )); then break; fi
  done

  keep="$backup${dir#"$root"}"
  mkdir -p "$keep"
  if [[ -e "$out" && ! "$src" -ef "$out" ]]; then
    mv -f "$out" "$keep/"
  fi
  mv -f "$src" "$keep/"
  mv "$work/out.jpg" "$out"
  echo "done  $out ($(kb "$out") KB)"
done

if command -v swift >/dev/null; then
  find "$root" -path "$backup" -prune -o -type f -name '*.jpg' -print0 | xargs -0 swift scripts/strip-gps.swift
  echo "gps   location removed from all photos"
else
  echo "warning: swift (Xcode command line tools) not found, GPS location was NOT removed" >&2
fi
