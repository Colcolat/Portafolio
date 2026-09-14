/** A short deliberate run of taps, not a lifetime click counter. */
export function createSecretTapMatcher({ count = 5, maxGap = 1200 } = {}) {
  if (!Number.isInteger(count) || count < 1 || !Number.isFinite(maxGap) || maxGap <= 0) {
    throw new RangeError('A positive tap count and interval are required.');
  }
  let taps = 0;
  let previous = null;
  function reset() { taps = 0; previous = null; }
  function push(now = Date.now()) {
    if (!Number.isFinite(now)) { reset(); return false; }
    if (previous !== null && (now < previous || now - previous > maxGap)) reset();
    previous = now;
    taps += 1;
    if (taps < count) return false;
    reset();
    return true;
  }
  return { push, reset };
}
