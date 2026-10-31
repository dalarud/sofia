import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSetting, type Company } from "@/lib/content";
import { act, str, int } from "@/admin/form";
import { Done, Head, dateSv, one, type SP } from "@/admin/ui";

const STATUS: Record<string, { label: string; cls: string }> = { ny: { label: "Ny", cls: "a-pill--warn" }, kontaktad: { label: "Kontaktad", cls: "a-pill--accent" }, klar: { label: "Klar", cls: "a-pill--ok" } };

async function update(f: FormData) {
  "use server";
  await act(`/admin/forfragningar${str(f, "back")}`, async () => {
    const status = str(f, "status");
    const patch: { status?: string; note?: string } = {};
    if (["ny", "kontaktad", "klar"].includes(status)) patch.status = status;
    if (f.has("note")) patch.note = str(f, "note").slice(0, 2000);
    await db.update(schema.leads).set(patch).where(eq(schema.leads.id, int(f, "id")));
    return status === "kontaktad" ? "Markerad som kontaktad." : status === "klar" ? "Markerad som klar." : "Sparat.";
  });
}

export default async function Leads({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const showAll = one(sp.visa) === "alla";
  const [all, company] = await Promise.all([db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(300), getSetting<Company>("company")]);
  const leads = showAll ? all : all.filter((l) => l.status !== "klar");
  const back = showAll ? "?visa=alla" : "";
  const first = (company.owner || "Sofia").split(" ")[0];
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Förfrågningar" title={<>Någon vill ha <em>din hjälp.</em></>} lede="Från kontaktformuläret på hemsidan. Svara med ett förslag på tid för ett första samtal, det räcker.">
        <Link className="a-btn a-btn--ghost" href={showAll ? "/admin/forfragningar" : "/admin/forfragningar?visa=alla"}>{showAll ? "Dölj klara" : "Visa även klara"}</Link>
      </Head>
      {leads.length ? (
        <ul className="a-stack" style={{ listStyle: "none", padding: 0 }}>
          {leads.map((l) => {
            const st = STATUS[l.status] ?? STATUS.ny;
            const subject = encodeURIComponent(`Din förfrågan om ${l.service.toLowerCase()}`);
            const body = encodeURIComponent(`Hej ${l.name.split(" ")[0]}!\n\nTack för att du hörde av dig. Jag skulle gärna höra mer om ditt hem. Passar det med ett kort samtal på telefon eller video, till exempel [dag och tid]?\n\nVänliga hälsningar\n${first}`);
            return (
              <li key={l.id} className="a-card a-stack">
                <div className="a-row" style={{ justifyContent: "space-between" }}>
                  <h3>{l.name} · {l.service}</h3>
                  <span className={`a-pill ${st.cls}`}>{st.label}</span>
                </div>
                <p className="a-muted a-small">{dateSv(l.createdAt)} · <a href={`mailto:${l.email}`}>{l.email}</a></p>
                {l.pains.length ? <p className="a-row a-small">{l.pains.map((p) => <span key={p} className="a-pill">{p}</span>)}</p> : null}
                {l.message ? <p style={{ whiteSpace: "pre-line" }}>{l.message}</p> : null}
                <div className="a-row">
                  {l.status === "ny" ? (
                    <>
                      <a className="a-btn" href={`mailto:${l.email}?subject=${subject}&body=${body}`}>Svara med e-post</a>
                      <form action={update}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="back" value={back} /><input type="hidden" name="status" value="kontaktad" /><button className="a-btn a-btn--ghost" type="submit">Jag har svarat</button></form>
                    </>
                  ) : null}
                  {l.status === "kontaktad" ? (
                    <>
                      <Link className="a-btn" href={`/admin/fakturor/ny?forfragan=${l.id}`}>Skapa faktura</Link>
                      <form action={update}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="back" value={back} /><input type="hidden" name="status" value="klar" /><button className="a-btn a-btn--ghost" type="submit">Klar</button></form>
                    </>
                  ) : null}
                  {l.status === "klar" ? <form action={update}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="back" value={back} /><input type="hidden" name="status" value="kontaktad" /><button className="a-btn a-btn--quiet" type="submit">Öppna igen</button></form> : null}
                </div>
                <details className="a-more"><summary>Anteckningar{l.note ? ` (${l.note.length > 30 ? l.note.slice(0, 30) + "…" : l.note})` : ""}</summary>
                  <form action={update} className="a-stack" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="back" value={back} />
                    <label className="a-field"><span>Vad har ni pratat om? Vad är nästa steg?</span><textarea name="note" defaultValue={l.note} /></label>
                    <button className="a-btn a-btn--ghost" type="submit" style={{ justifySelf: "start" }}>Spara anteckning</button>
                  </form>
                </details>
              </li>
            );
          })}
        </ul>
      ) : <div className="a-card calm"><p className="a-hand">Inga nya förfrågningar.</p><p className="a-muted">När någon fyller i formuläret på hemsidan hamnar det här, och syns på Idag.</p></div>}
    </>
  );
}
