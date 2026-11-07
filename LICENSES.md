# Licenses and third-party content

[English](LICENSES.md) | [Italiano](LICENSES.it.md)

This repository publishes an original dashboard, build scripts, and patches for independent projects. Public visibility on GitHub does not automatically grant a license for the original files in this repository: the project owner has not yet specified one. Patches to third-party components remain subject to the terms applicable to those components; no license in this repository replaces their conditions.

Upstream sources are not included in the published copy: `tools/fetch-sources.sh` downloads them at the specified commits and applies the local patches. Review the actual licenses in each checkout before building or distributing:

- [RetroArch](https://github.com/libretro/RetroArch): license and copyright notices are in its checkout. A copy of its GPL file is included as [COPYING.RetroArch](COPYING.RetroArch); it should not be interpreted as a single license for every dependency.
- [FCEUmm](https://github.com/libretro/libretro-fceumm): see the license and notices in the upstream source files and README.
- [Snes9x 2005](https://github.com/libretro/snes9x2005) and [Snes9x 2010](https://github.com/libretro/snes9x2010) have their own conditions. In particular, check the non-commercial-use notices and the terms of included libraries. Do not assume they have the same conditions as RetroArch.
- [VICE libretro](https://github.com/libretro/vice-libretro): software and data/firmware can have different owners and terms. Upstream includes specific copyright notices for certain Commodore system ROMs; review them before using or redistributing those files.

No game files, separate BIOS or firmware, certificates, keys, WGT packages, or compiled cores are provided. Building may download and incorporate materials present in upstream projects: public availability of source does not by itself grant a general right to redistribute all of its contents. Anyone compiling or publishing binaries must check the licenses of all components, including when linked together. This project is not affiliated with the respective trademark owners.
