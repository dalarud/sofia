/** Belopp hanteras i öre. Hjälpfunktioner för att räkna och visa dem. */

export function kr(ore: number, opts: { decimals?: boolean } = {}): string {
  const showDecimals = opts.decimals ?? ore % 100 !== 0;
  return (ore / 100).toLocaleString("sv-SE", { minimumFractionDigits: showDecimals ? 2 : 0, maximumFractionDigits: showDecimals ? 2 : 0 }) + " kr";
}

/** Momsen i ett belopp inklusive moms, avrundad till hela ören. 25 % moms på 125 kr är 25 kr. */
export function vatFromGross(grossOre: number, ratePercent: number): number {
  if (!ratePercent) return 0;
  return Math.round((grossOre * ratePercent) / (100 + ratePercent));
}

/** Tolkar en kronsumma som användaren skrivit, till exempel "1 995,50" eller "199.5". */
export function parseKr(input: string | null | undefined): number | null {
  if (input == null) return null;
  const s = String(input).replace(/\s|kr/gi, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

/** Datum som YYYY-MM-DD i svensk tid. */
export function today(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
