(function () {
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var SITE = window.__SITE || { products: [], events: [] };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function post(url, body) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Något gick fel. Försök igen om en stund."); return j; }); });
  }
  var token = function (name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); };

  /* ================= Penseln: akvarell och blyerts ================= */
  // Allt bildmaterial målas i webbläsaren som akvarellskisser, med en fast slumpfrö så att varje bild blir likadan varje gång.
  function rng(seed) { var s = (seed * 9301 + 49297) % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function gauss(r) { var u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function deform(pts, depth, r) {
    for (var d = 0; d < depth; d++) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), v = (a[2] + b[2]) / 2;
        out.push(a, [(a[0] + b[0]) / 2 + gauss(r) * len * v * .5, (a[1] + b[1]) / 2 + gauss(r) * len * v * .5, v * (.5 + r() * .35)]);
      }
      pts = out;
    }
    return pts;
  }
  function trace(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  // Tätare punkter ger mjukare kanter, som färg som flyter ut i vått papper.
  function resample(poly, step) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (var s = 0; s < n; s++) out.push([a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n]);
    }
    return out;
  }
  function wash(ctx, poly, color, o) {
    o = o || {};
    var r = rng(o.seed || 1), layers = o.layers || 22, spread = o.spread == null ? .5 : o.spread;
    var base = deform(resample(poly, o.step || 9).map(function (p) { return [p[0], p[1], spread * (.4 + r() * 1.2)]; }), 1, r);
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color;
    for (var i = 0; i < layers; i++) {
      ctx.globalAlpha = (o.alpha || .05) * (i % 3 === 0 ? 1.6 : 1);
      trace(ctx, deform(base.map(function (q) { return [q[0], q[1], q[2] * .7]; }), 2, r)); ctx.fill();
    }
    // pigmentet samlas i kanten
    ctx.globalAlpha = o.edge == null ? .22 : o.edge; ctx.lineWidth = 1.1; trace(ctx, base); ctx.stroke();
    ctx.restore();
  }
  function pencil(ctx, pts, o) {
    o = o || {};
    var r = rng(o.seed || 3), seq = o.closed === false ? pts.slice() : pts.concat([pts[0]]), j = o.jitter == null ? 1.1 : o.jitter;
    ctx.save(); ctx.strokeStyle = o.color || "#3A3A34"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (o.dash) ctx.setLineDash(o.dash);
    for (var pass = 0; pass < (o.passes || 2); pass++) {
      ctx.globalAlpha = (o.alpha || .6) * (pass ? .55 : 1); ctx.lineWidth = (o.width || 1) * (pass ? .8 : 1);
      var ox = gauss(r) * j, oy = gauss(r) * j, wx = 0, wy = 0;
      ctx.beginPath();
      for (var i = 0; i < seq.length - 1; i++) {
        var a = seq[i], b = seq[i + 1], steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5));
        for (var s = i ? 1 : 0; s <= steps; s++) {
          wx = wx * .85 + gauss(r) * .22 * j; wy = wy * .85 + gauss(r) * .22 * j;
          var t = s / steps, x = a[0] + (b[0] - a[0]) * t + ox + wx, y = a[1] + (b[1] - a[1]) * t + oy + wy;
          if (i === 0 && s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function ellipse(cx, cy, rx, ry, n, wob, seed) {
    var r = rng(seed || 5), out = []; n = n || 24;
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, k = 1 + (wob || 0) * (r() - .5); out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return out;
  }
  function rect(x, y, w, h) {
    var nw = Math.max(2, Math.round(w / 14)), nh = Math.max(2, Math.round(h / 14)), out = [], i;
    for (i = 0; i < nw; i++) out.push([x + w * i / nw, y]);
    for (i = 0; i < nh; i++) out.push([x + w, y + h * i / nh]);
    for (i = 0; i < nw; i++) out.push([x + w - w * i / nw, y + h]);
    for (i = 0; i < nh; i++) out.push([x, y + h - h * i / nh]);
    return out;
  }
  // Föremål i profil: [y, halva bredden] uppifrån och ner, speglat runt cx.
  function profile(cx, rows) {
    return rows.map(function (q) { return [cx + q[1], q[0]]; }).concat(rows.slice().reverse().map(function (q) { return [cx - q[1], q[0]]; }));
  }
  var grainCanvas;
  function grain() {
    if (!grainCanvas) {
      grainCanvas = document.createElement("canvas"); grainCanvas.width = grainCanvas.height = 180;
      var g = grainCanvas.getContext("2d"), id = g.createImageData(180, 180), r = rng(11);
      for (var i = 0; i < id.data.length; i += 4) { var v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 16; }
      g.putImageData(id, 0, 0);
    }
    return grainCanvas;
  }
  function paper(ctx, w, h, color) { ctx.save(); ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); ctx.fillStyle = ctx.createPattern(grain(), "repeat"); ctx.fillRect(0, 0, w, h); ctx.restore(); }
  function fit(canvas, designW, designH) {
    var w = canvas.clientWidth; if (!w) return null;
    canvas.width = Math.round(w * DPR); canvas.height = Math.round(w * DPR * designH / designW);
    var ctx = canvas.getContext("2d"), k = canvas.width / designW; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, designW, designH);
    return ctx;
  }
  function shade(hex, f) { return "rgb(" + [1, 3, 5].map(function (i) { return Math.round(parseInt(hex.slice(i, i + 2), 16) * f); }).join(",") + ")"; }

  /* ================= Hero: från brus till ro ================= */
  var NOISE = ["#E0663D", "#3F6FB5", "#E2B93B", "#C2457A", "#4E9E68", "#7A4FB0", "#D9542F", "#2E8CA8"];
  var CALM = { rod: "#B08A63", ring: "#7E8B6F", book: "#A9705A", pebble: "#9A968C", dot: "#C9AE8C", tray: "#5F6E59" };
  var SIZE = { rod: [7, 110], ring: [48, 48], book: [52, 34], pebble: [40, 28], dot: [14, 14], tray: [80, 20] };
  function paintItem(ctx, type, color, seed) {
    var dark = shade(color, .72), p;
    if (type === "rod") { p = rect(-7, -110, 14, 220); wash(ctx, p, color, { seed: seed, spread: .2, alpha: .07 }); pencil(ctx, p, { seed: seed, width: .9, alpha: .5 }); }
    if (type === "ring") {
      p = ellipse(0, 0, 48, 48, 22, .08, seed); wash(ctx, p, color, { seed: seed });
      wash(ctx, ellipse(3, 4, 30, 29, 18, .1, seed + 1), dark, { seed: seed + 1, layers: 14 });
      pencil(ctx, p, { seed: seed }); pencil(ctx, ellipse(0, 0, 30, 30, 18, .06, seed + 2), { seed: seed + 2, alpha: .4, passes: 1 });
    }
    if (type === "book") {
      p = rect(-52, -34, 104, 68); wash(ctx, p, color, { seed: seed, spread: .3 });
      wash(ctx, rect(-52, -34, 13, 68), dark, { seed: seed + 1, spread: .15, layers: 12 });
      pencil(ctx, p, { seed: seed }); pencil(ctx, [[-38, -33], [-38, 33]], { seed: seed + 3, closed: false, alpha: .4, passes: 1 });
    }
    if (type === "pebble") {
      p = ellipse(0, 0, 40, 27, 20, .14, seed); wash(ctx, p, color, { seed: seed });
      wash(ctx, ellipse(-10, -8, 15, 6, 12, .1, seed + 4), "#FFFFFF", { seed: seed + 4, layers: 8, alpha: .07, edge: 0 });
      pencil(ctx, p, { seed: seed, alpha: .45 });
    }
    if (type === "dot") { p = ellipse(0, 0, 14, 14, 14, .12, seed); wash(ctx, p, color, { seed: seed, layers: 16, alpha: .07 }); pencil(ctx, p, { seed: seed, alpha: .35, passes: 1, width: .8 }); }
    if (type === "tray") { p = rect(-80, -20, 160, 40); wash(ctx, p, color, { seed: seed, spread: .25 }); pencil(ctx, p, { seed: seed }); }
  }
  function offscreen(w, h, k, paint) {
    var c = document.createElement("canvas"); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
    var x = c.getContext("2d"); x.setTransform(k, 0, 0, k, 0, 0); paint(x); return c;
  }
  function sprite(type, color, seed, k) {
    var s = SIZE[type], w = (s[0] + 26) * 2, h = (s[1] + 26) * 2;
    var c = offscreen(w, h, k, function (x) { x.translate(w / 2, h / 2); paintItem(x, type, color, seed); });
    c.hw = w / 2; c.hh = h / 2; return c;
  }

  var items = [];
  function add(type, x, y) { items.push({ type: type, cx: x, cy: y }); }
  for (var i = 0; i < 6; i++) add("rod", 110 + i * 26, 250);
  [340, 480, 620].forEach(function (x) { add("ring", x, 140); });
  [340, 480, 620].forEach(function (x) { add("book", x, 280); });
  [340, 433, 527, 620].forEach(function (x) { add("pebble", x, 410); });
  for (var row = 0; row < 4; row++) for (var col = 0; col < 3; col++) add("dot", 770 + col * 56, 110 + row * 56);
  add("tray", 826, 400);
  var hr = rng(7);
  items.forEach(function (it) { it.x0 = 70 + hr() * 860; it.y0 = 60 + hr() * 380; it.r0 = -90 + hr() * 180; it.s0 = .75 + hr() * .6; });
  var scribbles = [];
  for (var n = 0; n < 9; n++) { var pts = []; for (var q = 0; q < 7; q++) pts.push([60 + hr() * 880, 40 + hr() * 420]); scribbles.push(pts); }

  var stage = $("#stageCanvas"), sctx = null, hk = 1, paperLayer, noiseLayer, heroT = 0, heroW = 0;
  function buildHero() {
    var w = stage.clientWidth; if (!w || w === heroW) return; heroW = w;
    stage.width = Math.round(w * DPR); stage.height = Math.round(w * DPR / 2); hk = stage.width / 1000;
    sctx = stage.getContext("2d");
    paperLayer = offscreen(1000, 500, hk, function (x) { paper(x, 1000, 500, "#EEE6D8"); });
    noiseLayer = offscreen(1000, 500, hk, function (x) {
      scribbles.forEach(function (s, i) { pencil(x, s, { seed: 40 + i, closed: false, color: NOISE[i % NOISE.length], width: 2.2, alpha: .5, jitter: 2.2 }); });
    });
    items.forEach(function (it, i) { it.a = sprite(it.type, NOISE[i % NOISE.length], 100 + i, hk); it.b = sprite(it.type, CALM[it.type], 100 + i, hk); });
    drawHero(heroT);
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var caption = $("#stageCaption"), slider = $("#roSlider"), lastHalf = null;
  function drawHero(t) {
    heroT = t;
    slider.style.setProperty("--fill", Math.round(t * 100) + "%");
    var half = t >= .55;
    if (half !== lastHalf) { caption.textContent = half ? "Så kan det kännas: varje sak har sin plats, och huvudet får vila." : "Så känns det i många hem: allt på en gång."; lastHalf = half; }
    if (!sctx) return;
    sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.globalAlpha = 1; sctx.drawImage(paperLayer, 0, 0);
    sctx.globalAlpha = Math.max(0, 1 - ease(t) * 1.8); sctx.drawImage(noiseLayer, 0, 0);
    items.forEach(function (it, idx) {
      // varje föremål landar lite förskjutet, så att ordningen "sätter sig"
      var lag = (idx % 7) * .035, te = ease(Math.min(1, Math.max(0, (t - lag) / .79)));
      sctx.setTransform(hk, 0, 0, hk, 0, 0);
      sctx.translate(it.x0 + (it.cx - it.x0) * te, it.y0 + (it.cy - it.y0) * te);
      sctx.rotate(it.r0 * (1 - te) * Math.PI / 180);
      var s = it.s0 + (1 - it.s0) * te; sctx.scale(s, s);
      if (te < 1) { sctx.globalAlpha = 1 - te; sctx.drawImage(it.a, -it.a.hw, -it.a.hh, it.a.hw * 2, it.a.hh * 2); }
      if (te > 0) { sctx.globalAlpha = te; sctx.drawImage(it.b, -it.b.hw, -it.b.hh, it.b.hw * 2, it.b.hh * 2); }
    });
    sctx.globalAlpha = 1;
  }
  var anim = null;
  function autoPlay() {
    if (reduce) { slider.value = 100; drawHero(1); return; }
    var start = null, dur = 3200;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      slider.value = Math.round(t * 100); drawHero(t);
      if (t < 1) anim = requestAnimationFrame(step);
    }
    anim = requestAnimationFrame(step);
  }
  slider.addEventListener("input", function () { if (anim) cancelAnimationFrame(anim); anim = null; drawHero(slider.value / 100); });
  drawHero(0);
  requestAnimationFrame(function () { buildHero(); setTimeout(autoPlay, 600); });

  /* ================= Ro-modellen: skissad planritning ================= */
  var PILLARS = {
    overblick: { title: "Överblick", text: "En plats för varje sak och tydliga zoner. Mindre letande, färre beslut och mer energi till annat.",
      tips: ["Krokar och en korg per person i hallen, i barnens höjd.", "Lådor i barnrummet med en bild på vad som finns i dem.", "En fast plats i köket för nycklar, post och laddare."],
      washes: [["r", 14, 234, 152, 162], ["r", 250, 300, 146, 96], ["r", 14, 56, 76, 60]], pins: [[90, 300], [320, 340], [52, 86]] },
    sinnesro: { title: "Sinnesro", text: "Ljus, ljud, färg och material i balans. Färre intryck där ögat vilar, så att kroppen kan slappna av.",
      tips: ["Lampor på flera höjder istället för en stark taklampa.", "Matta, gardiner och kuddar som dämpar ljud i vardagsrummet.", "Mörkläggning och lugna, dova färger runt sängen."],
      washes: [["e", 395, 114, 82, 72], ["r", 404, 234, 182, 162]], pins: [[270, 40], [395, 114], [495, 310]] },
    flode: { title: "Flöde", text: "Hemmet stödjer vardagens rutiner. När vägen genom morgonen är självklar blir det färre konflikter.",
      tips: ["Morgonen: allt som behövs ligger vid ytterdörren.", "En läxplats nära köket, där en vuxen finns till hands.", "Kvällen: samma ordning varje kväll, synlig som en bildremsa."],
      path: [[60, 380], [76, 310], [92, 250], [116, 196], [160, 150], [212, 132], [250, 170], [262, 236], [280, 300], [300, 330]], pins: [[60, 380], [160, 150], [300, 330]] },
    aterhamtning: { title: "Återhämtning", text: "Minst en plats i hemmet som bara är till för vila. För barn och vuxna, varje dag.",
      tips: ["En koja eller ett tält med kuddar i barnrummet.", "En läshörna med fåtölj, pläd och en egen lampa.", "Tunga täcken och mjuka material i sovrummet."],
      washes: [["e", 350, 350, 46, 40], ["e", 546, 166, 46, 44], ["e", 495, 310, 58, 52]], pins: [[350, 350], [546, 166], [495, 310]] }
  };
  var WALLS = [[[10, 10], [590, 10], [590, 400], [10, 400], [10, 10]], [[220, 10], [220, 100]], [[220, 160], [220, 230]], [[10, 230], [60, 230]], [[120, 230], [560, 230]],
    [[170, 230], [170, 290]], [[170, 340], [170, 400]], [[400, 230], [400, 300]], [[400, 350], [400, 400]]];
  var FURN = [["r", 22, 22, 186, 28], ["c", 110, 148, 36], ["r", 300, 66, 190, 96], ["r", 292, 176, 200, 36], ["r", 520, 140, 52, 52], ["r", 22, 352, 96, 26],
    ["r", 186, 246, 56, 104], ["r", 320, 246, 56, 40], ["r", 440, 250, 110, 120]];
  var LABELS = [["kök", 26, 216], ["vardagsrum", 470, 42], ["hall", 26, 262], ["barnrum", 186, 392], ["sovrum", 420, 392]];
  var planCanvas = $("#planCanvas"), currentPillar = "overblick";
  function drawPlan() {
    var ctx = fit(planCanvas, 600, 410); if (!ctx) return;
    var z = PILLARS[currentPillar], ACC = "#B8735A";
    paper(ctx, 600, 410, "#EFE8DB");
    (z.washes || []).forEach(function (w, i) {
      var poly = w[0] === "r" ? rect(w[1], w[2], w[3], w[4]) : ellipse(w[1], w[2], w[3], w[4], 24, .18, 60 + i);
      wash(ctx, poly, ACC, { seed: 60 + i, alpha: .04, layers: 18, spread: .35, edge: .12 });
    });
    FURN.forEach(function (f, i) {
      var p = f[0] === "c" ? ellipse(f[1], f[2], f[3], f[3], 22, 0, 7) : rect(f[1], f[2], f[3], f[4]);
      wash(ctx, p, "#9C9384", { seed: 20 + i, alpha: .03, layers: 10, spread: .2, edge: .1 });
      pencil(ctx, p, { seed: 20 + i, width: .8, alpha: .5 });
    });
    WALLS.forEach(function (w, i) { pencil(ctx, w, { seed: 80 + i, closed: false, width: 2.6, alpha: .8, passes: 3, jitter: .7 }); });
    if (z.path) pencil(ctx, z.path, { seed: 9, closed: false, color: ACC, width: 2.6, alpha: .9, passes: 1, dash: [3, 10], jitter: .5 });
    ctx.fillStyle = "#4A4A42"; ctx.font = "22px Caveat, 'Segoe Print', 'Bradley Hand', cursive";
    LABELS.forEach(function (l) { ctx.fillText(l[0], l[1], l[2]); });
    z.pins.forEach(function (p, i) {
      wash(ctx, ellipse(p[0], p[1], 14, 14, 16, .1, 90 + i), "#A65F45", { seed: 90 + i, alpha: .16, layers: 12, spread: .15, edge: .3 });
      ctx.fillStyle = "#FBF7F1"; ctx.font = "700 22px Caveat, 'Segoe Print', cursive"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ABC"[i], p[0], p[1] + 1); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    });
  }
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function showPillar(key) {
    var p = PILLARS[key]; currentPillar = key;
    tabs.forEach(function (t) { var on = t.dataset.pillar === key; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; if (on) $("#roPanel").setAttribute("aria-labelledby", t.id); });
    $("#roTitle").textContent = p.title; $("#roText").textContent = p.text;
    $("#roTips").innerHTML = p.tips.map(function (tip, i) { return "<li><b>" + "ABC"[i] + "</b><span>" + tip + "</span></li>"; }).join("");
    planCanvas.setAttribute("aria-label", "Skissad planritning av ett familjehem. Markeringar A till C visar var " + p.title.toLowerCase() + " gör skillnad.");
    drawPlan();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { showPillar(t.dataset.pillar); });
    t.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      var next = tabs[(i + dir + tabs.length) % tabs.length]; next.focus(); showPillar(next.dataset.pillar);
    });
  });
  showPillar("overblick");
  if (document.fonts && document.fonts.load) document.fonts.load("22px Caveat").then(function () {
    drawPlan();
    var c = document.querySelector('[data-product="skylt"]');
    if (c) { byId.skylt.img = null; drawProduct(c); }
  }, function () {});

  /* ================= Ateljén ================= */
  var GLAZE = { mossa: "#7E8B6F", lera: "#A9705A", havre: "#D2C2A6", strand: "#C4AF90", kvall: "#8F7F92", sten: "#9A968C" };
  var OBJ = {
    vas: { body: profile(100, [[16, 12], [26, 12.5], [42, 17], [60, 27], [80, 38], [100, 45], [120, 46], [140, 41], [156, 31], [166, 22], [170, 17]]), rims: [[100, 16, 12, 3.5]] },
    skal: { body: profile(100, [[108, 74], [122, 71], [136, 63], [150, 50], [162, 33], [169, 22], [171, 18]]), rims: [[100, 108, 74, 12]], inner: [100, 109, 63, 8] },
    stake: { body: profile(100, [[64, 14], [70, 12], [78, 8], [148, 8], [156, 15], [163, 26], [170, 29]]), rims: [[100, 64, 14, 3.5]], candle: true },
    lykta: { body: profile(100, [[70, 36], [120, 36], [164, 36], [170, 31]]), rims: [[100, 70, 36, 7]], holes: [[84, 104], [100, 96], [116, 104], [92, 128], [108, 128], [100, 150]] },
    sten: { body: ellipse(100, 148, 52, 26, 22, .12, 9) },
    markar: { custom: drawMarkar },
    skylt: { custom: drawSkylt },
    hangen: { custom: drawHangen, noShadow: true },
    tval: { body: profile(100, [[150, 70], [156, 68], [163, 56], [170, 40]]), rims: [[100, 150, 70, 12]], ridges: true }
  };
  // Lådmärken: tre märken med bildstöd som lutar mot hyllan
  function drawMarkar(ctx, c, pen, seed) {
    [[62, -8, "boll"], [100, 4, "bok"], [138, -4, "strumpa"]].forEach(function (m, i) {
      ctx.save(); ctx.translate(m[0], 168); ctx.rotate(m[1] * Math.PI / 180);
      var t = rect(-17, -46, 34, 46);
      wash(ctx, t, c, { seed: seed + i, alpha: .07, layers: 18, spread: .15 });
      pencil(ctx, t, { seed: seed + i, color: pen, alpha: .5 });
      pencil(ctx, ellipse(0, -38, 3, 3, 10, 0, 1), { seed: seed + 9 + i, color: pen, alpha: .45, passes: 1 });
      pencil(ctx, [[0, -41], [5, -52], [-3, -60], [5, -68]], { seed: seed + 20 + i, closed: false, color: pen, alpha: .4, passes: 1 });
      if (m[2] === "boll") pencil(ctx, ellipse(0, -16, 8, 8, 16, 0, 2), { seed: seed + 30, color: pen, alpha: .55 });
      if (m[2] === "bok") { pencil(ctx, rect(-9, -24, 18, 14), { seed: seed + 31, color: pen, alpha: .55 }); pencil(ctx, [[0, -24], [0, -10]], { seed: seed + 32, closed: false, color: pen, alpha: .5, passes: 1 }); }
      if (m[2] === "strumpa") pencil(ctx, [[-3, -28], [-3, -16], [4, -9], [9, -11], [6, -16], [3, -18], [3, -28]], { seed: seed + 33, closed: false, color: pen, alpha: .55 });
      ctx.restore();
    });
  }
  // Dörrskylt: oval skylt med namn och snöre
  function drawSkylt(ctx, c, pen, seed) {
    var s = ellipse(100, 128, 64, 36, 30, .04, seed);
    wash(ctx, s, c, { seed: seed, alpha: .065, layers: 22, spread: .2 });
    pencil(ctx, s, { seed: seed, color: pen, alpha: .55 });
    pencil(ctx, [[62, 100], [76, 72], [100, 62], [124, 72], [138, 100]], { seed: seed + 3, closed: false, color: pen, alpha: .45, passes: 1 });
    ctx.save(); ctx.fillStyle = pen; ctx.globalAlpha = .75; ctx.font = "34px Caveat, 'Segoe Print', cursive"; ctx.textAlign = "center"; ctx.fillText("Elsa", 100, 140); ctx.restore();
  }
  // Julgranshängen: två stjärnor och ett hjärta på en kvist
  function drawHangen(ctx, c, pen, seed) {
    pencil(ctx, [[34, 36], [80, 30], [126, 27], [168, 22]], { seed: seed, closed: false, color: pen, width: 2.2, alpha: .6 });
    function star(cx, cy, r) { var pts = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return pts; }
    function heart(cx, cy, r) { var pts = []; for (var i = 0; i < 28; i++) { var t = i / 28 * Math.PI * 2; pts.push([cx + r * .06 * 16 * Math.pow(Math.sin(t), 3), cy - r * .06 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } return pts; }
    [[64, 32, 98, star(64, 98, 24)], [104, 29, 122, heart(104, 120, 22)], [144, 25, 96, star(144, 96, 22)]].forEach(function (o, i) {
      pencil(ctx, [[o[0], o[1]], [o[0], o[2] - 22]], { seed: seed + 5 + i, closed: false, color: pen, alpha: .4, passes: 1 });
      wash(ctx, o[3], i === 1 ? GLAZE.mossa : c, { seed: seed + 10 + i, alpha: .07, layers: 18, spread: .15 });
      pencil(ctx, o[3], { seed: seed + 10 + i, color: pen, alpha: .5 });
    });
  }
  function paintProduct(ctx, p) {
    var o = OBJ[p.shape], c = GLAZE[p.glaze], pen = token("--pencil") || "#3A3A34", seed = p.seed;
    if (!o.noShadow) wash(ctx, ellipse(100, 171, 66, 6, 20, .1, seed), "#6E6352", { seed: seed, alpha: .03, layers: 12, spread: .2, edge: 0 });
    if (o.custom) { o.custom(ctx, c, pen, seed); return; }
    if (o.candle) {
      var cd = rect(95, 12, 10, 52);
      wash(ctx, cd, "#EFE7D6", { seed: seed + 5, alpha: .12, layers: 12, spread: .1 }); pencil(ctx, cd, { seed: seed + 5, color: pen, alpha: .4, passes: 1 });
      wash(ctx, ellipse(100, 5, 3.5, 6, 12, .1, seed + 6), "#F2C66D", { seed: seed + 6, alpha: .25, layers: 8, spread: .1 });
    }
    wash(ctx, o.body, c, { seed: seed, alpha: .06, layers: 24, spread: .3 });
    // skuggsida: samma form, smalare och förskjuten åt höger
    wash(ctx, o.body.map(function (q) { return [100 + (q[0] - 100) * .55 + 12, q[1]]; }), shade(c, .72), { seed: seed + 2, alpha: .025, layers: 12, spread: .25, edge: 0 });
    if (o.inner) wash(ctx, ellipse(o.inner[0], o.inner[1], o.inner[2], o.inner[3], 22, .05, seed + 3), shade(c, .6), { seed: seed + 3, alpha: .05, layers: 12, spread: .15 });
    (o.holes || []).forEach(function (hp, i) { wash(ctx, ellipse(hp[0], hp[1], 4.5, 4.5, 10, .1, seed + 10 + i), "#F2C66D", { seed: seed + 10 + i, alpha: .2, layers: 8, spread: .1 }); });
    pencil(ctx, o.body, { seed: seed, color: pen, alpha: .55 });
    (o.rims || []).forEach(function (rm, i) { pencil(ctx, ellipse(rm[0], rm[1], rm[2], rm[3], 26, .02, seed + 20 + i), { seed: seed + 20 + i, color: pen, alpha: .5, passes: 1 }); });
    if (o.ridges) [[72, 150, 128, 150], [80, 156, 120, 156]].forEach(function (l, i) { pencil(ctx, [[l[0], l[1]], [l[2], l[3]]], { seed: seed + 30 + i, closed: false, color: pen, alpha: .35, passes: 1 }); });
  }
  var PRODUCTS = SITE.products || [];
  var byId = {}; PRODUCTS.forEach(function (p, i) {
    p.seed = 300 + i * 17; byId[p.id] = p;
    if (p.option) byId[p.option.id] = { id: p.option.id, name: p.name + " med glasinsats", price: p.price + p.option.price, base: p.id };
  });
  // Presentkort i varukorgen: sparas separat så att de finns kvar efter omladdning
  var symbolEl = document.querySelector(".namestory .symbol");
  var GIFT_IMG = symbolEl ? "data:image/svg+xml," + encodeURIComponent(symbolEl.outerHTML.replace(/<svg ([^>]*)>/, '<svg xmlns="http://www.w3.org/2000/svg" $1><rect x="-10" y="-10" width="120" height="120" fill="#F3EEE6"/>').replace(/currentColor/g, "#2B362E").replace(/var\(--accent\)/g, "#9B5E49")) : "";
  var gifts = {};
  try { gifts = JSON.parse(localStorage.getItem("sd-gifts") || "{}") || {}; } catch (e) { gifts = {}; }
  Object.keys(gifts).forEach(function (id) { byId[id] = gifts[id]; byId[id].img = GIFT_IMG; });
  PRODUCTS.forEach(function (p) { if (p.image) p.img = p.image; });
  var kr = function (n) { return n.toLocaleString("sv-SE") + " kr"; };
  var shelf = $("#shelf");
  shelf.innerHTML = PRODUCTS.map(function (p) {
    var art = p.image ? '<img class="item__photo" src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<canvas width="200" height="175" data-product="' + esc(p.id) + '" role="img" aria-label="Akvarellskiss av ' + esc(p.name) + '"></canvas>';
    return '<article class="item" data-cat="' + esc(p.cat) + '"><div class="item__art">' + art + '</div>' +
      '<div class="tag">' + (p.badge ? '<span class="tag__badge">' + esc(p.badge) + "</span>" : "") +
      '<div class="tag__row"><h3>' + esc(p.name) + '</h3><span class="tag__price">' + kr(p.price) + "</span></div>" +
      "<p>" + esc(p.text) + "</p>" + (p.option && !p.soldOut ? '<button class="toggle tag__opt" type="button" aria-pressed="false" data-opt="' + esc(p.id) + '">' + esc(p.option.label) + ", +" + kr(p.option.price) + "</button>" : "") +
      (p.soldOut ? '<span class="add-btn is-soldout">Slutsåld just nu</span>' : '<button class="add-btn" type="button" data-add="' + esc(p.id) + '">Lägg i korgen</button>') + '</div></article>';
  }).join("");
  function drawProduct(canvas) {
    var p = byId[canvas.dataset.product], ctx = fit(canvas, 200, 175); if (!ctx) return;
    paintProduct(ctx, p);
    if (!p.img) { try { p.img = canvas.toDataURL("image/png"); } catch (e) {} }
  }
  document.querySelectorAll(".tag__opt").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true", p = byId[b.dataset.opt];
      b.setAttribute("aria-pressed", String(on));
      b.closest(".tag").querySelector(".tag__price").textContent = kr(p.price + (on ? p.option.price : 0));
    });
  });
  document.querySelectorAll("[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      shelf.querySelectorAll(".item").forEach(function (el) { el.hidden = !(f === "alla" || el.dataset.cat === f); });
    });
  });

  /* ================= Akvarellstenar bakom text ================= */
  function drawBlob(canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
    var ctx = canvas.getContext("2d"); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, w, h);
    var seed = +canvas.dataset.seed || 1, color = token(canvas.dataset.color) || "#DCE0D2";
    wash(ctx, ellipse(w / 2, h / 2, w * .42, h * .4, 26, .2, seed), color, { seed: seed, alpha: +(canvas.dataset.alpha || .09), layers: 24, spread: .3, edge: .3 });
  }

  /* ================= Måla om vid storlek och tema ================= */
  var painters = [];
  function register(canvas, fn) { painters.push({ c: canvas, fn: fn, w: 0 }); }
  document.querySelectorAll("[data-product]").forEach(function (c) { register(c, drawProduct); });
  document.querySelectorAll("canvas.blob").forEach(function (c) { register(c, drawBlob); });
  register(planCanvas, drawPlan);
  function repaint(force) {
    painters.forEach(function (p) { var w = p.c.clientWidth; if (force || w !== p.w) { p.w = w; p.fn(p.c); } });
    buildHero();
  }
  repaint(true);
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { repaint(false); }, 180); });
  function retheme() { PRODUCTS.forEach(function (p) { p.img = null; }); repaint(true); renderCart(); }
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", retheme); }
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ================= Varukorg ================= */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem("sd-cart") || "{}") || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem("sd-cart", JSON.stringify(cart)); } catch (e) {} }
  function renderCart() {
    var ids = Object.keys(cart).filter(function (id) { return byId[id] && cart[id] > 0; }), count = 0, total = 0;
    ids.forEach(function (id) { count += cart[id]; total += cart[id] * byId[id].price; });
    $("#cartCount").textContent = count; $("#cartTotal").textContent = kr(total);
    $("#cartItems").innerHTML = ids.length ? ids.map(function (id) {
      var p = byId[id];
      return '<li class="cart-item"><div class="cart-item__thumb">' + ((p.img || (p.base && byId[p.base].img)) ? '<img src="' + (p.img || byId[p.base].img) + '" alt="">' : "") + "</div>" +
        '<div><div class="cart-item__name">' + esc(p.name) + '</div><div class="cart-item__meta">' + kr(p.price) + " / st</div>" +
        '<div class="qty"><button type="button" data-dec="' + id + '" aria-label="Ta bort en ' + p.name + '">−</button><span>' + cart[id] + "</span>" +
        '<button type="button" data-inc="' + id + '" aria-label="Lägg till en ' + p.name + '">+</button></div></div>' +
        '<span class="cart-item__price">' + kr(cart[id] * p.price) + "</span></li>";
    }).join("") : '<li class="cart-empty">Korgen är tom. Titta gärna in i ateljén.</li>';
    $("#checkoutBtn").disabled = !ids.length;
  }
  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("is-visible"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-visible"); }, 2200); }
  document.addEventListener("click", function (e) {
    var addB = e.target.closest("[data-add]"), inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (addB) {
      var id = addB.dataset.add, opt = addB.closest(".tag") && addB.closest(".tag").querySelector(".tag__opt[aria-pressed='true']");
      if (opt) id = byId[id].option.id;
      cart[id] = (cart[id] || 0) + 1; save(); renderCart(); toast(byId[id].name + " ligger i korgen");
      var card = addB.closest(".item"); card.classList.add("is-added"); addB.textContent = "Tillagd ✓";
      setTimeout(function () { card.classList.remove("is-added"); addB.textContent = "Lägg i korgen"; }, 1600);
    }
    if (inc) { cart[inc.dataset.inc]++; save(); renderCart(); }
    if (dec) { cart[dec.dataset.dec]--; if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec]; save(); renderCart(); }
  });
  var drawer = $("#drawer"), scrim = $("#scrim");
  function openCart() { renderCart(); drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); scrim.hidden = false; $("#cartClose").focus(); }
  function closeCart() { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); scrim.hidden = true; $("#checkoutNote").hidden = true; $("#cartOpen").focus(); }
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeCart(); });
  $("#checkoutBtn").addEventListener("click", function () {
    var btn = $("#checkoutBtn"), note = $("#checkoutNote"), items = [], giftList = [];
    Object.keys(cart).forEach(function (id) {
      var p = byId[id]; if (!p || cart[id] <= 0) return;
      if (p.gift) giftList.push({ kind: p.giftKind, amountOre: p.price * 100, to: p.to || "", from: p.from || "", message: p.msg || "" });
      else items.push({ id: id, qty: cart[id] });
    });
    btn.disabled = true; note.hidden = true;
    post("/api/checkout", { items: items, gifts: giftList })
      .then(function (r) { window.location.href = r.url; })
      .catch(function (err) { note.hidden = false; note.textContent = err.message; btn.disabled = false; });
  });
  renderCart();

  /* ================= Kurser och öppen ateljé ================= */
  var EVENTS = SITE.events || [];
  var evById = {}; EVENTS.forEach(function (e) { evById[e.id] = e; });
  function dateParts(iso) {
    var d = new Date(iso + "T12:00:00");
    return { day: d.getDate(), wd: d.toLocaleDateString("sv-SE", { weekday: "short" }).replace(".", ""), mon: d.toLocaleDateString("sv-SE", { month: "short" }).replace(".", "") };
  }
  $("#events").innerHTML = EVENTS.map(function (e) {
    var d = dateParts(e.date), open = e.kind === "oppen", full = !open && e.left === 0, side;
    if (open) side = '<span class="event__price">Fri entré</span><span class="event__spots">Ingen anmälan</span>';
    else side = '<span class="event__price">' + kr(e.price) + '</span><span class="event__spots' + (e.left <= 3 ? " is-few" : "") + '">' + (full ? "Fullbokat" : e.left + " av " + e.spots + " platser kvar") + "</span>" +
      '<button class="event__book" type="button" aria-expanded="false" aria-controls="panel-' + e.id + '" data-event="' + e.id + '">' + (full ? "Väntelista" : "Anmäl dig") + "</button>";
    var panel = open ? "" : '<form class="event__panel" id="panel-' + e.id + '" data-event="' + e.id + '" hidden novalidate>' +
      '<div class="field"><label for="ev-' + e.id + '-namn">Namn</label><input id="ev-' + e.id + '-namn" autocomplete="name"></div>' +
      '<div class="field"><label for="ev-' + e.id + '-epost">E-post</label><input id="ev-' + e.id + '-epost" type="email" autocomplete="email"></div>' +
      '<button class="btn" type="submit">' + (full ? "Ställ mig i kö" : "Boka platsen") + '</button><p class="form__done" hidden></p></form>';
    return '<li class="event" data-kind="' + e.kind + '"><div class="event__row"><div class="event__date"><span class="event__day">' + d.day + '</span><span class="event__month">' + d.wd + " " + d.mon + "</span></div>" +
      '<div><span class="event__type">' + esc(e.label) + "</span><h3>" + esc(e.title) + "</h3><p>" + esc(e.text) + '</p><div class="event__meta"><span>' + esc(e.time) + "</span><span>" + esc(e.place) + "</span></div></div>" +
      '<div class="event__side">' + side + "</div></div>" + panel + "</li>";
  }).join("");
  document.querySelectorAll("[data-kind]").forEach(function (chip) {
    if (!chip.classList.contains("chip")) return;
    chip.addEventListener("click", function () {
      var k = chip.dataset.kind;
      document.querySelectorAll(".course-filter .chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      document.querySelectorAll(".event").forEach(function (li) { li.hidden = !(k === "alla" || li.dataset.kind === k); });
    });
  });
  document.querySelectorAll(".event__book").forEach(function (b) {
    b.addEventListener("click", function () {
      var panel = document.getElementById("panel-" + b.dataset.event), open = panel.hidden;
      panel.hidden = !open; b.setAttribute("aria-expanded", String(open));
      if (open) panel.querySelector("input").focus();
    });
  });
  document.querySelectorAll(".event__panel").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var e = evById[f.dataset.event], inputs = f.querySelectorAll("input"), name = inputs[0].value.trim(), mail = inputs[1].value.trim(), done = f.querySelector(".form__done");
      done.hidden = false;
      if (!name || !/^\S+@\S+\.\S+$/.test(mail)) { done.textContent = "Fyll i namn och en giltig e-postadress."; (name ? inputs[1] : inputs[0]).focus(); return; }
      var d = dateParts(e.date), btn = f.querySelector(".btn");
      btn.disabled = true; done.textContent = e.left === 0 ? "Skriver upp dig …" : "Du skickas till betalningen …";
      if (e.left === 0) {
        post("/api/waitlist", { eventId: e.id, name: name, email: mail })
          .then(function () { done.textContent = "Tack " + name.split(" ")[0] + "! Du står på väntelistan till " + e.title.toLowerCase() + " den " + d.day + " " + d.mon + ", och får besked om någon lämnar återbud."; })
          .catch(function (err) { done.textContent = err.message; btn.disabled = false; });
      } else {
        post("/api/checkout", { event: { id: e.id, name: name, email: mail, qty: 1 } })
          .then(function (r) { window.location.href = r.url; })
          .catch(function (err) { done.textContent = err.message; btn.disabled = false; });
      }
    });
  });

  /* ================= Presentkort ================= */
  var firstGift = document.querySelector("#giftTypes .chip");
  var gift = { type: firstGift ? firstGift.dataset.gift : "Valfritt belopp", amount: firstGift && firstGift.dataset.amount !== "valfritt" ? +firstGift.dataset.amount : 500 };
  function giftUpdate() {
    var custom = !$("#giftCustom").hidden;
    if (custom) gift.amount = Math.max(0, Math.round(+$("#gift-amount").value || 0));
    var to = $("#gift-to").value.trim(), from = $("#gift-from").value.trim(), msg = $("#gift-msg").value.trim();
    $("#gcWhat").textContent = gift.type === "Valfritt belopp" ? "Att använda i ateljén" : gift.type;
    $("#gcSum").textContent = kr(gift.amount);
    $("#giftSum").textContent = kr(gift.amount);
    $("#gcTo").textContent = to ? "Till " + to + (from ? " från " + from : "") : "Till dig";
    $("#gcMsg").textContent = msg || $("#gift-msg").placeholder;
  }
  document.querySelectorAll("#giftTypes .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      document.querySelectorAll("#giftTypes .chip").forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
      gift.type = c.dataset.gift;
      var custom = c.dataset.amount === "valfritt";
      $("#giftCustom").hidden = !custom;
      if (!custom) gift.amount = +c.dataset.amount;
      giftUpdate();
    });
  });
  ["#gift-amount", "#gift-to", "#gift-from", "#gift-msg"].forEach(function (s) { $(s).addEventListener("input", giftUpdate); });
  $("#giftAdd").addEventListener("click", function () {
    giftUpdate();
    if (gift.amount < 200) { toast("Välj ett belopp på minst 200 kr"); $("#gift-amount").focus(); return; }
    var to = $("#gift-to").value.trim(), id = "present-" + Date.now();
    var item = { id: id, name: "Presentkort" + (gift.type === "Valfritt belopp" ? "" : " · " + gift.type) + (to ? " till " + to : ""), price: gift.amount, gift: true,
      giftKind: gift.type, to: to, from: $("#gift-from").value.trim(), msg: $("#gift-msg").value.trim() };
    gifts[id] = item;
    try { localStorage.setItem("sd-gifts", JSON.stringify(gifts)); } catch (e) {}
    byId[id] = Object.assign({ img: GIFT_IMG }, item);
    cart[id] = 1; save(); renderCart(); toast("Presentkortet ligger i korgen");
  });
  giftUpdate();

  /* ================= Gratis guide ================= */
  $("#guideNews").addEventListener("click", function () { var b = $("#guideNews"); b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
  $("#guideForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var mail = $("#guide-email").value.trim(), done = $("#guideDone");
    done.hidden = false;
    if (!/^\S+@\S+\.\S+$/.test(mail)) { done.textContent = "Skriv en giltig e-postadress, så skickar jag guiden dit."; $("#guide-email").focus(); return; }
    var news = $("#guideNews").getAttribute("aria-pressed") === "true";
    done.textContent = "Ett ögonblick …";
    post("/api/guide", { email: mail, newsletter: news })
      .then(function (r) {
        done.innerHTML = "Tack! Här är guiden: <a href=\"" + esc(r.url) + "\" target=\"_blank\" rel=\"noopener\">ladda ner 7 saker för ett lugnare barnrum</a>." + (news ? " Du får också nyhetsbrevet några gånger per år." : "");
      })
      .catch(function (err) { done.textContent = err.message; });
  });

  /* ================= Meny ================= */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", function () { var open = nav.classList.toggle("is-open"); menuBtn.setAttribute("aria-expanded", String(open)); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); } });

  /* ================= Kontakt ================= */
  document.querySelectorAll("[data-service]").forEach(function (a) { a.addEventListener("click", function () { $("#f-service").value = a.dataset.service; }); });
  document.querySelectorAll("#painChips .chip").forEach(function (c) {
    c.addEventListener("click", function () { c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true")); });
  });
  $("#contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#f-name"), email = $("#f-email"), done = $("#formDone");
    done.hidden = false;
    if (!name.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      done.textContent = "Fyll i ditt namn och en giltig e-postadress så att jag kan svara dig.";
      (name.value.trim() ? email : name).focus(); return;
    }
    var picked = Array.prototype.map.call(document.querySelectorAll('#painChips [aria-pressed="true"]'), function (c) { return c.textContent; });
    var btn = $("#contactForm .btn"); btn.disabled = true; done.textContent = "Skickar …";
    post("/api/lead", { name: name.value.trim(), email: email.value.trim(), service: $("#f-service").value, pains: picked, message: $("#f-msg").value.trim() })
      .then(function () {
        done.textContent = "Tack " + name.value.trim().split(" ")[0] + "! Jag har fått din förfrågan och hör av mig inom två arbetsdagar." +
          (picked.length ? " Det du skrev om, att " + picked.join(", ").toLowerCase() + ", tar vi med till första samtalet." : "");
        $("#contactForm").reset();
        document.querySelectorAll("#painChips .chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      })
      .catch(function (err) { done.textContent = err.message; })
      .then(function () { btn.disabled = false; });
  });
})();
