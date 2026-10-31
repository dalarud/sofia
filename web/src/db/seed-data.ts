// Startinnehåll från prototypen. Allt kan ändras i administrationssidan efteråt.
// I texter blir *ord* kursivt i lerfärg, som i rubrikerna på hemsidan.

export const TEXTS: { key: string; label: string; value: string; multiline?: boolean }[] = [
  { key: "hero.line1", label: "Startsidan: rubrik, första raden", value: "Från brus" },
  { key: "hero.line2", label: "Startsidan: rubrik, andra raden", value: "till *ro.*" },
  { key: "hero.lede", label: "Startsidan: ingress", value: "Inredning och homestaging för hem som är vackra och lätta att leva i. Med kunskap om hur miljön påverkar hur vi mår.", multiline: true },
  { key: "hero.cta", label: "Startsidan: huvudknapp", value: "Boka ett första samtal" },
  { key: "manifest.text", label: "Manifest", value: "Ett hem ska inte bara se bra ut. Det ska hjälpa dig att *landa* efter dagen. Därför inreder jag för ögat, för vardagen och för hjärnor av alla slag.", multiline: true },
  { key: "manifest.by", label: "Manifest: under namnet", value: "Inredningsstylist och homestagingkonsult som formar i lera, med bakgrund i specialpedagogik" },
  { key: "tjanster.title", label: "Tjänster: rubrik", value: "Vad behöver *ditt hem?*" },
  { key: "tjanster.lede", label: "Tjänster: ingress", value: "Varje uppdrag börjar med ett samtal om hur du lever: vad som fungerar, vad som skaver och hur du vill att hemmet ska kännas. Sedan gör vi en plan som passar din budget.", multiline: true },
  { key: "tjanster.note", label: "Tjänster: liten text under listan", value: "Priser för privatpersoner inklusive moms. Priser för verksamheter exklusive moms. Resor inom 3 mil ingår." },
  { key: "steg.title", label: "Så går det till: rubrik", value: "Från första samtal till *ett lugnare hem.*" },
  { key: "steg.lede", label: "Så går det till: ingress", value: "Du vet alltid vad nästa steg är, vad det kostar och hur lång tid det tar. Det första samtalet är alltid gratis.", multiline: true },
  { key: "steg.1.title", label: "Steg 1: rubrik", value: "Första samtalet" },
  { key: "steg.1.text", label: "Steg 1: text", value: "Vi pratar i 20 minuter, i telefon eller på video, om ditt hem och vad som skaver.", multiline: true },
  { key: "steg.1.meta", label: "Steg 1: tid och pris", value: "Gratis · 20 min" },
  { key: "steg.2.title", label: "Steg 2: rubrik", value: "Hembesöket" },
  { key: "steg.2.text", label: "Steg 2: text", value: "Jag kommer hem till dig, eller så går vi igenom bilder digitalt. Vi tittar på rummen med Ro-modellen.", multiline: true },
  { key: "steg.2.meta", label: "Steg 2: tid och pris", value: "1–2 timmar" },
  { key: "steg.3.title", label: "Steg 3: rubrik", value: "Planen" },
  { key: "steg.3.text", label: "Steg 3: text", value: "Du får en skriftlig plan med skisser, moodboard och inköpslista, anpassad efter din budget.", multiline: true },
  { key: "steg.3.meta", label: "Steg 3: tid och pris", value: "Inom en vecka" },
  { key: "steg.4.title", label: "Steg 4: rubrik", value: "Förändringen" },
  { key: "steg.4.text", label: "Steg 4: text", value: "Du genomför planen själv, eller så hjälper jag till hela vägen. Efter en månad hör jag av mig och följer upp.", multiline: true },
  { key: "steg.4.meta", label: "Steg 4: tid och pris", value: "Uppföljning efter 4 veckor" },
  { key: "ro.title", label: "Ro-modellen: rubrik", value: "Fyra hörnstenar för ett *lugnare hem.*" },
  { key: "ro.lede", label: "Ro-modellen: ingress", value: "Under mina år i förskolan såg jag hur mycket miljön betyder, särskilt för barn med NPF. Ro-modellen samlar det jag lärt mig. Välj en hörnsten och se hur den kan se ut i ett vanligt familjehem.", multiline: true },
  { key: "ro.foot", label: "Ro-modellen: avslutning", value: "Det som hjälper den som har det svårast gör det lättare för alla." },
  { key: "ateljen.title", label: "Ateljén: rubrik", value: "Format för hand, *en i taget.*" },
  { key: "ateljen.lede", label: "Ateljén: ingress", value: "Jag formar allt för hand i självtorkande lera, utan ugn och drejskiva. Föremålen torkar långsamt i ateljén och målas sedan i färger från skog, strand och kvällsljus. De är till för att titta på och hålla i, inte för mat eller vatten.", multiline: true },
  { key: "ateljen.next", label: "Ateljén: nästa släpp", value: "Vintersläppet 5 december" },
  { key: "kurser.title", label: "Kurser: rubrik", value: "Kom och *känn på leran.*" },
  { key: "kurser.lede", label: "Kurser: ingress", value: "Kurser i självtorkande lera för nybörjare, workshoppar om lugnare hem och öppen ateljé när det är släpp. Ingen ugn behövs, och du tar med dig det du gjort hem samma dag. Små grupper, och kaffe och allt material ingår.", multiline: true },
  { key: "kurser.note", label: "Kurser: egna grupper", value: "Vill du boka en egen kurs för din grupp, hemma hos er eller i ateljén? Från 3 500 kr för upp till 8 personer, till exempel möhippa, kalas eller personalgrupp.", multiline: true },
  { key: "present.title", label: "Presentkort: rubrik", value: "Ge bort *ett lugnare hem.*" },
  { key: "present.lede", label: "Presentkort: ingress", value: "En konsultation, en kurs i lera eller ett valfritt belopp att använda i ateljén. Presentkortet skickas som PDF och gäller i två år.", multiline: true },
  { key: "om.title", label: "Om Sofia: rubrik", value: "Tre erfarenheter, *ett företag.*" },
  { key: "om.p1", label: "Om Sofia: stycke 1", value: "Hej! Jag heter Sofia Dalarud. I många år arbetade jag i förskolan och fördjupade mig i specialpedagogik och NPF. Där lärde jag mig att rätt miljö gör stor skillnad: ett lugnt rum, en tydlig plats för saker, ljus som inte stressar.", multiline: true },
  { key: "om.p2", label: "Om Sofia: stycke 2", value: "I dag är jag utbildad inredningsstylist och homestagingkonsult. Min stil är modern skandinavisk och naturnära, med trä, lin och lera. Jag vill att ett hem ska vara vackert, men framför allt en plats där du kan landa.", multiline: true },
  { key: "om.p3", label: "Om Sofia: stycke 3", value: "När jag inte inreder formar jag i självtorkande lera. Att arbeta med händerna är mitt sätt att varva ner, och föremålen hittar ofta in i hemmen jag stylar.", multiline: true },
  { key: "tips.title", label: "Tips: rubrik", value: "Små steg mot *ett lugnare hem.*" },
  { key: "tips.lede", label: "Tips: ingress", value: "Konkreta råd om inredning, homestaging och miljöer som hjälper hela familjen. Sådant du kan göra redan i helgen.", multiline: true },
  { key: "guide.lede", label: "Guiden: ingress", value: "Konkreta tips från Ro-modellen som du kan göra i helgen, utan att köpa nytt. Skrivna utifrån mina år i förskolan och som inredare.", multiline: true },
  { key: "kontakt.title", label: "Kontakt: rubrik", value: "Vad skaver *hemma?*" },
  { key: "kontakt.lede", label: "Kontakt: ingress", value: "Berätta lite om ditt hem. Jag svarar inom två arbetsdagar och föreslår ett första samtal, utan kostnad.", multiline: true },
  { key: "kontakt.area", label: "Kontakt: område", value: "Hembesök i närområdet, digitalt i hela Sverige" },
  { key: "sidfot.text", label: "Sidfoten: kort text", value: "Inredning, homestaging och handgjorda föremål i lera. Från brus till ro." },
  { key: "villkor.text", label: "Köpvillkor (egen sida)", multiline: true, value: `Studio Dalarud drivs av Sofia Dalarud som enskild näringsidkare med F-skattsedel.

## Beställning och betalning
Du betalar när du beställer, med kort, Klarna, Apple Pay eller Google Pay via Stripe. Alla priser är i svenska kronor inklusive moms.

## Leverans
Föremål i lera skickas som postpaket inom 5 arbetsdagar. Frakten kostar 69 kr och är gratis för beställningar över 800 kr. Du kan också hämta kostnadsfritt i ateljén efter överenskommelse. Föremål som görs på beställning, till exempel dörrskyltar, skickas inom två veckor.

## Ångerrätt
Du har 14 dagars ångerrätt från att du har tagit emot varan, enligt distansavtalslagen. Meddela oss på e-post innan fristen går ut. Varan ska skickas tillbaka oanvänd, och du betalar returfrakten. Vi betalar tillbaka inom 14 dagar från att vi har fått varan. Ångerrätten gäller inte varor som har gjorts efter dina önskemål, som dörrskyltar med namn.

## Kurser och workshoppar
Du kan avboka kostnadsfritt fram till 7 dagar före kursen. Därefter kan du låta någon annan gå i ditt ställe. Om en kurs ställs in får du pengarna tillbaka.

## Presentkort
Presentkort gäller i två år från köpdatum och kan användas till tjänster, kurser och föremål i ateljén. De kan inte lösas in mot kontanter.

## Föremål i självtorkande lera
Föremålen är dekoration. De tål inte vatten och ska inte användas till mat eller dryck. Torka av med en torr trasa. Använd LED-ljus i ljuslyktorna.

## Reklamation
Om en vara är skadad eller felaktig har du rätt att reklamera den enligt konsumentköplagen. Kontakta oss så snart som möjligt med en bild på felet.

## Tvister
Vi följer Allmänna reklamationsnämndens rekommendationer. Du kan också använda EU:s plattform för tvistlösning online.` },
  { key: "integritet.text", label: "Integritetspolicy (egen sida)", multiline: true, value: `Studio Dalarud, genom Sofia Dalarud, är personuppgiftsansvarig för de uppgifter som lämnas på hemsidan.

## Vilka uppgifter vi sparar
När du skickar en förfrågan sparar vi namn, e-post och det du skriver. När du handlar sparar vi namn, e-post, adress och vad du har köpt. När du hämtar guiden sparar vi din e-postadress och om du vill ha nyhetsbrevet.

## Varför
För att kunna svara dig, leverera det du har köpt, skicka guiden och nyhetsbrevet om du har bett om det, och för att följa bokföringslagen.

## Hur länge
Förfrågningar sparas i högst två år. Uppgifter som hör till köp sparas i sju år enligt bokföringslagen. Du kan när som helst avsluta nyhetsbrevet.

## Vem som får uppgifterna
Betalningar hanteras av Stripe. Hemsidan och databasen drivs hos Vercel och Supabase. Vi säljer aldrig dina uppgifter.

## Dina rättigheter
Du har rätt att få veta vilka uppgifter vi har om dig, att få dem rättade eller raderade, och att klaga hos Integritetsskyddsmyndigheten. Kontakta oss på e-post.` },
];

export const SETTINGS: Record<string, unknown> = {
  company: {
    name: "Studio Dalarud",
    owner: "Sofia Dalarud",
    orgNr: "",
    vatNr: "",
    fSkatt: true,
    address: "",
    email: "hej@studiodalarud.se",
    phone: "",
    instagram: "@studiodalarud",
    bankgiro: "",
    swish: "",
  },
  accounting: {
    vatPeriod: "ar", // ar | kvartal | manad
    vatDueDate: "",
    paymentTermsDays: 30,
    nextInvoiceNumber: 1001,
    method: "kontant", // kontantmetoden: fakturor bokförs när de betalas
  },
  shop: { shippingOre: 6900, freeShippingFromOre: 80000, pickup: true },
  gifts: [
    { kind: "Konsultation", amountOre: 199500 },
    { kind: "Kurs i lera", amountOre: 65000 },
    { kind: "Rumsstyling", amountOre: 590000 },
    { kind: "Valfritt belopp", amountOre: 0 },
  ],
};

export const SERVICES = [
  { name: "Inredning", short: "Ett hem som känns helt och som ditt", priceFrom: "från 1 495 kr", tone: "surface",
    body: "Jag utgår från det du redan har och bygger vidare med naturliga material, rätt ljus och en tydlig plan. Du får förslag du kan genomföra själv, eller hjälp hela vägen. Bor du långt bort gör vi det digitalt.",
    items: [["Hembesök med rådgivning, 2 h", "1 995 kr"], ["Digital rumsplan: skiss, moodboard och inköpslista", "1 495 kr / rum"], ["Rumsstyling, ett rum", "från 5 900 kr"], ["Årstidsstyling, fyra besök per år", "5 500 kr / år"]] },
  { name: "Homestaging", short: "Bostaden som köparen vill flytta in i", priceFrom: "från 2 495 kr", tone: "clay",
    body: "Ljus, luft och känsla redan på första bilden. Jag arbetar helst med dina egna möbler och samarbetar gärna direkt med din mäklare. Mäklare kan teckna avtal med fasta priser.",
    items: [["Rådgivning och checklista inför visning", "2 495 kr"], ["Fotostyling på fotodagen, halvdag", "3 900 kr"], ["Styling med egna möbler, lägenhet", "från 6 900 kr"], ["Komplett homestaging med hyrd inredning", "offert"]] },
  { name: "Inflyttning", short: "Landa i nya hemmet", priceFrom: "från 4 900 kr", tone: "surface",
    body: "Nytt hem och flyttkartonger överallt? Vi planerar vart allt ska ta vägen, och jag stylar de rum ni använder mest så att det känns som hemma från första kvällen.",
    items: [["Planering före flytten, 2 h", "1 995 kr"], ["Landa-dag: hall, kök och vardagsrum", "från 4 900 kr"], ["Landa-helg: hela hemmet", "från 9 900 kr"]] },
  { name: "Lugna rum", short: "NPF-medveten inredning för hela familjen", priceFrom: "från 2 495 kr", tone: "moss", badge: "Unikt för Studio Dalarud",
    body: "Jag går igenom hemmet med Ro-modellen och ger en konkret plan för struktur, sinnesintryck och återhämtning. För barn och vuxna med ADHD, autism eller annan NPF, och för alla som vill ha det lugnare.",
    items: [["Hemanalys med åtgärdsplan, i hemmet", "3 995 kr"], ["Digital hemanalys, via bilder och video", "2 495 kr"], ["Barnrum som ger ro", "från 4 900 kr"], ["Vardag och hemmakontor för vuxna med ADHD", "från 4 900 kr"]] },
  { name: "Verksamheter", short: "Förskolor, skolor, boenden och arbetsplatser", priceFrom: "offert", tone: "surface", contactLabel: "Kontakta",
    body: "Jag har arbetat många år i förskolan och vet hur en avdelning används en vanlig tisdag. Jag hjälper verksamheter att skapa tillgängliga och lugna miljöer, från hallen till vilan.",
    items: [["Lärmiljöanalys för förskola eller skola", "från 8 000 kr"], ["Miljöer för LSS- och HVB-boenden", "offert"], ["Föreläsning: Miljön som verktyg", "från 5 000 kr"], ["Kurs i lera för personalgruppen", "från 3 500 kr"]] },
];

export const PRODUCTS = [
  { id: "vas-strand", name: "Vas Strand", priceOre: 59500, shape: "vas", glaze: "strand", category: "dekor", text: "Hög vas för kvistar och torkade blommor. H 24 cm.", badge: "Få kvar", stock: 3, option: { id: "vas-strand-glas", label: "Med glasinsats för färska blommor", priceOre: 9500 } },
  { id: "skal-mossa", name: "Smyckeskål Mossa", priceOre: 29500, shape: "skal", glaze: "mossa", category: "dekor", text: "För ringar, nycklar och små skatter. Ø 12 cm.", stock: 8 },
  { id: "handsten", name: "Handsten", priceOre: 19500, shape: "sten", glaze: "sten", category: "lugn", text: "Slät sten att hålla i när tankarna snurrar. Lagom stor för handen.", badge: "Signatur", stock: 20 },
  { id: "markar", name: "Lådmärken Överblick, 6 st", priceOre: 29500, shape: "markar", glaze: "havre", category: "lugn", text: "Märken med bild att hänga på lådor och korgar. Välj bland 24 motiv, till exempel strumpor, lego och böcker.", badge: "Ny", stock: 10 },
  { id: "lykta-kvall", name: "Ljuslykta Kväll", priceOre: 34500, shape: "lykta", glaze: "kvall", category: "ljus", text: "Ger ett mjukt, prickigt ljus. För LED-ljus.", stock: 6 },
  { id: "stake-linne", name: "Ljusstake Linne", priceOre: 32500, shape: "stake", glaze: "havre", category: "ljus", text: "För kronljus, med en hylsa av metall. H 10 cm.", stock: 6 },
  { id: "skylt", name: "Dörrskylt med namn", priceOre: 34500, shape: "skylt", glaze: "mossa", category: "dekor", text: "Med valfritt namn, formad på beställning. Klar inom två veckor.", badge: "Personlig", stock: null },
  { id: "bricka-lera", name: "Bricka Lera", priceOre: 24500, shape: "tval", glaze: "lera", category: "dekor", text: "Liten bricka för ljus, smycken eller nycklar. L 14 cm.", stock: 5 },
  { id: "hangen", name: "Julgranshängen, 3 st", priceOre: 19500, shape: "hangen", glaze: "lera", category: "dekor", text: "Två stjärnor och ett hjärta i lera, med snöre av linne.", badge: "Säsong", stock: 12 },
];

export const EVENTS = [
  { id: "form-nov", date: "2026-11-14", time: "10.00–13.00", kind: "kurs", label: "Kurs i lera", title: "Forma i lera för nybörjare", place: "Ateljén", text: "Du formar en skål och en ljuslykta i självtorkande lera. De torkar hemma på några dagar, och sedan målar du dem i lugn och ro.", priceOre: 65000, seats: 8, booked: 6 },
  { id: "barnrum", date: "2026-11-19", time: "18.00–20.00", kind: "workshop", label: "Workshop", title: "Ett lugnare barnrum", place: "Ateljén eller digitalt", text: "Ro-modellen i praktiken: överblick, sinnesro och vila i barnrummet. Du går hem med en plan för ditt eget rum.", priceOre: 45000, seats: 14, booked: 5 },
  { id: "form-nov2", date: "2026-11-28", time: "10.00–13.00", kind: "kurs", label: "Kurs i lera", title: "Forma i lera för nybörjare", place: "Ateljén", text: "Samma kurs igen, för dig som inte hann med förra gången. Inga förkunskaper behövs.", priceOre: 65000, seats: 8, booked: 3 },
  { id: "slapp", date: "2026-12-05", time: "11.00–16.00", kind: "oppen", label: "Öppen ateljé", title: "Vintersläppet", place: "Ateljén", text: "Första chansen att köpa vinterns föremål i lera. Glögg, pepparkakor och lera att känna på.", priceOre: 0, seats: 0, booked: 0 },
  { id: "jul", date: "2026-12-10", time: "18.00–21.00", kind: "kurs", label: "Kurs i lera", title: "Julverkstad: hängen och ljusstakar", place: "Ateljén", text: "Forma egna julgranshängen och en ljusstake. Allt torkar på några dagar och är klart att måla till jul.", priceOre: 59000, seats: 8, booked: 8 },
  { id: "salja", date: "2027-01-23", time: "10.00–13.00", kind: "workshop", label: "Workshop", title: "Homestaging inför försäljning", place: "Ateljén", text: "Så förbereder du bostaden inför fotografering och visning: hallen, ljuset och de sista detaljerna.", priceOre: 55000, seats: 12, booked: 1 },
  { id: "lugn-lera", date: "2027-02-06", time: "10.00–12.00", kind: "workshop", label: "Workshop för förälder och barn", title: "Lera för lugn", place: "Ateljén", text: "Att forma lera lugnar många barn. Vi gör handstenar och små skålar tillsammans, i en liten grupp och i barnets takt. Från 6 år. Priset gäller för en förälder och ett barn.", priceOre: 45000, seats: 6, booked: 2 },
];

export const TIPS = [
  { category: "Homestaging · Flöde", title: "Börja i hallen", body: "Hallen är det första köparen ser, och där morgonen startar. Ge varje person en krok och en korg i rätt höjd, och låt ingenting stå på golvet. Det tar en eftermiddag och märks direkt." },
  { category: "Ro-modellen · Sinnesro", title: "Ljus i tre höjder", body: "Släck taklampan på kvällen. En lampa på golvet, en på bordet och en i fönstret ger ett mjukt ljus som hjälper kroppen att varva ner." },
  { category: "Lugna rum · Överblick", title: "En bild på varje låda", body: "Sätt en bild på det som finns i varje låda i barnrummet. Barnet hittar själv, och städningen blir en lek i stället för ett tjat." },
];

/** Konton ur BAS-kontoplanen som en enskild firma i Studio Dalaruds bransch behöver. */
export const ACCOUNTS: [number, string][] = [
  [1510, "Kundfordringar"],
  [1580, "Fordringar för kontokort och kuponger (Stripe)"],
  [1930, "Företagskonto"],
  [2010, "Eget kapital"],
  [2013, "Övriga egna uttag"],
  [2018, "Övriga egna insättningar"],
  [2420, "Förskott från kunder (presentkort)"],
  [2611, "Utgående moms 25 %"],
  [2621, "Utgående moms 12 %"],
  [2631, "Utgående moms 6 %"],
  [2641, "Debiterad ingående moms"],
  [2650, "Redovisningskonto för moms"],
  [3001, "Försäljning varor 25 %"],
  [3041, "Försäljning tjänster 25 %"],
  [3045, "Försäljning tjänster, momsfri"],
  [3521, "Fakturerade frakter"],
  [3740, "Öres- och kronutjämning"],
  [4010, "Inköp material och varor"],
  [5010, "Lokalhyra"],
  [5410, "Förbrukningsinventarier"],
  [5420, "Programvaror"],
  [5460, "Förbrukningsmaterial"],
  [5800, "Resekostnader"],
  [5910, "Annonsering"],
  [6110, "Kontorsmateriel"],
  [6212, "Mobiltelefon"],
  [6230, "Datakommunikation"],
  [6250, "Postbefordran"],
  [6310, "Företagsförsäkringar"],
  [6570, "Bankkostnader"],
  [6991, "Övriga externa kostnader, avdragsgilla"],
  [6992, "Övriga externa kostnader, ej avdragsgilla"],
  [7610, "Utbildning"],
];
