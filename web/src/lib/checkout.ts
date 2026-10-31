/**
 * Kassan: bygger en varukorg med priser från databasen (aldrig från webbläsaren),
 * skickar kunden till Stripe och tar hand om köpet när betalningen är klar.
 */
import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSetting, type GiftType, type ShopSettings } from "./content";
import { createVerification } from "./ledger";
import { ACC, saleRows, type SaleLine } from "./rules";
import { addDays, today, vatFromGross } from "./money";
import { getStripe, siteUrl, stripeMock } from "./stripe";
import type { OrderItem } from "@/db/schema";

export const checkoutInput = z.object({
  items: z.array(z.object({ id: z.string().max(80), qty: z.number().int().min(1).max(20) })).max(30).default([]),
  gifts: z.array(z.object({
    kind: z.string().max(60), amountOre: z.number().int(), to: z.string().max(60).default(""), from: z.string().max(60).default(""), message: z.string().max(160).default(""),
  })).max(10).default([]),
  event: z.object({ id: z.string().max(80), name: z.string().min(1).max(100), email: z.string().email().max(200), qty: z.number().int().min(1).max(6) }).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutInput>;

export type CartLine = {
  kind: "product" | "event" | "gift";
  id: string;
  name: string;
  unitOre: number;
  qty: number;
  vatRate: number;
  gift?: { kind: string; to: string; from: string; message: string };
  attendee?: { name: string; email: string };
};
export type Cart = { lines: CartLine[]; needsShipping: boolean; goodsOre: number; email?: string };

export class CheckoutError extends Error {}

/** Kontrollerar varukorgen mot databasen och räknar fram priserna. */
export async function buildCart(input: CheckoutInput): Promise<Cart> {
  const lines: CartLine[] = [];
  const products = await db.select().from(schema.products).where(eq(schema.products.active, true));

  for (const item of input.items) {
    const base = products.find((p) => p.id === item.id || p.option?.id === item.id);
    if (!base) throw new CheckoutError("En vara i korgen finns inte längre. Ta bort den och försök igen.");
    const withOption = base.option?.id === item.id;
    if (base.stock !== null && base.stock < item.qty) throw new CheckoutError(`${base.name} finns inte i så många exemplar just nu.`);
    lines.push({
      kind: "product", id: base.id, qty: item.qty, vatRate: base.vatRate,
      name: withOption ? `${base.name} med glasinsats` : base.name,
      unitOre: base.priceOre + (withOption ? base.option!.priceOre : 0),
    });
  }

  if (input.gifts.length) {
    const types = await getSetting<GiftType[]>("gifts");
    for (const g of input.gifts) {
      const type = types.find((t) => t.kind === g.kind);
      if (!type) throw new CheckoutError("Den typen av presentkort finns inte längre.");
      const amount = type.amountOre || g.amountOre;
      if (amount < 20000 || amount > 2000000) throw new CheckoutError("Presentkortet måste vara på mellan 200 och 20 000 kr.");
      lines.push({ kind: "gift", id: `presentkort`, qty: 1, vatRate: 0, unitOre: amount,
        name: `Presentkort${type.kind === "Valfritt belopp" ? "" : ` · ${type.kind}`}${g.to ? ` till ${g.to}` : ""}`,
        gift: { kind: type.kind, to: g.to, from: g.from, message: g.message } });
    }
  }

  if (input.event) {
    const [ev] = await db.select().from(schema.events).where(eq(schema.events.id, input.event.id));
    if (!ev || !ev.active || ev.priceOre <= 0) throw new CheckoutError("Kursen går inte att boka.");
    if (ev.date < today()) throw new CheckoutError("Kursen har redan varit.");
    if (ev.seats - ev.booked < input.event.qty) throw new CheckoutError("Kursen är tyvärr fullbokad. Skriv upp dig på väntelistan.");
    lines.push({ kind: "event", id: ev.id, qty: input.event.qty, vatRate: 25, unitOre: ev.priceOre,
      name: `${ev.title}, ${ev.date} ${ev.time}`, attendee: { name: input.event.name, email: input.event.email } });
  }

  if (!lines.length) throw new CheckoutError("Varukorgen är tom.");
  const goodsOre = lines.filter((l) => l.kind === "product").reduce((s, l) => s + l.unitOre * l.qty, 0);
  return { lines, needsShipping: goodsOre > 0, goodsOre, email: input.event?.email };
}

/** Skapar en betalning hos Stripe och returnerar adressen dit kunden ska skickas. */
export async function startCheckout(cart: Cart): Promise<string> {
  const [co] = await db.insert(schema.checkouts).values({ payload: cart }).returning({ id: schema.checkouts.id });

  if (stripeMock()) {
    // Lokalt test: betalningen räknas som genomförd direkt.
    const sessionId = `mock_${co.id}`;
    const shippingOre = cart.needsShipping ? await shippingFor(cart.goodsOre) : 0;
    await fulfillCheckout({ checkoutId: co.id, sessionId, paymentIntentId: null, email: cart.email ?? "test@exempel.se", name: "Testkund",
      address: cart.needsShipping ? { line1: "Testgatan 1", postalCode: "123 45", city: "Teststad", country: "SE" } : null,
      shippingOre, delivery: cart.needsShipping ? "post" : "ingen", phone: null });
    return `${siteUrl()}/tack?session_id=${sessionId}`;
  }

  const stripe = getStripe();
  const shop = await getSetting<ShopSettings>("shop");
  const shippingOre = await shippingFor(cart.goodsOre);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "sv",
    currency: "sek",
    line_items: cart.lines.map((l) => ({ quantity: l.qty, price_data: { currency: "sek", unit_amount: l.unitOre, product_data: { name: l.name } } })),
    customer_email: cart.email,
    customer_creation: "if_required",
    billing_address_collection: "auto",
    ...(cart.needsShipping ? {
      shipping_address_collection: { allowed_countries: ["SE"] },
      shipping_options: [
        { shipping_rate_data: { type: "fixed_amount", display_name: "Postpaket", fixed_amount: { amount: shippingOre, currency: "sek" }, delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 6 } }, metadata: { delivery: "post" } } },
        ...(shop.pickup ? [{ shipping_rate_data: { type: "fixed_amount" as const, display_name: "Hämta i ateljén", fixed_amount: { amount: 0, currency: "sek" }, metadata: { delivery: "hamtning" } } }] : []),
      ],
    } : {}),
    metadata: { checkout_id: co.id },
    payment_intent_data: { metadata: { checkout_id: co.id }, description: "Studio Dalarud" },
    success_url: `${siteUrl()}/tack?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/#ateljen`,
  });
  await db.update(schema.checkouts).set({ stripeSessionId: session.id }).where(eq(schema.checkouts.id, co.id));
  if (!session.url) throw new Error("Stripe gav ingen betalningslänk");
  return session.url;
}

async function shippingFor(goodsOre: number) {
  const shop = await getSetting<ShopSettings>("shop");
  return goodsOre >= shop.freeShippingFromOre ? 0 : shop.shippingOre;
}

function giftCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  const s = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `SD-${s.slice(0, 4)}-${s.slice(4)}`;
}

export type FulfillInput = {
  checkoutId: string;
  sessionId: string;
  paymentIntentId: string | null;
  email: string;
  name: string;
  phone: string | null;
  address: { line1?: string; line2?: string; postalCode?: string; city?: string; country?: string } | null;
  shippingOre: number;
  delivery: "post" | "hamtning" | "ingen";
};

/**
 * Skapar ordern när betalningen är klar: drar av lager, bokar kursplatser, skapar presentkort
 * och bokför försäljningen. Säker att köra flera gånger för samma betalning.
 */
export async function fulfillCheckout(input: FulfillInput): Promise<{ orderId: string; created: boolean }> {
  return db.transaction(async (tx) => {
    const existing = await tx.select({ id: schema.orders.id }).from(schema.orders).where(eq(schema.orders.stripeSessionId, input.sessionId));
    if (existing.length) return { orderId: existing[0].id, created: false };
    const [co] = await tx.select().from(schema.checkouts).where(eq(schema.checkouts.id, input.checkoutId));
    if (!co) throw new Error(`Okänd kassa ${input.checkoutId}`);
    const cart = co.payload as Cart;

    const items: OrderItem[] = cart.lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty, unitOre: l.unitOre, vatRate: l.vatRate, kind: l.kind }));
    if (input.shippingOre > 0) items.push({ id: "frakt", name: "Frakt", qty: 1, unitOre: input.shippingOre, vatRate: 25, kind: "shipping" });
    const totalOre = items.reduce((s, i) => s + i.unitOre * i.qty, 0);
    const vatOre = items.reduce((s, i) => s + vatFromGross(i.unitOre * i.qty, i.kind === "gift" ? 0 : i.vatRate), 0);

    const [order] = await tx.insert(schema.orders).values({
      stripeSessionId: input.sessionId, paymentIntentId: input.paymentIntentId, customerName: input.name, email: input.email, phone: input.phone,
      address: input.address, delivery: input.delivery, items, totalOre, vatOre,
      status: cart.needsShipping ? "betald" : "klar",
    }).returning({ id: schema.orders.id, number: schema.orders.number });

    for (const l of cart.lines) {
      if (l.kind === "product") {
        await tx.execute(sql`update products set stock = greatest(stock - ${l.qty}, 0) where id = ${l.id} and stock is not null`);
      }
      if (l.kind === "event" && l.attendee) {
        await tx.execute(sql`update events set booked = booked + ${l.qty} where id = ${l.id}`);
        await tx.insert(schema.eventBookings).values({ eventId: l.id, orderId: order.id, name: l.attendee.name, email: l.attendee.email, qty: l.qty });
      }
      if (l.kind === "gift" && l.gift) {
        await tx.insert(schema.giftCards).values({ code: giftCode(), kind: l.gift.kind, amountOre: l.unitOre, balanceOre: l.unitOre,
          toName: l.gift.to || null, fromName: l.gift.from || null, message: l.gift.message || null, orderId: order.id, expiresAt: addDays(today(), 730) });
      }
    }

    const saleLines: SaleLine[] = items.map((i) => ({
      grossOre: i.unitOre * i.qty, vatRate: i.vatRate,
      kind: i.kind === "gift" ? "gift" : i.kind === "shipping" ? "shipping" : i.kind === "event" ? "service" : "goods",
    }));
    const ver = await createVerification({ date: today(), text: `Order ${order.number}, ${input.name || input.email}`, source: "order", sourceRef: order.id, rows: saleRows(saleLines, ACC.stripe) }, tx);
    await tx.update(schema.orders).set({ verificationId: ver.id }).where(eq(schema.orders.id, order.id));
    await tx.update(schema.checkouts).set({ orderId: order.id }).where(eq(schema.checkouts.id, input.checkoutId));
    return { orderId: order.id, created: true };
  });
}
