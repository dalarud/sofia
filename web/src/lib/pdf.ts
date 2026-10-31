/** PDF:er i profilens stil: faktura och presentkort. */
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { kr, vatFromGross } from "./money";
import type { Company } from "./content";
import type { InvoiceCustomer, InvoiceLine } from "@/db/schema";

const C = { granskog: rgb(43 / 255, 54 / 255, 46 / 255), lera: rgb(155 / 255, 94 / 255, 73 / 255), linne: rgb(243 / 255, 238 / 255, 230 / 255), muted: rgb(93 / 255, 100 / 255, 88 / 255), line: rgb(208 / 255, 195 / 255, 175 / 255), ljus: rgb(212 / 255, 156 / 255, 130 / 255) };
const asset = (p: string) => fs.readFileSync(path.join(process.cwd(), "assets", p));
const mm = (v: number) => (v * 72) / 25.4;

async function setup() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fonts = {
    regular: await doc.embedFont(asset("fonts/HankenGrotesk-Regular.ttf"), { subset: true }),
    bold: await doc.embedFont(asset("fonts/HankenGrotesk-SemiBold.ttf"), { subset: true }),
    serif: await doc.embedFont(asset("fonts/InstrumentSerif-Regular.ttf"), { subset: true }),
    italic: await doc.embedFont(asset("fonts/InstrumentSerif-Italic.ttf"), { subset: true }),
    hand: await doc.embedFont(asset("fonts/Caveat-Regular.ttf"), { subset: true }),
  };
  return { doc, fonts };
}

function text(page: PDFPage, s: string, x: number, y: number, font: PDFFont, size: number, color = C.granskog, align: "left" | "right" = "left") {
  const w = font.widthOfTextAtSize(s, size);
  page.drawText(s, { x: align === "right" ? x - w : x, y, size, font, color });
}

function wrap(s: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of s.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const t = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
}

export type InvoiceForPdf = {
  number: number; date: string; dueDate: string; customer: InvoiceCustomer; lines: InvoiceLine[]; note: string;
  totalOre: number; vatOre: number; payUrl?: string | null; credit?: boolean;
};

export async function invoicePdf(inv: InvoiceForPdf, company: Company): Promise<Uint8Array> {
  const { doc, fonts } = await setup();
  const page = doc.addPage([mm(210), mm(297)]);
  const W = mm(210), L = mm(20), R = W - mm(20);
  page.drawRectangle({ x: 0, y: 0, width: W, height: mm(297), color: rgb(1, 1, 1) });

  const logo = await doc.embedPng(asset("logo.png"));
  const lw = mm(56);
  page.drawImage(logo, { x: L, y: mm(297 - 34), width: lw, height: (lw * logo.height) / logo.width });
  text(page, inv.credit ? "Kreditfaktura" : "Faktura", R, mm(297 - 26), fonts.serif, 30, C.granskog, "right");

  let y = mm(297 - 52);
  const meta: [string, string][] = [["Fakturanummer", String(inv.number)], ["Fakturadatum", inv.date], ["Förfallodatum", inv.dueDate]];
  for (const [k, v] of meta) { text(page, k.toUpperCase(), R - mm(58), y, fonts.bold, 7.5, C.muted); text(page, v, R, y, fonts.regular, 10, C.granskog, "right"); y -= mm(6); }

  let cy = mm(297 - 52);
  text(page, "FAKTURA TILL", L, cy, fonts.bold, 7.5, C.muted); cy -= mm(6);
  for (const l of [inv.customer.name, ...(inv.customer.address ?? "").split("\n"), inv.customer.orgNr ? `Org.nr ${inv.customer.orgNr}` : ""].filter(Boolean)) {
    text(page, l, L, cy, fonts.regular, 10.5); cy -= mm(5.2);
  }

  y = Math.min(y, cy) - mm(12);
  const cols = { text: L, qty: R - mm(68), unit: R - mm(36), sum: R };
  text(page, "BESKRIVNING", cols.text, y, fonts.bold, 7.5, C.muted);
  text(page, "ANTAL", cols.qty, y, fonts.bold, 7.5, C.muted, "right");
  text(page, "À-PRIS", cols.unit, y, fonts.bold, 7.5, C.muted, "right");
  text(page, "SUMMA", cols.sum, y, fonts.bold, 7.5, C.muted, "right");
  y -= mm(3);
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.8, color: C.granskog });
  y -= mm(7);
  for (const line of inv.lines) {
    const rows = wrap(`${line.text}${line.vatRate !== 25 ? ` (moms ${line.vatRate} %)` : ""}`, fonts.regular, 10, cols.qty - cols.text - mm(22));
    text(page, String(line.qty).replace(".", ","), cols.qty, y, fonts.regular, 10, C.granskog, "right");
    text(page, kr(line.unitOre, { decimals: true }), cols.unit, y, fonts.regular, 10, C.granskog, "right");
    text(page, kr(Math.round(line.unitOre * line.qty), { decimals: true }), cols.sum, y, fonts.regular, 10, C.granskog, "right");
    for (const r of rows) { text(page, r, cols.text, y, fonts.regular, 10); y -= mm(5); }
    y -= mm(1.5);
    page.drawLine({ start: { x: L, y: y + mm(2.5) }, end: { x: R, y: y + mm(2.5) }, thickness: 0.4, color: C.line });
  }

  y -= mm(4);
  const vatByRate = new Map<number, number>();
  for (const l of inv.lines) vatByRate.set(l.vatRate, (vatByRate.get(l.vatRate) ?? 0) + vatFromGross(Math.round(l.unitOre * l.qty), l.vatRate));
  const sums: [string, string][] = [["Belopp utan moms", kr(inv.totalOre - inv.vatOre, { decimals: true })]];
  for (const [rate, v] of [...vatByRate.entries()].sort((a, b) => b[0] - a[0])) if (rate) sums.push([`Moms ${rate} %`, kr(v, { decimals: true })]);
  for (const [k, v] of sums) { text(page, k, R - mm(36), y, fonts.regular, 10, C.muted, "right"); text(page, v, R, y, fonts.regular, 10, C.granskog, "right"); y -= mm(5.5); }
  y -= mm(2);
  text(page, inv.credit ? "Att återbetala" : "Att betala", R - mm(36), y, fonts.bold, 11, C.granskog, "right");
  text(page, kr(inv.totalOre, { decimals: true }), R, y, fonts.italic, 20, C.lera, "right");

  y -= mm(16);
  if (!inv.credit) {
    text(page, "SÅ BETALAR DU", L, y, fonts.bold, 7.5, C.muted); y -= mm(6);
    const pay = [
      company.bankgiro ? `Bankgiro ${company.bankgiro}` : "",
      company.swish ? `Swish ${company.swish}` : "",
      `Märk betalningen med fakturanummer ${inv.number}.`,
      inv.payUrl ? `Eller betala med kort eller Klarna: ${inv.payUrl}` : "",
    ].filter(Boolean);
    for (const p of pay) for (const r of wrap(p, fonts.regular, 10, R - L)) { text(page, r, L, y, fonts.regular, 10); y -= mm(5); }
  }
  if (inv.note) { y -= mm(4); for (const r of wrap(inv.note, fonts.regular, 10, R - L)) { text(page, r, L, y, fonts.regular, 10, C.muted); y -= mm(5); } }

  // Sidfot med uppgifter som krävs på en faktura
  const foot = [
    [company.name, company.owner, company.address].filter(Boolean).join(" · "),
    [company.orgNr ? `Org.nr ${company.orgNr}` : "", company.vatNr ? `Momsreg.nr ${company.vatNr}` : "", company.fSkatt ? "Innehar F-skattsedel" : ""].filter(Boolean).join(" · "),
    [company.email, company.phone].filter(Boolean).join(" · "),
  ].filter(Boolean);
  let fy = mm(22);
  page.drawLine({ start: { x: L, y: fy + mm(6) }, end: { x: R, y: fy + mm(6) }, thickness: 0.4, color: C.line });
  for (const f of foot) { text(page, f, W / 2 - fonts.regular.widthOfTextAtSize(f, 8) / 2, fy, fonts.regular, 8, C.muted); fy -= mm(4.2); }

  doc.setTitle(`Faktura ${inv.number} – ${company.name}`);
  doc.setAuthor(company.name);
  return doc.save();
}

export type GiftCardForPdf = { code: string; kind: string; amountOre: number; toName?: string | null; fromName?: string | null; message?: string | null; expiresAt: string };

/** Presentkort i A5 liggande, i granskog med den ljusa logotypen. */
export async function giftCardPdf(card: GiftCardForPdf, company: Company): Promise<Uint8Array> {
  const { doc, fonts } = await setup();
  const W = mm(210), H = mm(148);
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.granskog });
  const logo = await doc.embedPng(asset("logo-ljus.png"));
  const lw = mm(62);
  page.drawImage(logo, { x: mm(16), y: H - mm(16) - (lw * logo.height) / logo.width, width: lw, height: (lw * logo.height) / logo.width });
  text(page, "PRESENTKORT", W - mm(16), H - mm(20), fonts.bold, 9, C.linne, "right");

  text(page, card.kind === "Valfritt belopp" ? "Att använda i ateljén" : card.kind, mm(16), H - mm(62), fonts.serif, 26, C.linne);
  text(page, kr(card.amountOre), mm(16), H - mm(80), fonts.italic, 46, C.ljus);

  let y = H - mm(98);
  if (card.toName) { text(page, `TILL ${card.toName.toUpperCase()}${card.fromName ? ` FRÅN ${card.fromName.toUpperCase()}` : ""}`, mm(16), y, fonts.bold, 9, C.linne); y -= mm(9); }
  if (card.message) for (const r of wrap(card.message, fonts.hand, 18, W - mm(32)).slice(0, 3)) { text(page, r, mm(16), y, fonts.hand, 18, C.linne); y -= mm(7); }

  text(page, `Kod ${card.code}`, mm(16), mm(14), fonts.bold, 10, C.linne);
  text(page, `Gäller till ${card.expiresAt} · Boka på ${company.email}`, W - mm(16), mm(14), fonts.regular, 8.5, C.linne, "right");
  doc.setTitle(`Presentkort ${card.code} – ${company.name}`);
  return doc.save();
}
