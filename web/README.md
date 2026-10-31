# Studio Dalarud – hemsida och administration

Hemsidan för Studio Dalarud, med webbutik, kurser, presentkort och en administrationssida där Sofia sköter innehåll, ordrar, fakturor, kvitton och bokföring.

- **Hemsidan** (`/`) är designen från prototypen, men allt innehåll kommer från databasen och kan ändras i administrationen.
- **Betalningar** går via Stripe Checkout: kort, Klarna och Swish (om det är påslaget i Stripe).
- **Administrationen** (`/admin`) är byggd för att vara lätt att använda även med ADHD: en startsida som visar max tre saker att göra just nu, ett fokusläge för kvitton, stora knappar, klarspråk och inga kontonummer om man inte vill.
- **Bokföringen** sker automatiskt för köp, betalda fakturor, Stripe-avgifter och utbetalningar. Kvitton bokförs genom att välja en kategori. Momsrapporten visar rutorna i Skatteverkets deklaration, och allt kan exporteras som SIE-fil till en redovisningsbyrå eller ett bokföringsprogram.

Tekniken: Next.js, Postgres (Supabase) via Drizzle, Stripe, pdf-lib för fakturor och presentkort, valfri e-post via Resend. Driftas på Vercel.

---

## Så fungerar administrationen

| Del | Vad Sofia gör där |
| --- | --- |
| **Idag** | Ser de tre viktigaste sakerna just nu, med uppskattad tid och en knapp direkt dit. Skriver ner saker att komma ihåg. Ser månadens siffror. Startar veckans ekonomistund med en 15-minuterstimer. |
| **Kvitton** | Fotar kvittot med mobilen direkt (knappen *Fota kvitto* finns på varje sida). Bokför senare i fokusläget: ett kvitto i taget, belopp, datum och kategori. Momsen räknas ut. |
| **Fakturor** | Skapar fakturor med tjänsterna som snabbval, skickar dem (PDF och betallänk), markerar dem betalda och krediterar vid behov. |
| **Ordrar** | Ser vad som ska packas och skickas. Betalning och bokföring är redan klar. |
| **Förfrågningar** | Svarar på kontaktformuläret med ett färdigt mejlutkast, för anteckningar och gör en faktura av uppdraget. |
| **Hemsidan** | Ändrar texter, tjänster, produkter (pris, lager, foto), kurser (och ser deltagarna), tips och ser vilka som laddat ner guiden. |
| **Bokföring** | Ser resultatet, jämför med banken, gör momsen ruta för ruta, bokför uttag och insättningar med färdiga mallar, löser in presentkort, rättar fel och laddar ner SIE. |
| **Inställningar** | Företagsuppgifter, fakturavillkor, frakt, presentkortstyper och porträtt. |

### Om bokföringen

- Bokföringen följer **kontantmetoden** (för enskild firma med omsättning under 3 miljoner kronor): fakturor bokförs när de betalas. Obetalda fakturor vid årets slut behöver bokföras som kundfordringar; checklistan för bokslutet visar dem.
- **Köp i webbutiken** bokförs när de betalas, på konto 1580 (pengar hos Stripe). Stripes avgift bokförs direkt, och när Stripe betalar ut flyttas pengarna till företagskontot 1930.
- **Presentkort** bokförs som en skuld (2420) utan moms tills de används, eftersom de kan lösas in mot både varor och tjänster.
- **Verifikationer kan inte ändras eller raderas**, varken i administrationen eller direkt i databasen. Fel rättas med en ny verifikation som bokför det felaktiga omvänt, som bokföringslagen kräver.
- Kvittobilderna sparas i databasen och är kopplade till sina verifikationer. Ladda ändå ner SIE-filen varje år och spara den, och se till att Supabase gör säkerhetskopior. Räkenskapsinformation ska sparas i 7 år.
- Systemet är ett stöd, inte en ersättning för en redovisningskonsult. Låt gärna en konsult titta på det första årets SIE-fil, och ta hjälp med bokslut och NE-bilaga.

---

## Starta lokalt

Kräver Node 20 eller senare och en Postgres-databas (lokalt eller hos Supabase).

```bash
cd web
cp .env.example .env          # fyll i DATABASE_URL och resten
npm install
npm run admin:password        # skapar ADMIN_PASSWORD_HASH, klistra in i .env
npm run db:migrate            # skapar tabellerna
npm run db:seed               # lägger in startinnehållet från prototypen
npm run dev                   # http://localhost:3000 och http://localhost:3000/admin
```

Sätt `STRIPE_MOCK=1` för att testa hela köpflödet utan Stripe: köp räknas då som betalda direkt. Det fungerar bara lokalt, aldrig i produktion.

Tester: `npm test` (regler för kontering, moms och SIE). Databastesterna körs när `DATABASE_URL` är satt och använder ett slumpat framtida år, så de stör inte riktig bokföring. Kör dem helst mot en separat testdatabas.

---

## Sätta sidan i drift

### 1. Databasen hos Supabase

1. Skapa ett projekt på [supabase.com](https://supabase.com), region **Stockholm (eu-north-1)** eller Frankfurt.
2. Gå till *Project Settings → Database → Connection string*.
   - För sidan (Vercel): välj **Transaction pooler** (port 6543). Det blir `DATABASE_URL`.
   - För att köra migreringarna: använd **Session pooler** eller den direkta anslutningen.
3. Kör migreringar och startinnehåll från din dator:
   ```bash
   DATABASE_URL="postgres://...session..." npm run db:migrate
   DATABASE_URL="postgres://...session..." npm run db:seed
   ```
4. Alla tabeller har Row Level Security påslaget utan regler. Det betyder att Supabases öppna API inte kommer åt något; bara sidan själv (med lösenordet i `DATABASE_URL`) kan läsa och skriva. Lägger du till nya tabeller: gör samma sak i migreringen.
5. Säkerhetskopior: på betalplanen tar Supabase dagliga kopior. Ladda ändå ner SIE-filen efter varje år.

### 2. Vercel

1. Importera repot på [vercel.com](https://vercel.com). Sätt **Root Directory** till `web`.
2. Lägg in miljövariablerna (*Settings → Environment Variables*):

   | Variabel | Värde |
   | --- | --- |
   | `DATABASE_URL` | Transaction pooler-adressen från Supabase |
   | `SITE_URL` | `https://studiodalarud.se` (utan snedstreck på slutet) |
   | `ADMIN_EMAIL` | Sofias e-post för inloggning |
   | `ADMIN_PASSWORD_HASH` | från `npm run admin:password` |
   | `SESSION_SECRET` | lång slumpad sträng, t.ex. `openssl rand -base64 48` |
   | `STRIPE_SECRET_KEY` | från Stripe, se nedan |
   | `STRIPE_WEBHOOK_SECRET` | från Stripe, se nedan |
   | `RESEND_API_KEY`, `MAIL_FROM` | valfritt, se nedan |

   Sätt **inte** `STRIPE_MOCK` i Vercel.
3. Koppla domänen under *Settings → Domains*.

### 3. Stripe

1. Skapa ett konto på [stripe.com](https://stripe.com) och verifiera företaget.
2. Under *Settings → Payment methods*: slå på **Kort**, **Klarna** och gärna **Swish**.
3. Under *Settings → Customer emails*: slå på **kvitton för lyckade betalningar**. Då får kunden alltid ett kvitto, även utan Resend.
4. Under *Developers → Webhooks*: lägg till endpointen `https://studiodalarud.se/api/stripe/webhook` med händelserna
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `payout.paid`
   - `charge.refunded`

   Kopiera *Signing secret* till `STRIPE_WEBHOOK_SECRET`.
5. Kopiera *Secret key* (Developers → API keys) till `STRIPE_SECRET_KEY`.
6. Börja med testnycklarna (`sk_test_...`) och testkortet `4242 4242 4242 4242`. Byt till de riktiga när allt fungerar, och skapa då en ny webhook i live-läget.

Återbetalningar görs i Stripe. En hel återbetalning bokförs automatiskt; en delvis återbetalning blir en påminnelse på Idag.

### 4. E-post (valfritt)

Med [Resend](https://resend.com) skickas orderbekräftelser med presentkort, fakturor och påminnelser automatiskt. Verifiera domänen hos Resend, och lägg in `RESEND_API_KEY` och `MAIL_FROM` (t.ex. `Studio Dalarud <hej@studiodalarud.se>`). Utan e-post fungerar allt ändå: kunden får kvitto från Stripe och kan ladda ner presentkortet på tack-sidan, och fakturor laddas ner som PDF.

### 5. Första inloggningen

1. Gå till `/admin` och logga in.
2. Följ det som står på **Idag**: fyll i företagsuppgifterna (organisationsnummer, momsnummer, bankgiro) och datumet för nästa momsdeklaration.
3. Gå igenom texterna, priserna och lagret under **Hemsidan**, och ladda upp ett porträtt och produktfoton när de finns.
4. Läs igenom köpvillkoren och integritetspolicyn (under Hemsidan → Texter) och anpassa dem.

---

## Byta lösenord

Kör `npm run admin:password`, välj ett nytt lösenord och byt `ADMIN_PASSWORD_HASH` i Vercel. Byt även `SESSION_SECRET` om du vill logga ut alla inloggade enheter. Gör sedan en ny driftsättning (*Deployments → Redeploy*).

## Säkerhet i korthet

- Allt under `/admin` och `/api/admin` kräver inloggning (kontrolleras både i middleware och i varje åtgärd). Inloggningen begränsas efter flera felaktiga försök.
- Lösenordet sparas bara som en scrypt-hash. Sessionen är en signerad cookie som gäller i 14 dagar.
- Kvitton och andra underlag visas bara för inloggade. Produktbilder och porträtt är publika.
- Stripe-händelser verifieras med signatur och hanteras bara en gång.
- Betallänkar på fakturor är signerade, så det går inte att gissa sig till andras fakturor.

## Mappar

```
web/
  app/             sidor och API (hemsidan, tack, betala, admin, api)
  src/site/        hemsidans mall och rendering
  src/lib/         affärslogik: kassa, Stripe, fakturor, kvitton, bokföring, moms, SIE, PDF
  src/admin/       komponenter till administrationen
  src/db/          databasschema, migrering och startinnehåll
  drizzle/         SQL-migreringar (inklusive låsning av verifikationer och RLS)
  tests/           tester för kontering, moms, SIE och verifikationer
```
