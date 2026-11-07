import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Stub only the browser/emulator boundary; execute the actual app configuration.
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8')
  .replace('await import(moduleUrl)', 'await testImport(moduleUrl)')
  .replace('  async function startRom(', '  window.testStartRom = startRom;\n  async function startRom(');

async function launch({ name, profile, c64Profile, simd = true, worklet = true }) {
  const files = new Map(), elements = new Map(), storage = new Map();
  if (profile) storage.set('snesProfile', profile);
  if (c64Profile) storage.set('c64Profile', c64Profile);
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', hidden: true, value: '', listeners: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(type, callback) { this.listeners[type] = callback; },
      querySelectorAll() { return []; }, querySelector() { return null; },
      focus() {}, click() { this.listeners.click?.(); }
    });
    return elements.get(id);
  };
  let moduleUrl, mainArgs;
  const instance = {
    FS: { writeFile: (path, data) => files.set(path, data) },
    _audio_driver_get_underruns: () => 0,
    _audio_driver_get_buffer_latency_ms: () => 192,
    _video_driver_get_frame_count: () => 0n,
    callMain: args => { mainArgs = args; }
  };
  function AudioContext() {}
  if (worklet) AudioContext.prototype.audioWorklet = {};
  const context = {
    document: { querySelector: element, querySelectorAll: () => [], addEventListener() {} },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    AudioContext, SharedArrayBuffer,
    WebAssembly: { Memory: WebAssembly.Memory, validate: bytes => simd && WebAssembly.validate(bytes) },
    console, setTimeout, setInterval() {}, addEventListener() {},
    navigator: { getGamepads: () => [] },
    testImport: async url => { moduleUrl = url; return { default: async () => instance }; }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../joypad-input.js', import.meta.url), 'utf8'), context);
  vm.runInContext(source, context);
  await context.testStartRom(name, new ArrayBuffer(16));
  assert.ok(mainArgs, element('#message').textContent);
  return { moduleUrl, files, elements, storage, diagnostics: context.retroarchDiagnostics() };
}

const fast = await launch({ name: 'test.sfc' });
assert.match(fast.moduleUrl, /worklet\/snes9x2005_libretro/);
assert.match(fast.files.get('/retroarch-core-options.cfg'), /frameskip = "disabled"/);
assert.equal(fast.diagnostics.snesEngine, 'snes9x2005');
const quality = await launch({ name: 'test.sfc', profile: 'quality' });
assert.match(quality.moduleUrl, /snes9x2005_plus_libretro/);
assert.match(quality.files.get('/retroarch-core-options.cfg'), /frameskip = "manual"/);
assert.match(quality.files.get('/retroarch-core-options.cfg'), /threshold = "33"/);
for (const options of [{ simd: false }, { worklet: false }]) {
  const fallback = await launch({ name: 'test.smc', ...options });
  assert.match(fallback.moduleUrl, /snes9x2010_libretro/);
  assert.equal(fallback.files.get('/retroarch-core-options.cfg'), '');
  if (options.worklet === false) assert.doesNotMatch(fallback.moduleUrl, /worklet\//);
}
const nes = await launch({ name: 'test.nes' });
const nesQuality = await launch({ name: 'test.nes', profile: 'quality' });
assert.equal(nes.moduleUrl, './wasm/worklet/fceumm_libretro.js?v=worklet1');
assert.equal(nes.files.get('/retroarch.cfg'), nesQuality.files.get('/retroarch.cfg'));
assert.equal(nes.files.get('/retroarch-core-options.cfg'), nesQuality.files.get('/retroarch-core-options.cfg'));
assert.match(nes.files.get('/retroarch.cfg'), /audio_latency = "192"/);
assert.match(nes.files.get('/retroarch.cfg'), /video_vsync = "false"/);
assert.match(nes.files.get('/retroarch-core-options.cfg'), /sndrate_hint = "48KHz"/);
const c64 = await launch({ name: 'test.d64', profile: 'quality' });
assert.match(c64.moduleUrl, /worklet\/vice_x64_fast_libretro/);
assert.match(c64.files.get('/retroarch-core-options.cfg'), /vice_joyport = "2"/);
assert.match(c64.files.get('/retroarch-core-options.cfg'), /drive_true_emulation = "disabled"/);
assert.match(c64.files.get('/retroarch-core-options.cfg'), /sid_engine = "FastSID"/);
assert.match(c64.files.get('/retroarch.cfg'), /audio_out_rate = "44100"/);
assert.equal(c64.diagnostics.c64Profile, 'performance');
const c64Balanced = await launch({ name: 'test.d64', c64Profile: 'balanced' });
assert.match(c64Balanced.files.get('/retroarch-core-options.cfg'), /sid_engine = "ReSID"/);
assert.match(c64Balanced.files.get('/retroarch-core-options.cfg'), /drive_true_emulation = "disabled"/);
const c64Compatibility = await launch({ name: 'test.d64', c64Profile: 'compatibility' });
assert.match(c64Compatibility.files.get('/retroarch-core-options.cfg'), /drive_true_emulation = "enabled"/);
assert.match(c64Compatibility.files.get('/retroarch-core-options.cfg'), /autoloadwarp = "disk_mute"/);
assert.match(c64Compatibility.files.get('/retroarch.cfg'), /audio_out_rate = "48000"/);
const c64Fallback = await launch({ name: 'test.d64', simd: false });
assert.equal(c64Fallback.moduleUrl, './wasm/worklet/vice_x64_libretro.js?v=worklet1');
const nesWithC64Profile = await launch({ name: 'test.nes', c64Profile: 'compatibility' });
assert.equal(nes.files.get('/retroarch.cfg'), nesWithC64Profile.files.get('/retroarch.cfg'));
assert.equal(nes.files.get('/retroarch-core-options.cfg'), nesWithC64Profile.files.get('/retroarch-core-options.cfg'));
fast.elements.get('#snes-profile-button').click();
assert.equal(fast.storage.get('snesProfile'), 'quality');
assert.match(fast.elements.get('#snes-profile-button').textContent, /AUDIO FEDELE/);
fast.elements.get('#snes-profile-button').click();
assert.equal(fast.storage.get('snesProfile'), 'performance');
c64.elements.get('#c64-profile-button').click();
assert.equal(c64.storage.get('c64Profile'), 'balanced');
assert.match(c64.elements.get('#c64-profile-button').textContent, /AUDIO FEDELE/);
c64.elements.get('#c64-profile-button').click();
assert.equal(c64.storage.get('c64Profile'), 'compatibility');
c64.elements.get('#c64-profile-button').click();
assert.equal(c64.storage.get('c64Profile'), 'performance');
console.log('PASS: SNES/C64 profiles, compatibility fallbacks, NES isolation, saved profile toggles.');
