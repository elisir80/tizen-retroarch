#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
if [[ $# -ne 1 ]]; then
  echo "Usage: bash tools/package-tv.sh 'YOUR_SAMSUNG_CERTIFICATE_PROFILE'" >&2
  exit 2
fi
command -v tz >/dev/null || { echo 'Add the Tizen tz CLI to PATH.' >&2; exit 1; }
for name in fceumm snes9x2010 vice_x64; do
  for ext in js wasm; do
    [[ -f "$project_dir/wasm/${name}_libretro.$ext" ]] || { echo "Missing compatibility core: $name.$ext" >&2; exit 1; }
  done
done
for name in fceumm snes9x2010 snes9x2005 snes9x2005_plus vice_x64 vice_x64_fast; do
  for ext in js wasm; do
    [[ -f "$project_dir/wasm/worklet/${name}_libretro.$ext" ]] || { echo "Missing AudioWorklet core: $name.$ext" >&2; exit 1; }
  done
done
stage="$project_dir/build/wgt"
mkdir -p "$stage/wasm" "$stage/docs"
cp "$project_dir"/{README.md,LICENSE,COPYING.RetroArch,LICENSES.md,LICENSES.it.md,config.xml,index.html,joypad-input.js,main.js,style.css,icon.png,tizen_web_project.yaml} "$stage/"
cp "$project_dir"/docs/{LEGAL.md,ASPETTI-LEGALI.md} "$stage/docs/"
rsync -a "$project_dir/wasm/" "$stage/wasm/"
tz pack "$stage" -t wgt -s "$1"
cp "$stage/Debug/wgt.wgt" "$project_dir/build/RetroArch.wgt"
echo "Signed package: $project_dir/build/RetroArch.wgt"
