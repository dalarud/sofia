import Link from "next/link";
import { revalidatePath } from "next/cache";
import { eq, isNull, desc, and, isNotNull, gte } from "drizzle-orm";
import { db, schema } from "@/db";
import { monthNumbers, todaysTasks } from "@/lib/tasks";
import { kr, today, addDays } from "@/lib/money";
import { getSetting, type Company } from "@/lib/content";
import { Done, type SP } from "@/admin/ui";
import { str } from "@/admin/form";
import { requireAdmin } from "@/lib/auth";
import { Timer } from "@/admin/Timer";

async function addTodo(f: FormData) {
  "use server";
  await requireAdmin();
  const text = str(f, "text");
  if (!text) return;
  const when = str(f, "when");
  const due = when === "idag" ? today() : when === "imorgon" ? addDays(today(), 1) : when === "vecka" ? addDays(today(), 7) : str(f, "due") || null;
  await db.insert(schema.todos).values({ text: text.slice(0, 300), due });
  revalidatePath("/admin");
}
async function doneTodo(f: FormData) {
  "use server";
  await requireAdmin();
  await db.update(schema.todos).set({ doneAt: new Date() }).where(eq(schema.todos.id, Number(f.get("id"))));
  revalidatePath("/admin");
}
async function undoTodo(f: FormData) {
  "use server";
  await requireAdmin();
  await db.update(schema.todos).set({ doneAt: null }).where(eq(schema.todos.id, Number(f.get("id"))));
  revalidatePath("/admin");
}

function greeting() {
  const h = Number(new Date().toLocaleString("sv-SE", { hour: "numeric", timeZone: "Europe/Stockholm" }));
  return h < 10 ? "God morgon" : h < 17 ? "Hej" : "God kväll";
}

export default async function Today({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [tasks, month, company, todos, doneToday] = await Promise.all([
    todaysTasks(), monthNumbers(), getSetting<Company>("company"),
    db.select().from(schema.todos).where(isNull(schema.todos.doneAt)).orderBy(schema.todos.due, schema.todos.createdAt),
    db.select().from(schema.todos).where(and(isNotNull(schema.todos.doneAt), gte(schema.todos.doneAt, new Date(Date.now() - 86400000)))).orderBy(desc(schema.todos.doneAt)).limit(5),
  ]);
  const name = (company.owner || "Sofia").split(" ")[0];
  const top = tasks.filter((t) => !t.key.startsWith("todo-") || t.weight > 50).slice(0, 3);
  const rest = tasks.filter((t) => !top.includes(t) && !t.key.startsWith("todo-"));
  const totalMin = top.reduce((s, t) => s + t.minutes, 0);
  const dateText = new Date().toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Stockholm" });

  return (
    <>
      <Done sp={sp} />
      <section className="today-hero">
        <p className="a-eyebrow">{dateText}</p>
        <h1>{greeting()} {name}.</h1>
        {top.length ? (
          <p className="a-muted">Här är det viktigaste just nu{totalMin ? <>, ungefär <b>{totalMin} minuter</b> tillsammans</> : null}. Ta det första först, resten kan vänta.</p>
        ) : null}
      </section>

      {top.length ? (
        <ol className="next" aria-label="Nästa steg" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {top.map((t) => (
            <li key={t.key} className="next__item">
              <span className="next__n" aria-hidden="true" />
              <div>
                <p className="next__title">{t.title}</p>
                <p className="next__why">{t.why}</p>
                <p className="next__time">Cirka {t.minutes} min</p>
              </div>
              <Link className={top[0] === t ? "a-btn" : "a-btn a-btn--ghost"} href={t.href}>{t.action}</Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="a-card calm">
          <p className="a-hand">Allt är gjort.</p>
          <p className="a-muted">Inga ordrar, förfrågningar eller kvitton väntar. Njut av lugnet.</p>
        </div>
      )}
      {rest.length ? (
        <details className="a-more" style={{ marginTop: "1rem" }}>
          <summary>{rest.length} saker till, när du har tid</summary>
          <ul className="a-list" style={{ marginTop: ".6rem" }}>
            {rest.map((t) => <li key={t.key} className="a-row" style={{ justifyContent: "space-between" }}><span><b>{t.title}</b><br /><span className="a-muted a-small">{t.why}</span></span><Link className="a-btn a-btn--quiet" href={t.href}>{t.action} →</Link></li>)}
          </ul>
        </details>
      ) : null}

      <div className="a-grid a-grid--2" style={{ marginTop: "2.4rem" }}>
        <section className="a-card a-stack" id="kom-ihag">
          <h2>Kom ihåg</h2>
          <p className="a-muted a-small">Skriv ner det så fort du tänker på det, så behöver du inte hålla det i huvudet.</p>
          <form action={addTodo} className="a-stack">
            <label className="a-field"><span>Vad?</span><input name="text" required placeholder="T.ex. beställa mer lera" autoComplete="off" /></label>
            <div className="a-row">
              <div className="seg" role="radiogroup" aria-label="När" style={{ flexWrap: "wrap" }}>
                {[["", "Någon gång"], ["idag", "Idag"], ["imorgon", "I morgon"], ["vecka", "Om en vecka"]].map(([v, l]) => (
                  <label key={v}><input type="radio" name="when" value={v} defaultChecked={v === ""} />{l}</label>
                ))}
              </div>
              <button className="a-btn" type="submit">Lägg till</button>
            </div>
          </form>
          {todos.length ? (
            <ul className="a-list">
              {todos.map((t) => (
                <li key={t.id} className="a-row" style={{ justifyContent: "space-between" }}>
                  <span>{t.text}{t.due ? <span className={`a-pill ${t.due <= today() ? "a-pill--warn" : ""}`} style={{ marginLeft: ".5rem" }}>{t.due === today() ? "idag" : t.due < today() ? "försenad" : t.due}</span> : null}</span>
                  <form action={doneTodo}><input type="hidden" name="id" value={t.id} /><button className="a-btn a-btn--ghost" type="submit" aria-label={`Klart: ${t.text}`}>Klart ✓</button></form>
                </li>
              ))}
            </ul>
          ) : <p className="a-muted">Inget att komma ihåg just nu.</p>}
          {doneToday.length ? (
            <details className="a-more"><summary>Avbockat senaste dygnet ({doneToday.length})</summary>
              <ul className="a-list">{doneToday.map((t) => <li key={t.id} className="a-row" style={{ justifyContent: "space-between" }}><s className="a-muted">{t.text}</s><form action={undoTodo}><input type="hidden" name="id" value={t.id} /><button className="a-btn a-btn--quiet" type="submit">Ångra</button></form></li>)}</ul>
            </details>
          ) : null}
        </section>

        <section className="a-stack">
          <div className="a-card a-stack">
            <h2>Den här månaden</h2>
            <div className="a-stats">
              <div className="stat"><b>{kr(month.income)}</b><span>in, utan moms</span></div>
              <div className="stat"><b>{kr(month.costs)}</b><span>kostnader</span></div>
              <div className="stat"><b>{kr(month.income - month.costs)}</b><span>kvar före skatt</span></div>
            </div>
            <p className="a-muted a-small">{month.vat >= 0 ? `Ungefär ${kr(month.vat)} av det som kommit in är moms som ska betalas till Skatteverket.` : `Du har ${kr(-month.vat)} i moms att få tillbaka hittills.`} Lägg gärna undan ungefär 30 % av vinsten till skatten.</p>
            <Link className="a-btn a-btn--quiet" href="/admin/bokforing" style={{ justifySelf: "start" }}>Se hela bokföringen →</Link>
          </div>
          <div className="a-card a-stack">
            <h2>Ekonomistunden</h2>
            <p className="a-muted a-small">En gång i veckan, samma dag och tid. Femton minuter räcker: fota veckans kvitton, ta dem i fokusläget och kolla att fakturorna är betalda.</p>
            <Timer minutes={15} />
            <div className="a-row"><Link className="a-btn a-btn--ghost" href="/admin/kvitton">1. Kvitton</Link><Link className="a-btn a-btn--ghost" href="/admin/fakturor">2. Fakturor</Link><Link className="a-btn a-btn--ghost" href="/admin/ordrar">3. Ordrar</Link></div>
          </div>
        </section>
      </div>
    </>
  );
}
