import Link from "next/link";
import { FadeUp } from "@/components/FadeUp";
import { SUBSCRIPTION_PRICE_PKR, SUBSCRIPTION_PRICE_USD, TRIAL_DAYS } from "@/lib/pricing";

export function Pricing() {
  return (
    <section id="pricing" className="qb-section">
      <div className="wrap">
        <FadeUp className="sec-head center" as="div">
          <span className="eyebrow">Membership</span>
          <h2>Try it free. Then one simple plan.</h2>
        </FadeUp>
        <FadeUp className="price-card">
          <span className="trial">{TRIAL_DAYS} days free — full access</span>
          <div className="amt">
            ${SUBSCRIPTION_PRICE_USD}
            <small> / month</small>
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".92rem" }}>
            ≈ PKR {SUBSCRIPTION_PRICE_PKR.toLocaleString()} / month for Pakistani members.
            During your free trial you get match suggestions and can chat — no limits.
          </p>
          <ul>
            <li>Unlimited match suggestions</li>
            <li>Chat with mutual matches</li>
            <li>Photo privacy &amp; &quot;request to view&quot;</li>
            <li>Wali / guardian mode</li>
            <li>Verified badge &amp; full safety tools</li>
          </ul>
          <Link href="/sign-up" className="btn btn-primary">
            Start {TRIAL_DAYS}-day free trial
          </Link>
          <div className="pay">Pay with Easypaisa &amp; JazzCash (Pakistan) · Payoneer (international)</div>
        </FadeUp>
      </div>
    </section>
  );
}
