(function () {
  const DEFAULT_ROM_SERVER_URL = '';
  const menuButtons = Array.prototype.slice.call(document.querySelectorAll('#menu button'));
  const message = document.querySelector('#message');
  const screen = document.querySelector('#canvas');
  const gameControls = document.querySelector('#game-controls');
  const resumeButton = document.querySelector('#resume-button');
  const fullscreenButton = document.querySelector('#fullscreen-button');
  const c64KeyboardButton = document.querySelector('#c64-keyboard-button');
  const c64JoyportButton = document.querySelector('#c64-joyport-button');
  const c64SaveSessionButton = document.querySelector('#c64-save-session-button');
  const c64LoadSessionButton = document.querySelector('#c64-load-session-button');
  const exitGameButton = document.querySelector('#exit-game-button');
  const networkPanel = document.querySelector('#network-panel');
  const settingsPanel = document.querySelector('#settings-panel');
  const networkStatus = document.querySelector('#network-status');
  const settingsStatus = document.querySelector('#settings-status');
  const networkRoms = document.querySelector('#network-roms');
  const serverUrlInput = document.querySelector('#server-url');
  const snesProfileButton = document.querySelector('#snes-profile-button');
  const snesProfileHelp = document.querySelector('#snes-profile-help');
  const c64ProfileButton = document.querySelector('#c64-profile-button');
  const c64ProfileHelp = document.querySelector('#c64-profile-help');
  const gamepadMappingStatus = document.querySelector('#gamepad-mapping-status');
  const gamepadMapStartButton = document.querySelector('#gamepad-map-start-button');
  const gamepadMapSelectButton = document.querySelector('#gamepad-map-select-button');
  const gamepadResetMapButton = document.querySelector('#gamepad-reset-map-button');
  let selected = 0;
  let emulatorRunning = false;
  let gameMenuOpen = false;
  let gameActionIndex = 0;
  let activePanel = null;
  let panelFocusIndex = 0;
  let activeCore = null;
  let activeInstance = null;
  let activeC64Basic = false;
  let networkRomCatalog = [];
  let networkDirectory = [];
  let networkServerUrl = '';
  const joypadInput = window.createJoypadInput({
    canPlay: function () { return emulatorRunning && !gameMenuOpen && !activePanel && !activeC64Basic && !document.hidden; },
    isSettings: function () { return activePanel === settingsPanel; },
    emit: function (action, down) {
      const c64Start = action === 'start' && activeCore && activeCore.id === 'c64';
      const code = action === 'select' ? 'KeyS' : c64Start ? 'Space' : 'Enter';
      const key = action === 'select' ? 's' : c64Start ? ' ' : 'Enter';
      const event = new KeyboardEvent(down ? 'keydown' : 'keyup', {
        code: code, key: key, bubbles: true, cancelable: true
      });
      event.retroarchJoypad = true;
      document.dispatchEvent(event);
    },
    onChange: function () { if (activePanel === settingsPanel) renderGamepadMapping(); }
  });

  const C64_SESSION_DB = 'retroarch-tizen-sessions';
  const C64_SESSION_STORE = 'states';
  const C64_SESSION_KEY = 'c64-basic';

  function openSessionDatabase() {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(C64_SESSION_DB, 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains(C64_SESSION_STORE))
          request.result.createObjectStore(C64_SESSION_STORE);
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error('IndexedDB non disponibile')); };
    });
  }

  async function sessionDatabase(action, value) {
    const database = await openSessionDatabase();
    return new Promise(function (resolve, reject) {
      const transaction = database.transaction(C64_SESSION_STORE, action === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore(C64_SESSION_STORE);
      const request = action === 'get' ? store.get(C64_SESSION_KEY) : store.put(value, C64_SESSION_KEY);
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
      transaction.oncomplete = function () { database.close(); };
    });
  }

  function collectStateFiles(instance, directory, result) {
    let names;
    try { names = instance.FS.readdir(directory); } catch (_) { return; }
    names.forEach(function (name) {
      if (name === '.' || name === '..') return;
      const path = (directory === '/' ? '' : directory) + '/' + name;
      let stat;
      try { stat = instance.FS.stat(path); } catch (_) { return; }
      if (instance.FS.isDir(stat.mode)) collectStateFiles(instance, path, result);
      else if (/\.state(?:\d+)?$/i.test(name)) result.push({ path: path, mtime: stat.mtime ? stat.mtime.getTime() : 0 });
    });
  }

  function ensureDirectory(instance, path) {
    const parts = path.split('/').filter(Boolean);
    let current = '';
    parts.forEach(function (part) {
      current += '/' + part;
      try { instance.FS.mkdir(current); } catch (_) {}
    });
  }

  async function saveC64BasicSession() {
    if (!activeInstance || !activeC64Basic) return;
    closeGameMenu();
    message.textContent = 'Salvataggio della sessione BASIC…';
    try {
      activeInstance._cmd_save_state();
      await new Promise(function (resolve) { setTimeout(resolve, 700); });
      const files = [];
      collectStateFiles(activeInstance, '/saves', files);
      files.sort(function (a, b) { return b.mtime - a.mtime; });
      if (!files.length) throw new Error('il core non ha creato il salvataggio');
      const state = activeInstance.FS.readFile(files[0].path);
      await sessionDatabase('put', {
        path: files[0].path,
        data: state.buffer.slice(state.byteOffset, state.byteOffset + state.byteLength),
        savedAt: Date.now(),
        version: 1
      });
      message.textContent = 'Sessione BASIC salvata in modo permanente.';
    } catch (error) {
      console.error(error);
      message.textContent = 'Salvataggio non riuscito: ' + error.message;
    }
  }

  async function loadC64BasicSession() {
    if (!activeInstance || !activeC64Basic) return;
    closeGameMenu();
    message.textContent = 'Ripristino della sessione BASIC…';
    try {
      const saved = await sessionDatabase('get');
      if (!saved || !saved.data || !saved.path) throw new Error('nessuna sessione salvata');
      ensureDirectory(activeInstance, saved.path.slice(0, saved.path.lastIndexOf('/')));
      activeInstance.FS.writeFile(saved.path, new Uint8Array(saved.data));
      activeInstance._cmd_load_state();
      message.textContent = 'Sessione BASIC ripristinata.';
      screen.focus();
    } catch (error) {
      console.error(error);
      message.textContent = 'Ripristino non riuscito: ' + error.message;
    }
  }

  const cores = [
    {
      id: 'nes',
      system: 'Nintendo NES',
      module: './wasm/fceumm_libretro.js?v=systems1',
      extensions: ['nes', 'unf', 'unif']
    },
    {
      id: 'snes',
      system: 'Super Nintendo',
      module: './wasm/snes9x2010_libretro.js?v=systems1',
      extensions: ['smc', 'sfc', 'fig', 'swc']
    },
    {
      id: 'c64',
      system: 'Commodore 64',
      module: './wasm/vice_x64_libretro.js?v=systems1',
      extensions: ['d64', 'd71', 'd81', 'g64', 't64', 'tap', 'prg', 'p00', 'crt', 'x64']
    }
  ];

  function coreForName(name) {
    const dot = name.lastIndexOf('.');
    const extension = dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
    return cores.find(function (core) { return core.extensions.indexOf(extension) >= 0; }) || null;
  }

  function supportsAudioWorklet() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context || !('audioWorklet' in Context.prototype) ||
        typeof SharedArrayBuffer === 'undefined') return false;
    try {
      return new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true })
        .buffer instanceof SharedArrayBuffer;
    } catch (_) {
      return false;
    }
  }

  function gamepadStatus() {
    if (!navigator.getGamepads) return 'Joypad: API non disponibile';
    try {
      const connected = Array.from(navigator.getGamepads()).filter(Boolean).length;
      return connected
        ? 'Joypad: ' + connected + ' collegato' + (connected === 1 ? '' : 'i')
        : 'Joypad: nessun controller rilevato';
    } catch (_) {
      return 'Joypad: lettura non disponibile';
    }
  }

  function renderGamepadMapping() {
    if (!gamepadMappingStatus) return;
    const state = joypadInput.status();
    const details = state.devices.length
      ? state.devices.map(function (pad) { return 'Joypad ' + (pad.index + 1) + ': ' + pad.buttons + ' pulsanti'; }).join(' · ')
      : 'In ascolto anche dei comandi inviati come tasti dalla TV.';
    gamepadMappingStatus.textContent = (state.note ? state.note + ' ' : '') + details +
      ' · START: ' + state.startLabel + ' · SELECT: ' + state.selectLabel;
    document.querySelector('#gamepad-input-status').textContent = state.lastSignal
      ? 'Ultimo segnale: ' + state.lastSignal : 'Premi un pulsante: qui apparirà il segnale ricevuto.';
    gamepadMapStartButton.textContent = state.capture === 'start' ? 'PREMI START…' : 'IMPOSTA START';
    gamepadMapSelectButton.textContent = state.capture === 'select' ? 'PREMI SELECT…' : 'IMPOSTA SELECT';
  }

  function supportsWasmSimd() {
    // A minimal module returning v128.const; validate without executing it.
    try {
      return WebAssembly.validate(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123,
        3, 2, 1, 0, 10, 22, 1, 20, 0, 253, 12,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11
      ]));
    } catch (_) {
      return false;
    }
  }

  function renderSnesProfile() {
    const quality = localStorage.getItem('snesProfile') === 'quality';
    snesProfileButton.textContent = quality ? 'SNES: AUDIO FEDELE' : 'SNES: FLUIDITÀ';
    snesProfileHelp.textContent = quality
      ? 'Snes9x 2005 Plus: suono più fedele; può saltare fotogrammi per mantenere il ritmo. Premi OK per cambiare.'
      : 'Snes9x 2005: core più leggero, senza salto fotogrammi. Suono meno accurato rispetto a Plus. Premi OK per cambiare.';
  }

  function getC64Profile() {
    const profile = localStorage.getItem('c64Profile');
    return profile === 'balanced' || profile === 'compatibility' ? profile : 'performance';
  }

  function renderC64Profile() {
    const profile = getC64Profile();
    if (profile === 'balanced') {
      c64ProfileButton.textContent = 'C64: AUDIO FEDELE';
      c64ProfileHelp.textContent = 'ReSID e caricamento rapido: audio più accurato senza emulare tutto il drive 1541. Premi OK per cambiare.';
    } else if (profile === 'compatibility') {
      c64ProfileButton.textContent = 'C64: COMPATIBILITÀ';
      c64ProfileHelp.textContent = 'ReSID e drive 1541 completo: per i giochi che lo richiedono, ma è più lento. Premi OK per cambiare.';
    } else {
      c64ProfileButton.textContent = 'C64: FLUIDITÀ';
      c64ProfileHelp.textContent = 'FastSID, uscita 44,1 kHz e caricamento rapido: profilo più leggero per la TV. Premi OK per cambiare.';
    }
  }

  function setStatus(element, text, type) {
    element.textContent = text || '';
    element.classList.remove('error', 'success');
    if (type) element.classList.add(type);
  }

  function normalizeServerUrl(value) {
    const trimmed = value.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(trimmed)) throw new Error('Inserisci un indirizzo che inizi con http://');
    return trimmed;
  }

  function renderMenu() {
    menuButtons.forEach(function (button, index) {
      button.classList.toggle('selected', index === selected);
    });
  }

  function panelItems() {
    if (!activePanel) return [];
    return Array.prototype.slice.call(activePanel.querySelectorAll('input, button:not([disabled])'));
  }

  function focusPanelItem(index) {
    const items = panelItems();
    if (!items.length) return;
    panelFocusIndex = (index + items.length) % items.length;
    items[panelFocusIndex].focus();
  }

  function openPanel(panel, preferredSelector) {
    networkPanel.hidden = true;
    settingsPanel.hidden = true;
    panel.hidden = false;
    activePanel = panel;
    panelFocusIndex = 0;
    const items = panelItems();
    const preferred = preferredSelector ? panel.querySelector(preferredSelector) : null;
    const preferredIndex = preferred ? items.indexOf(preferred) : -1;
    focusPanelItem(preferredIndex >= 0 ? preferredIndex : 0);
  }

  function closePanel() {
    if (activePanel === settingsPanel) joypadInput.cancel();
    if (activePanel) activePanel.hidden = true;
    activePanel = null;
    menuButtons[selected].focus();
  }

  function focusGameAction(index) {
    const gameActionButtons = Array.prototype.slice.call(gameControls.querySelectorAll('button:not([hidden])'));
    if (!gameActionButtons.length) return;
    gameActionIndex = (index + gameActionButtons.length) % gameActionButtons.length;
    gameActionButtons[gameActionIndex].focus();
  }

  function openGameMenu() {
    joypadInput.release();
    document.body.classList.remove('game-fullscreen');
    gameMenuOpen = true;
    const isC64 = activeCore && activeCore.id === 'c64';
    c64KeyboardButton.hidden = !isC64;
    c64JoyportButton.hidden = !isC64;
    c64SaveSessionButton.hidden = !activeC64Basic;
    c64LoadSessionButton.hidden = !activeC64Basic;
    gameControls.hidden = false;
    message.textContent = 'Menu gioco: usa le frecce e premi OK';
    focusGameAction(0);
  }

  function closeGameMenu() {
    gameMenuOpen = false;
    gameControls.hidden = true;
    message.textContent = '';
    screen.focus();
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function encodedRomPath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  function renderNetworkDirectory() {
    const prefix = networkDirectory.length ? networkDirectory.join('/') + '/' : '';
    const folders = {};
    const files = [];
    networkRomCatalog.forEach(function (rom) {
      if (rom.path.indexOf(prefix) !== 0) return;
      const remaining = rom.path.slice(prefix.length);
      const slash = remaining.indexOf('/');
      if (slash >= 0) folders[remaining.slice(0, slash)] = true;
      else files.push(rom);
    });
    const folderNames = Object.keys(folders).sort(function (a, b) {
      return a.localeCompare(b, 'it', { sensitivity: 'base' });
    });
    files.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
    });
    networkRoms.innerHTML = '';

    if (networkDirectory.length) {
      const parentButton = document.createElement('button');
      parentButton.className = 'rom-item folder-item';
      parentButton.innerHTML = '<span class="rom-name">↩ Cartella precedente</span><span class="rom-system">SU</span>';
      parentButton.addEventListener('click', function () {
        networkDirectory.pop();
        renderNetworkDirectory();
        focusPanelItem(1);
      });
      networkRoms.appendChild(parentButton);
    }

    folderNames.forEach(function (folderName) {
      const button = document.createElement('button');
      button.className = 'rom-item folder-item';
      const name = document.createElement('span');
      name.className = 'rom-name';
      name.textContent = '📁 ' + folderName;
      const details = document.createElement('span');
      details.className = 'rom-system';
      details.textContent = 'CARTELLA';
      button.appendChild(name);
      button.appendChild(details);
      button.addEventListener('click', function () {
        networkDirectory.push(folderName);
        renderNetworkDirectory();
        focusPanelItem(1);
      });
      networkRoms.appendChild(button);
    });

    files.forEach(function (rom) {
      const button = document.createElement('button');
      button.className = 'rom-item';
      const name = document.createElement('span');
      name.className = 'rom-name';
      name.textContent = rom.name;
      const core = coreForName(rom.name);
      const details = document.createElement('span');
      details.className = 'rom-details';
      const system = document.createElement('span');
      system.className = 'rom-system';
      system.textContent = rom.system || (core ? core.system : 'ROM');
      const size = document.createElement('span');
      size.className = 'rom-size';
      size.textContent = formatSize(rom.size);
      details.appendChild(system);
      details.appendChild(size);
      button.appendChild(name);
      button.appendChild(details);
      button.addEventListener('click', function () { loadNetworkRom(networkServerUrl, rom); });
      networkRoms.appendChild(button);
    });

    const location = networkDirectory.length ? '/' + networkDirectory.join('/') : '/';
    const count = folderNames.length + files.length;
    setStatus(networkStatus, 'Percorso: ' + location + ' · ' + count +
      (count === 1 ? ' elemento' : ' elementi'), 'success');
  }

  async function checkServer(serverUrl) {
    const response = await fetch(serverUrl + '/api/health', { cache: 'no-store' });
    if (!response.ok) throw new Error('Il server ha risposto con errore ' + response.status);
    const payload = await response.json();
    if (!payload.ok) throw new Error('Risposta del server non valida');
  }

  async function showNetworkRoms() {
    const savedUrl = localStorage.getItem('romServerUrl') || DEFAULT_ROM_SERVER_URL;
    if (!savedUrl) {
      showSettings('Inserisci l’indirizzo del server ROM prima di aprire la libreria.');
      return;
    }
    openPanel(networkPanel, '[data-panel-action="close"]');
    networkRoms.innerHTML = '';
    setStatus(networkStatus, 'Connessione a ' + savedUrl + '…');
    try {
      const response = await fetch(savedUrl + '/api/roms', { cache: 'no-store' });
      if (!response.ok) throw new Error('Errore HTTP ' + response.status);
      const payload = await response.json();
      const roms = Array.isArray(payload.roms) ? payload.roms : [];
      if (!roms.length) {
        setStatus(networkStatus, 'Nessun gioco compatibile trovato nella cartella condivisa.');
        return;
      }
      networkRomCatalog = roms;
      networkDirectory = [];
      networkServerUrl = savedUrl;
      renderNetworkDirectory();
      focusPanelItem(1);
    } catch (error) {
      setStatus(networkStatus, 'Connessione non riuscita: ' + error.message, 'error');
    }
  }

  async function loadNetworkRom(serverUrl, rom) {
    setStatus(networkStatus, 'Download di ' + rom.name + '…');
    try {
      const response = await fetch(serverUrl + '/roms/' + encodedRomPath(rom.path), { cache: 'no-store' });
      if (!response.ok) throw new Error('Errore HTTP ' + response.status);
      const data = await response.arrayBuffer();
      closePanel();
      await startRom(rom.name, data);
    } catch (error) {
      setStatus(networkStatus, 'Download non riuscito: ' + error.message, 'error');
    }
  }

  function showSettings(note) {
    serverUrlInput.value = localStorage.getItem('romServerUrl') || DEFAULT_ROM_SERVER_URL;
    renderSnesProfile();
    renderGamepadMapping();
    setStatus(settingsStatus, note || '');
    openPanel(settingsPanel, '#gamepad-map-start-button');
  }

  async function saveServer() {
    try {
      const serverUrl = normalizeServerUrl(serverUrlInput.value);
      setStatus(settingsStatus, 'Verifica della connessione…');
      await checkServer(serverUrl);
      localStorage.setItem('romServerUrl', serverUrl);
      setStatus(settingsStatus, 'Server raggiungibile. Indirizzo salvato.', 'success');
    } catch (error) {
      setStatus(settingsStatus, 'Connessione non riuscita: ' + error.message, 'error');
    }
  }

  function activateMenu() {
    const action = menuButtons[selected].getAttribute('data-action');
    if (action === 'local') document.querySelector('#rom-picker').click();
    else if (action === 'network') showNetworkRoms();
    else if (action === 'c64-basic') startC64Basic();
    else if (action === 'settings') showSettings();
    else if (action === 'exit') exitApplication();
    else {
      message.textContent = 'La cronologia sarà disponibile dopo il primo avvio.';
      setTimeout(function () { message.textContent = ''; }, 3500);
    }
  }

  function exitApplication() {
    try {
      if (window.tizen && tizen.application) {
        tizen.application.getCurrentApplication().exit();
        return;
      }
    } catch (error) {
      console.error(error);
    }
    message.textContent = 'Il comando Esci è disponibile nell’app installata sulla TV.';
  }

  function sendEmulatorKey(code, key) {
    closeGameMenu();
    setTimeout(function () {
      document.dispatchEvent(new KeyboardEvent('keydown', { code: code, key: key, bubbles: true, cancelable: true }));
      setTimeout(function () {
        document.dispatchEvent(new KeyboardEvent('keyup', { code: code, key: key, bubbles: true, cancelable: true }));
      }, 100);
    }, 80);
  }

  function handleJoypadKey(event) {
    if (joypadInput.handleKey(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  document.addEventListener('keydown', handleJoypadKey, true);
  document.addEventListener('keyup', handleJoypadKey, true);
  window.addEventListener('blur', function () { joypadInput.release(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) joypadInput.release(); });
  window.addEventListener('gamepadconnected', function () { joypadInput.poll(); });
  window.addEventListener('gamepaddisconnected', function () { joypadInput.poll(); });

  document.addEventListener('keydown', function (event) {
    if (event.retroarchJoypad) return;
    if (emulatorRunning) {
      const returnPressed = event.key === 'Enter' || event.key === 'Return' ||
        event.code === 'Enter' || event.code === 'NumpadEnter' ||
        event.keyCode === 13 || event.which === 13;
      if (activeC64Basic && !gameMenuOpen && returnPressed && activeInstance &&
          typeof activeInstance._c64_inject_return === 'function') {
        event.preventDefault();
        event.stopImmediatePropagation();
        activeInstance._c64_inject_return(1);
        return;
      }
      const backPressed = event.key === 'Escape' || event.keyCode === 10009;
      if (gameMenuOpen) {
        const gameActionButtons = Array.prototype.slice.call(gameControls.querySelectorAll('button:not([hidden])'));
        event.preventDefault();
        event.stopImmediatePropagation();
        if (backPressed) closeGameMenu();
        else if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.keyCode === 40 || event.keyCode === 39) focusGameAction(gameActionIndex + 1);
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.keyCode === 38 || event.keyCode === 37) focusGameAction(gameActionIndex - 1);
        else if (event.key === 'Enter' || event.keyCode === 13) gameActionButtons[gameActionIndex].click();
        return;
      }
      if (backPressed) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openGameMenu();
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].indexOf(event.key) >= 0) event.preventDefault();
      return;
    }
    if (activePanel) {
      const editingText = event.target && event.target.tagName === 'INPUT';
      if (event.key === 'Escape' || event.keyCode === 10009 || (event.keyCode === 8 && !editingText)) {
        event.preventDefault();
        if (activePanel === networkPanel && networkDirectory.length) {
          networkDirectory.pop();
          renderNetworkDirectory();
          focusPanelItem(1);
        } else closePanel();
      } else if (!editingText && (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.keyCode === 40 || event.keyCode === 39)) {
        event.preventDefault();
        focusPanelItem(panelFocusIndex + 1);
      } else if (!editingText && (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.keyCode === 38 || event.keyCode === 37)) {
        event.preventDefault();
        focusPanelItem(panelFocusIndex - 1);
      } else if (event.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'BUTTON') {
        event.preventDefault();
        document.activeElement.click();
      }
      return;
    }
    const key = event.keyCode || event.which;
    if (key === 37 || key === 38 || key === 39 || key === 40) {
      const forward = key === 39 || key === 40;
      selected = (selected + (forward ? 1 : menuButtons.length - 1)) % menuButtons.length;
      renderMenu();
      menuButtons[selected].focus();
      event.preventDefault();
    } else if (key === 13 || event.key === 'Enter') {
      event.preventDefault();
      activateMenu();
    }
    else if (key === 10009 || key === 8) message.textContent = '';
  });

  document.addEventListener('keyup', function (event) {
    if (event.retroarchJoypad) return;
    if (!emulatorRunning || !activeC64Basic || gameMenuOpen || !activeInstance ||
        typeof activeInstance._c64_inject_return !== 'function') return;
    const returnReleased = event.key === 'Enter' || event.key === 'Return' ||
      event.code === 'Enter' || event.code === 'NumpadEnter' ||
      event.keyCode === 13 || event.which === 13;
    if (!returnReleased) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activeInstance._c64_inject_return(0);
  });

  screen.addEventListener('click', function () { screen.focus(); });
  resumeButton.addEventListener('click', closeGameMenu);
  fullscreenButton.addEventListener('click', function () {
    closeGameMenu();
    document.body.classList.add('game-fullscreen');
    screen.focus();
  });
  c64KeyboardButton.addEventListener('click', function () { sendEmulatorKey('KeyS', 's'); });
  c64JoyportButton.addEventListener('click', function () { sendEmulatorKey('ControlRight', 'Control'); });
  c64SaveSessionButton.addEventListener('click', saveC64BasicSession);
  c64LoadSessionButton.addEventListener('click', loadC64BasicSession);
  exitGameButton.addEventListener('click', function () { window.location.reload(); });
  menuButtons.forEach(function (button, index) {
    button.addEventListener('click', function () { selected = index; renderMenu(); activateMenu(); });
  });
  Array.prototype.slice.call(document.querySelectorAll('[data-panel-action="close"]')).forEach(function (button) {
    button.addEventListener('click', closePanel);
  });
  document.querySelector('#save-server').addEventListener('click', saveServer);
  snesProfileButton.addEventListener('click', function () {
    const quality = localStorage.getItem('snesProfile') === 'quality';
    localStorage.setItem('snesProfile', quality ? 'performance' : 'quality');
    renderSnesProfile();
  });
  c64ProfileButton.addEventListener('click', function () {
    const profile = getC64Profile();
    localStorage.setItem('c64Profile', profile === 'performance' ? 'balanced' :
      profile === 'balanced' ? 'compatibility' : 'performance');
    renderC64Profile();
  });
  gamepadMapStartButton.addEventListener('click', function () {
    joypadInput.begin('start');
  });
  gamepadMapSelectButton.addEventListener('click', function () {
    joypadInput.begin('select');
  });
  gamepadResetMapButton.addEventListener('click', function () {
    joypadInput.reset();
  });

  async function startC64Basic() {
    await startRom('C64 BASIC', null, cores.find(function (core) { return core.id === 'c64'; }));
  }

  async function startRom(name, romData, requestedCore) {
    message.textContent = romData ? 'ROM selezionata: ' + name : 'Avvio del Commodore 64 BASIC…';
    try {
      const core = requestedCore || coreForName(name);
      if (!core) throw new Error('formato non supportato');
      activeCore = core;
      message.textContent = 'Caricamento core ' + core.system + '…';
      const useWorklet = supportsAudioWorklet();
      const audioDriver = useWorklet ? 'audioworklet' : 'rwebaudio';
      const optimizedSnes = core.id === 'snes' && useWorklet && supportsWasmSimd();
      const qualitySnes = optimizedSnes && localStorage.getItem('snesProfile') === 'quality';
      const snesEngine = qualitySnes ? 'snes9x2005_plus' : 'snes9x2005';
      const optimizedC64 = core.id === 'c64' && useWorklet && supportsWasmSimd();
      const c64Profile = getC64Profile();
      const moduleUrl = optimizedSnes
        ? './wasm/worklet/' + snesEngine + '_libretro.js?v=snes1'
        : optimizedC64
        ? './wasm/worklet/vice_x64_fast_libretro.js?v=c64simd5'
        : useWorklet
        ? core.module.replace('./wasm/', './wasm/worklet/').replace('systems1', 'worklet1')
        : core.module;
      const module = await import(moduleUrl);
      const instance = await module.default({ canvas: screen, noInitialRun: true });
      activeInstance = instance;
      activeC64Basic = core.id === 'c64' && !romData;
      // Read-only diagnostic counters, queried by the TV Web Inspector.
      window.retroarchDiagnostics = function () {
        return {
          audioDriver: audioDriver,
          system: core.system,
          snesEngine: core.id === 'snes' ? (optimizedSnes ? snesEngine : 'snes9x2010') : null,
          c64Engine: core.id === 'c64' ? (optimizedC64 ? 'x64-o3-lto-simd' : 'x64-compatible') : null,
          c64Profile: core.id === 'c64' ? c64Profile : null,
          emulatedFrames: optimizedSnes ? Number(instance._video_driver_get_frame_count()) : null,
          underruns: useWorklet ? instance._audio_driver_get_underruns() : null,
          bufferMs: useWorklet ? instance._audio_driver_get_buffer_latency_ms() : 192
        };
      };
      if (romData) {
        const data = new Uint8Array(romData);
        instance.FS.writeFile('/' + name, data);
      }
      ensureDirectory(instance, '/saves');
      const c64Controls = core.id === 'c64';
      const c64KeyboardMode = activeC64Basic;
      const player1A = c64KeyboardMode ? 'nul' : 'x';
      const player1B = c64KeyboardMode ? 'nul' : (c64Controls ? 'enter' : 'z');
      const player1Y = c64KeyboardMode ? 'nul' : 'a';
      const player1X = c64KeyboardMode ? 'nul' : 's';
      const player1L = c64KeyboardMode ? 'nul' : 'q';
      const player1R = c64KeyboardMode ? 'nul' : 'w';
      const player1Select = c64KeyboardMode ? 'nul' : 's';
      const player1Start = c64KeyboardMode ? 'nul' : (c64Controls ? 'space' : 'enter');
      const player1Up = c64KeyboardMode ? 'nul' : 'up';
      const player1Down = c64KeyboardMode ? 'nul' : 'down';
      const player1Left = c64KeyboardMode ? 'nul' : 'left';
      const player1Right = c64KeyboardMode ? 'nul' : 'right';
      const outputRate = core.id === 'c64' && c64Profile !== 'compatibility' ? '44100' : '48000';
      instance.FS.writeFile('/retroarch.cfg', `
input_player1_a = "${player1A}"
input_player1_b = "${player1B}"
input_player1_y = "${player1Y}"
input_player1_x = "${player1X}"
input_player1_l = "${player1L}"
input_player1_r = "${player1R}"
input_player1_l2 = "nul"
input_player1_r2 = "nul"
input_player1_l3 = "nul"
input_player1_r3 = "nul"
input_player1_turbo = "nul"
input_player1_select = "${player1Select}"
input_player1_start = "${player1Start}"
input_player1_up = "${player1Up}"
input_player1_down = "${player1Down}"
input_player1_left = "${player1Left}"
input_player1_right = "${player1Right}"
input_player1_l_x_plus = "nul"
input_player1_l_x_minus = "nul"
input_player1_l_y_plus = "nul"
input_player1_l_y_minus = "nul"
input_player1_r_x_plus = "nul"
input_player1_r_x_minus = "nul"
input_player1_r_y_plus = "nul"
input_player1_r_y_minus = "nul"
input_player2_a = "${player1A}"
input_player2_b = "${player1B}"
input_player2_y = "${player1Y}"
input_player2_x = "${player1X}"
input_player2_l = "${player1L}"
input_player2_r = "${player1R}"
input_player2_l2 = "nul"
input_player2_r2 = "nul"
input_player2_l3 = "nul"
input_player2_r3 = "nul"
input_player2_turbo = "nul"
input_player2_select = "${player1Select}"
input_player2_start = "${player1Start}"
input_player2_up = "${player1Up}"
input_player2_down = "${player1Down}"
input_player2_left = "${player1Left}"
input_player2_right = "${player1Right}"
input_player2_l_x_plus = "nul"
input_player2_l_x_minus = "nul"
input_player2_l_y_plus = "nul"
input_player2_l_y_minus = "nul"
input_player2_r_x_plus = "nul"
input_player2_r_x_minus = "nul"
input_player2_r_y_plus = "nul"
input_player2_r_y_minus = "nul"
input_enable_hotkey = "${c64KeyboardMode ? 'f12' : 'nul'}"
input_toggle_fast_forward = "nul"
input_hold_fast_forward = "nul"
core_options_path = "/retroarch-core-options.cfg"
audio_driver = "${audioDriver}"
audio_out_rate = "${outputRate}"
audio_latency = "192"
audio_sync = "true"
audio_rate_control = "true"
audio_rate_control_delta = "0.005"
savestate_directory = "/saves"
savefile_directory = "/saves"
state_slot = "0"
video_vsync = "false"
video_swap_interval = "1"
video_refresh_rate = "60.000"
video_smooth = "false"
`);
      const coreOptions = core.id === 'c64' ? `
vice_joyport = "2"
vice_joyport_type = "1"
vice_physical_keyboard_pass_through = "enabled"
vice_keyboard_keymap = "symbolic"
vice_autostart = "enabled"
vice_drive_true_emulation = "${c64Profile === 'compatibility' ? 'enabled' : 'disabled'}"
vice_autoloadwarp = "${c64Profile === 'compatibility' ? 'disk_mute' : 'disabled'}"
vice_drive_sound_emulation = "${c64Profile === 'compatibility' ? '20%' : 'disabled'}"
vice_sid_engine = "${c64Profile === 'performance' ? 'FastSID' : 'ReSID'}"
vice_resid_sampling = "fast"
vice_sound_sample_rate = "${outputRate}"
vice_statusbar_messages = "enabled"
` : core.id === 'nes' ? `
fceumm_sndrate_hint = "48KHz"
fceumm_sndquality = "Low"
fceumm_sndlowpass = "disabled"
` : optimizedSnes ? `
snes9x_2005_region = "auto"
snes9x_2005_frameskip = "${qualitySnes ? 'manual' : 'disabled'}"
snes9x_2005_frameskip_threshold = "33"
` : '';
      instance.FS.writeFile('/retroarch-core-options.cfg', coreOptions);
      screen.hidden = false;
      gameControls.hidden = true;
      screen.focus();
      emulatorRunning = true;
      const args = ['--verbose', '--config', '/retroarch.cfg'];
      if (romData) args.push('/' + name);
      instance.callMain(args);
      if (!romData) {
        setTimeout(function () {
          try {
            if (typeof instance._cmd_start_core === 'function') instance._cmd_start_core();
            else instance.EmscriptenSendCommand('START_CORE');
          }
          catch (error) {
            console.error(error);
            message.textContent = 'Impossibile entrare nel BASIC: ' + error.message;
          }
        }, 250);
      }
      message.textContent = core.system + ' · ' + (useWorklet ? 'AudioWorklet' : 'WebAudio compatibile') + ': ' + name + ' · ' + gamepadStatus();
    } catch (error) {
      console.error(error);
      message.textContent = 'Impossibile avviare il core WASM: ' + error.message;
    }
  }

  document.querySelector('#rom-picker').addEventListener('change', async function (event) {
    const rom = event.target.files[0];
    if (!rom) return;
    await startRom(rom.name, await rom.arrayBuffer());
  });
  // Some USB adapters are translated into TV/media keys by the TV service.
  // Unlike arrows/Enter/Back, these keys must be registered explicitly.
  if (window.tizen && tizen.tvinputdevice) {
    try {
      const extraKeys = ['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop',
        'Menu', 'Info', 'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'];
      tizen.tvinputdevice.getSupportedKeys().forEach(function (key) {
        if (extraKeys.indexOf(key.name) >= 0) {
          try { tizen.tvinputdevice.registerKey(key.name); }
          catch (error) { console.warn('Tasto TV non registrato: ' + key.name, error); }
        }
      });
    } catch (error) { console.warn('Registrazione tasti TV non disponibile', error); }
  }
  renderMenu();
  renderC64Profile();
  joypadInput.poll();
  setInterval(function () { joypadInput.poll(); }, 16);
}());
