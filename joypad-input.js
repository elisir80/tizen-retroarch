(function (root) {
  'use strict';

  // Controllers can expose either Gamepad buttons or keyboard events on TV.
  root.createJoypadInput = function (options) {
    const storageKey = 'retroarchGamepadMapping';
    const actions = ['start', 'select'];
    let mapping = { start: null, select: null };
    let capture = null;
    let pads = [];
    let previousButtons = [];
    let heldKeys = {};
    let output = { start: false, select: false };
    let note = '';
    let lastSignal = '';

    function validBinding(value) {
      if (Number.isInteger(value) && value >= 0) return { kind: 'button', button: value };
      if (!value || typeof value !== 'object') return null;
      if (value.kind === 'button' && Number.isInteger(value.button) && value.button >= 0)
        return { kind: 'button', button: value.button, padId: value.padId || '' };
      if (value.kind === 'key' && typeof value.token === 'string' && value.token)
        return { kind: 'key', token: value.token, label: String(value.label || value.token) };
      return null;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      actions.forEach(function (action) { mapping[action] = validBinding(saved[action]); });
    } catch (_) {}

    function readPads() {
      try {
        return navigator.getGamepads
          ? Array.prototype.filter.call(navigator.getGamepads(), function (pad) {
            return pad && pad.connected !== false;
          }) : [];
      } catch (_) { return []; }
    }

    function pressedButtons() {
      const buttons = [];
      pads.forEach(function (pad) {
        Array.prototype.forEach.call(pad.buttons || [], function (button, index) {
          const pressed = typeof button === 'number' ? button >= 0.5 :
            typeof button === 'boolean' ? button : button && (button.pressed || button.value >= 0.5);
          if (pressed) buttons.push({ kind: 'button', button: index, padId: pad.id || '', padIndex: pad.index });
        });
      });
      return buttons;
    }

    function buttonToken(button) {
      return button.padIndex + ':' + button.padId + ':' + button.button;
    }

    function keyBinding(event) {
      const code = event.code && event.code !== 'Unidentified' ? event.code : '';
      const keyCode = event.keyCode || event.which || 0;
      const key = event.key && event.key !== 'Unidentified' ? event.key : '';
      const token = code ? 'code:' + code : keyCode ? 'number:' + keyCode : key ? 'key:' + key : '';
      return token ? { kind: 'key', token: token, label: key || code || String(keyCode) } : null;
    }

    function bindingLabel(binding) {
      if (!binding) return 'non impostato';
      return binding.kind === 'button' ? 'pulsante ' + binding.button : 'tasto ' + binding.label;
    }

    function status() {
      return {
        mapping: mapping,
        capture: capture ? capture.action : null,
        note: note,
        lastSignal: lastSignal,
        devices: pads.map(function (pad) { return { id: pad.id, index: pad.index, buttons: pad.buttons.length }; }),
        startLabel: bindingLabel(mapping.start),
        selectLabel: bindingLabel(mapping.select)
      };
    }

    function notify() { if (options.onChange) options.onChange(status()); }

    function finishCapture(binding) {
      const action = capture.action;
      const other = action === 'start' ? 'select' : 'start';
      const same = binding.kind === 'key'
        ? mapping[other] && mapping[other].token === binding.token
        : mapping[other] && mapping[other].kind === 'button' &&
          mapping[other].button === binding.button && mapping[other].padId === binding.padId;
      if (same) {
        note = 'Questo pulsante è già assegnato a ' + other.toUpperCase() + '. Premi un altro pulsante.';
        notify();
        return;
      }
      mapping[action] = validBinding(binding);
      capture = null;
      note = action.toUpperCase() + ' memorizzato: ' + bindingLabel(binding) + '.';
      try { localStorage.setItem(storageKey, JSON.stringify(mapping)); }
      catch (_) { note += ' Salvataggio permanente non disponibile.'; }
      notify();
    }

    function sync(buttons) {
      const enabled = !capture && options.canPlay();
      actions.forEach(function (action) {
        const binding = mapping[action];
        const down = !!(enabled && binding && (binding.kind === 'key'
          ? heldKeys[binding.token]
          : buttons.some(function (button) {
            return button.button === binding.button && (!binding.padId || button.padId === binding.padId);
          })));
        if (down !== output[action]) {
          output[action] = down;
          options.emit(action, down);
        }
      });
    }

    function poll() {
      const oldDevices = pads.map(function (pad) { return pad.index + ':' + pad.id; }).join('|');
      pads = readPads();
      const buttons = pressedButtons();
      const tokens = buttons.map(buttonToken);
      const newlyPressed = buttons.filter(function (button) { return previousButtons.indexOf(buttonToken(button)) < 0; });
      previousButtons = tokens;
      if (newlyPressed.length) {
        lastSignal = 'Controller ' + (newlyPressed[0].padIndex + 1) + ', pulsante ' + newlyPressed[0].button;
        if (capture && Date.now() >= capture.readyAt) finishCapture(newlyPressed[0]);
        notify();
      }
      if (capture && Date.now() >= capture.deadline) {
        capture = null;
        note = 'Nessun segnale ricevuto. Riprova oppure assegna un altro pulsante libero del joypad (per esempio L1 o R1).';
        notify();
      }
      if (oldDevices !== pads.map(function (pad) { return pad.index + ':' + pad.id; }).join('|')) notify();
      sync(buttons);
    }

    function cancel() {
      capture = null;
      note = 'Configurazione annullata.';
      sync(pressedButtons());
      notify();
    }

    function handleKey(event) {
      if (event.retroarchJoypad) return false;
      const editing = event.target && (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' || event.target.isContentEditable);
      const binding = keyBinding(event);
      const down = event.type === 'keydown';
      const wasHeld = binding && heldKeys[binding.token];
      if (binding) {
        if (down && !editing) heldKeys[binding.token] = true;
        else if (!down) delete heldKeys[binding.token];
      }
      if (editing) return false;
      if (options.isSettings() && down) {
        lastSignal = 'Tasto ' + (binding ? binding.label : 'sconosciuto') + ' (codice ' + (event.keyCode || 0) + ')';
        notify();
      }
      if (capture) {
        if (down && (event.key === 'Escape' || event.keyCode === 10009)) cancel();
        else if (down && binding && !wasHeld && !event.repeat && Date.now() >= capture.readyAt) finishCapture(binding);
        return true;
      }
      const mapped = actions.some(function (action) {
        return binding && mapping[action] && mapping[action].kind === 'key' && mapping[action].token === binding.token;
      });
      sync(pressedButtons());
      return mapped && options.canPlay();
    }

    function release() {
      heldKeys = {};
      actions.forEach(function (action) {
        if (output[action]) { output[action] = false; options.emit(action, false); }
      });
    }

    return {
      poll: poll,
      status: status,
      handleKey: handleKey,
      release: release,
      cancel: cancel,
      begin: function (action) {
        const activationKeys = heldKeys;
        release();
        heldKeys = activationKeys;
        pads = readPads();
        previousButtons = pressedButtons().map(buttonToken);
        capture = { action: action, readyAt: Date.now() + 250, deadline: Date.now() + 20000 };
        note = 'Rilascia i tasti, poi premi ' + action.toUpperCase() + ' sul joypad. BACK/ESC annulla.';
        notify();
      },
      reset: function () {
        release();
        capture = null;
        mapping = { start: null, select: null };
        try { localStorage.removeItem(storageKey); } catch (_) {}
        note = 'Mappatura cancellata.';
        notify();
      }
    };
  };
}(typeof window !== 'undefined' ? window : globalThis));
