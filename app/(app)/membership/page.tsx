import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { getAccessStatus } from "@/lib/access";
import { SUBSCRIPTION_PRICE_PKR, SUBSCRIPTION_PRICE_USD } from "@/lib/pricing";
import { PaymentButtons } from "@/components/app/PaymentButtons";

export default async function MembershipPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: appUser } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!appUser) redirect("/sign-in");
  const status = getAccessStatus(appUser);

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="wrap"><AppNav active="/membership" /></div>
      <div className="wrap" style={{ paddingBottom: 80, maxWidth: 560 }}>
        <h1 style={{ marginBottom: 8 }}>Membership</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          {status === "trial" && `Free trial active until ${new Date(appUser.trial_ends_at!).toLocaleDateString()}.`}
          {status === "premium" && `Premium active until ${new Date(appUser.premium_until!).toLocaleDateString()}.`}
          {status === "expired" && "Your trial has ended. Subscribe to keep chatting and getting suggestions."}
        </p>

        <div className="price-card" style={{ maxWidth: "100%" }}>
          <div className="amt">
            ${SUBSCRIPTION_PRICE_USD}
            <small> / month</small>
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>≈ PKR {SUBSCRIPTION_PRICE_PKR.toLocaleString()} / month</p>
          <ul>
            <li>Unlimited match suggestions</li>
            <li>Chat with mutual matches</li>
            <li>Photo privacy &amp; &quot;request to view&quot;</li>
            <li>Wali / guardian mode</li>
          </ul>
          <PaymentButtons mode={appUser.mode} />
          <div className="pay">Manual monthly renewal — pay, get 30 days access, renew when reminded.</div>
        </div>

        {(payments ?? []).length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: 12 }}>Payment history</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {(payments ?? []).map((p) => (
                <div key={p.id} className="step" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{p.provider} · {p.amount} {p.currency}</span>
                  <span style={{ color: "var(--muted)" }}>{p.status} · {new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
