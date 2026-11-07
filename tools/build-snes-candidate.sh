#!/bin/bash
# Isolated SNES experiments; never overwrite the accepted NES binaries.
set -eo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source "$project_dir/.emsdk-worklet/emsdk_env.sh"
variant="${1:-2010-simd}"
case "$variant" in
  2010-simd|2010-sse2) source_name=libretro-snes9x2010; core=snes9x2010; extra=() ;;
  2005-plus) source_name=libretro-snes9x2005; core=snes9x2005_plus; extra=(USE_BLARGG_APU=1) ;;
  2005-fast) source_name=libretro-snes9x2005; core=snes9x2005; extra=(USE_BLARGG_APU=0) ;;
  *) echo "Usage: $0 [2010-simd|2010-sse2|2005-plus|2005-fast]" >&2; exit 2 ;;
esac
simd_flags='-msimd128'
if [[ "$variant" == 2010-sse2 ]]; then simd_flags+=' -msse2'; fi
candidate_dir="$project_dir/build/snes-candidates/$variant"
source_dir="$candidate_dir/source"
mkdir -p "$source_dir"
rsync -a --exclude='.git' --exclude='*.o' --exclude='*.bc' --exclude='*.a' \
  "$project_dir/vendor/$source_name/" "$source_dir/"
(
  cd "$source_dir"
  emmake make platform=emscripten CC="emcc -pthread -flto $simd_flags" CXX="em++ -pthread -flto $simd_flags" \
    AR=emar LTO="-flto -O3 $simd_flags" "${extra[@]}" -j4
)
cp "$source_dir/${core}_libretro_emscripten.bc" "$source_dir/${core}_libretro_emscripten.a"
(
  cd "$project_dir/vendor/RetroArch"
  EMCC_CFLAGS='-msimd128 --emit-symbol-map' emmake make -f Makefile.emscripten -o mv_libretro \
    LIBRETRO="$core" libretro_new="$source_dir/${core}_libretro_emscripten.a" \
    TARGET="$candidate_dir/${core}_libretro.js" \
    OBJDIR=obj-emscripten-worklet-4.0.15 HAVE_THREADS=1 HAVE_AUDIOWORKLET=1 \
    HAVE_RWEBAUDIO=1 PTHREAD_POOL_SIZE=0 LTO=1 \
    EXTRA_EXPORTED_FUNCTIONS=,_audio_driver_get_underruns,_audio_driver_get_buffer_latency_ms,_video_driver_get_frame_count -j4
)
