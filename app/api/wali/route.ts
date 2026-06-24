import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

const inviteSchema = z.object({
  wali_contact: z.string().min(3),
  access_level: z.enum(["full", "summary"]),
});

// Invite a trusted family member by email/phone (Section 6.6). They get
// read access to this user's match chats once they accept — see
// app/api/wali/respond for the acceptance flow and the messages_parties_select
// RLS policy in db/migrations/0001_init.sql for the actual read grant.
export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = inviteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const service = createServiceRoleClient();
  const { data: wali, error } = await service
    .from("walis")
    .insert({ user_id: user.id, ...parsed.data, status: "invited" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // The invited contact may not have a Qubool account yet, so this can't
  // route through notify() (which needs a user id) — email them directly
  // when the contact looks like an email address.
  if (parsed.data.wali_contact.includes("@")) {
    await sendEmail(
      parsed.data.wali_contact,
      "You've been invited as a wali on Qubool",
      "<p>Someone has invited you to be their wali (guardian) on Qubool, with read access to their match chats. Sign in or create an account with this email to accept.</p>"
    );
  }

  return NextResponse.json({ wali });
}

export async function GET() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: myWalis } = await auth.from("walis").select("*").eq("user_id", user.id);

  const service = createServiceRoleClient();
  const { data: authUser } = await service.auth.admin.getUserById(user.id).catch(() => ({ data: null }));
  const contacts = [authUser?.user?.email, authUser?.user?.phone].filter(Boolean) as string[];
  const { data: invitedAsWali } = contacts.length
    ? await service.from("walis").select("*").in("wali_contact", contacts).eq("status", "invited")
    : { data: [] };

  return NextResponse.json({ myWalis: myWalis ?? [], invitedAsWali: invitedAsWali ?? [] });
}
