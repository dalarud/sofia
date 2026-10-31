import { db, schema } from "@/db";
import { TEXTS } from "@/db/seed-data";
import { getTexts } from "@/lib/content";
import { act } from "@/admin/form";
import { Done, Head, type SP } from "@/admin/ui";
import Link from "next/link";

const GROUPS: Record<string, string> = {
  hero: "Startsidan", manifest: "Manifestet", tjanster: "Tjänster", steg: "Så går det till", ro: "Ro-modellen", ateljen: "Ateljén",
  kurser: "Kurser", present: "Presentkort", om: "Om mig", tips: "Tips", guide: "Gratis guiden", kontakt: "Kontakt", sidfot: "Sidfoten",
  villkor: "Köpvillkor", integritet: "Integritetspolicy",
};

async function save(f: FormData) {
  "use server";
  await act("/admin/hemsidan/texter", async () => {
    let n = 0;
    for (const t of TEXTS) {
      if (!f.has(t.key)) continue;
      const value = String(f.get(t.key) ?? "").replace(/\r\n/g, "\n").trim().slice(0, 20000);
      await db.insert(schema.texts).values({ key: t.key, label: t.label, value, multiline: !!t.multiline })
        .onConflictDoUpdate({ target: schema.texts.key, set: { value } });
      n++;
    }
    return n ? "Sparat. Ändringarna syns på hemsidan inom en halv minut." : "Inget att spara.";
  });
}

export default async function Texts({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const texts = await getTexts();
  const groups = new Map<string, typeof TEXTS>();
  for (const t of TEXTS) {
    const g = t.key.split(".")[0];
    groups.set(g, [...(groups.get(g) ?? []), t]);
  }
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan · Texter" title={<>Säg det med <em>dina ord.</em></>} lede="Ändra så mycket eller lite du vill. *Ord inom stjärnor* blir kursiva i lerfärg. I de långa texterna blir en rad som börjar med ## en mellanrubrik.">
        <Link className="a-btn a-btn--quiet" href="/admin/hemsidan">Tillbaka</Link>
      </Head>
      <nav className="a-row a-small" aria-label="Avsnitt" style={{ marginBottom: "1.4rem" }}>
        {[...groups.keys()].map((g) => <a key={g} href={`#${g}`} className="a-pill">{GROUPS[g] ?? g}</a>)}
      </nav>
      <form action={save} className="a-stack">
        {[...groups.entries()].map(([g, items]) => (
          <details key={g} id={g} className="a-card" open={g === "hero"}>
            <summary style={{ cursor: "pointer" }}><h2 style={{ display: "inline" }}>{GROUPS[g] ?? g}</h2></summary>
            <div className="a-stack" style={{ marginTop: "1rem" }}>
              {items.map((t) => (
                <label key={t.key} className="a-field">
                  <span>{t.label.replace(/^[^:]+: /, "")}</span>
                  {t.multiline || (texts[t.key] ?? "").length > 90
                    ? <textarea name={t.key} defaultValue={texts[t.key]} rows={t.key === "villkor.text" || t.key === "integritet.text" ? 18 : 4} />
                    : <input name={t.key} defaultValue={texts[t.key]} />}
                </label>
              ))}
            </div>
          </details>
        ))}
        <div style={{ position: "sticky", bottom: "1rem", zIndex: 5 }}><button className="a-btn a-btn--big" type="submit">Spara alla texter</button></div>
      </form>
    </>
  );
}
