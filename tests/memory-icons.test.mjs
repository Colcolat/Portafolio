import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryIconPatterns, memoryIconSize } from '../src/data/memoryIconPatterns.js';

test('the memory icon set covers exactly the four favourite games', () => {
  assert.deepEqual(Object.keys(memoryIconPatterns), ['league', 'elden-ring', 'tf2', 'ghost']);
  assert.equal(memoryIconSize, 24);
  assert.equal(Object.isFrozen(memoryIconPatterns), true);
});

test('every icon uses a complete, immutable, binary 24-pixel square', () => {
  for (const [name, rows] of Object.entries(memoryIconPatterns)) {
    assert.equal(rows.length, memoryIconSize, `${name}: height`);
    assert.equal(Object.isFrozen(rows), true, `${name}: immutable rows`);
    for (const row of rows) {
      assert.equal(row.length, memoryIconSize, `${name}: width`);
      assert.match(row, /^[01]+$/, `${name}: only solid or transparent pixels`);
    }
  }
});

test('all four icons are visually distinct and retain clear ink and negative space', () => {
  const silhouettes = Object.values(memoryIconPatterns).map(rows => rows.join(''));
  assert.equal(new Set(silhouettes).size, 4);
  for (const silhouette of silhouettes) {
    const ink = [...silhouette].filter(pixel => pixel === '1').length;
    assert.ok(ink >= 80, 'readable silhouette at small card size');
    assert.ok(ink < memoryIconSize ** 2 * 0.65, 'preserve the LCD background and inner details');
  }
});

test('each drawing has transparent outer rows and columns to avoid clipping', () => {
  const clear = '0'.repeat(memoryIconSize);
  for (const rows of Object.values(memoryIconPatterns)) {
    assert.equal(rows[0], clear);
    assert.equal(rows.at(-1), clear);
    for (const row of rows) {
      assert.equal(row[0], '0');
      assert.equal(row.at(-1), '0');
    }
  }
});
