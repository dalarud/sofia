// Bygger den gratis guiden "7 saker för ett lugnare barnrum" som PDF (A5).
// Akvarellskisserna ritas med samma pensel som hemsidan, som hämtas ur index.html.
// Kör: node guide/bygg-guide.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'guide.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('20px Caveat'));

  const site = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const from = site.indexOf('/* ================= Penseln'), to = site.indexOf('/* ================= Hero');
  const engine = 'var DPR = 1; var token = function () { return ""; };\n' + site.slice(from, to);
  await page.addScriptTag({ content: engine + '\n' + fs.readFileSync(path.join(__dirname, 'ritningar.js'), 'utf8') });
  await page.waitForFunction(() => window.__klar === true);

  await page.pdf({ path: path.join(__dirname, '7-saker-for-ett-lugnare-barnrum.pdf'), width: '148mm', height: '210mm', printBackground: true });
  await browser.close();
  console.log('klart');
})();
