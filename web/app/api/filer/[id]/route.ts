import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { isAdmin } from "@/lib/auth";

// Produktbilder och porträtt är publika. Kvitton och andra underlag visas bara för Sofia.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Finns inte", { status: 404 });
  const [file] = await db.select().from(schema.files).where(eq(schema.files.id, id));
  if (!file) return new Response("Finns inte", { status: 404 });
  if (!file.isPublic && !(await isAdmin())) return new Response("Finns inte", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": file.isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
