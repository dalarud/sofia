import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { oreToKr } from "./form";

export const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  utkast: { label: "Utkast", cls: "" }, skickad: { label: "Skickad", cls: "a-pill--accent" },
  betald: { label: "Betald", cls: "a-pill--ok" }, krediterad: { label: "Krediterad", cls: "" },
};

/** Snabbval på fakturan: tjänsterna från hemsidan med sina priser. */
export async function invoiceSuggestions() {
  const services = await db.select().from(schema.services).where(eq(schema.services.active, true)).orderBy(asc(schema.services.sort));
  const out: { text: string; price: string; vatRate: number }[] = [];
  for (const s of services) for (const i of s.items ?? []) {
    const m = /(\d[\d\s]*)/.exec(i.price ?? "");
    if (m) out.push({ text: `${s.name}: ${i.label}`, price: oreToKr(Number(m[1].replace(/\s/g, "")) * 100), vatRate: 25 });
  }
  out.push({ text: "Arbete per timme", price: "", vatRate: 25 }, { text: "Milersättning", price: "", vatRate: 25 });
  return out.slice(0, 12);
}
