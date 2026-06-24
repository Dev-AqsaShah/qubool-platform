import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { UnblockButton } from "@/components/app/UnblockButton";

export default async function SafetyCenterPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: blocks }, { data: reports }] = await Promise.all([
    supabase.from("blocks").select("*").eq("blocker_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reports").select("*").eq("reporter_id", user.id).order("created_at", { ascending: false }),
  ]);

  const blockedIds = (blocks ?? []).map((b) => b.blocked_id);
  const { data: profiles } = blockedIds.length
    ? await supabase.from("profiles").select("user_id, display_name").in("user_id", blockedIds)
    : { data: [] };
  const nameMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));

  return (
    <div>
      <div className="wrap"><AppNav active="/safety" /></div>
      <div className="wrap" style={{ paddingBottom: 80, maxWidth: 640 }}>
        <h1 style={{ marginBottom: 8 }}>Safety center</h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          Manage who you&apos;ve blocked, review your report history, and control your privacy. Photo privacy lives on{" "}
          <Link href="/me">My profile</Link>.
        </p>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Blocked users</h3>
          {(blocks ?? []).length === 0 && <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>You haven&apos;t blocked anyone.</p>}
          <div style={{ display: "grid", gap: 10 }}>
            {(blocks ?? []).map((b) => (
              <div key={b.id} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{nameMap.get(b.blocked_id) ?? "Member"}</span>
                <UnblockButton blockedId={b.blocked_id} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Report history</h3>
          {(reports ?? []).length === 0 && <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>No reports filed.</p>}
          <div style={{ display: "grid", gap: 10 }}>
            {(reports ?? []).map((r) => (
              <div key={r.id} className="step">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{r.reason}</strong>
                  <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>{r.status}</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 4 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
