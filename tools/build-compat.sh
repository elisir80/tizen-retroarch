#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source "$project_dir/.emsdk/emsdk_env.sh"
mkdir -p "$project_dir/build/standard-src" "$project_dir/wasm"

build_core() {
  local source_name="$1" makefile="$2" core="$3" extras="${4:-}"
  local core_dir="$project_dir/build/standard-src/$source_name"
  mkdir -p "$core_dir"
  rsync -a --exclude='.git' --exclude='*.o' --exclude='*.bc' --exclude='*.a' \
    "$project_dir/vendor/$source_name/" "$core_dir/"
  (cd "$core_dir" && emmake make -f "$makefile" platform=emscripten -j4)
  cp "$core_dir/${core}_libretro_emscripten.bc" "$core_dir/${core}_libretro_emscripten.a"
  (cd "$project_dir/vendor/RetroArch" && emmake make -f Makefile.emscripten -o mv_libretro \
    LIBRETRO="$core" libretro_new="$core_dir/${core}_libretro_emscripten.a" \
    TARGET="$project_dir/wasm/${core}_libretro.js" OBJDIR=obj-emscripten-standard \
    HAVE_THREADS=0 HAVE_AUDIOWORKLET=0 HAVE_RWEBAUDIO=1 \
    EXTRA_EXPORTED_FUNCTIONS="$extras" -j4)
}
build_core libretro-fceumm Makefile.libretro fceumm
build_core libretro-snes9x2010 Makefile snes9x2010
build_core vice-libretro Makefile vice_x64 ',_c64_inject_return'
