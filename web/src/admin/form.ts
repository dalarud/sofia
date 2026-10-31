import { redirect } from "next/navigation";
import { parseKr } from "@/lib/money";
import { requireAdmin } from "@/lib/auth";

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const int = (f: FormData, k: string, fallback = 0) => {
  const n = parseInt(str(f, k).replace(/\s/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
};
export const ore = (f: FormData, k: string) => parseKr(str(f, k));
export const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "1" || f.get(k) === "true";
export const oreToKr = (o: number | null | undefined) => (o == null ? "" : (o / 100).toLocaleString("sv-SE", { useGrouping: false, maximumFractionDigits: 2 }));

/** Kör en åtgärd och skickar tillbaka med ett vänligt besked, även när något går fel. */
export async function act(back: string, fn: () => Promise<string | void>): Promise<never> {
  await requireAdmin();
  let msg: string | void;
  try {
    msg = await fn();
  } catch (e) {
    const text = e instanceof Error ? e.message : "Något gick fel";
    redirect(`${back}${back.includes("?") ? "&" : "?"}fel=${encodeURIComponent(text)}`);
  }
  redirect(msg ? `${back}${back.includes("?") ? "&" : "?"}klart=${encodeURIComponent(msg)}` : back);
}
