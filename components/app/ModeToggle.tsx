"use client";

import { useState } from "react";
import type { Mode } from "@/types/database";

export function ModeToggle({ initial }: { initial: Mode }) {
  const [mode, setMode] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function update(value: Mode) {
    setMode(value);
    setSaving(true);
    await fetch("/api/account/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: value }),
    });
    setSaving(false);
  }

  return (
    <div className="field">
      <label htmlFor="mode">Mode</label>
      <select id="mode" value={mode} onChange={(e) => update(e.target.value as Mode)} disabled={saving}>
        <option value="pakistan">Pakistan · Rishta mode</option>
        <option value="international">International mode</option>
      </select>
    </div>
  );
}
