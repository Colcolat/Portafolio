export const memorySymbols = Object.freeze(['vault', 'bolt', 'sprout', 'smile']);
export const memoryRevealDelay = 850;

export function createMemoryDeck(random = Math.random) {
  const deck = [...memorySymbols, ...memorySymbols];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))));
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck;
}

export function createMemoryGame(deck = createMemoryDeck()) {
  if (!Array.isArray(deck) || deck.length !== 8 || memorySymbols.some(symbol => deck.filter(card => card === symbol).length !== 2)) {
    throw new Error('A memory deck needs exactly two of each of the four symbols.');
  }
  return { deck: [...deck], flipped: [], matched: [], moves: 0, phase: 'playing' };
}

export function memoryGameReducer(state, action) {
  if (action.type === 'reset') return createMemoryGame(action.deck);
  if (action.type === 'flip') {
    const index = action.index;
    if (state.phase !== 'playing' || !Number.isInteger(index) || index < 0 || index >= state.deck.length || state.flipped.includes(index) || state.matched.includes(index)) return state;
    const flipped = [...state.flipped, index];
    return { ...state, flipped, moves: state.moves + (flipped.length === 2 ? 1 : 0), phase: flipped.length === 2 ? 'comparing' : 'playing' };
  }
  if (action.type === 'resolve' && state.phase === 'comparing') {
    const [first, second] = state.flipped;
    const matched = state.deck[first] === state.deck[second] ? [...state.matched, first, second] : state.matched;
    return { ...state, flipped: [], matched, phase: matched.length === state.deck.length ? 'won' : 'playing' };
  }
  return state;
}

export function memoryNeighbor(index, key) {
  if (key === 'ArrowLeft') return (index + 7) % 8;
  if (key === 'ArrowRight') return (index + 1) % 8;
  if (key === 'ArrowUp' || key === 'ArrowDown') return (index + 4) % 8;
  if (key === 'Home') return Math.floor(index / 4) * 4;
  if (key === 'End') return Math.floor(index / 4) * 4 + 3;
  return index;
}
