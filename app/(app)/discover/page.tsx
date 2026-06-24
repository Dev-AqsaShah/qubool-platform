import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { SuggestionCard } from "@/components/app/SuggestionCard";

function ageFromDob(dob: string) {
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function DiscoverPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const today = new Date().toISOString().slice(0, 10);
  const { data: suggestions } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("score", { ascending: false });

  const suggestedIds = (suggestions ?? []).map((s) => s.suggested_user_id);

  const [{ data: profiles }, { data: users }] = await Promise.all([
    suggestedIds.length
      ? supabase.from("profiles").select("*").in("user_id", suggestedIds)
      : Promise.resolve({ data: [] }),
    suggestedIds.length
      ? supabase.from("users").select("id, selfie_verified").in("id", suggestedIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  const verifiedMap = new Map((users ?? []).map((u) => [u.id, u.selfie_verified]));

  const cards = (suggestions ?? [])
    .map((s) => {
      const profile = profileMap.get(s.suggested_user_id);
      if (!profile) return null;
      return {
        suggestionId: s.id,
        userId: s.suggested_user_id,
        score: s.score,
        reason: s.reason,
        name: profile.display_name,
        age: ageFromDob(profile.dob),
        city: profile.city,
        country: profile.country,
        tags: [profile.practice_level, profile.profession, profile.marital_status].filter(Boolean) as string[],
        verified: Boolean(verifiedMap.get(s.suggested_user_id)),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div>
      <div className="wrap">
        <AppNav active="/discover" />
      </div>
      <div className="wrap" style={{ paddingBottom: 80 }}>
        <h1 style={{ marginBottom: 6 }}>Today&apos;s suggestions</h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          Curated for you on values and dealbreakers — quality over endless swiping.
        </p>
        {cards.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            No new suggestions today. Check back tomorrow, or make sure your profile and preferences are complete.
          </p>
        ) : (
          <div className="feat">
            {cards.map((card) => (
              <SuggestionCard key={card.suggestionId} {...card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
