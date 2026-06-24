import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";

export default async function InterestsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: sent }, { data: received }] = await Promise.all([
    supabase.from("interests").select("*").eq("from_user", user.id).eq("status", "interested"),
    supabase.from("interests").select("*").eq("to_user", user.id).eq("status", "interested"),
  ]);

  const ids = [...(sent ?? []).map((i) => i.to_user), ...(received ?? []).map((i) => i.from_user)];
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("user_id, display_name, city, country").in("user_id", ids)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (
    <div>
      <div className="wrap"><AppNav active="/interests" /></div>
      <div className="wrap" style={{ paddingBottom: 80 }}>
        <h1>Interests</h1>
        <div className="demo-sec" style={{ alignItems: "start", marginTop: 24 }}>
          <div>
            <h3 style={{ marginBottom: 14 }}>You showed interest in</h3>
            {(sent ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>Nothing yet — browse Discover.</p>}
            <div style={{ display: "grid", gap: 12 }}>
              {(sent ?? []).map((i) => {
                const p = profileMap.get(i.to_user);
                if (!p) return null;
                return (
                  <Link key={i.id} href={`/profile/${i.to_user}`} className="step" style={{ display: "block", textDecoration: "none" }}>
                    <strong style={{ color: "var(--henna-deep)" }}>{p.display_name}</strong>
                    <div className="ploc">{[p.city, p.country].filter(Boolean).join(" · ")}</div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: 14 }}>Interested in you</h3>
            {(received ?? []).length === 0 && <p style={{ color: "var(--muted)" }}>No one yet.</p>}
            <div style={{ display: "grid", gap: 12 }}>
              {(received ?? []).map((i) => {
                const p = profileMap.get(i.from_user);
                if (!p) return null;
                return (
                  <Link key={i.id} href={`/profile/${i.from_user}`} className="step" style={{ display: "block", textDecoration: "none" }}>
                    <strong style={{ color: "var(--henna-deep)" }}>{p.display_name}</strong>
                    <div className="ploc">{[p.city, p.country].filter(Boolean).join(" · ")}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
