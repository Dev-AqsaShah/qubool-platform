import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { PhotoCard } from "@/components/PhotoCard";
import { InterestButtons } from "@/components/app/InterestButtons";

function ageFromDob(dob: string) {
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: target }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("users").select("selfie_verified").eq("id", id).maybeSingle(),
  ]);

  if (!profile) {
    return (
      <div className="wrap">
        <AppNav />
        <p style={{ marginTop: 40, color: "var(--muted)" }}>This profile is no longer available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="wrap">
        <AppNav />
      </div>
      <div className="wrap demo-sec" style={{ paddingBottom: 80, alignItems: "start" }}>
        <div>
          <PhotoCard ownerId={id} verified={Boolean(target?.selfie_verified)} />
        </div>
        <div>
          <h1 style={{ marginBottom: 4 }}>{profile.display_name}, {ageFromDob(profile.dob)}</h1>
          <p className="ploc" style={{ marginBottom: 18 }}>
            {[profile.city, profile.country].filter(Boolean).join(" · ")}
            {profile.languages?.length ? ` · Speaks ${profile.languages.join(", ")}` : ""}
          </p>
          <div className="tags" style={{ marginBottom: 20 }}>
            {[profile.religion, profile.sect, profile.practice_level, profile.marital_status, profile.education, profile.profession]
              .filter(Boolean)
              .map((t) => <span key={t as string}>{t}</span>)}
          </div>
          {profile.about_text && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.1rem" }}>About</h3>
              <p style={{ color: "var(--muted)" }}>{profile.about_text}</p>
            </div>
          )}
          {profile.looking_for_text && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.1rem" }}>Looking for</h3>
              <p style={{ color: "var(--muted)" }}>{profile.looking_for_text}</p>
            </div>
          )}
          <InterestButtons userId={id} />
        </div>
      </div>
    </div>
  );
}
