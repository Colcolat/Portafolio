import test from 'node:test';
import assert from 'node:assert/strict';
import { createRearCover, rearCoverReducer } from '../src/hooks/rearCover.js';

test('only four distinct screws release the cover, in any order', () => {
  let state = createRearCover();
  const original = state;
  for (const id of [3, 0, 2]) {
    state = rearCoverReducer(state, { type: 'unscrew', id });
    assert.equal(state.phase, 'closed');
  }
  assert.deepEqual(original, createRearCover(), 'updates do not mutate earlier state');
  assert.equal(rearCoverReducer(state, { type: 'unscrew', id: 0 }), state);
  state = rearCoverReducer(state, { type: 'unscrew', id: 1 });
  assert.equal(state.phase, 'falling');
  assert.equal(state.removedScrews.length, 4);
  assert.equal(rearCoverReducer(state, { type: 'unscrew', id: 1 }), state);
  state = rearCoverReducer(state, { type: 'settled' });
  assert.equal(state.phase, 'open');
  assert.equal(rearCoverReducer(state, { type: 'settled' }), state);
});

test('invalid screw inputs and premature completion leave the puzzle unchanged', () => {
  const state = createRearCover();
  for (const id of [-1, 4, 1.5, NaN, null, '1', undefined]) {
    assert.equal(rearCoverReducer(state, { type: 'unscrew', id }), state);
  }
  assert.equal(rearCoverReducer(state, { type: 'settled' }), state);
  assert.equal(rearCoverReducer(state, { type: 'unknown' }), state);
});

test('restoring at any stage resets all screws and ignores a stale falling completion', () => {
  let state = createRearCover();
  for (const id of [0, 1, 2, 3]) {
    state = rearCoverReducer(state, { type: 'unscrew', id });
    const restored = rearCoverReducer(state, { type: 'restore' });
    assert.deepEqual(restored, createRearCover());
    assert.equal(rearCoverReducer(restored, { type: 'settled' }), restored);
  }
  assert.deepEqual(rearCoverReducer(rearCoverReducer(state, { type: 'settled' }), { type: 'restore' }), createRearCover());
});
