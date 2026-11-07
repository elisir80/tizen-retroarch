# Initial validation

[English](VALIDATION.md) | [Italiano](VERIFICHE.md)

## November 7, 2026 — publication copy

- `tools/fetch-sources.sh`: downloaded the five repositories at the specified commits and applied the three local patches.
- `tools/build-compat.sh`: built all three compatibility JS/Wasm pairs with Emscripten 3.1.46.
- `tools/build-audioworklet.sh all`: built all six AudioWorklet JS/Wasm pairs with Emscripten 4.0.15, including the optimized SNES and C64 variants.
- `tools/package-tv.sh`: generated a locally signed WGT using a personal profile. Checked the manifest, interface, and presence of all nine core pairs. Neither the package nor the certificate is published.
- Node input and profile tests passed; JavaScript, Python, Bash, and XML syntax checks passed.
- ROM server: checked the health response, listing a subfolder containing a test file, downloading that file, and rejecting a traversal attempt.
- Desktop preview: loaded a small locally generated NES test ROM and observed the NES AudioWorklet core and an active canvas. This is a smoke test, not an audio or performance measurement.

Screenshots were captured from the desktop preview. The earlier development version 0.3.30 was installed on a Samsung UE65DU7172; the **new build produced from the public checkout has not yet been installed or tested on a TV**. Performance, audio, C64/SNES, physical controllers, Bluetooth DualShock 4, and BASIC sessions must be revalidated with the new build on real hardware.
