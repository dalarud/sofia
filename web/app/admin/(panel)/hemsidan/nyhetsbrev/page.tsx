import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, str } from "@/admin/form";
import { Done, Head, dateSv, type SP } from "@/admin/ui";

async function unsubscribe(f: FormData) {
  "use server";
  await act("/admin/hemsidan/nyhetsbrev", async () => {
    await db.update(schema.subscribers).set({ unsubscribedAt: new Date(), newsletter: false }).where(eq(schema.subscribers.email, str(f, "email")));
    return "Borttagen från listan.";
  });
}

export default async function Newsletter({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
  const active = all.filter((s) => !s.unsubscribedAt);
  const letter = active.filter((s) => s.newsletter);
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Guiden och nyhetsbrevet" title={<>{active.length} personer <em>vill höra mer.</em></>} lede={`${letter.length} av dem har sagt ja till nyhetsbrevet. Bara de får nyhetsbrev, de andra har bara laddat ner guiden.`}>
        <Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link>
      </Head>
      <div className="a-row" style={{ marginBottom: "1.4rem" }}>
        <a className="a-btn" href="/api/admin/prenumeranter?bara=nyhetsbrev">Ladda ner nyhetsbrevslistan (CSV)</a>
        <a className="a-btn a-btn--ghost" href="/guide-lugnare-barnrum.pdf" target="_blank" rel="noopener">Öppna guiden</a>
      </div>
      <p className="a-muted a-small" style={{ marginBottom: "1rem" }}>Listan kan läsas in i till exempel Mailchimp eller Brevo när du skickar nyhetsbrev. Den som ber att bli borttagen tar du bort här.</p>
      <div className="a-table-wrap"><table className="a-table">
        <thead><tr><th>E-post</th><th>Sedan</th><th>Nyhetsbrev</th><th></th></tr></thead>
        <tbody>{active.map((s) => (
          <tr key={s.email}><td>{s.email}</td><td>{dateSv(s.createdAt)}</td><td>{s.newsletter ? <span className="a-pill a-pill--ok">Ja</span> : <span className="a-pill">Bara guiden</span>}</td>
            <td><form action={unsubscribe}><input type="hidden" name="email" value={s.email} /><button className="a-btn a-btn--quiet" type="submit">Ta bort</button></form></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
