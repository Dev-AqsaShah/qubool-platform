"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { action: "approve", label: "Approve (no issue)" },
  { action: "warn", label: "Warn user" },
  { action: "remove", label: "Remove content" },
  { action: "ban", label: "Ban user" },
] as const;

export function ModerationActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(action);
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ACTIONS.map((a) => (
        <button
          key={a.action}
          className={a.action === "ban" ? "btn btn-ghost" : "btn btn-primary"}
          style={a.action === "ban" ? { color: "#b3261e", borderColor: "#b3261e" } : undefined}
          onClick={() => act(a.action)}
          disabled={loading !== null}
        >
          {loading === a.action ? "…" : a.label}
        </button>
      ))}
    </div>
  );
}
