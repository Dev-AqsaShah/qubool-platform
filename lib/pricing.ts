export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? process.env.NEXT_PUBLIC_TRIAL_DAYS ?? 3);
export const SUBSCRIPTION_PRICE_USD = Number(
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_USD ?? process.env.SUBSCRIPTION_PRICE_USD ?? 5
);
export const SUBSCRIPTION_PRICE_PKR = Number(
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_PKR ?? process.env.SUBSCRIPTION_PRICE_PKR ?? 1400
);
