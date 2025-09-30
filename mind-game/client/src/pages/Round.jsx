import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import NumberPicker from "../components/NumberPicker";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";

export default function Round({ me, game, setGame, setView }) {
  const [seconds, setSeconds] = useState(120);
  const [value, setValue] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onTick = ({ secondsLeft }) => setSeconds(secondsLeft);

    const onStart = ({ roundNo, secondsLeft, scores }) => {
      // Reset UI
      setSubmitted(false);
      setSeconds(secondsLeft);
      // ⬅️ IMPORTANT: apply server-sent scores/players immediately
      if (Array.isArray(scores)) {
        setGame((g) => ({ ...g, players: scores }));
      }
    };

    const onResult = (payload) => {
      // Store reveal data and switch page
      setGame((g) => ({ ...g, lastReveal: payload }));
      setView("reveal");
    };

    socket.on("round_tick", onTick);
    socket.on("round_started", onStart);
    socket.on("round_result", onResult);

    return () => {
      socket.off("round_tick", onTick);
      socket.off("round_started", onStart);
      socket.off("round_result", onResult);
    };
  }, [setGame, setView]);

  function submit() {
    socket.emit("submit_pick", { userId: me.userId, value });
    setSubmitted(true);
  }

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>⚡ Round in Progress</h2>
        <p className="muted">
          Pick an integer between 0 and 100. Your choice is hidden until the reveal phase.
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 20, 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Timer seconds={seconds} />
        {submitted && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
            border: '2px solid #10b981',
            borderRadius: 16,
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            ✅ Submitted!
          </div>
        )}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05))',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <NumberPicker value={value} setValue={setValue} disabled={submitted} />
          <button 
            onClick={submit} 
            disabled={submitted}
            style={{ 
              padding: '16px 32px',
              fontSize: '1.1rem',
              minWidth: 140
            }}
          >
            {submitted ? '✓ Locked In' : '🎯 Submit'}
          </button>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 20
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>📊 Current Scores</h3>
        <Scoreboard players={game.players || []} />
      </div>
    </div>
  );
}
