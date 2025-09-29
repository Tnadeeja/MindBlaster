import React from "react";

export default function NumberPicker({ value, setValue, disabled }) {
  return (
    <div className="row">
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const v = parseInt(e.target.value || "0", 10);
          if (!Number.isNaN(v) && v >= 0 && v <= 100) setValue(v);
        }}
        style={{ width: 120 }}
      />
    </div>
  );
}
