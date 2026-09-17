import test from 'node:test';
import assert from 'node:assert/strict';
import { getRadioJourneyState } from '../src/hooks/radioJourney.js';
import { createSecretTapMatcher } from '../src/hooks/secretTaps.js';

test('radio begins with the portfolio visible and the concert unrevealed', () => {
  assert.deepEqual(getRadioJourneyState({ scrollY: 200, startY: 200, roomTop: 2200, viewportHeight: 800 }), { progress: 0, reveal: 0, opacity: 1, hidden: false, scene: 'radio' });
});
test('portfolio fades entirely before the concert arrives', () => {
  const state = getRadioJourneyState({ scrollY: 1200, startY: 200, roomTop: 2200, viewportHeight: 800 });
  assert.equal(state.opacity, 0); assert.equal(state.hidden, true); assert.equal(state.reveal, 0);
});
test('concert song changes only after sufficient entry; reverse scroll has hysteresis', () => {
  const input = { startY: 0, roomTop: 2000, viewportHeight: 1000 };
  assert.equal(getRadioJourneyState({ ...input, scrollY: 1600 }).scene, 'radio');
  assert.equal(getRadioJourneyState({ ...input, scrollY: 1700 }).scene, 'piano');
  assert.equal(getRadioJourneyState({ ...input, scrollY: 1400, previousScene: 'piano' }).scene, 'piano');
  assert.equal(getRadioJourneyState({ ...input, scrollY: 1100, previousScene: 'piano' }).scene, 'radio');
});
test('journey safely clamps overscroll and invalid geometry', () => {
  for (const scrollY of [-500, NaN, Infinity, 100000]) {
    const state = getRadioJourneyState({ scrollY, startY: NaN, roomTop: NaN, viewportHeight: 0 });
    assert.ok(state.progress >= 0 && state.progress <= 1);
    assert.ok(state.opacity >= 0 && state.opacity <= 1);
    assert.ok(state.reveal >= 0 && state.reveal <= 1);
  }
});
test('radio takes three quick taps and forgets stale or interrupted sequences', () => {
  const taps = createSecretTapMatcher({ count: 3 });
  assert.equal(taps.push(0), false); assert.equal(taps.push(300), false); assert.equal(taps.push(600), true);
  assert.equal(taps.push(900), false); taps.reset();
  assert.equal(taps.push(1000), false); assert.equal(taps.push(3000), false);
  assert.equal(taps.push(3300), false); assert.equal(taps.push(3600), true);
});
