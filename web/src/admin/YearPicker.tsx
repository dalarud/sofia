import Link from "next/link";
export function YearPicker({ year, base, years }: { year: number; base: string; years: number[] }) {
  return (
    <div className="seg" role="group" aria-label="År">
      {years.map((y) => <Link key={y} href={`${base}?ar=${y}`} style={{ padding: ".6rem 1rem", textDecoration: "none", ...(y === year ? { background: "var(--fg)", color: "var(--bg)" } : {}) }}>{y}</Link>)}
    </div>
  );
}
