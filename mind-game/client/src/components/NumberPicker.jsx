import React from "react";

export default function NumberPicker({ value, setValue, disabled }) {
  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div 
        style={{
          background: '#0a0000',
          border: '1px solid #4a0000',
          borderRadius: 16,
          padding: 20,
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>Your Pick</span>
          <span style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #ff0000, #8b0000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {value}
          </span>
        </div>
        
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            background: `linear-gradient(to right, #8b0000 0%, #8b0000 ${value}%, #4a0000 ${value}%, #4a0000 100%)`,
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem', color: '#6b7280' }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
      
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b0000, #660000);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(139, 0, 0, 0.6);
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(139, 0, 0, 0.8);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b0000, #660000);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(139, 0, 0, 0.6);
          transition: all 0.2s ease;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(139, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
}
