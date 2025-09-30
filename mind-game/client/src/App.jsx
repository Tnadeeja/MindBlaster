import React, { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import Round from "./pages/Round.jsx";
import Reveal from "./pages/Reveal.jsx";
import GameOver from "./pages/GameOver.jsx";
import { socket } from "./lib/socket";

export default function App() {
  const [view, setView] = useState("home"); // home | lobby | round | reveal | gameover
  const [me, setMe] = useState(null);       // { userId, name, seatNo }
  const [game, setGame] = useState({ code: "", players: [], status: "WAITING", hostUserId: null });

  useEffect(() => {
    const onLobby = (payload) => {
      setGame((g) => ({
        ...g,
        players: payload.players,
        status: payload.status,
        code: payload.code,
        hostUserId: payload.hostUserId ?? g.hostUserId,
      }));
    };

    const onRoundStarted = ({ scores }) => {
      // Keep players list in sync at the moment the round begins
      if (Array.isArray(scores)) {
        setGame((g) => ({ ...g, players: scores }));
      }
    };

    const onResult = (payload) => {
      setGame((g) => ({ ...g, lastReveal: payload }));
    };

    const onGameOver = (payload) => {
      setGame((g) => ({ ...g, gameOver: payload }));
      setView("gameover");
    };

    socket.on("lobby_update", onLobby);
    socket.on("round_started", onRoundStarted);
    socket.on("round_result", onResult);
    socket.on("game_over", onGameOver);

    return () => {
      socket.off("lobby_update", onLobby);
      socket.off("round_started", onRoundStarted);
      socket.off("round_result", onResult);
      socket.off("game_over", onGameOver);
    };
  }, []);

  return (
    <>
      {view === "home" && <Home setMe={setMe} setGame={setGame} setView={setView} />}
      {view === "lobby" && <Lobby me={me} game={game} setGame={setGame} setView={setView} />}
      {view === "round" && <Round me={me} game={game} setGame={setGame} setView={setView} />}
      {view === "reveal" && <Reveal me={me} game={game} setGame={setGame} setView={setView} />}
      {view === "gameover" && <GameOver game={game} />}
    </>
  );
}
