import React from "react";

export default function Timer({ seconds }) {
  return (
    <div className="pill center big" style={{minWidth:120}}>
      ⏱ {seconds}s
    </div>
  );
}
