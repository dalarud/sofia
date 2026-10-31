import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { kr } from "@/lib/money";
import { act, str } from "@/admin/form";
import { Done, Head, dateSv, one, type SP } from "@/admin/ui";
import Link from "next/link";

const STATUS: Record<string, { label: string; cls: string }> = {
  betald: { label: "Att skicka", cls: "a-pill--warn" }, skickad: { label: "Skickad", cls: "a-pill--accent" }, klar: { label: "Klar", cls: "a-pill--ok" },
  avbruten: { label: "Avbruten", cls: "" }, aterbetald: { label: "Återbetald", cls: "" },
};

async function setStatus(f: FormData) {
  "use server";
  await act("/admin/ordrar", async () => {
    const status = str(f, "status");
    if (!["skickad", "klar", "betald"].includes(status)) throw new Error("Okänd status");
    await db.update(schema.orders).set({ status, handledAt: status === "betald" ? null : new Date() }).where(eq(schema.orders.id, str(f, "id")));
    return status === "skickad" ? "Bra! Ordern är markerad som skickad." : status === "klar" ? "Markerad som klar." : "Flyttad tillbaka till att skicka.";
  });
}
async function saveNote(f: FormData) {
  "use server";
  await act("/admin/ordrar?visa=alla", async () => {
    await db.update(schema.orders).set({ note: str(f, "note").slice(0, 500) }).where(eq(schema.orders.id, str(f, "id")));
    return "Anteckningen är sparad.";
  });
}

export default async function Orders({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const showAll = one(sp.visa) === "alla";
  const orders = await db.select().from(schema.orders).where(showAll ? undefined : inArray(schema.orders.status, ["betald"])).orderBy(desc(schema.orders.createdAt)).limit(200);
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Ordrar" title={showAll ? <>Alla <em>ordrar.</em></> : <>Att <em>skicka.</em></>} lede="Köp från webbutiken. Betalningen och bokföringen är redan klar, du behöver bara packa och skicka.">
        <Link className="a-btn a-btn--ghost" href={showAll ? "/admin/ordrar" : "/admin/ordrar?visa=alla"}>{showAll ? "Bara de som ska skickas" : "Visa alla ordrar"}</Link>
      </Head>
      {orders.length ? (
        <ul className="a-stack" style={{ listStyle: "none", padding: 0 }}>
          {orders.map((o) => {
            const st = STATUS[o.status] ?? { label: o.status, cls: "" };
            const physical = o.items.some((i) => i.kind === "product");
            return (
              <li key={o.id} className="a-card a-stack">
                <div className="a-row" style={{ justifyContent: "space-between" }}>
                  <h3>Order {o.number} · {o.customerName || o.email}</h3>
                  <span className={`a-pill ${st.cls}`}>{st.label}</span>
                </div>
                <div className="a-grid a-grid--2">
                  <table className="a-table"><tbody>
                    {o.items.map((i, k) => <tr key={k}><td>{i.name}{i.qty > 1 ? ` × ${i.qty}` : ""}</td><td className="num">{kr(i.unitOre * i.qty)}</td></tr>)}
                    <tr><td><b>Totalt</b></td><td className="num"><b>{kr(o.totalOre)}</b></td></tr>
                  </tbody></table>
                  <div className="a-small">
                    <p className="a-muted">{dateSv(o.createdAt)} · {o.email}{o.phone ? ` · ${o.phone}` : ""}</p>
                    {o.delivery === "post" && o.address ? <p style={{ marginTop: ".5rem", whiteSpace: "pre-line" }}><b>Skickas till</b><br />{[o.customerName, o.address.line1, o.address.line2, `${o.address.postalCode} ${o.address.city}`].filter(Boolean).join("\n")}</p> : null}
                    {o.delivery === "hamtning" ? <p style={{ marginTop: ".5rem" }}><b>Hämtas i ateljén.</b> Hör av dig när det är klart.</p> : null}
                    {!physical ? <p style={{ marginTop: ".5rem" }} className="a-muted">Inget att skicka: kurs eller presentkort. Presentkortet har kunden redan fått.</p> : null}
                  </div>
                </div>
                <div className="a-row">
                  {o.status === "betald" ? (
                    <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={physical && o.delivery !== "hamtning" ? "skickad" : "klar"} />
                      <button className="a-btn" type="submit">{physical && o.delivery === "post" ? "Paketet är skickat" : physical ? "Hämtad, klar" : "Klar"}</button></form>
                  ) : null}
                  {o.status === "skickad" ? <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="klar" /><button className="a-btn a-btn--ghost" type="submit">Markera som klar</button></form> : null}
                  {o.status === "skickad" || o.status === "klar" ? <form action={setStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="betald" /><button className="a-btn a-btn--quiet" type="submit">Ångra</button></form> : null}
                  <details className="a-more"><summary>Anteckning{o.note ? ": " + o.note.slice(0, 40) : ""}</summary>
                    <form action={saveNote} className="a-row" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={o.id} /><input className="a-input" name="note" defaultValue={o.note ?? ""} style={{ width: "min(100%, 24rem)" }} /><button className="a-btn a-btn--ghost" type="submit">Spara</button></form>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="a-card calm"><p className="a-hand">Inget att skicka just nu.</p><p className="a-muted">Nya köp dyker upp här direkt när kunden har betalat.</p></div>
      )}
      <p className="a-muted a-small" style={{ marginTop: "1.4rem" }}>Behöver en kund få pengarna tillbaka? Gör återbetalningen i Stripe, så bokförs den här automatiskt.</p>
    </>
  );
}
