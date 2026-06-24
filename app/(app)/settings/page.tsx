import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { ModeToggle } from "@/components/app/ModeToggle";
import { NotificationPreferencesForm } from "@/components/app/NotificationPreferencesForm";
import { DeleteAccountButton } from "@/components/app/DeleteAccountButton";
import { SignOutButton } from "@/components/app/SignOutButton";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: appUser } = await supabase.from("users").select("*").eq("id", user.id).single();

  return (
    <div>
      <div className="wrap"><AppNav active="/settings" /></div>
      <div className="wrap" style={{ paddingBottom: 80, maxWidth: 560 }}>
        <h1 style={{ marginBottom: 28 }}>Settings</h1>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Account</h3>
          <p style={{ color: "var(--muted)", marginBottom: 14 }}>{user.email}</p>
          <ModeToggle initial={appUser?.mode ?? "pakistan"} />
          <SignOutButton />
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Notifications</h3>
          <NotificationPreferencesForm />
        </div>

        <div>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Danger zone</h3>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
