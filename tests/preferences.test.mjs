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
    'Inspect the rear engraving', 'You found the backend', 'The tools on the other side of the screen.',
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

test('translated templates preserve every data placeholder', () => {
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const [english, spanish] of Object.entries(spanishTranslations)) {
    assert.deepEqual(placeholders(spanish), placeholders(english), english);
  }
  assert.equal(translate('Project {number}: {title}', 'es', { number: 1, title: 'SkillVault' }), 'Proyecto 1: SkillVault');
  assert.equal(translate('Email: {email}', 'es', { email: 'test@example.com' }), 'Correo: test@example.com');
  assert.equal(translate('MODULE {number}', 'en', { number: '02' }), 'MODULE 02');
});
