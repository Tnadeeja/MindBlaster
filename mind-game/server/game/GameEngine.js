import { addGame, getGameByCode, removeGame } from "./store.js";
import { randomCode, randomId } from "../utils/ids.js";

/**
 * Game rules per your spec
 * - 5 players
 * - Each round: everyone picks 0..100 (hidden), average of active players, finalOut = avg*0.8
 * - Closest pick(s) win; others -1
 * - Eliminate at -10
 * - End when 4 eliminated => last remaining wins
 */

export function createGame(io, hostSocketId, hostName) {
  const id = randomId("g");
  const code = randomCode(6);
  const game = {
    id, code, status: "WAITING",
    players: [], // {id, socketId, name, score, eliminated, connected, seatNo}
    roundNo: 0,
    phase: "lobby", // 'lobby' | 'collect' | 'reveal' | 'over'
    picks: {}, // userId -> number
    timers: { main: null, ticker: null, countdown: null },
    countdown: 0,
    config: {
      capacity: 5,
      collectSeconds: 20,
      revealSeconds: 5,
      startCountdown: 3
    }
  };

  const host = {
    id: randomId("u"),
    socketId: hostSocketId,
    name: hostName?.trim() || "Player",
    score: 0,
    eliminated: false,
    connected: true,
    seatNo: 1
  };
  game.players.push(host);

  addGame(game);
  return game;
}

export function findGameByCode(code) {
  return getGameByCode(code?.toUpperCase?.() || code);
}

export function joinGame(game, socketId, name) {
  if (game.status !== "WAITING") throw new Error("Game not joinable");
  const taken = game.players.length;
  if (taken >= game.config.capacity) throw new Error("Game full");

  const p = {
    id: randomId("u"),
    socketId,
    name: name?.trim() || `Player${taken+1}`,
    score: 0,
    eliminated: false,
    connected: true,
    seatNo: taken + 1
  };
  game.players.push(p);
  return p;
}

export function reconnect(game, playerId, socketId) {
  const p = game.players.find(x => x.id === playerId);
  if (!p) return null;
  p.socketId = socketId;
  p.connected = true;
  return p;
}

export function startIfFull(io, game) {
  if (game.players.length === game.config.capacity && game.status === "WAITING") {
    game.status = "RUNNING";
    game.phase = "lobby";
    startCountdown(io, game);
  }
}

function clearTimers(game) {
  for (const k of Object.keys(game.timers)) {
    if (game.timers[k]) {
      clearInterval(game.timers[k]);
      clearTimeout(game.timers[k]);
      game.timers[k] = null;
    }
  }
}

function startCountdown(io, game) {
  clearTimers(game);
  game.countdown = game.config.startCountdown;
  io.to(room(game)).emit("game_starting", { countdown: game.countdown });

  game.timers.countdown = setInterval(() => {
    game.countdown -= 1;
    if (game.countdown <= 0) {
      clearInterval(game.timers.countdown);
      game.timers.countdown = null;
      startRound(io, game);
    } else {
      io.to(room(game)).emit("game_starting", { countdown: game.countdown });
    }
  }, 1000);
}

function activePlayers(game) {
  return game.players.filter(p => !p.eliminated);
}

function room(game) {
  return `game:${game.id}`;
}

export function startRound(io, game) {
  clearTimers(game);
  game.roundNo += 1;
  game.phase = "collect";
  game.picks = {};

  const N = activePlayers(game).length;
  if (N <= 1) return finishGame(io, game);

  let secondsLeft = game.config.collectSeconds;
  io.to(room(game)).emit("round_started", { roundNo: game.roundNo, secondsLeft });

  // ticker
  game.timers.ticker = setInterval(() => {
    secondsLeft -= 1;
    io.to(room(game)).emit("round_tick", { secondsLeft });
  }, 1000);

  // main timer
  game.timers.main = setTimeout(() => {
    lockRound(io, game);
  }, game.config.collectSeconds * 1000);
}

export function submitPick(io, game, userId, value) {
  if (game.phase !== "collect") return;
  const player = game.players.find(p => p.id === userId && !p.eliminated);
  if (!player) return;
  if (typeof game.picks[userId] === "number") return; // already submitted
  if (!Number.isInteger(value) || value < 0 || value > 100) return;
  game.picks[userId] = value;

  const needed = activePlayers(game).length;
  const have = Object.keys(game.picks).length;
  if (have >= needed) {
    lockRound(io, game);
  }
}

function lockRound(io, game) {
  if (game.phase !== "collect") return;
  clearTimers(game);
  game.phase = "reveal";

  const actives = activePlayers(game);
  // anyone missing a pick gets no pick => they are non-winners (penalized)
  const picksArr = actives.map(p => ({
    userId: p.id,
    name: p.name,
    value: typeof game.picks[p.id] === "number" ? game.picks[p.id] : null
  }));

  const validPicks = picksArr.filter(x => typeof x.value === "number");
  // Compute total/avg/finalOutput using only players who submitted?
  // Your rule: average uses ALL ACTIVE PLAYERS (even if someone timed out),
  // but they have "no pick". For average we need numbers; we’ll treat missing as 0? No.
  // We must average over N active players using their chosen numbers only if they submitted?
  // Your spec says: they missed pick -> non-winner, but average is over active players' picks.
  // If they didn’t submit, there is no number to include. We’ll treat missing pick as not counted for avg?
  // To keep faithful: average uses ONLY active players who submitted.
  // If you prefer to include them as 0, change here. I'll stick to submitted-only.
  const N = validPicks.length;
  const total = validPicks.reduce((s, x) => s + x.value, 0);
  const result = N > 0 ? total / N : 0;
  const finalOutput = result * 0.8;

  // determine winners among those who submitted
  let minDist = Infinity;
  for (const x of validPicks) {
    const d = Math.abs(x.value - finalOutput);
    if (d < minDist) minDist = d;
  }
  const winners = validPicks.filter(x => Math.abs(x.value - finalOutput) === minDist).map(x => x.userId);

  // scoring
  for (const p of actives) {
    const isWinner = winners.includes(p.id);
    if (!isWinner) {
      p.score -= 1; // −1 for non-winners and for non-submitters
      if (p.score <= -10) {
        p.eliminated = true;
      }
    }
  }

  // prepare reveal payload (picks are shown now)
  const reveal = {
    roundNo: game.roundNo,
    picks: picksArr, // includes nulls for non-submitters
    total,
    average: result,
    finalOutput,
    winners,
    scores: game.players.map(p => ({
      userId: p.id, name: p.name, score: p.score, eliminated: p.eliminated, seatNo: p.seatNo
    }))
  };

  io.to(room(game)).emit("round_result", reveal);

  // check end condition
  const still = activePlayers(game);
  if (still.length <= 1) {
    return finishGame(io, game);
  }

  // next round after revealSeconds
  game.timers.main = setTimeout(() => {
    startRound(io, game);
  }, game.config.revealSeconds * 1000);
}

function finishGame(io, game) {
  clearTimers(game);
  game.phase = "over";
  game.status = "FINISHED";
  const alive = activePlayers(game);
  const winner = alive[0] || null;
  io.to(room(game)).emit("game_over", {
    winner: winner ? { userId: winner.id, name: winner.name } : null,
    finalScores: game.players.map(p => ({
      userId: p.id, name: p.name, score: p.score, eliminated: p.eliminated, seatNo: p.seatNo
    }))
  });

  // Optional: clean up the room after a minute
  setTimeout(() => {
    try { io.socketsLeave(room(game)); } catch {}
    removeGame(game);
  }, 60 * 1000);
}
