import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../joypad-input.js', import.meta.url), 'utf8');
function setup(saved) {
  let clock = 1000, pads = [], playing = false;
  const storage = new Map(saved ? [['retroarchGamepadMapping', JSON.stringify(saved)]] : []);
  const events = [];
  const context = {
    navigator: { getGamepads: () => pads },
    Date: { now: () => clock },
    localStorage: {
      getItem: key => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    }
  };
  vm.runInNewContext(source, context);
  const input = context.createJoypadInput({
    canPlay: () => playing, isSettings: () => !playing,
    emit: (action, down) => events.push([action, down])
  });
  return { input, storage, events,
    advance(ms = 300) { clock += ms; input.poll(); },
    pads(value) { pads = value; input.poll(); },
    play(value = true) { playing = value; input.poll(); }
  };
}
const key = (type, keyCode = 179, extra = {}) => ({
  type, keyCode, key: 'Unidentified', code: 'Unidentified', target: { tagName: 'BUTTON' }, ...extra
});

// Calibration must see a button on a second pad, including older numeric arrays.
const a = setup();
const idle = { id: 'unused adapter port', index: 0, buttons: [0, 0] };
const controller = { id: 'PS1 USB', index: 2, buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
a.pads([idle, null, controller]);
a.input.begin('start');
a.advance();
controller.buttons[9] = 1;
a.pads([idle, null, controller]);
assert.equal(a.input.status().mapping.start.button, 9);
assert.equal(a.input.status().mapping.start.padId, 'PS1 USB');
a.play();
assert.deepEqual(a.events, [['start', true]]);
a.pads([]);
assert.deepEqual(a.events.at(-1), ['start', false]);

// A held activation button must be released before it can be captured.
const b = setup();
b.pads([controller]);
b.input.begin('select');
b.advance();
assert.equal(b.input.status().mapping.select, null);
controller.buttons[9] = 0;
b.pads([controller]);
controller.buttons[8] = { pressed: true, value: 1 };
b.pads([controller]);
assert.equal(b.input.status().mapping.select.button, 8);

// TV key-only devices never appear in getGamepads; legacy key codes still work.
const c = setup();
c.input.begin('start');
c.advance();
assert.equal(c.input.handleKey(key('keydown')), true);
assert.equal(c.input.status().mapping.start.token, 'number:179');
c.input.handleKey(key('keyup'));
c.play();
assert.equal(c.input.handleKey(key('keydown')), true);
assert.deepEqual(c.events.at(-1), ['start', true]);
c.input.handleKey(key('keyup'));
assert.deepEqual(c.events.at(-1), ['start', false]);
const reloaded = setup(JSON.parse(c.storage.get('retroarchGamepadMapping')));
assert.equal(reloaded.input.status().mapping.start.token, 'number:179');

// Calibration consumes navigation and does not capture autorepeat/activation.
const d = setup();
d.input.begin('select');
d.input.handleKey(key('keydown', 13, { key: 'Enter', code: 'Enter' }));
d.advance();
d.input.handleKey(key('keydown', 13, { key: 'Enter', code: 'Enter', repeat: true }));
assert.equal(d.input.status().mapping.select, null);
d.input.handleKey(key('keyup', 13, { key: 'Enter', code: 'Enter' }));
d.input.handleKey(key('keydown', 32, { key: ' ', code: 'Space' }));
assert.equal(d.input.status().mapping.select.token, 'code:Space');

// Release on menus, blur, or controller loss; do not swallow typed text.
c.input.handleKey(key('keydown'));
c.play(false);
assert.deepEqual(c.events.at(-1), ['start', false]);
c.play(true);
c.input.release();
assert.deepEqual(c.events.at(-1), ['start', false]);
assert.equal(c.input.handleKey(key('keydown', 179, { target: { tagName: 'INPUT' } })), false);
assert.equal(c.input.handleKey(key('keydown', 179, { retroarchJoypad: true })), false);

// Existing integer mappings migrate; missing input times out without saving.
assert.equal(setup({ start: 9, select: 8 }).input.status().mapping.select.button, 8);
const e = setup();
e.input.begin('start');
e.advance(21000);
assert.equal(e.input.status().capture, null);
assert.equal(e.input.status().mapping.start, null);
assert.match(e.input.status().note, /Nessun segnale/);
e.input.begin('start');
e.advance();
e.input.handleKey(key('keydown', 10009));
assert.equal(e.input.status().capture, null);
assert.equal(e.input.status().mapping.start, null);
console.log('PASS: multi-pad/legacy buttons, key-only TV input, calibration, persistence, release and timeout.');
