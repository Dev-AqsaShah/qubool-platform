import crypto from "crypto";
import type { PaymentProviderAdapter } from "@/lib/payments/interface";

// JazzCash uses a "secure hash" (HMAC-SHA256 over pipe-joined sorted params)
// to authenticate both the checkout request and the callback. Real
// integration needs JAZZCASH_MERCHANT_ID/PASSWORD/INTEGRITY_SALT from the
// founder's merchant dashboard — see .env.local.example.
function buildSecureHash(params: Record<string, string>, salt: string) {
  const sorted = Object.keys(params).sort().map((k) => params[k]);
  const joined = [salt, ...sorted].join("&");
  return crypto.createHmac("sha256", salt).update(joined).digest("hex");
}

export const jazzCashAdapter: PaymentProviderAdapter = {
  async createPayment({ userId, amount, currency }) {
    const txnId = `JC${Date.now()}${userId.slice(0, 6)}`;
    const merchantId = process.env.JAZZCASH_MERCHANT_ID ?? "";
    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";

    const params = {
      pp_TxnRefNo: txnId,
      pp_Amount: String(Math.round(amount * 100)),
      pp_TxnCurrency: currency,
      pp_MerchantID: merchantId,
    };
    const hash = salt ? buildSecureHash(params, salt) : "unsigned";

    // Placeholder redirect — replace with JazzCash's real checkout endpoint
    // once merchant credentials are live.
    const redirectUrl = `https://sandbox.jazzcash.com.pk/checkout?txn=${txnId}&hash=${hash}`;
    return { txnId, redirectUrl };
  },

  async confirmPayment(payload) {
    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";
    const txnId = String(payload.pp_TxnRefNo ?? "");
    const receivedHash = String(payload.pp_SecureHash ?? "");
    const responseCode = String(payload.pp_ResponseCode ?? "");

    if (!salt || !txnId) {
      return { verified: false, txnId, status: "failed" };
    }

    const { pp_SecureHash, ...rest } = payload as Record<string, string>;
    void pp_SecureHash;
    const expectedHash = buildSecureHash(rest, salt);
    const verified = expectedHash === receivedHash;

    return { verified, txnId, status: verified && responseCode === "000" ? "success" : "failed" };
  },
};
