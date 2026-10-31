import { notFound, redirect } from "next/navigation";
import { getInvoice } from "@/lib/invoices";
import { Done, Head, type SP } from "@/admin/ui";
import { InvoiceForm } from "@/admin/InvoiceForm";
import { saveInvoice } from "@/admin/invoice-actions";
import { invoiceSuggestions } from "@/admin/invoice-shared";
import { oreToKr } from "@/admin/form";

export default async function EditInvoice({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const sp = await searchParams;
  const inv = await getInvoice(Number((await params).id)).catch(() => null);
  if (!inv) notFound();
  if (inv.status !== "utkast") redirect(`/admin/fakturor/${inv.id}`);
  const days = Math.round((new Date(inv.dueDate).getTime() - new Date(inv.date).getTime()) / 86400000);
  return (
    <>
      <Done sp={sp} />
      <Head eyebrow="Fakturor" title={<>Ändra <em>utkastet.</em></>} />
      <InvoiceForm action={saveInvoice} suggestions={await invoiceSuggestions()}
        initial={{ id: inv.id, customer: { name: inv.customer.name, email: inv.customer.email ?? "", address: inv.customer.address ?? "", orgNr: inv.customer.orgNr ?? "" }, date: inv.date, days, note: inv.note, exVat: false,
          lines: inv.lines.map((l) => ({ text: l.text, qty: String(l.qty).replace(".", ","), price: oreToKr(l.unitOre), vatRate: l.vatRate })) }} />
    </>
  );
}
