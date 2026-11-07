"use client";
import { useState } from "react";

type Line = { text: string; qty: string; price: string; vatRate: number; rut?: boolean };
type Props = {
  action: (f: FormData) => Promise<void>;
  initial: { id?: number; customer: { name: string; email: string; address: string; orgNr: string; pnr: string }; date: string; days: number; note: string; lines: Line[]; exVat: boolean };
  suggestions: { text: string; price: string; vatRate: number; rut?: boolean }[];
};

const num = (s: string) => Number(String(s).replace(/\s/g, "").replace(",", ".")) || 0;
const fmt = (n: number) => n.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr";

export function InvoiceForm({ action, initial, suggestions }: Props) {
  const [lines, setLines] = useState<Line[]>(initial.lines.length ? initial.lines : [{ text: "", qty: "1", price: "", vatRate: 25 }]);
  const [exVat, setExVat] = useState(initial.exVat);
  const set = (i: number, patch: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  let total = 0, vat = 0, rutLabor = 0;
  for (const l of lines) {
    const base = num(l.qty) * num(l.price);
    const gross = exVat ? base * (1 + l.vatRate / 100) : base;
    total += gross; vat += gross - gross / (1 + l.vatRate / 100);
    if (l.rut) rutLabor += gross;
  }
  const rut = exVat ? 0 : Math.floor(rutLabor * 0.5);
  const anyRut = lines.some((l) => l.rut);
  return (
    <form action={action} className="a-stack">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <section className="a-card a-stack">
        <h2>Till vem?</h2>
        <div className="a-grid a-grid--2">
          <label className="a-field"><span>Namn eller företag</span><input name="name" required defaultValue={initial.customer.name} /></label>
          <label className="a-field"><span>E-post</span><input name="email" type="email" defaultValue={initial.customer.email} /><small>Fakturan skickas hit som PDF.</small></label>
          <label className="a-field"><span>Adress</span><textarea name="address" rows={3} style={{ minHeight: "5rem" }} defaultValue={initial.customer.address} /></label>
          <label className="a-field"><span>Organisationsnummer (om företag)</span><input name="orgNr" defaultValue={initial.customer.orgNr} /></label>
          <label className="a-field"><span>Personnummer (för rutavdrag)</span><input name="pnr" defaultValue={initial.customer.pnr} placeholder="ÅÅÅÅMMDD-XXXX" inputMode="numeric" /><small>Behövs när Skatteverket ska betala rutavdraget. Visas inte på fakturan.</small></label>
        </div>
      </section>
      <section className="a-card a-stack">
        <div className="a-row" style={{ justifyContent: "space-between" }}>
          <h2>Vad?</h2>
          <label className="a-check"><input type="checkbox" name="exVat" checked={exVat} onChange={(e) => setExVat(e.target.checked)} />Priserna är utan moms (för företagskunder)</label>
        </div>
        {suggestions.length ? (
          <div className="a-row a-small"><span className="a-muted">Lägg till:</span>
            {suggestions.map((s) => <button key={s.text} type="button" className="a-btn a-btn--quiet" onClick={() => setLines([...lines.filter((l) => l.text || l.price), { text: s.text, qty: "1", price: s.price, vatRate: s.vatRate, rut: !!s.rut }])}>+ {s.text}</button>)}
          </div>
        ) : null}
        <div className="lines">
          {lines.map((l, i) => (
            <div className="line-row" key={i}>
              <label className="a-field"><span>Beskrivning</span><input value={l.text} onChange={(e) => set(i, { text: e.target.value })} required placeholder="T.ex. Rumsstyling barnrum" /></label>
              <label className="a-field"><span>Antal</span><input value={l.qty} onChange={(e) => set(i, { qty: e.target.value })} inputMode="decimal" /></label>
              <label className="a-field"><span>À-pris {exVat ? "utan" : "med"} moms</span><input value={l.price} onChange={(e) => set(i, { price: e.target.value })} inputMode="decimal" required /></label>
              <label className="a-field"><span>Moms</span><select value={l.vatRate} onChange={(e) => set(i, { vatRate: Number(e.target.value) })}>{[25, 12, 6, 0].map((r) => <option key={r} value={r}>{r} %</option>)}</select></label>
              <label className="a-check line-row__rut" title="Packning, uppackning, möblering och transport till försäljning. Inte planering, råd eller styling."><input type="checkbox" checked={!!l.rut} onChange={(e) => set(i, { rut: e.target.checked })} />Rut</label>
              <button type="button" className="a-btn a-btn--quiet" aria-label="Ta bort raden" onClick={() => setLines(lines.length > 1 ? lines.filter((_, j) => j !== i) : [{ text: "", qty: "1", price: "", vatRate: 25 }])}>×</button>
            </div>
          ))}
        </div>
        <button type="button" className="a-btn a-btn--ghost" style={{ justifySelf: "start" }} onClick={() => setLines([...lines, { text: "", qty: "1", price: "", vatRate: 25 }])}>+ Lägg till rad</button>
        {anyRut ? <p className="a-small a-muted">Rut gäller bara det praktiska arbetet: packning, uppackning, att flytta och montera möbler och transport till försäljning. Planering, råd och styling ska stå på egna rader utan rut.{exVat ? " Rutavdrag gäller bara privatpersoner, så det räknas inte när priserna är utan moms." : ""}</p> : null}
        <p style={{ textAlign: "right" }}><span className="a-muted">Varav moms {fmt(vat)} · </span>{rut ? <span className="a-muted">Summa {fmt(total)} · Rutavdrag −{fmt(rut)} · </span> : null}<b style={{ fontSize: "1.3rem" }}>Att betala {fmt(total - rut)}</b></p>
      </section>
      <section className="a-card a-grid a-grid--3">
        <label className="a-field"><span>Fakturadatum</span><input type="date" name="date" defaultValue={initial.date} required /></label>
        <label className="a-field"><span>Dagar att betala</span><input name="days" inputMode="numeric" defaultValue={initial.days} /></label>
        <label className="a-field" style={{ gridColumn: "1 / -1" }}><span>Meddelande på fakturan</span><input name="note" defaultValue={initial.note} placeholder="T.ex. Tack för ett fint samarbete!" /></label>
      </section>
      <div className="a-row">
        <button className="a-btn a-btn--big" type="submit" name="next" value="visa">Spara och förhandsgranska</button>
        <span className="a-muted a-small">Inget skickas förrän du trycker på Skicka.</span>
      </div>
    </form>
  );
}
