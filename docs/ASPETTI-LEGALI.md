# Guida legale e alla distribuzione

[English](LEGAL.md) | [Italiano](ASPETTI-LEGALI.md)

Questa guida spiega in modo pratico gli avvisi pertinenti al repository: **non è consulenza legale né autorizzazione a distribuire una determinata build**. Norme, titolarità e obblighi variano secondo il Paese, i materiali effettivi e il metodo di distribuzione. Per una release pubblica, un uso commerciale o questioni di compatibilità irrisolte, consulta un professionista qualificato e i titolari dei diritti interessati.

## 1. Cosa viene concesso in licenza qui

I contributi di codice originali individuati del progetto sono concessi sotto `GPL-3.0-or-later`; [LICENSE](../LICENSE) contiene la GPL versione 3 e [LICENSES.it.md](../LICENSES.it.md) ne definisce l'ambito preciso. La GPL v3 consente uso, modifica, uso commerciale e ridistribuzione nel rispetto delle sue condizioni; non offre garanzia. «O versioni successive» permette al destinatario di scegliere una versione GPL successiva pubblicata dalla FSF. Non sostituisce le licenze di codice di terzi, patch, marchi, firmware, giochi, documentazione o immagini.

I file in `patches/` contengono modifiche e parti di contesto di diversi progetti upstream. Restano validi i copyright e le licenze upstream applicabili. La concessione sul codice originale non attribuisce al progetto la titolarità di quei materiali e non ne modifica automaticamente la licenza. Conserva gli avvisi pertinenti ed esamina i sorgenti esatti scaricati da `tools/fetch-sources.sh`.

Per documentazione, icona e screenshot non è specificata qui un'ulteriore concessione di licenza. Prima di riutilizzarli verifica titolarità e permessi per eventuali elementi di terzi. Gli screenshot pubblicati mostrano l'interfaccia nell'anteprima desktop, non immagini di giochi commerciali.

## 2. Obblighi GPL in caso di ridistribuzione

Se ridistribuisci sorgenti o codice oggetto coperti da GPL, leggi la licenza applicabile e segui gli obblighi previsti per il metodo di distribuzione scelto. A seconda dei casi possono includere conservazione degli avvisi, fornitura della licenza, indicazione delle modifiche e disponibilità del sorgente corrispondente completo alle condizioni applicabili. Il sorgente corrispondente può comprendere script di compilazione e installazione e modifiche: individua e conserva le versioni esatte effettivamente usate. Un collegamento a questo progetto da solo non dimostra che il sorgente di un determinato binario sia completo o sempre disponibile.

La sezione 6 della GPLv3 prevede anche obblighi di **informazioni per l'installazione** in determinate transazioni relative a codice oggetto in, con, o destinato specificamente a un prodotto destinato agli utenti. Condizioni ed eccezioni sono importanti: non si applica a ogni download. Non presumere di dover pubblicare un certificato TV personale: consulta il testo e chiedi una valutazione su come rispettare eventuali obblighi senza esporre segreti personali. Fonti autorevoli: [testo GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) e [FAQ GNU sulla GPL](https://www.gnu.org/licenses/gpl-faq.en.html).

## 3. Build che collegano core: rischio di distribuzione irrisolto

Gli script forniti collegano RetroArch e un archivio di un core libretro in ciascun modulo WebAssembly. Gli avvisi upstream di Snes9x 2005, 2005 Plus e 2010 includono condizioni non commerciali. Queste restrizioni pongono una questione rilevante di compatibilità con il codice GPL: etichettare la combinazione «GPL» o «non commerciale», distribuirla gratuitamente o assegnare una nuova licenza al solo frontend non risolve automaticamente il problema. Vedi gli avvisi upstream fissati in [LICENSES.it.md](../LICENSES.it.md) e la [FAQ GNU sulla compatibilità](https://www.gnu.org/licenses/gpl-faq.en.html#WhatDoesCompatMean).

Il README FCEUmm indica GPL v2, ma la sola dicitura non prova se ogni parte rilevante sia GPL-2.0-only o permetta versioni successive. GPL-2.0-only e GPL-3.0 non possono generalmente essere combinati in un'unica opera GPL distribuita senza permessi o eccezioni applicabili; GPL-2.0-or-later può offrire GPLv3 come opzione. Verifica i file e le condizioni effettive senza presumere l'uno o l'altro esito. Anche VICE e tutte le altre librerie collegate richiedono una propria valutazione.

**Stato della release:** non viene dichiarata alcuna autorizzazione generale né una verifica conclusa della compatibilità per i WGT o i core generati. Non pubblicare né distribuire una release compilata prima di aver esaminato sorgenti esatti, componenti collegati, avvisi, firmware e permessi. In base ai risultati, la soluzione può richiedere l'autorizzazione di tutti i titolari interessati, un core alternativo compatibile o una modifica architetturale. Passare dal collegamento statico a quello dinamico non è automaticamente una soluzione legale. Conserva le conclusioni per ogni core e build.

## 4. Giochi, firmware e immagini

Questo repository non distribuisce ROM di giochi, BIOS/firmware autonomi, core compilati o WGT firmati. I sorgenti VICE upstream scaricati dalla build includono dati C64 BASIC, KERNAL e caratteri incorporati negli input della build x64; upstream segnala inoltre copyright Commodore per alcune ROM. **Un binario generato può contenere firmware anche senza file BIOS separati.** Prima di distribuirlo, verifica provenienza e diritti sui dati esatti e su eventuali sostituzioni.

Usa software homebrew o altri contenuti solo quando disponi dei diritti e permessi necessari per l'uso previsto. Il possesso di un supporto fisico o la disponibilità di una copia online non dimostrano automaticamente il diritto di scaricarla, estrarla, modificarla o ridistribuirla; possono rilevare norme locali e misure tecnologiche di protezione. Il progetto non fornisce giochi né un'autorizzazione generale a condividerli.

Anche screenshot, copertine, manuali, audio e filmati di gioco possono essere soggetti a diritti di terzi. Prima di inserirli in documentazione pubblica, release o pagine di uno store, ottieni i permessi necessari o usa materiale con licenza appropriata.

## 5. Nomi, condizioni della piattaforma e credenziali

RetroArch, libretro, Samsung, Tizen, Nintendo, Commodore e gli altri nomi o marchi appartengono ai rispettivi titolari. La loro menzione indica compatibilità o provenienza e non implica approvazione, partnership o permesso di usare loghi e marchi in uno specifico modo. Prima di promozioni o pubblicazione in uno store, verifica le relative regole sui marchi e sulla piattaforma.

Certificato Samsung di sviluppo, identificativi dei dispositivi, chiavi private, password e WGT firmato per uno specifico dispositivo richiedono attenzione. Non inserire credenziali nel repository e non pubblicare un pacchetto personale legato al dispositivo. Firma e installazione riuscita sulla TV non costituiscono autorizzazione sul copyright o sulle licenze. La [documentazione Samsung sui certificati](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) illustra i requisiti separati della piattaforma.

## 6. Server di rete e privacy

`rom_server.py` espone tramite HTTP file supportati e nomi delle cartelle della directory scelta, ascolta per impostazione predefinita su tutte le interfacce, consente richieste cross-origin e non prevede autenticazione né cifratura. Usa una rete fidata e una cartella dedicata; non esporre la porta a Internet. I log delle richieste contengono gli IP dei client. Se il server è usato per altre persone o i log vengono conservati, valuta gli obblighi applicabili su privacy, sicurezza e conservazione dei dati: le norme dipendono dal caso concreto.

## 7. Prima di una release pubblica compilata

1. Registra per ogni core commit dei sorgenti, patch, strumenti, dipendenze collegate, configurazione e file prodotti esatti.
2. Verifica copyright e versione precisa delle licenze dei componenti, incluse le questioni GPL/Snes9x e l'eventuale GPLv2-only; ottieni i permessi necessari o sostituisci i componenti.
3. Individua firmware e altri elementi incorporati, verifica i diritti di ridistribuzione e conserva gli avvisi richiesti.
4. Individua e soddisfa gli obblighi applicabili su sorgente, licenze, indicazione delle modifiche ed eventuali informazioni di installazione per prodotti destinati agli utenti, tenendo conto del metodo di distribuzione effettivo.
5. Verifica diritti su giochi, immagini e marchi e le condizioni della piattaforma Samsung. Escludi chiavi private, credenziali, identificativi di dispositivi e file personali.
6. Se diritti o conseguenze legali rimangono incerti, richiedi una verifica qualificata e documenta l'esito prima di pubblicare gli artefatti.
