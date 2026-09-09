const sequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
const tokens = new Set(sequence);

// Keep the longest matching prefix so an extra Up can begin a fresh attempt.
export function createKonamiMatcher({ timeoutMs = 12000 } = {}) {
  let progress = [];
  let lastInputAt = null;

  function reset() {
    progress = [];
    lastInputAt = null;
  }

  function push(token, now = Date.now()) {
    if (!tokens.has(token) || !Number.isFinite(now)) {
      reset();
      return false;
    }

    if (lastInputAt !== null && (now - lastInputAt > timeoutMs || now < lastInputAt)) reset();
    const candidate = [...progress, token];
    lastInputAt = now;

    if (candidate.length === sequence.length && candidate.every((value, index) => value === sequence[index])) {
      reset();
      return true;
    }

    for (let length = Math.min(candidate.length, sequence.length - 1); length > 0; length -= 1) {
      const suffix = candidate.slice(-length);
      if (suffix.every((value, index) => value === sequence[index])) {
        progress = suffix;
        return false;
      }
    }

    progress = [];
    return false;
  }

  return { push, reset };
}

function hasModifiedInput(event) {
  return Boolean(event?.isComposing || event?.keyCode === 229 || event?.altKey || event?.ctrlKey || event?.metaKey || event?.shiftKey);
}

export function isSecretInputBlocked(event) {
  if (!event || event.defaultPrevented || hasModifiedInput(event)) return true;
  const target = event.target?.nodeType === 3 ? event.target.parentElement : event.target;
  if (target?.isContentEditable) return true;
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]'));
}

export function keyboardKonamiToken(event) {
  if (!event || event.repeat || isSecretInputBlocked(event)) return null;
  switch (event.key?.toLowerCase()) {
    case 'arrowup': return 'up';
    case 'arrowdown': return 'down';
    case 'arrowleft': return 'left';
    case 'arrowright': return 'right';
    case 'b':
    case 'x': return 'b';
    case 'a':
    case 'z': return 'a';
    default: return null;
  }
}
