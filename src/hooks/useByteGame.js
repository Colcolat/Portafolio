import { useCallback, useEffect, useReducer } from 'react';

const SIZE = 12;
const TICK_MS = 180;
const STORAGE_KEY = 'colcolat-byte-game-high-score';
const VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const sameCell = (a, b) => a.x === b.x && a.y === b.y;

function freshGame(highScore = 0, status = 'ready') {
  return {
    snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
    food: { x: 8, y: 5 },
    direction: 'right',
    queuedDirection: null,
    score: 0,
    highScore,
    status,
  };
}

function initialGame() {
  let highScore = 0;
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0) highScore = Math.floor(stored);
  } catch {
    // The game also works when browser storage is unavailable.
  }
  return freshGame(highScore);
}

function nextFood(snake, random) {
  const available = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!snake.some((cell) => cell.x === x && cell.y === y)) {
        available.push({ x, y });
      }
    }
  }
  return available[Math.floor(random * available.length)] ?? { x: -1, y: -1 };
}

function gameReducer(state, action) {
  if (action.type === 'reset') return freshGame(state.highScore);

  if (action.type === 'primary') {
    if (state.status === 'playing') return { ...state, status: 'paused' };
    if (state.status === 'paused') return { ...state, status: 'playing' };
    return freshGame(state.highScore, 'playing');
  }

  if (action.type === 'turn') {
    if (!['playing', 'paused'].includes(state.status)
      || !VECTORS[action.direction]
      || state.queuedDirection
      || action.direction === state.direction
      || action.direction === OPPOSITE[state.direction]) return state;

    // Accept one turn per tick so rapid inputs cannot reverse into the body.
    return { ...state, queuedDirection: action.direction };
  }

  if (action.type !== 'tick' || state.status !== 'playing') return state;

  const direction = state.queuedDirection ?? state.direction;
  const vector = VECTORS[direction];
  const head = { x: state.snake[0].x + vector.x, y: state.snake[0].y + vector.y };
  const growing = sameCell(head, state.food);
  // The tail vacates its cell on this tick unless the snake eats.
  const body = growing ? state.snake : state.snake.slice(0, -1);
  const collision = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE
    || body.some((cell) => sameCell(cell, head));

  if (collision) return { ...state, direction, queuedDirection: null, status: 'over' };

  const snake = [head, ...state.snake];
  if (!growing) snake.pop();
  const score = state.score + (growing ? 1 : 0);
  const won = snake.length === SIZE * SIZE;

  return {
    ...state,
    snake,
    direction,
    queuedDirection: null,
    score,
    highScore: Math.max(state.highScore, score),
    food: growing ? nextFood(snake, action.random) : state.food,
    status: won ? 'won' : 'playing',
  };
}

export default function useByteGame({ enabled }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGame);

  useEffect(() => {
    if (!enabled || state.status !== 'playing') return undefined;
    const timer = window.setInterval(() => {
      dispatch({ type: 'tick', random: Math.random() });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, state.status]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(state.highScore));
    } catch {
      // Saving a record is optional; it never interrupts a round.
    }
  }, [state.highScore]);

  const turn = useCallback((direction) => dispatch({ type: 'turn', direction }), []);
  const primary = useCallback(() => dispatch({ type: 'primary' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return {
    snake: state.snake,
    food: state.food,
    score: state.score,
    highScore: state.highScore,
    status: state.status,
    direction: state.queuedDirection ?? state.direction,
    turn,
    primary,
    reset,
    size: SIZE,
  };
}
