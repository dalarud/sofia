import { buildCart, checkoutInput, CheckoutError, startCheckout } from "@/lib/checkout";
import { clientIp, json, rateLimited } from "@/lib/ratelimit";
import { stripeConfigured, stripeMock } from "@/lib/stripe";

export async function POST(req: Request) {
  if (rateLimited(`checkout:${clientIp(req)}`, 20, 10 * 60_000)) return json({ error: "Många försök på kort tid. Vänta en stund och försök igen." }, 429);
  if (!stripeConfigured() && !stripeMock()) return json({ error: "Kassan är inte öppen än. Hör gärna av dig via formuläret så hjälper jag dig." }, 503);
  const parsed = checkoutInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Något i beställningen ser fel ut. Ladda om sidan och försök igen." }, 400);
  try {
    const cart = await buildCart(parsed.data);
    return json({ url: await startCheckout(cart) });
  } catch (e) {
    if (e instanceof CheckoutError) return json({ error: e.message }, 400);
    console.error("Kassan", e);
    return json({ error: "Det gick inte att starta betalningen just nu. Försök igen om en stund." }, 500);
  }
}
