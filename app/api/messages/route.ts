import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { moderateText } from "@/lib/ai/anthropic";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({
  match_id: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

// Chat is match-only and women-initiated (Section 6.4/6.5), enforced here
// server-side rather than trusting the client UI to hide the input box.
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
  const { match_id, content } = parsed.data;

  const service = createServiceRoleClient();
  const { data: match } = await service.from("matches").select("*").eq("id", match_id).maybeSingle();
  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: blocked } = await service
    .from("blocks")
    .select("id")
    .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${user.id})`)
    .maybeSingle();
  if (blocked) {
    return NextResponse.json({ error: "You can't message this user" }, { status: 403 });
  }

  if (!match.first_message_sent && match.woman_id !== user.id) {
    return NextResponse.json(
      { error: "She sends the first message in every match — you'll be notified when she does." },
      { status: 403 }
    );
  }

  const moderation = await moderateText(content);
  const moderationStatus = !moderation.flagged ? "clean" : moderation.severity === "high" ? "held" : "pending";

  const { data: message, error } = await service
    .from("messages")
    .insert({ match_id, sender_id: user.id, content, moderation_status: moderationStatus })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (moderation.flagged) {
    await service.from("moderation_queue").insert({
      source_type: "message",
      source_id: message.id,
      user_id: user.id,
      reason: moderation.reason,
      severity: moderation.severity,
      status: "open",
    });
  }

  if (!match.first_message_sent && match.woman_id === user.id) {
    await service.from("matches").update({ first_message_sent: true }).eq("id", match_id);
  }

  if (moderationStatus !== "held") {
    await notify(otherId, "new_message", { match_id });
  }

  return NextResponse.json({ message, held: moderationStatus === "held" });
}
