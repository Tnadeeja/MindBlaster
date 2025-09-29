import React from "react";
import { socket } from "../lib/socket";
import NumberPicker from "../components/NumberPicker";
import Scoreboard from "../components/Scoreboard";
import Timer from "../components/Timer";

export default function Round({ me, game, setGame, setView }) {
  const [seconds, setSeconds] = React.useState(20);
  const [value, setValue] = React.useState(50);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    const onTick = ({ secondsLeft }) => setSeconds(secondsLeft);
    const onResult = (payload) => {
      // move to reveal view and pass payload via game state
      setGame(g => ({ ...g, lastReveal: payload }));
      setView("reveal");
    };
    const onStart = ({ roundNo, secondsLeft }) => {
      setSubmitted(false);
      setSeconds(secondsLeft);
    };

    socket.on("round_tick", onTick);
    socket.on("round_result", onResult);
    socket.on("round_started", onStart);

    return () => {
      socket.off("round_tick", onTick);
      socket.off("round_result", onResult);
      socket.off("round_started", onStart);
    };
  }, []);

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
