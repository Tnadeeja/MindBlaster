import React, { useState, useEffect } from "react";
import { socket } from "../lib/socket";

export default function Home({ setMe, setGame, setView }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  function createGame() {
    socket.emit("create_game", { name });
  }
  function joinGame() {
    socket.emit("join_game", { code, name });
  }

  useEffect(() => {
    const onCreated = ({ gameId, code, you, hostUserId }) => {
      setMe(you);
      setGame({ id: gameId, code, players: [], status: "WAITING", hostUserId });
      setView("lobby");
    };
    const onJoined = ({ gameId, code, you, hostUserId }) => {
      setMe(you);
      setGame({ id: gameId, code, players: [], status: "WAITING", hostUserId });
      setView("lobby");
    };
    const onError = ({ message }) => alert(message);

    socket.on("created", onCreated);
    socket.on("joined", onJoined);
    socket.on("error_msg", onError);

    return () => {
      socket.off("created", onCreated);
      socket.off("joined", onJoined);
      socket.off("error_msg", onError);
    };
  }, [setGame, setMe, setView]);

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: 8 }}>🧠 MindBlaster</h1>
        <p className="muted" style={{ fontSize: '1.1rem' }}>
          A strategic multiplayer game. Create a room for 5 players or join with a code.
        </p>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05))',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24
      }}>
        <h3 style={{ marginTop: 0 }}>🎮 Create Game</h3>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 16 }}>
          Start a new game and invite your friends
        </p>
        <div className="row">
          <input 
            placeholder="Enter your name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <button onClick={createGame} disabled={!name.trim()}>
            ✨ Create Room
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{ marginTop: 0 }}>🚪 Join Game</h3>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 16 }}>
          Enter a room code to join an existing game
        </p>
        <div className="row">
          <input 
            placeholder="Your name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <input 
            placeholder="ROOM CODE" 
            value={code} 
            onChange={e => setCode(e.target.value.toUpperCase())}
            style={{ width: 160, textAlign: 'center', fontWeight: 600, letterSpacing: 2 }}
          />
          <button onClick={joinGame} disabled={!name.trim() || code.length<6}>
            🎯 Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
