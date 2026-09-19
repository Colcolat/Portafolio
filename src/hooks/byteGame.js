export const BYTE_GAME_SIZE = 12;
export const BYTE_TICK_MS = 180;
export const BYTE_STORAGE_KEY = 'colcolat-byte-game-high-score';
export const BYTE_REWARD_SCORE = 8;

const VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const ROUND_STATUSES = new Set(['playing', 'paused', 'over', 'won']);
const sameCell = (a, b) => a.x === b.x && a.y === b.y;

export function normalizeByteHighScore(value) {
  const score = Number(value);
  return Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
}

export function freshByteGame(highScore = 0, status = 'ready') {
  return {
    snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
    food: { x: 8, y: 5 },
    direction: 'right',
    queuedDirection: null,
    score: 0,
    highScore: normalizeByteHighScore(highScore),
    status,
  };
}

// Discovery belongs to this round, never to a record from an earlier visit.
export function canEarnByteReward(game) {
  return Boolean(game && ROUND_STATUSES.has(game.status)
    && Number.isInteger(game.score) && game.score >= BYTE_REWARD_SCORE);
}

export function nextByteFood(snake, random = 0) {
  const available = [];
  for (let y = 0; y < BYTE_GAME_SIZE; y += 1) {
    for (let x = 0; x < BYTE_GAME_SIZE; x += 1) {
      if (!snake.some((cell) => cell.x === x && cell.y === y)) available.push({ x, y });
    }
  }
  if (!available.length) return { x: -1, y: -1 };
  const sample = Number.isFinite(random) ? random : 0;
  const index = Math.min(available.length - 1, Math.max(0, Math.floor(sample * available.length)));
  return available[index];
}

export function byteGameReducer(state, action) {
  if (action.type === 'reset') return freshByteGame(state.highScore);
  if (action.type === 'pause') return state.status === 'playing' ? { ...state, status: 'paused' } : state;

  if (action.type === 'primary') {
    if (state.status === 'playing') return { ...state, status: 'paused' };
    if (state.status === 'paused') return { ...state, status: 'playing' };
    return freshByteGame(state.highScore, 'playing');
  }

  if (action.type === 'turn') {
    if (!['playing', 'paused'].includes(state.status)
      || !Object.hasOwn(VECTORS, action.direction)
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
  const collision = head.x < 0 || head.y < 0 || head.x >= BYTE_GAME_SIZE || head.y >= BYTE_GAME_SIZE
    || body.some((cell) => sameCell(cell, head));

  if (collision) return { ...state, direction, queuedDirection: null, status: 'over' };

  const snake = [head, ...state.snake];
  if (!growing) snake.pop();
  const score = state.score + (growing ? 1 : 0);
  const won = snake.length === BYTE_GAME_SIZE * BYTE_GAME_SIZE;

  return {
    ...state,
    snake,
    direction,
    queuedDirection: null,
    score,
    highScore: Math.max(state.highScore, score),
    food: growing ? nextByteFood(snake, action.random) : state.food,
    status: won ? 'won' : 'playing',
  };
}
