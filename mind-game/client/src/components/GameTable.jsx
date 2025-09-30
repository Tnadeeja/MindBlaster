import React from "react";

export default function GameTable({ players, currentRound }) {

  // Player positions horizontally across the screen
  const getPlayerPosition = (seatNo, totalPlayers) => {
    // Distribute players evenly across horizontal space
    const spacing = 100 / (totalPlayers + 1);
    const x = spacing * seatNo;
    const y = 50; // Center vertically
    return { x, y };
  };

  // Calculate danger color based on score (gradually turns red)
  const getDangerColor = (score) => {
    if (score >= 0) return { bg: "rgba(37, 99, 235, 0.3)", border: "#2563eb" };
    
    const level = Math.abs(score);
    const intensity = Math.min(level / 10, 1); // 0 to 1
    
    // Interpolate from blue to red
    const r = Math.floor(37 + (239 - 37) * intensity);
    const g = Math.floor(99 - 99 * intensity);
    const b = Math.floor(235 - 167 * intensity);
    
    return {
      bg: `rgba(${r}, ${g}, ${b}, 0.3)`,
      border: `rgb(${r}, ${g}, ${b})`,
      glow: intensity > 0.7 ? `0 0 20px rgba(${r}, ${g}, ${b}, 0.6)` : "none"
    };
  };

  // No canvas drawing needed anymore

  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "60px", marginBottom: 20 }}>
      {/* Round display */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(29, 78, 216, 0.3))",
          border: "2px solid #2563eb",
          borderRadius: 12,
          padding: "8px 24px",
          boxShadow: "0 4px 16px rgba(37, 99, 235, 0.5)",
          animation: "slideDown 0.5s ease-out",
        }}
      >
        <div style={{ fontSize: "0.7rem", color: "#93c5fd", marginBottom: 2 }}>
          ROUND
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          {currentRound}
        </div>
      </div>
      
      {/* Players positioned horizontally */}
      <div style={{ position: "relative", width: "100%", height: "150px" }}>
      {players.map((player) => {
        const pos = getPlayerPosition(player.seatNo, players.length);
        const dangerColor = getDangerColor(player.score);
        const isEliminated = player.eliminated;

        return (
          <div key={player.userId}>
            {/* Player */}
            <div
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                transition: "all 0.5s ease",
              }}
            >
              <div
                style={{
                  background: isEliminated
                    ? "rgba(107, 114, 128, 0.5)"
                    : `linear-gradient(135deg, ${dangerColor.bg}, ${dangerColor.bg})`,
                  border: isEliminated
                    ? "2px solid #6b7280"
                    : `2px solid ${dangerColor.border}`,
                  borderRadius: 12,
                  padding: 10,
                  minWidth: 90,
                  textAlign: "center",
                  boxShadow: isEliminated
                    ? "none"
                    : dangerColor.glow !== "none"
                    ? dangerColor.glow
                    : "0 4px 12px rgba(0, 0, 0, 0.3)",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 4 }}>
                  {player.avatar || "🧙‍♂️"}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: 2 }}>
                  {player.name}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color:
                      player.score <= -7
                        ? "#ef4444"
                        : player.score <= -4
                        ? "#f59e0b"
                        : player.score > 0
                        ? "#10b981"
                        : "#e5e7eb",
                  }}
                >
                  {player.score}
                </div>
                
                {/* Cross mark for eliminated players */}
                {isEliminated && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                      color: "#ef4444",
                      fontWeight: 700,
                      animation: "crossFade 0.8s ease-out",
                      textShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
                    }}
                  >
                    ✕
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
