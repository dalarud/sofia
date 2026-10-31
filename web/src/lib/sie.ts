/**
 * Export i SIE typ 4, formatet som svenska bokföringsprogram och redovisningsbyråer läser in.
 * Filen kodas i PC8 (teckentabell 437) enligt SIE-standarden.
 */
import iconv from "iconv-lite";

export type SieVerification = { number: number; date: string; text: string; rows: { account: number; debitOre: number; creditOre: number }[] };
export type SieInput = {
  companyName: string;
  orgNr?: string;
  year: number;
  generated: string; // YYYY-MM-DD
  accounts: { number: number; name: string }[];
  openingBalances: Map<number, number>; // ingående balans för konto 1000–2999 (debet minus kredit)
  verifications: SieVerification[];
};

const q = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ")}"`;
const d = (iso: string) => iso.replace(/-/g, "");
const amt = (ore: number) => (ore / 100).toFixed(2);

export function sieText(input: SieInput): string {
  const out: string[] = [];
  out.push("#FLAGGA 0", `#PROGRAM ${q("Studio Dalarud")} 1.0`, "#FORMAT PC8", `#GEN ${d(input.generated)}`, "#SIETYP 4");
  out.push(`#FNAMN ${q(input.companyName)}`);
  if (input.orgNr) out.push(`#ORGNR ${input.orgNr.replace(/\D/g, "")}`);
  out.push(`#RAR 0 ${input.year}0101 ${input.year}1231`, "#KPTYP BAS2014");
  for (const a of [...input.accounts].sort((x, y) => x.number - y.number)) out.push(`#KONTO ${a.number} ${q(a.name)}`);

  const closing = new Map<number, number>(input.openingBalances);
  const result = new Map<number, number>();
  for (const v of input.verifications) for (const r of v.rows) {
    const target = r.account < 3000 ? closing : result;
    target.set(r.account, (target.get(r.account) ?? 0) + r.debitOre - r.creditOre);
  }
  for (const [acc, bal] of [...input.openingBalances.entries()].sort((a, b) => a[0] - b[0])) if (bal) out.push(`#IB 0 ${acc} ${amt(bal)}`);
  for (const [acc, bal] of [...closing.entries()].sort((a, b) => a[0] - b[0])) if (bal) out.push(`#UB 0 ${acc} ${amt(bal)}`);
  for (const [acc, bal] of [...result.entries()].sort((a, b) => a[0] - b[0])) if (bal) out.push(`#RES 0 ${acc} ${amt(bal)}`);

  for (const v of [...input.verifications].sort((a, b) => a.number - b.number)) {
    out.push(`#VER "A" ${v.number} ${d(v.date)} ${q(v.text)} ${d(v.date)}`, "{");
    for (const r of v.rows) out.push(`   #TRANS ${r.account} {} ${amt(r.debitOre - r.creditOre)}`);
    out.push("}");
  }
  return out.join("\r\n") + "\r\n";
}

export function sieFile(input: SieInput): Buffer {
  return iconv.encode(sieText(input), "cp437");
}
