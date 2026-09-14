import test from 'node:test';
import assert from 'node:assert/strict';
import { createSecretTapMatcher } from '../src/hooks/secretTaps.js';

test('five deliberate consecutive taps unlock once and the sequence restarts', () => {
  const matcher = createSecretTapMatcher();
  for (const time of [0, 100, 200, 300]) assert.equal(matcher.push(time), false);
  assert.equal(matcher.push(400), true);
  for (const time of [500, 600, 700, 800]) assert.equal(matcher.push(time), false);
  assert.equal(matcher.push(900), true);
});

test('a long gap, backward clock, invalid time or explicit reset breaks the attempt', () => {
  for (const interrupt of [m => m.push(1601), m => m.push(99), m => m.push(NaN), m => m.reset()]) {
    const matcher = createSecretTapMatcher();
    for (const time of [100, 200, 300, 400]) matcher.push(time);
    assert.notEqual(interrupt(matcher), true);
    assert.equal(matcher.push(1700), false);
  }
  const matcher = createSecretTapMatcher();
  for (const time of [0, 2000, 4000, 6000, 8000]) assert.equal(matcher.push(time), false);
});

test('the interval boundary and custom count work without timers', () => {
  const matcher = createSecretTapMatcher({ count: 3, maxGap: 1200 });
  assert.equal(matcher.push(0), false);
  assert.equal(matcher.push(1200), false);
  assert.equal(matcher.push(2400), true);
  assert.equal(createSecretTapMatcher({ count: 1 }).push(), true);
});

test('invalid detector configuration is rejected', () => {
  for (const options of [{ count: 0 }, { count: 1.5 }, { count: Infinity }, { maxGap: 0 }, { maxGap: NaN }]) {
    assert.throws(() => createSecretTapMatcher(options), RangeError);
  }
});
