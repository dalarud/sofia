// Körs mot den lokala testdatabasen (DATABASE_URL). Hoppas över om ingen databas finns.
import { afterAll, describe, expect, it } from "vitest";
import { db, pool, schema } from "../src/db";
import { correctVerification, createVerification, rowsBetween } from "../src/lib/ledger";
import { expenseRows } from "../src/lib/rules";
import { balances } from "../src/lib/reports";
import { eq } from "drizzle-orm";

const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("verifikationer i databasen", () => {
  afterAll(async () => { await pool.end(); });

  it("numrerar per år och rättar utan att ändra originalet", async () => {
    // Eget, slumpat testår: verifikationer kan inte raderas, så varje körning behöver ett tomt år.
    const year = 2100 + Math.floor(Math.random() * 7000);
    const a = await createVerification({ date: `${year}-03-01`, text: "Test kvitto", source: "kvitto", rows: expenseRows({ grossOre: 12500, vatOre: 2500, account: 4010, paidWith: "foretag" }) });
    const b = await createVerification({ date: `${year}-03-02`, text: "Test kvitto 2", source: "kvitto", rows: expenseRows({ grossOre: 1000, vatOre: 200, account: 6110, paidWith: "privat" }) });
    expect(b.number).toBe(a.number + 1);

    const c = await correctVerification(a.id, "fel belopp", `${year}-03-05`);
    expect(c.number).toBe(b.number + 1);
    const [orig] = await db.select().from(schema.verifications).where(eq(schema.verifications.id, a.id));
    expect(orig.correctedById).toBe(c.id);

    const bal = balances(await rowsBetween(`${year}-01-01`, `${year}-12-31`));
    expect(bal.get(4010)).toBe(0);
    expect(bal.get(6110)).toBe(800);
  });

  it("databasen vägrar ändra eller radera en verifikation", async () => {
    const v = await createVerification({ date: "2091-04-01", text: "Låst", source: "manuell", rows: expenseRows({ grossOre: 500, vatOre: 100, account: 6110, paidWith: "foretag" }) });
    await expect(db.update(schema.verifications).set({ text: "ändrad" }).where(eq(schema.verifications.id, v.id))).rejects.toThrow();
    await expect(db.delete(schema.verificationRows).where(eq(schema.verificationRows.verificationId, v.id))).rejects.toThrow();
  });

  it("vägrar verifikationer som inte balanserar", async () => {
    await expect(createVerification({ date: "2091-05-01", text: "Fel", source: "manuell", rows: [{ account: 1930, debitOre: 100, creditOre: 0 }] })).rejects.toThrow(/balanserar/);
  });
});
