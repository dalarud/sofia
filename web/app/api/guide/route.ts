import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendMail } from "@/lib/mail";
import { clientIp, json, rateLimited } from "@/lib/ratelimit";
import { siteUrl } from "@/lib/stripe";

const input = z.object({ email: z.string().trim().toLowerCase().email().max(200), newsletter: z.boolean().default(false), source: z.enum(["guide", "sondagsbrev", "rotest"]).default("guide") });
const GUIDE = "/guide-lugnare-barnrum.pdf";

export async function POST(req: Request) {
  if (rateLimited(`guide:${clientIp(req)}`, 5, 10 * 60_000)) return json({ error: "Många försök på kort tid. Försök igen senare." }, 429);
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Skriv en giltig e-postadress, så skickar jag guiden dit." }, 400);
  const { email, newsletter, source } = parsed.data;
  await db.insert(schema.subscribers).values({ email, newsletter, source }).onConflictDoUpdate({
    target: schema.subscribers.email,
    set: { newsletter: sql`${schema.subscribers.newsletter} or ${newsletter}`, unsubscribedAt: null },
  });
  if (source !== "guide") {
    await sendMail({
      to: email, subject: "Välkommen till Söndagsbrevet",
      html: `<h1 style="font-family:Georgia,serif;font-weight:400">Välkommen!</h1><p>Från och med nästa söndag får du ett kort brev från mig: ett tips, en ritual och vad som händer i ateljén.</p><p>Medan du väntar kan du ladda ner skriften <a href="${siteUrl()}/rohemmet-ett-snallt-hem-at-alla.pdf">Rohemmet – Ett snällt hem åt alla</a>.</p><p>Hälsningar<br>Sofia</p>`,
    }).catch(() => false);
    return json({ ok: true });
  }
  await sendMail({
    to: email, subject: "Din guide: 7 saker för ett lugnare barnrum",
    html: `<h1 style="font-family:Georgia,serif;font-weight:400">Här är din guide</h1><p>Tack för att du vill ha guiden. Du kan ladda ner den här:</p><p><a href="${siteUrl()}${GUIDE}">7 saker för ett lugnare barnrum (PDF)</a></p><p>Börja gärna med en sak i taget.</p><p>Hälsningar<br>Sofia</p>`,
  }).catch(() => false);
  return json({ ok: true, url: GUIDE });
}
