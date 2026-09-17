import test from 'node:test';
import assert from 'node:assert/strict';
import { getRadioJourneyState } from '../src/hooks/radioJourney.js';
import { createSecretTapMatcher } from '../src/hooks/secretTaps.js';

test('radio begins with the portfolio visible and the concert unrevealed', () => {
  const state = getRadioJourneyState({ scrollY: 200, startY: 200, roomTop: 4200, viewportHeight: 800 });
  assert.equal(state.opacity, 1); assert.equal(state.ticketOpacity, 1); assert.equal(state.radioGain, 1);
  assert.equal(state.pianoGain, 0); assert.equal(state.daylight, 0); assert.equal(state.pulse, 0);
  assert.equal(state.hidden, false); assert.equal(state.scene, 'radio'); assert.equal(state.reveal, 0);
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

test('the long passage continuously fades the card and Moonlight while daylight and pulse grow', () => {
  const geometry = { startY: 150, roomTop: 4350, viewportHeight: 800 };
  let previous = getRadioJourneyState({ ...geometry, scrollY: 150 });
  let intermediateStates = 0;
  for (let scrollY = 170; scrollY <= 4350; scrollY += 20) {
    const next = getRadioJourneyState({ ...geometry, scrollY });
    assert.ok(next.ticketOpacity <= previous.ticketOpacity);
    assert.equal(next.radioGain, next.ticketOpacity);
    assert.ok(next.daylight >= previous.daylight);
    assert.ok(next.pulse >= previous.pulse);
    assert.ok(next.pianoGain >= previous.pianoGain);
    assert.ok(Math.abs(next.ticketOpacity - previous.ticketOpacity) < .025, 'no card or music cut');
    if (next.daylight > .1 && next.daylight < .9) intermediateStates++;
    previous = next;
  }
  assert.ok(intermediateStates > 50, 'daylight changes over a long distance');
});

test('the full viewport is already concert paper before the first recital pixel enters', () => {
  const geometry = { startY: 400, roomTop: 4800, viewportHeight: 900 };
  const before = getRadioJourneyState({ ...geometry, scrollY: 4800 - 900 - 40 });
  assert.equal(before.daylight, 1); assert.equal(before.reveal, 0);
  assert.equal(before.ticketOpacity, 0); assert.equal(before.radioGain, 0);
  assert.equal(before.pulse, 1); assert.equal(before.opacity, 0);
  const arrived = getRadioJourneyState({ ...geometry, scrollY: 4800 });
  assert.equal(arrived.pianoGain, 1); assert.equal(arrived.scene, 'piano');
});

test('returning upward restores the same card, music envelope, daylight and pulse values', () => {
  const geometry = { startY: 0, roomTop: 4000, viewportHeight: 800 };
  for (const scrollY of [250, 750, 1250, 2000, 3000]) {
    const forward = getRadioJourneyState({ ...geometry, scrollY });
    const backward = getRadioJourneyState({ ...geometry, scrollY, previousScene: 'piano' });
    for (const key of ['ticketOpacity', 'radioGain', 'pianoGain', 'daylight', 'pulse']) assert.equal(forward[key], backward[key]);
  }
});
