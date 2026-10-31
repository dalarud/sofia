import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSetting, setSetting, type AccountingSettings, type Company, type GiftType, type ShopSettings, type SiteSettings } from "@/lib/content";
import { mailConfigured } from "@/lib/mail";
import { stripeConfigured, stripeMock, siteUrl } from "@/lib/stripe";
import { saveFile } from "@/lib/receipts";
import { kr } from "@/lib/money";
import { act, bool, int, ore, oreToKr, str } from "@/admin/form";
import { Done, Head, dateSv, type SP } from "@/admin/ui";

const back = "/admin/installningar";

async function saveCompany(f: FormData) {
  "use server";
  await act(back, async () => {
    const c: Company = { name: str(f, "name"), owner: str(f, "owner"), orgNr: str(f, "orgNr"), vatNr: str(f, "vatNr"), fSkatt: bool(f, "fSkatt"), address: str(f, "address"),
      email: str(f, "email"), phone: str(f, "phone"), instagram: str(f, "instagram"), bankgiro: str(f, "bankgiro"), swish: str(f, "swish") };
    if (!c.name || !c.email) throw new Error("Företagsnamn och e-post behövs");
    await setSetting("company", c);
    return "Företagsuppgifterna är sparade.";
  });
}
async function saveAccounting(f: FormData) {
  "use server";
  await act(back, async () => {
    const a = await getSetting<AccountingSettings>("accounting");
    const vatPeriod = (["ar", "kvartal", "manad"].includes(str(f, "vatPeriod")) ? str(f, "vatPeriod") : a.vatPeriod) as AccountingSettings["vatPeriod"];
    await setSetting("accounting", { ...a, vatPeriod, vatDueDate: str(f, "vatDueDate"), paymentTermsDays: Math.min(120, Math.max(0, int(f, "paymentTermsDays", 30))), nextInvoiceNumber: Math.max(1, int(f, "nextInvoiceNumber", a.nextInvoiceNumber)) });
    return "Sparat.";
  });
}
async function saveShop(f: FormData) {
  "use server";
  await act(back, async () => {
    const s: ShopSettings = { shippingOre: ore(f, "shipping") ?? 0, freeShippingFromOre: ore(f, "freeFrom") ?? 0, pickup: bool(f, "pickup") };
    await setSetting("shop", s);
    const gifts: GiftType[] = str(f, "gifts").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [kind, amount] = l.split("|").map((x) => x.trim());
      return { kind, amountOre: amount ? Math.round(Number(amount.replace(/\s|kr/g, "").replace(",", ".")) * 100) || 0 : 0 };
    });
    if (gifts.length) await setSetting("gifts", gifts);
    return "Butiksinställningarna är sparade.";
  });
}
async function savePortrait(f: FormData) {
  "use server";
  await act(back, async () => {
    const img = f.get("portrait");
    const site = (await getSetting<SiteSettings>("site")) ?? {};
    if (bool(f, "remove")) { await setSetting("site", { ...site, portraitImageId: null }); return "Porträttet är borttaget. Teckningen visas i stället."; }
    if (!(img instanceof File) || !img.size) throw new Error("Välj en bild");
    if (!img.type.startsWith("image/")) throw new Error("Det måste vara en bild");
    await setSetting("site", { ...site, portraitImageId: await saveFile(img, true) });
    return "Porträttet är uppladdat.";
  });
}

export default async function Settings({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [c, a, s, g, site, cards] = await Promise.all([getSetting<Company>("company"), getSetting<AccountingSettings>("accounting"), getSetting<ShopSettings>("shop"), getSetting<GiftType[]>("gifts"), getSetting<SiteSettings>("site").then((x) => x ?? {}),
    db.select().from(schema.giftCards).orderBy(desc(schema.giftCards.createdAt)).limit(50)]);
  const status = [
    { ok: stripeConfigured(), label: "Betalningar (Stripe)", text: stripeConfigured() ? "Kopplat. Kunder kan betala med kort, Klarna och Swish om det är påslaget i Stripe." : stripeMock() ? "Testläge: köp räknas som betalda direkt. Lägg in Stripe-nycklarna innan sidan går live." : "Inte kopplat än. Se instruktionen i README." },
    { ok: mailConfigured(), label: "E-post (Resend)", text: mailConfigured() ? "Kopplat. Orderbekräftelser och fakturor skickas automatiskt." : "Inte kopplat. Kunderna får kvitto från Stripe, och fakturor laddar du ner och skickar själv." },
  ];
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Inställningar" title={<>Det som sällan <em>ändras.</em></>} lede="Fyll i en gång, sen behöver du sällan komma hit." />
      <div className="a-stack">
        <section className="a-card a-stack">
          <h2>Kopplingar</h2>
          <ul className="a-list">{status.map((x) => <li key={x.label} className="a-row"><span className={`a-pill ${x.ok ? "a-pill--ok" : "a-pill--warn"}`}>{x.ok ? "Klart" : "Saknas"}</span><span><b>{x.label}.</b> <span className="a-muted">{x.text}</span></span></li>)}</ul>
          <p className="a-small a-muted">Webbadress: {siteUrl()} · Stripe skickar betalningar till {siteUrl()}/api/stripe/webhook</p>
        </section>

        <form action={saveCompany} className="a-card a-stack">
          <h2>Företaget</h2>
          <p className="a-muted a-small">Visas på fakturor, presentkort och i sidfoten.</p>
          <div className="a-grid a-grid--2">
            <label className="a-field"><span>Företagsnamn</span><input name="name" defaultValue={c.name} required /></label>
            <label className="a-field"><span>Ditt namn</span><input name="owner" defaultValue={c.owner} /></label>
            <label className="a-field"><span>Organisationsnummer</span><input name="orgNr" defaultValue={c.orgNr} placeholder="ÅÅMMDD-XXXX" /></label>
            <label className="a-field"><span>Momsregistreringsnummer</span><input name="vatNr" defaultValue={c.vatNr} placeholder="SEÅÅMMDDXXXX01" /></label>
            <label className="a-field"><span>Adress</span><input name="address" defaultValue={c.address} /></label>
            <label className="a-field"><span>E-post</span><input name="email" type="email" defaultValue={c.email} required /></label>
            <label className="a-field"><span>Telefon</span><input name="phone" defaultValue={c.phone} /></label>
            <label className="a-field"><span>Instagram</span><input name="instagram" defaultValue={c.instagram} /></label>
            <label className="a-field"><span>Bankgiro</span><input name="bankgiro" defaultValue={c.bankgiro} /></label>
            <label className="a-field"><span>Swish (företag)</span><input name="swish" defaultValue={c.swish} /></label>
          </div>
          <label className="a-check"><input type="checkbox" name="fSkatt" defaultChecked={c.fSkatt} />Jag har F-skatt</label>
          <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Spara</button>
        </form>

        <form action={saveAccounting} className="a-card a-stack">
          <h2>Fakturor och moms</h2>
          <div className="a-grid a-grid--2">
            <label className="a-field"><span>Dagar att betala</span><input name="paymentTermsDays" inputMode="numeric" defaultValue={a.paymentTermsDays} /></label>
            <label className="a-field"><span>Nästa fakturanummer</span><input name="nextInvoiceNumber" inputMode="numeric" defaultValue={a.nextInvoiceNumber} /><small>Används bara om det är högre än det senaste numret.</small></label>
            <label className="a-field"><span>Momsdeklaration</span><select name="vatPeriod" defaultValue={a.vatPeriod}><option value="ar">En gång om året</option><option value="kvartal">Varje kvartal</option><option value="manad">Varje månad</option></select></label>
            <label className="a-field"><span>Nästa momsdeklaration senast</span><input type="date" name="vatDueDate" defaultValue={a.vatDueDate} /></label>
          </div>
          <p className="a-muted a-small">Bokföringen följer kontantmetoden: en faktura bokförs när den betalas.</p>
          <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Spara</button>
        </form>

        <form action={saveShop} className="a-card a-stack">
          <h2>Webbutiken</h2>
          <div className="a-grid a-grid--3">
            <label className="a-field"><span>Frakt (kr)</span><input name="shipping" inputMode="decimal" defaultValue={oreToKr(s.shippingOre)} /></label>
            <label className="a-field"><span>Fri frakt från (kr)</span><input name="freeFrom" inputMode="decimal" defaultValue={oreToKr(s.freeShippingFromOre)} /></label>
            <label className="a-check" style={{ alignSelf: "end" }}><input type="checkbox" name="pickup" defaultChecked={s.pickup} />Kunder kan hämta i ateljén</label>
          </div>
          <label className="a-field"><span>Presentkort, ett per rad: Namn | belopp (0 = kunden väljer)</span><textarea name="gifts" defaultValue={g.map((x) => `${x.kind} | ${oreToKr(x.amountOre)}`).join("\n")} /></label>
          <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Spara</button>
        </form>

        <form action={savePortrait} className="a-card a-stack">
          <h2>Porträtt på hemsidan</h2>
          <div className="a-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {site.portraitImageId ? <img src={`/api/filer/${site.portraitImageId}`} alt="" style={{ width: "7rem", height: "9rem", objectFit: "cover", borderRadius: 10 }} /> : <span className="a-muted">Nu visas en akvarellteckning.</span>}
            <label className="a-field"><span>Ny bild</span><input type="file" name="portrait" accept="image/*" /></label>
            {site.portraitImageId ? <label className="a-check"><input type="checkbox" name="remove" />Ta bort och visa teckningen</label> : null}
          </div>
          <button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Spara</button>
        </form>

        <section className="a-card a-stack">
          <h2>Sålda presentkort</h2>
          {cards.length ? <div className="a-table-wrap"><table className="a-table"><thead><tr><th>Kod</th><th>Typ</th><th>Till</th><th className="num">Kvar</th><th>Gäller till</th></tr></thead>
            <tbody>{cards.map((x) => <tr key={x.code}><td><a href={`/api/presentkort/${x.code}`} target="_blank" rel="noopener">{x.code}</a></td><td>{x.kind}</td><td>{x.toName ?? ""}</td><td className="num">{kr(x.balanceOre)} av {kr(x.amountOre)}</td><td>{dateSv(x.expiresAt)}</td></tr>)}</tbody></table></div>
            : <p className="a-muted">Inga sålda än.</p>}
          <p className="a-muted a-small">När någon använder ett presentkort: Bokföring → Bokför något annat → Någon använder ett presentkort.</p>
        </section>

        <section className="a-card a-stack">
          <h2>Lösenord</h2>
          <p className="a-muted a-small">Lösenordet ligger som en miljövariabel hos Vercel (ADMIN_PASSWORD_HASH). Kör <code>npm run admin:password</code> för att göra ett nytt, och byt värdet i Vercel. Se README.</p>
        </section>
      </div>
    </>
  );
}
