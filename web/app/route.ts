import { getSiteData } from "@/lib/content";
import { renderSite } from "@/site/render";

export const dynamic = "force-dynamic";

export async function GET() {
  const html = renderSite(await getSiteData());
  // Vercel sparar sidan i 30 sekunder, så ändringar i administrationssidan syns nästan direkt.
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}
