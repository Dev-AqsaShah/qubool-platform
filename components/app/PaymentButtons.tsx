"use client";

import { useState } from "react";
import type { Mode } from "@/types/database";

const PAKISTAN_PROVIDERS = [
  { id: "jazzcash" as const, label: "Pay with JazzCash" },
  { id: "easypaisa" as const, label: "Pay with Easypaisa" },
];
const INTERNATIONAL_PROVIDERS = [{ id: "payoneer" as const, label: "Pay with Payoneer" }];

export function PaymentButtons({ mode }: { mode: Mode }) {
  const [loading, setLoading] = useState<string | null>(null);
  const providers = mode === "pakistan" ? PAKISTAN_PROVIDERS : INTERNATIONAL_PROVIDERS;

  async function pay(provider: string) {
    setLoading(provider);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    if (res.ok) {
      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl;
    } else {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {providers.map((p) => (
        <button
          key={p.id}
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={() => pay(p.id)}
          disabled={loading !== null}
        >
          {loading === p.id ? "Redirecting…" : p.label}
        </button>
      ))}
    </div>
  );
}
