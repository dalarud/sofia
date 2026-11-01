# Filtvalvet – så tillverkar du taklampan i ullfilt

*Version 1 · november 2026 · storlek 70 cm, för ett matbord för fyra*

En båge av tjock ullfilt som hänger över bordet. Ljuset faller mjukt nedåt, och filten tar ljudet från samtalet runt bordet.

## Idén i konstruktionen

Lampan har bara fyra delar:

1. **Filten:** ett rektangulärt stycke 5 mm ullfilt, böjt till en båge.
2. **Ryggstödet:** en platt ekribba på insidan längs toppen. Den bär vikten och håller lamphållaren.
3. **Två stänger i mässing** tvärs över bågens öppning, en vid varje ände. De fungerar som strängen på en pilbåge: de håller bågen i form. De syns och blir lampans kännetecken.
4. **En färdig upphängning** med sladd, takkopp och lamphållare, som köps i elbutik.

Ingen sömnad, inget lim och inga specialverktyg. Allt hålls ihop av skruvnitar.

```
        ┌────────── 70 cm ──────────┐
        ╭───────────────────────────╮   ← filt, böjd till en båge
       ╱   ═════════ ek ═════════    ╲  ← ryggstöd längs toppen
      │              ◯                │ ← lamphållare i mitten
      │              💡               │
      ●───────────────────────────────● ← stång i mässing vid varje ände
              34 cm bred, 17 cm hög
```

## Det här behöver du

### Material för en lampa

| Del | Specifikation | Antal |
|---|---|---|
| **Ullfilt** | 100 % ull, 5 mm tjock, gärna kring 1 400 g/m². Skärs 700 × 542 mm | 1 bit |
| **Ekribba** | 60 × 10 mm, 650 mm lång | 1 st |
| **Skruvnitar** i mässing | Ø 5 mm, 15 mm lång (för 5 mm filt + 10 mm ek) | 4 st |
| **Gängstång** i mässing | M4, 370 mm lång | 2 st |
| **Hattmuttrar** i mässing | M4 | 4 st |
| **Brickor** i mässing | M4, gärna med stor ytterdiameter | 4 st |
| **Upphängning** | Textilsladd med takkopp, E27-lamphållare med skärmring (gänga), gärna med sladddimmer. Ska vara CE-märkt och tåla minst 1 kg | 1 st |
| **LED-lampa** | E27, varmvit 2 700 K, dimbar, högst 10 W | 1 st |

Filten för en lampa väger ungefär ett halvt kilo, och hela skärmen under ett kilo.

**Ullfilt** finns hos specialister på designfilt, ofta i 180 cm bredd. En bit på 70 cm längd i 180 cm bredd räcker till tre lampor (3 × 542 mm = 163 cm). Be om varuprover i flera färger: mossa, kväll, havre och lera passar profilen.

### Verktyg

- Skärmatta, stållinjal på minst 1 meter och en vass kniv eller rullkniv
- Hålslag för läder (Ø 5 mm och Ø 4,5 mm), eller ett vasst borr
- Håltrimmer eller hålsåg för hålet till lamphållaren
- Borrmaskin, fin sandpapper och olja eller hårdvaxolja till eken
- Bågfil eller metallsåg om gängstången behöver kortas

## Mallarna

I den här mappen finns mallar i skala 1:1:

- `filt-70.svg` och `filt-70.dxf`: filtens kontur och alla hål
- `ryggstod-70.svg` och `ryggstod-70.dxf`: ekribban med samma hål

DXF-filerna kan skickas direkt till en laserskärare. SVG-filerna går att öppna i webbläsaren eller skriva ut på ett ritkontor. Mallarna byggs om med `python3 produkter/filtvalvet/bygg-mallar.py`, och mått som längd och hålstorlek ändras överst i skriptet.

**Hålet för lamphållaren** är Ø 40 mm i mallen. Mät gängan på den lamphållare du köper, och ändra måttet om det behövs innan du skär.

## Så gör du

### 1. Prova storleken med kartong (15 minuter)
Skär ut en kartongbit på 700 × 542 mm, böj den till en båge och håll den över bordet. Prova höjden: ungefär 60–70 cm över bordsskivan brukar vara bra. Det här är rätt tillfälle att ändra längden, innan filten skärs.

### 2. Skär filten
Lägg filten på skärmattan och skär längs linjalen med flera lätta drag i stället för ett hårt. Kontrollera att hörnen blir räta. Slå sedan hålen enligt mallen:
- Ø 40 i mitten för lamphållaren
- 4 × Ø 5 längs mittlinjen för skruvnitarna
- 4 × Ø 4,5 nära hörnen för stängerna, 20 mm in från långsidan och 40 mm in från kortsidan

### 3. Gör ryggstödet
Såga ekribban till 650 mm, slipa kanterna mjukt och borra hålen enligt mallen. Olja eller vaxa eken.

### 4. Sätt ihop
1. Lägg filten med insidan uppåt och ryggstödet längs mittlinjen, 25 mm in från varje kortsida.
2. Skruva fast ryggstödet med de fyra skruvnitarna. Mässingshuvudena syns på utsidan, som fyra prickar längs toppen.
3. Böj filten till en båge. För in en gängstång genom hålen vid ena änden, med en bricka och en hattmutter på varje sida. Dra åt tills bågen är 34 cm bred mätt på insidan. Gör likadant i andra änden.
4. Kontrollera att bågen är jämn och att båda ändarna är lika breda.

### 5. Montera ljuset
1. Trä upphängningens sladd genom hålet i filten och ryggstödet, inifrån.
2. Skruva fast lamphållaren med skärmringen så att filten och eken kläms mellan ringen och lamphållaren.
3. Skruva i LED-lampan. Kontrollera att det är minst 5 cm från lampan till filten åt alla håll.

### 6. Prova och häng upp
Tänd lampan och låt den lysa i ett par timmar. Känn efter att filten inte blir varm. Häng sedan upp den.

Att ansluta en lampa till takdosan i ett torrt rum får man oftast göra själv, men kontrollera vad som gäller hos [Elsäkerhetsverket](https://elsakerhetsverket.se/). Ny eller ändrad fast installation kräver en behörig elektriker.

## Säkerhet

- **Bara LED, högst 10 W.** LED-lampor blir varma men inte heta. Glödlampor och halogen ska inte användas.
- **Avstånd:** minst 5 cm mellan lampan och filten.
- **Ull är svårantändligt.** Ullfiber behöver omkring 570–600 °C för att antändas och självslocknar oftast när lågan tas bort ([Woolmark](https://www.woolmark.com/globalassets/_06-new-woolmark/_industry/research/factsheets/gd2405-wool-is-fire-resistant.pdf)). Det gäller fibern i allmänhet, så pröva den filt du väljer innan du säljer lampan.
- **Vikten:** kontrollera att upphängningen och takkroken tål skärmens vikt.

## Att sälja Filtvalvet

Det enklaste och säkraste sättet att börja är att **sälja skärmen och låta kunden köpa en färdig upphängning**:

| | Bara skärmen | Hel lampa med el |
|---|---|---|
| **Vad Sofia säljer** | Filt, ryggstöd, stänger och skruvnitar | Skärmen med monterad sladd och lamphållare |
| **Kunden köper** | En CE-märkt upphängning i elbutik, som vi rekommenderar | Inget mer |
| **CE-märkning** | Troligen inte, eftersom skärmen inte är elektrisk utrustning | Ja, Sofia blir tillverkare av en lampa |
| **Producentansvar** | Nej | Ja: anmälan till [Naturvårdsverket](https://www.naturvardsverket.se/vagledning-och-stod/producentansvar/producentansvar-for-elutrustning/foretag/) och årlig rapportering |

Att en skärm utan el inte behöver CE-märkas är min slutsats av att lågspänningsdirektivet gäller elektrisk utrustning, inte något en myndighet har bekräftat. Fråga Elsäkerhetsverket innan försäljningen börjar.

**Platt i paketet:** Skärmen kan säljas platt. Kunden böjer filten och skruvar i stängerna själv. Det gör frakten billig och monteringen till en liten ritual.

**Serietillverkning:** När formen är bestämd kan en laserskärare skära filten och borra hålen efter DXF-filen, och ett snickeri kan göra ryggstöden i serie. Sofia monterar, packar och sätter en stämpel med bågen på insidan av filten. Monteringen tar ungefär en kvart per lampa.

## Varianter

- **100 cm** för ett större bord: ändra `L` till 1000 i skriptet och flytta skruvnitarna. Överväg två lamphållare.
- **Färger:** mossa, kväll, havre och lera, en per årstid.
- **Dubbel filt:** en tunnare filt i en kontrastfärg på insidan ger ett varmare ljus och dämpar mer ljud.
