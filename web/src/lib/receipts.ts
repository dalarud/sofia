/** Kvitton: spara underlaget, bokför med kategori, rätta om något blev fel. */
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { categoryById } from "./categories";
import { correctVerification, createVerification } from "./ledger";
import { expenseRows } from "./rules";
import { vatFromGross } from "./money";

export const MAX_FILE = 4 * 1024 * 1024;
export const RECEIPT_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export async function saveFile(file: File, isPublic = false): Promise<string> {
  if (file.size > MAX_FILE) throw new Error(`${file.name} är för stor (max 4 MB)`);
  const data = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(schema.files).values({ name: file.name || "fil", mime: file.type || "application/octet-stream", size: file.size, data, isPublic }).returning({ id: schema.files.id });
  return row.id;
}

export type BookInput = { date: string; supplier: string; amountOre: number; vatRate: number; vatOre?: number | null; category: string; paidWith: "foretag" | "privat"; note: string };

export async function bookReceipt(id: number, input: BookInput) {
  const cat = categoryById(input.category);
  if (!cat) throw new Error("Välj en kategori");
  if (!input.amountOre || input.amountOre <= 0) throw new Error("Skriv beloppet som står på kvittot");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Datumet saknas");
  const vatOre = input.vatOre ?? vatFromGross(input.amountOre, input.vatRate);
  return db.transaction(async (t) => {
    const [r] = await t.select().from(schema.receipts).where(eq(schema.receipts.id, id)).for("update");
    if (!r) throw new Error("Kvittot finns inte");
    if (r.status === "bokford") throw new Error("Kvittot är redan bokfört");
    const v = await createVerification({
      date: input.date, text: `${input.supplier || cat.label}${input.note ? `: ${input.note}` : ""}`, source: "kvitto", sourceRef: String(id), fileId: r.fileId,
      rows: expenseRows({ grossOre: input.amountOre, vatOre, account: cat.account, paidWith: input.paidWith }),
    }, t);
    await t.update(schema.receipts).set({ ...input, vatOre, status: "bokford", verificationId: v.id }).where(eq(schema.receipts.id, id));
    return v;
  });
}

/** Ångrar bokföringen med en rättelse och lägger tillbaka kvittot bland de som ska göras. */
export async function reopenReceipt(id: number, date: string) {
  await db.transaction(async (t) => {
    const [r] = await t.select().from(schema.receipts).where(eq(schema.receipts.id, id)).for("update");
    if (!r || r.status !== "bokford" || !r.verificationId) throw new Error("Kvittot är inte bokfört");
    await correctVerification(r.verificationId, "kvittot bokförs om", date, t);
    await t.update(schema.receipts).set({ status: "att_gora", verificationId: null }).where(eq(schema.receipts.id, id));
  });
}
