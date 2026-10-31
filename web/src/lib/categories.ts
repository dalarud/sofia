/**
 * Kategorier för kvitton, med vardagliga namn. Sofia väljer kategori, och systemet väljer konto
 * och föreslår momssats. Kontonumren följer BAS-kontoplanen.
 */
export type Category = { id: string; label: string; hint: string; account: number; vatRate: number };

export const CATEGORIES: Category[] = [
  { id: "lera", label: "Lera, färg och material", hint: "Lera, färg, lack, snöre, glasinsatser", account: 4010, vatRate: 25 },
  { id: "uppdrag", label: "Inköp till ett uppdrag", hint: "Inredning och detaljer som köps in till en kund", account: 4010, vatRate: 25 },
  { id: "forbrukning", label: "Förbrukning och emballage", hint: "Kartonger, silkespapper, tejp, städmaterial", account: 5460, vatRate: 25 },
  { id: "inventarier", label: "Verktyg och inventarier", hint: "Verktyg, lampor, möbler till ateljén (under halva prisbasbeloppet)", account: 5410, vatRate: 25 },
  { id: "kontor", label: "Kontor och papper", hint: "Skrivare, papper, pärmar, pennor", account: 6110, vatRate: 25 },
  { id: "program", label: "Program och webb", hint: "Svenska abonnemang på program och webbtjänster", account: 5420, vatRate: 25 },
  { id: "telefon", label: "Telefon och internet", hint: "Mobilabonnemang och bredband för företaget", account: 6212, vatRate: 25 },
  { id: "porto", label: "Porto och frakt", hint: "Paket och frimärken", account: 6250, vatRate: 25 },
  { id: "resor", label: "Resor", hint: "Tåg, buss och parkering i tjänsten", account: 5800, vatRate: 6 },
  { id: "marknad", label: "Marknadsföring", hint: "Annonser, trycksaker, marknadsplatser", account: 5910, vatRate: 25 },
  { id: "lokal", label: "Ateljé och lokal", hint: "Hyra för ateljén", account: 5010, vatRate: 25 },
  { id: "utbildning", label: "Kurser och utbildning", hint: "Kurser för att lära dig mer i jobbet", account: 7610, vatRate: 25 },
  { id: "forsakring", label: "Försäkring", hint: "Företagsförsäkring (ingen moms)", account: 6310, vatRate: 0 },
  { id: "bank", label: "Bankavgifter", hint: "Avgifter för konto och kort (ingen moms)", account: 6570, vatRate: 0 },
  { id: "ovrigt", label: "Övrigt", hint: "Annat som behövs i företaget", account: 6991, vatRate: 25 },
];

export const VAT_RATES = [25, 12, 6, 0] as const;

export function categoryById(id: string | null | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
