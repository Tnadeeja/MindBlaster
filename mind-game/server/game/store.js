// In-memory store of games
// game = { id, code, status, players:[], roundNo, phase, picks:{}, timers:{}, config:{} }
export const gamesById = new Map();
export const gamesByCode = new Map();

export function addGame(game) {
  gamesById.set(game.id, game);
  gamesByCode.set(game.code, game);
}

export function getGameByCode(code) {
  return gamesByCode.get(code);
}

export function removeGame(game) {
  gamesById.delete(game.id);
  gamesByCode.delete(game.code);
}
