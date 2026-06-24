import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  owner_id: z.string().uuid(),
  viewer_id: z.string().uuid().optional(),
  action: z.enum(["request", "approve", "decline", "revoke"]),
});

// Photo "request to view" flow (Section 6.2): a viewer requests, the owner
// approves/declines per person, and can revoke previously-approved access
// at any time — which immediately invalidates future signed URLs since
// canViewPhoto() re-checks photo_access.status on every request.
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
  const { owner_id, viewer_id, action } = parsed.data;
  const service = createServiceRoleClient();

  if (action === "request") {
    if (owner_id === user.id) {
      return NextResponse.json({ error: "Cannot request your own photo" }, { status: 400 });
    }
    const { error } = await service
      .from("photo_access")
      .upsert({ owner_id, viewer_id: user.id, status: "requested" }, { onConflict: "owner_id,viewer_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await service.from("notifications").insert({
      user_id: owner_id,
      type: "photo_request_received",
      payload: { viewer_id: user.id },
    });
    return NextResponse.json({ ok: true });
  }

  // approve / decline / revoke — only the photo owner may act, and only on
  // their own photo_access rows.
  if (!viewer_id) {
    return NextResponse.json({ error: "Missing viewer_id" }, { status: 400 });
  }
  if (owner_id !== user.id) {
    return NextResponse.json({ error: "Only the photo owner can do this" }, { status: 403 });
  }

  const status = action === "approve" ? "approved" : action === "decline" ? "declined" : "revoked";
  const { error } = await service
    .from("photo_access")
    .update({ status })
    .eq("owner_id", owner_id)
    .eq("viewer_id", viewer_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status === "approved") {
    await service.from("notifications").insert({
      user_id: viewer_id,
      type: "photo_request_approved",
      payload: { owner_id },
    });
  }

  return NextResponse.json({ ok: true });
}
