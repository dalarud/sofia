"use client";
import { useState } from "react";
import type { Category } from "@/lib/categories";

type Props = {
  action: (f: FormData) => Promise<void>;
  categories: Category[];
  initial: { id: number; date: string; supplier: string; amount: string; category: string; vatRate: number; paidWith: string; note: string };
  submitLabel: string;
};

/** Formuläret i fokusläget. Kategorin väljer momssats automatiskt, men den går att ändra. */
export function ReceiptForm({ action, categories, initial, submitLabel }: Props) {
  const [cat, setCat] = useState(initial.category);
  const [vat, setVat] = useState(initial.vatRate);
  const [amount, setAmount] = useState(initial.amount);
  const gross = Number(amount.replace(/\s/g, "").replace(",", ".")) || 0;
  const vatAmount = vat ? (gross * vat) / (100 + vat) : 0;

  return (
    <form action={action} className="a-stack">
      <input type="hidden" name="id" value={initial.id} />
      <div className="a-grid a-grid--2">
        <label className="a-field"><span>Belopp att betala (med moms)</span><input name="amount" inputMode="decimal" required autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" /></label>
        <label className="a-field"><span>Datum på kvittot</span><input name="date" type="date" required defaultValue={initial.date} /></label>
      </div>
      <label className="a-field"><span>Var handlade du?</span><input name="supplier" defaultValue={initial.supplier} placeholder="T.ex. Panduro" autoComplete="off" /></label>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="a-stack">
        <legend className="a-field"><span>Vad köpte du?</span></legend>
        <div className="cats">
          {categories.map((c) => (
            <label key={c.id}>
              <input type="radio" name="category" value={c.id} required checked={cat === c.id} onChange={() => { setCat(c.id); setVat(c.vatRate); }} />
              <b>{c.label}</b><small>{c.hint}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="a-row" style={{ alignItems: "flex-end" }}>
        <div className="a-field"><span>Moms på kvittot</span>
          <div className="seg">{[25, 12, 6, 0].map((r) => <label key={r}><input type="radio" name="vatRate" value={r} checked={vat === r} onChange={() => setVat(r)} />{r} %</label>)}</div>
        </div>
        <p className="a-muted a-small">{gross ? `Momsen blir ${vatAmount.toLocaleString("sv-SE", { maximumFractionDigits: 2 })} kr.` : ""} Står det något annat på kvittot? Skriv det exakta beloppet nedan.</p>
      </div>
      <details className="a-more"><summary>Exakt moms, anteckning</summary>
        <div className="a-grid a-grid--2" style={{ marginTop: ".6rem" }}>
          <label className="a-field"><span>Moms i kronor (om den skiljer sig)</span><input name="vatExact" inputMode="decimal" placeholder="Räknas ut automatiskt" /></label>
          <label className="a-field"><span>Anteckning</span><input name="note" defaultValue={initial.note} placeholder="T.ex. till uppdraget hos familjen Ek" /></label>
        </div>
      </details>
      <div className="a-field"><span>Hur betalade du?</span>
        <div className="seg">
          <label><input type="radio" name="paidWith" value="foretag" defaultChecked={initial.paidWith !== "privat"} />Företagets kort/konto</label>
          <label><input type="radio" name="paidWith" value="privat" defaultChecked={initial.paidWith === "privat"} />Mitt privata kort</label>
        </div>
      </div>
      <button className="a-btn a-btn--big" type="submit">{submitLabel}</button>
    </form>
  );
}
