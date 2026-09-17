// The memory deck reflects Juan's favourites; official titles stay unchanged in both languages.
export const memoryGames = Object.freeze([
  Object.freeze({ id: 'league', title: 'League of Legends', shortTitle: 'LOL' }),
  Object.freeze({ id: 'elden-ring', title: 'Elden Ring', shortTitle: 'ELDEN' }),
  Object.freeze({ id: 'tf2', title: 'Team Fortress 2', shortTitle: 'TF2' }),
  Object.freeze({ id: 'ghost', title: 'Ghost of Tsushima', shortTitle: 'GHOST' }),
]);

export const memoryGameById = Object.freeze(Object.fromEntries(memoryGames.map(game => [game.id, game])));
