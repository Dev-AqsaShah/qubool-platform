"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/types/database";

export function ChatWindow({
  matchId,
  currentUserId,
  canSendFirstMessage,
  otherName,
}: {
  matchId: string;
  currentUserId: string;
  canSendFirstMessage: boolean;
  otherName: string;
}) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as MessageRow])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: matchId, content }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not send message");
      setSending(false);
      return;
    }
    setContent("");
    setSending(false);
  }

  return (
    <div className="step" style={{ display: "flex", flexDirection: "column", height: "60vh", padding: 0, overflow: "hidden", position: "relative" }}>
      {/* Best-effort screenshot deterrence watermark (true prevention isn't possible on web) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.05,
          fontSize: "0.7rem",
          color: "var(--henna)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
          padding: 20,
          transform: "rotate(-20deg) scale(1.4)",
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i}>{currentUserId.slice(0, 8)}</span>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
            No messages yet. {canSendFirstMessage ? "Say hello." : `Waiting for ${otherName} to open the conversation.`}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          if (m.moderation_status === "held") return null;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: mine ? "var(--henna)" : "var(--sand)",
                  color: mine ? "#fff" : "var(--ink)",
                  fontSize: ".92rem",
                }}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid var(--line)", padding: 14, display: "flex", gap: 10 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={canSendFirstMessage ? "Type a message…" : `Waiting for ${otherName} to message first`}
          disabled={!canSendFirstMessage || sending}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--line)" }}
        />
        <button className="btn btn-primary" onClick={send} disabled={!canSendFirstMessage || sending}>
          Send
        </button>
      </div>
      {error && <p className="form-error" style={{ padding: "0 14px 10px" }}>{error}</p>}
    </div>
  );
}
