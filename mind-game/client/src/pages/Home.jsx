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
      <h1>Mind Game</h1>
      <p className="muted">Create a private room for 5 players, or join with a code.</p>

      <h3>Create Game</h3>
      <div className="row">
        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createGame} disabled={!name.trim()}>Create</button>
      </div>

      <hr style={{margin:"24px 0", borderColor:"#374151"}}/>

      <h3>Join Game</h3>
      <div className="row">
        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Room code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{width:140}} />
        <button onClick={joinGame} disabled={!name.trim() || code.length<6}>Join</button>
      </div>
    </div>
  );
}
