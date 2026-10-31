import type { schema } from "@/db";
import { oreToKr } from "./form";

type E = typeof schema.events.$inferSelect;
export function EventFields({ e }: { e?: E }) {
  return (
    <>
      <div className="a-grid a-grid--3">
        <label className="a-field"><span>Datum</span><input type="date" name="date" defaultValue={e?.date} required /></label>
        <label className="a-field"><span>Tid</span><input name="time" defaultValue={e?.time} placeholder="10.00–13.00" required /></label>
        <label className="a-field"><span>Typ</span><select name="kind" defaultValue={e?.kind ?? "kurs"}><option value="kurs">Kurs i lera</option><option value="workshop">Workshop</option><option value="oppen">Öppen ateljé (ingen bokning)</option></select></label>
      </div>
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Rubrik</span><input name="title" defaultValue={e?.title} required /></label>
        <label className="a-field"><span>Etikett</span><input name="label" defaultValue={e?.label ?? "Kurs i lera"} /></label>
        <label className="a-field"><span>Plats</span><input name="place" defaultValue={e?.place ?? "Ateljén"} /></label>
      </div>
      <label className="a-field"><span>Beskrivning</span><textarea name="text" defaultValue={e?.text} rows={3} style={{ minHeight: "5rem" }} /></label>
      <div className="a-grid a-grid--3">
        <label className="a-field"><span>Pris per person (kr)</span><input name="price" inputMode="decimal" defaultValue={oreToKr(e?.priceOre ?? 0)} /></label>
        <label className="a-field"><span>Antal platser</span><input name="seats" inputMode="numeric" defaultValue={e?.seats ?? 8} /></label>
        <label className="a-check" style={{ alignSelf: "end" }}><input type="checkbox" name="active" defaultChecked={e?.active ?? true} />Visas på hemsidan</label>
      </div>
    </>
  );
}
