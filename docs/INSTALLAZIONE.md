# Installazione e utilizzo

[English](INSTALLATION.md) | [Italiano](INSTALLAZIONE.md)

Questa procedura riguarda il progetto sorgente e un'installazione di sviluppo su Samsung TV, non il Samsung App Store. I passaggi dell'SDK possono cambiare a seconda della versione. Consulta anche la documentazione ufficiale Samsung su [TV Device](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html), [certificati](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) e [CLI](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html).

Queste istruzioni generano un pacchetto locale, ma **non** stabiliscono il diritto di distribuirlo. Il collegamento RetroArch/core e i firmware incorporati richiedono una verifica prima della distribuzione pubblica o ad altri. Consulta la [guida legale](ASPETTI-LEGALI.md).

## 1. Prerequisiti

- Samsung Smart TV con Developer Mode, computer e TV raggiungibili sulla stessa rete.
- Tizen Studio con TV Extension e Samsung Certificate Extension, oppure Tizen Extension con gli strumenti equivalenti. Servono `sdb` e il comando `tz` usato dagli script di questo repository.
- Git, Python 3, Node.js per i test, `make`, `rsync`, `xmllint` e spazio per sorgenti, toolchain e build. Gli esempi seguenti richiedono Bash.
- Un certificato Samsung TV personale che autorizzi il dispositivo; non condividere password, chiavi o file `.p12`.
- File homebrew o contenuti per cui hai i diritti; il progetto non include giochi né distribuisce separatamente BIOS.

Le build complete possono richiedere parecchio tempo. I comandi automatici sono stati preparati su macOS; i percorsi dell'SDK e le dipendenze differiscono su Windows e Linux.

## 2. Scarica il progetto e i sorgenti upstream

```sh
git clone https://github.com/elisir80/tizen-retroarch.git
cd tizen-retroarch
bash tools/fetch-sources.sh
```

Lo script scarica cinque repository a commit fissati e applica le patch di questo progetto. Per evitare sovrascritture, si ferma se trova una cartella di destinazione già esistente in `vendor/`. Se il download si interrompe, conserva/sposta altrove le cartelle già create prima di riprovare. Non modifica i tuoi checkout originali.

## 3. Installa le toolchain e compila

Servono due installazioni indipendenti di Emscripten: 3.1.46 per i core compatibili e 4.0.15 per AudioWorklet. I comandi sono in [Download and install — Emscripten](https://emscripten.org/docs/getting_started/downloads.html).

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

Le compilazioni producono coppie `.js`/`.wasm` in `wasm/` e `wasm/worklet/`. Per ricompilare solo un sistema AudioWorklet usa `bash tools/build-audioworklet.sh nes`, `snes` oppure `c64`. Se una compilazione fallisce, leggi l'errore e verifica toolchain, dipendenze e sorgenti: non assumere che un WGT precedente contenga i nuovi file.

## 4. Certificato Samsung e Developer Mode

1. Nella TV apri **Apps**, vai alla schermata delle impostazioni Apps e inserisci `12345` per aprire la configurazione sviluppatore. Abilita Developer Mode, inserisci l'IP del computer che esegue l'SDK e riavvia la TV seguendo le indicazioni Samsung.
2. In Certificate Manager crea/seleziona un profilo **Samsung TV** con certificato autore e distributore. Per il certificato distributore usa il DUID corretto della TV; usa Device Manager o la documentazione Samsung per verificarlo. Non presumere che seriale, MAC o altri ID mostrati dalla TV siano il DUID richiesto.
3. Nel Device Manager aggiungi l'IP della TV e collegala. Da terminale, se necessario:

```sh
sdb connect IP_DELLA_TV
sdb devices
```

Annota il seriale mostrato da `sdb devices`. La TV e l'SDK devono essere raggiungibili sulla stessa rete; se il computer ha più interfacce, l'IP configurato nella TV deve corrispondere al percorso effettivamente usato dall'SDK. L'IP del computer in Developer Mode e l'IP della TV sono due indirizzi diversi.

## 5. Firma, installa e avvia

Con il profilo selezionato e `tz` nel `PATH`:

```sh
bash tools/package-tv.sh 'NOME_PROFILO_CERTIFICATO'
```

Lo script raccoglie l'interfaccia e tutte le coppie core richieste in `build/wgt/`, firma il pacchetto e produce `build/RetroArch.wgt`. Questo progetto usa l'ID `rtrarch001.RetroArch`; se esiste già un'altra installazione con lo stesso ID, verificane proprietà e certificato prima di sostituirla. L'installazione può richiedere un certificato compatibile con l'autore precedente.

L'installazione da CLI/estensione varia tra versioni SDK; il percorso generale è usare il comando Tizen o l'interfaccia dell'estensione e verificare il risultato sul dispositivo. Sul televisore usato nello sviluppo, `sdb install` da solo ha trasferito il WGT senza completare l'installazione. Il seguente percorso specifico Samsung ha completato un aggiornamento **senza disinstallazione preliminare**:

```sh
sdb -s SERIALE_TV push build/RetroArch.wgt /home/owner/share/tmp/sdk_tools/RetroArch-NOME_UNIVOCO.wgt
sdb -s SERIALE_TV shell 0 vd_appinstall rtrarch001.RetroArch /home/owner/share/tmp/sdk_tools/RetroArch-NOME_UNIVOCO.wgt
```

Sostituisci `SERIALE_TV` con quello mostrato da `sdb devices` e usa un nome remoto diverso per ogni versione. Controlla nell'output **install completed**; il solo trasferimento del file non basta. Se il metodo non è supportato dal tuo SDK/TV, usa Device Manager e la CLI ufficiale. Non disinstallare alla cieca: Samsung indica che la disinstallazione elimina i dati locali dell'app, incluse eventuali sessioni BASIC.

Avvia l'icona RetroArch sul televisore o usa il comando di esecuzione dell'estensione. L'installazione di sviluppo e le sue limitazioni dipendono dal modello, dal certificato e dalle regole Samsung.

## 6. Aggiungi una cartella giochi in rete

```sh
mkdir -p "$HOME/ROMs"
python3 rom_server.py --folder "$HOME/ROMs" --port 8766
```

Il server stampa un indirizzo del computer. Apri **Impostazioni** nell'app, inserisci tale indirizzo completo di `http://` e porta, quindi premi **SALVA E VERIFICA**. Usa **ROM di rete** per sfogliare la cartella e le sottocartelle. Il server deve rimanere acceso durante la ricerca e il caricamento. Non contiene autenticazione né TLS: usalo solo su una LAN fidata e non inoltrare la porta sul router.

Se compare `Failed to fetch`, verifica che il server sia attivo, l'IP sia quello raggiungibile dalla TV, entrambe le apparecchiature siano sulla stessa rete e il firewall permetta l'accesso locale. Sul computer, apri `http://127.0.0.1:8766/api/health`; poi verifica anche l'IP LAN indicato dal server.

## 7. Comandi e controller

Nella dashboard usa le frecce e Invio/OK. Nel gioco, la mappatura predefinita della tastiera comprende frecce, `X`/`Z`, `S` per Select e Invio per Start. BACK/Esc apre il menu gioco, da cui puoi riprendere, attivare/disattivare schermo intero o uscire dal gioco. I comportamenti della tastiera C64 dipendono anche dal gioco/core.

In **Impostazioni → Configurazione joypad**, scegli **IMPOSTA START** o **IMPOSTA SELECT**, rilascia il tasto di conferma e premi il pulsante fisico desiderato; il segnale ricevuto e la mappatura salvata sono mostrati a schermo. BACK/Esc annulla. Un adattatore che non trasmette un pulsante non può essere corretto dalla sola schermata: prova a usare un pulsante libero diverso. Per il controller Bluetooth, associalo prima alla TV secondo le istruzioni del produttore; disponibilità e pulsanti devono essere verificati sul modello reale.

## Anteprima e test

```sh
node tools/test-joypad-input.mjs
node tools/test-snes-config.mjs
python3 tools/preview_server.py
```

Apri `http://127.0.0.1:8765/` dal computer. Questa anteprima invia le intestazioni necessarie per SharedArrayBuffer/AudioWorklet nei browser desktop. Verifica sempre installazione, audio, input e prestazioni sulla TV: il browser e il TV Simulator non riproducono completamente l'hardware del televisore.
