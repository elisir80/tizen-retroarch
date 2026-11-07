# Installation and usage

[English](INSTALLATION.md) | [Italiano](INSTALLAZIONE.md)

These instructions cover the source project and a development installation on a Samsung TV, not the Samsung App Store. SDK steps may vary by version. Also consult Samsung's official [TV Device](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html), [certificate](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html), and [CLI](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html) documentation.

The current application interface is in Italian. The original on-screen labels are included below alongside their English meanings.

These instructions build a local package; they do **not** establish permission to distribute it. RetroArch/core linking and embedded firmware need review before public or other distribution. See the [legal guide](LEGAL.md).

## 1. Prerequisites

- A Samsung Smart TV with Developer Mode, and a computer and TV reachable on the same network.
- Tizen Studio with TV Extension and Samsung Certificate Extension, or Tizen Extension with equivalent tools. This repository's scripts use `sdb` and `tz`.
- Git, Python 3, Node.js for tests, `make`, `rsync`, `xmllint`, and disk space for sources, toolchains, and builds. The examples below require Bash.
- A personal Samsung TV certificate authorizing the device. Do not share passwords, keys, or `.p12` files.
- Homebrew files or content for which you have rights. This project does not include games or distribute separate BIOS files.

A complete build can take considerable time. The automated commands were prepared on macOS; SDK paths and dependencies differ on Windows and Linux.

## 2. Download the project and upstream sources

```sh
git clone https://github.com/elisir80/tizen-retroarch.git
cd tizen-retroarch
bash tools/fetch-sources.sh
```

The script downloads five repositories at pinned commits and applies this project's patches. To prevent overwrites, it stops if a destination folder already exists under `vendor/`. If a download is interrupted, keep or move aside the folders already created before retrying. It does not modify your original checkouts.

## 3. Install the toolchains and build

Two independent Emscripten installations are needed: 3.1.46 for compatibility cores and 4.0.15 for AudioWorklet. See [Download and install — Emscripten](https://emscripten.org/docs/getting_started/downloads.html).

```sh
git clone https://github.com/emscripten-core/emsdk.git .emsdk
.emsdk/emsdk install 3.1.46
.emsdk/emsdk activate 3.1.46
git clone https://github.com/emscripten-core/emsdk.git .emsdk-worklet
.emsdk-worklet/emsdk install 4.0.15
.emsdk-worklet/emsdk activate 4.0.15

bash tools/build-compat.sh
bash tools/build-audioworklet.sh all
```

The builds produce `.js`/`.wasm` pairs in `wasm/` and `wasm/worklet/`. To rebuild only one AudioWorklet system, run `bash tools/build-audioworklet.sh nes`, `snes`, or `c64`. If a build fails, inspect the error and check the toolchain, dependencies, and sources; do not assume an older WGT contains the new files.

## 4. Samsung certificate and Developer Mode

1. On the TV, open **Apps**, go to the Apps settings screen, and enter `12345` to open developer configuration. Enable Developer Mode, enter the IP address of the computer running the SDK, and restart the TV following Samsung's instructions.
2. In Certificate Manager, create or select a **Samsung TV** profile with author and distributor certificates. Use the TV's correct DUID for the distributor certificate; check it using Device Manager or Samsung's documentation. Do not assume the serial number, MAC address, or another TV identifier is the required DUID.
3. In Device Manager, add and connect the TV's IP address. From a terminal, if necessary:

```sh
sdb connect TV_IP_ADDRESS
sdb devices
```

Note the serial shown by `sdb devices`. The TV and SDK must be reachable on the same network. If the computer has multiple interfaces, the computer IP configured on the TV must match the route actually used by the SDK. The computer's Developer Mode IP and the TV's own IP are different addresses.

## 5. Sign, install, and launch

With the profile selected and `tz` on `PATH`:

```sh
bash tools/package-tv.sh 'YOUR_CERTIFICATE_PROFILE_NAME'
```

The script collects the interface and all required core pairs in `build/wgt/`, signs the package, and produces `build/RetroArch.wgt`. This project uses application ID `rtrarch001.RetroArch`. If another installation with that ID already exists, check its ownership and certificate before replacing it. Updating can require a certificate compatible with the previous author certificate.

Installation through the CLI or extension varies across SDK versions; generally, use the Tizen command or extension interface and verify the result on the device. On the TV used during development, `sdb install` by itself transferred the WGT without completing installation. The following Samsung-specific method completed an update **without a preliminary uninstall**:

```sh
sdb -s TV_SERIAL push build/RetroArch.wgt /home/owner/share/tmp/sdk_tools/RetroArch-UNIQUE_NAME.wgt
sdb -s TV_SERIAL shell 0 vd_appinstall rtrarch001.RetroArch /home/owner/share/tmp/sdk_tools/RetroArch-UNIQUE_NAME.wgt
```

Replace `TV_SERIAL` with the value shown by `sdb devices` and use a different remote filename for each version. Check the output for **install completed**; transferring the file alone is not sufficient. If your SDK or TV does not support this method, use Device Manager and the official CLI. Do not uninstall blindly: Samsung states that uninstalling deletes the app's local data, including any BASIC sessions.

Launch the RetroArch icon on the TV or use the extension's run command. Development installation and its limitations depend on the model, certificate, and Samsung rules.

## 6. Add a network game folder

```sh
mkdir -p "$HOME/ROMs"
python3 rom_server.py --folder "$HOME/ROMs" --port 8766
```

The server prints a computer address. In the app, open **Impostazioni** (Settings), enter the complete address including `http://` and the port, then select **SALVA E VERIFICA** (Save and verify). Use **ROM di rete** (Network ROMs) to browse the folder and its subfolders. The server must remain running while browsing and loading. It has no authentication or TLS: use it only on a trusted LAN and do not forward the port on your router.

If you see `Failed to fetch`, check that the server is running, the IP is reachable from the TV, both devices are on the same network, and the firewall permits local access. On the computer, open `http://127.0.0.1:8766/api/health`; also check the LAN IP shown by the server.

## 7. Controls and controllers

On the dashboard, use the arrow keys and Enter/OK. In a game, the default keyboard mapping includes the arrows, `X`/`Z`, `S` for Select, and Enter for Start. BACK/Esc opens the game menu, where you can resume, enable/disable fullscreen, or exit the game. C64 keyboard behavior also depends on the game and core.

Under **Impostazioni → Configurazione joypad** (Settings → Controller configuration), select **IMPOSTA START** (Set Start) or **IMPOSTA SELECT** (Set Select), release the confirmation key, and press the desired physical button. The received signal and saved mapping are shown on screen. BACK/Esc cancels. An adapter that does not transmit a button cannot be fixed by this screen alone: try another available button. For a Bluetooth controller, first pair it with the TV according to the manufacturer's instructions; availability and buttons must be tested on the actual model.

## Preview and tests

```sh
node tools/test-joypad-input.mjs
node tools/test-snes-config.mjs
python3 tools/preview_server.py
```

Open `http://127.0.0.1:8765/` on the computer. The preview supplies the headers required for SharedArrayBuffer/AudioWorklet in desktop browsers. Always verify installation, audio, input, and performance on the TV: neither a browser nor the TV Simulator fully reproduces the television's hardware.
