import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendMail } from "@/lib/mail";
import { clientIp, json, rateLimited } from "@/lib/ratelimit";
import { siteUrl } from "@/lib/stripe";

const input = z.object({ email: z.string().trim().toLowerCase().email().max(200), newsletter: z.boolean().default(false) });
const GUIDE = "/guide-lugnare-barnrum.pdf";

export async function POST(req: Request) {
  if (rateLimited(`guide:${clientIp(req)}`, 5, 10 * 60_000)) return json({ error: "Många försök på kort tid. Försök igen senare." }, 429);
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Skriv en giltig e-postadress, så skickar jag guiden dit." }, 400);
  const { email, newsletter } = parsed.data;
  await db.insert(schema.subscribers).values({ email, newsletter, source: "guide" }).onConflictDoUpdate({
    target: schema.subscribers.email,
    set: { newsletter: sql`${schema.subscribers.newsletter} or ${newsletter}`, unsubscribedAt: null },
  });
  await sendMail({
    to: email, subject: "Din guide: 7 saker för ett lugnare barnrum",
    html: `<h1 style="font-family:Georgia,serif;font-weight:400">Här är din guide</h1><p>Tack för att du vill ha guiden. Du kan ladda ner den här:</p><p><a href="${siteUrl()}${GUIDE}">7 saker för ett lugnare barnrum (PDF)</a></p><p>Börja gärna med en sak i taget.</p><p>Hälsningar<br>Sofia</p>`,
  }).catch(() => false);
  return json({ ok: true, url: GUIDE });
}
