"use client";

import { useState } from "react";

const REPORT_REASONS = ["Inappropriate content", "Harassment or abuse", "Suspected scam", "Fake profile", "Other"];

export function BlockReportControls({ targetId }: { targetId: string }) {
  const [open, setOpen] = useState<"block" | "report" | null>(null);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState<string | null>(null);

  async function block() {
    await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_id: targetId }),
    });
    setDone("Blocked. They can no longer message you.");
    setOpen(null);
  }

  async function report() {
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: targetId, reason, details }),
    });
    setDone("Report submitted. Our team will review it.");
    setOpen(null);
  }

  if (done) return <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{done}</p>;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost" onClick={() => setOpen(open === "report" ? null : "report")}>Report</button>
        <button className="btn btn-ghost" onClick={() => setOpen(open === "block" ? null : "block")}>Block</button>
      </div>
      {open === "block" && (
        <div className="step" style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 260, zIndex: 5 }}>
          <p style={{ fontSize: ".88rem", marginBottom: 12 }}>Block this person? They won&apos;t be able to message or appear to you again.</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={block}>Confirm block</button>
        </div>
      )}
      {open === "report" && (
        <div className="step" style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 280, zIndex: 5 }}>
          <div className="field">
            <label>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Details (optional)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={report}>Submit report</button>
        </div>
      )}
    </div>
  );
}
