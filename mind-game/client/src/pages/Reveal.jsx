import React from "react";
import Scoreboard from "../components/Scoreboard";
import { socket } from "../lib/socket";

export default function Reveal({ game, setGame, setView }) {
  const reveal = game.lastReveal || {};
  const winners = new Set(reveal.winners || []);

  React.useEffect(() => {
    const onStartNext = ({ roundNo, secondsLeft }) => setView("round");
    const onGameOver = (payload) => {
      setGame(g => ({ ...g, gameOver: payload }));
      setView("gameover");
    };
    socket.on("round_started", onStartNext);
    socket.on("game_over", onGameOver);
    return () => {
      socket.off("round_started", onStartNext);
      socket.off("game_over", onGameOver);
    };
  }, []);

  return (
    <div className="card">
      <h2>Reveal</h2>
      <p className="muted">Here are the picks and results.</p>

      <div className="scores" style={{marginTop:10}}>
        {(reveal.picks || []).map(p => (
          <div key={p.userId} className={`pill ${winners.has(p.userId) ? "winner" : ""}`}>
            <div><strong>{p.name}</strong></div>
            <div>Pick: {p.value === null ? <em className="danger">missed</em> : p.value}</div>
          </div>
        ))}
      </div>

      <div className="pill" style={{marginTop:16}}>
        <div>Total: <strong>{reveal.total ?? 0}</strong></div>
        <div>Average: <strong>{(reveal.average ?? 0).toFixed(2)}</strong></div>
        <div>Final Output (×0.8): <strong>{(reveal.finalOutput ?? 0).toFixed(2)}</strong></div>
      </div>

      <h3 style={{marginTop:20}}>Scores</h3>
      <Scoreboard players={reveal.scores || []} />

      <p className="muted" style={{marginTop:10}}>Next round will start automatically…</p>
    </div>
  );
}
