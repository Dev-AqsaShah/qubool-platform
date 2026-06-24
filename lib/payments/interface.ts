import type { PaymentProvider } from "@/types/database";

export interface CreatePaymentInput {
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
}

export interface CreatePaymentResult {
  txnId: string;
  redirectUrl: string;
}

export interface ConfirmPaymentInput {
  provider: PaymentProvider;
  payload: Record<string, unknown>;
}

export interface ConfirmPaymentResult {
  verified: boolean;
  txnId: string;
  status: "success" | "failed";
}

export interface PaymentProviderAdapter {
  createPayment(input: Omit<CreatePaymentInput, "provider">): Promise<CreatePaymentResult>;
  confirmPayment(payload: Record<string, unknown>): Promise<ConfirmPaymentResult>;
}

// Every provider plugs into the same createPayment -> confirmPayment ->
// extend premium_until by 30 days pipeline (Section 9). Webhook routes call
// confirmPayment with the raw provider callback; the adapter is responsible
// for verifying it server-side against its own secret before reporting success.
export const PREMIUM_EXTENSION_DAYS = 30;
