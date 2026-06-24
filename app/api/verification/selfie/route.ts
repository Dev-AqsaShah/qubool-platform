import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

// Selfie verification (Section 6.7): manual admin review to start.
// Uploads to a private bucket and flips the user to "pending" for the
// admin moderation queue to pick up.
export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("selfie");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing selfie file" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await service.storage
    .from("selfie-verifications")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await service
    .from("users")
    .update({ selfie_verification_status: "pending" })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
