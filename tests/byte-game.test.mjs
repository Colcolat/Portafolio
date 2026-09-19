import test from 'node:test';
import assert from 'node:assert/strict';
import { BYTE_GAME_SIZE, BYTE_TICK_MS, BYTE_REWARD_SCORE, BYTE_STORAGE_KEY,
  freshByteGame, byteGameReducer, nextByteFood, canEarnByteReward } from '../src/hooks/byteGame.js';
import { unlockSecret } from '../src/hooks/useSecrets.js';

const tick = state => byteGameReducer(state, { type: 'tick', random: 0 });

test('arcade rules and record key remain compatible', () => {
  assert.equal(BYTE_GAME_SIZE, 12);
  assert.equal(BYTE_TICK_MS, 180);
  assert.equal(BYTE_STORAGE_KEY, 'colcolat-byte-game-high-score');
  assert.equal(BYTE_REWARD_SCORE, 8);
  assert.deepEqual(freshByteGame().snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
});

test('a stored record never earns the trophy or starts a round', () => {
  for (const record of [8, 20, 141, '999']) {
    const state = freshByteGame(record);
    assert.equal(state.status, 'ready');
    assert.equal(state.score, 0);
    assert.equal(canEarnByteReward(state), false);
  }
  for (const record of [null, '', 'broken', -1, Infinity]) assert.equal(freshByteGame(record).highScore, 0);
  assert.equal(freshByteGame('6.5').highScore, 6);
});

test('start, explicit pause, resume and reset do not lose the record', () => {
  let state = byteGameReducer(freshByteGame(10), { type: 'primary' });
  assert.equal(state.status, 'playing');
  state = byteGameReducer(state, { type: 'pause' });
  assert.equal(state.status, 'paused');
  assert.strictEqual(tick(state), state);
  assert.strictEqual(byteGameReducer(state, { type: 'pause' }), state);
  state = byteGameReducer(state, { type: 'primary' });
  assert.equal(state.status, 'playing');
  state = byteGameReducer(state, { type: 'reset' });
  assert.equal(state.status, 'ready');
  assert.equal(state.highScore, 10);
});

test('only one non-reversing turn is accepted per tick', () => {
  const initial = freshByteGame(0, 'playing');
  for (const direction of ['left', 'right', 'invalid', 'constructor']) {
    assert.strictEqual(byteGameReducer(initial, { type: 'turn', direction }), initial);
  }
  const queued = byteGameReducer(initial, { type: 'turn', direction: 'up' });
  assert.strictEqual(byteGameReducer(queued, { type: 'turn', direction: 'left' }), queued);
  const next = tick(queued);
  assert.deepEqual(next.snake[0], { x: 5, y: 4 });
  assert.equal(next.direction, 'up');
  assert.equal(next.queuedDirection, null);
});

test('eating grows the snake and scores; ordinary ticks do not', () => {
  let state = freshByteGame(0, 'playing');
  state = tick(tick(state));
  assert.equal(state.score, 0);
  state = tick(state);
  assert.equal(state.score, 1);
  assert.equal(state.highScore, 1);
  assert.equal(state.snake.length, 4);
  assert.ok(!state.snake.some(cell => cell.x === state.food.x && cell.y === state.food.y));
});

test('a deterministic playable round earns the eighth byte without pausing or ending it', () => {
  let state = freshByteGame(20, 'playing');
  // Feed each next legal cell along a right-angle path, using the real tick reducer.
  const path = [[6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [10, 6], [10, 7], [10, 8]];
  let found = ['developer-room', 'backend', 'cartridge', 'radio', 'visitor'];
  for (const [index, [x, y]] of path.entries()) {
    if (index === 5) state = byteGameReducer(state, { type: 'turn', direction: 'down' });
    state = tick({ ...state, food: { x, y } });
    assert.equal(state.score, index + 1);
    assert.equal(canEarnByteReward(state), index === 7);
    assert.equal(state.status, 'playing');
    if (canEarnByteReward(state)) found = unlockSecret(found, 'byte-reward');
  }
  assert.equal(state.snake.length, 11);
  assert.deepEqual(found, ['developer-room', 'backend', 'cartridge', 'radio', 'visitor', 'byte-reward']);
  assert.strictEqual(unlockSecret(found, 'byte-reward'), found);
});

test('the threshold works for active, paused and completed rounds, never malformed scores', () => {
  for (const status of ['playing', 'paused', 'over', 'won']) {
    assert.equal(canEarnByteReward({ score: 7, highScore: 100, status }), false);
    assert.equal(canEarnByteReward({ score: 8, status }), true);
    assert.equal(canEarnByteReward({ score: 9, status }), true);
  }
  for (const score of [undefined, null, '8', 8.5, Infinity, NaN]) assert.equal(canEarnByteReward({ score, status: 'playing' }), false);
  assert.equal(canEarnByteReward({ score: 8, status: 'ready' }), false);
  assert.equal(canEarnByteReward(null), false);
});

test('restarting clears the current round so earlier partial scores cannot accumulate', () => {
  const state = byteGameReducer({ ...freshByteGame(7, 'over'), score: 7 }, { type: 'primary' });
  assert.equal(state.score, 0);
  assert.equal(state.highScore, 7);
  assert.equal(canEarnByteReward(state), false);
});

test('wall and body collisions end the round without granting another byte', () => {
  const wall = tick({ ...freshByteGame(0, 'playing'), snake: [{ x: 11, y: 5 }], score: 7 });
  assert.equal(wall.status, 'over');
  assert.equal(wall.score, 7);
  assert.equal(canEarnByteReward(wall), false);
  const body = tick({ ...freshByteGame(0, 'playing'), snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }] });
  assert.equal(body.status, 'over');
});

test('the tail cell is traversable only when it vacates on this tick', () => {
  const state = { ...freshByteGame(0, 'playing'), snake: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }] };
  assert.equal(tick(state).status, 'playing');
  assert.equal(tick({ ...state, food: { x: 6, y: 5 } }).status, 'over');
});

test('filling the board wins and food selection never returns an occupied cell', () => {
  const cells = Array.from({ length: 144 }, (_, i) => ({ x: i % 12, y: Math.floor(i / 12) }));
  const snake = [cells[0], ...cells.slice(2)];
  const won = tick({ ...freshByteGame(140, 'playing'), snake, food: cells[1], score: 140 });
  assert.equal(won.status, 'won');
  assert.equal(won.score, 141);
  assert.deepEqual(won.food, { x: -1, y: -1 });
  assert.equal(canEarnByteReward(won), true);
  for (const random of [0, .5, 1, -1, Infinity, NaN]) assert.deepEqual(nextByteFood(snake, random), cells[1]);
});
