import { createServiceRoleClient } from "@/lib/supabase/server";
import { explainMatch } from "@/lib/ai/anthropic";
import { scorePair, type Candidate } from "@/lib/matching/score";

const SUGGESTIONS_PER_USER = 5;

async function loadEligibleCandidates() {
  const service = createServiceRoleClient();

  const { data: users } = await service
    .from("users")
    .select("*")
    .eq("status", "active")
    .eq("phone_verified", true)
    .eq("onboarding_completed", true);
  if (!users) return [];

  const { data: profiles } = await service.from("profiles").select("*");
  const { data: preferences } = await service.from("preferences").select("*");
  if (!profiles) return [];

  const profileByUser = new Map(profiles.map((p) => [p.user_id, p]));
  const prefsByUser = new Map<string, typeof preferences>();
  for (const pref of preferences ?? []) {
    const list = prefsByUser.get(pref.user_id) ?? [];
    list.push(pref);
    prefsByUser.set(pref.user_id, list);
  }

  const candidates: Candidate[] = [];
  for (const user of users) {
    const profile = profileByUser.get(user.id);
    if (!profile) continue;
    candidates.push({ user, profile, preferences: prefsByUser.get(user.id) ?? [] });
  }
  return candidates;
}

async function alreadyConnected(service: ReturnType<typeof createServiceRoleClient>, userId: string, otherId: string) {
  const { data: interest } = await service
    .from("interests")
    .select("id")
    .or(`and(from_user.eq.${userId},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${userId})`)
    .maybeSingle();
  const { data: block } = await service
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`)
    .maybeSingle();
  return Boolean(interest || block);
}

// Generates today's curated suggestions for every eligible user (Section 6.3).
// Intended to run from a daily cron route; safe to re-run (upserts by date).
export async function generateDailySuggestions() {
  const service = createServiceRoleClient();
  const candidates = await loadEligibleCandidates();
  const today = new Date().toISOString().slice(0, 10);
  let totalInserted = 0;

  for (const viewer of candidates) {
    const ranked: { candidate: Candidate; score: number }[] = [];

    for (const other of candidates) {
      if (other.user.id === viewer.user.id) continue;
      const result = scorePair(viewer, other);
      if (!result.eligible) continue;
      if (await alreadyConnected(service, viewer.user.id, other.user.id)) continue;
      ranked.push({ candidate: other, score: result.score });
    }

    ranked.sort((a, b) => b.score - a.score);
    const top = ranked.slice(0, SUGGESTIONS_PER_USER);

    for (const { candidate, score } of top) {
      const sharedValues = [viewer.profile.religion, viewer.profile.education]
        .filter((v): v is string => Boolean(v));

      const { reason } = await explainMatch({
        aboutA: viewer.profile.about_text ?? "",
        lookingForA: viewer.profile.looking_for_text ?? "",
        aboutB: candidate.profile.about_text ?? "",
        lookingForB: candidate.profile.looking_for_text ?? "",
        sharedValues,
      });

      const { error } = await service.from("suggestions").upsert(
        {
          user_id: viewer.user.id,
          suggested_user_id: candidate.user.id,
          score,
          reason,
          date: today,
        },
        { onConflict: "user_id,suggested_user_id,date" }
      );
      if (!error) totalInserted += 1;
    }
  }

  return { usersProcessed: candidates.length, suggestionsWritten: totalInserted };
}
