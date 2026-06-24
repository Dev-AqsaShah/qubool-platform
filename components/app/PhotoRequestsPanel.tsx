"use client";

import { useEffect, useState } from "react";

interface RequestRow {
  owner_id: string;
  viewer_id: string;
  viewer_name: string;
}

export function PhotoRequestsPanel() {
  const [requests, setRequests] = useState<RequestRow[]>([]);

  async function refresh() {
    const res = await fetch("/api/photos/access");
    if (res.ok) setRequests((await res.json()).requests);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function respond(viewerId: string, action: "approve" | "decline") {
    await fetch("/api/photos/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_id: requests[0]?.owner_id, viewer_id: viewerId, action }),
    });
    await refresh();
  }

  if (requests.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>Photo requests</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {requests.map((r) => (
          <div key={r.viewer_id} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{r.viewer_name} wants to see your photo</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={() => respond(r.viewer_id, "approve")}>Approve</button>
              <button className="btn btn-ghost" onClick={() => respond(r.viewer_id, "decline")}>Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
