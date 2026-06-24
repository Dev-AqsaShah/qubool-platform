import { createServiceRoleClient } from "@/lib/supabase/server";

const PHOTOS_BUCKET = "profile-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 5;

export async function createSignedPhotoUrl(storagePath: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function uploadProfilePhoto(userId: string, file: File) {
  const service = createServiceRoleClient();
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await service.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error(error.message);
  return path;
}

// Can `viewerId` see `ownerId`'s photo right now? True if they're mutually
// matched, or the owner approved a standing request-to-view, or viewing own.
export async function canViewPhoto(ownerId: string, viewerId: string) {
  if (ownerId === viewerId) return true;
  const service = createServiceRoleClient();

  const { data: photo } = await service
    .from("photos")
    .select("privacy_mode")
    .eq("user_id", ownerId)
    .eq("is_primary", true)
    .maybeSingle();
  if (!photo) return false;

  if (photo.privacy_mode === "match") {
    const { data: match } = await service
      .from("matches")
      .select("id")
      .or(
        `and(user_a.eq.${ownerId},user_b.eq.${viewerId}),and(user_a.eq.${viewerId},user_b.eq.${ownerId})`
      )
      .maybeSingle();
    return !!match;
  }

  const { data: access } = await service
    .from("photo_access")
    .select("status")
    .eq("owner_id", ownerId)
    .eq("viewer_id", viewerId)
    .eq("status", "approved")
    .maybeSingle();
  return !!access;
}
