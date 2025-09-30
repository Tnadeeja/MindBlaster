import React from "react";

const avatars = [
  { id: 1, emoji: "🧙‍♂️", name: "Wizard" },
  { id: 2, emoji: "🦸‍♀️", name: "Hero" },
  { id: 3, emoji: "🤖", name: "Robot" },
  { id: 4, emoji: "👽", name: "Alien" },
  { id: 5, emoji: "🐉", name: "Dragon" },
  { id: 6, emoji: "🦊", name: "Fox" },
  { id: 7, emoji: "🐼", name: "Panda" },
  { id: 8, emoji: "🦁", name: "Lion" },
  { id: 9, emoji: "🐺", name: "Wolf" },
  { id: 10, emoji: "🦉", name: "Owl" },
  { id: 11, emoji: "🎭", name: "Mask" },
  { id: 12, emoji: "👾", name: "Invader" },
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
        Choose Your Avatar
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
                ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                : 'rgba(17, 24, 39, 0.8)',
              border: selected === avatar.emoji
                ? '2px solid #60a5fa'
                : '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selected === avatar.emoji
                ? '0 0 20px rgba(37, 99, 235, 0.5)'
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
