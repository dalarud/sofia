import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, bool, int, str } from "@/admin/form";
import { Done, Head, type SP } from "@/admin/ui";

const back = "/admin/hemsidan/tjanster";
function values(f: FormData) {
  const items = str(f, "items").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, ...price] = l.split("|");
    return { label: label.trim(), price: price.join("|").trim() };
  });
  const name = str(f, "name");
  if (!name) throw new Error("Tjänsten behöver ett namn");
  return { name, short: str(f, "short"), priceFrom: str(f, "priceFrom"), body: str(f, "body"), badge: str(f, "badge") || null, items,
    contactLabel: str(f, "contactLabel") || "Boka", tone: ["surface", "clay", "moss"].includes(str(f, "tone")) ? str(f, "tone") : "surface", sort: int(f, "sort"), active: bool(f, "active") };
}
async function save(f: FormData) {
  "use server";
  await act(back, async () => { await db.update(schema.services).set(values(f)).where(eq(schema.services.id, int(f, "id"))); return "Tjänsten är sparad."; });
}
async function create(f: FormData) {
  "use server";
  await act(back, async () => { await db.insert(schema.services).values(values(f)); return "Tjänsten är tillagd."; });
}
async function remove(f: FormData) {
  "use server";
  await act(back, async () => { await db.delete(schema.services).where(eq(schema.services.id, int(f, "id"))); return "Tjänsten är borttagen."; });
}

type S = typeof schema.services.$inferSelect;
function Fields({ s }: { s?: S }) {
  return (
    <>
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Namn</span><input name="name" defaultValue={s?.name} required /></label>
        <label className="a-field"><span>Kort beskrivning</span><input name="short" defaultValue={s?.short} /></label>
        <label className="a-field"><span>Pris från</span><input name="priceFrom" defaultValue={s?.priceFrom} placeholder="från 1 495 kr" /></label>
        <label className="a-field"><span>Etikett (valfri)</span><input name="badge" defaultValue={s?.badge ?? ""} placeholder="T.ex. Populärast" /></label>
      </div>
      <label className="a-field"><span>Text</span><textarea name="body" defaultValue={s?.body} /></label>
      <label className="a-field"><span>Vad ingår och priser, en per rad: Namn | pris</span><textarea name="items" defaultValue={(s?.items ?? []).map((i) => `${i.label} | ${i.price}`).join("\n")} placeholder={"Konsultation hemma, 2 timmar | 1 495 kr"} /></label>
      <div className="a-grid a-grid--3">
        <label className="a-field"><span>Knapptext</span><input name="contactLabel" defaultValue={s?.contactLabel ?? "Boka"} /></label>
        <label className="a-field"><span>Färg</span><select name="tone" defaultValue={s?.tone ?? "surface"}><option value="surface">Linne</option><option value="clay">Lera</option><option value="moss">Mossa</option></select></label>
        <label className="a-field"><span>Ordning</span><input name="sort" inputMode="numeric" defaultValue={s?.sort ?? 0} /></label>
      </div>
      <label className="a-check"><input type="checkbox" name="active" defaultChecked={s?.active ?? true} />Visas på hemsidan</label>
    </>
  );
}

export default async function Services({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.services).orderBy(asc(schema.services.sort), asc(schema.services.id));
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Tjänster" title={<>Det du <em>erbjuder.</em></>}><Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link></Head>
      <div className="a-stack">
        {all.map((s) => (
          <details key={s.id} className="a-card">
            <summary style={{ cursor: "pointer" }} className="a-row"><h2 style={{ display: "inline" }}>{s.name}</h2> <span className="a-muted">{s.priceFrom}</span> {!s.active ? <span className="a-pill">Dold</span> : null}</summary>
            <form action={save} className="a-stack" style={{ marginTop: "1rem" }}>
              <input type="hidden" name="id" value={s.id} /><Fields s={s} />
              <div className="a-row"><button className="a-btn" type="submit">Spara</button><button className="a-btn a-btn--quiet" formAction={remove} type="submit">Ta bort</button></div>
            </form>
          </details>
        ))}
        <details className="a-card"><summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>+ Ny tjänst</h2></summary>
          <form action={create} className="a-stack" style={{ marginTop: "1rem" }}><Fields /><button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Lägg till</button></form>
        </details>
      </div>
    </>
  );
}
