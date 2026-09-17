import { memoryIconPatterns, memoryIconSize } from '../data/memoryIconPatterns.js';

export default function MemoryGameIcon({ name, className = '' }) {
  const pattern = Object.prototype.hasOwnProperty.call(memoryIconPatterns, name) ? memoryIconPatterns[name] : null;
  if (!pattern) return null;

  return <svg
    className={`pixel-art memory-game-icon ${className}`.trim()}
    viewBox={`0 0 ${memoryIconSize} ${memoryIconSize}`}
    aria-hidden="true"
    focusable="false"
    shapeRendering="crispEdges"
  >
    {pattern.flatMap((row, y) => [...row].map((cell, x) => cell === '1'
      ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      : null))}
  </svg>;
}
