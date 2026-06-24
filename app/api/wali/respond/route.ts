import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({ wali_id: z.string().uuid(), action: z.enum(["accept", "decline"]) });

export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const service = createServiceRoleClient();
  const { data: wali } = await service.from("walis").select("*").eq("id", parsed.data.wali_id).maybeSingle();
  if (!wali || wali.status !== "invited") {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const { error } = await service
    .from("walis")
    .update({
      status: parsed.data.action === "accept" ? "accepted" : "declined",
      invited_user_id: user.id,
    })
    .eq("id", wali.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.action === "accept") {
    await notify(wali.user_id, "wali_invite_accepted", { wali_id: wali.id });
  }

  return NextResponse.json({ ok: true });
}
