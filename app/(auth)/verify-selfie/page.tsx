"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifySelfiePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("selfie", file);
    const res = await fetch("/api/verification/selfie", { method: "POST", body: form });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <AuthCard
      title="Verify it's really you"
      subtitle="Take a clear selfie. Our team reviews it by hand — you'll get your Verified badge within a day."
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="selfie">Selfie photo</label>
          <input
            id="selfie"
            type="file"
            accept="image/*"
            capture="user"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="hint">Private — never shown on your profile, used for verification only.</span>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading || !file}>
          {loading ? "Uploading…" : "Submit for review"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={() => router.push("/onboarding")}
        >
          I&apos;ll do this later
        </button>
      </form>
    </AuthCard>
  );
}
