import type { PaymentProvider } from "@/types/database";
import type { PaymentProviderAdapter } from "@/lib/payments/interface";
import { jazzCashAdapter } from "@/lib/payments/jazzcash";
import { easypaisaAdapter } from "@/lib/payments/easypaisa";
import { payoneerAdapter } from "@/lib/payments/payoneer";

const ADAPTERS: Record<PaymentProvider, PaymentProviderAdapter> = {
  jazzcash: jazzCashAdapter,
  easypaisa: easypaisaAdapter,
  payoneer: payoneerAdapter,
};

export function getPaymentAdapter(provider: PaymentProvider) {
  return ADAPTERS[provider];
}

export * from "@/lib/payments/interface";
