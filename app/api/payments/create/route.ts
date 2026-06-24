import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getPaymentAdapter } from "@/lib/payments";
import { SUBSCRIPTION_PRICE_PKR, SUBSCRIPTION_PRICE_USD } from "@/lib/pricing";

const bodySchema = z.object({ provider: z.enum(["easypaisa", "jazzcash", "payoneer"]) });

export async function POST(request: Request) {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { provider } = parsed.data;

  const isPkr = provider !== "payoneer";
  const amount = isPkr ? SUBSCRIPTION_PRICE_PKR : SUBSCRIPTION_PRICE_USD;
  const currency = isPkr ? "PKR" : "USD";

  const adapter = getPaymentAdapter(provider);
  const { txnId, redirectUrl } = await adapter.createPayment({ userId: user.id, amount, currency });

  const service = createServiceRoleClient();
  const { error } = await service.from("payments").insert({
    user_id: user.id,
    provider,
    amount,
    currency,
    txn_id: txnId,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ redirectUrl, txnId });
}
