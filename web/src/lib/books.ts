/** Hjälp för bokföringssidorna: perioder, ingående balanser, export och mallar. */
import { and, eq, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { accountNames, createVerification, rowsBetween, verificationsForYear } from "./ledger";
import { balances } from "./reports";
import { ACC, compact, vatSettlementRows, type Row } from "./rules";
import { getSetting, type AccountingSettings, type Company } from "./content";
import { sieFile } from "./sie";
import { today, vatFromGross } from "./money";

export type Period = { from: string; to: string; label: string; key: string };

export function periodsForYear(year: number, kind: AccountingSettings["vatPeriod"]): Period[] {
  const months = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];
  const last = (m: number) => new Date(Date.UTC(year, m, 0)).getUTCDate();
  const p = (m1: number, m2: number, label: string): Period => {
    const from = `${year}-${String(m1).padStart(2, "0")}-01`, to = `${year}-${String(m2).padStart(2, "0")}-${last(m2)}`;
    return { from, to, label, key: `${from}_${to}` };
  };
  if (kind === "manad") return months.map((m, i) => p(i + 1, i + 1, `${m} ${year}`));
  if (kind === "kvartal") return [1, 2, 3, 4].map((q) => p(q * 3 - 2, q * 3, `kvartal ${q} ${year}`));
  return [p(1, 12, `hela ${year}`)];
}

/** Ingående balans för ett år: balanskontona från tidigare år, med tidigare års resultat på eget kapital. */
export async function openingBalances(year: number): Promise<Map<number, number>> {
  const res = await db.execute(sql`
    select r.account, sum(r.debit_ore - r.credit_ore)::bigint as bal
    from verification_rows r join verifications v on v.id = r.verification_id
    where v.year < ${year} group by r.account`);
  const ib = new Map<number, number>();
  let result = 0;
  for (const row of res.rows as { account: number; bal: string }[]) {
    const bal = Number(row.bal);
    if (row.account < 3000) ib.set(row.account, (ib.get(row.account) ?? 0) + bal);
    else result += bal;
  }
  if (result) ib.set(2010, (ib.get(2010) ?? 0) + result);
  for (const [k, v] of ib) if (!v) ib.delete(k);
  return ib;
}

export async function sieExport(year: number): Promise<Buffer> {
  const [company, vers, names, ib] = await Promise.all([getSetting<Company>("company"), verificationsForYear(year), accountNames(), openingBalances(year)]);
  return sieFile({
    companyName: company.name, orgNr: company.orgNr, year, generated: today(),
    accounts: [...names.entries()].map(([number, name]) => ({ number, name })), openingBalances: ib,
    verifications: vers.map((v) => ({ number: v.number, date: v.date, text: v.text, rows: v.rows })),
  });
}

export async function csvExport(year: number): Promise<string> {
  const [vers, names] = await Promise.all([verificationsForYear(year), accountNames()]);
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = ["Ver;Datum;Text;Konto;Kontonamn;Debet;Kredit"];
  for (const v of vers) for (const r of v.rows)
    lines.push([v.number, v.date, q(v.text), r.account, q(names.get(r.account) ?? ""), (r.debitOre / 100).toFixed(2).replace(".", ","), (r.creditOre / 100).toFixed(2).replace(".", ",")].join(";"));
  return "﻿" + lines.join("\r\n");
}

/** Har momsen för perioden redan förts över till momsredovisningskontot? */
export async function vatSettlement(period: Period) {
  const [v] = await db.select().from(schema.verifications).where(and(eq(schema.verifications.source, "moms"), eq(schema.verifications.sourceRef, `avrakning:${period.key}`)));
  return v && !v.correctedById ? v : null;
}

export async function bookVatSettlement(period: Period) {
  if (await vatSettlement(period)) throw new Error("Momsen för perioden är redan avräknad");
  const rows = await rowsBetween(period.from, period.to, db, { excludeVatSettlement: true });
  const settle = vatSettlementRows(balances(rows));
  if (!settle.length) throw new Error("Det finns ingen moms att avräkna för perioden");
  return createVerification({ date: period.to, text: `Momsavräkning ${period.label}`, source: "moms", sourceRef: `avrakning:${period.key}`, rows: settle });
}

/** Mallar för vanliga händelser, med vardagliga namn. Belopp i öre, alltid positivt. */
export const TEMPLATES = {
  uttag: { label: "Ta ut pengar till mig själv", hint: "När du för över pengar från företagskontot till ditt privata konto. Även när du betalar tillbaka dig själv för kvitton du betalat privat.", rows: (a: number): Row[] => [{ account: ACC.egetUttag, debitOre: a, creditOre: 0 }, { account: ACC.bank, debitOre: 0, creditOre: a }] },
  insattning: { label: "Sätta in egna pengar", hint: "När du för över pengar från ditt privata konto till företaget.", rows: (a: number): Row[] => [{ account: ACC.bank, debitOre: a, creditOre: 0 }, { account: ACC.egenInsattning, debitOre: 0, creditOre: a }] },
  momsbetalning: { label: "Betala momsen till Skatteverket", hint: "När momsen dras från skattekontot eller du betalar in den.", rows: (a: number): Row[] => [{ account: ACC.momsRedovisning, debitOre: a, creditOre: 0 }, { account: ACC.bank, debitOre: 0, creditOre: a }] },
  momsatervinning: { label: "Få tillbaka moms från Skatteverket", hint: "När du har haft mer kostnader än försäljning och får moms tillbaka.", rows: (a: number): Row[] => [{ account: ACC.bank, debitOre: a, creditOre: 0 }, { account: ACC.momsRedovisning, debitOre: 0, creditOre: a }] },
  bankavgift: { label: "Bankavgift", hint: "Månadsavgift för företagskontot eller kortet.", rows: (a: number): Row[] => [{ account: ACC.bankkostnader, debitOre: a, creditOre: 0 }, { account: ACC.bank, debitOre: 0, creditOre: a }] },
  swish: { label: "Swish- eller kontantförsäljning", hint: "Till exempel på en marknad, när betalningen inte gått via hemsidan. 25 % moms.", rows: (a: number): Row[] => { const vat = vatFromGross(a, 25); return [{ account: ACC.bank, debitOre: a, creditOre: 0 }, { account: ACC.varor, debitOre: 0, creditOre: a - vat }, { account: 2611, debitOre: 0, creditOre: vat }]; } },
} as const;
export type TemplateId = keyof typeof TEMPLATES;

export async function bookTemplate(id: TemplateId, amountOre: number, date: string, text: string) {
  const t = TEMPLATES[id];
  if (!t) throw new Error("Okänd mall");
  if (!amountOre || amountOre <= 0) throw new Error("Skriv ett belopp");
  return createVerification({ date, text: text || t.label, source: "manuell", rows: compact(t.rows(amountOre)) });
}

/** Ett presentkort används: skulden minskar och blir försäljning med moms. */
export async function redeemGiftCard(code: string, amountOre: number, date: string, kind: "service" | "goods") {
  return db.transaction(async (t) => {
    const [card] = await t.select().from(schema.giftCards).where(eq(schema.giftCards.code, code.trim().toUpperCase())).for("update");
    if (!card) throw new Error("Det finns inget presentkort med den koden");
    if (amountOre <= 0) throw new Error("Skriv beloppet som används");
    if (amountOre > card.balanceOre) throw new Error(`Det finns bara ${(card.balanceOre / 100).toLocaleString("sv-SE")} kr kvar på kortet`);
    const vat = vatFromGross(amountOre, 25);
    const v = await createVerification({
      date, text: `Presentkort ${card.code} används`, source: "manuell", sourceRef: `presentkort:${card.code}`,
      rows: [{ account: ACC.forskott, debitOre: amountOre, creditOre: 0 }, { account: kind === "goods" ? ACC.varor : ACC.tjanster, debitOre: 0, creditOre: amountOre - vat }, { account: 2611, debitOre: 0, creditOre: vat }],
    }, t);
    await t.update(schema.giftCards).set({ balanceOre: card.balanceOre - amountOre }).where(eq(schema.giftCards.code, card.code));
    return { v, left: card.balanceOre - amountOre };
  });
}

/** Saker att göra vid årets slut, med det som går att räkna fram automatiskt. */
export async function yearEndChecklist(year: number) {
  const end = `${year}-12-31`;
  const [unpaid, expired, receipts] = await Promise.all([
    db.select().from(schema.invoices).where(and(eq(schema.invoices.status, "skickad"), lt(schema.invoices.date, `${year + 1}-01-01`))),
    db.select().from(schema.giftCards).where(and(lt(schema.giftCards.expiresAt, end), sql`${schema.giftCards.balanceOre} > 0`)),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.receipts).where(eq(schema.receipts.status, "att_gora")),
  ]);
  return { unpaid, expired, receiptsTodo: receipts[0].n };
}
