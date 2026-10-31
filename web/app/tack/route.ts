import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { kr } from "@/lib/money";
import { esc, renderPage } from "@/site/render";

export const dynamic = "force-dynamic";

// Tack-sidan efter betalningen. Ordern skapas av Stripes webhook; den kan komma några sekunder efter kunden.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const invoiceNo = url.searchParams.get("faktura");
  if (invoiceNo && /^\d+$/.test(invoiceNo)) {
    return html(renderPage({ title: "Tack", eyebrow: `Faktura ${invoiceNo}`, heading: "Tack! Fakturan <em>är betald.</em>", body: "<p>Betalningen är klar och du får ett kvitto via e-post. Tack för förtroendet!</p>" }));
  }
  const sessionId = url.searchParams.get("session_id") ?? "";
  const [order] = sessionId ? await db.select().from(schema.orders).where(eq(schema.orders.stripeSessionId, sessionId)) : [];
  const clear = 'try{localStorage.removeItem("sd-cart");localStorage.removeItem("sd-gifts")}catch(e){}';
  if (!order) {
    return html(renderPage({
      title: "Tack", eyebrow: "Tack för din beställning", heading: "Tack! Betalningen <em>är klar.</em>",
      body: `<p>Din beställning registreras just nu. Du får ett kvitto via e-post från betalningen, och en bekräftelse från mig.</p><p>Ladda om sidan om en liten stund för att se din order och eventuella presentkort.</p>`,
      script: clear,
    }));
  }
  const cards = await db.select().from(schema.giftCards).where(eq(schema.giftCards.orderId, order.id));
  const rows = order.items.map((i) => `<li><span>${esc(i.name)}${i.qty > 1 ? ` × ${i.qty}` : ""}</span><span>${kr(i.unitOre * i.qty)}</span></li>`).join("");
  const gifts = cards.length ? `<h2>Presentkort</h2><p>Ladda ner presentkorten här. Skriv ut dem eller skicka dem vidare.</p><ul class="price-list">${cards.map((c) => `<li><span>${esc(c.kind)}${c.toName ? ` till ${esc(c.toName)}` : ""}, kod ${esc(c.code)}</span><span><a href="/api/presentkort/${esc(c.code)}" target="_blank" rel="noopener">Ladda ner PDF</a></span></li>`).join("")}</ul>` : "";
  const delivery = order.delivery === "post" ? "<p>Paketet skickas inom 5 arbetsdagar.</p>" : order.delivery === "hamtning" ? "<p>Jag hör av mig när du kan hämta i ateljén.</p>" : "";
  const course = order.items.some((i) => i.kind === "event") ? "<p>Din plats på kursen är bokad. Jag skickar mer information några dagar innan.</p>" : "";
  return html(renderPage({
    title: "Tack", eyebrow: `Order ${order.number}`, heading: `Tack${order.customerName ? ` ${esc(order.customerName.split(" ")[0])}` : ""}! <em>Allt är klart.</em>`,
    body: `<ul class="price-list">${rows}<li><span><b>Totalt</b></span><span><b>${kr(order.totalOre)}</b></span></li></ul>${course}${delivery}${gifts}<p>Ett kvitto skickas till ${esc(order.email)}.</p>`,
    script: clear,
  }));
}

function html(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}
