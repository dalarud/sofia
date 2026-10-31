import Link from "next/link";
import { asc, desc, gte, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { kr, today } from "@/lib/money";
import { Done, Head, dateSv, type SP } from "@/admin/ui";
import { EventFields } from "@/admin/EventFields";
import { createEvent } from "@/admin/event-actions";

export default async function Events({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [coming, past] = await Promise.all([
    db.select().from(schema.events).where(gte(schema.events.date, today())).orderBy(asc(schema.events.date)),
    db.select().from(schema.events).where(lt(schema.events.date, today())).orderBy(desc(schema.events.date)).limit(20),
  ]);
  const row = (e: typeof coming[number]) => (
    <tr key={e.id}>
      <td>{dateSv(e.date)}<br /><span className="a-muted a-small">{e.time}</span></td>
      <td><Link href={`/admin/hemsidan/kurser/${e.id}`}>{e.title}</Link>{!e.active ? <span className="a-pill" style={{ marginLeft: ".4rem" }}>Dold</span> : null}<br /><span className="a-muted a-small">{e.label} · {e.place}</span></td>
      <td className="num">{e.kind === "oppen" ? "–" : `${e.booked} / ${e.seats}`}</td>
      <td className="num">{e.priceOre ? kr(e.priceOre) : "Gratis"}</td>
    </tr>
  );
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Kurser" title={<>Kurser och <em>öppet hus.</em></>} lede="Bokningar och betalningar sköts på hemsidan. Här ser du vilka som kommer."><Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link></Head>
      <div className="a-table-wrap"><table className="a-table">
        <thead><tr><th>När</th><th>Vad</th><th className="num">Bokade</th><th className="num">Pris</th></tr></thead>
        <tbody>{coming.length ? coming.map(row) : <tr><td colSpan={4} className="a-muted">Inga kommande tillfällen. Lägg till ett nedan.</td></tr>}</tbody>
      </table></div>
      <details className="a-card" style={{ marginTop: "1.4rem" }}><summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>+ Nytt tillfälle</h2></summary>
        <form action={createEvent} className="a-stack" style={{ marginTop: "1rem" }}><EventFields /><button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Lägg till</button></form>
      </details>
      {past.length ? <details className="a-more" style={{ marginTop: "1.4rem" }}><summary>Tidigare tillfällen</summary><table className="a-table"><tbody>{past.map(row)}</tbody></table></details> : null}
    </>
  );
}
