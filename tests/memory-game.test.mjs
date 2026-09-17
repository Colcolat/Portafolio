import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryDeck, createMemoryGame, memoryGameReducer, memoryNeighbor, memoryRevealDelay, memorySymbols } from '../src/hooks/memoryGame.js';

const orderedDeck = ['league', 'elden-ring', 'tf2', 'ghost', 'league', 'elden-ring', 'tf2', 'ghost'];
const flip = (state, index) => memoryGameReducer(state, { type: 'flip', index });
const resolve = state => memoryGameReducer(state, { type: 'resolve' });

test('shuffle always returns eight cards with four complete pairs without changing symbol definitions', () => {
  for (const random of [() => 0, () => 0.5, () => 0.999999, () => 1]) {
    const deck = createMemoryDeck(random);
    assert.equal(deck.length, 8);
    for (const symbol of memorySymbols) assert.equal(deck.filter(card => card === symbol).length, 2);
  }
  assert.deepEqual(createMemoryDeck(() => 0.999999), orderedDeck);
  assert.notDeepEqual(createMemoryDeck(() => 0), orderedDeck);
  assert.deepEqual(memorySymbols, ['league', 'elden-ring', 'tf2', 'ghost']);
});

test('new games validate and copy their deck with no existing score', () => {
  const deck = [...orderedDeck];
  const game = createMemoryGame(deck);
  deck[0] = 'ghost';
  assert.deepEqual(game, { deck: orderedDeck, flipped: [], matched: [], moves: 0, phase: 'playing' });
  for (const invalid of [null, [], ['league'], Array(8).fill('league'), ['vault', 'bolt', 'sprout', 'smile', 'vault', 'bolt', 'sprout', 'smile'], [...orderedDeck.slice(0, 7), 'unknown']]) {
    assert.throws(() => createMemoryGame(invalid));
  }
});

test('a single reveal does not count a move; duplicate and invalid clicks are ignored immutably', () => {
  const initial = createMemoryGame(orderedDeck);
  const first = flip(initial, 0);
  assert.deepEqual(initial.flipped, []);
  assert.deepEqual(first.flipped, [0]);
  assert.equal(first.moves, 0);
  for (const index of [0, -1, 8, NaN, 1.5, '1']) assert.strictEqual(flip(first, index), first);
  assert.strictEqual(resolve(first), first);
});

test('two different cards lock input for the reveal window and a mismatch hides both', () => {
  const comparing = flip(flip(createMemoryGame(orderedDeck), 0), 1);
  assert.equal(comparing.phase, 'comparing');
  assert.equal(comparing.moves, 1);
  assert.deepEqual(comparing.flipped, [0, 1]);
  assert.strictEqual(flip(comparing, 2), comparing);
  assert.equal(memoryRevealDelay, 850);
  const next = resolve(comparing);
  assert.equal(next.phase, 'playing');
  assert.deepEqual(next.flipped, []);
  assert.deepEqual(next.matched, []);
  assert.equal(next.moves, 1);
  assert.deepEqual(comparing.flipped, [0, 1]);
});

test('matching pairs remain revealed, cannot be selected again, and four pairs win', () => {
  let game = createMemoryGame(orderedDeck);
  for (let index = 0; index < 4; index += 1) {
    game = resolve(flip(flip(game, index), index + 4));
    assert.equal(game.matched.length, (index + 1) * 2);
    assert.strictEqual(flip(game, index), game);
  }
  assert.equal(game.phase, 'won');
  assert.equal(game.moves, 4);
  assert.strictEqual(resolve(game), game);
  assert.strictEqual(flip(game, 0), game);
});

test('restart clears pending comparisons, matches and score, ignoring a late resolve', () => {
  let game = resolve(flip(flip(createMemoryGame(orderedDeck), 0), 4));
  game = flip(flip(game, 1), 2);
  const restarted = memoryGameReducer(game, { type: 'reset', deck: [...orderedDeck].reverse() });
  assert.deepEqual(restarted, createMemoryGame([...orderedDeck].reverse()));
  assert.strictEqual(resolve(restarted), restarted);
  assert.strictEqual(memoryGameReducer(restarted, { type: 'unknown' }), restarted);
});

test('keyboard navigation follows the four-column board and leaves Escape and activation alone', () => {
  assert.equal(memoryNeighbor(0, 'ArrowLeft'), 7);
  assert.equal(memoryNeighbor(7, 'ArrowRight'), 0);
  assert.equal(memoryNeighbor(1, 'ArrowDown'), 5);
  assert.equal(memoryNeighbor(5, 'ArrowUp'), 1);
  assert.equal(memoryNeighbor(6, 'Home'), 4);
  assert.equal(memoryNeighbor(4, 'End'), 7);
  for (const key of ['Escape', 'Enter', ' ', 'Tab']) assert.equal(memoryNeighbor(3, key), 3);
});
