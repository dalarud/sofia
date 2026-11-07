"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { redirect } from "next/navigation";
import { int, str } from "./form";
import { requireAdmin } from "@/lib/auth";
import { addDays } from "@/lib/money";
import { invoiceTotals } from "@/lib/invoices";

const lineSchema = z.array(z.object({ text: z.string(), qty: z.string(), price: z.string(), vatRate: z.number().refine((r) => [25, 12, 6, 0].includes(r)) }));
const num = (s: string) => Number(String(s).replace(/\s/g, "").replace(",", "."));

export async function saveInvoice(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  let savedId = id;
  let error: string | null = null;
  try {
    const raw = lineSchema.parse(JSON.parse(str(f, "lines") || "[]"));
    const exVat = f.get("exVat") === "on";
    const lines = raw.filter((l) => l.text.trim() || num(l.price)).map((l) => {
      const qty = num(l.qty) || 1, price = num(l.price);
      if (!Number.isFinite(price) || !l.text.trim()) throw new Error("Varje rad behöver en beskrivning och ett pris");
      const unitOre = Math.round(price * 100 * (exVat ? (100 + l.vatRate) / 100 : 1));
      return { text: l.text.trim().slice(0, 200), qty, unitOre, vatRate: l.vatRate };
    });
    if (!lines.length) throw new Error("Lägg till minst en rad");
    const date = str(f, "date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Fakturadatum saknas");
    const days = Math.min(Math.max(int(f, "days", 30), 0), 120);
    const values = {
      date, dueDate: addDays(date, days), note: str(f, "note").slice(0, 500), lines, ...invoiceTotals(lines),
      customer: { name: str(f, "name"), email: str(f, "email"), address: str(f, "address"), orgNr: str(f, "orgNr") },
    };
    if (!values.customer.name) throw new Error("Skriv vem fakturan ska till");
    if (values.totalOre <= 0) throw new Error("Fakturan måste ha ett belopp större än noll");
    if (id) {
      const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
      if (!inv || inv.status !== "utkast") throw new Error("Bara utkast kan ändras. Kreditera och gör en ny om något blev fel.");
      await db.update(schema.invoices).set(values).where(eq(schema.invoices.id, id));
    } else {
      const leadId = int(f, "leadId") || null;
      const [row] = await db.insert(schema.invoices).values({ ...values, leadId }).returning({ id: schema.invoices.id });
      savedId = row.id;
    }
  } catch (e) {
    error = e instanceof z.ZodError ? "Raderna kunde inte läsas. Försök igen." : e instanceof Error ? e.message : "Något gick fel";
  }
  if (error) redirect(`${id ? `/admin/fakturor/${id}/andra` : "/admin/fakturor/ny"}?fel=${encodeURIComponent(error)}`);
  redirect(`/admin/fakturor/${savedId}?klart=${encodeURIComponent("Sparat som utkast. Granska och skicka när du är redo.")}`);
}
