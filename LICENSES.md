# Licenses and third-party content

[English](LICENSES.md) | [Italiano](LICENSES.it.md)

## Original project code: GPL-3.0-or-later

Copyright © 2026 Tizen RetroArch contributors, for their respective original contributions.

The project's original contributions in `index.html`, `main.js`, `joypad-input.js`, `style.css`, `rom_server.py`, `config.xml`, `tizen_web_project.yaml`, `.github/workflows/`, and `tools/` are offered under the **GNU General Public License, version 3 or (at your option) any later version** (`GPL-3.0-or-later`). The full version 3 text is in [LICENSE](LICENSE). This grant covers only contributions the relevant contributors have the right to license; it does not relicense third-party material.

Documentation, the icon, and screenshots are not covered by this code-specific grant. Their ownership, third-party elements, and any additional permissions must be assessed separately. Names and logos may be subject to trademark rights.

## Upstream patches and cores

The repository includes patches, not complete upstream checkouts. `tools/fetch-sources.sh` downloads the exact commits listed below and applies those patches. Patches retain applicable upstream license terms and copyright notices: the project-code grant above does **not** override or automatically relicense them. Each upstream checkout can contain components with additional notices; this table is a starting point, not a complete file-by-file audit.

| Component | Pinned source and relevant notices | Status to check |
| --- | --- | --- |
| RetroArch | [ca82e0c](https://github.com/libretro/RetroArch/tree/ca82e0c6970ed1e7e4186e6a6c051c731007111b); [COPYING](https://github.com/libretro/RetroArch/blob/ca82e0c6970ed1e7e4186e6a6c051c731007111b/COPYING); [modified input file](https://github.com/libretro/RetroArch/blob/ca82e0c6970ed1e7e4186e6a6c051c731007111b/input/drivers/rwebinput_input.c) | The modified input file states GPL v3 or later. Check each affected file and included dependency. A copy of the upstream GPL text remains in [COPYING.RetroArch](COPYING.RetroArch). |
| FCEUmm | [7a542da](https://github.com/libretro/libretro-fceumm/tree/7a542dab1e87679921962a9f056186eca425c0c2); [README](https://github.com/libretro/libretro-fceumm/blob/7a542dab1e87679921962a9f056186eca425c0c2/README.md) | Upstream describes GPL v2. Determine whether all relevant code is v2-only or permits later versions; do not infer compatibility from that shorthand. |
| Snes9x 2005 / Plus | [a79dfe9 copyright notices](https://github.com/libretro/snes9x2005/blob/a79dfe9047e7fec58808aefe48ad2bf499c7af11/copyright) | The upstream notices include a non-commercial restriction. Review all included notices and the linking issue below. |
| Snes9x 2010 | [fe690dd LICENSE.txt](https://github.com/libretro/snes9x2010/blob/fe690dd321fa5a46b5234a2bde089d2518c62b0e/LICENSE.txt) | The upstream notice includes a non-commercial restriction. Review all included notices and the linking issue below. |
| VICE libretro | [f63b566 README and copyright notice](https://github.com/libretro/vice-libretro/blob/f63b56688f3133a2bb17499db9eebb7ab81df5f5/README.md); [COPYING](https://github.com/libretro/vice-libretro/blob/f63b56688f3133a2bb17499db9eebb7ab81df5f5/COPYING) | VICE code and bundled data/firmware can have different owners and terms. Upstream identifies Commodore copyright for certain system ROMs; assess the exact materials used. |

## Distribution warning

The build scripts link RetroArch and a core archive into each generated WebAssembly module. Snes9x's non-commercial conditions are not automatically compatible with GPL terms. Likewise, code licensed **GPL-2.0-only** is not automatically compatible with GPL-3.0; the FCEUmm README's “GPL v2” wording alone does not establish whether it is v2-only. Separating source repositories or building for personal use does not itself establish permission to distribute the resulting combined binaries. See the [GNU GPL compatibility FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#WhatDoesCompatMean) and [GPLv2/GPLv3 FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#v2v3Compatibility).

**Do not publish or distribute WGT packages or compiled cores as a generally cleared release until the exact combined binaries, all applicable licenses and notices, corresponding-source obligations, and firmware rights have been reviewed and any necessary permissions obtained.** Depending on the findings, resolving a conflict may require compatible alternatives, permission from relevant rights holders, or a different architecture. A review may reach different conclusions for different cores; the warnings here are not a legal clearance.

VICE's checked-out x64 source includes embedded C64 BASIC, KERNAL, and character data in its build inputs. This repository does not publish those upstream sources or separate ROM files, but a locally generated module may incorporate such data. Do not assume that the absence of standalone BIOS files means a binary is firmware-free.

No game files, separate BIOS/firmware, certificates, keys, WGT packages, or compiled cores are published in this repository. The availability of a ROM, firmware, or screenshot elsewhere does not itself authorize copying or distribution. Having a game cartridge alone does not establish every right to obtain, dump, or share a ROM; applicable law and permissions vary.

For practical obligations, source links, security considerations, and the scope of this notice, see the [legal guide](docs/LEGAL.md). That guide is informational, not legal advice.
