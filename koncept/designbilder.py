# Teckningarna till koncept/designkoncept.html. Anropas från bygg-sidor.py.
# Allt ritas som SVG: barnens linjer får en liten darrning, stenarna får en ljus åder.
import math
import random

# Landskapen: fem färger var.
SKOGEN = {"Mossa": "#6E7B52", "Gran": "#4B3A2B", "Lingon": "#A63D32", "Kantarell": "#D49A3A", "Lav": "#C8CCB4"}
SJON = {"Vättern": "#5D7889", "Sand": "#D8C6A6", "Vass": "#A3A06B", "Sten": "#8B8983", "Skum": "#ECE8DF"}
BERGET = {"Järn": "#4A3F3B", "Ljung": "#8D6E86", "Granit": "#A29B94", "Ockra": "#BF8A3F", "Snö": "#F0EDE7"}
ANGEN = {"Smörblomma": "#E6C766", "Klöver": "#D69B98", "Havre": "#E2D5BB", "Gräs": "#8E9F66", "Himmel": "#A8BECB"}
THEMES = [("Skogen", SKOGEN), ("Sjön", SJON), ("Berget", BERGET), ("Ängen", ANGEN)]

LERA, LERA_SIDA, EK, LIN = "#E4D6C3", "#C9B79E", "#C49A6C", "#EFE8DC"
_uid = [0]


def uid(p="s"):
    _uid[0] += 1
    return f"{p}{_uid[0]}"


def wobble(points, seed=1, amp=1.4, step=4.0, closed=False):
    """En linje genom punkterna, med en mjuk darrning som i ett barns kritstreck."""
    rnd = random.Random(seed)
    pts = []
    pairs = list(zip(points, points[1:] + ([points[0]] if closed else [])))
    for (x1, y1), (x2, y2) in pairs:
        n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
        pts += [(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n) for i in range(n)]
    pts.append(points[0] if closed else points[-1])
    ph = [rnd.uniform(0, 6.3) for _ in range(3)]
    fr = [rnd.uniform(.03, .05), rnd.uniform(.08, .12), rnd.uniform(.2, .3)]
    out, s = [], 0.0
    for i, (x, y) in enumerate(pts):
        if i:
            s += math.hypot(x - pts[i - 1][0], y - pts[i - 1][1])
        a, b = pts[max(i - 1, 0)], pts[min(i + 1, len(pts) - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        off = amp * (.6 * math.sin(s * fr[0] + ph[0]) + .3 * math.sin(s * fr[1] + ph[1]) + .1 * math.sin(s * fr[2] + ph[2]))
        out.append((x - dy / L * off, y + dx / L * off))
    d = f"M{out[0][0]:.1f} {out[0][1]:.1f}"
    for i in range(1, len(out) - 1):
        mx, my = (out[i][0] + out[i + 1][0]) / 2, (out[i][1] + out[i + 1][1]) / 2
        d += f" Q{out[i][0]:.1f} {out[i][1]:.1f} {mx:.1f} {my:.1f}"
    return d + f" L{out[-1][0]:.1f} {out[-1][1]:.1f}"


def line(points, color, w=3.0, seed=1, amp=1.4, closed=False):
    return f'<path d="{wobble(points, seed, amp, closed=closed)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def circle_pts(cx, cy, r, n=28, start=0.0, sweep=2 * math.pi, ry=None):
    ry = ry or r
    return [(cx + r * math.cos(start + sweep * i / n), cy + ry * math.sin(start + sweep * i / n)) for i in range(n + 1)]


def stone_d(x, y, rx, ry):
    return (f"M{x - rx:.1f} {y:.1f} C{x - rx:.1f} {y - ry * 1.1:.1f} {x + rx * .9:.1f} {y - ry * 1.25:.1f} {x + rx:.1f} {y - ry * .1:.1f} "
            f"C{x + rx * 1.05:.1f} {y + ry * .9:.1f} {x - rx * .8:.1f} {y + ry * 1.05:.1f} {x - rx:.1f} {y:.1f}Z")


def stone(x, y, rx, ry, fill, vein=True, inner="", shadow=True):
    """En tillplattad sten med en ljus åder och, om det finns, en ristning inuti."""
    cid, gid = uid("c"), uid("g")
    s = f'<clipPath id="{cid}"><path d="{stone_d(x, y, rx, ry)}"/></clipPath>'
    s += (f'<radialGradient id="{gid}" cx="34%" cy="26%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".26"/>'
          f'<stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></radialGradient>')
    if shadow:
        s += f'<ellipse cx="{x:.1f}" cy="{y + ry * .95:.1f}" rx="{rx * 1.05:.1f}" ry="{max(2.5, ry * .16):.1f}" fill="currentColor" opacity=".1"/>'
    s += f'<path d="{stone_d(x, y, rx, ry)}" fill="{fill}"/>'
    s += f'<g clip-path="url(#{cid})">'
    if vein:
        s += f'<path d="M{x + rx * .18:.1f} {y - ry * 1.4:.1f} Q{x + rx * .5:.1f} {y:.1f} {x + rx * .26:.1f} {y + ry * 1.4:.1f}" fill="none" stroke="#F7F2EA" stroke-width="{max(1.2, rx * .07):.1f}" opacity=".7"/>'
    s += inner + "</g>"
    s += f'<path d="{stone_d(x, y, rx, ry)}" fill="url(#{gid})"/>'
    return s


# ---------- barnets motiv ----------

def house(ox, oy, k, roof, wall, sun, grass, seed=3, w=3.0):
    p = lambda pts: [(ox + x * k, oy + y * k) for x, y in pts]
    s = line(p([(0, 30), (0, 90), (60, 90), (60, 30), (0, 30)]), wall, w, seed)
    s += line(p([(-6, 32), (30, -2), (66, 32)]), roof, w, seed + 1)
    s += line(p([(22, 90), (22, 60), (38, 60), (38, 90)]), wall, w, seed + 2)
    s += line(p([(8, 42), (20, 42), (20, 54), (8, 54), (8, 42)]), wall, w * .8, seed + 3)
    s += line(p([(-20, 92), (100, 90)]), grass, w, seed + 4)
    if sun:
        s += line(circle_pts(ox + 98 * k, oy + 4 * k, 12 * k, 22), sun, w, seed + 5)
        for i in range(8):
            a = i * math.pi / 4 + .2
            s += line([(ox + 98 * k + math.cos(a) * 17 * k, oy + 4 * k + math.sin(a) * 17 * k),
                       (ox + 98 * k + math.cos(a) * 26 * k, oy + 4 * k + math.sin(a) * 26 * k)], sun, w * .9, seed + 6 + i, .6)
    return s


def tadpole(cx, cy, k, col, seed=20, w=3.0):
    """Huvudfotingen: huvud med armar och ben, så som tre- och fyraåringar ritar."""
    s = line(circle_pts(cx, cy, 16 * k, 24, -.4, 2 * math.pi - .1), col, w, seed)
    s += f'<circle cx="{cx - 6 * k:.1f}" cy="{cy - 3 * k:.1f}" r="{2.2 * k:.1f}" fill="{col}"/><circle cx="{cx + 6 * k:.1f}" cy="{cy - 4 * k:.1f}" r="{2.2 * k:.1f}" fill="{col}"/>'
    s += line(circle_pts(cx, cy + 2 * k, 8 * k, 10, .4, 2.3), col, w * .8, seed + 1, .5)
    for i, (a, b) in enumerate([((-14, 8), (-34, -6)), ((14, 8), (34, -8)), ((-7, 15), (-12, 42)), ((7, 15), (13, 42))]):
        s += line([(cx + a[0] * k, cy + a[1] * k), (cx + b[0] * k, cy + b[1] * k)], col, w, seed + 2 + i, .8)
    for j in range(3):
        s += line([(cx - 34 * k, cy - 6 * k), (cx - (40 - j * 2) * k, cy - (14 - j * 6) * k)], col, w * .7, seed + 9 + j, .3)
        s += line([(cx + 34 * k, cy - 8 * k), (cx + (40 - j * 2) * k, cy - (16 - j * 6) * k)], col, w * .7, seed + 12 + j, .3)
    for j in range(4):
        s += line([(cx + (-8 + j * 5) * k, cy - 15 * k), (cx + (-10 + j * 6) * k, cy - 24 * k)], col, w * .7, seed + 16 + j, .3)
    return s


def scribble(cx, cy, k, col, seed=40, w=3.0):
    rnd = random.Random(seed)
    pts = []
    for i in range(70):
        a = i * .55
        r = (10 + 14 * math.sin(i * .21) ** 2 + rnd.uniform(-2, 2)) * k
        pts.append((cx + math.cos(a) * r * 1.5 + math.sin(i * .12) * 10 * k, cy + math.sin(a) * r * .85))
    return line(pts, col, w, seed, .8)


def letters(word, x, y, h, col, seed=60, w=3.2):
    """Versaler som ett barn skriver dem: raka streck, olika stora och lite lutande."""
    shapes = {
        "E": [[(0, 0), (0, 1)], [(0, 0), (.55, 0)], [(0, .5), (.45, .5)], [(0, 1), (.6, 1)]],
        "L": [[(0, 0), (0, 1), (.5, 1)]],
        "A": [[(0, 1), (.32, 0), (.64, 1)], [(.14, .62), (.5, .62)]],
        "N": [[(0, 1), (0, 0), (.6, 1), (.6, 0)]],
        "O": "circle",
    }
    rnd = random.Random(seed)
    s, cx = "", x
    for i, ch in enumerate(word):
        hh = h * rnd.uniform(.85, 1.15)
        yy = y + rnd.uniform(-h * .08, h * .08) + (h - hh)
        tilt = rnd.uniform(-.1, .1)
        sh = shapes[ch]
        if sh == "circle":
            s += line(circle_pts(cx + hh * .32, yy + hh * .5, hh * .32, 20, -.5, 6.1, hh * .5), col, w, seed + i)
            cx += hh * .8
            continue
        for j, stroke in enumerate(sh):
            pts = [(cx + (px + (1 - py) * tilt) * hh, yy + py * hh) for px, py in stroke]
            s += line(pts, col, w, seed + i * 7 + j, .7)
        cx += hh * (max(px for st in sh for px, _ in st) + .32)
    return s


def handprint(cx, cy, k, col):
    """Avtrycket av en liten hand: handflata, fyra fingrar och en tumme."""
    s = f'<ellipse cx="{cx:.1f}" cy="{cy + 8 * k:.1f}" rx="{14 * k:.1f}" ry="{16 * k:.1f}" fill="{col}"/>'
    for ang, ln, wd in [(-128, 16, 4.6), (-104, 21, 5), (-80, 22, 5), (-56, 18, 4.6)]:
        a = math.radians(ang)
        fx, fy = cx + math.cos(a) * 11 * k, cy + 8 * k + math.sin(a) * 13 * k
        tx, ty = fx + math.cos(a) * ln * k, fy + math.sin(a) * ln * k
        s += f'<path d="M{fx:.1f} {fy:.1f} L{tx:.1f} {ty:.1f}" stroke="{col}" stroke-width="{wd * 2 * k:.1f}" stroke-linecap="round"/>'
    a = math.radians(-18)
    fx, fy = cx + 11 * k, cy + 12 * k
    s += f'<path d="M{fx:.1f} {fy:.1f} L{fx + math.cos(a) * 15 * k:.1f} {fy + math.sin(a) * 15 * k:.1f}" stroke="{col}" stroke-width="{10 * k:.1f}" stroke-linecap="round"/>'
    return s


# ---------- de stora teckningarna ----------

def _svg(vb, body, label):
    return f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}" style="color: var(--fg)">{body}</svg>'


def note(x, y, text, anchor="start", size=19):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Caveat, cursive" font-size="{size}" fill="var(--accent)">{text}</text>'


def vignette_a():
    s = '<path d="M14 372 H546" stroke="var(--line)" stroke-width="2" stroke-linecap="round"/>'
    # Kojan: en filtbåge över sängen, med lin innanför
    cx, R, r = 150, 96, 74
    s += f'<path d="M{cx - R} 300 V190 A{R} {R} 0 0 1 {cx + R} 190 V300 H{cx + r} V190 A{r} {r} 0 0 0 {cx - r} 190 V300 Z" fill="{SKOGEN["Mossa"]}"/>'
    s += f'<path d="M{cx} 118 Q{cx - 30} 200 {cx - 72} 296 L{cx - 34} 296 Q{cx - 16} 200 {cx} 118 Z" fill="{LIN}" opacity=".85"/>'
    s += f'<path d="M{cx} 118 Q{cx + 30} 200 {cx + 72} 296 L{cx + 34} 296 Q{cx + 16} 200 {cx} 118 Z" fill="{LIN}" opacity=".85"/>'
    s += f'<rect x="38" y="300" width="226" height="58" rx="7" fill="{EK}"/><rect x="38" y="356" width="226" height="6" rx="3" fill="#000" opacity=".08"/>'
    s += f'<rect x="46" y="284" width="210" height="24" rx="10" fill="{LIN}"/>'
    s += f'<rect x="54" y="266" width="54" height="24" rx="11" fill="{ANGEN["Havre"]}"/>'
    s += f'<path d="M104 286 Q130 270 170 276 Q220 282 256 280 V306 H104 Z" fill="{SKOGEN["Lav"]}"/>'
    s += stone(236, 274, 13, 8, BERGET["Ockra"])
    # Lilla valvet
    s += '<path d="M430 0 V32" stroke="var(--fg)" stroke-width="1.5" opacity=".6"/>'
    s += f'<ellipse cx="430" cy="98" rx="30" ry="7" fill="#F6D58B" opacity=".45"/>'
    s += f'<path d="M392 92 V70 A38 38 0 0 1 468 70 V92 H458 V70 A28 28 0 0 0 402 70 V92 Z" fill="{SKOGEN["Kantarell"]}"/>'
    # Årsstenarna på en ekhylla
    s += f'<rect x="300" y="196" width="236" height="9" rx="3" fill="{EK}"/>'
    cols = [SKOGEN["Lav"], SKOGEN["Mossa"], BERGET["Granit"], SKOGEN["Kantarell"], SKOGEN["Lingon"]]
    for i, c in enumerate(cols):
        rx, ry = 13 + i * 2.6, 9 + i * 1.5
        x = 330 + i * 44
        s += stone(x, 196 - ry * .95, rx, ry, c)
        s += f'<text x="{x}" y="224" text-anchor="middle" font-family="Caveat, cursive" font-size="15" fill="var(--muted)">{i + 1}</text>'
    # Stenkrokarna med en linnepåse
    for i, (x, c) in enumerate([(352, SKOGEN["Gran"]), (412, BERGET["Granit"]), (472, SKOGEN["Mossa"])]):
        s += stone(x, 266, 20, 13, c, shadow=False)
    s += f'<path d="M403 272 L398 296 M421 272 L426 296" stroke="{ANGEN["Havre"]}" stroke-width="2.4"/>'
    s += f'<path d="M392 296 H432 L428 340 Q412 346 396 340 Z" fill="{ANGEN["Havre"]}"/>'
    s += note(26, 120, "Kojan") + note(478, 58, "Lilla valvet") + note(306, 250, "Årsstenarna", size=17) + note(496, 300, "Stenkrokarna", "middle", 17)
    return _svg("0 0 560 390", s, "Ett barnrum med en filtbåge över sängen, en taklampa i filt, stenar på en hylla och stenkrokar")


def vignette_b():
    C = {"wall": SKOGEN["Gran"], "roof": SKOGEN["Lingon"], "sun": SKOGEN["Kantarell"], "grass": ANGEN["Gräs"]}
    s = '<g transform="rotate(-4 110 120)">'
    s += '<rect x="28" y="36" width="168" height="160" rx="2" fill="#FFFDF8" stroke="var(--line)" stroke-width="1.5"/>'
    s += house(56, 66, 1.0, C["roof"], C["wall"], C["sun"], C["grass"], seed=3, w=3.4)
    s += '</g>'
    s += line([(212, 120), (258, 118)], "var(--muted)", 2.2, 90, .8) + line([(248, 108), (260, 118), (248, 128)], "var(--muted)", 2.2, 91, .5)
    inner = house(298, 74, .78, C["roof"], C["wall"], C["sun"], C["grass"], seed=3, w=3.2)
    s += stone(354, 122, 84, 74, LERA, vein=False, inner=inner)
    s += note(112, 228, "teckningen", "middle") + note(352, 228, "Årets teckning", "middle")
    # Första namnet
    s += stone(140, 312, 104, 44, ANGEN["Havre"], vein=False, inner=letters("ELLA", 70, 290, 40, SKOGEN["Lingon"], seed=61, w=3.6))
    s += note(140, 382, "Första namnet", "middle")
    # Teckningskrokarna
    sx, sy = 316, 300
    s += f'<circle cx="{sx}" cy="{sy}" r="24" fill="{ANGEN["Smörblomma"]}"/>' + line(circle_pts(sx, sy, 15, 20), SKOGEN["Gran"], 2.6, 71)
    for i in range(8):
        a = i * math.pi / 4
        s += line([(sx + math.cos(a) * 18, sy + math.sin(a) * 18), (sx + math.cos(a) * 22, sy + math.sin(a) * 22)], SKOGEN["Gran"], 2.2, 72 + i, .3)
    cx2 = 404
    cloud = circle_pts(cx2 - 14, sy + 4, 14, 10, math.pi * .5, math.pi) + circle_pts(cx2, sy - 6, 17, 12, math.pi, math.pi) + circle_pts(cx2 + 16, sy + 4, 13, 10, math.pi * 1.5, math.pi)
    s += f'<path d="M{cx2 - 28} {sy + 18} H{cx2 + 29} V{sy + 4} A13 13 0 0 0 {cx2 + 16} {sy - 9} A17 17 0 0 0 {cx2 - 16} {sy - 6} A14 14 0 0 0 {cx2 - 28} {sy + 6} Z" fill="{SJON["Skum"]}" stroke="var(--line)"/>'
    s += line(cloud + [(cx2 - 14, sy + 18)], SJON["Vättern"], 2.4, 80, .6)
    hx = 492
    s += f'<path d="M{hx - 22} {sy + 20} V{sy - 4} L{hx} {sy - 26} L{hx + 22} {sy - 4} V{sy + 20} Z" fill="{SKOGEN["Lingon"]}"/>'
    s += line([(hx - 6, sy + 20), (hx - 6, sy + 4), (hx + 6, sy + 4), (hx + 6, sy + 20)], SKOGEN["Lav"], 2.4, 81, .5)
    for x in (sx, cx2, hx):
        s += f'<circle cx="{x}" cy="{sy + 36}" r="5" fill="{SKOGEN["Gran"]}"/><path d="M{x} {sy + 26} V{sy + 34}" stroke="{SKOGEN["Gran"]}" stroke-width="3"/>'
    s += note(404, 382, "Teckningskrokarna", "middle")
    return _svg("0 0 560 392", s, "Ett barns teckning av ett hus och en sol, samma teckning ristad i lera, en namnskylt och tre krokar")


def vignette_c():
    s = ""
    # Julhängen på en gren
    s += line([(24, 46), (120, 36), (250, 52)], SKOGEN["Gran"], 4, 100, 1.2)
    for x, kind, c in [(70, "star", BERGET["Ockra"]), (140, "heart", SKOGEN["Lingon"]), (210, "star", BERGET["Snö"])]:
        y0 = 40 if x < 150 else 46
        s += f'<path d="M{x} {y0} V{y0 + 34}" stroke="var(--muted)" stroke-width="1"/>'
        if kind == "star":
            pts = " ".join(f"{x + math.cos(math.radians(-90 + i * 36)) * (16 if i % 2 == 0 else 7):.1f},{y0 + 50 + math.sin(math.radians(-90 + i * 36)) * (16 if i % 2 == 0 else 7):.1f}" for i in range(10))
            s += f'<polygon points="{pts}" fill="{c}" stroke="var(--line)" stroke-linejoin="round"/>'
        else:
            s += f'<path d="M{x} {y0 + 64} C{x - 22} {y0 + 50} {x - 16} {y0 + 32} {x} {y0 + 42} C{x + 16} {y0 + 32} {x + 22} {y0 + 50} {x} {y0 + 64} Z" fill="{c}"/>'
    s += note(272, 66, "Julhängen med namn", size=17)
    # Adventsstenarna
    for i, c in enumerate([BERGET["Granit"], BERGET["Järn"], SJON["Sten"], BERGET["Ljung"]]):
        x = 360 + i * 48
        s += stone(x, 176, 20, 13, c)
        s += f'<rect x="{x - 5}" y="132" width="10" height="34" rx="2" fill="{LIN}" stroke="var(--line)"/>'
        if i == 0:
            s += f'<path d="M{x} 112 C{x - 6} 122 {x - 5} 130 {x} 131 C{x + 5} 130 {x + 6} 122 {x} 112 Z" fill="#E9A93B"/><ellipse cx="{x}" cy="126" rx="2.4" ry="4" fill="#F8E2A6"/>'
    s += note(432, 222, "Adventsstenarna", "middle", 17)
    # Kalaskransen
    cx, cy = 210, 300
    s += f'<ellipse cx="{cx}" cy="{cy + 12}" rx="158" ry="52" fill="currentColor" opacity=".08"/>'
    s += f'<path d="M{cx - 150} {cy} A150 48 0 0 0 {cx + 150} {cy} V{cy + 12} A150 48 0 0 1 {cx - 150} {cy + 12} Z" fill="{LERA_SIDA}"/>'
    s += f'<path fill-rule="evenodd" d="M{cx - 150} {cy} A150 48 0 1 0 {cx + 150} {cy} A150 48 0 1 0 {cx - 150} {cy} Z M{cx - 108} {cy} A108 30 0 1 1 {cx + 108} {cy} A108 30 0 1 1 {cx - 108} {cy} Z" fill="{LERA}"/>'
    items = []
    hid = uid("h")
    s += f'<clipPath id="{hid}"><ellipse cx="{cx}" cy="{cy}" rx="108" ry="30"/></clipPath><ellipse cx="{cx}" cy="{cy}" rx="108" ry="30" fill="{LERA_SIDA}"/>'
    s += f'<ellipse cx="{cx}" cy="{cy + 11}" rx="108" ry="30" fill="var(--surface)" clip-path="url(#{hid})"/>'
    for i in range(6):
        a = math.radians(210 + i * 60)
        items.append((cy + math.sin(a) * 39, "candle", cx + math.cos(a) * 129, cy + math.sin(a) * 39))
    items.append((cy + 34, "mush", cx - 64, cy + 36))
    items.append((cy - 34, "bird", cx - 62, cy - 32))
    items.append((cy + 1, "six", cx, cy + 16))
    for _, kind, x, y in sorted(items):
        if kind == "candle":
            s += f'<rect x="{x - 5:.1f}" y="{y - 46:.1f}" width="10" height="46" rx="2" fill="{LIN}" stroke="var(--line)"/>'
            s += f'<path d="M{x:.1f} {y - 66:.1f} C{x - 6:.1f} {y - 56:.1f} {x - 5:.1f} {y - 48:.1f} {x:.1f} {y - 47:.1f} C{x + 5:.1f} {y - 48:.1f} {x + 6:.1f} {y - 56:.1f} {x:.1f} {y - 66:.1f} Z" fill="#E9A93B"/>'
        elif kind == "mush":
            s += f'<rect x="{x - 5:.1f}" y="{y - 16:.1f}" width="10" height="16" rx="3" fill="{SJON["Skum"]}"/>'
            s += f'<path d="M{x - 17:.1f} {y - 14:.1f} A17 15 0 0 1 {x + 17:.1f} {y - 14:.1f} Z" fill="{SKOGEN["Lingon"]}"/>'
            s += "".join(f'<circle cx="{x + dx:.1f}" cy="{y + dy:.1f}" r="2.2" fill="#F7F2EA"/>' for dx, dy in [(-8, -20), (3, -25), (9, -18)])
        elif kind == "bird":
            s += f'<path d="M{x - 16:.1f} {y:.1f} Q{x - 10:.1f} {y - 22:.1f} {x + 8:.1f} {y - 16:.1f} L{x + 16:.1f} {y - 14:.1f} L{x + 9:.1f} {y - 10:.1f} Q{x + 6:.1f} {y:.1f} {x - 16:.1f} {y:.1f} Z" fill="{SJON["Vättern"]}"/><circle cx="{x + 4:.1f}" cy="{y - 13:.1f}" r="1.6" fill="#F7F2EA"/>'
        else:
            s += f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="40" fill="{SKOGEN["Kantarell"]}">6</text>'
    s += note(210, 384, "Kalaskransen", "middle")
    return _svg("0 0 560 392", s, "Julhängen på en gren, fyra adventsstenar med ljus och en födelsedagskrans i lera med sex ljus")


def ages():
    """Rekommendationen: en sten för varje år, med barnets linje från just det året."""
    G, L, K = SKOGEN["Gran"], SKOGEN["Lingon"], SKOGEN["Kantarell"]
    s = '<rect x="20" y="226" width="860" height="14" rx="4" fill="#C49A6C"/><rect x="20" y="238" width="860" height="5" rx="2" fill="#000" opacity=".08"/>'
    spec = [
        (52, 36, SKOGEN["Lav"], lambda x, y: handprint(x, y - 2, 1.05, "#8E9478")),
        (60, 40, ANGEN["Havre"], lambda x, y: scribble(x, y, 1.0, G, 41, 3)),
        (66, 44, SJON["Sand"], lambda x, y: tadpole(x, y - 4, 1.05, G, 21, 3)),
        (72, 48, BERGET["Snö"], lambda x, y: house(x - 46, y - 38, .62, L, G, K, ANGEN["Gräs"], 5, 2.8)),
        (80, 52, ANGEN["Smörblomma"], lambda x, y: letters("ELLA", x - 52, y - 20, 36, L, 61, 3.4)),
    ]
    for i, (rx, ry, c, draw) in enumerate(spec):
        x = 90 + i * 180
        y = 226 - ry * .95
        s += stone(x, y, rx, ry, c, vein=False, inner=draw(x, y))
    return _svg("0 100 900 150", s, "Fem stenar på en hylla, en för varje år: avtrycket, klottret, huvudfotingen, huset och solen och namnet")


def trio():
    a = _svg("0 0 160 130", f'<path d="M30 118 V64 A50 50 0 0 1 130 64 V118 H112 V64 A32 32 0 0 0 48 64 V118 Z" fill="{SKOGEN["Mossa"]}"/>' + stone(80, 108, 16, 10, SKOGEN["Lingon"]), "En båge i filt och en sten")
    sun = line(circle_pts(80, 66, 22, 24), SKOGEN["Kantarell"], 4, 7)
    for i in range(9):
        t = i * 2 * math.pi / 9 + .3
        sun += line([(80 + math.cos(t) * 30, 66 + math.sin(t) * 30), (80 + math.cos(t) * 44, 66 + math.sin(t) * 44)], SKOGEN["Kantarell"], 3.6, 8 + i, .6)
    sun += f'<circle cx="72" cy="62" r="2.6" fill="{SKOGEN["Gran"]}"/><circle cx="88" cy="61" r="2.6" fill="{SKOGEN["Gran"]}"/>' + line(circle_pts(80, 68, 9, 8, .5, 2.1), SKOGEN["Gran"], 2.6, 30, .4)
    b = _svg("0 0 160 130", sun, "En sol ritad av ett barn")
    ring = f'<path fill-rule="evenodd" d="M14 98 A66 22 0 1 0 146 98 A66 22 0 1 0 14 98 Z M38 98 A42 12 0 1 1 122 98 A42 12 0 1 1 38 98 Z" fill="{LERA}" stroke="var(--line)"/>'
    for x, y in [(34, 90), (62, 82), (98, 82), (126, 90), (52, 114), (108, 114)]:
        ring += f'<rect x="{x - 4}" y="{y - 34}" width="8" height="34" rx="2" fill="{LIN}" stroke="var(--line)"/><path d="M{x} {y - 50} C{x - 5} {y - 42} {x - 4} {y - 36} {x} {y - 35} C{x + 4} {y - 36} {x + 5} {y - 42} {x} {y - 50} Z" fill="#E9A93B"/>'
    c = _svg("0 0 160 130", ring, "En födelsedagskrans med sex ljus")
    return a, b, c


def emblem(name):
    """Ett motiv per landskap, ritat som ett barn skulle rita det."""
    if name == "Skogen":
        body = f'<path d="M24 50 A26 22 0 0 1 76 50 Z" fill="{SKOGEN["Lingon"]}"/>' + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="#F7F2EA"/>' for x, y in [(38, 40), (52, 34), (63, 43)])
        body += f'<rect x="42" y="50" width="16" height="24" rx="5" fill="{SJON["Skum"]}"/>' + line([(14, 76), (86, 75)], SKOGEN["Mossa"], 3, 1)
    elif name == "Sjön":
        body = "".join(line([(10 + i * 3, 40 + i * 14)] + [(10 + i * 3 + j * 8, 40 + i * 14 + (-5 if j % 2 else 0)) for j in range(1, 10)], SJON["Vättern"], 3, 2 + i, .5) for i in range(3))
        body += f'<path d="M30 30 Q44 18 58 30 Q44 40 30 30 Z M58 30 L66 23 V37 Z" fill="{SJON["Vass"]}"/>'
    elif name == "Berget":
        body = f'<path d="M8 78 L38 30 L52 50 L62 38 L92 78 Z" fill="{BERGET["Granit"]}"/><path d="M30 42 L38 30 L45 41 Z" fill="{BERGET["Snö"]}"/>'
        body += f'<path d="M72 12 A12 12 0 1 0 84 26 A9 9 0 1 1 72 12 Z" fill="{BERGET["Ockra"]}"/>'
    else:
        body = "".join(f'<ellipse cx="{50 + math.cos(math.radians(a)) * 13:.1f}" cy="{40 + math.sin(math.radians(a)) * 13:.1f}" rx="9" ry="7" transform="rotate({a} {50 + math.cos(math.radians(a)) * 13:.1f} {40 + math.sin(math.radians(a)) * 13:.1f})" fill="{ANGEN["Klöver"]}"/>' for a in range(0, 360, 60))
        body += f'<circle cx="50" cy="40" r="8" fill="{ANGEN["Smörblomma"]}"/>' + line([(50, 54), (52, 80)], ANGEN["Gräs"], 3, 3) + line([(51, 70), (64, 62)], ANGEN["Gräs"], 3, 4)
    return _svg("0 0 100 86", body, f"Motiv från {name.lower()}")
