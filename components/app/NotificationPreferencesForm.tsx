"use client";

import { useEffect, useState } from "react";

const NOTIFICATION_TYPES = [
  { type: "new_match", label: "New match" },
  { type: "new_message", label: "New message" },
  { type: "interest_received", label: "Someone interested in you" },
  { type: "photo_request_received", label: "Photo requests" },
  { type: "trial_ending_soon", label: "Trial / subscription reminders" },
];

export function NotificationPreferencesForm() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [muted, setMuted] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => res.json())
      .then((body) => {
        setEmailEnabled(body.preferences.email_enabled);
        setMuted(body.preferences.types_muted);
      });
  }, []);

  async function save(next: { email_enabled: boolean; types_muted: string[] }) {
    setSaving(true);
    await fetch("/api/notifications/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
  }

  function toggleMute(type: string) {
    const next = muted.includes(type) ? muted.filter((t) => t !== type) : [...muted, type];
    setMuted(next);
    save({ email_enabled: emailEnabled, types_muted: next });
  }

  function toggleEmail() {
    const next = !emailEnabled;
    setEmailEnabled(next);
    save({ email_enabled: next, types_muted: muted });
  }

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <input type="checkbox" checked={emailEnabled} onChange={toggleEmail} disabled={saving} />
        Email notifications
      </label>
      <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 10 }}>Mute specific types:</p>
      <div style={{ display: "grid", gap: 8 }}>
        {NOTIFICATION_TYPES.map((t) => (
          <label key={t.type} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".9rem" }}>
            <input type="checkbox" checked={muted.includes(t.type)} onChange={() => toggleMute(t.type)} disabled={saving || !emailEnabled} />
            Mute &quot;{t.label}&quot;
          </label>
        ))}
      </div>
    </div>
  );
}
