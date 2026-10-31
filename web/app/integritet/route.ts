import { getTexts } from "@/lib/content";
import { longText, renderPage } from "@/site/render";

export const dynamic = "force-dynamic";

export async function GET() {
  const t = await getTexts();
  return new Response(renderPage({ title: "Integritetspolicy", eyebrow: "Studio Dalarud", heading: "Så hanterar jag dina uppgifter", body: longText(t["integritet.text"] ?? "") }), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
