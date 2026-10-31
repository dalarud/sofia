import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSetting, type Company } from "@/lib/content";
import { giftCardPdf } from "@/lib/pdf";
import { clientIp, rateLimited } from "@/lib/ratelimit";

// Koden är slumpad och fungerar som nyckel: den som har koden kan ladda ner presentkortet.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (rateLimited(`presentkort:${clientIp(req)}`, 30, 10 * 60_000)) return new Response("Många försök. Vänta en stund.", { status: 429 });
  const [card] = await db.select().from(schema.giftCards).where(eq(schema.giftCards.code, code.toUpperCase()));
  if (!card) return new Response("Presentkortet finns inte", { status: 404 });
  const pdf = await giftCardPdf(card, await getSetting<Company>("company"));
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="presentkort-${card.code}.pdf"`, "Cache-Control": "private, no-store" } });
}
