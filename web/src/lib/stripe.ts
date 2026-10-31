import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Låtsaskassa för lokal test utan Stripe-nycklar. Fungerar aldrig i produktion. */
export function stripeMock(): boolean {
  return process.env.STRIPE_MOCK === "1" && process.env.NODE_ENV !== "production" && !stripeConfigured();
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe är inte kopplat än. Lägg in STRIPE_SECRET_KEY.");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
}
