/** Läser hemsidans innehåll och inställningar ur databasen. */
import { asc, eq, gte, and } from "drizzle-orm";
import { db, schema } from "@/db";
import { SETTINGS, TEXTS } from "@/db/seed-data";
import { today } from "./money";

export type Company = {
  name: string; owner: string; orgNr: string; vatNr: string; fSkatt: boolean; address: string;
  email: string; phone: string; instagram: string; bankgiro: string; swish: string;
};
export type AccountingSettings = { vatPeriod: "ar" | "kvartal" | "manad"; vatDueDate: string; paymentTermsDays: number; nextInvoiceNumber: number; method: string };
export type ShopSettings = { shippingOre: number; freeShippingFromOre: number; pickup: boolean };
export type GiftType = { kind: string; amountOre: number };
export type SiteSettings = { portraitImageId?: string | null };

export async function getSetting<T>(key: string): Promise<T> {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  const fallback = (SETTINGS as Record<string, unknown>)[key];
  if (!row) return fallback as T;
  // Nya fält i startvärdena följer med även om inställningen sparats tidigare.
  if (fallback && typeof fallback === "object" && !Array.isArray(fallback)) return { ...(fallback as object), ...(row.value as object) } as T;
  return row.value as T;
}

export async function setSetting(key: string, value: unknown) {
  await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

export async function getTexts(): Promise<Record<string, string>> {
  const rows = await db.select().from(schema.texts);
  const map: Record<string, string> = Object.fromEntries(TEXTS.map((t) => [t.key, t.value]));
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function getSiteData() {
  const [texts, company, shop, gifts, site, services, products, events, tips] = await Promise.all([
    getTexts(),
    getSetting<Company>("company"),
    getSetting<ShopSettings>("shop"),
    getSetting<GiftType[]>("gifts"),
    getSetting<SiteSettings>("site"),
    db.select().from(schema.services).where(eq(schema.services.active, true)).orderBy(asc(schema.services.sort), asc(schema.services.id)),
    db.select().from(schema.products).where(eq(schema.products.active, true)).orderBy(asc(schema.products.sort)),
    db.select().from(schema.events).where(and(eq(schema.events.active, true), gte(schema.events.date, today()))).orderBy(asc(schema.events.date)),
    db.select().from(schema.tips).where(eq(schema.tips.active, true)).orderBy(asc(schema.tips.sort), asc(schema.tips.id)),
  ]);
  return { texts, company, shop, gifts, site: site ?? {}, services, products, events, tips };
}
export type SiteData = Awaited<ReturnType<typeof getSiteData>>;
