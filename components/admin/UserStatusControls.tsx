"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserStatus } from "@/types/database";

export function UserStatusControls({ userId, status }: { userId: string; status: UserStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: UserStatus) {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, status: next }),
    });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {status !== "active" && (
        <button className="btn btn-primary" onClick={() => setStatus("active")} disabled={loading}>Reactivate</button>
      )}
      {status !== "suspended" && (
        <button className="btn btn-ghost" onClick={() => setStatus("suspended")} disabled={loading}>Suspend</button>
      )}
      {status !== "banned" && (
        <button className="btn btn-ghost" style={{ color: "#b3261e", borderColor: "#b3261e" }} onClick={() => setStatus("banned")} disabled={loading}>
          Ban
        </button>
      )}
    </div>
  );
}
