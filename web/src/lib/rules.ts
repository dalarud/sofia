/**
 * Konteringsregler: hur olika händelser blir bokföringsrader. Rena funktioner utan databas,
 * så att de kan testas noggrant. Alla belopp i öre.
 */
import { vatFromGross } from "./money";

export type Row = { account: number; debitOre: number; creditOre: number };

export const ACC = {
  kundfordringar: 1510,
  stripe: 1580,
  bank: 1930,
  egetUttag: 2013,
  egenInsattning: 2018,
  forskott: 2420,
  ingaendeMoms: 2641,
  momsRedovisning: 2650,
  varor: 3001,
  tjanster: 3041,
  tjansterMomsfri: 3045,
  frakt: 3521,
  oresutjamning: 3740,
  bankkostnader: 6570,
} as const;

const OUTPUT_VAT: Record<number, number> = { 25: 2611, 12: 2621, 6: 2631 };

export type SaleLine = {
  grossOre: number;
  vatRate: number;
  /** varor, tjänster (kurser, konsultationer), frakt eller presentkort */
  kind: "goods" | "service" | "shipping" | "gift";
};

function revenueAccount(line: SaleLine): number {
  if (line.kind === "gift") return ACC.forskott;
  if (line.kind === "shipping") return ACC.frakt;
  if (line.kind === "goods") return ACC.varor;
  return line.vatRate === 0 ? ACC.tjansterMomsfri : ACC.tjanster;
}

/** Slår ihop rader per konto och tar bort tomma. */
export function compact(rows: Row[]): Row[] {
  const by = new Map<number, Row>();
  for (const r of rows) {
    const cur = by.get(r.account) ?? { account: r.account, debitOre: 0, creditOre: 0 };
    cur.debitOre += r.debitOre;
    cur.creditOre += r.creditOre;
    by.set(r.account, cur);
  }
  return [...by.values()]
    .map((r) => (r.debitOre >= r.creditOre ? { account: r.account, debitOre: r.debitOre - r.creditOre, creditOre: 0 } : { account: r.account, debitOre: 0, creditOre: r.creditOre - r.debitOre }))
    .filter((r) => r.debitOre !== 0 || r.creditOre !== 0)
    .sort((a, b) => a.account - b.account);
}

export function isBalanced(rows: Row[]): boolean {
  const d = rows.reduce((s, r) => s + r.debitOre, 0);
  const c = rows.reduce((s, r) => s + r.creditOre, 0);
  return d === c && d > 0 && rows.every((r) => r.debitOre >= 0 && r.creditOre >= 0 && Number.isInteger(r.debitOre) && Number.isInteger(r.creditOre));
}

/**
 * En försäljning. Betalningen hamnar på debetkontot: 1580 när Stripe tar betalt,
 * 1930 när kunden betalar till företagskontot. Presentkort är en skuld (förskott) utan moms
 * tills det används, eftersom det kan lösas in mot både varor och tjänster.
 */
export function saleRows(lines: SaleLine[], debitAccount: number): Row[] {
  const rows: Row[] = [];
  let total = 0;
  for (const l of lines) {
    if (l.grossOre === 0) continue;
    const rate = l.kind === "gift" ? 0 : l.vatRate;
    const vat = vatFromGross(l.grossOre, rate);
    total += l.grossOre;
    rows.push({ account: revenueAccount(l), debitOre: 0, creditOre: l.grossOre - vat });
    if (vat) {
      const acc = OUTPUT_VAT[rate];
      if (!acc) throw new Error(`Momssatsen ${rate} % stöds inte`);
      rows.push({ account: acc, debitOre: 0, creditOre: vat });
    }
  }
  rows.push({ account: debitAccount, debitOre: total, creditOre: 0 });
  return compact(rows);
}

/** Ett kvitto: kostnaden utan moms, ingående moms, och varifrån pengarna kom. */
export function expenseRows(input: { grossOre: number; vatOre: number; account: number; paidWith: "foretag" | "privat" }): Row[] {
  const { grossOre, vatOre, account, paidWith } = input;
  if (grossOre <= 0) throw new Error("Beloppet måste vara större än noll");
  if (vatOre < 0 || vatOre >= grossOre) throw new Error("Momsen ser inte rimlig ut");
  return compact([
    { account, debitOre: grossOre - vatOre, creditOre: 0 },
    { account: ACC.ingaendeMoms, debitOre: vatOre, creditOre: 0 },
    { account: paidWith === "privat" ? ACC.egenInsattning : ACC.bank, debitOre: 0, creditOre: grossOre },
  ]);
}

/** Stripes avgift för ett köp dras från det Stripe ska betala ut. Stripes avgifter har ingen svensk moms. */
export function stripeFeeRows(feeOre: number): Row[] {
  return feeOre > 0 ? [{ account: ACC.bankkostnader, debitOre: feeOre, creditOre: 0 }, { account: ACC.stripe, debitOre: 0, creditOre: feeOre }] : [];
}

/** Stripe betalar ut till företagskontot. */
export function payoutRows(amountOre: number): Row[] {
  return [{ account: ACC.bank, debitOre: amountOre, creditOre: 0 }, { account: ACC.stripe, debitOre: 0, creditOre: amountOre }];
}

/** Rättelse: samma rader med debet och kredit omvända. */
export function reverseRows(rows: Row[]): Row[] {
  return rows.map((r) => ({ account: r.account, debitOre: r.creditOre, creditOre: r.debitOre }));
}

/** Momsavräkning: nollställer momskontona för perioden och för över till redovisningskontot 2650. */
export function vatSettlementRows(balances: Map<number, number>): Row[] {
  const rows: Row[] = [];
  for (const acc of [2611, 2621, 2631, 2641]) {
    const bal = balances.get(acc) ?? 0; // debet minus kredit
    if (bal > 0) rows.push({ account: acc, debitOre: 0, creditOre: bal });
    if (bal < 0) rows.push({ account: acc, debitOre: -bal, creditOre: 0 });
  }
  const sumD = rows.reduce((s, r) => s + r.debitOre, 0);
  const sumC = rows.reduce((s, r) => s + r.creditOre, 0);
  if (sumD > sumC) rows.push({ account: ACC.momsRedovisning, debitOre: 0, creditOre: sumD - sumC });
  if (sumC > sumD) rows.push({ account: ACC.momsRedovisning, debitOre: sumC - sumD, creditOre: 0 });
  return compact(rows);
}
