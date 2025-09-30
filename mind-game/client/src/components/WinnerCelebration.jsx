import React, { useEffect, useRef } from "react";

export default function WinnerCelebration({ winner }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles
    const confetti = [];
    const colors = ["#fbbf24", "#f59e0b", "#60a5fa", "#a78bfa", "#10b981", "#ef4444"];

    class Confetti {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Create confetti
    for (let i = 0; i < 150; i++) {
      confetti.push(new Confetti());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((piece) => {
        piece.update();
        piece.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />

      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1001,
          animation: "celebrate 0.8s ease-out",
        }}
      >
        <div
          style={{ 
            fontSize: "8rem", 
            marginBottom: 16,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          🏆
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))",
            border: "3px solid #f59e0b",
            borderRadius: 24,
            padding: "24px 48px",
            display: "inline-block",
            boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)",
            animation: "fadeIn 0.5s ease-out 0.3s backwards",
          }}
        >
          <div style={{ fontSize: "1.2rem", color: "#fbbf24", marginBottom: 8 }}>
            🎉 WINNER 🎉
          </div>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>
            {winner?.avatar || "🧙‍♂️"}
          </div>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {winner?.name || "Champion"}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: "1.5rem",
            fontWeight: 600,
            animation: "fadeIn 0.5s ease-out 0.6s backwards",
          }}
        >
          Final Score: {winner?.score || 0}
        </div>
      </div>
    </div>
  );
}
