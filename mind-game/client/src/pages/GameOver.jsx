import React from "react";

export default function GameOver({ game }) {
  const over = game.gameOver || {};
  return (
    <div className="card">
      <h2>🏆 Game Over</h2>
      {over.winner ? (
        <p><strong>{over.winner.name}</strong> is the champion!</p>
      ) : (
        <p>No winner (all eliminated or aborted)</p>
      )}

      <h3>Final Standings</h3>
      <div className="scores">
        {(over.finalScores || []).map(p => (
          <div key={p.userId} className="pill">
            <div><strong>{p.name}</strong></div>
            <div>Score: {p.score}</div>
            <div>Status: {p.eliminated ? "Eliminated" : "Active"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
