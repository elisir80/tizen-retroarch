# Licenze e contenuti di terze parti

[English](LICENSES.md) | [Italiano](LICENSES.it.md)

## Codice originale del progetto: GPL-3.0-or-later

Copyright © 2026 contributori di Tizen RetroArch, per i rispettivi contributi originali.

I contributi originali del progetto presenti in `index.html`, `main.js`, `joypad-input.js`, `style.css`, `rom_server.py`, `config.xml`, `tizen_web_project.yaml`, `.github/workflows/` e `tools/` sono offerti sotto **GNU General Public License versione 3 o, a scelta del destinatario, qualsiasi versione successiva** (`GPL-3.0-or-later`). Il testo integrale della versione 3 è in [LICENSE](LICENSE). La concessione riguarda solo i contributi che i rispettivi autori hanno diritto di concedere e non rilascia con nuova licenza materiali di terzi.

Documentazione, icona e screenshot non sono inclusi in questa concessione specifica per il codice. Titolarità, eventuali elementi di terzi e ulteriori permessi devono essere valutati separatamente. Nomi e loghi possono essere soggetti a diritti sui marchi.

## Patch e core upstream

Il repository include patch, non i checkout upstream completi. `tools/fetch-sources.sh` scarica i commit precisi elencati sotto e applica le patch. Queste conservano le condizioni e gli avvisi di copyright upstream applicabili: la concessione sul codice originale non li sostituisce né li rilascia automaticamente con un'altra licenza. Ogni checkout può contenere componenti con ulteriori avvisi; la tabella è un punto di partenza, non una verifica completa file per file.

| Componente | Sorgente fissato e avvisi rilevanti | Aspetti da verificare |
| --- | --- | --- |
| RetroArch | [ca82e0c](https://github.com/libretro/RetroArch/tree/ca82e0c6970ed1e7e4186e6a6c051c731007111b); [COPYING](https://github.com/libretro/RetroArch/blob/ca82e0c6970ed1e7e4186e6a6c051c731007111b/COPYING); [file input modificato](https://github.com/libretro/RetroArch/blob/ca82e0c6970ed1e7e4186e6a6c051c731007111b/input/drivers/rwebinput_input.c) | Il file input modificato indica GPL v3 o successive. Controllare ogni file interessato e le dipendenze incluse. Una copia del testo GPL upstream resta in [COPYING.RetroArch](COPYING.RetroArch). |
| FCEUmm | [7a542da](https://github.com/libretro/libretro-fceumm/tree/7a542dab1e87679921962a9f056186eca425c0c2); [README](https://github.com/libretro/libretro-fceumm/blob/7a542dab1e87679921962a9f056186eca425c0c2/README.md) | Upstream indica GPL v2. Verificare se tutto il codice rilevante è v2-only o permette versioni successive; la sola dicitura non determina la compatibilità. |
| Snes9x 2005 / Plus | [avvisi copyright a79dfe9](https://github.com/libretro/snes9x2005/blob/a79dfe9047e7fec58808aefe48ad2bf499c7af11/copyright) | Gli avvisi upstream includono una limitazione non commerciale. Verificare tutti gli avvisi e il collegamento descritto sotto. |
| Snes9x 2010 | [LICENSE.txt fe690dd](https://github.com/libretro/snes9x2010/blob/fe690dd321fa5a46b5234a2bde089d2518c62b0e/LICENSE.txt) | L'avviso upstream include una limitazione non commerciale. Verificare tutti gli avvisi e il collegamento descritto sotto. |
| VICE libretro | [README e copyright f63b566](https://github.com/libretro/vice-libretro/blob/f63b56688f3133a2bb17499db9eebb7ab81df5f5/README.md); [COPYING](https://github.com/libretro/vice-libretro/blob/f63b56688f3133a2bb17499db9eebb7ab81df5f5/COPYING) | Codice VICE e dati/firmware possono avere titolari e condizioni diverse. Upstream segnala copyright Commodore per alcune ROM di sistema: valutare i materiali effettivamente utilizzati. |

## Avvertenza sulla distribuzione

Gli script collegano RetroArch e un archivio del core in ciascun modulo WebAssembly generato. Le condizioni non commerciali di Snes9x non sono automaticamente compatibili con la GPL. Analogamente, il codice **GPL-2.0-only** non è automaticamente compatibile con GPL-3.0; la dicitura «GPL v2» nel README FCEUmm non basta a stabilire se sia v2-only. Separare i repository sorgente o compilare per uso personale non dimostra di per sé che sia consentito distribuire i binari combinati. Vedi [FAQ GNU sulla compatibilità](https://www.gnu.org/licenses/gpl-faq.en.html#WhatDoesCompatMean) e [FAQ GPLv2/GPLv3](https://www.gnu.org/licenses/gpl-faq.en.html#v2v3Compatibility).

**Non pubblicare né distribuire WGT o core compilati come release generalmente autorizzata prima di aver verificato i binari combinati effettivi, tutte le licenze e gli avvisi applicabili, gli obblighi sul sorgente corrispondente e i diritti sui firmware, ottenendo eventuali permessi necessari.** A seconda dei risultati, un conflitto può richiedere alternative compatibili, autorizzazioni dei titolari o un'architettura diversa. L'esito può cambiare fra core; queste avvertenze non costituiscono un'autorizzazione legale.

Il sorgente x64 di VICE scaricato include dati C64 BASIC, KERNAL e caratteri incorporati negli input di compilazione. Questo repository non pubblica tali sorgenti upstream né ROM separate, ma un modulo compilato localmente potrebbe incorporarli. L'assenza di file BIOS separati non dimostra che un binario sia privo di firmware.

Il repository non pubblica giochi, BIOS/firmware separati, certificati, chiavi, WGT o core compilati. La disponibilità altrove di una ROM, di un firmware o di uno screenshot non autorizza di per sé copia o distribuzione. Il solo possesso di una cartuccia non dimostra tutti i diritti per ottenere, estrarre o condividere una ROM: norme e permessi variano.

Per obblighi pratici, fonti, sicurezza e ambito di queste informazioni, consulta la [guida legale](docs/ASPETTI-LEGALI.md). La guida è informativa e non costituisce consulenza legale.
