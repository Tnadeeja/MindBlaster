import React, { useEffect } from "react";
import { sounds } from "../lib/sounds";
import { Frown, Trophy, Medal, Award, X, Check, Gamepad2 } from "lucide-react";
import WinnerCelebration from "../components/WinnerCelebration";

export default function GameOver({ game }) {
  const over = game.gameOver || {};
  const sortedScores = [...(over.finalScores || [])].sort((a, b) => b.score - a.score);
  
  useEffect(() => {
    // Play victory sound for winner, game over for others
    if (over.winner) {
      sounds.win();
    } else {
      sounds.gameOver();
    }
  }, []);
  
  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="card">
      {/* Winner Celebration with Confetti */}
      {over.winner && (
        <div style={{ marginBottom: 32 }}>
          <WinnerCelebration winner={over.winner} />
        </div>
      )}

      {!over.winner && (
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Frown size={80} color="#9ca3af" />
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>Game Over!</h1>
          <p className="muted" style={{ fontSize: '1.2rem' }}>
            No winner - all players eliminated or game aborted
          </p>
        </div>
      )}

      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Trophy size={28} color="#fbbf24" />
          Final Standings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedScores.map((p, index) => (
            <div 
              key={p.userId}
              style={{
                background: index === 0 
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
                  : index === 1
                  ? 'linear-gradient(135deg, rgba(203, 213, 225, 0.15), rgba(148, 163, 184, 0.1))'
                  : index === 2
                  ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(180, 83, 9, 0.1))'
                  : 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8))',
                border: index < 3 
                  ? `2px solid ${index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : '#cd7f32'}`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.3s ease',
                animation: `slideIn ${0.3 + index * 0.1}s ease-out`
              }}
            >
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700,
                minWidth: 60,
                textAlign: 'center'
              }}>
                {getMedalEmoji(index)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 700,
                  marginBottom: 4
                }}>
                  {p.name}
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: p.eliminated ? '#f87171' : '#10b981'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {p.eliminated ? (
                      <>
                        <X size={16} />
                        Eliminated
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Survived
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                minWidth: 80,
                textAlign: 'right'
              }}>
                {p.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '16px 48px',
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
            margin: '0 auto'
          }}
        >
          <Gamepad2 size={24} />
          Play Again
        </button>
      </div>
    </div>
  );
}
