"use client";

import { useEffect, useState } from "react";

interface PhotoState {
  hasPhoto: boolean;
  url: string | null;
  privacyMode?: "match" | "request";
  accessStatus?: "requested" | "approved" | "revoked" | "declined" | null;
}

export function PhotoCard({ ownerId, verified }: { ownerId: string; verified?: boolean }) {
  const [state, setState] = useState<PhotoState | null>(null);
  const [requesting, setRequesting] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/photos/${ownerId}`);
    if (res.ok) setState(await res.json());
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  async function requestToView() {
    setRequesting(true);
    await fetch("/api/photos/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_id: ownerId, action: "request" }),
    });
    await refresh();
    setRequesting(false);
  }

  if (!state) {
    return <div className="photo" />;
  }

  if (!state.hasPhoto) {
    return (
      <div className="photo">
        {verified && <span className="qb-badge">✓ Verified</span>}
        <div className="overlay" style={{ opacity: 1 }}>
          <span className="lock">🕊️</span>
          <span style={{ fontSize: ".85rem" }}>No photo added</span>
        </div>
      </div>
    );
  }

  const revealed = Boolean(state.url);

  return (
    <div className={`photo${revealed ? " revealed" : ""}`}>
      {verified && <span className="qb-badge">✓ Verified</span>}
      <div className="blurlayer" />
      {revealed && state.url && (
        <div className="figure" style={{ opacity: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {!revealed && (
        <div className="overlay">
          <span className="lock">🔒</span>
          <span style={{ fontSize: ".85rem" }}>
            {state.accessStatus === "requested"
              ? "Request sent — awaiting approval"
              : state.accessStatus === "declined"
                ? "Request declined"
                : "Photo is private"}
          </span>
          {state.privacyMode === "request" && state.accessStatus !== "requested" && (
            <button className="reqbtn" onClick={requestToView} disabled={requesting}>
              {requesting ? "Requesting…" : "Request to view"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
