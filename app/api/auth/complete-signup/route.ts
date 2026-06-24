import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { TRIAL_DAYS } from "@/lib/pricing";

const bodySchema = z.object({
  gender: z.enum(["male", "female"]),
  mode: z.enum(["pakistan", "international"]),
});

// Called immediately after a client-side supabase.auth.signUp() succeeds.
// Inserts the public.users row server-side (service role) so trial_ends_at
// and role/status defaults are set consistently, instead of trusting the
// client to write its own row.
export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await service.from("users").upsert({
    id: user.id,
    email: user.email,
    gender: parsed.data.gender,
    mode: parsed.data.mode,
    trial_ends_at: trialEndsAt,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
