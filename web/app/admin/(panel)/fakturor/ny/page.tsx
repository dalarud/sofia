import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSetting, type AccountingSettings } from "@/lib/content";
import { today } from "@/lib/money";
import { Done, Head, one, type SP } from "@/admin/ui";
import { InvoiceForm } from "@/admin/InvoiceForm";
import { saveInvoice } from "@/admin/invoice-actions";
import { invoiceSuggestions } from "@/admin/invoice-shared";

export default async function NewInvoice({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const leadId = Number(one(sp.forfragan)) || 0;
  const [lead] = leadId ? await db.select().from(schema.leads).where(eq(schema.leads.id, leadId)) : [];
  const [acc, suggestions] = await Promise.all([getSetting<AccountingSettings>("accounting"), invoiceSuggestions()]);
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Fakturor" title={<>Ny <em>faktura.</em></>} lede="Fyll i det du vet. Utkastet sparas och kan ändras tills du skickar det." />
      <InvoiceForm action={async (f: FormData) => { "use server"; if (lead) f.set("leadId", String(lead.id)); await saveInvoice(f); }} suggestions={suggestions}
        initial={{ customer: { name: lead?.name ?? "", email: lead?.email ?? "", address: "", orgNr: "" }, date: today(), days: acc.paymentTermsDays, note: "", lines: [], exVat: false }} />
    </>
  );
}
