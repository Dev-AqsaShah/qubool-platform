"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnblockButton({ blockedId }: { blockedId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function unblock() {
    setLoading(true);
    await fetch("/api/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_id: blockedId }),
    });
    router.refresh();
  }

  return (
    <button className="btn btn-ghost" onClick={unblock} disabled={loading}>
      {loading ? "Unblocking…" : "Unblock"}
    </button>
  );
}
