"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function VerificationReviewCard({ userId, email, name }: { userId: string; email: string | null; name: string }) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/verification/photo?userId=${userId}`)
      .then((res) => res.json())
      .then((body) => setPhotoUrl(body.url));
  }, [userId]);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    await fetch("/api/admin/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, action }),
    });
    router.refresh();
  }

  return (
    <div className="step" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="Selfie" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 12 }} />
      ) : (
        <div style={{ width: 100, height: 100, borderRadius: 12, background: "var(--sand)" }} />
      )}
      <div style={{ flex: 1 }}>
        <strong>{name}</strong>
        <div style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 10 }}>{email}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => act("approve")} disabled={loading !== null}>
            {loading === "approve" ? "…" : "Approve"}
          </button>
          <button className="btn btn-ghost" onClick={() => act("reject")} disabled={loading !== null}>
            {loading === "reject" ? "…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
