import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { act, int, str } from "@/admin/form";
import { Done, Head, dateSv, type SP } from "@/admin/ui";
import { EventFields } from "@/admin/EventFields";
import { saveEvent } from "@/admin/event-actions";

async function addManual(f: FormData) {
  "use server";
  const id = str(f, "eventId");
  await act(`/admin/hemsidan/kurser/${id}`, async () => {
    const qty = Math.max(1, int(f, "qty", 1));
    if (!str(f, "name")) throw new Error("Skriv namnet");
    await db.transaction(async (t) => {
      await t.insert(schema.eventBookings).values({ eventId: id, name: str(f, "name"), email: str(f, "email"), qty });
      const [e] = await t.select().from(schema.events).where(eq(schema.events.id, id));
      await t.update(schema.events).set({ booked: (e?.booked ?? 0) + qty }).where(eq(schema.events.id, id));
    });
    return "Deltagaren är tillagd. Kom ihåg att fakturera om hen inte har betalat.";
  });
}
async function removeBooking(f: FormData) {
  "use server";
  const id = str(f, "eventId");
  await act(`/admin/hemsidan/kurser/${id}`, async () => {
    await db.transaction(async (t) => {
      const [b] = await t.select().from(schema.eventBookings).where(eq(schema.eventBookings.id, int(f, "bookingId")));
      if (!b) return;
      await t.delete(schema.eventBookings).where(eq(schema.eventBookings.id, b.id));
      if (!b.waitlist) {
        const [e] = await t.select().from(schema.events).where(eq(schema.events.id, id));
        await t.update(schema.events).set({ booked: Math.max(0, (e?.booked ?? 0) - b.qty) }).where(eq(schema.events.id, id));
      }
    });
    return "Bokningen är borttagen. Har deltagaren betalat? Återbetala i Stripe.";
  });
}

export default async function EventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const sp = await searchParams;
  const { id } = await params;
  const [e] = await db.select().from(schema.events).where(eq(schema.events.id, id));
  if (!e) notFound();
  const bookings = await db.select().from(schema.eventBookings).where(eq(schema.eventBookings.eventId, id)).orderBy(asc(schema.eventBookings.createdAt));
  const booked = bookings.filter((b) => !b.waitlist), waiting = bookings.filter((b) => b.waitlist);
  const emails = booked.map((b) => b.email).filter(Boolean).join(",");
  const subject = encodeURIComponent(`Välkommen till ${e.title} ${dateSv(e.date)}`);
  const body = encodeURIComponent(`Hej!\n\nVad roligt att du kommer på ${e.title.toLowerCase()} ${dateSv(e.date)} kl ${e.time}. Vi ses i ${e.place.toLowerCase()}.\n\nTa gärna med förkläde. Allt material finns på plats.\n\nVarma hälsningar\nSofia`);
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow={`${e.label} · ${dateSv(e.date)} ${e.time}`} title={e.title} lede={e.kind === "oppen" ? "Öppen ateljé, ingen bokning behövs." : `${e.booked} av ${e.seats} platser bokade.`}>
        <Link className="a-btn a-btn--quiet" href="/admin/hemsidan/kurser">Alla kurser</Link>
      </Head>
      {e.kind !== "oppen" ? (
        <section className="a-card a-stack" style={{ marginBottom: "1.4rem" }}>
          <div className="a-row" style={{ justifyContent: "space-between" }}>
            <h2>Deltagare</h2>
            {emails ? <a className="a-btn" href={`mailto:?bcc=${emails}&subject=${subject}&body=${body}`}>Mejla alla deltagare</a> : null}
          </div>
          {booked.length ? (
            <table className="a-table"><thead><tr><th>Namn</th><th>E-post</th><th className="num">Platser</th><th>Betalt</th><th></th></tr></thead>
              <tbody>{booked.map((b) => (
                <tr key={b.id}><td>{b.name}</td><td><a href={`mailto:${b.email}`}>{b.email}</a></td><td className="num">{b.qty}</td><td>{b.orderId ? <span className="a-pill a-pill--ok">Via hemsidan</span> : <span className="a-pill">Manuellt</span>}</td>
                  <td><form action={removeBooking}><input type="hidden" name="eventId" value={e.id} /><input type="hidden" name="bookingId" value={b.id} /><button className="a-btn a-btn--quiet" type="submit">Ta bort</button></form></td></tr>
              ))}</tbody></table>
          ) : <p className="a-muted">Ingen har bokat än.</p>}
          {waiting.length ? (
            <>
              <h3>Väntelista</h3>
              <ul className="a-list">{waiting.map((b) => <li key={b.id} className="a-row" style={{ justifyContent: "space-between" }}><span>{b.name} · <a href={`mailto:${b.email}?subject=${encodeURIComponent(`En plats har blivit ledig: ${e.title}`)}`}>{b.email}</a></span>
                <form action={removeBooking}><input type="hidden" name="eventId" value={e.id} /><input type="hidden" name="bookingId" value={b.id} /><button className="a-btn a-btn--quiet" type="submit">Ta bort</button></form></li>)}</ul>
            </>
          ) : null}
          <details className="a-more"><summary>Lägg till någon som bokat på annat sätt</summary>
            <form action={addManual} className="a-row" style={{ marginTop: ".6rem", alignItems: "flex-end" }}>
              <input type="hidden" name="eventId" value={e.id} />
              <label className="a-field"><span>Namn</span><input name="name" required /></label>
              <label className="a-field"><span>E-post</span><input name="email" type="email" /></label>
              <label className="a-field" style={{ width: "6rem" }}><span>Platser</span><input name="qty" inputMode="numeric" defaultValue={1} /></label>
              <button className="a-btn a-btn--ghost" type="submit">Lägg till</button>
            </form>
          </details>
        </section>
      ) : null}
      <details className="a-card"><summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>Ändra tillfället</h2></summary>
        <form action={saveEvent} className="a-stack" style={{ marginTop: "1rem" }}><input type="hidden" name="id" value={e.id} /><EventFields e={e} /><button className="a-btn" type="submit" style={{ justifySelf: "start" }}>Spara</button></form>
      </details>
    </>
  );
}
