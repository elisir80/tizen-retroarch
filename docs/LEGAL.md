# Legal and distribution guide

[English](LEGAL.md) | [Italiano](ASPETTI-LEGALI.md)

This is a practical explanation of the notices relevant to this repository, **not legal advice or permission to distribute a particular build**. Laws, rights ownership, and obligations vary by jurisdiction and by the exact materials and distribution method. For an intended public release, commercial use, or unresolved compatibility issue, consult qualified counsel and the relevant rights holders.

## 1. What is licensed here

The project's identified original code contributions are licensed under `GPL-3.0-or-later`; [LICENSE](../LICENSE) contains GPL version 3 and [LICENSES.md](../LICENSES.md) defines the exact scope. GPL v3 allows use, modification, commercial use, and redistribution subject to its terms; it does not provide a warranty. “Or later” offers the recipient the option of a later FSF-published GPL version. It does not replace the licenses of third-party code, patches, trademarks, firmware, games, documentation, or images.

The `patches/` files contain modifications and surrounding material from different upstream projects. Their upstream copyrights and applicable licenses remain in force. The scope of the project's own license grant does not assert ownership over, or relicense, that material. Preserve relevant notices and inspect the exact upstream sources retrieved by `tools/fetch-sources.sh`.

The project documentation, icon, and screenshots have no additional license grant specified here. Check ownership and any permissions for third-party elements before reusing them. The screenshots in this repository show the application interface in a desktop preview, not images from commercial games.

## 2. GPL obligations when redistributing

If you redistribute GPL-covered source or object code, read the applicable GPL text and follow the obligations for your chosen distribution method. Depending on the situation, these include retaining notices, providing the license, documenting changes, and making the complete corresponding source available under the applicable terms. Corresponding source can include build and installation scripts and modifications; identify and retain the exact versions actually used. A link to this project alone is not proof that source for a particular binary is complete or remains available.

GPLv3 section 6 also contains an **Installation Information** requirement in certain transactions involving object code in, with, or specifically for a User Product. Its conditions and exceptions matter; it does not apply to every software download. Do not assume that a personal TV certificate should be published: consult the license and obtain advice on a compliant way to satisfy any applicable requirement without exposing personal secrets. For the authoritative terms see the [GPLv3 text](https://www.gnu.org/licenses/gpl-3.0.en.html) and [GNU's GPL FAQ](https://www.gnu.org/licenses/gpl-faq.en.html).

## 3. Combined core builds: unresolved distribution risk

The supplied build scripts link RetroArch and one libretro core archive into each WebAssembly module. Snes9x 2005, 2005 Plus, and 2010 upstream notices include non-commercial conditions. These restrictions raise a material compatibility issue with GPL-covered code; labeling the combination “GPL” or “non-commercial,” distributing it for free, or applying a new license to our own frontend does not resolve it. See the pinned upstream notices in [LICENSES.md](../LICENSES.md) and the [GNU compatibility FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#WhatDoesCompatMean).

The FCEUmm README describes GPL v2, but that phrase alone does not prove whether each relevant part is GPL-2.0-only or permits later versions. GPL-2.0-only and GPL-3.0 cannot generally be combined into one distributed GPL-covered work without an applicable permission or exception; GPL-2.0-or-later can offer GPLv3 as an option. Verify the actual files and terms rather than assuming either outcome. VICE and all other linked libraries also need their own review.

**Release status:** no general permission or license-compatibility clearance is asserted for any generated WGT or core. Do not publish or distribute a compiled release until its exact source, linked components, notices, firmware, and permissions have been reviewed. Depending on the results, the resolution may require permission from all relevant rights holders, a compatible alternative core, or an architecture change. Merely switching from static to dynamic linking is not an automatic legal solution. Keep a record of the findings per core and build.

## 4. Games, firmware, and images

This repository does not distribute game ROMs, standalone BIOS/firmware, compiled cores, or signed WGTs. The upstream VICE sources fetched by the build include embedded C64 BASIC, KERNAL, and character data in the x64 build inputs; upstream also identifies Commodore copyright for certain ROMs. **A generated binary can contain firmware even when there is no separate BIOS file.** Check provenance and rights for the exact data and any substitutions before any distribution.

Use homebrew or other content only when you have the rights and permissions required for your use. Owning physical media or finding an online copy does not automatically establish a right to download, extract, modify, or redistribute it; local rules and technical-protection measures can matter. This project does not provide games or a general authorization to share them.

Screenshots, box art, manuals, audio, and game footage may also carry third-party rights. Obtain the necessary permission or use appropriately licensed material before adding them to public documentation, releases, or store listings.

## 5. Names, platform terms, and private credentials

RetroArch, libretro, Samsung, Tizen, Nintendo, Commodore, and other names or marks belong to their respective owners. Their mention identifies compatibility or provenance; it does not imply endorsement, partnership, or permission to use logos or marks in any particular way. Review relevant trademark and platform rules before promotion or store submission.

Samsung's development certificate, device identifiers, private keys, passwords, and a WGT signed for a specific device should be treated carefully. Do not commit credentials or publish a personal device-bound package. Signing or successful TV installation is not a copyright or license clearance. Samsung's [certificate documentation](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) describes the separate platform requirements.

## 6. Network server and privacy

`rom_server.py` exposes supported files and folder names from the chosen directory over HTTP, binds to all interfaces by default, permits cross-origin requests, and has no authentication or encryption. Use only a trusted network and a dedicated folder; do not expose the port to the Internet. Its request logs contain client IP addresses. If operating it for others or keeping logs, consider applicable privacy, security, and data-retention requirements; local rules depend on the use case.

## 7. Before any public binary release

1. Record the exact source commits, patches, build tools, linked dependencies, configuration, and outputs for each core.
2. Verify each component's copyright and exact license version, including the GPL/Snes9x and possible GPLv2-only compatibility issues; obtain any necessary permissions or replace components.
3. Identify firmware and other embedded assets, verify redistribution rights, and retain required notices.
4. Determine and satisfy applicable source, license, modification-notice, and any User Product installation-information obligations for the actual distribution method.
5. Review game/image/trademark rights and Samsung platform requirements. Exclude private keys, credentials, device identifiers, and personal files.
6. Obtain a qualified review where the rights or legal effect remain unclear; document the result before publishing artifacts.
