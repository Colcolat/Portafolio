export const COVER_FALL_DURATION = 850;

export const createRearCover = () => ({ removedScrews: [], phase: 'closed' });

// This is a physical puzzle, not a timed code. Order and pauses do not matter.
export function rearCoverReducer(state, action) {
  if (action.type === 'restore') return createRearCover();
  if (action.type === 'settled') {
    return state.phase === 'falling' ? { ...state, phase: 'open' } : state;
  }
  if (action.type !== 'unscrew' || state.phase !== 'closed'
    || !Number.isInteger(action.id) || action.id < 0 || action.id > 3
    || state.removedScrews.includes(action.id)) return state;
  const removedScrews = [...state.removedScrews, action.id];
  return { removedScrews, phase: removedScrews.length === 4 ? 'falling' : 'closed' };
}
