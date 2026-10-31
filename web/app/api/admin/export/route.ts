import { isAdmin } from "@/lib/auth";
import { csvExport, sieExport } from "@/lib/books";

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Logga in först", { status: 401 });
  const url = new URL(req.url);
  const year = Number(url.searchParams.get("ar")) || new Date().getFullYear();
  if (url.searchParams.get("format") === "csv") {
    return new Response(await csvExport(year), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bokforing-${year}.csv"`, "Cache-Control": "no-store" } });
  }
  const file = await sieExport(year);
  return new Response(new Uint8Array(file), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="studio-dalarud-${year}.se"`, "Cache-Control": "no-store" } });
}
