import fs from "node:fs";
import path from "node:path";

let logo: string | null = null;
export function logoSvg(): string {
  if (!logo) logo = fs.readFileSync(path.join(process.cwd(), "assets/logotyp-webb.svg"), "utf8");
  return logo;
}

/** Besked efter en åtgärd, styrt av ?klart=... eller ?fel=... i adressen. */
export function Done({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const ok = one(sp.klart), err = one(sp.fel);
  return (
    <>
      {ok ? <p className="a-banner" role="status">{ok}</p> : null}
      {err ? <p className="a-banner a-banner--warn" role="alert">{err}</p> : null}
    </>
  );
}

export function Warn({ children }: { children: React.ReactNode }) {
  return <p className="a-banner a-banner--warn" role="alert">{children}</p>;
}

export function Head({ eyebrow, title, lede, children }: { eyebrow: string; title: React.ReactNode; lede?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="a-head">
      <div>
        <p className="a-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lede ? <p>{lede}</p> : null}
      </div>
      {children ? <div className="a-row">{children}</div> : null}
    </header>
  );
}

export function dateSv(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso) : iso;
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Stockholm" });
}

export type SP = Promise<Record<string, string | string[] | undefined>>;
export function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
