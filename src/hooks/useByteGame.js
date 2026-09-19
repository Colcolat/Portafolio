import { useCallback, useEffect, useReducer } from 'react';
import { BYTE_GAME_SIZE, BYTE_STORAGE_KEY, BYTE_TICK_MS, byteGameReducer, freshByteGame } from './byteGame.js';

function initialGame() {
  let stored = 0;
  try {
    stored = window.localStorage.getItem(BYTE_STORAGE_KEY);
  } catch {
    // The game also works when browser storage is unavailable.
  }
  return freshByteGame(stored);
}

export default function useByteGame({ enabled }) {
  const [state, dispatch] = useReducer(byteGameReducer, undefined, initialGame);

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'pause' });
      return undefined;
    }
    if (state.status !== 'playing') return undefined;

    let alive = true;
    let timer = null;
    let focused = document.hasFocus?.() ?? true;
    const suspend = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      if (alive) dispatch({ type: 'pause' });
    };
    const canTick = () => alive && focused && !document.hidden && (document.hasFocus?.() ?? true);
    const onBlur = () => { focused = false; suspend(); };
    const onVisibility = () => { if (!canTick()) suspend(); };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    if (canTick()) {
      timer = window.setInterval(() => {
        if (canTick()) dispatch({ type: 'tick', random: Math.random() });
        else suspend();
      }, BYTE_TICK_MS);
    } else {
      suspend();
    }

    // Focus or visibility returning never resumes a round without another A press.
    return () => {
      alive = false;
      if (timer !== null) window.clearInterval(timer);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, state.status]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BYTE_STORAGE_KEY, String(state.highScore));
    } catch {
      // Saving a record is optional; it never interrupts a round.
    }
  }, [state.highScore]);

  const turn = useCallback((direction) => dispatch({ type: 'turn', direction }), []);
  const primary = useCallback(() => dispatch({ type: 'primary' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
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
    pause,
    reset,
    size: BYTE_GAME_SIZE,
  };
}
