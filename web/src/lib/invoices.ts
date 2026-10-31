/**
 * Fakturor med kontantmetoden: inget bokförs när fakturan skickas, försäljningen bokförs
 * när pengarna kommer. Obetalda fakturor vid årets slut bokförs i bokslutet (se Bokföring).
 */
import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { InvoiceLine } from "@/db/schema";
import { correctVerification, createVerification } from "./ledger";
import { ACC, saleRows } from "./rules";
import { getSetting, type AccountingSettings, type Company } from "./content";
import { vatFromGross } from "./money";
import { getStripe, siteUrl, stripeConfigured } from "./stripe";

/** Skapar en Stripe-betalning för en skickad faktura och returnerar adressen. */
export async function invoiceCheckoutUrl(id: number): Promise<string | null> {
  const inv = await getInvoice(id);
  if (inv.status !== "skickad") return null;
  const session = await getStripe().checkout.sessions.create({
    mode: "payment", locale: "sv", currency: "sek",
    line_items: [{ quantity: 1, price_data: { currency: "sek", unit_amount: inv.totalOre, product_data: { name: `Faktura ${inv.number}` } } }],
    customer_email: inv.customer.email || undefined,
    metadata: { invoice_id: String(inv.id) },
    payment_intent_data: { metadata: { invoice_id: String(inv.id) }, description: `Faktura ${inv.number}` },
    success_url: `${siteUrl()}/tack?faktura=${inv.number}`,
    cancel_url: `${siteUrl()}/`,
  });
  return session.url;
}
import { invoicePdf } from "./pdf";
import { mailConfigured, sendMail } from "./mail";
import { esc } from "@/site/render";

export function invoiceTotals(lines: InvoiceLine[]) {
  let totalOre = 0, vatOre = 0;
  for (const l of lines) {
    const gross = Math.round(l.unitOre * l.qty);
    totalOre += gross;
    vatOre += vatFromGross(gross, l.vatRate);
  }
  return { totalOre, vatOre };
}

type Invoice = typeof schema.invoices.$inferSelect;

export async function getInvoice(id: number): Promise<Invoice> {
  const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
  if (!inv) throw new Error("Fakturan finns inte");
  return inv;
}

/** Ger fakturan nästa nummer i serien (utan luckor) och markerar den som skickad. */
export async function sendInvoice(id: number): Promise<{ mailed: boolean }> {
  const acc = await getSetting<AccountingSettings>("accounting");
  await db.transaction(async (t) => {
    await t.execute(sql`select pg_advisory_xact_lock(6001)`);
    const [inv] = await t.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    if (!inv) throw new Error("Fakturan finns inte");
    if (inv.status !== "utkast") throw new Error("Fakturan är redan skickad");
    if (!inv.lines.length || inv.totalOre <= 0) throw new Error("Fakturan behöver minst en rad med ett belopp");
    const res = await t.execute(sql`select coalesce(max(number), 0) as max from invoices`);
    const number = Math.max(Number((res.rows[0] as { max: number }).max) + 1, acc.nextInvoiceNumber || 1001);
    await t.update(schema.invoices).set({ number, status: "skickad", sentAt: new Date() }).where(eq(schema.invoices.id, id));
  });
  let inv = await getInvoice(id);
  if (stripeConfigured() && !inv.payUrl) {
    // Betalsidan skapar en ny Stripe-betalning varje gång den öppnas, så länken slutar aldrig gälla.
    await db.update(schema.invoices).set({ payUrl: `${siteUrl()}/betala/${inv.id}-${payToken(inv.id)}` }).where(eq(schema.invoices.id, id));
    inv = await getInvoice(id);
  }
  if (!inv.customer.email || !mailConfigured()) return { mailed: false };
  const company = await getSetting<Company>("company");
  const pdf = await invoicePdf({ ...inv, number: inv.number! }, company);
  const mailed = await sendMail({
    to: inv.customer.email, replyTo: company.email, subject: `Faktura ${inv.number} från ${company.name}`,
    attachments: [{ filename: `faktura-${inv.number}.pdf`, content: pdf }],
    html: `<p>Hej ${esc(inv.customer.name.split(" ")[0])}!</p><p>Här kommer fakturan som PDF. Förfallodatum ${inv.dueDate}.</p>${inv.payUrl ? `<p><a href="${inv.payUrl}">Betala med kort eller Klarna</a></p>` : ""}<p>Tack för förtroendet!<br>Sofia</p>`,
  });
  return { mailed };
}

/** En enkel signatur så att betalsidan inte går att gissa fram för andras fakturor. */
export function payToken(id: number): string {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET ?? "x").update(`faktura:${id}`).digest("hex").slice(0, 16);
}

/** Bokför betalningen. via: "bank" (till företagskontot) eller "stripe" (betallänken). */
export async function markInvoicePaid(id: number, date: string, via: "bank" | "stripe" | "swish") {
  return db.transaction(async (t) => {
    const [inv] = await t.select().from(schema.invoices).where(eq(schema.invoices.id, id)).for("update");
    if (!inv) throw new Error("Fakturan finns inte");
    if (inv.status === "betald") return inv.verificationId;
    if (inv.status !== "skickad") throw new Error("Bara skickade fakturor kan markeras som betalda");
    const rows = saleRows(inv.lines.map((l) => ({ grossOre: Math.round(l.unitOre * l.qty), vatRate: l.vatRate, kind: "service" as const })), via === "stripe" ? ACC.stripe : ACC.bank);
    const v = await createVerification({ date, text: `Faktura ${inv.number} betald, ${inv.customer.name}`, source: "faktura", sourceRef: String(inv.id), rows }, t);
    await t.update(schema.invoices).set({ status: "betald", paidAt: date, paidVia: via, verificationId: v.id }).where(eq(schema.invoices.id, id));
    return v.id;
  });
}

/** Krediterar en faktura. Är den betald bokförs en rättelse; annars har inget bokförts än. */
export async function creditInvoice(id: number, date: string) {
  await db.transaction(async (t) => {
    const [inv] = await t.select().from(schema.invoices).where(eq(schema.invoices.id, id)).for("update");
    if (!inv) throw new Error("Fakturan finns inte");
    if (inv.status === "utkast") throw new Error("Ett utkast kan tas bort i stället");
    if (inv.status === "krediterad") return;
    if (inv.status === "betald" && inv.verificationId) await correctVerification(inv.verificationId, `kreditering av faktura ${inv.number}`, date, t);
    await t.update(schema.invoices).set({ status: "krediterad" }).where(eq(schema.invoices.id, id));
  });
}
