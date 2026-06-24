"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch("/api/account/delete", { method: "POST" });
    router.push("/");
  }

  if (!confirming) {
    return (
      <button className="btn btn-ghost" style={{ color: "#b3261e", borderColor: "#b3261e" }} onClick={() => setConfirming(true)}>
        Delete account &amp; data
      </button>
    );
  }

  return (
    <div className="step" style={{ borderColor: "#b3261e" }}>
      <p style={{ marginBottom: 14 }}>
        This permanently deletes your profile, photos, messages, and all other data. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" style={{ background: "#b3261e" }} onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Yes, delete everything"}
        </button>
        <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
      </div>
    </div>
  );
}
