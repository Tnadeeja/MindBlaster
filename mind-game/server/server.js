import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { createGame, findGameByCode, joinGame, startIfFull, startRound, submitPick } from "./game/GameEngine.js";

const app = express();
app.use(cors());
app.get("/", (_req, res) => res.send("Mind Game API running ✅"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] }
});

// Socket helpers
function joinSocketRoom(socket, game) {
  socket.join(`game:${game.id}`);
}

// socket handlers
io.on("connection", (socket) => {
  // client sends their "clientId" to help with reconnect logic later (not fully implemented)
  let currentGame = null;
  let currentUser = null;

  socket.on("create_game", ({ name }) => {
    const game = createGame(io, socket.id, name);
    currentGame = game;
    currentUser = game.players[0];
    joinSocketRoom(socket, game);

    io.to(`game:${game.id}`).emit("lobby_update", {
      gameId: game.id, code: game.code, status: game.status,
      players: game.players.map(p => ({ userId: p.id, name: p.name, score: p.score, eliminated: p.eliminated, seatNo: p.seatNo }))
    });

    socket.emit("created", { gameId: game.id, code: game.code, you: { userId: currentUser.id, name: currentUser.name, seatNo: currentUser.seatNo } });
  });

  socket.on("join_game", ({ code, name }) => {
    const game = findGameByCode(code);
    if (!game) return socket.emit("error_msg", { message: "Game not found" });
    try {
      const p = joinGame(game, socket.id, name);
      currentGame = game;
      currentUser = p;
      joinSocketRoom(socket, game);

      io.to(`game:${game.id}`).emit("lobby_update", {
        gameId: game.id, code: game.code, status: game.status,
        players: game.players.map(pp => ({ userId: pp.id, name: pp.name, score: pp.score, eliminated: pp.eliminated, seatNo: pp.seatNo }))
      });

      socket.emit("joined", { gameId: game.id, code: game.code, you: { userId: p.id, name: p.name, seatNo: p.seatNo } });
      startIfFull(io, game);
    } catch (e) {
      socket.emit("error_msg", { message: e.message });
    }
  });

  socket.on("submit_pick", ({ userId, value }) => {
    if (!currentGame) return;
    submitPick(io, currentGame, userId, value);
  });

  socket.on("start_anyway", () => {
    // Only allow start if at least 2 players
    if (!currentGame) return;
    if (currentGame.players.length >= 2 && currentGame.status === "WAITING") {
      currentGame.status = "RUNNING";
      startRound(io, currentGame);
    }
  });

  socket.on("disconnect", () => {
    // We keep players; they’ll get -1 per missed round and eventually be eliminated.
    // Could broadcast a "player_left" if you want:
    // if (currentGame && currentUser) io.to(`game:${currentGame.id}`).emit("player_left", { userId: currentUser.id });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
