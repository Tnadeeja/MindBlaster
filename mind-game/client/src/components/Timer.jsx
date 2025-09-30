import React from "react";

export default function Timer({ seconds }) {
  const maxSeconds = 120;
  const percentage = (seconds / maxSeconds) * 100;
  const isUrgent = seconds <= 10;
  
  return (
    <div 
      className="pill center" 
      style={{
        minWidth: 140,
        background: isUrgent 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))' 
          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.2))',
        border: isUrgent ? '2px solid #ef4444' : '2px solid #2563eb',
        animation: isUrgent ? 'pulse 1s ease-in-out infinite' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${percentage}%`,
          background: isUrgent 
            ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))' 
            : 'linear-gradient(180deg, rgba(37, 99, 235, 0.3), rgba(37, 99, 235, 0.1))',
          transition: 'height 1s linear',
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, fontSize: '1.8rem', fontWeight: 700 }}>
        ⏱ {seconds}s
      </div>
    </div>
  );
}
