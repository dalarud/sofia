import { getStripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/stripe-webhook";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Saknar signatur", { status: 400 });
  let event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Ogiltig signatur", { status: 400 });
  }
  try {
    const result = await handleStripeEvent(event);
    return Response.json({ ok: true, result });
  } catch (e) {
    console.error("Stripe-händelse", event.type, e);
    return new Response("Fel vid hantering", { status: 500 }); // Stripe försöker igen
  }
}
