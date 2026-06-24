import type { UserRow } from "@/types/database";

export type AccessStatus = "trial" | "premium" | "expired";

// Full access while trial_ends_at OR premium_until is in the future
// (Section 8). Once both are past, the account downgrades gracefully —
// can still log in, but suggestions/chat are limited until they subscribe.
export function getAccessStatus(user: Pick<UserRow, "trial_ends_at" | "premium_until">): AccessStatus {
  const now = Date.now();
  if (user.premium_until && new Date(user.premium_until).getTime() > now) return "premium";
  if (user.trial_ends_at && new Date(user.trial_ends_at).getTime() > now) return "trial";
  return "expired";
}

export function hasFullAccess(user: Pick<UserRow, "trial_ends_at" | "premium_until">): boolean {
  return getAccessStatus(user) !== "expired";
}
