"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportStatus } from "@/types/database";

export function ReportStatusControls({ id, status }: { id: string; status: ReportStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: ReportStatus) {
    setLoading(true);
    await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    router.refresh();
  }

  if (status === "resolved" || status === "dismissed") {
    return <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{status}</span>;
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn btn-primary" onClick={() => setStatus("resolved")} disabled={loading}>Resolve</button>
      <button className="btn btn-ghost" onClick={() => setStatus("dismissed")} disabled={loading}>Dismiss</button>
    </div>
  );
}
