import React from "react";
import { socket } from "../lib/socket";
import Scoreboard from "../components/Scoreboard";

export default function Lobby({ me, game, setGame, setView }) {
  const [countdown, setCountdown] = React.useState(null);

  React.useEffect(() => {
    const onLobby = (payload) => {
      setGame(g => ({ ...g, ...payload, players: payload.players, status: payload.status }));
    };
    const onStarting = ({ countdown }) => {
      setCountdown(countdown);
      if (countdown <= 0) setCountdown(null);
    };
    const onRoundStart = ({ roundNo, secondsLeft }) => {
      setView("round");
    };

    socket.on("lobby_update", onLobby);
    socket.on("game_starting", onStarting);
    socket.on("round_started", onRoundStart);

    return () => {
      socket.off("lobby_update", onLobby);
      socket.off("game_starting", onStarting);
      socket.off("round_started", onRoundStart);
    };
  }, []);

  return (
    <div className="card">
      <h2>Room Code: <code>{game.code}</code></h2>
      <p>Share this code with friends. Game starts when 5 players join.</p>

      <h3>Players</h3>
      <Scoreboard players={game.players || []} />

      {countdown !== null ? (
        <div className="pill center big" style={{marginTop:16}}>Starting in {countdown}…</div>
      ) : (
        <p className="muted" style={{marginTop:16}}>Waiting for players… ({(game.players||[]).length}/5)</p>
      )}
    </div>
  );
}
