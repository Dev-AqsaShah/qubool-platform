import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({
  to_user: z.string().uuid(),
  status: z.enum(["interested", "passed"]),
});

// Expressing interest (or passing) on a suggestion. Mutual "interested" rows
// create a match — enforced here server-side, not left to the client.
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
  const { to_user, status } = parsed.data;
  if (to_user === user.id) {
    return NextResponse.json({ error: "Cannot express interest in yourself" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error: upsertError } = await service
    .from("interests")
    .upsert({ from_user: user.id, to_user, status }, { onConflict: "from_user,to_user" });
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  if (status !== "interested") {
    return NextResponse.json({ match: false });
  }

  const { data: reciprocal } = await service
    .from("interests")
    .select("id")
    .eq("from_user", to_user)
    .eq("to_user", user.id)
    .eq("status", "interested")
    .maybeSingle();

  if (!reciprocal) {
    await notify(to_user, "interest_received", { from_user: user.id });
    return NextResponse.json({ match: false });
  }

  const { data: viewer } = await service.from("users").select("gender").eq("id", user.id).single();
  const womanId = viewer?.gender === "female" ? user.id : to_user;
  const [userA, userB] = [user.id, to_user].sort();

  const { data: match, error: matchError } = await service
    .from("matches")
    .upsert(
      { user_a: userA, user_b: userB, woman_id: womanId },
      { onConflict: "user_a,user_b" }
    )
    .select()
    .single();
  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  await Promise.all([
    notify(user.id, "new_match", { match_id: match.id, other_user_id: to_user }),
    notify(to_user, "new_match", { match_id: match.id, other_user_id: user.id }),
  ]);

  return NextResponse.json({ match: true, match_id: match.id });
}
