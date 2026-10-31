import Link from "next/link";
import { accountNames, createVerification } from "@/lib/ledger";
import { TEMPLATES, bookTemplate, redeemGiftCard, type TemplateId } from "@/lib/books";
import { kr, parseKr, today } from "@/lib/money";
import { act, ore, str } from "@/admin/form";
import { Done, Head, one, type SP } from "@/admin/ui";

async function template(f: FormData) {
  "use server";
  await act("/admin/bokforing/ny", async () => {
    const v = await bookTemplate(str(f, "mall") as TemplateId, ore(f, "amount") ?? 0, str(f, "date") || today(), str(f, "text"));
    return `Bokfört som verifikation ${v.number}.`;
  });
}
async function giftcard(f: FormData) {
  "use server";
  await act("/admin/bokforing/ny", async () => {
    const { v, left } = await redeemGiftCard(str(f, "code"), ore(f, "amount") ?? 0, str(f, "date") || today(), str(f, "kind") === "goods" ? "goods" : "service");
    return `Bokfört som verifikation ${v.number}. Kvar på kortet: ${kr(left)}.`;
  });
}
async function manual(f: FormData) {
  "use server";
  await act("/admin/bokforing/ny", async () => {
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const account = Number(str(f, `acc${i}`));
      const d = parseKr(str(f, `d${i}`)) ?? 0, c = parseKr(str(f, `c${i}`)) ?? 0;
      if (!account || (!d && !c)) continue;
      rows.push({ account, debitOre: d, creditOre: c });
    }
    const names = await accountNames();
    for (const r of rows) if (!names.has(r.account)) throw new Error(`Konto ${r.account} finns inte i kontoplanen`);
    const v = await createVerification({ date: str(f, "date") || today(), text: str(f, "text") || "Manuell verifikation", source: "manuell", rows });
    return `Bokfört som verifikation ${v.number}.`;
  });
}

export default async function NewVerification({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const chosen = one(sp.mall);
  const names = await accountNames();
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Bokföring" title={<>Bokför <em>något annat.</em></>} lede="Välj det som stämmer. Du behöver inte kunna några kontonummer.">
        <Link className="a-btn a-btn--quiet" href="/admin/bokforing">Tillbaka</Link>
      </Head>
      <div className="a-stack">
        {(Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][]).map(([id, t]) => (
          <details key={id} className="a-card" open={chosen === id}>
            <summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>{t.label}</h2></summary>
            <form action={template} className="a-stack" style={{ marginTop: ".8rem" }}>
              <p className="a-muted">{t.hint}</p>
              <input type="hidden" name="mall" value={id} />
              <div className="a-grid a-grid--3">
                <label className="a-field"><span>Belopp (kr)</span><input name="amount" inputMode="decimal" required /></label>
                <label className="a-field"><span>Datum</span><input type="date" name="date" defaultValue={today()} /></label>
                <label className="a-field"><span>Text (valfri)</span><input name="text" placeholder={t.label} /></label>
              </div>
              <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Bokför</button>
            </form>
          </details>
        ))}
        <details className="a-card" open={chosen === "presentkort"}>
          <summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>Någon använder ett presentkort</h2></summary>
          <form action={giftcard} className="a-stack" style={{ marginTop: ".8rem" }}>
            <p className="a-muted">När kunden betalar en kurs, en konsultation eller ett köp i ateljén med presentkort. Saldot på kortet minskar och försäljningen bokförs med moms.</p>
            <div className="a-grid a-grid--3">
              <label className="a-field"><span>Kod</span><input name="code" required placeholder="SD-XXXX-XXXX" style={{ textTransform: "uppercase" }} /></label>
              <label className="a-field"><span>Belopp som används (kr)</span><input name="amount" inputMode="decimal" required /></label>
              <label className="a-field"><span>Datum</span><input type="date" name="date" defaultValue={today()} /></label>
            </div>
            <div className="seg"><label><input type="radio" name="kind" value="service" defaultChecked />Tjänst eller kurs</label><label><input type="radio" name="kind" value="goods" />Något från ateljén</label></div>
            <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Bokför</button>
          </form>
        </details>
        <details className="a-card">
          <summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>Fri verifikation</h2> <span className="a-muted a-small">för den som kan bokföring</span></summary>
          <form action={manual} className="a-stack" style={{ marginTop: ".8rem" }}>
            <div className="a-grid a-grid--2">
              <label className="a-field"><span>Datum</span><input type="date" name="date" defaultValue={today()} /></label>
              <label className="a-field"><span>Text</span><input name="text" required /></label>
            </div>
            <datalist id="konton">{[...names.entries()].map(([n, name]) => <option key={n} value={n}>{name}</option>)}</datalist>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="ver-row">
                <label className="a-field"><span>Konto</span><input name={`acc${i}`} list="konton" inputMode="numeric" /></label>
                <label className="a-field"><span>Debet</span><input name={`d${i}`} inputMode="decimal" /></label>
                <label className="a-field"><span>Kredit</span><input name={`c${i}`} inputMode="decimal" /></label>
                <span />
              </div>
            ))}
            <p className="a-muted a-small">Debet och kredit måste bli lika mycket, annars sparas inget.</p>
            <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Bokför</button>
          </form>
        </details>
      </div>
    </>
  );
}
