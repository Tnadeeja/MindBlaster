import React from "react";

const avatars = [
  { id: 1, emoji: "👻", name: "Ghost" },
  { id: 2, emoji: "💀", name: "Skull" },
  { id: 3, emoji: "🧛", name: "Vampire" },
  { id: 4, emoji: "🧟", name: "Zombie" },
  { id: 5, emoji: "👹", name: "Demon" },
  { id: 6, emoji: "🎃", name: "Pumpkin" },
  { id: 7, emoji: "🕷️", name: "Spider" },
  { id: 8, emoji: "🕸️", name: "Web" },
  { id: 9, emoji: "⚰️", name: "Coffin" },
  { id: 10, emoji: "🦇", name: "Bat" },
  { id: 11, emoji: "🩸", name: "Blood" },
  { id: 12, emoji: "⚡", name: "Storm" },
];

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div>
      <div style={{ 
        fontSize: '0.9rem', 
        color: '#9ca3af', 
        marginBottom: 12,
        fontWeight: 600 
      }}>
        Choose Your Horror Avatar
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)', 
        gap: 8 
      }}>
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            onClick={() => onSelect(avatar.emoji)}
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: selected === avatar.emoji
                ? 'linear-gradient(135deg, #8b0000, #660000)'
                : '#0a0000',
              border: selected === avatar.emoji
                ? '2px solid #ff0000'
                : '1px solid rgba(139, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selected === avatar.emoji
                ? '0 0 20px rgba(139, 0, 0, 0.6)'
                : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {avatar.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
