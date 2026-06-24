import { createServiceRoleClient } from "@/lib/supabase/server";
import { UserStatusControls } from "@/components/admin/UserStatusControls";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const service = createServiceRoleClient();

  let query = service.from("users").select("*").order("created_at", { ascending: false }).limit(50);
  if (q) query = query.ilike("email", `%${q}%`);
  const { data: users } = await query;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Users</h1>
      <form style={{ marginBottom: 20 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email…"
          style={{ padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--line)", width: 280 }}
        />
      </form>
      <div style={{ display: "grid", gap: 10 }}>
        {(users ?? []).map((u) => (
          <div key={u.id} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{u.email}</strong>
              <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                {u.mode} · {u.role} · {u.status} · {u.selfie_verification_status}
              </div>
            </div>
            <UserStatusControls userId={u.id} status={u.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
