#!/bin/bash
# Isolated C64 build; never overwrite the accepted NES/SNES binaries.
set -eo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source "$project_dir/.emsdk-worklet/emsdk_env.sh"
candidate_dir="$project_dir/build/c64-candidates/o3-lto-simd"
source_dir="$candidate_dir/source"
mkdir -p "$source_dir"
rsync -a --exclude='.git' --exclude='*.o' --exclude='*.bc' --exclude='*.a' \
  "$project_dir/vendor/vice-libretro/" "$source_dir/"
(
  cd "$source_dir"
  emmake make -f Makefile platform=emscripten \
    CC='emcc -pthread -flto -msimd128' \
    CXX='em++ -pthread -flto -msimd128' AR=emar -j4
)
cp "$source_dir/vice_x64_libretro_emscripten.bc" \
  "$source_dir/vice_x64_libretro_emscripten.a"
(
  cd "$project_dir/vendor/RetroArch"
  EMCC_CFLAGS='-msimd128 --emit-symbol-map' \
    emmake make -f Makefile.emscripten -o mv_libretro \
      LIBRETRO=vice_x64 \
      libretro_new="$source_dir/vice_x64_libretro_emscripten.a" \
      TARGET="$candidate_dir/vice_x64_fast_libretro.js" \
      OBJDIR=obj-emscripten-worklet-4.0.15 \
      HAVE_THREADS=1 HAVE_AUDIOWORKLET=1 HAVE_RWEBAUDIO=1 \
      PTHREAD_POOL_SIZE=0 LTO=1 \
      EXTRA_EXPORTED_FUNCTIONS=,_audio_driver_get_underruns,_audio_driver_get_buffer_latency_ms,_c64_inject_return \
      -j4
)
