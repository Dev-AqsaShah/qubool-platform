import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const otherIds = (matches ?? []).map((m) => (m.user_a === user.id ? m.user_b : m.user_a));
  const { data: profiles } = otherIds.length
    ? await supabase.from("profiles").select("user_id, display_name, city, country").in("user_id", otherIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (
    <div>
      <div className="wrap"><AppNav active="/matches" /></div>
      <div className="wrap" style={{ paddingBottom: 80 }}>
        <h1 style={{ marginBottom: 20 }}>Matches</h1>
        {(matches ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No matches yet — keep exploring Discover.</p>}
        <div style={{ display: "grid", gap: 12 }}>
          {(matches ?? []).map((m) => {
            const otherId = m.user_a === user.id ? m.user_b : m.user_a;
            const p = profileMap.get(otherId);
            const isWomanWaiting = m.woman_id !== user.id && !m.first_message_sent;
            return (
              <Link key={m.id} href={`/matches/${m.id}`} className="step" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}>
                <div>
                  <strong style={{ color: "var(--henna-deep)" }}>{p?.display_name ?? "Member"}</strong>
                  <div className="ploc">{[p?.city, p?.country].filter(Boolean).join(" · ")}</div>
                </div>
                {isWomanWaiting && <span className="eyebrow">Waiting for her first message</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
