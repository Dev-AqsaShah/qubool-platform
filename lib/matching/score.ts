import type { PreferenceRow, ProfileRow, UserRow } from "@/types/database";

export interface Candidate {
  user: UserRow;
  profile: ProfileRow;
  preferences: PreferenceRow[];
}

export interface MatchScoreResult {
  passesHardFilters: boolean;
  score: number;
  failedDealbreakers: string[];
  matchedSoftPreferences: string[];
}

function ageFromDob(dob: string) {
  const diffMs = Date.now() - new Date(dob).getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

function preferenceMap(preferences: PreferenceRow[]) {
  const map = new Map<string, PreferenceRow>();
  for (const p of preferences) map.set(p.field, p);
  return map;
}

// Evaluates whether `candidate` satisfies `viewer`'s stated preferences.
// Two-way matching (Section 6.3) means this must be run in both directions
// before a pair is ever suggested or allowed to match.
export function scoreAgainstPreferences(viewerPrefs: PreferenceRow[], candidate: Candidate): MatchScoreResult {
  const prefs = preferenceMap(viewerPrefs);
  const failedDealbreakers: string[] = [];
  const matchedSoftPreferences: string[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  const ageMin = prefs.get("age_min");
  const ageMax = prefs.get("age_max");
  if (ageMin || ageMax) {
    const candidateAge = ageFromDob(candidate.profile.dob);
    const min = ageMin ? Number(ageMin.value) : 0;
    const max = ageMax ? Number(ageMax.value) : 200;
    const inRange = candidateAge >= min && candidateAge <= max;
    const isDealbreaker = Boolean(ageMin?.is_dealbreaker || ageMax?.is_dealbreaker);
    const weight = Math.max(ageMin?.weight ?? 0, ageMax?.weight ?? 0) || 50;
    if (!inRange && isDealbreaker) failedDealbreakers.push("age_range");
    totalWeight += weight;
    if (inRange) {
      earnedWeight += weight;
      matchedSoftPreferences.push("age_range");
    }
  }

  const candidateValues: Record<string, string | null> = {
    religion: candidate.profile.religion,
    sect: candidate.profile.sect,
    marital_status: candidate.profile.marital_status,
    wants_children: candidate.profile.wants_children,
    relocate: candidate.profile.relocate,
    education: candidate.profile.education,
    smoking: candidate.profile.smoking,
  };

  for (const [field, pref] of prefs) {
    if (field === "age_min" || field === "age_max") continue;
    const candidateValue = candidateValues[field];
    const matches = candidateValue != null && candidateValue.toLowerCase() === pref.value.toLowerCase();

    totalWeight += pref.weight;
    if (matches) {
      earnedWeight += pref.weight;
      matchedSoftPreferences.push(field);
    } else if (pref.is_dealbreaker) {
      failedDealbreakers.push(field);
    }
  }

  const score = totalWeight === 0 ? 70 : Math.round((earnedWeight / totalWeight) * 100);

  return {
    passesHardFilters: failedDealbreakers.length === 0,
    score,
    failedDealbreakers,
    matchedSoftPreferences,
  };
}

// Two-way: a pair is only a valid suggestion/match if both directions pass
// hard filters and we report a single blended score for display.
export function scorePair(a: Candidate, b: Candidate) {
  const aToB = scoreAgainstPreferences(a.preferences, b);
  const bToA = scoreAgainstPreferences(b.preferences, a);

  const eligible =
    aToB.passesHardFilters &&
    bToA.passesHardFilters &&
    a.user.mode === b.user.mode &&
    a.user.gender !== b.user.gender;

  return {
    eligible,
    score: Math.round((aToB.score + bToA.score) / 2),
    aToB,
    bToA,
  };
}
