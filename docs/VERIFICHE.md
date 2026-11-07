# Verifiche iniziali

## 7 novembre 2026 — copia per la pubblicazione

- `tools/fetch-sources.sh`: scaricati i cinque repository ai commit specificati e applicate le tre patch locali.
- `tools/build-compat.sh`: compilate tutte e tre le coppie compatibili JS/Wasm con Emscripten 3.1.46.
- `tools/build-audioworklet.sh all`: compilate le sei coppie AudioWorklet JS/Wasm con Emscripten 4.0.15, incluse le varianti SNES e C64 ottimizzate.
- `tools/package-tv.sh`: generato un WGT firmato localmente con un profilo personale. Controllati manifest, interfaccia e presenza delle nove coppie core. Il pacchetto e il certificato non vengono pubblicati.
- Test Node di input e profili superati; controllo sintattico JavaScript, Python, Bash e XML superato.
- Server ROM: risposta health, elenco di una sottocartella con file di prova, download del file di prova e rifiuto di un tentativo di traversal.
- Preview desktop: caricata una piccola ROM NES di prova generata localmente e osservati core NES AudioWorklet e canvas attivo. La prova è uno smoke test, non una misura di audio o prestazioni.

Gli screenshot sono stati acquisiti dalla preview desktop. La versione di sviluppo precedente 0.3.30 era stata installata su una Samsung UE65DU7172; la **nuova build prodotta dal checkout pubblico non è ancora stata installata o provata sulla TV**. Prestazioni, audio, C64/SNES, controller fisici, DualShock 4 Bluetooth e sessioni BASIC devono essere rivalidati con la nuova build su hardware reale.
