"use client";

import { useState } from "react";

export function PhotoPrivacyDemo() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="pcard">
      <div className={`photo${revealed ? " revealed" : ""}`}>
        <span className="qb-badge">✓ Verified</span>
        <div className="blurlayer" />
        <div className="figure">
          <svg width="120" height="150" viewBox="0 0 120 150" fill="none">
            <circle cx="60" cy="48" r="30" fill="#fff" fillOpacity=".9" />
            <path
              d="M15 150 C15 110 35 92 60 92 C85 92 105 110 105 150 Z"
              fill="#fff"
              fillOpacity=".9"
            />
          </svg>
        </div>
        <div className="overlay">
          <span className="lock">🔒</span>
          <span style={{ fontSize: ".85rem" }}>Photo is private</span>
          <button className="reqbtn" onClick={() => setRevealed((v) => !v)}>
            Request to view
          </button>
        </div>
      </div>
      <div className="pinfo">
        <div className="pname">Ayesha, 26</div>
        <div className="ploc">Lahore · Speaks Urdu &amp; English</div>
        <div className="match">
          <span>Match</span>
          <span className="bar"><i /></span>
          <span>88%</span>
        </div>
        <div className="tags">
          <span>Practicing</span>
          <span>Wants family</span>
          <span>Pharmacist</span>
          <span>Family involved</span>
        </div>
        <div className="note">
          <b>She decides</b> who can start the conversation.
        </div>
      </div>
    </div>
  );
}
