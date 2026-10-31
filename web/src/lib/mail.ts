/**
 * E-post via Resend (valfritt). Utan RESEND_API_KEY skickas inget, och allt annat fungerar ändå:
 * kunden får kvitto från Stripe och kan ladda ner presentkort på tack-sidan.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSetting, type Company } from "./content";
import { giftCardPdf } from "./pdf";
import { kr } from "./money";
import { siteUrl } from "./stripe";
import { esc } from "@/site/render";

type Attachment = { filename: string; content: Uint8Array };

export function mailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

export async function sendMail(opts: { to: string; subject: string; html: string; attachments?: Attachment[]; replyTo?: string }): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !opts.to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "Studio Dalarud <hej@studiodalarud.se>",
      to: [opts.to], subject: opts.subject, html: wrapHtml(opts.html), reply_to: opts.replyTo,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString("base64") })),
    }),
  });
  if (!res.ok) console.error("E-post kunde inte skickas", res.status, await res.text());
  return res.ok;
}

function wrapHtml(body: string) {
  return `<div style="background:#F3EEE6;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#2B362E;line-height:1.6"><div style="max-width:560px;margin:0 auto">${body}<p style="margin-top:32px;color:#5D6458;font-size:13px">Studio Dalarud · Från brus till ro</p></div></div>`;
}

/** Orderbekräftelse till kunden (med presentkort som PDF) och en kort notis till Sofia. */
export async function sendOrderMails(orderId: string) {
  if (!mailConfigured()) return;
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
  if (!order) return;
  const company = await getSetting<Company>("company");
  const cards = await db.select().from(schema.giftCards).where(eq(schema.giftCards.orderId, orderId));
  const attachments: Attachment[] = [];
  for (const c of cards) attachments.push({ filename: `presentkort-${c.code}.pdf`, content: await giftCardPdf(c, company) });

  const rows = order.items.map((i) => `<tr><td style="padding:4px 0">${esc(i.name)}${i.qty > 1 ? ` × ${i.qty}` : ""}</td><td style="text-align:right">${kr(i.unitOre * i.qty)}</td></tr>`).join("");
  const firstName = (order.customerName || "").split(" ")[0];
  await sendMail({
    to: order.email, replyTo: company.email,
    subject: `Tack för din beställning (order ${order.number})`,
    attachments,
    html: `<h1 style="font-family:Georgia,serif;font-weight:400">Tack${firstName ? ` ${esc(firstName)}` : ""}!</h1>
<p>Jag har fått din beställning och betalningen är klar.</p>
<table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding-top:8px;border-top:1px solid #D0C3AF"><b>Totalt</b></td><td style="text-align:right;padding-top:8px;border-top:1px solid #D0C3AF"><b>${kr(order.totalOre)}</b></td></tr></table>
${cards.length ? "<p>Presentkortet finns bifogat som PDF.</p>" : ""}
${order.delivery === "post" ? "<p>Paketet skickas inom 5 arbetsdagar.</p>" : order.delivery === "hamtning" ? "<p>Jag hör av mig när du kan hämta i ateljén.</p>" : ""}
<p>Hälsningar<br>Sofia</p>`,
  });
  await sendMail({
    to: company.email,
    subject: `Ny order ${order.number}: ${kr(order.totalOre)}`,
    html: `<p>${esc(order.customerName || order.email)} har beställt:</p><table>${rows}</table><p><a href="${siteUrl()}/admin/ordrar">Öppna ordrar</a></p>`,
  });
}
