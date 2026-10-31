import { isAdmin } from "@/lib/auth";
import { getInvoice } from "@/lib/invoices";
import { getSetting, type Company } from "@/lib/content";
import { invoicePdf } from "@/lib/pdf";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Logga in först", { status: 401 });
  const inv = await getInvoice(Number((await params).id)).catch(() => null);
  if (!inv) return new Response("Finns inte", { status: 404 });
  const credit = new URL(req.url).searchParams.get("kredit") === "1" && inv.status === "krediterad";
  const company = await getSetting<Company>("company");
  const pdf = await invoicePdf({ ...inv, number: inv.number ?? 0, credit, note: credit ? `Kreditering av faktura ${inv.number}.` : inv.note }, company);
  const name = inv.number ? `${credit ? "kreditfaktura" : "faktura"}-${inv.number}.pdf` : "fakturautkast.pdf";
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${name}"`, "Cache-Control": "private, no-store" } });
}
