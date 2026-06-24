import { createServerSupabaseClient } from "@/lib/supabase/server";

// Server-side admin gate. Used by both /admin pages and /api/admin/* routes
// — the admin role check must happen here, not just by hiding nav links.
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401 as const };

  const { data: appUser } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (appUser?.role !== "admin") return { ok: false as const, status: 403 as const };

  return { ok: true as const, user, supabase };
}
