import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { categoryById } from "@/lib/categories";
import { reopenReceipt } from "@/lib/receipts";
import { kr, today } from "@/lib/money";
import { act, int } from "@/admin/form";
import { Done, Head, dateSv, type SP } from "@/admin/ui";
import { ReceiptUpload } from "@/admin/Upload";

async function reopen(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/kvitton/fokus?id=${id}`, async () => { await reopenReceipt(id, today()); return "Bokföringen är ångrad med en rättelse. Gör om kvittot här."; });
}

export default async function Receipts({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.receipts).orderBy(desc(schema.receipts.id)).limit(200);
  const todo = all.filter((r) => r.status === "att_gora");
  const done = all.filter((r) => r.status === "bokford");
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Kvitton" title={<>Fota direkt, <em>bokför sen.</em></>} lede="Ta en bild på kvittot när du får det. När du har en stund tar du dem ett i taget i fokusläget." />
      <ReceiptUpload />
      {todo.length ? (
        <section className="a-card a-stack" style={{ marginTop: "1.6rem" }}>
          <div className="a-row" style={{ justifyContent: "space-between" }}>
            <h2>{todo.length === 1 ? "1 kvitto att bokföra" : `${todo.length} kvitton att bokföra`}</h2>
            <Link className="a-btn a-btn--big" href="/admin/kvitton/fokus">Ta dem ett i taget</Link>
          </div>
          <div className="thumbs">
            {todo.map((r) => (
              <Link key={r.id} className="thumb" href={`/admin/kvitton/fokus?id=${r.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.fileId ? <img src={`/api/filer/${r.fileId}`} alt="" loading="lazy" /> : <span className="thumb__pdf">?</span>}
                <span className="a-small a-muted">Sparat {dateSv(r.createdAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section style={{ marginTop: "2rem" }} className="a-stack">
        <h2>Bokförda</h2>
        {done.length ? (
          <div className="a-table-wrap"><table className="a-table">
            <thead><tr><th>Datum</th><th>Var</th><th>Kategori</th><th className="num">Belopp</th><th className="num">Moms</th><th></th></tr></thead>
            <tbody>{done.map((r) => (
              <tr key={r.id}>
                <td>{dateSv(r.date)}</td>
                <td>{r.supplier || "–"}{r.paidWith === "privat" ? <span className="a-pill" style={{ marginLeft: ".4rem" }}>privat kort</span> : null}</td>
                <td>{categoryById(r.category)?.label ?? r.category}</td>
                <td className="num">{kr(r.amountOre ?? 0)}</td>
                <td className="num">{kr(r.vatOre ?? 0)}</td>
                <td className="a-row" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                  {r.fileId ? <a className="a-btn a-btn--quiet" href={`/api/filer/${r.fileId}`} target="_blank" rel="noopener">Visa</a> : null}
                  <form action={reopen}><input type="hidden" name="id" value={r.id} /><button className="a-btn a-btn--quiet" type="submit">Ändra</button></form>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <p className="a-muted">Inga bokförda kvitton än.</p>}
        <p className="a-muted a-small">Kvitton betalda med privat kort bokförs som att du har lagt in pengar i företaget. Du kan föra över motsvarande belopp till dig själv som ett eget uttag.</p>
      </section>
    </>
  );
}
