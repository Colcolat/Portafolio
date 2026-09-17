import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryGames, memoryGameById } from '../src/data/memoryGames.js';
import { createMemoryDeck, memorySymbols } from '../src/hooks/memoryGame.js';
import { secretCatalog } from '../src/data/secrets.js';
import { readSecrets, saveSecrets } from '../src/hooks/useSecrets.js';

test('the four pairs represent exactly Juan’s favourite games with distinct labels', () => {
  assert.deepEqual(memoryGames.map(game => game.title), ['League of Legends', 'Elden Ring', 'Team Fortress 2', 'Ghost of Tsushima']);
  assert.deepEqual(memoryGames.map(game => game.id), memorySymbols);
  assert.equal(new Set(memoryGames.map(game => game.shortTitle)).size, 4);
  assert.ok(Object.isFrozen(memoryGames));
  assert.ok(Object.isFrozen(memoryGameById));
  for (const game of memoryGames) {
    assert.ok(Object.isFrozen(game));
    assert.equal(memoryGameById[game.id], game);
    assert.ok(game.shortTitle.length <= 5, 'short card captions fit the mobile grid');
    assert.equal(createMemoryDeck().filter(symbol => symbol === game.id).length, 2);
  }
});

test('new memory card artwork neither adds a secret nor changes earlier discoveries', () => {
  const found = ['developer-room', 'backend', 'cartridge'];
  assert.ok(found.every(id => secretCatalog.some(secret => secret.id === id)));
  assert.equal(secretCatalog.filter(secret => secret.id === 'cartridge').length, 1);
  assert.ok(memorySymbols.every(id => !secretCatalog.some(secret => secret.id === id)), 'individual memory pairs do not count as discoveries');
  let stored = JSON.stringify(found);
  const storage = { getItem: () => stored, setItem: (_key, value) => { stored = value; } };
  saveSecrets(readSecrets(storage), storage);
  assert.deepEqual(JSON.parse(stored), found);
});
