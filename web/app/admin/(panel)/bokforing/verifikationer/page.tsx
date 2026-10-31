import Link from "next/link";
import { accountNames, correctVerification, verificationsForYear } from "@/lib/ledger";
import { kr, today } from "@/lib/money";
import { act, int, str } from "@/admin/form";
import { Done, Head, dateSv, one, type SP } from "@/admin/ui";

const SOURCE: Record<string, string> = { order: "Webbutik", faktura: "Faktura", kvitto: "Kvitto", stripe: "Stripe", manuell: "Manuell", rattelse: "Rättelse", moms: "Moms" };

async function correct(f: FormData) {
  "use server";
  const year = int(f, "year");
  await act(`/admin/bokforing/verifikationer?ar=${year}`, async () => {
    const reason = str(f, "reason");
    if (!reason) throw new Error("Skriv kort varför den rättas");
    const v = await correctVerification(int(f, "id"), reason, today());
    return `Rättad med verifikation ${v.number}. Bokför sedan det som är rätt.`;
  });
}

export default async function Verifications({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const year = Number(one(sp.ar)) || Number(today().slice(0, 4));
  const [vers, names] = await Promise.all([verificationsForYear(year), accountNames()]);
  const list = [...vers].reverse();
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow={`Bokföring · ${year}`} title={<>Alla <em>verifikationer.</em></>} lede="En verifikation kan aldrig ändras eller tas bort, så kräver bokföringslagen. Blev något fel rättar du den, och då bokförs den omvänt.">
        <Link className="a-btn a-btn--quiet" href={`/admin/bokforing?ar=${year}`}>Tillbaka</Link>
      </Head>
      {list.length ? (
        <ul className="a-stack" style={{ listStyle: "none", padding: 0 }}>
          {list.map((v) => (
            <li key={v.id} className="a-card a-stack" style={{ gap: ".6rem", opacity: v.correctedById ? 0.6 : 1 }}>
              <div className="a-row" style={{ justifyContent: "space-between" }}>
                <span><b>Ver {v.number}</b> · {dateSv(v.date)} · {v.text}</span>
                <span className="a-row" style={{ gap: ".4rem" }}>
                  <span className="a-pill">{SOURCE[v.source] ?? v.source}</span>
                  {v.correctedById ? <span className="a-pill a-pill--warn">Rättad</span> : null}
                  {v.fileId ? <a className="a-btn a-btn--quiet" href={`/api/filer/${v.fileId}`} target="_blank" rel="noopener">Underlag</a> : null}
                </span>
              </div>
              <table className="a-table a-small"><tbody>
                {v.rows.map((r) => <tr key={r.id}><td>{r.account} {names.get(r.account)}</td><td className="num">{r.debitOre ? kr(r.debitOre, { decimals: true }) : ""}</td><td className="num">{r.creditOre ? kr(r.creditOre, { decimals: true }) : ""}</td></tr>)}
              </tbody></table>
              {!v.correctedById && v.source !== "rattelse" ? (
                <details className="a-more"><summary>Rätta</summary>
                  <form action={correct} className="a-row" style={{ alignItems: "flex-end", marginTop: ".5rem" }}>
                    <input type="hidden" name="id" value={v.id} /><input type="hidden" name="year" value={year} />
                    <label className="a-field" style={{ flex: 1 }}><span>Varför?</span><input name="reason" required placeholder="T.ex. fel belopp" /></label>
                    <button className="a-btn a-btn--danger" type="submit">Rätta verifikationen</button>
                  </form>
                  {v.source === "kvitto" ? <p className="a-small a-muted" style={{ marginTop: ".4rem" }}>Tips: kvitton rättar du enklast under Kvitton → Ändra, så får du göra om det direkt.</p> : null}
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      ) : <p className="a-muted">Inga verifikationer {year} än.</p>}
    </>
  );
}
