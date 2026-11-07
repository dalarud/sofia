import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { amountDue, creditInvoice, getInvoice, markInvoicePaid, markRutPaid, rutLabor, sendInvoice } from "@/lib/invoices";
import { mailConfigured, sendMail } from "@/lib/mail";
import { stripeConfigured } from "@/lib/stripe";
import { getSetting, type Company } from "@/lib/content";
import { invoicePdf } from "@/lib/pdf";
import { kr, today } from "@/lib/money";
import { act, int, str } from "@/admin/form";
import { Done, Head, dateSv, type SP } from "@/admin/ui";
import { INVOICE_STATUS } from "@/admin/invoice-shared";
import { esc } from "@/site/render";

async function send(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/fakturor/${id}`, async () => {
    const { mailed } = await sendInvoice(id);
    return mailed ? "Fakturan är skickad med e-post." : "Fakturan har fått sitt nummer. Ladda ner PDF:en och skicka den till kunden.";
  });
}
async function paid(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/fakturor/${id}`, async () => {
    await markInvoicePaid(id, str(f, "date") || today(), str(f, "via") === "swish" ? "swish" : "bank");
    return "Markerad som betald och bokförd. Pengarna är dina!";
  });
}
async function rutPaid(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/fakturor/${id}`, async () => {
    const amount = Math.round(Number(str(f, "amount").replace(/\s/g, "").replace(",", ".")) * 100);
    const from = str(f, "from") === "kunden" ? "kunden" : "skatteverket";
    await markRutPaid(id, str(f, "date") || today(), amount, from);
    return from === "kunden" ? "Mellanskillnaden är bokförd." : "Rutavdraget är bokfört. Fordran på Skatteverket är borta.";
  });
}
async function credit(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/fakturor/${id}`, async () => { await creditInvoice(id, today()); return "Fakturan är krediterad. Ladda ner kreditfakturan och skicka den till kunden."; });
}
async function remove(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act("/admin/fakturor", async () => {
    const inv = await getInvoice(id);
    if (inv.status !== "utkast") throw new Error("Bara utkast kan tas bort");
    await db.delete(schema.invoices).where(eq(schema.invoices.id, id));
    return "Utkastet är borttaget.";
  });
}
async function remind(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/fakturor/${id}`, async () => {
    const inv = await getInvoice(id);
    if (!inv.customer.email) throw new Error("Kunden har ingen e-postadress på fakturan");
    const company = await getSetting<Company>("company");
    const ok = await sendMail({
      to: inv.customer.email, replyTo: company.email, subject: `Påminnelse: faktura ${inv.number}`,
      attachments: [{ filename: `faktura-${inv.number}.pdf`, content: await invoicePdf({ ...inv, number: inv.number! }, company) }],
      html: `<p>Hej ${esc(inv.customer.name.split(" ")[0])}!</p><p>En vänlig påminnelse om faktura ${inv.number} på ${kr(amountDue(inv))} som förföll ${inv.dueDate}. Har du redan betalat kan du bortse från det här.</p>${inv.payUrl ? `<p><a href="${inv.payUrl}">Betala med kort eller Klarna</a></p>` : ""}<p>Hälsningar<br>Sofia</p>`,
    });
    if (!ok) throw new Error("E-posten kunde inte skickas");
    return "Påminnelsen är skickad.";
  });
}

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const sp = await searchParams;
  const inv = await getInvoice(Number((await params).id)).catch(() => null);
  if (!inv) notFound();
  const st = INVOICE_STATUS[inv.status];
  const late = inv.status === "skickad" && inv.dueDate < today();
  const pdf = `/api/admin/fakturor/${inv.id}/pdf`;
  const hidden = <input type="hidden" name="id" value={inv.id} />;
  const rutLeft = inv.rutOre - inv.rutPaidOre;
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow={`Faktura ${inv.number ?? "(utkast)"}`} title={<>{inv.customer.name}</>} lede={<><span className={`a-pill ${late ? "a-pill--warn" : st.cls}`}>{late ? "Försenad" : st.label}</span> {kr(amountDue(inv))}{inv.rutOre ? " efter rutavdrag" : ""} · förfaller {dateSv(inv.dueDate)}</>}>
        <Link className="a-btn a-btn--quiet" href="/admin/fakturor">Alla fakturor</Link>
      </Head>

      <div className="a-grid a-grid--2" style={{ alignItems: "start" }}>
        <section className="a-card a-stack">
          {inv.status === "utkast" ? (
            <>
              <h2>Nästa steg: <em>skicka</em></h2>
              <p className="a-muted">När du skickar får fakturan nästa nummer i serien och kan inte längre ändras.{inv.customer.email && mailConfigured() ? ` Den mejlas till ${inv.customer.email}.` : " Du laddar ner PDF:en och skickar den själv."}{stripeConfigured() ? " Kunden får en länk för att betala med kort eller Klarna." : ""}</p>
              <form action={send}>{hidden}<button className="a-btn a-btn--big" type="submit">Skicka fakturan</button></form>
              <div className="a-row"><Link className="a-btn a-btn--ghost" href={`/admin/fakturor/${inv.id}/andra`}>Ändra</Link><a className="a-btn a-btn--ghost" href={pdf} target="_blank" rel="noopener">Förhandsgranska PDF</a>
                <form action={remove}>{hidden}<button className="a-btn a-btn--quiet" type="submit">Ta bort utkastet</button></form></div>
            </>
          ) : null}
          {inv.status === "skickad" ? (
            <>
              <h2>Har pengarna <em>kommit?</em></h2>
              <p className="a-muted">Kolla på företagskontot. Kunden ska betala {kr(amountDue(inv))}{inv.rutOre ? ` (summan ${kr(inv.totalOre)} minus rutavdraget ${kr(inv.rutOre)})` : ""}. Betalningar med betallänken registreras automatiskt.</p>
              <form action={paid} className="a-stack">{hidden}
                <div className="a-row">
                  <label className="a-field"><span>Betalningsdag</span><input type="date" name="date" defaultValue={today()} /></label>
                  <div className="a-field"><span>Hur?</span><div className="seg"><label><input type="radio" name="via" value="bank" defaultChecked />Bankgiro/konto</label><label><input type="radio" name="via" value="swish" />Swish</label></div></div>
                </div>
                <button className="a-btn a-btn--big" type="submit">Ja, den är betald</button>
              </form>
              <hr className="a-sep" />
              <div className="a-row">
                <a className="a-btn a-btn--ghost" href={pdf} target="_blank" rel="noopener">Ladda ner PDF</a>
                {late && mailConfigured() && inv.customer.email ? <form action={remind}>{hidden}<button className="a-btn a-btn--ghost" type="submit">Skicka vänlig påminnelse</button></form> : null}
                <form action={credit}>{hidden}<button className="a-btn a-btn--quiet" type="submit">Kreditera</button></form>
              </div>
              {inv.payUrl ? <p className="a-small a-muted">Betallänk: <a href={inv.payUrl}>{inv.payUrl}</a></p> : null}
            </>
          ) : null}
          {inv.status === "betald" ? (
            <>
              <p className="a-hand" style={{ color: "var(--ok)" }}>Betald {dateSv(inv.paidAt)}.</p>
              <p className="a-muted">Bokförd automatiskt{inv.paidVia === "stripe" ? " via betallänken" : ""}.{rutLeft > 0 ? "" : " Inget mer att göra."}</p>
              {rutLeft > 0 ? (
                <div className="a-card a-stack" style={{ background: "var(--a-surface-2, transparent)" }}>
                  <h3>Begär rutavdraget</h3>
                  <p className="a-muted a-small">Logga in på Skatteverkets e-tjänst Rot och rut för företag och fyll i uppgifterna nedan. Skatteverket betalar till företagskontot, oftast inom några veckor.</p>
                  <table className="a-table"><tbody>
                    <tr><td>Köparens personnummer</td><td className="num">{inv.customer.pnr || <span style={{ color: "var(--warn, #9B5E49)" }}>saknas</span>}</td></tr>
                    <tr><td>Fakturanummer</td><td className="num">{inv.number}</td></tr>
                    <tr><td>Betalningsdag</td><td className="num">{inv.paidAt}</td></tr>
                    <tr><td>Pris för arbetet (rutarbete, inkl. moms)</td><td className="num">{kr(rutLabor(inv.lines))}</td></tr>
                    <tr><td>Betalt belopp för arbetet</td><td className="num">{kr(rutLabor(inv.lines) - inv.rutOre)}</td></tr>
                    <tr><td>Begärt belopp</td><td className="num"><b>{kr(inv.rutOre)}</b></td></tr>
                    <tr><td>Typ av tjänst och timmar</td><td className="num">Se raderna markerade rut</td></tr>
                  </tbody></table>
                  <form action={rutPaid} className="a-stack">{hidden}
                    <div className="a-row">
                      <label className="a-field"><span>Datum</span><input type="date" name="date" defaultValue={today()} /></label>
                      <label className="a-field"><span>Belopp</span><input name="amount" inputMode="decimal" defaultValue={(rutLeft / 100).toFixed(2).replace(".", ",")} /></label>
                      <div className="a-field"><span>Från</span><div className="seg"><label><input type="radio" name="from" value="skatteverket" defaultChecked />Skatteverket</label><label><input type="radio" name="from" value="kunden" />Kunden (mellanskillnad)</label></div></div>
                    </div>
                    <button className="a-btn" type="submit">Pengarna har kommit</button>
                  </form>
                  <p className="a-small a-muted">Betalar Skatteverket mindre än begärt ska kunden betala mellanskillnaden. Skicka ett mejl, och bokför den här när den kommit.</p>
                </div>
              ) : inv.rutOre ? <p className="a-small a-muted">Rutavdraget på {kr(inv.rutOre)} är utbetalt.</p> : null}
              <div className="a-row"><a className="a-btn a-btn--ghost" href={pdf} target="_blank" rel="noopener">Ladda ner PDF</a><form action={credit}>{hidden}<button className="a-btn a-btn--quiet" type="submit">Kreditera (pengar tillbaka)</button></form></div>
            </>
          ) : null}
          {inv.status === "krediterad" ? (
            <>
              <p className="a-muted">Fakturan är krediterad. Skicka kreditfakturan till kunden{inv.paidAt ? " och betala tillbaka beloppet" : ""}.</p>
              <div className="a-row"><a className="a-btn" href={`${pdf}?kredit=1`} target="_blank" rel="noopener">Kreditfaktura (PDF)</a><a className="a-btn a-btn--ghost" href={pdf} target="_blank" rel="noopener">Ursprunglig faktura</a></div>
            </>
          ) : null}
        </section>
        <section className="a-card a-stack">
          <h3>Innehåll</h3>
          <table className="a-table"><tbody>
            {inv.lines.map((l, i) => <tr key={i}><td>{l.text}{l.rut ? <span className="a-pill" style={{ marginLeft: ".4rem" }}>rut</span> : null}{l.qty !== 1 ? ` × ${String(l.qty).replace(".", ",")}` : ""}</td><td className="num">{kr(Math.round(l.unitOre * l.qty))}</td></tr>)}
            <tr><td className="a-muted">Varav moms</td><td className="num a-muted">{kr(inv.vatOre)}</td></tr>
            {inv.rutOre ? <><tr><td>Summa</td><td className="num">{kr(inv.totalOre)}</td></tr><tr><td className="a-muted">Rutavdrag, 50 % av {kr(rutLabor(inv.lines))}</td><td className="num a-muted">−{kr(inv.rutOre)}</td></tr></> : null}
            <tr><td><b>{inv.rutOre ? "Kunden betalar" : "Totalt"}</b></td><td className="num"><b>{kr(amountDue(inv))}</b></td></tr>
          </tbody></table>
          <p className="a-small a-muted">{[inv.customer.email, inv.customer.address?.replace(/\n/g, ", "), inv.customer.orgNr && `Org.nr ${inv.customer.orgNr}`].filter(Boolean).join(" · ")}</p>
        </section>
      </div>
    </>
  );
}
