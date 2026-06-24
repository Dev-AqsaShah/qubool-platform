import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  target_id: z.string().uuid(),
  reason: z.string().min(1).max(200),
  details: z.string().max(2000).optional(),
});

// Reports route to the admin moderation queue (Section 6.8 / 10).
export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const service = createServiceRoleClient();
  const { data: report, error } = await service
    .from("reports")
    .insert({ reporter_id: user.id, ...parsed.data })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("moderation_queue").insert({
    source_type: "report",
    source_id: report.id,
    user_id: parsed.data.target_id,
    reason: parsed.data.reason,
    severity: "medium",
    status: "open",
  });

  return NextResponse.json({ ok: true });
}
