/** Bygger hemsidans HTML från mallen (prototypens design) och innehållet i databasen. */
import fs from "node:fs";
import path from "node:path";
import { kr } from "@/lib/money";
import type { SiteData } from "@/lib/content";

const cache = new Map<string, string>();
function readSite(rel: string) {
  if (!cache.has(rel) || process.env.NODE_ENV !== "production") cache.set(rel, fs.readFileSync(path.join(process.cwd(), "src/site", rel), "utf8"));
  return cache.get(rel)!;
}

export type PageKey = "start" | "hjalp" | "ateljen" | "manniskohemmet" | "rohemmet" | "ro-i-vardagen" | "om";
type PageDef = { title: string; description: string; nav?: string; head?: { eyebrow: string; heading: string; lede: string; crumb?: [string, string] }; sections: string[] };

/** Sidorna och vilka sektioner de består av. Texterna i sidhuvudena går att ändra under Hemsidan → Texter. */
export const PAGES: Record<PageKey, PageDef> = {
  start: { title: "Studio Dalarud – Från brus till ro", description: "Inredning, homestaging och lugna rum, och föremål i lera. Studio Dalarud formger hem som är snälla mot den som bor där.",
    sections: ["hero", "start-dorrar", "manifest", "start-vision"] },
  hjalp: { title: "Hjälp hemma – Studio Dalarud", description: "Inredning, homestaging, inflyttning och Lugna rum. Hembesök med Ro-kartan, fasta priser och hjälp hela vägen.", nav: "hjalp",
    head: { eyebrow: "Hjälp hemma", heading: "sida.hjalp.rubrik", lede: "sida.hjalp.ingress" }, sections: ["tjanster", "rokartan", "steg", "ro-modellen", "kontakt"] },
  ateljen: { title: "Ateljén – Studio Dalarud", description: "Föremål i självtorkande lera, kurser och presentkort från Studio Dalarud.", nav: "ateljen",
    sections: ["ateljen", "kurser", "presentkort"] },
  manniskohemmet: { title: "Människohemmet – Studio Dalarud", description: "Ett hem format efter människan, inte tvärtom. Idén om Människohemmet och dess fem delkoncept: Ro, Jord, Växt, Bord och År.", nav: "manniskohemmet",
    head: { eyebrow: "Efter folkhemmet", heading: "sida.mh.rubrik", lede: "sida.mh.ingress" }, sections: ["mh-folkhemmet", "mh-vision", "mh-modell", "mh-mal", "mh-vidare"] },
  rohemmet: { title: "Rohemmet – Ett snällt hem åt alla", description: "Manifestet Ro åt alla, tio principer och Ro-måtten: riktvärden för ljus, höjder, färg, ljud och vila. Ladda ner skriften gratis.", nav: "manniskohemmet",
    head: { eyebrow: "Ett delkoncept i Människohemmet", heading: "sida.rohem.rubrik", lede: "sida.rohem.ingress", crumb: ["/manniskohemmet", "Människohemmet"] }, sections: ["rh-manifest", "rh-principer", "rh-forskning", "rh-matten", "rh-horna", "rh-skriften"] },
  "ro-i-vardagen": { title: "Ro i vardagen – Studio Dalarud", description: "Ro-testet, ritualer, årstider, tips och en gratis guide för ett lugnare hem.", nav: "ro-i-vardagen",
    head: { eyebrow: "Ro i vardagen", heading: "sida.liv.rubrik", lede: "sida.liv.ingress" }, sections: ["liv-testet", "liv-ritualer", "liv-arstider", "tips", "liv-ord", "guide", "liv-gemenskap"] },
  om: { title: "Om Sofia – Studio Dalarud", description: "Sofia Dalarud är förskollärare, inredare och formgivare i lera. Om hur Studio Dalarud blev till.", nav: "om",
    head: { eyebrow: "Om Sofia", heading: "sida.om.rubrik", lede: "sida.om.ingress" }, sections: ["om", "om-berattelse"] },
};

/** Färgerna för Människohemmets fem delkoncept, i ordning. */
const PART_COLORS = ["#8F7F92", "#9B5E49", "#6F7D62", "#B88A62", "#A8946E"];
const SEASON_COLORS = [["#6F7D62", "#F3EEE6"], ["#6E5F72", "#F3EEE6"], ["#B9A584", "#2B362E"], ["#A88E6C", "#F3EEE6"]];

/** Rader i en text: en per rad, fält åtskilda med |. */
export function rowsOf(s: string): string[][] {
  return (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((x) => x.trim()));
}

function renderRows(value: string, kind: string): string {
  const rows = rowsOf(value);
  return rows.map((r, i) => {
    const [a = "", b = "", c = "", d = "", e = ""] = r;
    switch (kind) {
      case "li": return `<li>${rich(a)}</li>`;
      case "blind": return `<div><b>${rich(a)}</b><span>${rich(b)}</span></div>`;
      case "goal": return `<li><b>${rich(a)}</b><span>${rich(b)}</span></li>`;
      case "principle": return `<li class="principle"><h3>${rich(a)}</h3><p>${rich(b)}</p>${c ? `<p class="principle__try"><b>Prova</b> ${rich(c)}</p>` : ""}</li>`;
      case "measure": return `<div><dt>${rich(a)}</dt><dd>${rich(b)}</dd></div>`;
      case "word": return `<div><dt>${rich(a)}</dt><dd>${rich(b)}</dd></div>`;
      case "type": return `<div><dt>${rich(a)}</dt><dd>${rich(b)}</dd></div>`;
      case "evidence": { const g = d.toLowerCase(); const cls = g.startsWith("stark") ? "stark" : g.startsWith("måttlig") ? "mattlig" : g.startsWith("indirekt") ? "indirekt" : "sunt"; return `<div class="evidence__row"><b>${rich(a)}</b><span>${rich(b)}</span><small>${rich(c)}</small><i class="grade grade--${cls}">${rich(d)}</i></div>`; }
      case "club": return `<div><h3>${rich(a)}</h3><p>${rich(b)}</p></div>`;
      case "ritual": return `<div class="ritual"><span class="ritual__when">${rich(b)}</span><h3>${rich(a)}</h3><p>${rich(c)}</p></div>`;
      case "season": { const [bg, fg] = SEASON_COLORS[i % 4]; return `<div class="season" style="background:${bg};color:${fg}"><span>${rich(b)}</span><h3>${rich(a)}</h3><p>${rich(c)}</p>${d ? `<p class="season__meta">${rich(d)}</p>` : ""}</div>`; }
      case "part": return `<article class="part" id="del-${i}"><div><h3>${rich(a)}</h3><p class="part__sub">${rich(b)}</p><i class="part__bar" style="background:${PART_COLORS[i % 5]}"></i></div><p class="part__idea">${rich(d)}</p><dl><div><dt>Behovet</dt><dd>${rich(c)}</dd></div><div><dt>I företaget</dt><dd>${rich(e)}</dd></div></dl></article>`;
      default: return `<p>${rich(r.join(" "))}</p>`;
    }
  }).join("");
}

export function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Text från administrationssidan: escapas, och *ord* blir kursivt. */
export function rich(s: string): string {
  return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/** Enkel formatering för längre texter som köpvillkor: ## rubriker och stycken. */
export function longText(s: string): string {
  return s.split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (b.startsWith("## ")) {
      const title = b.slice(3).split("\n")[0];
      const id = title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const rest = b.split("\n").slice(1).join(" ").trim();
      return `<h2 id="${id}">${rich(title)}</h2>${rest ? `<p>${rich(rest)}</p>` : ""}`;
    }
    return `<p>${rich(b.replace(/\n/g, " "))}</p>`;
  }).join("\n");
}

const TONES: Record<string, string> = { surface: "var(--surface-2)", clay: "var(--clay-soft)", moss: "var(--moss-soft)" };

export function fileUrl(id: string | null | undefined) {
  return id ? `/api/filer/${id}` : null;
}

export function renderSite(data: SiteData, key: PageKey = "start"): string {
  const page = PAGES[key];
  const t = (key: string) => rich(data.texts[key] ?? "");

  const services = data.services.map((s, i) => `        <details class="index__row" style="--row: ${TONES[s.tone] ?? TONES.surface}"${i === 0 ? " open" : ""}>
          <summary><span class="index__name">${esc(s.name)}</span><span class="index__short">${esc(s.short)}</span><span class="index__price">${esc(s.priceFrom)}</span><span class="index__plus" aria-hidden="true"></span></summary>
          <div class="index__body">
            ${s.badge ? `<div><span class="index__badge">${esc(s.badge)}</span><p>${rich(s.body)}</p></div>` : `<p>${rich(s.body)}</p>`}
            <ul class="price-list">${s.items.map((it) => `<li><span>${esc(it.label)}</span><span>${esc(it.price)}</span></li>`).join("")}</ul>
            <a class="btn" href="/hjalp?tjanst=${encodeURIComponent(s.name)}#kontakt" data-service="${esc(s.name)}">${esc(s.contactLabel)}</a>
          </div>
        </details>`).join("\n");

  const tips = data.tips.map((tip) => `        <article class="advice"><span class="advice__cat">${esc(tip.category)}</span><h3>${esc(tip.title)}</h3><p>${rich(tip.body)}</p></article>`).join("\n");

  const giftTypes = data.gifts.map((g, i) =>
    `            <button class="chip" type="button" data-gift="${esc(g.kind)}" data-amount="${g.amountOre ? g.amountOre / 100 : "valfritt"}" aria-pressed="${i === 0}">${esc(g.kind)}</button>`).join("\n");

  const portraitUrl = fileUrl(data.site.portraitImageId);
  const portrait = portraitUrl
    ? `<div class="portrait__img"><img src="${portraitUrl}" alt="Sofia Dalarud i ateljén"></div>`
    : `<div class="portrait__img" role="img" aria-label="Plats för porträtt av Sofia i ateljén"><span>porträtt av Sofia</span></div>`;

  const shop = data.shop;
  const shippingText = `Inklusive moms. Frakt ${kr(shop.shippingOre)}, fri frakt över ${kr(shop.freeShippingFromOre)}.${shop.pickup ? " Hämta gratis i ateljén." : ""}`;

  const payload: Record<string, unknown> = {
    products: data.products.map((p, i) => ({
      id: p.id, name: p.name, price: p.priceOre / 100, shape: p.shape, glaze: p.glaze, cat: p.category, text: p.text, badge: p.badge,
      option: p.option ? { id: p.option.id, label: p.option.label, price: p.option.priceOre / 100 } : null,
      image: fileUrl(p.imageId), soldOut: p.stock !== null && p.stock <= 0, seed: 300 + i * 17,
    })),
    events: data.events.map((e) => ({
      id: e.id, date: e.date, time: e.time, kind: e.kind, label: e.label, title: e.title, place: e.place, text: e.text,
      price: e.priceOre / 100, spots: e.seats, left: Math.max(0, e.seats - e.booked),
    })),
  };

  const company = data.company as unknown as Record<string, unknown>;
  const legal = data.company.fSkatt ? " · Innehar F-skattsedel" : "";

  const head = page.head ? readSite("sections/page-head.html")
    .replace("{{crumb}}", page.head.crumb ? `<a class="crumb" href="${page.head.crumb[0]}">${esc(page.head.crumb[1])}</a> <span class="crumb__sep" aria-hidden="true">/</span> ` : "")
    .replace("{{eyebrow}}", esc(page.head.eyebrow))
    .replace("{{heading}}", t(page.head.heading))
    .replace("{{lede}}", t(page.head.lede)) : "";
  const main = head + page.sections.map((name) => readSite(`sections/${name}.html`)).join("\n");
  payload.parts = rowsOf(data.texts["mh.delar"] ?? "").map((r, i) => ({ name: r[0] ?? "", sub: r[1] ?? "", need: r[2] ?? "", idea: r[3] ?? "", biz: r[4] ?? "", color: PART_COLORS[i % 5] }));

  return readSite("layout.html")
    .replace("{{main}}", () => main)
    .replaceAll("{{page}}", key)
    .replaceAll("{{title}}", esc(page.title))
    .replaceAll("{{description}}", esc(page.description))
    .replace(page.nav ? `data-nav="${page.nav}"` : "data-nav=\"__none\"", page.nav ? `data-nav="${page.nav}" aria-current="page"` : "")
    .replaceAll("{{version}}", process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev")
    .replace("{{data}}", () => JSON.stringify(payload).replace(/</g, "\\u003c"))
    .replace("{{services}}", () => services)
    .replace("{{tips}}", () => tips)
    .replace("{{giftTypes}}", () => giftTypes)
    .replace("{{portrait}}", () => portrait)
    .replace("Inklusive moms. Frakt 69 kr, fri frakt över 800 kr. Hämta gratis i ateljén.", () => esc(shippingText))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{legal}}", () => legal)
    .replace(/\{\{rows:([a-z0-9.]+):([a-z]+)\}\}/g, (_, k, kind) => renderRows(data.texts[k] ?? "", kind))
    .replace(/\{\{paras:([a-z0-9.]+)\}\}/g, (_, k) => rowsOf(data.texts[k] ?? "").map((r) => `<p>${rich(r.join(" | "))}</p>`).join(""))
    .replace(/\{\{t:([a-z0-9.]+)\}\}/g, (_, k) => t(k))
    .replace(/\{\{s:company\.([a-zA-Z]+)\}\}/g, (_, k) => esc(company[k] ?? ""));
}

/** Enkel sida i hemsidans stil, för köpvillkor, integritet och tack-sidor. */
export function renderPage(opts: { title: string; eyebrow: string; heading: string; body: string; script?: string }): string {
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)} – Studio Dalarud</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/site.css">
<style>.page-simple{max-width:46rem;margin:0 auto;padding:4rem max(16px,env(safe-area-inset-left,0px)) 5rem}.page-simple h1{font-size:var(--step-3);margin:.9rem 0 2rem}.page-simple h2{font-size:1.7rem;margin:2.2rem 0 .6rem}.page-simple p{max-width:60ch;margin:0 0 1rem}.page-simple .back{display:inline-block;margin-top:2.5rem}</style>
</head>
<body>
<main class="page-simple">
<p class="eyebrow">${esc(opts.eyebrow)}</p>
<h1>${opts.heading}</h1>
${opts.body}
<a class="btn btn--ghost back" href="/">Till startsidan</a>
</main>
${opts.script ? `<script>${opts.script}</script>` : ""}
</body>
</html>`;
}
