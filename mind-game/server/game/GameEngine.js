import { addGame, getGameByCode, removeGame } from "./store.js";
import { randomCode, randomId } from "../utils/ids.js";

/**
 * Rules implemented:
 * - 5 players per game.
 * - Round: each active player can submit 0..100 (hidden).
 * - Average uses only submitted picks (timeouts are non-winners, not included in average).
 * - finalOutput = average * 0.8
 * - All closest picks are winners; everyone else gets -1.
 * - Eliminate at -10.
 * - End when only one active player remains.
 * - Round timer = 120s; if all submit early, lock immediately.
 * - After reveal, ONLY host can start next round.
 */

export function createGame(io, hostSocketId, hostName, hostAvatar) {
  const id = randomId("g");
  const code = randomCode(6);
  const game = {
    id,
    code,
    status: "WAITING",
    players: [], // {id, socketId, name, score, eliminated, connected, seatNo, avatar}
    roundNo: 0,
    phase: "lobby", // 'lobby' | 'collect' | 'reveal' | 'over'
    picks: {}, // userId -> number
    timers: { main: null, ticker: null, countdown: null },
    countdown: 0,
    config: {
      capacity: 5,
      collectSeconds: 120,   // 2 minutes
      revealSeconds: 5,
      startCountdown: 3,
    },
  };

  const host = {
    id: randomId("u"),
    socketId: hostSocketId,
    name: hostName?.trim() || "Player",
    avatar: hostAvatar || "🧙‍♂️",
    score: 0,
    eliminated: false,
    connected: true,
    seatNo: 1,
  };
  game.players.push(host);
  game.hostUserId = host.id; // remember room creator

  addGame(game);
  return game;
}

export function findGameByCode(code) {
  return getGameByCode(code);
}

export function joinGame(game, socketId, name, avatar) {
  if (game.status !== "WAITING") throw new Error("Game not joinable");
  const taken = game.players.length;
  if (taken >= game.config.capacity) throw new Error("Game full");

  const p = {
    id: randomId("u"),
    socketId,
    name: name?.trim() || `Player${taken + 1}`,
    avatar: avatar || "🧙‍♂️",
    score: 0,
    eliminated: false,
    connected: true,
    seatNo: taken + 1,
  };
  game.players.push(p);
  return p;
}

export function startIfFull(io, game) {
  if (game.players.length === game.config.capacity && game.status === "WAITING") {
    game.status = "RUNNING";
    game.phase = "lobby";
    startCountdown(io, game);
  }
}

function room(game) {
  return `game:${game.id}`;
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

function activePlayers(game) {
  return game.players.filter((p) => !p.eliminated);
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

export function startRound(io, game) {
  clearTimers(game);
  game.roundNo += 1;
  game.phase = "collect";
  game.picks = {};

  const N = activePlayers(game).length;
  if (N <= 1) return finishGame(io, game);

  let secondsLeft = game.config.collectSeconds;

  // Send current players + scores so everyone has the same scoreboard when round begins
  const scoresSnapshot = game.players.map((p) => ({
    userId: p.id,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    eliminated: p.eliminated,
    seatNo: p.seatNo,
  }));

  io.to(room(game)).emit("round_started", {
    roundNo: game.roundNo,
    secondsLeft,
    scores: scoresSnapshot, // ⬅️ include full list (fixes "fifth player missing" + "zeros during round")
  });

  // tick down
  game.timers.ticker = setInterval(() => {
    secondsLeft -= 1;
    io.to(room(game)).emit("round_tick", { secondsLeft });
  }, 1000);

  // hard stop at collectSeconds
  game.timers.main = setTimeout(() => {
    lockRound(io, game);
  }, game.config.collectSeconds * 1000);
}

export function submitPick(io, game, userId, value) {
  if (game.phase !== "collect") return;
  const player = game.players.find((p) => p.id === userId && !p.eliminated);
  if (!player) return;
  if (typeof game.picks[userId] === "number") return; // already submitted
  if (!Number.isInteger(value) || value < 0 || value > 100) return;

  game.picks[userId] = value;

  // If all active players have submitted, lock immediately
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
  const picksArr = actives.map((p) => ({
    userId: p.id,
    name: p.name,
    avatar: p.avatar,
    value: typeof game.picks[p.id] === "number" ? game.picks[p.id] : null,
  }));

  const validPicks = picksArr.filter((x) => typeof x.value === "number");
  const N = validPicks.length;
  const total = validPicks.reduce((s, x) => s + x.value, 0);
  const result = N > 0 ? total / N : 0;
  const finalOutput = result * 0.8;

  let minDist = Infinity;
  for (const x of validPicks) {
    const d = Math.abs(x.value - finalOutput);
    if (d < minDist) minDist = d;
  }
  const winners = validPicks
    .filter((x) => Math.abs(x.value - finalOutput) === minDist)
    .map((x) => x.userId);

  // scoring (timeouts are non-winners too)
  for (const p of actives) {
    const isWinner = winners.includes(p.id);
    if (!isWinner) {
      p.score -= 1;
      if (p.score <= -10) p.eliminated = true;
    }
  }

  const reveal = {
    roundNo: game.roundNo,
    picks: picksArr, // reveal picks (null = missed)
    total,
    average: result,
    finalOutput,
    winners,
    scores: game.players.map((p) => ({
      userId: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      eliminated: p.eliminated,
      seatNo: p.seatNo,
    })),
  };

  io.to(room(game)).emit("round_result", reveal);

  // end condition
  const still = activePlayers(game);
  if (still.length <= 1) {
    return finishGame(io, game);
  }

  // Wait for HOST to start next round
  io.to(room(game)).emit("await_next_round", { hostUserId: game.hostUserId });
}

export function startNextRoundByHost(io, game, requesterUserId) {
  if (!game) return;
  if (game.status !== "RUNNING" || game.phase !== "reveal") return;
  if (requesterUserId !== game.hostUserId) return; // only host can proceed
  const still = activePlayers(game);
  if (still.length <= 1) return finishGame(io, game);
  startRound(io, game);
}

function finishGame(io, game) {
  clearTimers(game);
  game.phase = "over";
  game.status = "FINISHED";
  const alive = activePlayers(game);
  const winner = alive[0] || null;

  io.to(room(game)).emit("game_over", {
    winner: winner ? { userId: winner.id, name: winner.name, avatar: winner.avatar, score: winner.score } : null,
    finalScores: game.players.map((p) => ({
      userId: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      eliminated: p.eliminated,
      seatNo: p.seatNo,
    })),
  });

  setTimeout(() => {
    try {
      io.socketsLeave(room(game));
    } catch {}
    removeGame(game);
  }, 60 * 1000);
}
