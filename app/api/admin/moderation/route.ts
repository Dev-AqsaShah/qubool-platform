import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "remove", "warn", "ban"]),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: admin.status });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, action } = parsed.data;

  const service = createServiceRoleClient();
  const { data: item } = await service.from("moderation_queue").select("*").eq("id", id).maybeSingle();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const statusByAction = { approve: "approved", remove: "removed", warn: "warned", ban: "banned" } as const;

  await service
    .from("moderation_queue")
    .update({ status: statusByAction[action], reviewed_at: new Date().toISOString(), reviewed_by: admin.user.id })
    .eq("id", id);

  if (action === "remove" && item.source_type === "message" && item.source_id) {
    await service.from("messages").update({ moderation_status: "removed" }).eq("id", item.source_id);
  }

  if (item.user_id && (action === "warn" || action === "ban" || action === "remove")) {
    if (action === "ban") {
      await service.from("users").update({ status: "banned" }).eq("id", item.user_id);
    }
    await notify(item.user_id, "moderation_outcome", { action });
  }

  return NextResponse.json({ ok: true });
}
