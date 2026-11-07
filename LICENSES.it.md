# Licenze e contenuti di terze parti

[English](LICENSES.md) | [Italiano](LICENSES.it.md)

Il repository pubblica una dashboard originale, script di build e patch per progetti indipendenti. La visibilità pubblica su GitHub non assegna automaticamente una licenza ai file originali di questo repository: il titolare del progetto non ne ha ancora indicata una. Le patch a componenti di terze parti rimangono soggette ai termini applicabili ai rispettivi componenti; nessuna licenza di questo repository sostituisce le loro condizioni.

Le sorgenti upstream non sono incluse nella copia pubblicata: `tools/fetch-sources.sh` le scarica ai commit indicati e applica le patch locali. Esamina le licenze effettive nei rispettivi checkout prima di compilare o distribuire:

- [RetroArch](https://github.com/libretro/RetroArch), licenza e copyright nel checkout. Una copia del suo file GPL è inclusa come [COPYING.RetroArch](COPYING.RetroArch); non va interpretata come licenza unica di tutte le dipendenze.
- [FCEUmm](https://github.com/libretro/libretro-fceumm), licenza e avvisi nei file sorgente e nel README upstream.
- [Snes9x 2005](https://github.com/libretro/snes9x2005) e [Snes9x 2010](https://github.com/libretro/snes9x2010), con condizioni proprie: in particolare verificare gli avvisi sull'uso non commerciale e le condizioni delle librerie incluse. Non presumere che siano coperti dalle stesse condizioni di RetroArch.
- [VICE libretro](https://github.com/libretro/vice-libretro): software e dati/firmware possono avere titolari e condizioni differenti. L'upstream include avvisi di copyright specifici per alcune ROM di sistema Commodore: consultarli prima di utilizzare o ridistribuire tali file.

Non sono forniti file di giochi, BIOS o firmware separati, certificati, chiavi, WGT o core compilati. La procedura di compilazione può scaricare e incorporare materiali presenti nei progetti upstream: la disponibilità pubblica di una sorgente non è di per sé una concessione generale a ridistribuirne tutti i contenuti. Chi compila o pubblica binari deve verificare le licenze di tutti i componenti, anche quando sono collegati fra loro. Il progetto non è affiliato ai rispettivi titolari dei marchi.
