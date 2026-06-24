import { createServiceRoleClient } from "@/lib/supabase/server";
import { ReportStatusControls } from "@/components/admin/ReportStatusControls";

export default async function AdminReportsPage() {
  const service = createServiceRoleClient();
  const [{ data: reports }, { data: blocks }] = await Promise.all([
    service.from("reports").select("*").order("created_at", { ascending: false }).limit(50),
    service.from("blocks").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const userIds = [
    ...(reports ?? []).flatMap((r) => [r.reporter_id, r.target_id]),
    ...(blocks ?? []).flatMap((b) => [b.blocker_id, b.blocked_id]),
  ];
  const { data: profiles } = userIds.length
    ? await service.from("profiles").select("user_id, display_name").in("user_id", userIds)
    : { data: [] };
  const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Reports &amp; blocks</h1>

      <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Reports</h3>
      <div style={{ display: "grid", gap: 10, marginBottom: 32 }}>
        {(reports ?? []).map((r) => (
          <div key={r.id} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{nameMap.get(r.reporter_id) ?? "Member"}</strong> reported{" "}
              <strong>{nameMap.get(r.target_id) ?? "Member"}</strong>
              <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{r.reason} — {r.details}</div>
            </div>
            <ReportStatusControls id={r.id} status={r.status} />
          </div>
        ))}
        {(reports ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No reports.</p>}
      </div>

      <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Blocks</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {(blocks ?? []).map((b) => (
          <div key={b.id} className="step">
            <strong>{nameMap.get(b.blocker_id) ?? "Member"}</strong> blocked{" "}
            <strong>{nameMap.get(b.blocked_id) ?? "Member"}</strong>
          </div>
        ))}
        {(blocks ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No blocks.</p>}
      </div>
    </div>
  );
}
