import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "selfie-verifications";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "Forbidden" }, { status: admin.status });

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const service = createServiceRoleClient();
  const { data: files } = await service.storage.from(BUCKET).list(userId, { sortBy: { column: "created_at", order: "desc" } });
  const latest = files?.[0];
  if (!latest) return NextResponse.json({ url: null });

  const { data } = await service.storage.from(BUCKET).createSignedUrl(`${userId}/${latest.name}`, 300);
  return NextResponse.json({ url: data?.signedUrl ?? null });
}
