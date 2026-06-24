import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { canViewPhoto, createSignedPhotoUrl } from "@/lib/photos/signedUrl";

export async function GET(_request: Request, { params }: { params: Promise<{ ownerId: string }> }) {
  const { ownerId } = await params;
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const service = createServiceRoleClient();
  const { data: photo } = await service
    .from("photos")
    .select("storage_path, privacy_mode")
    .eq("user_id", ownerId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ hasPhoto: false, url: null });
  }

  const canView = await canViewPhoto(ownerId, user.id);
  if (!canView) {
    const { data: access } = await service
      .from("photo_access")
      .select("status")
      .eq("owner_id", ownerId)
      .eq("viewer_id", user.id)
      .maybeSingle();
    return NextResponse.json({ hasPhoto: true, url: null, privacyMode: photo.privacy_mode, accessStatus: access?.status ?? null });
  }

  const url = await createSignedPhotoUrl(photo.storage_path);
  return NextResponse.json({ hasPhoto: true, url, privacyMode: photo.privacy_mode, accessStatus: "approved" });
}
