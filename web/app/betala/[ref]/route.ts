import crypto from "node:crypto";
import { getInvoice, invoiceCheckoutUrl, payToken } from "@/lib/invoices";
import { renderPage } from "@/site/render";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function page(heading: string, body: string, status = 200) {
  return new Response(renderPage({ title: "Betala faktura", eyebrow: "Faktura", heading, body }), { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/** Kundens betallänk på fakturan. Skapar en ny Stripe-betalning varje gång. */
export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const m = /^(\d+)-([0-9a-f]{16})$/.exec(ref);
  if (!m || !crypto.timingSafeEqual(Buffer.from(m[2]), Buffer.from(payToken(Number(m[1]))))) return page("Länken fungerar inte", "<p>Kontrollera länken på fakturan, eller betala till bankgirot.</p>", 404);
  const inv = await getInvoice(Number(m[1])).catch(() => null);
  if (!inv) return page("Länken fungerar inte", "<p>Fakturan finns inte.</p>", 404);
  if (inv.status === "betald") return page("Redan <em>betald.</em>", "<p>Den här fakturan är redan betald. Tack!</p>");
  if (inv.status !== "skickad" || !stripeConfigured()) return page("Det går inte att betala här", "<p>Betala gärna till bankgirot som står på fakturan.</p>");
  const url = await invoiceCheckoutUrl(inv.id);
  if (!url) return page("Det går inte att betala här", "<p>Betala gärna till bankgirot som står på fakturan.</p>");
  return Response.redirect(url, 303);
}
