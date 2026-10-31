/** Tar emot händelser från Stripe: betalda köp, avgifter, utbetalningar och återbetalningar. */
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { fulfillCheckout } from "./checkout";
import { correctVerification, createVerification } from "./ledger";
import { payoutRows, stripeFeeRows } from "./rules";
import { today } from "./money";
import { getStripe } from "./stripe";
import { sendOrderMails } from "./mail";
import { markInvoicePaid } from "./invoices";

async function alreadyHandled(event: Stripe.Event): Promise<boolean> {
  const res = await db.insert(schema.stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing().returning({ id: schema.stripeEvents.id });
  return res.length === 0;
}

export async function handleStripeEvent(event: Stripe.Event): Promise<string> {
  if (await alreadyHandled(event)) return "redan hanterad";

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") return "väntar på betalning"; // t.ex. Klarna som blir klar senare
      if (session.metadata?.invoice_id) {
        const invoiceId = Number(session.metadata.invoice_id);
        const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        await markInvoicePaid(invoiceId, today(), "stripe");
        if (pi) await bookStripeFee(pi, `faktura ${session.metadata.invoice_id}`).catch((e) => console.error("Kunde inte bokföra Stripe-avgiften", e));
        return "faktura betald";
      }
      const checkoutId = session.metadata?.checkout_id;
      if (!checkoutId) return "saknar kassa";
      const shipping = session.collected_information?.shipping_details ?? null;
      const rateId = typeof session.shipping_cost?.shipping_rate === "string" ? session.shipping_cost.shipping_rate : session.shipping_cost?.shipping_rate?.id;
      let delivery: "post" | "hamtning" | "ingen" = "ingen";
      if (rateId) {
        const rate = await getStripe().shippingRates.retrieve(rateId);
        delivery = rate.metadata?.delivery === "hamtning" ? "hamtning" : "post";
      }
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
      const { orderId, created } = await fulfillCheckout({
        checkoutId, sessionId: session.id, paymentIntentId,
        email: session.customer_details?.email ?? "", name: shipping?.name ?? session.customer_details?.name ?? "",
        phone: session.customer_details?.phone ?? null,
        address: shipping?.address ? { line1: shipping.address.line1 ?? "", line2: shipping.address.line2 ?? "", postalCode: shipping.address.postal_code ?? "", city: shipping.address.city ?? "", country: shipping.address.country ?? "" } : null,
        shippingOre: session.shipping_cost?.amount_total ?? 0, delivery,
      });
      if (created) {
        const [o] = await db.select({ number: schema.orders.number }).from(schema.orders).where(eq(schema.orders.id, orderId));
        if (paymentIntentId) await bookStripeFee(paymentIntentId, `order ${o?.number ?? ""}`).catch((e) => console.error("Kunde inte bokföra Stripe-avgiften", e));
        await sendOrderMails(orderId).catch((e) => console.error("Kunde inte skicka orderbekräftelse", e));
      }
      return created ? "order skapad" : "order fanns redan";
    }
    case "payout.paid": {
      const payout = event.data.object as Stripe.Payout;
      const date = new Date(payout.arrival_date * 1000).toISOString().slice(0, 10);
      await createVerification({ date, text: "Utbetalning från Stripe", source: "stripe", sourceRef: payout.id, rows: payoutRows(payout.amount) });
      return "utbetalning bokförd";
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!pi) return "ingen betalning";
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.paymentIntentId, pi));
      if (!order) return "okänd order";
      if (charge.amount_refunded >= charge.amount && order.verificationId) {
        await correctVerification(order.verificationId, `återbetalning av order ${order.number}`, today());
        await db.update(schema.orders).set({ status: "aterbetald" }).where(eq(schema.orders.id, order.id));
        return "hel återbetalning bokförd";
      }
      // Delvis återbetalning: Sofia får en påminnelse att bokföra den, eftersom det beror på vad som återbetalades.
      await db.insert(schema.todos).values({ text: `Delvis återbetalning på order ${order.number} (${(charge.amount_refunded / 100).toFixed(2)} kr). Bokför den under Bokföring → Ny verifikation, eller fråga din redovisningskonsult.`, due: today() });
      return "påminnelse skapad";
    }
    default:
      return "ignorerad";
  }
}

/** Stripes avgift för ett köp bokförs direkt, så att fordran på Stripe stämmer med utbetalningarna. */
async function bookStripeFee(paymentIntentId: string, what: string) {
  const stripe = getStripe();
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge.balance_transaction"] });
  const charge = pi.latest_charge as Stripe.Charge | null;
  const bt = charge?.balance_transaction as Stripe.BalanceTransaction | null;
  if (!bt || !bt.fee) return;
  await createVerification({ date: today(), text: `Stripe-avgift ${what}`, source: "stripe", sourceRef: bt.id, rows: stripeFeeRows(bt.fee) });
}
