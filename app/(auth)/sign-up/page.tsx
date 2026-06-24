"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [mode, setMode] = useState<"pakistan" | "international">("pakistan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/verify-phone` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/auth/complete-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender, mode }),
    });

    router.push("/verify-phone");
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/verify-phone` },
    });
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your 3-day free trial — marriage-minded, verified, private."
      footer={
        <>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="hint">At least 8 characters.</span>
        </div>
        <div className="field">
          <label htmlFor="gender">I am</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
            <option value="female">A woman</option>
            <option value="male">A man</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="mode">I&apos;m looking for a match in</label>
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as "pakistan" | "international")}>
            <option value="pakistan">Pakistan · Rishta mode</option>
            <option value="international">International mode</option>
          </select>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Creating account…" : "Start free trial"}
        </button>
      </form>
      <div className="divider-row">or</div>
      <button type="button" onClick={handleGoogle} className="btn btn-ghost" style={{ width: "100%" }}>
        Continue with Google
      </button>
    </AuthCard>
  );
}
