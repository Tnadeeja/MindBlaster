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
      <h2>Round in progress</h2>
      <div className="row" style={{alignItems:"center", margin:"12px 0"}}>
        <Timer seconds={seconds} />
        <div className="muted">Pick an integer between 0 and 100. Your pick is hidden until reveal.</div>
      </div>

      <div className="row">
        <NumberPicker value={value} setValue={setValue} disabled={submitted} />
        <button onClick={submit} disabled={submitted}>Submit</button>
      </div>

      <h3 style={{marginTop:20}}>Scores</h3>
      <Scoreboard players={game.players || []} />
    </div>
  );
}
