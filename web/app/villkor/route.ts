import { getTexts } from "@/lib/content";
import { longText, renderPage } from "@/site/render";

export const dynamic = "force-dynamic";

export async function GET() {
  const t = await getTexts();
  return new Response(renderPage({ title: "Köpvillkor", eyebrow: "Studio Dalarud", heading: "Köpvillkor", body: longText(t["villkor.text"] ?? "") }), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
