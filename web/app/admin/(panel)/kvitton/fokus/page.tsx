import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CATEGORIES } from "@/lib/categories";
import { bookReceipt } from "@/lib/receipts";
import { today } from "@/lib/money";
import { act, ore, str, int, oreToKr } from "@/admin/form";
import { Done, one, type SP } from "@/admin/ui";
import { ReceiptForm } from "@/admin/ReceiptForm";

async function book(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act(`/admin/kvitton/fokus?efter=${id}`, async () => {
    const amountOre = ore(f, "amount");
    if (!amountOre) throw new Error("Skriv beloppet som står på kvittot");
    const v = await bookReceipt(id, {
      date: str(f, "date"), supplier: str(f, "supplier"), amountOre, vatRate: int(f, "vatRate", 25), vatOre: ore(f, "vatExact"),
      category: str(f, "category"), paidWith: str(f, "paidWith") === "privat" ? "privat" : "foretag", note: str(f, "note"),
    });
    return `Bokfört som verifikation ${v.number}. Bra jobbat!`;
  });
}

async function remove(f: FormData) {
  "use server";
  const id = int(f, "id");
  await act("/admin/kvitton/fokus", async () => {
    const [r] = await db.select().from(schema.receipts).where(eq(schema.receipts.id, id));
    if (!r || r.status !== "att_gora") throw new Error("Bara kvitton som inte är bokförda kan tas bort");
    await db.delete(schema.receipts).where(eq(schema.receipts.id, id));
    if (r.fileId) await db.delete(schema.files).where(eq(schema.files.id, r.fileId));
    return "Borttaget.";
  });
}

export default async function Focus({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const todo = await db.select().from(schema.receipts).where(eq(schema.receipts.status, "att_gora")).orderBy(asc(schema.receipts.id));
  const wanted = Number(one(sp.id)), after = Number(one(sp.efter));
  const current = todo.find((r) => r.id === wanted) ?? todo.find((r) => after && r.id > after) ?? todo[0];

  if (!current) return (
    <>
      <Done sp={sp} />
      <div className="a-card calm a-stack">
        <p className="a-hand">Alla kvitton är bokförda.</p>
        <p className="a-muted">Snyggt! Du kan lägga undan papperskvittona nu, bilderna är sparade.</p>
        <Link className="a-btn" href="/admin" style={{ justifySelf: "center" }}>Tillbaka till Idag</Link>
      </div>
    </>
  );

  const idx = todo.indexOf(current);
  const next = todo[idx + 1] ?? todo[0];
  const [file] = current.fileId ? await db.select({ mime: schema.files.mime }).from(schema.files).where(eq(schema.files.id, current.fileId)) : [];

  return (
    <>
      <Done sp={sp} />
      <div className="a-row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div className="a-stack" style={{ gap: ".4rem", flex: 1, minWidth: "12rem" }}>
          <p className="a-eyebrow">Fokusläge · kvitto {idx + 1} av {todo.length}</p>
          <div className="progress" aria-hidden="true"><span style={{ width: `${Math.round((idx / todo.length) * 100)}%` }} /></div>
        </div>
        <Link className="a-btn a-btn--quiet" href="/admin/kvitton">Avsluta</Link>
      </div>
      <div className="focus">
        <div className="focus__img">
          {current.fileId ? (file?.mime === "application/pdf"
            ? <iframe src={`/api/filer/${current.fileId}`} title="Kvittot" />
            // eslint-disable-next-line @next/next/no-img-element
            : <a href={`/api/filer/${current.fileId}`} target="_blank" rel="noopener"><img src={`/api/filer/${current.fileId}`} alt="Kvittot" /></a>)
            : <div className="a-card calm"><p className="a-muted">Ingen bild</p></div>}
        </div>
        <div className="a-stack">
          <ReceiptForm action={book} categories={CATEGORIES} submitLabel={todo.length > 1 ? "Bokför och ta nästa" : "Bokför"}
            initial={{ id: current.id, date: current.date ?? today(), supplier: current.supplier, amount: oreToKr(current.amountOre), category: current.category ?? "", vatRate: current.vatRate ?? 25, paidWith: current.paidWith, note: current.note }} />
          <div className="a-row">
            {todo.length > 1 ? <Link className="a-btn a-btn--ghost" href={`/admin/kvitton/fokus?id=${next.id}`}>Hoppa över</Link> : null}
            <form action={remove}><input type="hidden" name="id" value={current.id} /><button className="a-btn a-btn--quiet" type="submit">Det här är inget kvitto, ta bort</button></form>
          </div>
          <p className="a-muted a-small">Osäker på kategorin? Välj Övrigt och skriv en anteckning. Det går alltid att ändra i efterhand.</p>
        </div>
      </div>
    </>
  );
}
