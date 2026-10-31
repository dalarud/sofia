/** Bokföringen i databasen: skapa, rätta och läsa verifikationer. */
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { compact, isBalanced, reverseRows, type Row } from "./rules";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Executor = typeof db | Tx;

export type NewVerification = {
  date: string;
  text: string;
  source: "order" | "faktura" | "kvitto" | "stripe" | "manuell" | "rattelse" | "moms";
  sourceRef?: string;
  rows: Row[];
  fileId?: string | null;
  correctsId?: number;
};

/**
 * Skapar en verifikation med nästa lediga nummer för året. Raderna måste balansera.
 * Körs alltid i en transaktion; skicka med tx om anropet redan är i en.
 */
export async function createVerification(input: NewVerification, tx?: Tx): Promise<{ id: number; number: number; year: number }> {
  const run = async (t: Tx) => {
    const rows = input.correctsId ? input.rows : compact(input.rows);
    if (!isBalanced(rows)) throw new Error("Verifikationen balanserar inte: debet och kredit måste vara lika stora.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Ogiltigt datum");
    const year = Number(input.date.slice(0, 4));
    // Lås numreringen för året så att två samtidiga köp inte får samma nummer.
    await t.execute(sql`select pg_advisory_xact_lock(${7000 + year})`);
    const res = await t.execute(sql`select coalesce(max(number), 0) + 1 as next from verifications where year = ${year}`);
    const number = Number((res.rows[0] as { next: number }).next);
    const [v] = await t.insert(schema.verifications).values({
      year, number, date: input.date, text: input.text.slice(0, 200), source: input.source,
      sourceRef: input.sourceRef ?? null, fileId: input.fileId ?? null, correctsId: input.correctsId ?? null,
    }).returning({ id: schema.verifications.id });
    await t.insert(schema.verificationRows).values(rows.map((r) => ({ verificationId: v.id, ...r })));
    return { id: v.id, number, year };
  };
  return tx ? run(tx) : db.transaction(run);
}

/** Rättar en verifikation genom att bokföra den omvänt. Originalet ligger kvar, markerat som rättat. */
export async function correctVerification(id: number, reason: string, date: string, tx?: Tx) {
  const run = async (t: Tx) => {
    const [orig] = await t.select().from(schema.verifications).where(eq(schema.verifications.id, id));
    if (!orig) throw new Error("Verifikationen finns inte");
    if (orig.correctedById) throw new Error("Verifikationen är redan rättad");
    const rows = await t.select().from(schema.verificationRows).where(eq(schema.verificationRows.verificationId, id));
    const created = await createVerification({
      date, text: `Rättelse av ver ${orig.number}: ${reason}`.slice(0, 200), source: "rattelse", sourceRef: String(orig.id), correctsId: orig.id,
      rows: reverseRows(rows.map((r) => ({ account: r.account, debitOre: r.debitOre, creditOre: r.creditOre }))),
    }, t);
    await t.update(schema.verifications).set({ correctedById: created.id }).where(eq(schema.verifications.id, id));
    return created;
  };
  return tx ? run(tx) : db.transaction(run);
}

/** Alla verifikationsrader mellan två datum (inklusive). */
export async function rowsBetween(from: string, to: string, ex: Executor = db, opts: { excludeVatSettlement?: boolean } = {}) {
  const rows = await ex
    .select({ account: schema.verificationRows.account, debitOre: schema.verificationRows.debitOre, creditOre: schema.verificationRows.creditOre, date: schema.verifications.date, source: schema.verifications.source })
    .from(schema.verificationRows)
    .innerJoin(schema.verifications, eq(schema.verifications.id, schema.verificationRows.verificationId))
    .where(and(gte(schema.verifications.date, from), lte(schema.verifications.date, to)));
  return opts.excludeVatSettlement ? rows.filter((r) => r.source !== "moms") : rows;
}

export async function verificationsForYear(year: number) {
  const vers = await db.select().from(schema.verifications).where(eq(schema.verifications.year, year)).orderBy(asc(schema.verifications.number));
  const rows = vers.length
    ? await db.select().from(schema.verificationRows).where(sql`${schema.verificationRows.verificationId} in (${sql.join(vers.map((v) => sql`${v.id}`), sql`, `)})`)
    : [];
  return vers.map((v) => ({ ...v, rows: rows.filter((r) => r.verificationId === v.id).sort((a, b) => a.account - b.account) }));
}

export async function accountNames(): Promise<Map<number, string>> {
  const all = await db.select().from(schema.accounts);
  return new Map(all.map((a) => [a.number, a.name]));
}
