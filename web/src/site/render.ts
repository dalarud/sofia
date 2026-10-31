/** Bygger hemsidans HTML från mallen (prototypens design) och innehållet i databasen. */
import fs from "node:fs";
import path from "node:path";
import { kr } from "@/lib/money";
import type { SiteData } from "@/lib/content";

let template: string | null = null;
function getTemplate() {
  if (!template || process.env.NODE_ENV !== "production") {
    template = fs.readFileSync(path.join(process.cwd(), "src/site/template.html"), "utf8");
  }
  return template;
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

export function renderSite(data: SiteData): string {
  const t = (key: string) => rich(data.texts[key] ?? "");

  const services = data.services.map((s, i) => `        <details class="index__row" style="--row: ${TONES[s.tone] ?? TONES.surface}"${i === 0 ? " open" : ""}>
          <summary><span class="index__name">${esc(s.name)}</span><span class="index__short">${esc(s.short)}</span><span class="index__price">${esc(s.priceFrom)}</span><span class="index__plus" aria-hidden="true"></span></summary>
          <div class="index__body">
            ${s.badge ? `<div><span class="index__badge">${esc(s.badge)}</span><p>${rich(s.body)}</p></div>` : `<p>${rich(s.body)}</p>`}
            <ul class="price-list">${s.items.map((it) => `<li><span>${esc(it.label)}</span><span>${esc(it.price)}</span></li>`).join("")}</ul>
            <a class="btn" href="#kontakt" data-service="${esc(s.name)}">${esc(s.contactLabel)}</a>
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

  const payload = {
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

  return getTemplate()
    .replaceAll("{{version}}", process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev")
    .replace("{{data}}", JSON.stringify(payload).replace(/</g, "\\u003c"))
    .replace("{{services}}", services)
    .replace("{{tips}}", tips)
    .replace("{{giftTypes}}", giftTypes)
    .replace("{{portrait}}", portrait)
    .replace("Inklusive moms. Frakt 69 kr, fri frakt över 800 kr. Hämta gratis i ateljén.", esc(shippingText))
    .replaceAll("{{year}}", String(new Date().getFullYear()))
    .replace("{{legal}}", legal)
    .replace(/\{\{t:([a-z0-9.]+)\}\}/g, (_, key) => t(key))
    .replace(/\{\{s:company\.([a-zA-Z]+)\}\}/g, (_, key) => esc(company[key] ?? ""));
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
