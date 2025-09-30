import React from "react";

export default function Scoreboard({ players }) {
  return (
    <div className="scores">
      {players.map((p) => (
        <div 
          key={p.userId} 
          className={`pill ${p.eliminated ? "strike" : ""}`}
          style={{
            opacity: p.eliminated ? 0.5 : 1,
            position: 'relative'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginBottom: 8
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: p.eliminated 
                ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}>
              {p.seatNo}
            </div>
            <div style={{ 
              fontWeight: 700,
              fontSize: '1.05rem',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {p.name}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Score</span>
            <span 
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 700,
                color: p.score <= -9 ? '#f87171' : p.score > 0 ? '#10b981' : '#e5e7eb'
              }}
            >
              {p.score}
            </span>
          </div>
          
          {p.eliminated && (
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: 8,
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#f87171'
            }}>
              OUT
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
