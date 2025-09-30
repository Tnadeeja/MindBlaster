import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { sounds } from "../lib/sounds";
import { CheckCircle, Target, Skull } from "lucide-react";
import NumberPicker from "../components/NumberPicker";
import GameTable from "../components/GameTable";
import Timer from "../components/Timer";

export default function Round({ me, game, setGame, setView }) {
  const [seconds, setSeconds] = useState(120);
  const [value, setValue] = useState(50);
  const [submitted, setSubmitted] = useState(false);
  
  // Check if current player is eliminated
  const currentPlayer = (game.players || []).find(p => p.userId === me?.userId);
  const isEliminated = currentPlayer?.eliminated || false;

  useEffect(() => {
    const onTick = ({ secondsLeft }) => {
      setSeconds(secondsLeft);
      // Play urgent sound when time is running out
      if (secondsLeft === 10 || secondsLeft === 5 || secondsLeft === 3 || secondsLeft === 2 || secondsLeft === 1) {
        sounds.timerUrgent();
      }
    };

    const onStart = ({ roundNo, secondsLeft, scores }) => {
      // Reset UI
      setSubmitted(false);
      setSeconds(secondsLeft);
      // ⬅️ IMPORTANT: apply server-sent scores/players immediately
      if (Array.isArray(scores)) {
        setGame((g) => ({ ...g, players: scores, currentRound: roundNo }));
      }
    };

    const onResult = (payload) => {
      // Store reveal data, update host if changed, and switch page
      setGame((g) => ({ 
        ...g, 
        lastReveal: payload,
        hostUserId: payload.hostUserId || g.hostUserId // Update host if provided
      }));
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
    sounds.submit();
    socket.emit("submit_pick", { userId: me.userId, value });
    setSubmitted(true);
  }

  return (
    <div className="card" style={{ maxWidth: 1200 }}>
      {/* Game Table View */}
      <GameTable players={game.players || []} currentRound={game.currentRound} />

      {/* Control Panel at bottom */}
      <div style={{ marginTop: 24 }}>
        <div style={{ 
          display: 'flex', 
          gap: 20, 
          alignItems: 'center', 
          marginBottom: 20,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Timer seconds={seconds} />
          {submitted && !isEliminated && (
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
              <CheckCircle size={20} />
              Submitted!
            </div>
          )}
          {isEliminated && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
              border: '2px solid #ef4444',
              borderRadius: 16,
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '1.3rem',
              fontWeight: 700,
              animation: 'pulse 2s ease-in-out infinite',
              textShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
            }}>
              <Skull size={24} />
              You are Eliminated!
            </div>
          )}
        </div>

        {!isEliminated && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.05))',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: 20,
            padding: 24
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
              <NumberPicker value={value} setValue={setValue} disabled={submitted} />
              <button 
                onClick={submit} 
                disabled={submitted}
                style={{ 
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  minWidth: 140,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center'
                }}
              >
                {submitted ? (
                  <>
                    <CheckCircle size={20} />
                    Locked In
                  </>
                ) : (
                  <>
                    <Target size={20} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {isEliminated && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.05))',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            borderRadius: 20,
            padding: 32,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', color: '#9ca3af' }}>
              You cannot submit picks anymore. Wait for the round to end.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
