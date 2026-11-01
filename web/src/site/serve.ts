import { getSiteData } from "@/lib/content";
import { renderSite, type PageKey } from "./render";

/** Svarar med en av hemsidans sidor. Vercel sparar sidan i 30 sekunder, så ändringar i administrationen syns nästan direkt. */
export async function servePage(key: PageKey) {
  const html = renderSite(await getSiteData(), key);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}
