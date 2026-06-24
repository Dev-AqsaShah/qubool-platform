"use client";

import { useEffect, useState } from "react";
import type { NotificationRow } from "@/types/database";

const LABELS: Record<string, string> = {
  new_match: "You have a new match",
  new_message: "New message in a match",
  interest_received: "Someone is interested in you",
  photo_request_received: "Someone requested to see your photo",
  photo_request_approved: "Your photo request was approved",
  trial_ending_soon: "Your trial ends soon",
  trial_ended: "Your trial has ended",
  subscription_renewal_reminder: "Your subscription renews soon",
  payment_confirmed: "Payment confirmed",
  payment_failed: "Payment failed",
  wali_invite_accepted: "Your wali invite was accepted",
  moderation_outcome: "Moderation update on your account",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  async function refresh() {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifications((await res.json()).notifications);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    await refresh();
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-ghost"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) markAllRead();
        }}
        aria-label="Notifications"
      >
        🔔{unread > 0 ? ` ${unread}` : ""}
      </button>
      {open && (
        <div className="step" style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 320, maxHeight: 400, overflowY: "auto", zIndex: 10 }}>
          {notifications.length === 0 && <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: ".88rem" }}>
              <div>{LABELS[n.type] ?? n.type}</div>
              <div style={{ color: "var(--muted)", fontSize: ".76rem" }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
