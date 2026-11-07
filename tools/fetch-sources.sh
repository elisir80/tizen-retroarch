#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$project_dir/vendor"

fetch() {
  local name="$1" url="$2" commit="$3" patch="${4:-}"
  local destination="$project_dir/vendor/$name"
  if [[ -e "$destination" ]]; then
    echo "Refusing to overwrite existing $destination. Move it aside before fetching." >&2
    exit 1
  fi
  git clone --filter=blob:none --no-checkout "$url" "$destination"
  git -C "$destination" checkout --detach "$commit"
  if [[ -n "$patch" ]]; then
    git -C "$destination" apply --check "$project_dir/patches/$patch"
    git -C "$destination" apply "$project_dir/patches/$patch"
  fi
}

fetch RetroArch https://github.com/libretro/RetroArch.git ca82e0c6970ed1e7e4186e6a6c051c731007111b retroarch.patch
fetch libretro-fceumm https://github.com/libretro/libretro-fceumm.git 7a542dab1e87679921962a9f056186eca425c0c2 fceumm.patch
fetch libretro-snes9x2005 https://github.com/libretro/snes9x2005.git a79dfe9047e7fec58808aefe48ad2bf499c7af11
fetch libretro-snes9x2010 https://github.com/libretro/snes9x2010.git fe690dd321fa5a46b5234a2bde089d2518c62b0e
fetch vice-libretro https://github.com/libretro/vice-libretro.git f63b56688f3133a2bb17499db9eebb7ab81df5f5 vice.patch
echo 'Pinned sources and local patches are ready.'
