import { db, schema } from "@/db";
import { isAdmin } from "@/lib/auth";
import { MAX_FILE, RECEIPT_MIME, saveFile } from "@/lib/receipts";
import { json } from "@/lib/ratelimit";

/** Tar emot ett eller flera fotograferade kvitton. Bilderna är redan förminskade i webbläsaren. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return json({ error: "Logga in först" }, 401);
  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return json({ error: "Ingen fil kom fram" }, 400);
  const ids: number[] = [];
  for (const file of files) {
    if (!RECEIPT_MIME.includes(file.type)) return json({ error: `${file.name}: bara bilder och PDF går att ladda upp` }, 400);
    if (file.size > MAX_FILE) return json({ error: `${file.name} är för stor (max 4 MB)` }, 400);
    const fileId = await saveFile(file);
    const [r] = await db.insert(schema.receipts).values({ fileId }).returning({ id: schema.receipts.id });
    ids.push(r.id);
  }
  return json({ ids });
}
