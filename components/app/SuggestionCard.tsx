"use client";

import { useState } from "react";
import Link from "next/link";
import { PhotoCard } from "@/components/PhotoCard";

export function SuggestionCard({
  userId,
  score,
  reason,
  name,
  age,
  city,
  country,
  tags,
  verified,
}: {
  userId: string;
  score: number;
  reason: string | null;
  name: string;
  age: number;
  city: string | null;
  country: string | null;
  tags: string[];
  verified: boolean;
}) {
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

  return (
    <div className="fcard" style={{ padding: 0, overflow: "hidden" }}>
      <PhotoCard ownerId={userId} verified={verified} />
      <div style={{ padding: 20 }}>
        <Link href={`/profile/${userId}`} className="pname" style={{ display: "block", textDecoration: "none" }}>
          {name}, {age}
        </Link>
        <div className="ploc">{[city, country].filter(Boolean).join(" · ")}</div>
        <div className="match" style={{ margin: "10px 0" }}>
          <span>Match</span>
          <span className="bar"><i style={{ width: `${score}%` }} /></span>
          <span>{score}%</span>
        </div>
        {reason && <p style={{ fontSize: ".88rem", color: "var(--muted)", marginBottom: 10 }}>{reason}</p>}
        <div className="tags" style={{ marginBottom: 14 }}>
          {tags.map((t) => <span key={t}>{t}</span>)}
        </div>
        {matched ? (
          <p className="form-success">It&apos;s a match! Head to your matches to say hello.</p>
        ) : responded ? (
          <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>
            {responded === "interested" ? "Interest sent." : "Passed."}
          </p>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => respond("interested")}>
              Interested
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => respond("passed")}>
              Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
