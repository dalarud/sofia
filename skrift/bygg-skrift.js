// Bygger skriften "Rohemmet – Ett snällt hem åt alla" som PDF i A5.
// Kör: node skrift/bygg-skrift.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const logo = fs.readFileSync(path.join(dir, '..', 'profil', 'webb', 'logotyp-webb.svg'), 'utf8').replace(/<\?xml[^>]*>/, '').trim();

const S = 'stroke="#2B362E" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const stone = (x, y, s = 1, c = '#9B5E49') => `<path transform="translate(${x} ${y}) scale(${s})" d="M-10 0 C-10 -7 9 -8 10 -1 C11 6 -9 7 -10 0Z" fill="${c}"/>`;
const ICON = {
  1: `<rect x="10" y="4" width="80" height="62" ${S}/><rect x="11" y="24" width="78" height="20" fill="#9B5E49" opacity=".25"/><line x1="10" y1="24" x2="90" y2="24" stroke="#9B5E49" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="10" y1="44" x2="90" y2="44" stroke="#9B5E49" stroke-width="1.5" stroke-dasharray="3 3"/>`,
  2: `<line x1="5" y1="66" x2="95" y2="66" ${S}/><path d="M20 66 V40 M12 40 H28 L24 30 H16Z" ${S}/><path d="M50 66 V54 M42 54 H58 L54 46 H46Z" ${S}/><path d="M80 20 V30 M74 30 H86 L83 24 H77Z" ${S}/><circle cx="20" cy="36" r="10" fill="#F6C98A" opacity=".45"/><circle cx="50" cy="51" r="9" fill="#F6C98A" opacity=".45"/><circle cx="80" cy="28" r="8" fill="#F6C98A" opacity=".45"/>`,
  3: `<rect x="8" y="22" width="24" height="22" rx="3" ${S}/><rect x="38" y="22" width="24" height="22" rx="3" ${S}/><rect x="68" y="22" width="24" height="22" rx="3" ${S}/><circle cx="20" cy="33" r="4" ${S}/><rect x="45" y="29" width="10" height="8" ${S}/><path d="M76 28 V36 L82 40" ${S}/><line x1="5" y1="48" x2="95" y2="48" ${S}/>`,
  4: `<path d="M22 66 V32 A28 28 0 0 1 78 32 V66" ${S}/><path d="M30 66 V50 Q50 44 70 50 V66" fill="#6F7D62" opacity=".8"/>${stone(50, 46, 0.9)}`,
  5: `<path d="M6 20 q8 -8 16 0 t16 0" ${S}/><path d="M6 34 q8 -8 16 0 t16 0" ${S}/><path d="M6 48 q8 -8 16 0 t16 0" ${S}/><rect x="54" y="14" width="40" height="44" rx="10" fill="#C4AF90"/><path d="M60 26 H88 M60 36 H88 M60 46 H88" stroke="#F3EEE6" stroke-width="2"/>`,
  6: `<path d="M24 60 C10 40 20 14 46 8 C50 34 44 54 24 60Z" fill="#6F7D62" opacity=".85"/><path d="M24 60 C30 40 36 28 44 14" stroke="#F3EEE6" stroke-width="1.6" fill="none"/>${stone(72, 52, 1.6, '#9A968C')}`,
  7: `<rect x="62" y="10" width="26" height="56" ${S}/><circle cx="83" cy="40" r="1.8" fill="#2B362E"/><path d="M8 50 C24 50 30 30 46 34 C52 36 54 40 58 40" ${S}/><path d="M52 34 L59 40 L52 46" ${S}/>`,
  8: `${stone(22, 46, 1.4)}${stone(50, 46, 1.4, '#6F7D62')}${stone(78, 46, 1.4, '#C4AF90')}<line x1="6" y1="60" x2="94" y2="60" ${S}/>`,
  9: `<path d="M20 30 C22 56 78 56 80 30" ${S}/><ellipse cx="50" cy="30" rx="30" ry="7" ${S}/><path d="M34 52 C40 60 60 60 66 52" stroke="#9B5E49" stroke-width="2" fill="none"/><line x1="10" y1="62" x2="90" y2="62" ${S}/>`,
  10: `<circle cx="50" cy="36" r="27" ${S}/><path d="M50 9 V63 M23 36 H77" stroke="#2B362E" stroke-width="1.6"/><path d="M50 36 L50 9 A27 27 0 0 1 77 36Z" fill="#6F7D62" opacity=".6"/><path d="M50 36 L77 36 A27 27 0 0 1 50 63Z" fill="#8F7F92" opacity=".6"/><path d="M50 36 L50 63 A27 27 0 0 1 23 36Z" fill="#C4AF90" opacity=".7"/><path d="M50 36 L23 36 A27 27 0 0 1 50 9Z" fill="#D2C2A6" opacity=".7"/>`,
};

const P = [
  ['Ögonhöjden är fredad', 'Det som syns mellan knä och huvud tar mest uppmärksamhet. Där ska det vara lugnast. Låt det som är fint och lugnt få plats i ögonhöjd, och lägg resten högre, lägre eller bakom luckor.', 'Ställ dig i dörren och titta rakt fram. Ta bort hälften av det du ser.'],
  ['Ljus i tre höjder', 'Golv, bord och fönster. Taklampan är aldrig den enda ljuskällan, och på kvällen är den släckt. Låga, varma ljus säger till kroppen att det är dags att varva ner.', 'Släck taklampan i kväll och tänd tre andra lampor i stället.'],
  ['Allt har en plats, och platsen syns', 'Det man inte hittar letar man efter, och letande tar energi. Mycket bakom luckor, lite på öppna hyllor, och det som ligger i lådor och korgar är märkt med ord eller bild.', 'Välj en låda och sätt en bild på den som visar vad som ska ligga där.'],
  ['Ett hörn för vila i varje hem', 'Rohörnan är lika självklar som en säng. En plats som bara är till för vila, med ryggskydd, något mjukt och eget ljus.', 'Välj ett hörn och lägg dit en pläd. Det räcker för att börja.'],
  ['Mjukt dämpar', 'Hårda ytor gör att ljud studsar och ekar. Varje rum behöver minst en stor mjuk yta: en matta, gardiner eller textil på väggen.', 'Lägg en matta i det rum där ni är mest. Lyssna på skillnaden.'],
  ['Naturens färger och material', 'Låg färgmättnad, trä, lin, ull, sten och lera. Material som åldras vackert och som är sköna att ta i. Naturens färger ger ögat vila.', 'Byt en sak i plast mot en i trä, lin eller lera.'],
  ['Flöde före form', 'Rummet formas efter det som händer där varje dag. Hallen formas efter morgonen, sovrummet efter kvällen. Det som hakar upp sig varje dag är det som ska ändras först.', 'Gå igenom morgonen steg för steg. Var stannar det?'],
  ['Tre av något', 'Färre val ger ro. Tre färger i ett rum, tre saker på en yta, tre steg i taget. Tre är tillräckligt för att det ska kännas levande, och få nog för att ögat ska vila.', 'Välj en yta och låt bara tre saker stå där.'],
  ['Det handgjorda är välkommet', 'En sak gjord av en människa ger mer än tio från ett lager. Den får vara ojämn. Allra bäst är det som du har gjort själv.', 'Forma något litet i lera, eller ställ fram något som någon har gjort till dig.'],
  ['Hemmet följer året', 'Fyra årstider, fyra små skiften. Det som hör till förra årstiden får vila, och det nya får plats. Ett hem blir aldrig klart, och det är fint.', 'Plocka bort tre saker som hör sommaren till, och ta fram något för hösten.'],
];

let html = fs.readFileSync(path.join(dir, 'skrift.src.html'), 'utf8').split('{{LOGO}}').join(logo);
P.forEach(([t, body, tryIt], i) => {
  const n = i + 1;
  html = html.replace(`{{P${n}}}`, `<div class="principle"><div><span class="pn">${n}</span><svg viewBox="0 0 100 70" aria-hidden="true">${ICON[n]}</svg></div><div><h3>${t}</h3><p>${body}</p><p class="try"><b>Prova</b>${tryIt}</p></div></div>`);
});
fs.writeFileSync(path.join(dir, 'skrift.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(dir, 'skrift.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(['20px Caveat', '20px "Instrument Serif"', 'italic 20px "Instrument Serif"', '600 10px "Hanken Grotesk"'].map((f) => document.fonts.load(f))));
  const pages = await page.evaluate(() => document.querySelectorAll('.page').length);
  const over = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => [i + 1, p.scrollHeight - p.clientHeight]).filter(([, d]) => d > 1));
  await page.pdf({ path: path.join(dir, 'rohemmet-ett-snallt-hem-at-alla.pdf'), width: '148mm', height: '210mm', printBackground: true });
  await browser.close();
  console.log('klart:', pages, 'sidor', over.length ? 'för långa sidor: ' + JSON.stringify(over) : '');
})();
