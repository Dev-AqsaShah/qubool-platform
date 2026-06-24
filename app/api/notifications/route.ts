import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: notifications } = await auth
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ notifications: notifications ?? [] });
}

const markReadSchema = z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() });

export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = markReadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let query = auth.from("notifications").update({ read: true }).eq("user_id", user.id);
  if (parsed.data.id) query = query.eq("id", parsed.data.id);
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
