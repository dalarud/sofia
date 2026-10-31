/** Sessionen för administrationssidan. Fungerar både i middleware (edge) och på servern. */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "dalarud_session";
export const SESSION_DAYS = 14;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET saknas eller är för kort (minst 32 tecken).");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject("admin")
    .setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
