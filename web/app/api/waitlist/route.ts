import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { clientIp, json, rateLimited } from "@/lib/ratelimit";

const input = z.object({ eventId: z.string().max(80), name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(200) });

export async function POST(req: Request) {
  if (rateLimited(`waitlist:${clientIp(req)}`, 5, 10 * 60_000)) return json({ error: "Många försök på kort tid. Försök igen senare." }, 429);
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Fyll i namn och en giltig e-postadress." }, 400);
  const [ev] = await db.select().from(schema.events).where(eq(schema.events.id, parsed.data.eventId));
  if (!ev) return json({ error: "Kursen finns inte längre." }, 404);
  await db.insert(schema.eventBookings).values({ eventId: ev.id, name: parsed.data.name, email: parsed.data.email, waitlist: true });
  return json({ ok: true });
}
