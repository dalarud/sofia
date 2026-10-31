/** Rapporter som räknas fram ur verifikationsraderna. Rena funktioner. */
import type { Row } from "./rules";

export type LedgerRow = Row & { date: string };

/** Saldo per konto (debet minus kredit). */
export function balances(rows: Row[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) m.set(r.account, (m.get(r.account) ?? 0) + r.debitOre - r.creditOre);
  return m;
}

export type VatReport = {
  ruta05: number; // momspliktig försäljning utan moms
  ruta42: number; // övrig försäljning (momsfri)
  ruta10: number; ruta11: number; ruta12: number; // utgående moms 25, 12, 6 %
  ruta48: number; // ingående moms att dra av
  ruta49: number; // moms att betala (positivt) eller få tillbaka (negativt)
};

/**
 * Momsrapport med samma rutor som Skatteverkets momsdeklaration.
 * Rader från momsavräkningar (konto 2650) ska vara bortfiltrerade innan, annars blir allt noll.
 */
export function vatReport(rows: Row[]): VatReport {
  const b = balances(rows);
  const credit = (acc: number) => -(b.get(acc) ?? 0);
  const ruta05 = credit(3001) + credit(3041) + credit(3521);
  const ruta42 = credit(3045);
  const ruta10 = credit(2611), ruta11 = credit(2621), ruta12 = credit(2631);
  const ruta48 = b.get(2641) ?? 0;
  return { ruta05, ruta42, ruta10, ruta11, ruta12, ruta48, ruta49: ruta10 + ruta11 + ruta12 - ruta48 };
}

export type IncomeStatement = { income: number; costs: number; result: number; byAccount: { account: number; amount: number }[] };

/** Resultat: intäkter (klass 3) minus kostnader (klass 4–8). */
export function incomeStatement(rows: Row[]): IncomeStatement {
  const b = balances(rows);
  let income = 0, costs = 0;
  const byAccount: { account: number; amount: number }[] = [];
  for (const [acc, bal] of [...b.entries()].sort((x, y) => x[0] - y[0])) {
    if (acc >= 3000 && acc < 4000) { income += -bal; byAccount.push({ account: acc, amount: -bal }); }
    if (acc >= 4000 && acc < 9000) { costs += bal; byAccount.push({ account: acc, amount: bal }); }
  }
  return { income, costs, result: income - costs, byAccount };
}
