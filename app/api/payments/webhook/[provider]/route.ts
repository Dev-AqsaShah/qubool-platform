import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPaymentAdapter, PREMIUM_EXTENSION_DAYS } from "@/lib/payments";
import { notify } from "@/lib/notifications";
import type { PaymentProvider } from "@/types/database";

const VALID_PROVIDERS: PaymentProvider[] = ["easypaisa", "jazzcash", "payoneer"];

// Provider callback/webhook. Always verifies server-side against the
// provider's own secret (Section 9) before ever extending access — never
// trusts a client-reported "success".
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: rawProvider } = await params;
  if (!VALID_PROVIDERS.includes(rawProvider as PaymentProvider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }
  const provider = rawProvider as PaymentProvider;

  const payload = await request.json().catch(() => ({}));
  const adapter = getPaymentAdapter(provider);
  const result = await adapter.confirmPayment(payload);

  const service = createServiceRoleClient();
  const { data: payment } = await service
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("txn_id", result.txnId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
  }

  if (!result.verified) {
    await service.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return NextResponse.json({ ok: false });
  }

  await service.from("payments").update({ status: result.status }).eq("id", payment.id);

  if (result.status === "success") {
    const { data: existingUser } = await service.from("users").select("premium_until").eq("id", payment.user_id).single();
    const base = existingUser?.premium_until && new Date(existingUser.premium_until) > new Date()
      ? new Date(existingUser.premium_until)
      : new Date();
    const premiumUntil = new Date(base.getTime() + PREMIUM_EXTENSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await service.from("users").update({ premium_until: premiumUntil }).eq("id", payment.user_id);
    await notify(payment.user_id, "payment_confirmed", { provider, amount: payment.amount, currency: payment.currency });
  } else {
    await notify(payment.user_id, "payment_failed", { provider });
  }

  return NextResponse.json({ ok: true });
}
