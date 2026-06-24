import crypto from "crypto";
import type { PaymentProviderAdapter } from "@/lib/payments/interface";

// Payoneer (international card payments) — real integration uses OAuth
// client credentials (PAYONEER_PROGRAM_ID/CLIENT_ID/CLIENT_SECRET) to create
// a hosted checkout session and verify callbacks. This adapter stubs that
// shape so the rest of the app (payments table, premium_until extension)
// works end-to-end before real credentials exist.
function sign(txnId: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(txnId).digest("hex");
}

export const payoneerAdapter: PaymentProviderAdapter = {
  async createPayment({ userId, amount, currency }) {
    const txnId = `PO${Date.now()}${userId.slice(0, 6)}`;
    const programId = process.env.PAYONEER_PROGRAM_ID ?? "";
    const redirectUrl = `https://payouts.payoneer.com/partner/checkout?program=${programId}&txn=${txnId}&amount=${amount}&currency=${currency}`;
    return { txnId, redirectUrl };
  },

  async confirmPayment(payload) {
    const secret = process.env.PAYONEER_CLIENT_SECRET ?? "";
    const txnId = String(payload.txnId ?? "");
    const receivedSig = String(payload.signature ?? "");
    const status = String(payload.status ?? "");

    if (!secret || !txnId) {
      return { verified: false, txnId, status: "failed" };
    }

    const expected = sign(txnId, secret);
    const verified = expected === receivedSig;
    return { verified, txnId, status: verified && status === "COMPLETED" ? "success" : "failed" };
  },
};
