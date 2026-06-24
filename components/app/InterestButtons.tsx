"use client";

import { useState } from "react";

export function InterestButtons({ userId }: { userId: string }) {
  const [responded, setResponded] = useState<"interested" | "passed" | null>(null);
  const [matched, setMatched] = useState(false);

  async function respond(status: "interested" | "passed") {
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: userId, status }),
    });
    if (res.ok) {
      const body = await res.json();
      setResponded(status);
      if (body.match) setMatched(true);
    }
  }

  if (matched) return <p className="form-success">It&apos;s a match! Head to your matches to say hello.</p>;
  if (responded) {
    return <p style={{ color: "var(--muted)" }}>{responded === "interested" ? "Interest sent." : "Passed."}</p>;
  }

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button className="btn btn-primary" onClick={() => respond("interested")}>I&apos;m interested</button>
      <button className="btn btn-ghost" onClick={() => respond("passed")}>Pass</button>
    </div>
  );
}
