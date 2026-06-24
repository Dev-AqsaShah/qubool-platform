"use client";

import { useState } from "react";
import type { PhotoPrivacyMode } from "@/types/database";

export function PhotoPrivacyToggle({ initial }: { initial: PhotoPrivacyMode }) {
  const [mode, setMode] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function update(value: PhotoPrivacyMode) {
    setMode(value);
    setSaving(true);
    await fetch("/api/photos/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privacy_mode: value }),
    });
    setSaving(false);
  }

  return (
    <div className="field">
      <label>Photo privacy</label>
      <select value={mode} onChange={(e) => update(e.target.value as PhotoPrivacyMode)} disabled={saving}>
        <option value="request">Request to view — I approve each viewer</option>
        <option value="match">Auto-reveal on mutual match</option>
      </select>
    </div>
  );
}
