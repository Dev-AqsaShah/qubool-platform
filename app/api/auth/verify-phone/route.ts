import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

// Marks phone_verified once Supabase Auth has confirmed the OTP client-side.
// Trusts auth.getUser() rather than the client body — phone confirmation
// state lives on the authenticated session, not on anything the client sends.
export async function POST() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user || !user.phone) {
    return NextResponse.json({ error: "Phone not verified" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service
    .from("users")
    .update({ phone: user.phone, phone_verified: true })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
