import React, { useEffect, useRef } from "react";

export default function GameTable({ players, currentRound }) {
  const canvasRef = useRef(null);

  // Player positions around the table (bird's eye view)
  const getPlayerPosition = (seatNo) => {
    const positions = {
      1: { x: 20, y: 30, label: "left-top" },       // Left side - top
      2: { x: 20, y: 70, label: "left-bottom" },    // Left side - bottom
      3: { x: 50, y: 85, label: "bottom-center" },  // Bottom center
      4: { x: 80, y: 70, label: "right-bottom" },   // Right side - bottom
      5: { x: 80, y: 30, label: "right-top" },      // Right side - top
    };
    return positions[seatNo] || { x: 50, y: 50 };
  };

  // Calculate reaper distance based on score (10 levels)
  const getReaperDistance = (score) => {
    if (score >= 0) return 100; // Far away
    const level = Math.abs(score);
    if (level >= 10) return 0; // At player (eliminated)
    return 100 - (level * 10); // 10% closer per negative point
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw table (rectangle in center)
    const tableX = width * 0.25;
    const tableY = height * 0.3;
    const tableWidth = width * 0.5;
    const tableHeight = height * 0.4;

    ctx.fillStyle = "rgba(31, 41, 55, 0.8)";
    ctx.strokeStyle = "rgba(96, 165, 250, 0.3)";
    ctx.lineWidth = 3;
    ctx.fillRect(tableX, tableY, tableWidth, tableHeight);
    ctx.strokeRect(tableX, tableY, tableWidth, tableHeight);

    // Draw table details
    ctx.strokeStyle = "rgba(96, 165, 250, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX + 10, tableY + 10, tableWidth - 20, tableHeight - 20);

  }, [players]);

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      {/* Canvas for table */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />

      {/* Players positioned around table */}
      {players.map((player) => {
        const pos = getPlayerPosition(player.seatNo);
        const reaperDist = getReaperDistance(player.score);
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
                opacity: isEliminated ? 0 : 1,
                transition: "all 0.5s ease",
              }}
            >
              <div
                style={{
                  background: isEliminated
                    ? "rgba(107, 114, 128, 0.5)"
                    : "linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(29, 78, 216, 0.3))",
                  border: isEliminated
                    ? "2px solid #6b7280"
                    : player.score <= -7
                    ? "2px solid #ef4444"
                    : player.score <= -4
                    ? "2px solid #f59e0b"
                    : "2px solid #2563eb",
                  borderRadius: 16,
                  padding: 12,
                  minWidth: 120,
                  textAlign: "center",
                  boxShadow: isEliminated
                    ? "none"
                    : player.score <= -7
                    ? "0 0 20px rgba(239, 68, 68, 0.5)"
                    : "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 4 }}>
                  {player.avatar || "🧙‍♂️"}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>
                  {player.name}
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
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
              </div>
            </div>

            {/* Reaper for this player */}
            {!isEliminated && (
              <div
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) translate(${(reaperDist - 100) * 0.8}px, ${(reaperDist - 100) * 0.8}px)`,
                  pointerEvents: "none",
                  transition: "all 0.8s ease-out",
                }}
              >
                <div
                  style={{
                    fontSize: player.score <= -7 ? "4rem" : "3rem",
                    filter: `drop-shadow(0 0 ${
                      player.score <= -7 ? "20px" : "10px"
                    } rgba(239, 68, 68, 0.8))`,
                    opacity: reaperDist < 50 ? 1 : 0.6,
                    animation: "float 2s ease-in-out infinite",
                  }}
                >
                  💀
                </div>
              </div>
            )}

            {/* Death animation */}
            {isEliminated && (
              <div
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: "6rem",
                  pointerEvents: "none",
                  zIndex: 100,
                  animation: "deathFade 1.5s ease-out forwards",
                }}
              >
                💀
              </div>
            )}
          </div>
        );
      })}

      {/* Round display (big screen above table) */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.9))",
          border: "3px solid #60a5fa",
          borderRadius: 20,
          padding: "16px 32px",
          boxShadow: "0 8px 32px rgba(37, 99, 235, 0.5)",
          animation: "slideDown 0.5s ease-out",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "#93c5fd", marginBottom: 4 }}>
          ROUND
        </div>
        <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>
          {currentRound}
        </div>
      </div>
    </div>
  );
}
