import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

// Daily cron: trial ending in ~1 day, and trial just ended (Section 11).
// Dedups by checking for an existing notification of the same type within
// the last 24h, since this can be re-run safely.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceRoleClient();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const { data: users } = await service
    .from("users")
    .select("id, trial_ends_at, premium_until")
    .not("trial_ends_at", "is", null);

  let endingSoon = 0;
  let ended = 0;

  for (const u of users ?? []) {
    if (u.premium_until && new Date(u.premium_until).getTime() > now) continue;
    const trialEndsAt = new Date(u.trial_ends_at!).getTime();
    const type = trialEndsAt > now && trialEndsAt - now < dayMs ? "trial_ending_soon" : trialEndsAt <= now && now - trialEndsAt < dayMs ? "trial_ended" : null;
    if (!type) continue;

    const { data: recent } = await service
      .from("notifications")
      .select("id")
      .eq("user_id", u.id)
      .eq("type", type)
      .gte("created_at", new Date(now - dayMs).toISOString())
      .maybeSingle();
    if (recent) continue;

    await notify(u.id, type);
    if (type === "trial_ending_soon") endingSoon += 1;
    else ended += 1;
  }

  return NextResponse.json({ endingSoon, ended });
}
