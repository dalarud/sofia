import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, bool, int, str } from "@/admin/form";
import { Done, Head, type SP } from "@/admin/ui";

const back = "/admin/hemsidan/tips";
function values(f: FormData) {
  const v = { category: str(f, "category"), title: str(f, "title"), body: str(f, "body"), sort: int(f, "sort"), active: bool(f, "active") };
  if (!v.title || !v.body) throw new Error("Tipset behöver en rubrik och en text");
  return v;
}
async function save(f: FormData) { "use server"; await act(back, async () => { await db.update(schema.tips).set(values(f)).where(eq(schema.tips.id, int(f, "id"))); return "Tipset är sparat."; }); }
async function create(f: FormData) { "use server"; await act(back, async () => { await db.insert(schema.tips).values(values(f)); return "Tipset är tillagt."; }); }
async function remove(f: FormData) { "use server"; await act(back, async () => { await db.delete(schema.tips).where(eq(schema.tips.id, int(f, "id"))); return "Tipset är borttaget."; }); }

type T = typeof schema.tips.$inferSelect;
function Fields({ t }: { t?: T }) {
  return (
    <>
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Rubrik</span><input name="title" defaultValue={t?.title} required /></label>
        <label className="a-field"><span>Kategori</span><input name="category" defaultValue={t?.category ?? "Ro-modellen · Överblick"} /></label>
      </div>
      <label className="a-field"><span>Text</span><textarea name="body" defaultValue={t?.body} /></label>
      <div className="a-row"><label className="a-field" style={{ width: "7rem" }}><span>Ordning</span><input name="sort" inputMode="numeric" defaultValue={t?.sort ?? 0} /></label><label className="a-check"><input type="checkbox" name="active" defaultChecked={t?.active ?? true} />Visas på hemsidan</label></div>
    </>
  );
}

export default async function Tips({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.tips).orderBy(asc(schema.tips.sort), asc(schema.tips.id));
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Tips" title={<>Små steg mot <em>ro.</em></>} lede="Korta tips som visar hur du tänker. Ett nytt tips i månaden räcker gott, och det kan bli ett inlägg på Instagram samtidigt."><Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link></Head>
      <div className="a-stack">
        {all.map((t) => (
          <details key={t.id} className="a-card"><summary style={{ cursor: "pointer" }} className="a-row"><h2 style={{ display: "inline" }}>{t.title}</h2><span className="a-muted a-small">{t.category}</span>{!t.active ? <span className="a-pill">Dold</span> : null}</summary>
            <form action={save} className="a-stack" style={{ marginTop: "1rem" }}><input type="hidden" name="id" value={t.id} /><Fields t={t} />
              <div className="a-row"><button className="a-btn" type="submit">Spara</button><button className="a-btn a-btn--quiet" formAction={remove} type="submit">Ta bort</button></div></form>
          </details>
        ))}
        <details className="a-card" open={!all.length}><summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>+ Nytt tips</h2></summary>
          <form action={create} className="a-stack" style={{ marginTop: "1rem" }}><Fields /><button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Lägg till</button></form>
        </details>
      </div>
    </>
  );
}
