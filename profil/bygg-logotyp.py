"""Bygger Studio Dalaruds logotypfiler och tryckoriginal.

Märket "Rundbågen": tre bågar som ett fönster eller en dörröppning, och innerst
en sten av lera. Ordbilden är egenritad med samma linje som bågarna: samma
tjocklek, rundade ändar och former byggda av bågar och raka ben. I u:et, dalen,
vilar samma sten som i märket. Inga typsnitt behövs för logotypen.

All geometri beskrivs en gång som primitiv (streck och fyllda ytor) och skrivs
sedan ut som SVG (webb och skärm) och som vektor-PDF i CMYK (tryck).

Användning:
    pip install reportlab
    python3 bygg-logotyp.py
    node bygg-tryck.js        # PNG i hög upplösning och den grafiska manualen
"""
import math
import re
from pathlib import Path

from reportlab.lib.colors import CMYKColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = Path(__file__).parent
LOGO = HERE / "logotyp"
TYPSNITT = HERE / "typsnitt"

# Profilens färger: hex för skärm, CMYK (0–100) för tryck på bestruket papper.
# CMYK-värdena är omräknade och bör stämmas av mot ett provtryck.
FARGER = {
    "granskog":  ("#2B362E", (62, 45, 58, 62)),
    "lera":      ("#9B5E49", (22, 55, 64, 20)),
    "linne":     ("#F3EEE6", (3, 4, 8, 0)),
    "havre":     ("#E6DCCB", (8, 11, 19, 0)),
    "mossa":     ("#6F7D62", (45, 30, 52, 30)),
    "lera-ljus": ("#D49C82", (12, 40, 48, 4)),
    "granskog-ton": ("#3A4540", (54, 40, 51, 54)),  # bågarna på visitkortets baksida
    "svart":     ("#000000", (0, 0, 0, 100)),
    "vit":       ("#FFFFFF", (0, 0, 0, 0)),
}
# Logotypens varianter: (linjefärg, stenens färg)
VARIANTER = {
    "farg": ("granskog", "lera"),         # på ljus botten
    "negativ": ("linne", "lera-ljus"),    # på granskog eller annan mörk botten
    "svart": ("svart", "svart"),          # enfärgstryck, stämpel, gravyr
    "vit": ("vit", "vit"),                # på foto och färgade ytor
}

# ---------------------------------------------------------------- geometri
# Märket i en ruta på 100 x 100
BAGAR = (42, 31, 20)   # bågarnas radier, utifrån och in
MITT = 52              # höjd där bågarna övergår i raka sidor
BOTTEN = 94            # bågarnas fötter, också ordbildens baslinje
LINJE = 3.4
STEN = "M-9.8 .6c-.4-5 4.3-8.4 10.1-8.5 6-.1 10.2 3.1 10 7.9-.2 4.9-4.6 7.9-10.2 7.9-5.4 0-9.6-2.6-9.9-7.3Z"  # runt (0, 0)

# Ordbilden "Dalarud": baslinje y=0, x-höjd 36, uppstaplar 56.
# Varje bokstav är (bana, bredd). Bågarna i bokstäverna har samma form som i märket.
NAMN = {
    "D": ("M0 0V-56H6A28 28 0 0 1 6 0Z", 34),                                # en båge på sidan
    "a": ("M36 -18A18 18 0 1 0 0 -18A18 18 0 1 0 36 -18M36 -36V0", 36),
    "l": ("M0 -56V0", 0),
    "r": ("M0 0V-18A18 18 0 0 1 18 -36", 18),                                # en halv båge
    "u": ("M0 -36V-18A18 18 0 0 0 36 -18M36 -36V0", 36),                     # en båge upp och ner: dalen
    "d": ("M36 -18A18 18 0 1 0 0 -18A18 18 0 1 0 36 -18M36 -56V0", 36),
}
NAMN_LUFT = {("D", "a"): 10, ("a", "l"): 11, ("l", "a"): 10, ("a", "r"): 11, ("r", "u"): 12, ("u", "d"): 10}

# STUDIO: versaler med höjd 10, samma rundade linje.
STUDIO = {
    "S": ("M6.11 -8.56A3.1 2.5 0 1 0 3.3 -5A3.1 2.5 0 1 1 .49 -1.44", 6.6),
    "T": ("M0 -10H7M3.5 -10V0", 7),
    "U": ("M0 -10V-3.5A3.5 3.5 0 0 0 7 -3.5V-10", 7),
    "D": ("M0 0V-10H2A5 5 0 0 1 2 0Z", 7),
    "I": ("M0 -10V0", 0),
    "O": ("M5 -10A5 5 0 1 0 5 0A5 5 0 1 0 5 -10", 10),
}


def matrix(a=1, b=0, c=0, d=1, e=0, f=0):
    return (a, b, c, d, e, f)


def mul(m, n):
    """m efter n (som SVG: transform="m n")."""
    a, b, c, d, e, f = m
    A, B, C, D, E, F = n
    return (a * A + c * B, b * A + d * B, a * C + c * D, b * C + d * D, a * E + c * F + e, b * E + d * F + f)


def translate(x, y):
    return matrix(e=x, f=y)


def scale(s):
    return matrix(a=s, d=s)


# En primitiv: ("stroke", bana, linjebredd i slutlig skala, matris, färgroll) eller ("fill", bana, None, matris, färgroll)
def mark(m=matrix()):
    prims = [("stroke", f"M{50 - r} {BOTTEN}V{MITT}A{r} {r} 0 0 1 {50 + r} {MITT}V{BOTTEN}", LINJE, m, "ink") for r in BAGAR]
    prims.append(("fill", STEN, None, mul(m, mul(translate(50, 86), scale(.62))), "clay"))
    return prims


def word(glyphs, text, m, stroke, spacing, extra=None):
    prims, cur, prev = [], 0.0, None
    for ch in text:
        d, w = glyphs[ch]
        if prev is not None:
            cur += spacing(prev, ch)
        prims.append(("stroke", d, stroke, mul(m, translate(cur, 0)), "ink"))
        if extra:
            prims += extra(ch, cur, m)
        cur += w
        prev = ch
    return prims, cur


def namn(x, y, s):
    # u:et är en dal, och i botten vilar samma sten som i märket
    def sten_i_u(ch, cx, m):
        return [("fill", STEN, None, mul(m, mul(translate(cx + 18, -8.2), scale(.56))), "clay")] if ch == "u" else []
    prims, w = word(NAMN, "Dalarud", mul(translate(x, y), scale(s)), LINJE, lambda a, b: NAMN_LUFT[(a, b)], sten_i_u)
    return prims, w * s


def studio(x, y, s=1):
    prims, w = word(STUDIO, "STUDIO", mul(translate(x, y), scale(s)), LINJE * .5, lambda a, b: 7.5)
    return prims, w * s


def liggande():
    # Ordet står på samma baslinje som bågarnas fötter; STUDIO ovanför, kant i kant med D:ets stam.
    name, wn = namn(124, BOTTEN, 1)
    top, _ = studio(124, BOTTEN - 56 - 12)
    return mark() + name + top, (124 + wn + 6, 100)


def staende():
    _, wn = namn(0, 0, .8)
    _, ws = studio(0, 0)
    W = max(wn, 100) + 16
    name, _ = namn((W - wn) / 2, 152, .8)
    top, _ = studio((W - ws) / 2, 172)
    return mark(translate((W - 100) / 2, 0)) + name + top, (W, 178)


def symbol():
    return mark(), (100, 100)


LAYOUTER = {"logotyp": liggande, "logotyp-staende": staende, "symbol": symbol}

# ---------------------------------------------------------------- SVG


def fmt(v):
    return f"{v:.3f}".rstrip("0").rstrip(".")


def to_svg(prims, size, colors):
    w, h = size
    out = []
    for kind, d, width, m, role in prims:
        t = f' transform="matrix({" ".join(fmt(v) for v in m)})"'
        if kind == "stroke":
            sw = width / math.sqrt(abs(m[0] * m[3] - m[1] * m[2]))
            out.append(f'<path{t} d="{d}" fill="none" stroke="{colors[role]}" stroke-width="{fmt(sw)}" '
                       f'stroke-linecap="round" stroke-linejoin="round"/>')
        else:
            out.append(f'<path{t} d="{d}" fill="{colors[role]}"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}">{"".join(out)}</svg>\n'


# ---------------------------------------------------------------- PDF


def parse_path(d):
    """Tolkar de SVG-kommandon logotypen använder till absoluta M/L/C/Z-segment."""
    tokens = re.findall(r"[MmLlHhVvCcAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?", d)
    segs, i, cmd = [], 0, None
    x = y = sx = sy = 0.0

    def num():
        nonlocal i
        i += 1
        return float(tokens[i - 1])

    while i < len(tokens):
        if tokens[i].isalpha():
            cmd = tokens[i]
            i += 1
        rel = cmd.islower()
        c = cmd.upper()
        if c == "Z":
            segs.append(("Z",))
            x, y = sx, sy
            continue
        if c == "M":
            nx, ny = num(), num()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            sx, sy = x, y
            segs.append(("M", x, y))
            cmd = "l" if rel else "L"
        elif c in "LHV":
            if c == "L":
                nx, ny = num(), num()
                x, y = (x + nx, y + ny) if rel else (nx, ny)
            elif c == "H":
                n = num()
                x = x + n if rel else n
            else:
                n = num()
                y = y + n if rel else n
            segs.append(("L", x, y))
        elif c == "C":
            p = [num() for _ in range(6)]
            if rel:
                p = [p[k] + (x if k % 2 == 0 else y) for k in range(6)]
            segs.append(("C", *p))
            x, y = p[4], p[5]
        elif c == "A":
            rx, ry, phi, fa, fs, nx, ny = (num() for _ in range(7))
            if rel:
                nx, ny = x + nx, y + ny
            segs += arc_to_beziers(x, y, rx, ry, math.radians(phi), int(fa), int(fs), nx, ny)
            x, y = nx, ny
    return segs


def arc_to_beziers(x1, y1, rx, ry, phi, fa, fs, x2, y2):
    cp, sp = math.cos(phi), math.sin(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p, y1p = cp * dx + sp * dy, -sp * dx + cp * dy
    rx, ry = abs(rx), abs(ry)
    lam = x1p ** 2 / rx ** 2 + y1p ** 2 / ry ** 2
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p
    den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    co = math.sqrt(max(0, num / den)) * (-1 if fa == fs else 1)
    cxp, cyp = co * rx * y1p / ry, -co * ry * x1p / rx
    cx, cy = cp * cxp - sp * cyp + (x1 + x2) / 2, sp * cxp + cp * cyp + (y1 + y2) / 2

    def ang(ux, uy, vx, vy):
        return math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)

    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0:
        dt -= 2 * math.pi
    elif fs and dt < 0:
        dt += 2 * math.pi
    n = max(1, math.ceil(abs(dt) / (math.pi / 2)))
    d = dt / n
    k = 4 / 3 * math.tan(d / 4)

    def pt(a):
        return (cx + rx * math.cos(a) * cp - ry * math.sin(a) * sp, cy + rx * math.cos(a) * sp + ry * math.sin(a) * cp)

    def der(a):
        return (-rx * math.sin(a) * cp - ry * math.cos(a) * sp, -rx * math.sin(a) * sp + ry * math.cos(a) * cp)

    segs = []
    for j in range(n):
        a1, a2 = t1 + j * d, t1 + (j + 1) * d
        p1, p2, e1, e2 = pt(a1), pt(a2), der(a1), der(a2)
        segs.append(("C", p1[0] + k * e1[0], p1[1] + k * e1[1], p2[0] - k * e2[0], p2[1] - k * e2[1], p2[0], p2[1]))
    return segs


def cmyk(name):
    c, m, y, k = FARGER[name][1]
    return CMYKColor(c / 100, m / 100, y / 100, k / 100)


def draw_prims(c, prims, roles):
    """Ritar primitiv på en reportlab-canvas vars koordinatsystem redan är SVG-orienterat."""
    for kind, d, width, m, role in prims:
        c.saveState()
        c.transform(*m)
        p = c.beginPath()
        for s in parse_path(d):
            if s[0] == "M":
                p.moveTo(s[1], s[2])
            elif s[0] == "L":
                p.lineTo(s[1], s[2])
            elif s[0] == "C":
                p.curveTo(*s[1:])
            else:
                p.close()
        col = cmyk(roles[role])
        if kind == "stroke":
            c.setStrokeColor(col)
            c.setLineWidth(width / math.sqrt(abs(m[0] * m[3] - m[1] * m[2])))
            c.setLineCap(1)
            c.setLineJoin(1)
            c.drawPath(p, stroke=1, fill=0)
        else:
            c.setFillColor(col)
            c.drawPath(p, stroke=0, fill=1)
        c.restoreState()


def place(c, prims, size, x, y, width, roles):
    """Placerar en logotyp med övre vänstra hörnet i (x, y) mm från sidans nederkant, given bredd i mm."""
    k = width * mm / size[0]
    c.saveState()
    c.transform(k, 0, 0, -k, x * mm, y * mm)
    draw_prims(c, prims, roles)
    c.restoreState()
    return size[1] * k / mm


def logo_pdf(path, prims, size, width_mm, roles, title):
    w, h = width_mm * mm, width_mm * mm * size[1] / size[0]
    c = canvas.Canvas(str(path), pagesize=(w, h))
    c.setTitle(title)
    c.setAuthor("Studio Dalarud")
    place(c, prims, size, 0, h / mm, width_mm, roles)
    c.showPage()
    c.save()


# ---------------------------------------------------------------- visitkort


def visitkort(path):
    for name, f in (("Instrument", "InstrumentSerif-Regular"), ("Hanken", "HankenGrotesk-Regular"), ("HankenMedium", "HankenGrotesk-Medium")):
        pdfmetrics.registerFont(TTFont(name, str(TYPSNITT / f"{f}.ttf")))
    TW, TH, B = 85, 55, 3  # mm, utfall 3 mm
    c = canvas.Canvas(str(path), pagesize=((TW + 2 * B) * mm, (TH + 2 * B) * mm))
    c.setTitle("Studio Dalarud – visitkort")
    c.setAuthor("Studio Dalarud")

    def boxes():
        c.setCropBox((0, 0, (TW + 2 * B) * mm, (TH + 2 * B) * mm))
        c.setBleedBox((0, 0, (TW + 2 * B) * mm, (TH + 2 * B) * mm))
        c.setTrimBox((B * mm, B * mm, (TW + B) * mm, (TH + B) * mm))

    # Framsida: linne, stående logotyp i mitten
    boxes()
    c.setFillColor(cmyk("linne"))
    c.rect(0, 0, (TW + 2 * B) * mm, (TH + 2 * B) * mm, stroke=0, fill=1)
    prims, size = staende()
    lw = 30
    lh = lw * size[1] / size[0]
    place(c, prims, size, B + (TW - lw) / 2, B + TH / 2 + lh / 2, lw, {"ink": "granskog", "clay": "lera"})
    c.showPage()

    # Baksida: granskog, kontaktuppgifter, en stor båge som går ut över kanten
    boxes()
    c.setFillColor(cmyk("granskog"))
    c.rect(0, 0, (TW + 2 * B) * mm, (TH + 2 * B) * mm, stroke=0, fill=1)
    arcs = mark()[:3]
    c.saveState()
    k = 70 * mm / 100
    c.transform(k, 0, 0, -k, (B + 52) * mm, (B + TH + 24) * mm)
    draw_prims(c, arcs, {"ink": "granskog-ton"})
    c.restoreState()
    x0 = (B + 7) * mm
    c.setFillColor(cmyk("linne"))
    c.setFont("Instrument", 15)
    c.drawString(x0, (B + 38) * mm, "Sofia Dalarud")
    c.setFont("HankenMedium", 6.2)
    c.drawString(x0, (B + 33) * mm, "Inredningsstylist & homestagingkonsult", charSpace=.2)
    c.setFillColor(cmyk("lera-ljus"))
    c.drawString(x0, (B + 29.6) * mm, "INREDNING · HOMESTAGING · LERA", charSpace=.9)
    c.setFillColor(cmyk("linne"))
    c.setFont("Hanken", 7)
    for i, line in enumerate(("070-000 00 00", "hej@studiodalarud.se", "studiodalarud.se  ·  @studiodalarud")):
        c.drawString(x0, (B + 17 - i * 4) * mm, line)
    c.showPage()
    c.save()


# ---------------------------------------------------------------- main


def main():
    for sub in ("svg", "pdf"):
        (LOGO / sub).mkdir(parents=True, exist_ok=True)
    (HERE / "webb").mkdir(exist_ok=True)
    hexes = {k: v[0] for k, v in FARGER.items()}
    bredd = {"logotyp": 180, "logotyp-staende": 120, "symbol": 100}  # mm i PDF:en, fritt skalbar
    for layout, fn in LAYOUTER.items():
        prims, size = fn()
        for var, (ink, clay) in VARIANTER.items():
            roles = {"ink": ink, "clay": clay}
            name = f"dalarud-{layout}-{var}"
            (LOGO / "svg" / f"{name}.svg").write_text(to_svg(prims, size, {r: hexes[c] for r, c in roles.items()}), encoding="utf-8")
            logo_pdf(LOGO / "pdf" / f"{name}.pdf", prims, size, bredd[layout], roles, f"Studio Dalarud – {layout} ({var})")
    # Webbversioner: färger från sidans tokens
    prims, size = liggande()
    (HERE / "webb" / "logotyp-webb.svg").write_text(to_svg(prims, size, {"ink": "currentColor", "clay": "var(--accent)"}), encoding="utf-8")
    prims, size = symbol()
    (HERE / "webb" / "symbol-webb.svg").write_text(to_svg(prims, size, {"ink": "currentColor", "clay": "var(--accent)"}), encoding="utf-8")
    visitkort(HERE / "visitkort-tryck.pdf")
    print("klart")


if __name__ == "__main__":
    main()
