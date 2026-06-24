import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

const bodySchema = z.object({ user_id: z.string().uuid(), action: z.enum(["approve", "reject"]) });

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: admin.status });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { user_id, action } = parsed.data;

  const service = createServiceRoleClient();
  const { error } = await service
    .from("users")
    .update({
      selfie_verification_status: action === "approve" ? "approved" : "rejected",
      selfie_verified: action === "approve",
    })
    .eq("id", user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notify(user_id, "moderation_outcome", { verification: action });

  return NextResponse.json({ ok: true });
}
