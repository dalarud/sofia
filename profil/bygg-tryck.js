// Bygger PNG-filer i hög upplösning, bilder till manualen och den grafiska manualen som PDF.
// Körs efter bygg-logotyp.py:  node bygg-tryck.js
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const SVG = path.join(HERE, 'logotyp', 'svg');
const PNG = path.join(HERE, 'logotyp', 'png');
const BILDER = path.join(HERE, 'manual', 'bilder');
// bredd i pixlar vid 300 dpi
const BREDD = { 'logotyp-staende': 4000, symbol: 4000, logotyp: 6000 };

(async () => {
  fs.mkdirSync(PNG, { recursive: true });
  fs.mkdirSync(BILDER, { recursive: true });
  const browser = await chromium.launch();

  // 1. PNG med genomskinlig bakgrund
  const p = await browser.newPage({ deviceScaleFactor: 4 });
  for (const file of fs.readdirSync(SVG).filter((f) => f.endsWith('.svg'))) {
    const layout = Object.keys(BREDD).find((k) => file.startsWith('dalarud-' + k + '-'));
    const css = BREDD[layout] / 4;
    await p.setViewportSize({ width: Math.ceil(css) + 20, height: 1400 });
    await p.goto('file://' + path.join(SVG, file));
    await p.evaluate((w) => {
      const s = document.querySelector('svg'), vb = s.viewBox.baseVal;
      s.style.width = w + 'px'; s.style.height = (w * vb.height / vb.width) + 'px'; s.style.display = 'block';
    }, css);
    const out = path.join(PNG, file.replace('.svg', '.png'));
    await (await p.$('svg')).screenshot({ path: out, omitBackground: true });
    execSync(`convert "${out}" -units PixelsPerInch -density 300 "${out}"`);
  }

  // 2. Bilder från hemsidan till manualen
  const site = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  await site.goto('file://' + path.join(HERE, '..', 'index.html'));
  await site.waitForTimeout(5000);
  await (await site.$('#stageCanvas')).screenshot({ path: path.join(BILDER, 'ro.png') });
  await (await site.$('#planCanvas')).screenshot({ path: path.join(BILDER, 'plan.png') });
  await site.evaluate(() => document.querySelector('#shelf').scrollIntoView());
  await site.waitForTimeout(300);
  const shelf = await (await site.$('#shelf')).boundingBox();
  const tag = await (await site.$('#shelf .tag')).boundingBox();
  await site.screenshot({ path: path.join(BILDER, 'hylla.png'), clip: { x: shelf.x, y: shelf.y, width: shelf.width, height: tag.y + tag.height - shelf.y } });
  await site.evaluate(() => { const s = document.querySelector('#roSlider'); s.value = 0; s.dispatchEvent(new Event('input')); });
  await (await site.$('#stageCanvas')).screenshot({ path: path.join(BILDER, 'brus.png') });
  execSync(`pdftoppm -r 200 -png "${path.join(HERE, 'visitkort-tryck.pdf')}" "${path.join(BILDER, 'visitkort')}"`);

  // 3. Grafisk manual
  const m = await browser.newPage();
  await m.goto('file://' + path.join(HERE, 'manual', 'manual.html'));
  await m.evaluate(() => document.fonts.ready);
  await m.waitForTimeout(500);
  await m.pdf({ path: path.join(HERE, 'grafisk-manual.pdf'), width: '297mm', height: '210mm', printBackground: true });
  await browser.close();
  console.log('klart');
})();
