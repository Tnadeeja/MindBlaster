import React, { useEffect, useState } from "react";
import Scoreboard from "../components/Scoreboard";
import { socket } from "../lib/socket";

export default function Reveal({ me, game, setGame, setView }) {
  const reveal = game.lastReveal || {};
  const winners = new Set(reveal.winners || []);
  const isHost = game?.hostUserId === me?.userId;
  const [waitingForHost, setWaitingForHost] = useState(true);

  useEffect(() => {
    const onStartNext = () => setView("round");
    const onGameOver = (payload) => {
      setGame((g) => ({ ...g, gameOver: payload }));
      setView("gameover");
    };
    const onAwait = () => setWaitingForHost(true);

    socket.on("round_started", onStartNext);
    socket.on("game_over", onGameOver);
    socket.on("await_next_round", onAwait);

    return () => {
      socket.off("round_started", onStartNext);
      socket.off("game_over", onGameOver);
      socket.off("await_next_round", onAwait);
    };
  }, [setGame, setView]);

  function nextRound() {
    setWaitingForHost(false);
    socket.emit("next_round", { userId: me.userId });
  }

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>🎭 Round Results</h2>
        <p className="muted">
          All picks are now revealed. See who came closest to the target!
        </p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05))',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>🎯 Player Picks</h3>
        <div className="scores">
          {(reveal.picks || []).map((p) => (
            <div 
              key={p.userId} 
              className={`pill ${winners.has(p.userId) ? "winner" : ""}`}
              style={{
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {winners.has(p.userId) && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  fontSize: '1.5rem'
                }}>
                  🏆
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                {p.name}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {p.value === null ? (
                  <em className="danger">⏰ Missed</em>
                ) : (
                  <span style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {p.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>📊 Calculations</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 12 
        }}>
          <div className="pill" style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{reveal.total ?? 0}</div>
          </div>
          <div className="pill" style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 4 }}>Average</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{(reveal.average ?? 0).toFixed(2)}</div>
          </div>
          <div className="pill" style={{ textAlign: 'center', border: '2px solid #2563eb' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 4 }}>Target (×0.8)</div>
            <div style={{ 
              fontSize: '1.8rem', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {(reveal.finalOutput ?? 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>🏅 Leaderboard</h3>
        <Scoreboard players={reveal.scores || []} />
      </div>

      {isHost ? (
        <button 
          onClick={nextRound}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}
        >
          ▶️ Start Next Round
        </button>
      ) : (
        <div className="pill center" style={{ padding: 20 }}>
          <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>
            ⏳ Waiting for host...
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            The host will start the next round
          </div>
        </div>
      )}
    </div>
  );
}
