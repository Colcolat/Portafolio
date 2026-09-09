import test from 'node:test';
import assert from 'node:assert/strict';
import { createKonamiMatcher, isSecretInputBlocked, keyboardKonamiToken } from '../src/hooks/konamiCode.js';

const code = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
const enter = (matcher, input = code, start = 0, gap = 100) => input.map((token, index) => matcher.push(token, start + index * gap));

test('Konami recognizes exactly the completed sequence and can be entered again', () => {
  const matcher = createKonamiMatcher();
  assert.deepEqual(enter(matcher), [false, false, false, false, false, false, false, false, false, true]);
  assert.deepEqual(enter(matcher, code, 2000), [false, false, false, false, false, false, false, false, false, true]);
  assert.equal(matcher.push('a', 4000), false);
});

test('Konami retains overlapping prefixes after extra Up presses or a wrong direction', () => {
  assert.equal(enter(createKonamiMatcher(), ['up', ...code]).at(-1), true);
  assert.equal(enter(createKonamiMatcher(), ['up', 'down', ...code]).at(-1), true);
  assert.equal(enter(createKonamiMatcher(), ['up', 'up', 'down', 'up', ...code.slice(1)]).at(-1), true);
  assert.equal(enter(createKonamiMatcher(), ['up', 'up', 'down', 'left', ...code.slice(4)]).includes(true), false);
});

test('Konami expires an interrupted attempt but accepts continuous input', () => {
  const matcher = createKonamiMatcher({ timeoutMs: 1000 });
  enter(matcher, code.slice(0, 5));
  assert.equal(enter(matcher, code.slice(5), 1501).includes(true), false);
  assert.equal(enter(matcher, code, 3000, 1000).at(-1), true);
  assert.equal(enter(createKonamiMatcher(), code, 0, 12001).includes(true), false);
});

test('invalid tokens, explicit reset, and backwards timestamps clear Konami progress', () => {
  for (const interrupt of [matcher => matcher.push('start', 500), matcher => matcher.reset(), matcher => matcher.push('up', -1), matcher => matcher.push('up', NaN)]) {
    const matcher = createKonamiMatcher();
    enter(matcher, code.slice(0, 5));
    interrupt(matcher);
    assert.equal(enter(matcher, code.slice(5), 600).includes(true), false);
    assert.equal(enter(matcher, code, 2000).at(-1), true);
  }
});

test('keyboard maps classic B/A and portfolio X/Z controls without accepting repeated keys', () => {
  for (const [key, token] of Object.entries({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', b: 'b', B: 'b', x: 'b', X: 'b', a: 'a', A: 'a', z: 'a', Z: 'a' })) {
    assert.equal(keyboardKonamiToken({ key }), token, key);
    assert.equal(keyboardKonamiToken({ key, repeat: true }), null, `held ${key}`);
  }
  for (const key of ['Enter', 'Escape', 's', ' ', undefined]) assert.equal(keyboardKonamiToken({ key }), null);
});

test('secret keyboard input ignores browser shortcuts, IME, prevented and editable events', () => {
  for (const flag of ['isComposing', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'defaultPrevented']) {
    assert.equal(isSecretInputBlocked({ key: 'a', [flag]: true }), true, flag);
    assert.equal(keyboardKonamiToken({ key: 'a', [flag]: true }), null, flag);
  }
  assert.equal(keyboardKonamiToken({ key: 'a', keyCode: 229 }), null);
  assert.equal(isSecretInputBlocked({ target: { isContentEditable: true } }), true);
  for (const tag of ['input', 'textarea', 'select', '[contenteditable]', '[role="textbox"]', '[role="combobox"]']) {
    const target = { closest: selector => {
      assert.ok(selector.includes(tag === '[contenteditable]' ? '[contenteditable]' : tag));
      return {};
    } };
    assert.equal(isSecretInputBlocked({ target }), true, tag);
    assert.equal(keyboardKonamiToken({ key: 'a', target }), null, tag);
  }
  assert.equal(isSecretInputBlocked({ target: { nodeType: 3, parentElement: { closest: () => ({}) } } }), true);
  assert.equal(isSecretInputBlocked({ target: { closest: () => null } }), false, 'ordinary console buttons remain valid');
});
