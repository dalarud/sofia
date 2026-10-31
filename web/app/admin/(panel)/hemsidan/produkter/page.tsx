import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, bool, int, ore, oreToKr, str } from "@/admin/form";
import { Done, Head, type SP } from "@/admin/ui";
import { saveFile } from "@/lib/receipts";
import { kr } from "@/lib/money";

const back = "/admin/hemsidan/produkter";
const SHAPES = { vas: "Vas", skal: "Skål", stake: "Ljusstake", lykta: "Ljuslykta", sten: "Sten", markar: "Lådmärke", skylt: "Skylt", hangen: "Hänge", tval: "Tvålkopp" };
const GLAZES = { mossa: "Mossa", lera: "Lera", havre: "Havre", strand: "Strand", kvall: "Kväll", sten: "Sten" };
const CATS = { dekor: "Dekor", ljus: "Ljus", lugn: "För lugn" };
const pick = <T extends object>(m: T, v: string, d: keyof T) => (v in m ? v : String(d));

async function values(f: FormData) {
  const name = str(f, "name");
  const priceOre = ore(f, "price");
  if (!name || !priceOre) throw new Error("Produkten behöver ett namn och ett pris");
  const stockRaw = str(f, "stock");
  const optLabel = str(f, "optLabel"), optPrice = ore(f, "optPrice");
  const v: Partial<typeof schema.products.$inferInsert> = {
    name, priceOre, text: str(f, "text"), badge: str(f, "badge") || null,
    category: pick(CATS, str(f, "category"), "dekor"), shape: pick(SHAPES, str(f, "shape"), "vas"), glaze: pick(GLAZES, str(f, "glaze"), "havre"),
    stock: stockRaw === "" ? null : Math.max(0, int(f, "stock")), sort: int(f, "sort"), active: bool(f, "active"),
    option: optLabel && optPrice ? { id: `${slug(name)}-tillval`, label: optLabel, priceOre: optPrice } : null,
  };
  const img = f.get("image");
  if (img instanceof File && img.size > 0) {
    if (!img.type.startsWith("image/")) throw new Error("Bilden måste vara en bildfil");
    v.imageId = await saveFile(img, true);
  }
  if (bool(f, "removeImage")) v.imageId = null;
  return v;
}
function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "produkt";
}
async function save(f: FormData) {
  "use server";
  await act(back, async () => { await db.update(schema.products).set(await values(f)).where(eq(schema.products.id, str(f, "id"))); return "Produkten är sparad."; });
}
async function create(f: FormData) {
  "use server";
  await act(back, async () => {
    const v = await values(f);
    let id = slug(v.name!);
    const [exists] = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.id, id));
    if (exists) id = `${id}-${Date.now().toString(36).slice(-4)}`;
    await db.insert(schema.products).values({ ...v, id } as typeof schema.products.$inferInsert);
    return "Produkten är tillagd.";
  });
}
async function hide(f: FormData) {
  "use server";
  // Produkter tas inte bort helt, eftersom gamla ordrar pekar på dem. De döljs i stället.
  await act(back, async () => { await db.update(schema.products).set({ active: false }).where(eq(schema.products.id, str(f, "id"))); return "Produkten är dold från hemsidan."; });
}

type P = typeof schema.products.$inferSelect;
function Fields({ p }: { p?: P }) {
  const opts = (m: Record<string, string>) => Object.entries(m).map(([k, v]) => <option key={k} value={k}>{v}</option>);
  return (
    <>
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Namn</span><input name="name" defaultValue={p?.name} required /></label>
        <label className="a-field"><span>Pris (kr, med moms)</span><input name="price" inputMode="decimal" defaultValue={oreToKr(p?.priceOre)} required /></label>
        <label className="a-field"><span>I lager</span><input name="stock" inputMode="numeric" defaultValue={p?.stock ?? ""} placeholder="Tomt = görs på beställning" /><small>Minskar automatiskt när någon köper. Vid 0 visas Slutsåld.</small></label>
        <label className="a-field"><span>Etikett (valfri)</span><input name="badge" defaultValue={p?.badge ?? ""} placeholder="T.ex. Nyhet" /></label>
      </div>
      <label className="a-field"><span>Beskrivning</span><textarea name="text" defaultValue={p?.text} rows={3} style={{ minHeight: "5rem" }} /></label>
      <div className="a-grid a-grid--3">
        <label className="a-field"><span>Kategori</span><select name="category" defaultValue={p?.category ?? "dekor"}>{opts(CATS)}</select></label>
        <label className="a-field"><span>Teckning (utan foto)</span><select name="shape" defaultValue={p?.shape ?? "vas"}>{opts(SHAPES)}</select></label>
        <label className="a-field"><span>Färg på teckningen</span><select name="glaze" defaultValue={p?.glaze ?? "havre"}>{opts(GLAZES)}</select></label>
      </div>
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Foto (valfritt, ersätter teckningen)</span><input name="image" type="file" accept="image/*" /></label>
        {p?.imageId ? <div className="a-row">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/api/filer/${p.imageId}`} alt="" style={{ width: "5rem", height: "5rem", objectFit: "cover", borderRadius: 8 }} /><label className="a-check"><input type="checkbox" name="removeImage" />Ta bort fotot</label></div> : null}
      </div>
      <div className="a-grid a-grid--3">
        <label className="a-field"><span>Tillval (valfritt)</span><input name="optLabel" defaultValue={p?.option?.label ?? ""} placeholder="T.ex. Med glasinsats" /></label>
        <label className="a-field"><span>Tillval kostar extra (kr)</span><input name="optPrice" inputMode="decimal" defaultValue={oreToKr(p?.option?.priceOre)} /></label>
        <label className="a-field"><span>Ordning</span><input name="sort" inputMode="numeric" defaultValue={p?.sort ?? 0} /></label>
      </div>
      <label className="a-check"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} />Till salu på hemsidan</label>
    </>
  );
}

export default async function Products({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const all = await db.select().from(schema.products).orderBy(asc(schema.products.sort), asc(schema.products.name));
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Ateljén" title={<>Det du <em>formar.</em></>} lede="Priser, lager och bilder. Tänk på att produkter i självtorkande lera inte tål vatten eller mat: skriv det gärna i beskrivningen.">
        <Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link>
      </Head>
      <div className="a-stack">
        {all.map((p) => (
          <details key={p.id} className="a-card">
            <summary style={{ cursor: "pointer" }} className="a-row">
              <h2 style={{ display: "inline" }}>{p.name}</h2><span className="a-muted">{kr(p.priceOre)}</span>
              {p.stock === 0 ? <span className="a-pill a-pill--warn">Slutsåld</span> : p.stock != null && p.stock <= 2 ? <span className="a-pill a-pill--warn">{p.stock} kvar</span> : p.stock != null ? <span className="a-pill">{p.stock} i lager</span> : null}
              {!p.active ? <span className="a-pill">Dold</span> : null}
            </summary>
            <form action={save} className="a-stack" style={{ marginTop: "1rem" }}>
              <input type="hidden" name="id" value={p.id} /><Fields p={p} />
              <div className="a-row"><button className="a-btn" type="submit">Spara</button>{p.active ? <button className="a-btn a-btn--quiet" formAction={hide} type="submit">Dölj från hemsidan</button> : null}</div>
            </form>
          </details>
        ))}
        <details className="a-card"><summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>+ Ny produkt</h2></summary>
          <form action={create} className="a-stack" style={{ marginTop: "1rem" }}><Fields /><button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Lägg till</button></form>
        </details>
      </div>
    </>
  );
}
