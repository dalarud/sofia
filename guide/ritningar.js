// Akvarellskisser till guiden. Körs efter penseln från hemsidan (wash, pencil, ellipse, rect, profile),
// som bygg-guide.js lägger in före den här filen.
(function () {
  var C = { mossa: "#7E8B6F", mossaLjus: "#DCE0D2", lera: "#A9705A", havre: "#D2C2A6", strand: "#C4AF90", kvall: "#8F7F92", sten: "#9A968C", ljus: "#F2C66D", ek: "#B48D66", papper: "#FBF8F3" };
  var PEN = "#3A3A34";

  function setup(canvas, W) { var ctx = canvas.getContext("2d"), k = canvas.width / W; ctx.setTransform(k, 0, 0, k, 0, 0); return ctx; }
  function line(ctx, pts, o) { o = o || {}; pencil(ctx, pts, Object.assign({ closed: false, color: PEN, alpha: .55, passes: 2 }, o)); }
  function shape(ctx, poly, color, seed, o) {
    o = o || {};
    wash(ctx, poly, color, Object.assign({ seed: seed, alpha: .07, layers: 18, spread: .2 }, o.wash || {}));
    if (o.pencil !== false) pencil(ctx, poly, { seed: seed, color: PEN, alpha: .5 });
  }
  function glow(ctx, x, y, rx, ry, seed) { wash(ctx, ellipse(x, y, rx, ry, 24, .15, seed), C.ljus, { seed: seed, alpha: .022, layers: 14, spread: .3, edge: 0 }); }
  function label(ctx, text, x, y, size) {
    ctx.save(); ctx.fillStyle = PEN; ctx.globalAlpha = .7; ctx.font = (size || 20) + "px Caveat, cursive"; ctx.textAlign = "center"; ctx.fillText(text, x, y); ctx.restore();
  }
  function floor(ctx, y, seed) { line(ctx, [[20, y], [580, y]], { seed: seed, alpha: .3, passes: 1 }); }

  var ART = {
    omslag: function (ctx) {
      wash(ctx, ellipse(600, 540, 500, 400, 30, .2, 3), C.mossaLjus, { seed: 3, alpha: .1, layers: 26, spread: .3, edge: .2 });
      var s = ellipse(960, 900, 70, 42, 22, .1, 5);
      wash(ctx, s, C.lera, { seed: 5, alpha: .07, layers: 22, spread: .2, edge: .45 });
      pencil(ctx, s, { seed: 5, color: PEN, alpha: .35, width: 2 });
    },

    plan: function (ctx) {
      var names = ["överblick", "sinnesro", "flöde", "återhämtning"], cols = [C.havre, C.mossa, C.strand, C.lera];
      names.forEach(function (n, i) {
        var x = 85 + i * 143, s = ellipse(x, 140, 56 - i * 3, 32 + (i % 2) * 4, 22, .12, 40 + i);
        wash(ctx, s, cols[i], { seed: 40 + i, alpha: .07, layers: 22, spread: .2, edge: .45 });
        pencil(ctx, s, { seed: 40 + i, color: PEN, alpha: .45 });
        label(ctx, n, x, 220, 24);
      });
      floor(ctx, 178, 9);
    },

    ljus: function (ctx) {
      glow(ctx, 100, 140, 80, 80, 1); glow(ctx, 290, 160, 70, 55, 2); glow(ctx, 485, 85, 75, 40, 3);
      floor(ctx, 250, 4);
      // golvlampa
      line(ctx, [[100, 248], [100, 95]], { seed: 5, width: 1.6 });
      shape(ctx, ellipse(100, 248, 22, 5, 16, 0, 6), C.ek, 6);
      shape(ctx, [[70, 95], [130, 95], [118, 55], [82, 55]], C.havre, 7);
      // bordslampa
      shape(ctx, rect(220, 180, 140, 8), C.ek, 8);
      line(ctx, [[232, 188], [232, 248]], { seed: 9 }); line(ctx, [[348, 188], [348, 248]], { seed: 10 });
      line(ctx, [[290, 176], [290, 140]], { seed: 11 });
      shape(ctx, ellipse(290, 177, 14, 4, 14, 0, 12), C.sten, 12);
      shape(ctx, [[265, 140], [315, 140], [305, 112], [275, 112]], C.strand, 13);
      // fönster med ljusslinga
      pencil(ctx, rect(420, 40, 130, 150), { seed: 14, color: PEN, alpha: .5 });
      line(ctx, [[485, 40], [485, 190]], { seed: 15, alpha: .4, passes: 1 }); line(ctx, [[420, 115], [550, 115]], { seed: 16, alpha: .4, passes: 1 });
      var sl = [[425, 60], [445, 75], [465, 70], [485, 80], [505, 72], [525, 82], [545, 68]];
      line(ctx, sl, { seed: 17, alpha: .45, passes: 1 });
      sl.forEach(function (p, i) { wash(ctx, ellipse(p[0], p[1] + 4, 4, 4, 10, .1, 20 + i), C.ljus, { seed: 20 + i, alpha: .25, layers: 8, spread: .1 }); });
      label(ctx, "golv", 100, 274); label(ctx, "bord", 290, 274); label(ctx, "fönster", 485, 214);
    },

    lador: function (ctx) {
      var fr = rect(150, 30, 300, 220);
      wash(ctx, fr, C.ek, { seed: 1, alpha: .035, layers: 14, spread: .15 });
      pencil(ctx, fr, { seed: 1, color: PEN, alpha: .55, width: 1.4 });
      line(ctx, [[250, 30], [250, 250]], { seed: 2 }); line(ctx, [[350, 30], [350, 250]], { seed: 3 }); line(ctx, [[150, 140], [450, 140]], { seed: 4 });
      var cols = [C.havre, C.mossa, C.strand, C.lera, C.sten, C.havre];
      [[150, 30], [250, 30], [350, 30], [150, 140], [250, 140], [350, 140]].forEach(function (c, i) {
        var x = c[0], y = c[1];
        shape(ctx, rect(x + 12, y + 32, 76, 70), cols[i], 10 + i);
        var lab = rect(x + 30, y + 46, 40, 30);
        wash(ctx, lab, C.papper, { seed: 30 + i, alpha: .3, layers: 8, spread: .1, edge: 0 });
        pencil(ctx, lab, { seed: 30 + i, color: PEN, alpha: .4, passes: 1 });
        var cx = x + 50, cy = y + 61, s = 50 + i;
        if (i === 0) pencil(ctx, ellipse(cx, cy, 8, 8, 14, 0, s), { seed: s, color: PEN, alpha: .6 });
        if (i === 1) { pencil(ctx, rect(cx - 11, cy - 7, 22, 9), { seed: s, color: PEN, alpha: .6 }); pencil(ctx, ellipse(cx - 6, cy + 4, 3, 3, 8, 0, s), { seed: s + 1, color: PEN, alpha: .6, passes: 1 }); pencil(ctx, ellipse(cx + 6, cy + 4, 3, 3, 8, 0, s), { seed: s + 2, color: PEN, alpha: .6, passes: 1 }); }
        if (i === 2) { pencil(ctx, rect(cx - 9, cy - 8, 18, 15), { seed: s, color: PEN, alpha: .6 }); line(ctx, [[cx, cy - 8], [cx, cy + 7]], { seed: s + 1, passes: 1 }); }
        if (i === 3) pencil(ctx, rect(cx - 7, cy - 7, 14, 14), { seed: s, color: PEN, alpha: .6 });
        if (i === 4) { pencil(ctx, ellipse(cx, cy + 2, 8, 7, 14, 0, s), { seed: s, color: PEN, alpha: .6 }); pencil(ctx, ellipse(cx - 7, cy - 6, 3, 3, 8, 0, s), { seed: s + 1, color: PEN, alpha: .6, passes: 1 }); pencil(ctx, ellipse(cx + 7, cy - 6, 3, 3, 8, 0, s), { seed: s + 2, color: PEN, alpha: .6, passes: 1 }); }
        if (i === 5) line(ctx, [[cx - 9, cy + 7], [cx + 9, cy - 7]], { seed: s, width: 2 });
      });
      floor(ctx, 250, 70);
    },

    farre: function (ctx) {
      // före: full hylla
      var a = rect(40, 50, 220, 190); pencil(ctx, a, { seed: 1, color: PEN, alpha: .55 });
      line(ctx, [[40, 115], [260, 115]], { seed: 2 }); line(ctx, [[40, 180], [260, 180]], { seed: 3 });
      var mix = [C.lera, C.mossa, C.kvall, C.strand, C.sten, C.ljus, C.havre];
      for (var r = 0; r < 3; r++) for (var i = 0; i < 9; i++) {
        var x = 48 + i * 23, base = [115, 180, 240][r], h = 18 + ((i * 7 + r * 5) % 4) * 9, w = 12 + (i % 3) * 3;
        var poly = (i + r) % 3 === 0 ? ellipse(x + w / 2, base - h / 2, w / 2 + 2, h / 2, 12, .1, 100 + r * 10 + i) : rect(x, base - h, w, h);
        wash(ctx, poly, mix[(i + r * 2) % mix.length], { seed: 100 + r * 10 + i, alpha: .1, layers: 8, spread: .1, edge: .3 });
      }
      // efter: lugn hylla
      var b = rect(340, 50, 220, 190); pencil(ctx, b, { seed: 4, color: PEN, alpha: .55 });
      line(ctx, [[340, 115], [560, 115]], { seed: 5 }); line(ctx, [[340, 180], [560, 180]], { seed: 6 });
      shape(ctx, profile(400, [[70, 6], [80, 7], [95, 14], [108, 14], [115, 9]]), C.strand, 7);
      shape(ctx, rect(470, 100, 40, 14), C.mossa, 8);
      shape(ctx, rect(360, 130, 80, 48), C.havre, 9); line(ctx, [[356, 132], [444, 132]], { seed: 10, width: 1.6 });
      shape(ctx, rect(460, 130, 80, 48), C.havre, 11); line(ctx, [[456, 132], [544, 132]], { seed: 12, width: 1.6 });
      shape(ctx, ellipse(450, 222, 26, 16, 16, .1, 13), C.lera, 13);
      label(ctx, "före", 150, 270, 24); label(ctx, "efter", 450, 270, 24);
    },

    vila: function (ctx) {
      floor(ctx, 250, 1);
      glow(ctx, 300, 200, 60, 45, 2);
      shape(ctx, [[200, 250], [300, 60], [400, 250]], C.mossa, 3);
      shape(ctx, [[270, 250], [300, 150], [330, 250]], "#5F6E59", 4, { wash: { alpha: .09 } });
      shape(ctx, ellipse(300, 230, 10, 8, 12, .1, 5), C.ljus, 5, { wash: { alpha: .25 } });
      shape(ctx, ellipse(240, 244, 34, 11, 18, .1, 6), C.lera, 6);
      shape(ctx, ellipse(362, 245, 30, 10, 18, .1, 7), C.strand, 7);
      line(ctx, [[300, 60], [300, 40]], { seed: 8 });
      shape(ctx, [[300, 40], [328, 48], [300, 56]], C.lera, 9);
      shape(ctx, ellipse(470, 242, 18, 10, 16, .12, 10), C.sten, 10);
      label(ctx, "koja", 150, 160, 26); label(ctx, "handsten", 480, 214);
      line(ctx, [[165, 168], [215, 190]], { seed: 11, alpha: .35, passes: 1 });
    },

    zoner: function (ctx) {
      var room = rect(60, 25, 480, 235); pencil(ctx, room, { seed: 1, color: PEN, alpha: .7, width: 2.2, passes: 3 });
      wash(ctx, ellipse(130, 140, 80, 100, 20, .15, 2), C.mossaLjus, { seed: 2, alpha: .05, layers: 14, spread: .3, edge: 0 });
      shape(ctx, rect(85, 45, 90, 170), C.havre, 3);
      shape(ctx, rect(95, 55, 70, 30), C.papper, 4, { wash: { alpha: .2 } });
      shape(ctx, ellipse(315, 140, 95, 62, 26, .1, 5), C.lera, 5, { wash: { alpha: .06 } });
      shape(ctx, rect(430, 185, 90, 55), C.ek, 6);
      shape(ctx, ellipse(475, 168, 15, 13, 14, .1, 7), C.sten, 7);
      label(ctx, "sova", 130, 248, 24); label(ctx, "leka", 315, 146, 26); label(ctx, "rita", 475, 140, 24);
    },

    ljud: function (ctx) {
      floor(ctx, 250, 1);
      pencil(ctx, rect(230, 30, 140, 130), { seed: 2, color: PEN, alpha: .45 });
      shape(ctx, [[205, 22], [255, 22], [250, 250], [196, 250]], C.strand, 3);
      shape(ctx, [[345, 22], [395, 22], [404, 250], [350, 250]], C.strand, 4);
      [218, 232, 244].forEach(function (x, i) { line(ctx, [[x, 26], [x - 2, 120], [x - 4, 246]], { seed: 5 + i, alpha: .3, passes: 1 }); });
      [360, 372, 386].forEach(function (x, i) { line(ctx, [[x, 26], [x + 2, 120], [x + 4, 246]], { seed: 9 + i, alpha: .3, passes: 1 }); });
      line(ctx, [[195, 22], [405, 22]], { seed: 13, width: 2 });
      shape(ctx, ellipse(300, 252, 175, 16, 26, .05, 14), C.mossa, 14);
      [0, 1, 2].forEach(function (i) {
        var r = 18 + i * 16, pts = [];
        for (var a = -50; a <= 50; a += 10) { var t = a * Math.PI / 180; pts.push([90 + Math.cos(t) * r, 130 + Math.sin(t) * r]); }
        line(ctx, pts, { seed: 20 + i, alpha: .5 - i * .14, passes: 1 });
      });
      label(ctx, "mjukt dämpar", 110, 210, 22);
    },

    kvall: function (ctx) {
      line(ctx, [[30, 50], [170, 62], [300, 66], [430, 62], [570, 50]], { seed: 1, alpha: .5, width: 1.2 });
      var names = ["pyjamas", "tänder", "saga", "släcka"];
      names.forEach(function (n, i) {
        var x = 55 + i * 130, y = 80, card = rect(x, y, 100, 115);
        wash(ctx, card, C.papper, { seed: 10 + i, alpha: .35, layers: 8, spread: .08, edge: .15 });
        pencil(ctx, card, { seed: 10 + i, color: PEN, alpha: .45 });
        shape(ctx, rect(x + 44, y - 18, 12, 26), C.ek, 20 + i, { wash: { alpha: .1 } });
        var cx = x + 50, cy = y + 58, s = 30 + i * 5;
        if (i === 0) shape(ctx, [[cx - 22, cy - 18], [cx - 8, cy - 24], [cx + 8, cy - 24], [cx + 22, cy - 18], [cx + 28, cy - 4], [cx + 16, cy - 2], [cx + 16, cy + 26], [cx - 16, cy + 26], [cx - 16, cy - 2], [cx - 28, cy - 4]], C.mossa, s);
        if (i === 1) { line(ctx, [[cx - 24, cy + 18], [cx + 18, cy - 14]], { seed: s, width: 3 }); shape(ctx, rect(cx + 10, cy - 26, 16, 10), C.strand, s + 1); }
        if (i === 2) { shape(ctx, [[cx, cy - 16], [cx - 30, cy - 20], [cx - 30, cy + 18], [cx, cy + 22]], C.lera, s); shape(ctx, [[cx, cy - 16], [cx + 30, cy - 20], [cx + 30, cy + 18], [cx, cy + 22]], C.havre, s + 1); }
        if (i === 3) {
          var moon = [];
          for (var a = -110; a <= 110; a += 10) { var t = a * Math.PI / 180; moon.push([cx + Math.cos(t) * 24, cy + Math.sin(t) * 24]); }
          for (var b = 80; b >= -80; b -= 10) { var u = b * Math.PI / 180; moon.push([cx + 10 + Math.cos(u) * 18, cy + Math.sin(u) * 20]); }
          shape(ctx, moon, C.ljus, s, { wash: { alpha: .12 } });
        }
        label(ctx, n, cx, y + 145, 22);
      });
    }
  };

  document.querySelectorAll("canvas[data-art]").forEach(function (c) {
    var key = c.dataset.art, W = key === "omslag" ? 1200 : 600;
    if (c.height === 500) { var ctx0 = c.getContext("2d"), k0 = c.width / 600; ctx0.setTransform(k0, 0, 0, k0, 0, -15 * k0); ART[key](ctx0); return; }
    ART[key](setup(c, W));
  });
  window.__klar = true;
})();
