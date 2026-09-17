import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readPreference, savePreference } from '../src/hooks/usePreferences.js';
import { spanishTranslations, translate } from '../src/data/translations.js';

const originalWindow = globalThis.window;
afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function withStorage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  globalThis.window = { localStorage: {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  } };
  return entries;
}

test('first visit enables sound and retains the original English/light presentation', () => {
  withStorage();
  assert.equal(readPreference('sound', ['true', 'false'], 'true'), 'true');
  assert.equal(readPreference('language', ['en', 'es'], 'en'), 'en');
  assert.equal(readPreference('theme', ['light', 'dark'], 'light'), 'light');
});

test('explicit sound, language and theme choices survive storage round trips', () => {
  withStorage();
  savePreference('sound', false);
  savePreference('language', 'es');
  savePreference('theme', 'dark');
  assert.equal(readPreference('sound', ['true', 'false'], 'true'), 'false');
  assert.equal(readPreference('language', ['en', 'es'], 'en'), 'es');
  assert.equal(readPreference('theme', ['light', 'dark'], 'light'), 'dark');
});

test('invalid saved values fall back safely', () => {
  withStorage({ 'pocketfolio.sound': 'not-a-boolean', 'pocketfolio.language': 'fr', 'pocketfolio.theme': '' });
  assert.equal(readPreference('sound', ['true', 'false'], 'true'), 'true');
  assert.equal(readPreference('language', ['en', 'es'], 'en'), 'en');
  assert.equal(readPreference('theme', ['light', 'dark'], 'light'), 'light');
});

test('blocked browser storage does not prevent preferences from working', () => {
  globalThis.window = { get localStorage() { throw new Error('Storage unavailable'); } };
  assert.equal(readPreference('sound', ['true', 'false'], 'true'), 'true');
  assert.doesNotThrow(() => savePreference('theme', 'dark'));
});

test('translation preserves English, project names, and unknown content', () => {
  assert.equal(translate('Small screen.', 'en'), 'Small screen.');
  assert.equal(translate('Small screen.', 'es'), 'Pantalla pequeña.');
  assert.equal(translate('SkillVault', 'es'), 'SkillVault');
  assert.equal(translate('AWS Cloud Quest: Cloud Practitioner', 'es'), 'AWS Cloud Quest: Cloud Practitioner');
});

test('rear controls, hints and backend reward have complete Spanish copy', () => {
  const keys = ['Show the front of the console', 'Show the back of the console', 'Front view', 'Turn over',
    'Inspect the backend panel', 'Remove rear screw {number}', 'Rear screw {number} removed', 'Restore cover',
    'Cover removed. An inner panel is now accessible.', 'All four screws removed. The cover is falling.',
    '{count} of 4 screws removed.', 'You found the backend', 'The tools on the other side of the screen.',
    'There is more than one side to this little world.', 'The unseen part matters, too.',
    'A closer look at the technologies and practices behind my work.', 'Backend field notes',
    'BACKEND / FIELD NOTES', 'Backend Developer', 'Languages', 'Data', 'In practice', 'IN PRACTICE',
    'Project technologies', 'Inspect the source', 'opens in a new tab'];
  for (const key of keys) {
    assert.ok(spanishTranslations[key], key);
    assert.notEqual(translate(key, 'es'), key);
    assert.equal(translate(key, 'en'), key);
  }
});

test('the cartridge discovery and memory game have Spanish copy without exposing hidden symbols', () => {
  for (const key of ['Pocket logo', 'Secret cartridge', 'BONUS CARTRIDGE', 'A: LOAD CARTRIDGE',
    'Pocket pairs', 'Pairs', 'Attempts', 'Memory cards', 'Shuffle & restart', 'Play again',
    'All four pairs found. Nice memory!', 'Four favourite worlds. One little cartridge.', 'My favourite games']) {
    assert.ok(spanishTranslations[key], key);
    assert.notEqual(translate(key, 'es'), key);
  }
  assert.equal(translate('Card {number}: face down', 'es', { number: 3 }), 'Carta 3: boca abajo');
  for (const symbol of ['League of Legends', 'Elden Ring', 'Team Fortress 2', 'Ghost of Tsushima']) {
    assert.equal(translate(symbol, 'es'), symbol, 'official game titles are never translated');
    assert.equal(translate('Card {number}: {symbol}, matched', 'es', { number: 3, symbol }), `Carta 3: ${symbol}, pareja encontrada`);
  }
});

test('translated templates preserve every data placeholder', () => {
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const [english, spanish] of Object.entries(spanishTranslations)) {
    assert.deepEqual(placeholders(spanish), placeholders(english), english);
  }
  assert.equal(translate('Project {number}: {title}', 'es', { number: 1, title: 'SkillVault' }), 'Proyecto 1: SkillVault');
  assert.equal(translate('Email: {email}', 'es', { email: 'test@example.com' }), 'Correo: test@example.com');
  assert.equal(translate('MODULE {number}', 'en', { number: '02' }), 'MODULE 02');
});

test('radio, concert story and accessible playback controls have Spanish copy', () => {
  const keys = ['Pocket radio', 'Console speaker', 'A small frequency, a little piece of my soul.',
    'Some sounds are waiting behind the little grille.', 'A FREQUENCY JUST FOR YOU',
    'One of the pieces I play on the piano.', 'Below, you’ll find a piece of my soul.',
    'Follow the light', 'Back to the pocket world', 'A little further, a little closer.',
    'Ready to listen', 'Tuning in…', 'Now playing', 'Music paused', 'Sound is off',
    'Press play to begin the music.', 'The recording could not load. You can try again.',
    'Pause music', 'Play music', 'Pause', 'Play', 'A piece of my soul', 'Return to the little screen',
    'An intimate recital', 'I dedicate my favourite melody to you.', 'Some things are easier to say with music.',
    'For you, wherever you are.', 'Piano music controls', 'A favourite piece from my repertoire.',
    'Pause melody', 'Play melody', 'Loading', 'Mute piano music', 'Unmute piano music',
    'Behind the melody', 'It began when I was five.',
    'I have played the piano since I was five and have taken part in concerts.', 'My piano teacher was',
    'This is another part of me. Thank you for finding it.', 'Pieces I love to play', 'My favourite melody',
    'A hidden room. An open heart.', 'Back to the portfolio', 'Ready when you are.', 'The melody is loading…',
    'Let the music stay a little longer.', 'A moment of silence.', 'Press play to begin the melody.',
    'The recording could not load. You can try playing it again.', 'Sound is off. The room is still yours.'];
  for (const key of keys) {
    assert.ok(spanishTranslations[key], key);
    assert.notEqual(translate(key, 'es'), key);
    assert.equal(translate(key, 'en'), key);
  }
});
