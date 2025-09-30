import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import Scoreboard from "../components/Scoreboard";

export default function Lobby({ me, game, setGame, setView }) {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const onLobby = (payload) => {
      setGame((g) => ({
        ...g,
        ...payload,
        players: payload.players,
        status: payload.status,
        hostUserId: payload.hostUserId,
      }));
    };
    const onStarting = ({ countdown }) => {
      setCountdown(countdown);
      if (countdown <= 0) setCountdown(null);
    };
    const onRoundStart = () => {
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
  }, [setGame, setView]);

  const playerCount = (game.players || []).length;
  
  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>🎮 Game Lobby</h2>
        <div style={{ 
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.2))',
          border: '2px solid #2563eb',
          borderRadius: 16,
          padding: '12px 32px',
          marginBottom: 8
        }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 4 }}>Room Code</div>
          <code style={{ fontSize: '1.8rem', fontWeight: 700 }}>{game.code}</code>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          📤 Share this code with friends to join the game
        </p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>👥 Players</h3>
          <div style={{
            background: playerCount === 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 99, 235, 0.2)',
            border: `1px solid ${playerCount === 5 ? '#10b981' : '#2563eb'}`,
            borderRadius: 12,
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}>
            {playerCount}/5
          </div>
        </div>
        <Scoreboard players={game.players || []} />
      </div>

      {countdown !== null ? (
        <div 
          className="pill center" 
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
            border: '2px solid #10b981',
            padding: 24,
            animation: 'pulse 1s ease-in-out infinite'
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8 }}>
            🚀 {countdown}
          </div>
          <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>
            Game starting...
          </div>
        </div>
      ) : (
        <div className="pill center" style={{ padding: 20 }}>
          <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>
            ⏳ Waiting for players...
          </div>
          <div style={{ color: '#9ca3af' }}>
            {5 - playerCount} more {5 - playerCount === 1 ? 'player' : 'players'} needed to start
          </div>
        </div>
      )}
    </div>
  );
}
