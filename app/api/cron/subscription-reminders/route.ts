import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

// Daily cron: renewal reminder a few days before premium_until expires
// (Section 11). Manual renewal model (Section 9) — no auto-charge, just a
// nudge to come back and pay again.
const REMINDER_WINDOW_DAYS = 3;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceRoleClient();
  const now = Date.now();
  const windowMs = REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  const { data: users } = await service
    .from("users")
    .select("id, premium_until")
    .not("premium_until", "is", null);

  let reminded = 0;
  for (const u of users ?? []) {
    const premiumUntil = new Date(u.premium_until!).getTime();
    if (premiumUntil <= now || premiumUntil - now > windowMs) continue;

    const { data: recent } = await service
      .from("notifications")
      .select("id")
      .eq("user_id", u.id)
      .eq("type", "subscription_renewal_reminder")
      .gte("created_at", new Date(now - dayMs).toISOString())
      .maybeSingle();
    if (recent) continue;

    await notify(u.id, "subscription_renewal_reminder");
    reminded += 1;
  }

  return NextResponse.json({ reminded });
}
