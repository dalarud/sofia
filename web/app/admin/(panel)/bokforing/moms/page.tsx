import Link from "next/link";
import { rowsBetween } from "@/lib/ledger";
import { vatReport } from "@/lib/reports";
import { bookVatSettlement, periodsForYear, vatSettlement } from "@/lib/books";
import { getSetting, setSetting, type AccountingSettings } from "@/lib/content";
import { kr, today } from "@/lib/money";
import { act, str } from "@/admin/form";
import { Done, Head, dateSv, one, type SP } from "@/admin/ui";

async function settle(f: FormData) {
  "use server";
  const key = str(f, "period");
  await act(`/admin/bokforing/moms?period=${key}`, async () => {
    const acc = await getSetting<AccountingSettings>("accounting");
    const year = Number(key.slice(0, 4));
    const p = periodsForYear(year, acc.vatPeriod).find((x) => x.key === key);
    if (!p) throw new Error("Okänd period");
    if (p.to > today()) throw new Error("Perioden är inte slut än. Vänta tills den är över.");
    const v = await bookVatSettlement(p);
    return `Momsen är avräknad (verifikation ${v.number}). Nu kan du deklarera.`;
  });
}
async function saveDue(f: FormData) {
  "use server";
  await act("/admin/bokforing/moms", async () => {
    const acc = await getSetting<AccountingSettings>("accounting");
    const vatPeriod = ["ar", "kvartal", "manad"].includes(str(f, "vatPeriod")) ? str(f, "vatPeriod") as AccountingSettings["vatPeriod"] : acc.vatPeriod;
    await setSetting("accounting", { ...acc, vatDueDate: str(f, "vatDueDate"), vatPeriod });
    return "Sparat. Du får en påminnelse på Idag tre veckor innan.";
  });
}

export default async function Vat({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const acc = await getSetting<AccountingSettings>("accounting");
  const now = today();
  const year = Number(now.slice(0, 4));
  const periods = [...periodsForYear(year - 1, acc.vatPeriod), ...periodsForYear(year, acc.vatPeriod)].filter((p) => p.from <= now);
  // Förvalt: en avslutad period som inte är avräknad än och har moms, annars den pågående.
  let pending: (typeof periods)[number] | undefined;
  for (const p of periods.filter((x) => x.to < now).reverse()) {
    const rep = vatReport(await rowsBetween(p.from, p.to, undefined, { excludeVatSettlement: true }));
    if ((rep.ruta49 || rep.ruta05) && !(await vatSettlement(p))) { pending = p; break; }
  }
  const chosen = periods.find((p) => p.key === one(sp.period)) ?? pending ?? periods[periods.length - 1];
  const r = vatReport(await rowsBetween(chosen.from, chosen.to, undefined, { excludeVatSettlement: true }));
  const settled = await vatSettlement(chosen);
  const over = chosen.to < now;
  const rutor: [string, string, number][] = [
    ["05", "Momspliktig försäljning (utan moms)", r.ruta05],
    ["42", "Försäljning utan moms", r.ruta42],
    ["10", "Utgående moms 25 %", r.ruta10],
    ["11", "Utgående moms 12 %", r.ruta11],
    ["12", "Utgående moms 6 %", r.ruta12],
    ["48", "Ingående moms att dra av", r.ruta48],
  ];
  const t = (o: number) => Math.trunc(o / 100) || 0;
  const whole = (o: number) => t(o).toLocaleString("sv-SE");
  // Skatteverket räknar ruta 49 på de avrundade rutorna.
  const r49 = t(r.ruta10) + t(r.ruta11) + t(r.ruta12) - t(r.ruta48);

  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Bokföring · Moms" title={<>Momsen, <em>ruta för ruta.</em></>} lede="Skriv in siffrorna i momsdeklarationen på skatteverket.se. Skatteverket vill ha hela kronor, utan ören.">
        <Link className="a-btn a-btn--quiet" href="/admin/bokforing">Tillbaka</Link>
      </Head>
      <nav className="a-row a-small" style={{ marginBottom: "1.4rem" }} aria-label="Period">
        {periods.map((p) => <Link key={p.key} href={`/admin/bokforing/moms?period=${p.key}`} className={`a-pill ${p.key === chosen.key ? "a-pill--accent" : ""}`}>{p.label}</Link>)}
      </nav>
      <div className="a-grid a-grid--2" style={{ alignItems: "start" }}>
        <section className="a-card a-stack">
          <h2>{chosen.label[0].toUpperCase() + chosen.label.slice(1)}</h2>
          <p className="a-muted a-small">{dateSv(chosen.from)} – {dateSv(chosen.to)}{!over ? " · perioden pågår, siffrorna kan ändras" : ""}</p>
          <table className="a-table"><thead><tr><th>Ruta</th><th>Vad</th><th className="num">Kronor</th></tr></thead>
            <tbody>
              {rutor.filter(([n, , v]) => v !== 0 || ["05", "10", "48"].includes(n)).map(([n, l, v]) => <tr key={n}><td><b>{n}</b></td><td>{l}</td><td className="num">{whole(v)}</td></tr>)}
              <tr><td><b>49</b></td><td><b>{r49 >= 0 ? "Moms att betala" : "Moms att få tillbaka"}</b></td><td className="num"><b>{Math.abs(r49).toLocaleString("sv-SE")}</b></td></tr>
            </tbody>
          </table>
          {r49 !== 0 || r.ruta05 ? null : <p className="a-muted">Ingen försäljning eller moms under perioden. Du ska ändå lämna en deklaration med nollor.</p>}
        </section>
        <section className="a-card a-stack">
          <h2>Steg för steg</h2>
          <ol className="a-stack" style={{ paddingLeft: "1.2rem", margin: 0 }}>
            <li>Bokför alla kvitton för perioden först. <Link href="/admin/kvitton/fokus">Kvitton →</Link></li>
            <li>{settled ? <>Momsen är avräknad ✓ <span className="a-muted a-small">(verifikation {settled.number})</span></> : over ? (
              <form action={settle} className="a-stack"><input type="hidden" name="period" value={chosen.key} />
                <span>Avräkna momsen. Då flyttas beloppen till momsredovisningskontot och perioden blir klar i bokföringen.</span>
                <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Avräkna momsen</button></form>
            ) : <>Avräkna momsen när perioden är slut.</>}</li>
            <li>Logga in på <a href="https://www.skatteverket.se/foretag/moms" target="_blank" rel="noopener">skatteverket.se</a> med BankID och fyll i rutorna till vänster.</li>
            <li>{r49 > 0 ? <>Betala {kr(r49 * 100)} till skattekontot. Bokför betalningen under <Link href="/admin/bokforing/ny?mall=momsbetalning">Betala momsen</Link> när pengarna dragits.</> : r49 < 0 ? <>Pengarna kommer till skattekontot. Bokför det under <Link href="/admin/bokforing/ny?mall=momsatervinning">Få tillbaka moms</Link> när de kommit till företagskontot.</> : <>Inget att betala.</>}</li>
          </ol>
          <hr className="a-sep" />
          <form action={saveDue} className="a-stack">
            <h3>När ska nästa deklaration in?</h3>
            <div className="a-grid a-grid--2">
              <label className="a-field"><span>Datum</span><input type="date" name="vatDueDate" defaultValue={acc.vatDueDate} /><small>Står under Mina sidor på skatteverket.se.</small></label>
              <label className="a-field"><span>Hur ofta?</span><select name="vatPeriod" defaultValue={acc.vatPeriod}><option value="ar">En gång om året</option><option value="kvartal">Varje kvartal</option><option value="manad">Varje månad</option></select></label>
            </div>
            <button className="a-btn a-btn--ghost" type="submit" style={{ justifySelf: "start" }}>Spara</button>
          </form>
        </section>
      </div>
    </>
  );
}
