import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { developerRoomArtwork, developerRoomScene } from '../src/data/developerRoom.js';
import { translate } from '../src/data/translations.js';
import { secretCatalog } from '../src/data/secrets.js';

test('light mode selects the supplied daytime PNG and sunlight', () => {
  const scene = developerRoomScene('light', '/Portafolio/');
  assert.equal(scene.src, '/Portafolio/images/developer-desk-day.png');
  assert.equal(scene.light, 'sunlight');
  assert.equal(scene.theme, 'light');
  assert.deepEqual([scene.width, scene.height], [1024, 765]);
});

test('dark mode selects the supplied nighttime JPG and moonlight', () => {
  const scene = developerRoomScene('dark', '/Portafolio');
  assert.equal(scene.src, '/Portafolio/images/developer-desk-night.jpg');
  assert.equal(scene.light, 'moonlight');
  assert.equal(scene.theme, 'dark');
  assert.deepEqual([scene.width, scene.height], [2400, 1792]);
  assert.notEqual(scene.src, developerRoomScene('light', '/Portafolio').src);
});

test('scene selection is deterministic, immutable and defaults to the page light theme', () => {
  for (const theme of [undefined, null, 'system', '', 'invalid']) {
    assert.equal(developerRoomScene(theme).src, '/images/developer-desk-day.png');
  }
  assert.equal(developerRoomScene('dark', '').src, '/images/developer-desk-night.jpg');
  const scene = developerRoomScene('dark');
  scene.file = 'changed';
  assert.equal(developerRoomArtwork.dark.file, 'images/developer-desk-night.jpg');
  assert.ok(Object.isFrozen(developerRoomArtwork.light));
  assert.ok(Object.isFrozen(developerRoomArtwork.dark));
});

test('both artwork files preserve the exact user-supplied originals', async () => {
  const expected = {
    light: '4d437bd6f8f92fa721bcc7f475f18ed0d4da8d4d4c8de8f6ad167d037d5b69c4',
    dark: 'b229fc4556054ffabde7f267905fb3616570cab1eff631e2dd5f535ef919b91b',
  };
  for (const [theme, artwork] of Object.entries(developerRoomArtwork)) {
    const data = await readFile(new URL(`../public/${artwork.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), expected[theme]);
  }
});

test('scene captions are bilingual and the remaster preserves the six-secret catalog', () => {
  for (const theme of ['light', 'dark']) {
    const { caption } = developerRoomScene(theme);
    assert.equal(translate(caption, 'en'), caption);
    assert.notEqual(translate(caption, 'es'), caption);
  }
  assert.equal(secretCatalog.length, 6);
  assert.equal(secretCatalog.filter(secret => secret.id === 'developer-room').length, 1);
  assert.equal(secretCatalog.find(secret => secret.id === 'developer-room').view, 'room');
});
