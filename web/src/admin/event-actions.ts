"use server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, bool, int, ore, str } from "./form";

function values(f: FormData) {
  const kind = ["kurs", "workshop", "oppen"].includes(str(f, "kind")) ? str(f, "kind") : "kurs";
  const v = { date: str(f, "date"), time: str(f, "time"), kind, title: str(f, "title"), label: str(f, "label") || (kind === "oppen" ? "Öppen ateljé" : kind === "workshop" ? "Workshop" : "Kurs i lera"),
    place: str(f, "place"), text: str(f, "text"), priceOre: kind === "oppen" ? 0 : ore(f, "price") ?? 0, seats: Math.max(0, int(f, "seats")), active: bool(f, "active") };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || !v.title) throw new Error("Datum och rubrik behövs");
  return v;
}
export async function saveEvent(f: FormData) {
  const id = str(f, "id");
  await act(`/admin/hemsidan/kurser/${id}`, async () => { await db.update(schema.events).set(values(f)).where(eq(schema.events.id, id)); return "Sparat."; });
}
export async function createEvent(f: FormData) {
  await act("/admin/hemsidan/kurser", async () => {
    const v = values(f);
    const id = `${v.kind}-${v.date}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(schema.events).values({ ...v, id });
    return "Tillfället är tillagt.";
  });
}
