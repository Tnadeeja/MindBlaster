// In-memory store of games
export const gamesById = new Map();
export const gamesByCode = new Map();

export function addGame(game) {
  gamesById.set(game.id, game);
  gamesByCode.set(game.code, game);
}

export function getGameByCode(code) {
  return gamesByCode.get((code || "").toUpperCase());
}

export function removeGame(game) {
  gamesById.delete(game.id);
  gamesByCode.delete(game.code);
}
