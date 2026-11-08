// Startinnehåll från prototypen. Allt kan ändras i administrationssidan efteråt.
// I texter blir *ord* kursivt i lerfärg, som i rubrikerna på hemsidan.

export const TEXTS: { key: string; label: string; value: string; multiline?: boolean }[] = [
  { key: "hero.line1", label: "Startsidan: rubrik, första raden", value: "Barnrum" },
  { key: "hero.line2", label: "Startsidan: rubrik, andra raden", value: "*som ger ro.*" },
  { key: "hero.lede", label: "Startsidan: ingress", value: "Jag är inredare och förskollärare i Norrahammar. Jag inreder barnrum och familjehem som är vackra, lugna och lätta att hålla ordning på, i lin, trä och lera. Hembesök i Jönköping, barnrumsplaner i hela Sverige.", multiline: true },
  { key: "hero.cta", label: "Startsidan: huvudknapp", value: "Boka ett hembesök" },
  { key: "manifest.text", label: "Manifest", value: "Ett barnrum ska inte bara se fint ut på bild. Det ska gå att leka i, sova i och *hålla ordning* i, för barnen själva. Och resten av hemmet ska få plats med både barn och vuxna.", multiline: true },
  { key: "manifest.by", label: "Manifest: under namnet", value: "Inredare för barnfamiljer i Norrahammar, med många år i förskolan bakom sig" },
  { key: "tjanster.title", label: "Tjänster: rubrik", value: "Vad behöver *ditt hem?*" },
  { key: "tjanster.lede", label: "Tjänster: ingress", value: "Barnrummet, familjens hem eller ett lugnare hem för dig. Alla uppdrag börjar med ett samtal om hur ni lever, och alla priser är fasta.", multiline: true },
  { key: "tjanster.note", label: "Tjänster: liten text under listan", value: "Priser för privatpersoner inklusive moms. Resor inom 3 mil från Norrahammar ingår. Möbler och inredning som köps in betalar du separat, utan påslag.", multiline: true },
  { key: "steg.title", label: "Så går det till: rubrik", value: "Från första samtal till *ett lugnare hem.*" },
  { key: "steg.lede", label: "Så går det till: ingress", value: "Du vet alltid vad nästa steg är, vad det kostar och hur lång tid det tar. Det första samtalet är alltid gratis.", multiline: true },
  { key: "steg.1.title", label: "Steg 1: rubrik", value: "Första samtalet" },
  { key: "steg.1.text", label: "Steg 1: text", value: "Vi pratar i 20 minuter, i telefon eller på video, om ditt hem och vad som skaver.", multiline: true },
  { key: "steg.1.meta", label: "Steg 1: tid och pris", value: "Gratis · 20 min" },
  { key: "steg.2.title", label: "Steg 2: rubrik", value: "Hembesöket" },
  { key: "steg.2.text", label: "Steg 2: text", value: "Jag kommer hem till dig, eller så går vi igenom bilder digitalt. Innan jag går får du en handritad plan med de första stegen.", multiline: true },
  { key: "steg.2.meta", label: "Steg 2: tid och pris", value: "2 timmar · 2 495 kr" },
  { key: "steg.3.title", label: "Steg 3: rubrik", value: "Planen" },
  { key: "steg.3.text", label: "Steg 3: text", value: "Vill du ha mer hjälp får du skisser, moodboard och inköpslista, anpassade efter din budget. Bokar du inom 30 dagar dras hembesöket av.", multiline: true },
  { key: "steg.3.meta", label: "Steg 3: tid och pris", value: "Inom en vecka" },
  { key: "steg.4.title", label: "Steg 4: rubrik", value: "Förändringen" },
  { key: "steg.4.text", label: "Steg 4: text", value: "Du genomför planen själv, eller så hjälper jag till hela vägen. Efter en månad hör jag av mig och följer upp.", multiline: true },
  { key: "steg.4.meta", label: "Steg 4: tid och pris", value: "Uppföljning efter 4 veckor" },
  { key: "ro.title", label: "Fyra hörnstenar: rubrik", value: "Fyra hörnstenar för ett *lugnare hem.*" },
  { key: "ro.lede", label: "Fyra hörnstenar: ingress", value: "Under mina år i förskolan såg jag hur mycket miljön betyder, särskilt för barn med NPF. Rohemmets fyra hörnstenar samlar det jag lärt mig. Välj en hörnsten och se hur den kan se ut i ett vanligt familjehem.", multiline: true },
  { key: "ro.foot", label: "Fyra hörnstenar: avslutning", value: "Det som hjälper den som har det svårast gör det lättare för alla." },
  { key: "ateljen.title", label: "Ateljén: rubrik", value: "Fyra kollektioner, *i lera.*" },
  { key: "ateljen.lede", label: "Ateljén: ingress", value: "Jag ritar motiven och formar allt för hand i lera. Det finns fyra kollektioner: Skogen, Sjön, Berget och Ängen. Varje kollektion har egna färger och motiv, så att allt i barnrummet hör ihop. Välj kollektion, så visas föremålen i den.", multiline: true },
  { key: "ateljen.next", label: "Ateljén: på gång", value: "Avtrycksdag 12 december" },
  { key: "kurser.title", label: "Kurser: rubrik", value: "Lerkalas och *kurser.*" },
  { key: "kurser.lede", label: "Kurser: ingress", value: "Lerkalas för barn, förälder och barn tillsammans, och kurser för vuxna. Allt sker i ateljén i Norrahammar, och alla tar med sig något hem samma dag.", multiline: true },
  { key: "kurser.note", label: "Kurser: egna grupper", value: "Lerkalas: 6–10 barn i två timmar, från 2 900 kr. Barnen formar var sin sak och tar med den hem. Möhippor och vänner kan också boka en egen kväll.", multiline: true },
  { key: "present.title", label: "Presentkort: rubrik", value: "Ge bort *ett barnrum.*" },
  { key: "present.lede", label: "Presentkort: ingress", value: "En barnrumsplan, ett hembesök, en årssten eller ett valfritt belopp. Presentkortet skickas som PDF och gäller i två år. Årsstenen kan mor- och farföräldrar ge varje födelsedag.", multiline: true },
  { key: "om.title", label: "Om Sofia: rubrik", value: "Förskollärare *som inreder.*" },
  { key: "om.p1", label: "Om Sofia: stycke 1", value: "Hej! Jag heter Sofia Dalarud. I många år arbetade jag i förskolan och fördjupade mig i specialpedagogik och NPF. Där lärde jag mig att rätt miljö gör stor skillnad: ett lugnt rum, en tydlig plats för saker, ljus som inte stressar.", multiline: true },
  { key: "om.p2", label: "Om Sofia: stycke 2", value: "I dag är jag utbildad inredningsstylist och homestagingkonsult, och jag inreder mest för barnfamiljer. I förskolan lärde jag mig hur barn använder ett rum: vad de når själva, var de leker och när det blir för mycket. Därför blir mina barnrum lätta att hålla ordning på, och vackra i lin, trä och lera.", multiline: true },
  { key: "om.p4", label: "Om Sofia: stycke 4, om dalen", value: "Studio Dalarud finns i Norrahammar, i Tabergsdalen. Här göt bruket spisar, värmepannor och tvättmaskiner till folkhemmets kök i över hundra år. Det känns rätt att nästa steg, ett hem format efter människan, börjar i samma dal. Dalen i min logotyp finns på riktigt.", multiline: true },
  { key: "om.p3", label: "Om Sofia: stycke 3", value: "När jag inte inreder formar jag i lera i ateljén i Norrahammar. Jag ritar motiven själv, med en tjock linje som påminner om hur barn ritar, och samlar dem i fyra kollektioner. Där håller jag också lerkalas och kurser.", multiline: true },
  { key: "tips.title", label: "Tips: rubrik", value: "Små steg mot *ett lugnare hem.*" },
  { key: "tips.lede", label: "Tips: ingress", value: "Konkreta råd om inredning, homestaging och miljöer som hjälper hela familjen. Sådant du kan göra redan i helgen.", multiline: true },
  { key: "guide.lede", label: "Guiden: ingress", value: "Konkreta tips från Rohemmet som du kan göra i helgen, utan att köpa nytt. Skrivna utifrån mina år i förskolan och som inredare.", multiline: true },
  { key: "kontakt.title", label: "Kontakt: rubrik", value: "Berätta om *ert hem.*" },
  { key: "kontakt.lede", label: "Kontakt: ingress", value: "Vilket rum gäller det, och hur vill ni att det ska kännas? Jag svarar inom två arbetsdagar och föreslår ett första samtal, utan kostnad.", multiline: true },
  { key: "kontakt.area", label: "Kontakt: område", value: "Hembesök i Norrahammar, Jönköping, Huskvarna och Tabergsdalen. Digitalt i hela Sverige." },
  { key: "sidfot.text", label: "Sidfoten: kort text", value: "Inredare för barnfamiljer i Norrahammar, Jönköping. Barnrum och familjehem i lin, trä och lera. Från brus till ro.", multiline: true },
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
  // ---- Sidornas huvuden ----
  { key: "sida.hjalp.rubrik", label: "Sidhuvud Hela hemmet: rubrik", value: "Hela *hemmet.*" },
  { key: "sida.hjalp.ingress", label: "Sidhuvud Hela hemmet: ingress", value: "Barnrum, familjens hem och ett lugnare hem för dig, i lin, trä och lera. Och homestaging när det är dags att sälja. Första steget är alltid ett hembesök eller en plan på distans.", multiline: true },
  { key: "sida.ateljen.rubrik", label: "Sidhuvud Ateljén: rubrik", value: "Fyra kollektioner, *i lera.*" },
  { key: "sida.ateljen.ingress", label: "Sidhuvud Ateljén: ingress", value: "Årsstenar, namnskyltar, krokar och mobiler i fyra kollektioner: Skogen, Sjön, Berget och Ängen. Lerkalas och kurser i ateljén, och presentkort.", multiline: true },
  { key: "sida.mh.rubrik", label: "Sidhuvud Människohemmet: rubrik", value: "Människohemmet" },
  { key: "sida.mh.ingress", label: "Sidhuvud Människohemmet: ingress", value: "Ett hem format efter människan, inte tvärtom. Idén som allt i Studio Dalarud bygger på, i folkhemmets anda men för vår tid.", multiline: true },
  { key: "sida.rohem.rubrik", label: "Sidhuvud Rohemmet: rubrik", value: "Rohemmet" },
  { key: "sida.rohem.ingress", label: "Sidhuvud Rohemmet: ingress", value: "Ett snällt hem åt alla. Folkhemmet gav oss ljus och luft. Nu behöver vi ro.", multiline: true },
  { key: "sida.liv.rubrik", label: "Sidhuvud Ro i vardagen: rubrik", value: "Ro i *vardagen.*" },
  { key: "sida.liv.ingress", label: "Sidhuvud Ro i vardagen: ingress", value: "Små steg, ritualer och ord att leva med. Börja med testet, eller välj en ritual för den här veckan.", multiline: true },
  { key: "sida.om.rubrik", label: "Sidhuvud Om Sofia: rubrik", value: "Det var inte *barnen.*" },
  { key: "sida.om.ingress", label: "Sidhuvud Om Sofia: ingress", value: "Förskollärare, inredare och formgivare i lera, i Norrahammar. Om hur Studio Dalarud blev till.", multiline: true },

  // ---- Startsidan ----
  { key: "sida.barn.rubrik", label: "Sidhuvud Barnrum: rubrik", value: "Barnrum *som ger ro.*" },
  { key: "sida.barn.ingress", label: "Sidhuvud Barnrum: ingress", value: "Ett barnrum där barnen hittar sina saker, kan leka och kan varva ner, och som är vackert i lin, trä och lera. Jag har arbetat många år i förskolan och vet hur barn använder ett rum. Nu använder jag det hemma hos familjer.", multiline: true },
  { key: "barn.tillfallen.title", label: "Barnrum: när familjer hör av sig, rubrik", value: "När det är *dags.*" },
  { key: "barn.tillfallen.lede", label: "Barnrum: när familjer hör av sig, ingress", value: "Barnrummet görs om flera gånger under uppväxten. Oftast hör familjer av sig vid något av de här tillfällena.", multiline: true },
  { key: "barn.tillfallen", label: "Barnrum: tillfällen (Rubrik | När | Text, en per rad)", multiline: true, value: `Ett första rum | Bebisen ska komma | En lugn plats för sömn och skötbord, i föräldrarnas rum eller ett eget, som kan växa med barnet.
Ett rum för två | Syskon ska dela rum | Två barns saker, sömn och lek i ett rum, och en egen plats för var och en.
Ett eget rum och en läxplats | Barnet börjar skolan | Mer plats för egna saker, och en plats där det går att sitta still en stund.
Barnens rum först | Familjen flyttar | När allt är i kartonger hjälper det om barnen har sitt rum klart först.
Ett rum som känns eget | Barnet blir större | Färre leksaker, mer eget, och förvaring som inte ser ut som ett barnrum längre.` },
  { key: "barn.paket.title", label: "Barnrum: paketen, rubrik", value: "Fasta priser, *från 995 kr.*" },
  { key: "barn.paket.lede", label: "Barnrum: paketen, ingress", value: "Välj den hjälp som passar. Möbler och saker som köps in betalar ni själva, och jag föreslår gärna begagnat.", multiline: true },
  { key: "barn.paket", label: "Barnrum: paketen (Namn | Pris | Text, en per rad)", multiline: true, value: `Färdigt rumskoncept | 995 kr | Ett av fyra färdiga barnrum: Skogen, Sjön, Berget eller Ängen. Ni får färgerna med kulörkoder, en möbleringsidé och en inköpslista, och föremålen i lera finns i ateljén. Ni gör rummet själva.
Barnrumsplan på distans | 1 495 kr | Ni skickar bilder och mått. Jag ritar en plan med möblering, färger och en inköpslista från vilka butiker som helst, även begagnat. Klar inom en vecka, i hela Sverige.
Hembesök | 2 495 kr | Två timmar hemma hos er. Ni får en handritad plan med de första stegen innan jag går. Dras av om ni bokar mer inom 30 dagar.
Barnrummet klart | från 6 900 kr | Plan, inköp, montering och styling, så att rummet är färdigt när barnet kommer hem.
Syskonrummet | från 8 900 kr | Två barn i ett rum, med sömn, lek och en egen plats för var och en.
Lugna barnrum | från 6 900 kr | För barn som behöver färre intryck och mer ordning, till exempel barn med ADHD eller autism.` },
  { key: "barn.steg.title", label: "Barnfamiljer: steg, rubrik", value: "Så går det *till.*" },
  { key: "barn.steg.lede", label: "Barnfamiljer: steg, ingress", value: "Ni vet alltid vad nästa steg är och vad det kostar. Det första samtalet är gratis." },
  { key: "barn.steg.1.title", label: "Barnfamiljer: steg 1, rubrik", value: "Ett samtal" },
  { key: "barn.steg.1.text", label: "Barnfamiljer: steg 1, text", value: "Vi pratar i 20 minuter om barnen, rummet och vad som skaver." },
  { key: "barn.steg.1.meta", label: "Barnfamiljer: steg 1, tid och pris", value: "Gratis · 20 min" },
  { key: "barn.steg.2.title", label: "Barnfamiljer: steg 2, rubrik", value: "Planen" },
  { key: "barn.steg.2.text", label: "Barnfamiljer: steg 2, text", value: "Jag kommer hem till er, eller så gör vi planen på distans utifrån bilder och mått." },
  { key: "barn.steg.2.meta", label: "Barnfamiljer: steg 2, tid och pris", value: "1 495 eller 2 495 kr" },
  { key: "barn.steg.3.title", label: "Barnfamiljer: steg 3, rubrik", value: "Rummet" },
  { key: "barn.steg.3.text", label: "Barnfamiljer: steg 3, text", value: "Ni gör det själva efter planen, eller så köper jag in, monterar och stylar." },
  { key: "barn.steg.3.meta", label: "Barnfamiljer: steg 3, tid och pris", value: "Från 6 900 kr" },
  { key: "barn.steg.4.title", label: "Barnfamiljer: steg 4, rubrik", value: "Efter en månad" },
  { key: "barn.steg.4.text", label: "Barnfamiljer: steg 4, text", value: "Jag hör av mig och frågar hur rummet används. Det som inte fungerar justerar vi." },
  { key: "barn.steg.4.meta", label: "Barnfamiljer: steg 4, tid och pris", value: "Ingår" },
  { key: "barn.hojd.title", label: "Barnfamiljer: föremålen, rubrik", value: "Ordning som barnen *klarar själva.*" },
  { key: "barn.hojd.text", label: "Barnfamiljer: föremålen, text", value: "I förskolan står det barnen behöver där de själva når det, och det som stör står bakom luckor. Samma tanke fungerar hemma. Då kan barnen göra mer själva, och ni behöver tjata mindre.", multiline: true },
  { key: "barn.hojd.punkter", label: "Barnfamiljer: föremålen, punkter (en per rad)", multiline: true, value: `Krokar i barnets höjd, cirka 95 cm, så att ytterkläderna har en plats.
Lådmärken i lera: en bild på varje låda, så att barnet hittar och plockar undan själv.
Färre leksaker framme, och resten i lådor som byts ut ibland.
En lugn hörna med mjukt ljus, för läsning och vila.` },
  { key: "start.title", label: "Startsidan: tre vägar, rubrik", value: "Tre vägar *in.*" },
  { key: "start.lede", label: "Startsidan: tre vägar, ingress", value: "Barnrummet, resten av hemmet eller något gjort för hand. Välj det som passar dig." },
  { key: "start.dorr1", label: "Startsidan: väg 1, rubrik", value: "Barnrum som ger ro" },
  { key: "start.dorr1.text", label: "Startsidan: väg 1, text", value: "Barnrum och syskonrum som barnen kan leka, sova och hålla ordning i. Från 995 kr för ett färdigt rumskoncept.", multiline: true },
  { key: "start.dorr2", label: "Startsidan: väg 2, rubrik", value: "Hela hemmet" },
  { key: "start.dorr2.text", label: "Startsidan: väg 2, text", value: "Hall, vardagsrum och kök som fungerar med barn, ett lugnare hem för dig, och homestaging." },
  { key: "start.dorr3", label: "Startsidan: väg 3, rubrik", value: "Ateljén" },
  { key: "start.dorr3.text", label: "Startsidan: väg 3, text", value: "Årsstenar, namnskyltar och krokar i fyra kollektioner. Lerkalas och kurser." },

  // ---- Hjälp hemma ----
  { key: "hjalp.rokartan.title", label: "Ro-kartan: rubrik", value: "Du får Ro-kartan *innan jag går.*" },
  { key: "hjalp.rokartan.text", label: "Ro-kartan: text", value: "Efter varje hembesök och hemanalys ritar jag Ro-kartan för hand, på plats. Ett A3-ark som visar ditt hem med Rohemmets fyra hörnstenar, och vad du kan göra först.", multiline: true },
  { key: "hjalp.rokartan.punkter", label: "Ro-kartan: punkter (en per rad)", multiline: true, value: `En planritning av rummen, med överblick, sinnesro, flöde och återhämtning markerade.
De tre första stegen, i ordning, som du kan göra själv redan i veckan.
Resten av listan, högst tio punkter, med ungefärlig kostnad.
Bokar du ett större uppdrag inom 30 dagar dras hembesöket av.` },

  // ---- Människohemmet ----
  { key: "mh.claim", label: "Människohemmet: påstående", value: "Ett hem format efter människan, *inte tvärtom.*" },
  { key: "mh.teaser", label: "Människohemmet: kort text på startsidan", multiline: true, value: "Folkhemmet byggde för genomsnittet. Människohemmet utgår från att vi är olika: våra hjärnor, våra barn, våra händer och våra liv. Fem delar, och ro är där vi börjar." },
  { key: "mh.citat", label: "Människohemmet: citat", multiline: true, value: "”Det goda hemmet känner icke till några privilegierade eller tillbakasatta, inga kelgrisar och inga styvbarn.”" },
  { key: "mh.citat.kalla", label: "Människohemmet: citatets källa", value: "Per Albin Hansson, 1928" },
  { key: "mh.folkhemmet", label: "Människohemmet: om folkhemmet", multiline: true, value: "Folkhemmet byggdes för folket: det gemensamma och det genomsnittliga. Köksmåtten utgick från en genomsnittlig kropp, lägenheterna från en genomsnittlig familj. Det gav ljus, luft och värdighet åt miljoner. Men genomsnittet finns inte." },
  { key: "mh.blinda", label: "Människohemmet: det folkhemmet inte såg (Ord | text, en per rad)", multiline: true, value: `Hjärnor | fungerar olika. Det som ger lugn åt en ger kaos åt en annan.
Barn | ser rummet från en annan höjd, med andra behov än vuxna.
Händer | behöver naturen och att göra saker, inte bara ljus och luft.
Ensamheten | har vuxit. Hemmet har slutat vara en plats där man samlas.
Livet | skiftar. Hemmet behöver följa flytt, barn, separation och ålder.` },
  { key: "mh.nasta", label: "Människohemmet: nästa steg", multiline: true, value: "Folkhemmet gav alla samma goda hem. Nästa steg är att ge var och en *sitt goda hem.*" },
  { key: "mh.vision", label: "Människohemmet: visionen", multiline: true, value: "Ett hem format efter människan, *inte en människa formad efter hemmet.*" },
  { key: "mh.2040", label: "Människohemmet: bilden av 2040", multiline: true, value: "Varje barn har en plats i sin förskola där det kan vila. Varje familj vet hur hallen blir en plats som fungerar en stressig morgon. Den som har ADHD eller autism får hjälp att forma sitt hem utan att behöva förklara sig. Nya bostäder byggs med nischer, dämpade rum och plats för gemenskap. Och i varje hem finns något gjort av människohänder." },
  { key: "mh.styvbarn", label: "Människohemmet: avslutning", value: "Det goda människohemmet känner inga styvbarn, inte heller bland hjärnorna." },
  { key: "mh.delar.title", label: "Människohemmet: delkoncepten, rubrik", value: "Ro är en av fem. *Människan behöver mer.*" },
  { key: "mh.delar.lede", label: "Människohemmet: delkoncepten, ingress", multiline: true, value: "Bågen är hemmet, och stenen är människan. Runt henne finns fem delkoncept, vart och ett för ett mänskligt behov. Välj en båge för att läsa mer." },
  { key: "mh.delar", label: "Människohemmet: delkoncepten (Namn | Undertitel | Behov | Idé | I företaget, en per rad)", multiline: true, value: `Ro | Rohemmet | Nervsystemets behov av vila och färre intryck | Ett hem som är snällt mot hjärnan: fredad ögonhöjd, ljus i tre höjder, allt har en plats och en rohörna i varje hem. | Lugna rum, hemanalysen, Ro-kartan och föreläsningarna.
Jord | Det gjorda hemmet | Behovet av natur, material och att göra med händerna | Människan behöver ta i saker, och se saker som någon har gjort. Minst ett föremål gjort för hand i varje rum. | Dalarud Lera, kurserna och Forma hemma-kit.
Växt | Barnets hem | Barnets behov av att växa, klara själv och leka | Rummet sett från barnets höjd: vad kan barnet nå, förstå och klara själv? | Barnens rum, föräldrakvällar, förskolor och Lera för lugn.
Bord | Det samlande hemmet | Behovet av andra människor | Ett bord där alla får plats, en hall som välkomnar och kvällar då man gör något tillsammans. | Ro-kvällar, kurser och gemenskapen.
År | Det föränderliga hemmet | Behovet av att hemmet följer livet och årstiderna | Ett hem blir aldrig klart. Det ska följa flytt, barn, försäljning och ålder, och skifta med årstiderna. | Homestaging, Landa i nya hemmet och årstidsbesöken.` },
  { key: "mh.mal.lede", label: "Människohemmet: målen, ingress", multiline: true, value: "Studio Dalarud kan inte nå dem själv. Men det är visionen som gör att andra vill vara med: föräldrar, förskolor, bostadsbolag och kommuner." },
  { key: "mh.mal", label: "Människohemmet: mål för 2040 (Rubrik | text, en per rad)", multiline: true, value: `En vilplats för varje barn | i förskola och skola.
Hem för alla hjärnor | med kunskap som är fri att använda.
Hantverk i vardagen | Att forma med händerna ska vara lika självklart som att läsa.
Bostäder som samlar | Nya hus med plats för möten, inte bara förvaring.
Stöd i livets övergångar | från första lägenheten till den sista.` },

  // ---- Rohemmet ----
  { key: "rohem.manifest", label: "Rohemmet: manifestet (ett stycke per rad)", multiline: true, value: `Folkhemmet gav oss ljus och luft. *Nu behöver vi ro.*
Ett hem ska vara snällt mot den som bor där. Det ska inte kräva energi, det ska ge energi.
Ro är inte lyx. Den ska inte vara förbehållen dem som har råd med en inredare.
Varje hjärna förtjänar ett hem som fungerar för den. Det som hjälper den som har det svårast, hjälper alla.
Vi tar bort innan vi lägger till. Vi dämpar innan vi pyntar. Vi frågar hur ni lever innan vi frågar vad ni gillar.
Det handgjorda får vara ojämnt. Hemmet blir aldrig klart. Små steg räknas.` },
  { key: "rohem.principer.title", label: "Rohemmet: principerna, rubrik", value: "Lika för ett barnrum som för *en förskola.*" },
  { key: "rohem.principer.lede", label: "Rohemmet: principerna, ingress", multiline: true, value: "Tio principer som gör ett hem snällare mot den som bor där. Till varje finns något du kan prova redan i dag." },
  { key: "rohem.principer", label: "Rohemmet: tio principer (Rubrik | text | prova, en per rad)", multiline: true, value: `Ögonhöjden är fredad | Det som syns mellan knä och huvud tar mest uppmärksamhet. Där ska det vara lugnast. | Ställ dig i dörren och titta rakt fram. Ta bort hälften av det du ser.
Ljus i tre höjder | Golv, bord och fönster. Taklampan är aldrig den enda ljuskällan, och på kvällen är den släckt. | Släck taklampan i kväll och tänd tre andra lampor.
Rummet svarar | Allt har en plats, och platsen syns. Rummet svarar på var, vad, hur länge och vad som händer sen, så att ingen behöver fråga och ingen behöver tjata. | Skriv ner varje fråga barnen ställer en morgon. Ge en av dem ett svar i rummet.
Ett hörn för vila i varje hem | Rohörnan är lika självklar som en säng. | Välj ett hörn och lägg dit en pläd.
Mjukt dämpar | Varje rum har minst en stor mjuk yta som tar ljud: matta, gardiner eller textil. | Lägg en matta i det rum där ni är mest.
Naturens färger och material | Låg färgmättnad, trä, lin, ull, sten och lera. | Byt en sak i plast mot en i trä, lin eller lera.
Flöde före form | Rummet formas efter det som händer där varje dag. Hallen efter morgonen, sovrummet efter kvällen. | Gå igenom morgonen steg för steg. Var stannar det?
Tre av något | Tre färger i ett rum, tre saker på en yta, tre steg i taget. | Låt bara tre saker stå på en yta.
Det handgjorda är välkommet | En sak gjord av en människa ger mer än tio från ett lager. | Forma något litet i lera, eller ställ fram något som någon har gjort till dig.
Hemmet följer året | Fyra årstider, fyra små skiften. Det som hör till förra årstiden får vila. | Plocka bort tre saker som hör sommaren till.` },
  { key: "rohem.forskning.title", label: "Rohemmet: forskningen, rubrik", value: "Det du redan anar. *Det forskningen visar.*" },
  { key: "rohem.forskning.lede", label: "Rohemmet: forskningen, ingress", multiline: true, value: "Varje princip börjar i något alla känner igen, och prövas sedan mot forskningen. Vi säger hur stark kunskapen är, också när den är tunn." },
  { key: "rohem.forskning", label: "Rohemmet: forskningen (Princip | vad den visar | källa | grad: Stark, Måttlig, Indirekt eller Sunt förnuft, en per rad)", multiline: true, value: `Ljus i tre höjder | Vanlig rumsbelysning före läggdags försenar sömnhormonet melatonin jämfört med dämpat ljus. | Gooley m.fl. 2011, Journal of Clinical Endocrinology & Metabolism | Stark
Rummet svarar | Visuellt stöd, som bilder och scheman, är en evidensbaserad metod vid autism. Förskolan arbetar med nio frågor som miljön ska svara på. | NCAEP, Steinbrenner m.fl. 2020 · SPSM | Stark
Ögonhöjden är fredad | Barn i kraftigt dekorerade klassrum var mer distraherade och lärde sig mindre än i avskalade. | Fisher, Godwin och Seltman 2014, Psychological Science | Måttlig
Mjukt dämpar | Buller och efterklang försämrar barns språkliga prestationer, mest för barn med uppmärksamhetssvårigheter. | Klatte, Bergström och Lachmann 2013, Frontiers in Psychology | Måttlig
Naturens färger och material | Mättade färger ökar upphetsningen, och rum med trä har gett lägre stressreaktioner. | Valdez och Mehrabian 1994; Burnard och Kutnar 2015 | Måttlig
Det handgjorda är välkommet | Stresshormonet kortisol sjönk hos tre av fyra efter 45 minuters skapande. | Kaimal, Ray och Muniz 2016, Art Therapy | Måttlig
Bågen | Rundade rum bedöms som vackrare än kantiga. | Vartanian m.fl. 2013, PNAS | Måttlig
Tre av något | Arbetsminnet rymmer ungefär tre till fem saker åt gången. | Cowan 2001, Behavioral and Brain Sciences | Indirekt
Ett hörn för vila | Teorierna om återhämtning och skydd har blandat stöd. Rohörnan bygger på förskolans kojor. | Ohly m.fl. 2016; Dosen och Ostwald 2016 | Sunt förnuft
Flöde före form | Inte prövat i hem. Arbetsterapeuter arbetar på liknande sätt. | | Sunt förnuft
Hemmet följer året | Inte prövat. | | Sunt förnuft` },
  { key: "rohem.forskning.not", label: "Rohemmet: forskningen, förbehåll", multiline: true, value: "Vi lovar aldrig effekt på diagnoser. Vi formger miljöer och föremål, vi behandlar inte. Därför står graden av kunskap bredvid varje princip, och vi går igenom ny forskning varje år." },
  { key: "rohem.matten.title", label: "Rohemmet: Ro-måtten, rubrik", value: "Folkhemmet hade köksmått. Rohemmet har *Ro-måtten.*" },
  { key: "rohem.matten.lede", label: "Rohemmet: Ro-måtten, ingress", multiline: true, value: "Konkreta riktvärden som gör principerna lätta att använda, för familjer, förskolor och den som bygger nytt. Prova ritningen: växla mellan vuxen och barn, och tänd kvällsljuset." },
  { key: "rohem.matten", label: "Rohemmet: Ro-måtten (Rubrik | text, en per rad)", multiline: true, value: `Ögonhöjdszonen | 90–160 cm för vuxna, 60–120 cm i barnrum. *Högst en tredjedel* av väggytan där har öppen förvaring eller föremål.
Krokar | Barn 3–5 år *90–100 cm*, barn 6–9 år *110–120 cm*, vuxna *160–170 cm*.
Ljus | *Tre ljuskällor* i olika höjder i varje rum där man är på kvällen. Varmt vitt, cirka *2 700 K*, dimbart. Ingen synlig ljuskälla i ögonhöjd.
Färg | *Högst tre färger* utöver trä, ungefär 60, 30 och 10 procent. Högst ett tydligt mönster per rum.
Ytor | Minst *en fri yta* per rum där ingenting står.
Ljud | Minst *en stor mjuk yta* per rum. En plats i hemmet utan skärm.
Förvaring | En krok, en korg och en hyllplats *per person* i hallen. En märkt låda per sorts sak. Ungefär en tredjedel av leksakerna framme.
Rohörnan | Minst *en per hem*, gärna en per barn. Ungefär en kvadratmeter, med ryggskydd, mjukt material och eget ljus.` },
  { key: "rohem.matten.not", label: "Rohemmet: Ro-måtten, förbehåll", multiline: true, value: "Ro-måtten är riktvärden från erfarenhet som inredare och förskollärare. De prövas och justeras i uppdragen och är inte forskningsresultat." },
  { key: "rohem.horna.title", label: "Rohemmet: rohörnan, rubrik", value: "Rohörnan" },
  { key: "rohem.horna.text", label: "Rohemmet: rohörnan, text", multiline: true, value: "Folkhemmet hade sitt rationella kök. Rohemmet har rohörnan: en plats i hemmet som bara är till för vila." },
  { key: "rohem.horna.punkter", label: "Rohemmet: rohörnan, punkter (en per rad)", multiline: true, value: `Ungefär en kvadratmeter räcker: ett hörn, en nisch, en stor stol eller en koja.
Ryggskydd, så att kroppen känner sig trygg.
Något mjukt: en pläd, en kudde, en matta.
Eget ljus, lågt och varmt.
Ingen skärm och inget som ska fixas. Börja med fem minuter om dagen.` },
  { key: "rohem.skrift.title", label: "Rohemmet: skriften, rubrik", value: "Ett snällt hem åt alla. *Gratis.*" },
  { key: "rohem.skrift.text", label: "Rohemmet: skriften, text", multiline: true, value: "Allt om Rohemmet samlat i en liten bok på 28 sidor: förord, manifestet, tio principer, Ro-måtten med ritningar, rum för rum och fyra veckor till ett snällare hem. Ladda ner, skriv ut och dela med den som behöver." },

  // ---- Ro i vardagen ----
  { key: "liv.test.title", label: "Ro-testet: rubrik", value: "Vad bullrar i *ditt hem?*" },
  { key: "liv.test.lede", label: "Ro-testet: ingress", multiline: true, value: "Sex frågor, en minut. Du får veta vilken rotyp du är och vad du kan börja med. Testet ger tips, det säger ingenting om hur din hjärna fungerar." },
  { key: "liv.rotyper", label: "Ro-testet: rotyperna (Namn | kännetecken, en per rad)", multiline: true, value: `Överblickaren | Mår bäst när allt har en plats
Den känsliga | Blir trött av ljud, ljus och intryck
Flödaren | Behöver att morgnar och kvällar flyter
Vilaren | Glömmer att återhämta sig` },
  { key: "liv.ritualer.title", label: "Ritualer: rubrik", value: "Livsstilen i *vardagen.*" },
  { key: "liv.ritualer.lede", label: "Ritualer: ingress", multiline: true, value: "Fem små ritualer som gör hemmet snällare. De är gratis och tar några minuter." },
  { key: "liv.ritualer", label: "Ritualer (Namn | när | vad man gör, en per rad)", multiline: true, value: `Kvällsljuset | när det mörknar | Släck taklampan. Tänd en lampa på golvet, en på bordet och en i fönstret.
Söndagsåterställningen | söndag, 15 minuter | Varje sak tillbaka till sin plats, och hallen redo för måndagen.
Handen i leran | när det behövs | Forma något litet med händerna, utan mål. Det lugnar.
Rohörnan | varje dag, en stund | Sitt i hörnet som bara är till för vila. Utan mobil.
Säsongsskiftet | fyra gånger per år | Plocka bort det som hörde förra säsongen till, och ta fram det nya.` },
  { key: "liv.arstider.title", label: "Årstiderna: rubrik", value: "Fyra årstider, *fyra namn.*" },
  { key: "liv.arstider.lede", label: "Årstiderna: ingress", multiline: true, value: "Varje årstid har sitt tema, sitt släpp i ateljén och sin ritual." },
  { key: "liv.arstider", label: "Årstiderna (Namn | månader | text | släpp och ritual, en per rad, i ordningen höst, vinter, vår, sommar)", multiline: true, value: `Landa | september–november | Komma tillbaka efter sommaren. Hallen och morgnarna. | Höstsläppet · Rohörnan
Ljuset | december–februari | Ljus, vila och en lugnare jul. | Vintersläppet · Kvällsljuset
Lufta | mars–maj | Rensa, sälja och flytta. Homestagingens tid. | Vårsläppet · Söndagsåterställningen
Vila | juni–augusti | Sommarhuset, ledighet och lera med barnen. | Sommarsläppet · Handen i leran` },
  { key: "liv.ord.title", label: "Orden: rubrik", value: "Ord att *leva med.*" },
  { key: "liv.ord.lede", label: "Orden: ingress", multiline: true, value: "Ett eget språk för ett lugnare hem." },
  { key: "liv.ord", label: "Orden (Ord | betydelse, en per rad)", multiline: true, value: `Brus | Allt i hemmet som tar energi utan att ge något tillbaka.
Ro | Känslan när kroppen slappnar av i ett rum.
Landa | Att komma hem och faktiskt komma fram.
Ett snällt hem | Ett hem som hjälper dig i stället för att kräva saker av dig.
Rohörna | Ett hörn som bara är till för vila.
Brusfritt | Utan stök i ögonhöjd. En brusfri hall, en brusfri bänk.
Kvällsljus | Ljus i tre höjder när det mörknar, i stället för taklampan.
Tre steg | Högst tre saker i taget.
Hörnstenarna | Överblick, sinnesro, flöde och återhämtning.` },
  { key: "liv.gemenskap.title", label: "Gemenskapen: rubrik", value: "Från kund till *stenbärare.*" },
  { key: "liv.gemenskap.lede", label: "Gemenskapen: ingress", multiline: true, value: "Du är inte ensam om att vilja ha det lugnare. Här möts vi." },
  { key: "liv.gemenskap", label: "Gemenskapen (Namn | text, en per rad)", multiline: true, value: `Söndagsbrevet | Varje söndag eftermiddag: ett tips, en ritual och vad som händer i ateljén. Som ett brev från en vän.
Ro-kvällar | En kväll i månaden i ateljén: lera, te och ett kort samtal om ljus, morgnar eller barnrum.
Stenbärarna | Alla som köpt, gått en kurs eller haft mig hemma. Förtur till släpp och kurser, och en sten i säsongens färg.
#ettsnällthem | Dela din rohörna eller dina före- och efterbilder. Jag lyfter fram några varje månad.` },

  // ---- Om Sofia ----
  { key: "om.berattelse", label: "Om Sofia: berättelsen (ett stycke per rad)", multiline: true, value: `I många år arbetade jag i förskolan. Jag såg barn som inte kunde sitta still, och som landade när vi dämpade ljuset och byggde en koja i hörnet.
Det var inte barnen som var fel. *Det var rummet som var för högljutt.*` },
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
    { kind: "Barnrumsplan", amountOre: 149500 },
    { kind: "Hembesök", amountOre: 249500 },
    { kind: "Årsstenen", amountOre: 39500 },
    { kind: "Valfritt belopp", amountOre: 0 },
  ],
};

export const SERVICES = [
  { name: "Barnrum", short: "Barnrum och syskonrum som ger ro", priceFrom: "från 995 kr", tone: "clay", badge: "Det jag gör mest", contactLabel: "Boka ett samtal",
    body: "Ett barnrum där barnen hittar sina saker, kan leka och kan varva ner, och som är vackert i lin, trä och lera. Bor barnen i två hem gör vi samma ordning i båda. För barn som behöver färre intryck finns paketet Lugna barnrum.",
    items: [["Färdigt rumskoncept: Skogen, Sjön, Berget eller Ängen", "995 kr"], ["Barnrumsplan på distans, hela Sverige", "1 495 kr"], ["Hembesök med plan, 2 h", "2 495 kr"], ["Barnrummet klart: plan, inköp och styling", "från 6 900 kr"], ["Syskonrummet: två barn i ett rum", "från 8 900 kr"]] },
  { name: "Familjens hem", short: "Hall, vardagsrum och kök som fungerar med barn", priceFrom: "från 1 495 kr", tone: "moss",
    body: "Hallen där morgonen börjar, vardagsrummet där alla ska få plats och köket där läxor och middag möts. Jag gör rummen lugna och lätta att hålla ordning på, utan att det ser ut som ett barnhem i katalogen.",
    items: [["Plan på distans, ett rum", "1 495 kr"], ["Hembesök med plan, 2 h", "2 495 kr"], ["Ett rum klart: hall, vardagsrum eller kök", "från 8 900 kr"], ["Landa i nya hemmet: plan och styling av de första rummen", "från 5 900 kr"]] },
  { name: "Ett lugnare hem", short: "För dig som vill ha det lugnare, i lin, trä och lera", priceFrom: "från 2 495 kr", tone: "surface",
    body: "Samma stil för vuxnas hem: färre saker i ögonhöjd, mjukt ljus och naturmaterial. Det passar också dig som har ADHD och vill ha ett hem som hjälper dig att hålla ordning.",
    items: [["Hembesök med plan, 2 h", "2 495 kr"], ["Rumsstyling, ett rum", "från 8 900 kr"], ["Hemmakontor och hall som hjälper dig minnas", "från 6 900 kr"], ["Årstidsbesök, fyra per år", "6 900 kr / år"]] },
  { name: "Homestaging", short: "Familjevillan som köparen ser sig själv i", priceFrom: "från 2 495 kr", tone: "surface",
    body: "De som köper villor här är ofta barnfamiljer. Jag stylar hallen och barnrummet så att köparen ser hur vardagen skulle fungera, inte bara att det är fint. Jag arbetar helst med dina egna möbler och samarbetar gärna med din mäklare.",
    items: [["Rådgivning och checklista inför visning", "2 495 kr"], ["Fotostyling på fotodagen, halvdag", "3 900 kr"], ["Styling med egna möbler", "från 7 900 kr"], ["Styling med kompletterande möbler", "från 9 900 kr"]] },
];

export const PRODUCTS = [
  { id: "arssten", name: "Årsstenen", priceOre: 39500, shape: "arssten", glaze: "havre", category: "barn", text: "Siffran och lika många motiv som barnet fyller år: fem svampar, fiskar, stjärnor eller blommor när barnet fyller fem. En sten för varje födelsedag, från 1 till 12 år.", badge: "Nyhet", stock: null },
  { id: "avtryck", name: "Första avtrycket", priceOre: 59500, shape: "avtryck", glaze: "havre", category: "barn", text: "Barnets hand eller fot i lera, med namn och datum. Vi gör avtrycket i ateljén på en kvart, och det är klart att hämta efter två veckor.", stock: null, option: { id: "avtryck-hylla", label: "Med stenhyllan i ek", priceOre: 59500 } },
  { id: "skylt", name: "Namnskylten", priceOre: 39500, shape: "namn", glaze: "havre", category: "barn", text: "Namnet i kritbokstäver och ett motiv från kollektionen, för dörren eller väggen. Efter beställningen hör jag av mig om namnet.", stock: null },
  { id: "krokar", name: "Krokarna, 3 st", priceOre: 79500, shape: "krokar", glaze: "havre", category: "barn", text: "Kollektionens tre motiv som klädkrokar i lera, till exempel svampen, kotten och granen. Sätts i barnets höjd.", stock: null },
  { id: "mobilen", name: "Mobilen", priceOre: 89500, shape: "mobil", glaze: "mossa", category: "barn", text: "En liten båge i ullfilt med fem motiv i lera. Hängs över skötbordet eller i fönstret, utom räckhåll för barnet.", stock: 6 },
  { id: "tavlan", name: "Landskapstavlan", priceOre: 129500, shape: "landskap", glaze: "havre", category: "barn", text: "En relief i lera, formad som en båge, med hela kollektionen: skogen, sjön, berget eller ängen. 25 × 30 cm.", stock: null },
  { id: "markar", name: "Lådmärken, 6 st", priceOre: 39500, shape: "markar", glaze: "havre", category: "barn", text: "En bild i lera på varje låda, så att barnet hittar och plockar undan själv. Välj bland 24 motiv, till exempel strumpor, lego och böcker.", stock: null },
  { id: "stenhyllan", name: "Stenhyllan", priceOre: 69500, shape: "stenhylla", glaze: "lera", category: "barn", text: "En hylla i ek, 60 cm, där årsstenarna står. Den rymmer ungefär tolv stenar.", stock: 6 },
  { id: "bagtavlan", name: "Bågtavlan", priceOre: 89500, shape: "bagtavla", glaze: "mossa", category: "barn", text: "En anslagstavla i ullfilt, formad som en båge, 50 × 60 cm. I kollektionens färg.", stock: 6 },
  { id: "familjeroset", name: "Familjeröset", priceOre: 119500, shape: "familjeroset", glaze: "sten", category: "hem", text: "En sten för varje person i familjen, med en initial i kritbokstäver. Fyra stenar. Fler stenar kostar 295 kr styck.", stock: null },
  { id: "filtvalvet", name: "Filtvalvet", priceOre: 179500, shape: "filtvalvet", glaze: "kantarell", category: "hem", text: "Taklampan i ullfilt: en båge över matbordet eller i barnrummet, i kollektionens färg. Görs på beställning, med en färdig CE-märkt upphängning.", stock: null },
  { id: "hangen", name: "Julhängen med namn, 3 st", priceOre: 22500, shape: "hangen", glaze: "lera", category: "hem", text: "En stjärna, ett hjärta och ett hänge med namn i kritbokstäver, med snöre av lin. Beställ före 10 december.", badge: "Säsong", stock: 20 },
];

export const EVENTS = [
  { id: "foralder-barn-nov", date: "2026-11-21", time: "10.00–12.00", kind: "workshop", label: "Förälder och barn", title: "Forma tillsammans", place: "Ateljén i Norrahammar", text: "Ni formar en skål och en namnskylt tillsammans, i lugn takt. Från 4 år. Priset gäller en förälder och ett barn.", priceOre: 45000, seats: 6, booked: 0 },
  { id: "jul-namn", date: "2026-12-03", time: "18.00–20.30", kind: "kurs", label: "Kurs i lera", title: "Julverkstad: hängen med namn", place: "Ateljén i Norrahammar", text: "Forma julhängen med namn till hela familjen. De torkar på några dagar och är klara att hänga till jul.", priceOre: 49500, seats: 8, booked: 0 },
  { id: "avtrycksdag", date: "2026-12-12", time: "10.00–15.00", kind: "workshop", label: "Avtrycksdag", title: "Första avtrycket", place: "Ateljén i Norrahammar", text: "Boka en kvart och kom med det lilla barnet. Vi gör ett avtryck av handen eller foten, med namn och datum. Det är klart att hämta efter två veckor. Priset gäller ett avtryck.", priceOre: 59500, seats: 16, booked: 0 },
  { id: "form-jan", date: "2027-01-16", time: "10.00–13.00", kind: "kurs", label: "Kurs i lera", title: "Forma i lera för vuxna", place: "Ateljén i Norrahammar", text: "Du formar en skål och en ljuslykta. Inga förkunskaper behövs, och kaffe ingår.", priceOre: 65000, seats: 8, booked: 0 },
  { id: "foralder-barn-feb", date: "2027-02-06", time: "10.00–12.00", kind: "workshop", label: "Förälder och barn", title: "Forma tillsammans", place: "Ateljén i Norrahammar", text: "Samma lugna förmiddag igen. Från 4 år. Priset gäller en förälder och ett barn.", priceOre: 45000, seats: 6, booked: 0 },
];

export const TIPS = [
  { category: "Homestaging · Flöde", title: "Börja i hallen", body: "Hallen är det första köparen ser, och där morgonen startar. Ge varje person en krok och en korg i rätt höjd, och låt ingenting stå på golvet. Det tar en eftermiddag och märks direkt." },
  { category: "Rohemmet · Sinnesro", title: "Ljus i tre höjder", body: "Släck taklampan på kvällen. En lampa på golvet, en på bordet och en i fönstret ger ett mjukt ljus som hjälper kroppen att varva ner." },
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
