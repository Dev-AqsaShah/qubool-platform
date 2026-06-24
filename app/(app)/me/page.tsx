import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoPrivacyToggle } from "@/components/app/PhotoPrivacyToggle";
import { PhotoRequestsPanel } from "@/components/app/PhotoRequestsPanel";
import { WaliManager } from "@/components/app/WaliManager";

export default async function MyProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: appUser }, { data: photo }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("photos").select("*").eq("user_id", user.id).eq("is_primary", true).maybeSingle(),
  ]);

  return (
    <div>
      <div className="wrap"><AppNav active="/me" /></div>
      <div className="wrap" style={{ paddingBottom: 80, maxWidth: 720 }}>
        <h1 style={{ marginBottom: 6 }}>{profile?.display_name ?? "My profile"}</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          {appUser?.selfie_verification_status === "approved"
            ? "Verified"
            : appUser?.selfie_verification_status === "pending"
              ? "Verification pending review"
              : "Not verified yet"}
          {" · "}
          {appUser?.mode === "pakistan" ? "Pakistan · Rishta mode" : "International mode"}
        </p>

        <div style={{ maxWidth: 280, marginBottom: 28 }}>
          <PhotoCard ownerId={user.id} verified={Boolean(appUser?.selfie_verified)} />
        </div>

        {photo && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>Photo privacy</h3>
            <PhotoPrivacyToggle initial={photo.privacy_mode} />
            <PhotoRequestsPanel />
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>About</h3>
          <p style={{ color: "var(--muted)" }}>{profile?.about_text || "Not added yet."}</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 14 }}>Wali / Guardian</h2>
          <WaliManager />
        </div>
      </div>
    </div>
  );
}
