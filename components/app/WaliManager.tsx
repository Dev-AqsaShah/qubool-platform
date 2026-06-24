"use client";

import { useEffect, useState } from "react";
import type { WaliRow } from "@/types/database";

export function WaliManager() {
  const [myWalis, setMyWalis] = useState<WaliRow[]>([]);
  const [invitedAsWali, setInvitedAsWali] = useState<WaliRow[]>([]);
  const [contact, setContact] = useState("");
  const [accessLevel, setAccessLevel] = useState<"full" | "summary">("summary");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/wali");
    if (res.ok) {
      const body = await res.json();
      setMyWalis(body.myWalis);
      setInvitedAsWali(body.invitedAsWali);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/wali", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wali_contact: contact, access_level: accessLevel }),
    });
    setContact("");
    await refresh();
    setLoading(false);
  }

  async function remove(waliId: string) {
    await fetch("/api/wali/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wali_id: waliId }),
    });
    await refresh();
  }

  async function respond(waliId: string, action: "accept" | "decline") {
    await fetch("/api/wali/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wali_id: waliId, action }),
    });
    await refresh();
  }

  return (
    <div>
      {invitedAsWali.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>You&apos;ve been invited as a wali</h3>
          {invitedAsWali.map((w) => (
            <div key={w.id} className="step" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Access level: {w.access_level}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => respond(w.id, "accept")}>Accept</button>
                <button className="btn btn-ghost" onClick={() => respond(w.id, "decline")}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>Your wali / guardian</h3>
      {myWalis.length === 0 && <p style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 14 }}>No one added yet.</p>}
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {myWalis.map((w) => (
          <div key={w.id} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{w.wali_contact}</strong>
              <div className="ploc">{w.access_level} access · {w.status}</div>
            </div>
            {w.status !== "removed" && (
              <button className="btn btn-ghost" onClick={() => remove(w.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={invite} className="step">
        <div className="field">
          <label htmlFor="wali_contact">Invite by email or phone</label>
          <input id="wali_contact" required value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="access_level">Access level</label>
          <select id="access_level" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value as "full" | "summary")}>
            <option value="summary">Summary — periodic overview</option>
            <option value="full">Full — can read all match chats</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Sending…" : "Send invite"}
        </button>
      </form>
    </div>
  );
}
