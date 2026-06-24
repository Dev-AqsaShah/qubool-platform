import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const service = createServiceRoleClient();

  const [
    { count: signups },
    { count: verified },
    { count: activeSubscribers },
    { count: openReports },
    { count: resolvedReports },
    { count: openModeration },
  ] = await Promise.all([
    service.from("users").select("id", { count: "exact", head: true }),
    service.from("users").select("id", { count: "exact", head: true }).eq("selfie_verification_status", "approved"),
    service.from("users").select("id", { count: "exact", head: true }).gt("premium_until", new Date().toISOString()),
    service.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    service.from("reports").select("id", { count: "exact", head: true }).in("status", ["resolved", "dismissed"]),
    service.from("moderation_queue").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const stats = [
    { label: "Total signups", value: signups ?? 0 },
    { label: "Verified members", value: verified ?? 0 },
    { label: "Active subscribers", value: activeSubscribers ?? 0 },
    { label: "Open reports", value: openReports ?? 0 },
    { label: "Resolved reports", value: resolvedReports ?? 0 },
    { label: "Open moderation flags", value: openModeration ?? 0 },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Overview</h1>
      <div className="feat">
        {stats.map((s) => (
          <div key={s.label} className="fcard">
            <div className="amt" style={{ fontSize: "2.4rem" }}>{s.value}</div>
            <p style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
