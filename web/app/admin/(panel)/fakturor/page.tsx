import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { kr, today } from "@/lib/money";
import { Done, Head, dateSv, type SP } from "@/admin/ui";
import { INVOICE_STATUS } from "@/admin/invoice-shared";

export default async function Invoices({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt)).limit(300);
  const open = all.filter((i) => i.status === "skickad");
  const unpaid = open.reduce((s, i) => s + i.totalOre, 0);
  const overdue = open.filter((i) => i.dueDate < today());
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Fakturor" title={<>Skicka, <em>få betalt.</em></>} lede="För uppdrag som rumsstyling och homestaging. Köp i webbutiken sköts automatiskt och syns under Ordrar.">
        <Link className="a-btn a-btn--big" href="/admin/fakturor/ny">Ny faktura</Link>
      </Head>
      {open.length ? (
        <div className="a-grid a-grid--3" style={{ marginBottom: "1.6rem" }}>
          <div className="a-card stat"><b>{kr(unpaid)}</b><span>väntar på betalning ({open.length} st)</span></div>
          <div className="a-card stat"><b>{overdue.length}</b><span>har passerat förfallodagen</span></div>
        </div>
      ) : null}
      {all.length ? (
        <div className="a-table-wrap"><table className="a-table">
          <thead><tr><th>Nr</th><th>Kund</th><th>Datum</th><th>Förfaller</th><th className="num">Belopp</th><th>Status</th></tr></thead>
          <tbody>{all.map((i) => {
            const st = INVOICE_STATUS[i.status];
            const late = i.status === "skickad" && i.dueDate < today();
            return (
              <tr key={i.id}>
                <td><Link href={`/admin/fakturor/${i.id}`}>{i.number ?? "–"}</Link></td>
                <td><Link href={`/admin/fakturor/${i.id}`}>{i.customer.name}</Link></td>
                <td>{dateSv(i.date)}</td>
                <td>{dateSv(i.dueDate)}</td>
                <td className="num">{kr(i.totalOre)}</td>
                <td><span className={`a-pill ${late ? "a-pill--warn" : st.cls}`}>{late ? "Försenad" : st.label}</span></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      ) : <div className="a-card calm"><p className="a-hand">Inga fakturor än.</p><p className="a-muted">När ett uppdrag är klart skapar du fakturan här. Tjänsterna från hemsidan finns som snabbval.</p></div>}
    </>
  );
}
