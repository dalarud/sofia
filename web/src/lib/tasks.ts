/**
 * "Idag": räknar fram vad som är viktigast att göra just nu, i ordning.
 * Tanken är att Sofia aldrig ska behöva leta: varje punkt har en knapp som tar henne direkt dit.
 */
import { and, asc, eq, gte, isNull, lt, lte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { addDays, today } from "./money";
import { getSetting, type AccountingSettings, type Company } from "./content";

export type Task = { key: string; title: string; why: string; href: string; action: string; minutes: number; weight: number };

export async function todaysTasks(): Promise<Task[]> {
  const now = today();
  const tasks: Task[] = [];
  const [ordersToShip, newLeads, receiptsTodo, overdue, drafts, soonEvents, todos, acc, company, lastReceipt] = await Promise.all([
    db.select().from(schema.orders).where(eq(schema.orders.status, "betald")).orderBy(asc(schema.orders.createdAt)),
    db.select().from(schema.leads).where(eq(schema.leads.status, "ny")).orderBy(asc(schema.leads.createdAt)),
    db.select({ id: schema.receipts.id }).from(schema.receipts).where(eq(schema.receipts.status, "att_gora")),
    db.select().from(schema.invoices).where(and(eq(schema.invoices.status, "skickad"), lt(schema.invoices.dueDate, now))),
    db.select().from(schema.invoices).where(eq(schema.invoices.status, "utkast")),
    db.select().from(schema.events).where(and(eq(schema.events.active, true), gte(schema.events.date, now), lte(schema.events.date, addDays(now, 3)))),
    db.select().from(schema.todos).where(isNull(schema.todos.doneAt)).orderBy(asc(schema.todos.due), asc(schema.todos.createdAt)),
    getSetting<AccountingSettings>("accounting"),
    getSetting<Company>("company"),
    db.select({ at: sql<string>`max(created_at)` }).from(schema.receipts),
  ]);

  if (ordersToShip.length) tasks.push({
    key: "ordrar", weight: 100, minutes: 10 * ordersToShip.length, href: "/admin/ordrar", action: "Visa ordrarna",
    title: ordersToShip.length === 1 ? "En order väntar på att skickas" : `${ordersToShip.length} ordrar väntar på att skickas`,
    why: "Kunden har betalat. Packa, skicka och bocka av.",
  });
  if (newLeads.length) {
    const oldest = Math.floor((Date.now() - new Date(newLeads[0].createdAt).getTime()) / 86400000);
    tasks.push({
      key: "forfragningar", weight: oldest >= 1 ? 95 : 80, minutes: 5 * newLeads.length, href: "/admin/forfragningar", action: "Svara",
      title: newLeads.length === 1 ? `${newLeads[0].name} vill ha hjälp med ${newLeads[0].service.toLowerCase()}` : `${newLeads.length} nya förfrågningar`,
      why: oldest >= 1 ? `Den äldsta har väntat i ${oldest} ${oldest === 1 ? "dag" : "dagar"}. Du lovar svar inom två arbetsdagar.` : "Ett kort svar räcker, till exempel ett förslag på tid för första samtalet.",
    });
  }
  if (overdue.length) tasks.push({
    key: "forfallna", weight: 90, minutes: 5, href: "/admin/fakturor", action: "Visa fakturorna",
    title: overdue.length === 1 ? `Faktura ${overdue[0].number} är obetald` : `${overdue.length} fakturor är obetalda`,
    why: "Har pengarna kommit? Markera som betald. Annars: skicka en vänlig påminnelse.",
  });
  for (const ev of soonEvents) {
    if (ev.kind === "oppen" || ev.booked === 0) continue;
    tasks.push({ key: `kurs-${ev.id}`, weight: 85, minutes: 10, href: `/admin/hemsidan/kurser/${ev.id}`, action: "Se deltagarna",
      title: `${ev.title} är ${ev.date === now ? "i dag" : ev.date}`, why: `${ev.booked} anmälda. Skicka gärna en påminnelse och förbered materialet.` });
  }
  if (receiptsTodo.length) tasks.push({
    key: "kvitton", weight: 70, minutes: Math.max(2, receiptsTodo.length * 1), href: "/admin/kvitton/fokus", action: "Ta dem en i taget",
    title: receiptsTodo.length === 1 ? "Ett kvitto väntar på att bokföras" : `${receiptsTodo.length} kvitton väntar på att bokföras`,
    why: "Ungefär en minut per kvitto. Fokusläget visar ett i taget.",
  });
  if (drafts.length) tasks.push({
    key: "utkast", weight: 60, minutes: 5, href: "/admin/fakturor", action: "Gå till utkasten",
    title: drafts.length === 1 ? "Ett fakturautkast är inte skickat" : `${drafts.length} fakturautkast är inte skickade`,
    why: "Skicka dem när arbetet är klart, så kommer pengarna in.",
  });
  if (!acc.vatDueDate) tasks.push({
    key: "momsdatum", weight: 40, minutes: 3, href: "/admin/installningar", action: "Lägg in datumet",
    title: "Lägg in när momsen ska deklareras", why: "Då påminner jag dig i god tid. Datumet står på skatteverket.se under Mina sidor.",
  });
  else {
    const daysLeft = Math.round((new Date(acc.vatDueDate).getTime() - new Date(now).getTime()) / 86400000);
    if (daysLeft <= 21) tasks.push({
      key: "moms", weight: daysLeft <= 7 ? 98 : 75, minutes: 20, href: "/admin/bokforing/moms", action: "Öppna momsen",
      title: daysLeft < 0 ? "Momsdeklarationen är försenad" : `Momsen ska deklareras om ${daysLeft} dagar`,
      why: "Momsrapporten visar exakt vilka siffror som ska in i varje ruta.",
    });
  }
  if (!company.orgNr) tasks.push({
    key: "foretag", weight: 50, minutes: 5, href: "/admin/installningar", action: "Fyll i uppgifterna",
    title: "Fyll i företagsuppgifterna", why: "Organisationsnummer, momsnummer och bankgiro behövs på fakturorna.",
  });
  const daysSinceReceipt = lastReceipt[0]?.at ? Math.floor((Date.now() - new Date(lastReceipt[0].at).getTime()) / 86400000) : 999;
  if (daysSinceReceipt >= 7 && !receiptsTodo.length) tasks.push({
    key: "ekonomistund", weight: 30, minutes: 15, href: "/admin/kvitton", action: "Starta",
    title: "Veckans ekonomistund", why: "15 minuter: samla kvitton från veckan, fota dem och kolla att ordrar och fakturor stämmer.",
  });
  for (const t of todos) tasks.push({
    key: `todo-${t.id}`, weight: t.due && t.due <= now ? 88 : 20, minutes: 5, href: `/admin#kom-ihag`, action: "Visa",
    title: t.text, why: t.due ? (t.due < now ? `Skulle vara klart ${t.due}` : t.due === now ? "Planerat till i dag" : `Planerat till ${t.due}`) : "Din egen påminnelse",
  });
  return tasks.sort((a, b) => b.weight - a.weight);
}

/** Räknare till menyn. */
export async function navCounts() {
  const [o, l, r] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(schema.orders).where(eq(schema.orders.status, "betald")),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.leads).where(eq(schema.leads.status, "ny")),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.receipts).where(eq(schema.receipts.status, "att_gora")),
  ]);
  return { ordrar: o[0].n, forfragningar: l[0].n, kvitton: r[0].n };
}

export async function monthNumbers() {
  const now = today();
  const from = now.slice(0, 8) + "01";
  const res = await db.execute(sql`
    select r.account, sum(r.debit_ore - r.credit_ore)::int as bal
    from verification_rows r join verifications v on v.id = r.verification_id
    where v.date >= ${from} and v.date <= ${now} and v.source <> 'moms'
    group by r.account`);
  let income = 0, costs = 0, vat = 0;
  for (const row of res.rows as { account: number; bal: number }[]) {
    if (row.account >= 3000 && row.account < 4000) income -= row.bal;
    if (row.account >= 4000 && row.account < 9000) costs += row.bal;
    if ([2611, 2621, 2631].includes(row.account)) vat -= row.bal;
    if (row.account === 2641) vat -= row.bal;
  }
  return { income, costs, vat };
}

