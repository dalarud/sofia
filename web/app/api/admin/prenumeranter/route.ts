import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Logga in först", { status: 401 });
  const onlyLetter = new URL(req.url).searchParams.get("bara") === "nyhetsbrev";
  const rows = await db.select().from(schema.subscribers).where(onlyLetter ? and(isNull(schema.subscribers.unsubscribedAt), eq(schema.subscribers.newsletter, true)) : isNull(schema.subscribers.unsubscribedAt));
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = ["email;sedan;nyhetsbrev", ...rows.map((r) => [q(r.email), r.createdAt.toISOString().slice(0, 10), r.newsletter ? "ja" : "nej"].join(";"))].join("\r\n");
  return new Response("﻿" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="prenumeranter.csv"`, "Cache-Control": "no-store" } });
}
