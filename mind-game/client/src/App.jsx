import React from "react";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import Round from "./pages/Round.jsx";
import Reveal from "./pages/Reveal.jsx";
import GameOver from "./pages/GameOver.jsx";
import { socket } from "./lib/socket";

export default function App() {
  const [view, setView] = React.useState("home"); // home | lobby | round | reveal | gameover
  const [me, setMe] = React.useState(null); // { userId, name, seatNo }
  const [game, setGame] = React.useState({ code: "", players: [], status: "WAITING" });

  // keep lobby scores updated during the game
  React.useEffect(() => {
    const onLobby = (payload) => {
      setGame(g => ({ ...g, players: payload.players, status: payload.status, code: payload.code }));
    };
    const onResult = (payload) => {
      setGame(g => ({ ...g, lastReveal: payload }));
    };
    const onGameOver = (payload) => {
      setGame(g => ({ ...g, gameOver: payload }));
      setView("gameover");
    };

    socket.on("lobby_update", onLobby);
    socket.on("round_result", onResult);
    socket.on("game_over", onGameOver);
    return () => {
      socket.off("lobby_update", onLobby);
      socket.off("round_result", onResult);
      socket.off("game_over", onGameOver);
    };
  }, []);

  return (
    <>
      {view === "home" && <Home setMe={setMe} setGame={setGame} setView={setView} />}
      {view === "lobby" && <Lobby me={me} game={game} setGame={setGame} setView={setView} />}
      {view === "round" && <Round me={me} game={game} setGame={setGame} setView={setView} />}
      {view === "reveal" && <Reveal game={game} setGame={setGame} setView={setView} />}
      {view === "gameover" && <GameOver game={game} />}
    </>
  );
}
