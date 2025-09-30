import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import {
  createGame,
  findGameByCode,
  joinGame,
  startIfFull,
  startRound,
  submitPick,
  startNextRoundByHost,
} from "./game/GameEngine.js";

const app = express();
app.use(cors());
app.get("/", (_req, res) => res.send("Mind Game API running ✅"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
});

function joinSocketRoom(socket, game) {
  socket.join(`game:${game.id}`);
}

io.on("connection", (socket) => {
  let currentGame = null;
  let currentUser = null;

  socket.on("create_game", ({ name, avatar }) => {
    const game = createGame(io, socket.id, name, avatar);
    currentGame = game;
    currentUser = game.players[0];
    joinSocketRoom(socket, game);

    io.to(`game:${game.id}`).emit("lobby_update", {
      gameId: game.id,
      code: game.code,
      status: game.status,
      hostUserId: game.hostUserId,
      players: game.players.map((p) => ({
        userId: p.id,
        name: p.name,
        score: p.score,
        eliminated: p.eliminated,
        seatNo: p.seatNo,
        avatar: p.avatar,
      })),
    });

    socket.emit("created", {
      gameId: game.id,
      code: game.code,
      hostUserId: game.hostUserId,
      you: { userId: currentUser.id, name: currentUser.name, seatNo: currentUser.seatNo, avatar: currentUser.avatar },
    });
  });

  socket.on("join_game", ({ code, name, avatar }) => {
    const game = findGameByCode(code);
    if (!game) return socket.emit("error_msg", { message: "Game not found" });
    try {
      const p = joinGame(game, socket.id, name, avatar);
      currentGame = game;
      currentUser = p;
      joinSocketRoom(socket, game);

      io.to(`game:${game.id}`).emit("lobby_update", {
        gameId: game.id,
        code: game.code,
        status: game.status,
        hostUserId: game.hostUserId,
        players: game.players.map((pp) => ({
          userId: pp.id,
          name: pp.name,
          score: pp.score,
          eliminated: pp.eliminated,
          seatNo: pp.seatNo,
          avatar: pp.avatar,
        })),
      });

      socket.emit("joined", {
        gameId: game.id,
        code: game.code,
        hostUserId: game.hostUserId,
        you: { userId: p.id, name: p.name, seatNo: p.seatNo, avatar: p.avatar },
      });

      startIfFull(io, game);
    } catch (e) {
      socket.emit("error_msg", { message: e.message });
    }
  });

  socket.on("submit_pick", ({ userId, value }) => {
    if (!currentGame) return;
    submitPick(io, currentGame, userId, value);
  });

  socket.on("next_round", ({ userId }) => {
    if (!currentGame) return;
    startNextRoundByHost(io, currentGame, userId);
  });

  socket.on("start_anyway", () => {
    if (!currentGame) return;
    if (currentGame.players.length >= 2 && currentGame.status === "WAITING") {
      currentGame.status = "RUNNING";
      startRound(io, currentGame);
    }
  });

  socket.on("disconnect", () => {
    // We keep players in the game; timeouts will penalize them.
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
