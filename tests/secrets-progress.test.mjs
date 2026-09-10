import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { secretCatalog } from '../src/data/secrets.js';
import { readSecrets, saveSecrets, secretsStorageKey, unlockSecret } from '../src/hooks/useSecrets.js';

const originalWindow = globalThis.window;
afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function memoryStorage(value = null) {
  const entries = new Map(value === null ? [] : [[secretsStorageKey, value]]);
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, item) => entries.set(key, item),
  };
}

test('secret catalog counts only the two implemented discoveries with separate views and hints', () => {
  assert.deepEqual(secretCatalog.map(secret => secret.id), ['developer-room', 'backend']);
  assert.equal(new Set(secretCatalog.map(secret => secret.id)).size, secretCatalog.length);
  assert.equal(new Set(secretCatalog.map(secret => secret.view)).size, secretCatalog.length);
  assert.ok(secretCatalog.every(secret => secret.title && secret.description && secret.hint));
});

test('adding the backend preserves existing progress and never counts a second inspection twice', () => {
  const storage = memoryStorage('["developer-room"]');
  const previous = readSecrets(storage);
  assert.deepEqual(previous, ['developer-room']);
  const both = unlockSecret(previous, 'backend');
  assert.deepEqual(both, ['developer-room', 'backend']);
  assert.deepEqual(previous, ['developer-room']);
  assert.strictEqual(unlockSecret(both, 'backend'), both);
  saveSecrets(both, storage);
  assert.deepEqual(readSecrets(storage), both);
});

test('the rear secret can be found first and progress retains catalog order', () => {
  const backend = unlockSecret([], 'backend');
  assert.deepEqual(backend, ['backend']);
  assert.deepEqual(unlockSecret(backend, 'developer-room'), ['developer-room', 'backend']);
  const storage = memoryStorage('["backend","unknown","backend","developer-room"]');
  assert.deepEqual(readSecrets(storage), ['developer-room', 'backend']);
});

test('secret progress safely rejects malformed or differently shaped saved data', () => {
  for (const value of [null, '', 'broken json', 'null', 'true', '42', '{}', '"developer-room"', '{"foundIds":["developer-room"]}']) {
    assert.deepEqual(readSecrets(memoryStorage(value)), [], String(value));
  }
});

test('stored discoveries are filtered, deduplicated and saved in catalog order', () => {
  const storage = memoryStorage('["future-secret", "developer-room", "developer-room", null, {}, 3]');
  assert.deepEqual(readSecrets(storage), ['developer-room']);
  saveSecrets(['unknown', 'developer-room', 'developer-room'], storage);
  assert.equal(storage.getItem(secretsStorageKey), '["developer-room"]');
  assert.deepEqual(readSecrets(storage), ['developer-room']);
  saveSecrets(null, storage);
  assert.deepEqual(readSecrets(storage), []);
});

test('unlock is immutable, ignores unknown IDs and never double-counts a discovery', () => {
  const empty = [];
  const found = unlockSecret(empty, 'developer-room');
  assert.deepEqual(empty, []);
  assert.deepEqual(found, ['developer-room']);
  assert.strictEqual(unlockSecret(found, 'developer-room'), found);
  assert.strictEqual(unlockSecret(found, 'future-secret'), found);
  assert.strictEqual(unlockSecret(empty, 'future-secret'), empty);
  assert.deepEqual(unlockSecret(null, 'developer-room'), ['developer-room']);
  assert.deepEqual(unlockSecret(['unknown', 'developer-room', 'developer-room'], 'developer-room'), ['developer-room']);
});

test('secret progress still works when storage is missing or throws', () => {
  delete globalThis.window;
  assert.deepEqual(readSecrets(), []);
  assert.doesNotThrow(() => saveSecrets(['developer-room']));
  assert.deepEqual(readSecrets(null), []);
  assert.doesNotThrow(() => saveSecrets(['developer-room'], null));
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(readSecrets(blocked), []);
  assert.doesNotThrow(() => saveSecrets(['developer-room'], blocked));
  globalThis.window = { get localStorage() { throw new Error('browser policy'); } };
  assert.deepEqual(readSecrets(), []);
  assert.doesNotThrow(() => saveSecrets(['developer-room']));
});

test('default browser storage persists discoveries across reads', () => {
  globalThis.window = { localStorage: memoryStorage() };
  saveSecrets(unlockSecret(readSecrets(), 'developer-room'));
  assert.deepEqual(readSecrets(), ['developer-room']);
});
