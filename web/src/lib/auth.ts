/** Inloggning för Sofia: lösenord som scrypt-hash i miljövariabeln ADMIN_PASSWORD_HASH. */
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, gte, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { createSessionToken, SESSION_COOKIE, SESSION_DAYS, verifySessionToken } from "./session";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [kind, N, r, p, saltB64, hashB64] = stored.split(":");
  if (kind !== "scrypt") return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(actual, expected);
}

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "okänd";
}

/** Returnerar ett felmeddelande, eller null om inloggningen lyckades. */
export async function login(email: string, password: string): Promise<string | null> {
  const from = await ip();
  const since = new Date(Date.now() - 15 * 60_000);
  const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(schema.loginAttempts).where(and(eq(schema.loginAttempts.ip, from), gte(schema.loginAttempts.at, since))));
  if (n >= 10) return "För många försök. Vänta en kvart och försök igen.";
  const okEmail = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const okPassword = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
  if (!okEmail || !okPassword) {
    await db.insert(schema.loginAttempts).values({ ip: from });
    return "E-post eller lösenord stämmer inte.";
  }
  await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.ip, from));
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400,
  });
  return null;
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Används i alla serveråtgärder i administrationssidan, utöver middleware. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
