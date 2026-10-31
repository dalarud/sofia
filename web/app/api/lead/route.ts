import { z } from "zod";
import { db, schema } from "@/db";
import { getSetting, type Company } from "@/lib/content";
import { sendMail } from "@/lib/mail";
import { clientIp, json, rateLimited } from "@/lib/ratelimit";
import { siteUrl } from "@/lib/stripe";
import { esc } from "@/site/render";

const input = z.object({
  name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(200), service: z.string().max(80),
  pains: z.array(z.string().max(80)).max(10).default([]), message: z.string().max(4000).default(""),
});

export async function POST(req: Request) {
  if (rateLimited(`lead:${clientIp(req)}`, 5, 10 * 60_000)) return json({ error: "Många meddelanden på kort tid. Försök igen senare." }, 429);
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Fyll i ditt namn och en giltig e-postadress så att jag kan svara dig." }, 400);
  const lead = parsed.data;
  await db.insert(schema.leads).values(lead);
  const company = await getSetting<Company>("company");
  await sendMail({
    to: company.email, replyTo: lead.email, subject: `Ny förfrågan: ${lead.service} från ${lead.name}`,
    html: `<p><b>${esc(lead.name)}</b> (${esc(lead.email)}) vill ha hjälp med <b>${esc(lead.service)}</b>.</p>${lead.pains.length ? `<p>Det som skaver: ${esc(lead.pains.join(", "))}</p>` : ""}<p>${esc(lead.message).replace(/\n/g, "<br>")}</p><p><a href="${siteUrl()}/admin/forfragningar">Öppna förfrågningar</a></p>`,
  }).catch(() => false);
  return json({ ok: true });
}
