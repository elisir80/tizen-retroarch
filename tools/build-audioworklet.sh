#!/bin/bash
set -eo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source "$project_dir/.emsdk-worklet/emsdk_env.sh"
mkdir -p "$project_dir/build/worklet-4.0.15-src" "$project_dir/wasm/worklet"

build_core() {
  local source_name="$1" makefile="$2" core="$3"
  local core_dir="$project_dir/build/worklet-4.0.15-src/$source_name"
  mkdir -p "$core_dir"
  rsync -a --exclude='.git' --exclude='*.o' --exclude='*.bc' --exclude='*.a' \
    "$project_dir/vendor/$source_name/" "$core_dir/"
  (
    cd "$core_dir"
    emmake make -f "$makefile" platform=emscripten \
      CC='emcc -pthread' CXX='em++ -pthread' AR=emar -j4
  )
  (
    cd "$project_dir/vendor/RetroArch"
    cp "$core_dir/${core}_libretro_emscripten.bc" "$core_dir/${core}_libretro_emscripten.a"
    emmake make -f Makefile.emscripten -o mv_libretro LIBRETRO="$core" \
      libretro_new="$core_dir/${core}_libretro_emscripten.a" \
      TARGET="$project_dir/wasm/worklet/${core}_libretro.js" \
      OBJDIR=obj-emscripten-worklet-4.0.15 HAVE_THREADS=1 HAVE_AUDIOWORKLET=1 \
      HAVE_RWEBAUDIO=1 PTHREAD_POOL_SIZE=0 \
      EXTRA_EXPORTED_FUNCTIONS=,_audio_driver_get_underruns,_audio_driver_get_buffer_latency_ms -j4
  )
}

build_snes() {
  build_core libretro-snes9x2010 Makefile snes9x2010
  local variant core
  for variant in 2005-fast 2005-plus; do
    bash "$project_dir/tools/build-snes-candidate.sh" "$variant"
    if [[ "$variant" == 2005-fast ]]; then core=snes9x2005; else core=snes9x2005_plus; fi
    cp "$project_dir/build/snes-candidates/$variant/${core}_libretro.js" \
       "$project_dir/build/snes-candidates/$variant/${core}_libretro.wasm" "$project_dir/wasm/worklet/"
  done
}

build_c64() {
  build_core vice-libretro Makefile vice_x64
  bash "$project_dir/tools/build-c64-candidate.sh"
  cp "$project_dir/build/c64-candidates/o3-lto-simd/vice_x64_fast_libretro.js" \
     "$project_dir/build/c64-candidates/o3-lto-simd/vice_x64_fast_libretro.wasm" \
     "$project_dir/wasm/worklet/"
}

case "${1:-all}" in
  nes) build_core libretro-fceumm Makefile.libretro fceumm ;;
  snes) build_snes ;;
  c64) build_c64 ;;
  all)
    build_core libretro-fceumm Makefile.libretro fceumm
    build_snes
    build_c64
    ;;
  *) echo 'Usage: bash tools/build-audioworklet.sh [nes|snes|c64|all]' >&2; exit 2 ;;
esac
