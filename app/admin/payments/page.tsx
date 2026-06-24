import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminPaymentsPage() {
  const service = createServiceRoleClient();
  const { data: payments } = await service
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = (payments ?? []).map((p) => p.user_id);
  const { data: users } = userIds.length
    ? await service.from("users").select("id, email").in("id", userIds)
    : { data: [] };
  const emailMap = new Map((users ?? []).map((u) => [u.id, u.email]));

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Payments</h1>
      <div style={{ display: "grid", gap: 8 }}>
        {(payments ?? []).map((p) => (
          <div key={p.id} className="step" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{emailMap.get(p.user_id) ?? p.user_id}</strong>
              <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>{p.provider} · {p.txn_id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{p.amount} {p.currency}</div>
              <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>{p.status} · {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {(payments ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No payments yet.</p>}
      </div>
    </div>
  );
}
