import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rowsBetween, accountNames } from "@/lib/ledger";
import { balances, incomeStatement } from "@/lib/reports";
import { yearEndChecklist } from "@/lib/books";
import { kr, parseKr, today } from "@/lib/money";
import { Done, Head, one, type SP } from "@/admin/ui";
import { YearPicker } from "@/admin/YearPicker";

export default async function Books({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const thisYear = Number(today().slice(0, 4));
  const year = Number(one(sp.ar)) || thisYear;
  const yrs = await db.execute(sql`select distinct year from verifications order by year`);
  const years = [...new Set([...(yrs.rows as { year: number }[]).map((r) => r.year).filter((y) => y <= thisYear + 1), thisYear])].sort();
  const [yearRows, allRows, names, check] = await Promise.all([
    rowsBetween(`${year}-01-01`, `${year}-12-31`), rowsBetween("1900-01-01", `${year}-12-31`), accountNames(), yearEndChecklist(year),
  ]);
  const res = incomeStatement(yearRows);
  const bal = balances(allRows);
  const bank = bal.get(1930) ?? 0, stripe = bal.get(1580) ?? 0, gift = -(bal.get(2420) ?? 0);
  const vatDebt = -[2611, 2621, 2631, 2641, 2650].reduce((s, a) => s + (bal.get(a) ?? 0), 0);
  const bankActual = parseKr(one(sp.bank));
  const diff = bankActual == null ? null : bankActual - bank;
  const decemberish = today() >= `${year}-11-15` || year < thisYear;

  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Bokföring" title={<>Ordning på <em>siffrorna.</em></>} lede="Det mesta bokförs av sig självt: köp på hemsidan, betalda fakturor och kvitton. Här ser du hur det går och gör resten.">
        <YearPicker year={year} base="/admin/bokforing" years={years} />
      </Head>
      <div className="a-grid a-grid--3">
        <div className="a-card stat"><b>{kr(res.income)}</b><span>intäkter {year}, utan moms</span></div>
        <div className="a-card stat"><b>{kr(res.costs)}</b><span>kostnader {year}</span></div>
        <div className="a-card stat"><b>{kr(res.result)}</b><span>resultat före skatt</span></div>
      </div>
      <div className="a-grid a-grid--2" style={{ marginTop: "1.4rem", alignItems: "start" }}>
        <section className="a-card a-stack">
          <h2>Vad vill du göra?</h2>
          <div className="a-stack" style={{ gap: ".6rem" }}>
            <Link className="a-btn a-btn--ghost" href="/admin/bokforing/moms" style={{ justifyContent: "space-between" }}>Momsen <span>→</span></Link>
            <Link className="a-btn a-btn--ghost" href="/admin/bokforing/ny" style={{ justifyContent: "space-between" }}>Bokför något annat (uttag, insättning, presentkort…) <span>→</span></Link>
            <Link className="a-btn a-btn--ghost" href={`/admin/bokforing/verifikationer?ar=${year}`} style={{ justifyContent: "space-between" }}>Se alla verifikationer <span>→</span></Link>
          </div>
          <hr className="a-sep" />
          <h3>Till redovisningskonsulten</h3>
          <p className="a-muted a-small">SIE-filen kan läsas in i alla svenska bokföringsprogram, till exempel Fortnox, Visma och Bokio. CSV öppnas i Excel.</p>
          <div className="a-row"><a className="a-btn" href={`/api/admin/export?ar=${year}`}>Ladda ner SIE {year}</a><a className="a-btn a-btn--ghost" href={`/api/admin/export?ar=${year}&format=csv`}>CSV</a></div>
        </section>
        <section className="a-card a-stack">
          <h2>Stämmer det?</h2>
          <table className="a-table"><tbody>
            <tr><td>{names.get(1930)} enligt bokföringen</td><td className="num">{kr(bank)}</td></tr>
            <tr><td>Hos Stripe, inte utbetalt än</td><td className="num">{kr(stripe)}</td></tr>
            <tr><td>Moms att betala{vatDebt < 0 ? " (att få tillbaka)" : ""}</td><td className="num">{kr(Math.abs(vatDebt))}</td></tr>
            <tr><td>Presentkort som inte använts än</td><td className="num">{kr(gift)}</td></tr>
          </tbody></table>
          <form className="a-row" style={{ alignItems: "flex-end" }}>
            <input type="hidden" name="ar" value={year} />
            <label className="a-field"><span>Vad står på företagskontot i banken?</span><input name="bank" inputMode="decimal" defaultValue={one(sp.bank)} placeholder="0,00" /></label>
            <button className="a-btn a-btn--ghost" type="submit">Jämför</button>
          </form>
          {diff != null ? (diff === 0
            ? <p className="a-banner" role="status">Det stämmer på öret. Snyggt!</p>
            : <p className="a-banner a-banner--warn" role="status">Det skiljer {kr(Math.abs(diff))}. {diff > 0 ? "Det finns mer på kontot än i bokföringen: har en faktura betalats som inte är markerad, eller en utbetalning från Stripe?" : "Det finns mindre på kontot: finns det kvitton kvar att bokföra, eller en bankavgift?"}</p>) : null}
        </section>
      </div>
      {decemberish ? (
        <section className="a-card a-stack" style={{ marginTop: "1.4rem" }}>
          <h2>Bokslut {year}: <em>checklista</em></h2>
          <ol className="a-stack" style={{ paddingLeft: "1.2rem", margin: 0 }}>
            <li>{check.receiptsTodo ? <><b>{check.receiptsTodo} kvitton</b> väntar på att bokföras. <Link href="/admin/kvitton/fokus">Ta dem nu →</Link></> : <>Alla kvitton är bokförda ✓</>}</li>
            <li>{check.unpaid.length ? <><b>{check.unpaid.length} obetalda fakturor</b> ({kr(check.unpaid.reduce((s, i) => s + i.totalOre, 0))}). Med kontantmetoden ska de bokföras som kundfordringar den 31 december. Be din redovisningskonsult om hjälp, eller markera dem betalda om pengarna redan kommit.</> : <>Inga obetalda fakturor ✓</>}</li>
            <li>{check.expired.length ? <><b>{check.expired.length} presentkort</b> har gått ut med pengar kvar. Det kvarvarande beloppet blir en intäkt.</> : <>Inga utgångna presentkort med saldo ✓</>}</li>
            <li>Gör momsavräkningen för årets sista period under <Link href="/admin/bokforing/moms">Momsen</Link>.</li>
            <li>Kontrollera att företagskontot stämmer med bokföringen den 31 december (rutan ovan).</li>
            <li>Ladda ner SIE-filen och skicka den till din redovisningskonsult, eller använd den för NE-bilagan i din deklaration.</li>
          </ol>
        </section>
      ) : null}
      <details className="a-more" style={{ marginTop: "1.4rem" }}><summary>Resultat per konto {year}</summary>
        <table className="a-table"><tbody>{res.byAccount.map((r) => <tr key={r.account}><td>{r.account} {names.get(r.account)}</td><td className="num">{kr(r.amount)}</td></tr>)}</tbody></table>
      </details>
    </>
  );
}
