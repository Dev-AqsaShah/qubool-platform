import { createServiceRoleClient } from "@/lib/supabase/server";
import { ModerationActions } from "@/components/admin/ModerationActions";

export default async function AdminModerationPage() {
  const service = createServiceRoleClient();
  const { data: items } = await service
    .from("moderation_queue")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Moderation queue</h1>
      {(items ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>Nothing flagged right now.</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {(items ?? []).map((item) => (
          <div key={item.id} className="step">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>{item.source_type}</strong>
              <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>{item.severity} severity</span>
            </div>
            <p style={{ color: "var(--muted)", marginBottom: 12 }}>{item.reason}</p>
            <ModerationActions id={item.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
