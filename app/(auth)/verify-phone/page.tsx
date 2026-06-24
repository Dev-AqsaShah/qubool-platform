"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setSent(true);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.updateUser({ phone });
    await fetch("/api/auth/verify-phone", { method: "POST" });
    router.push("/verify-selfie");
  }

  return (
    <AuthCard
      title="Verify your phone"
      subtitle="Phone verification is required before you can message or appear in suggestions."
    >
      {!sent ? (
        <form onSubmit={sendOtp}>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="+92 3xx xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="hint">We&apos;ll text you a 6-digit code.</span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <div className="field">
            <label htmlFor="otp">Enter the code</label>
            <input
              id="otp"
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => setSent(false)}
          >
            Use a different number
          </button>
        </form>
      )}
    </AuthCard>
  );
}
