import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { Done, Head, type SP } from "@/admin/ui";

export default async function Site({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const res = await db.execute(sql`select
    (select count(*) from products where active)::int as products,
    (select count(*) from products where active and stock is not null and stock <= 2)::int as low,
    (select count(*) from events where active and date >= current_date)::int as events,
    (select count(*) from services where active)::int as services,
    (select count(*) from tips where active)::int as tips,
    (select count(*) from subscribers where unsubscribed_at is null)::int as subs`);
  const n = res.rows[0] as Record<string, number>;
  const cards = [
    { href: "/admin/hemsidan/texter", title: "Texter", text: "Rubriker och texter på hela sidan, från startsidan till sidfoten." },
    { href: "/admin/hemsidan/produkter", title: "Ateljén", text: `${n.products} produkter till salu${n.low ? `, ${n.low} har snart slut` : ""}. Priser, lager och bilder.` },
    { href: "/admin/hemsidan/kurser", title: "Kurser och öppet hus", text: `${n.events} kommande tillfällen. Se vilka som har bokat.` },
    { href: "/admin/hemsidan/tjanster", title: "Tjänster", text: `${n.services} tjänster med priser och vad som ingår.` },
    { href: "/admin/hemsidan/tips", title: "Tips", text: `${n.tips} tips från Ro-modellen.` },
    { href: "/admin/hemsidan/nyhetsbrev", title: "Guiden och nyhetsbrevet", text: `${n.subs} personer har laddat ner guiden eller vill ha nyhetsbrev.` },
  ];
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Hemsidan" title={<>Ändra på <em>sidan.</em></>} lede="Allt du sparar syns på hemsidan inom en halv minut. Skriv *så här* för kursiv text i lerfärg, som i rubrikerna.">
        <a className="a-btn a-btn--ghost" href="/" target="_blank" rel="noopener">Öppna hemsidan ↗</a>
      </Head>
      <div className="a-grid a-grid--2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="a-card a-stack" style={{ textDecoration: "none" }}>
            <h2>{c.title}</h2><p className="a-muted">{c.text}</p><span className="a-small" style={{ color: "var(--accent)", fontWeight: 600 }}>Ändra →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
