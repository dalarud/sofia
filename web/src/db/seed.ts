import { sql } from "drizzle-orm";
import { db, pool, schema } from "./index";
import { ACCOUNTS, EVENTS, PRODUCTS, SERVICES, SETTINGS, TEXTS, TIPS } from "./seed-data";

// Fyller en tom databas med startinnehållet. Befintligt innehåll skrivs aldrig över.
async function main() {
  await db.insert(schema.accounts).values(ACCOUNTS.map(([number, name]) => ({ number, name }))).onConflictDoNothing();
  await db.insert(schema.settings).values(Object.entries(SETTINGS).map(([key, value]) => ({ key, value }))).onConflictDoNothing();
  await db.insert(schema.texts).values(TEXTS.map((t, i) => ({ key: t.key, label: t.label, value: t.value, multiline: !!t.multiline, sort: i }))).onConflictDoNothing();

  const [{ n: serviceCount }] = (await db.execute(sql`select count(*)::int as n from services`)).rows as { n: number }[];
  if (serviceCount === 0) {
    await db.insert(schema.services).values(SERVICES.map((s, i) => ({
      name: s.name, short: s.short, priceFrom: s.priceFrom, body: s.body, badge: s.badge ?? null, tone: s.tone,
      contactLabel: s.contactLabel ?? "Boka", sort: i, items: s.items.map(([label, price]) => ({ label, price })),
    })));
  }
  await db.insert(schema.products).values(PRODUCTS.map((p, i) => ({ ...p, badge: p.badge ?? null, option: p.option ?? null, sort: i }))).onConflictDoNothing();
  await db.insert(schema.events).values(EVENTS).onConflictDoNothing();
  const [{ n: tipCount }] = (await db.execute(sql`select count(*)::int as n from tips`)).rows as { n: number }[];
  if (tipCount === 0) await db.insert(schema.tips).values(TIPS.map((t, i) => ({ ...t, sort: i })));
  console.log("Startinnehållet finns på plats.");
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
