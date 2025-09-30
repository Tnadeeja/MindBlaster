import React from "react";

export default function Scoreboard({ players }) {
  return (
    <div className="scores">
      {players.map((p) => (
        <div key={p.userId} className={`pill ${p.eliminated ? "strike" : ""}`}>
          <div><strong>Seat {p.seatNo}:</strong> {p.name}</div>
          <div>Score: <span className={p.score <= -9 ? "danger" : ""}>{p.score}</span></div>
        </div>
      ))}
    </div>
  );
}
