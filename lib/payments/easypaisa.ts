import crypto from "crypto";
import type { PaymentProviderAdapter } from "@/lib/payments/interface";

// Easypaisa's open API authenticates callbacks with an HMAC over the
// transaction fields using the merchant secret. Real integration needs
// EASYPAISA_MERCHANT_ID/SECRET from the founder's merchant dashboard.
function sign(txnId: string, amount: number, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${txnId}:${amount}`).digest("hex");
}

export const easypaisaAdapter: PaymentProviderAdapter = {
  async createPayment({ userId, amount }) {
    const txnId = `EP${Date.now()}${userId.slice(0, 6)}`;
    const merchantId = process.env.EASYPAISA_MERCHANT_ID ?? "";
    const secret = process.env.EASYPAISA_SECRET ?? "";
    const signature = secret ? sign(txnId, amount, secret) : "unsigned";

    const redirectUrl = `https://easypay.easypaisa.com.pk/easypay/Index.jsf?txn=${txnId}&merchant=${merchantId}&sig=${signature}`;
    return { txnId, redirectUrl };
  },

  async confirmPayment(payload) {
    const secret = process.env.EASYPAISA_SECRET ?? "";
    const txnId = String(payload.txnId ?? "");
    const amount = Number(payload.amount ?? 0);
    const receivedSig = String(payload.signature ?? "");
    const status = String(payload.status ?? "");

    if (!secret || !txnId) {
      return { verified: false, txnId, status: "failed" };
    }

    const expected = sign(txnId, amount, secret);
    const verified = expected === receivedSig;
    return { verified, txnId, status: verified && status === "SUCCESS" ? "success" : "failed" };
  },
};
