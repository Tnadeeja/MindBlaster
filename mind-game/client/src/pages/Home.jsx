import React, { useState, useEffect } from "react";
import { socket } from "../lib/socket";
import { sounds } from "../lib/sounds";
import { Brain, Gamepad2, Plus, LogIn, Send } from "lucide-react";
import AvatarPicker from "../components/AvatarPicker";

export default function Home({ setMe, setGame, setView }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [avatar, setAvatar] = useState("👻");

  function createGame() {
    socket.emit("create_game", { name, avatar });
  }
  function joinGame() {
    socket.emit("join_game", { code, name, avatar });
  }

  useEffect(() => {
    const onCreated = ({ gameId, code, you, hostUserId }) => {
      sounds.join();
      setMe(you);
      setGame({ id: gameId, code, players: [], status: "WAITING", hostUserId });
      setView("lobby");
    };
    const onJoined = ({ gameId, code, you, hostUserId }) => {
      sounds.join();
      setMe(you);
      setGame({ id: gameId, code, players: [], status: "WAITING", hostUserId });
      setView("lobby");
    };
    const onError = ({ message }) => {
      sounds.error();
      alert(message);
    };

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
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Brain size={56} color="#FF0000" />
          <span>MindBlaster</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#f0f0f0', lineHeight: 1.4 }}>
          A deadly multiplayer game of survival. Create a room for 5 victims or join with a code if you dare...
        </p>
      </div>

      <div className="pill" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' }}>
          <Gamepad2 size={24} color="#FF0000" />
          Create Death Match
        </h3>
        <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', marginBottom: 16, color: '#f0f0f0' }}>
          Start a new deadly game and invite your victims
        </p>
        
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        
        <div className="row" style={{ marginTop: 16 }}>
          <input 
            placeholder="Enter your name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, minWidth: 200, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}
          />
          <button onClick={createGame} disabled={!name.trim()} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
            <Plus size={20} />
            <span style={{ display: 'none' }}>Create Death Room</span>
          </button>
        </div>
      </div>

      <div className="pill">
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' }}>
          <LogIn size={24} color="#FF0000" />
          Join Game
        </h3>
        <p style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', marginBottom: 16, color: '#f0f0f0' }}>
          Enter the cursed code to join an existing death match
        </p>
        
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
        
        <div className="row" style={{ marginTop: 16 }}>
          <input 
            placeholder="Your name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, minWidth: 180, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}
          />
          <input 
            placeholder="DEATH CODE" 
            value={code} 
            onChange={e => setCode(e.target.value.toUpperCase())}
            style={{ width: 160, textAlign: 'center', fontWeight: 600, letterSpacing: 2, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}
          />
          <button onClick={joinGame} disabled={!name.trim() || !code.trim()} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
            <Send size={20} />
            <span style={{ display: 'none' }}>Enter the Darkness</span>
          </button>
        </div>
      </div>
    </div>
  );
}
