# Skärmallar för Filtvalvet (70 cm). Alla mått i millimeter.
# Kör: python3 produkter/filtvalvet/bygg-mallar.py  → filt-70.svg/.dxf och ryggstod-70.svg/.dxf
import math, pathlib
here = pathlib.Path(__file__).parent

R_OUT, T = 175, 5                 # ytterradie och filtens tjocklek
R_MID = R_OUT - T / 2             # mittradie, används för den platta längden
L = 700                           # skärmens längd
W = round(math.pi * R_MID)        # bågens längd utvikt: cirka 542 mm
SOCKET = 40                       # hål för lamphållaren, anpassa efter den du köper
SCREWS_X = [100, 250, 450, 600]   # skruvnitar längs toppen
ROD_X, ROD_EDGE, ROD_D = 40, 20, 4.5
SPINE_L, SPINE_W, SPINE_INSET = L - 50, 60, 25

def svg(w, h, body, name, note):
    pad = 15
    s = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w + 2*pad}mm" height="{h + 2*pad + 12}mm" viewBox="{-pad} {-pad} {w + 2*pad} {h + 2*pad + 12}">
<g fill="none" stroke="#000" stroke-width="0.3">{body}</g>
<text x="0" y="{h + 10}" font-family="Helvetica, Arial" font-size="5">{note}</text>
</svg>'''
    (here / f"{name}.svg").write_text(s)

def dxf(entities, name):
    out = ["0", "SECTION", "2", "ENTITIES"]
    for e in entities:
        if e[0] == "line":
            _, x1, y1, x2, y2 = e
            out += ["0", "LINE", "8", "0", "10", f"{x1}", "20", f"{y1}", "11", f"{x2}", "21", f"{y2}"]
        else:
            _, x, y, r = e
            out += ["0", "CIRCLE", "8", "0", "10", f"{x}", "20", f"{y}", "40", f"{r}"]
    out += ["0", "ENDSEC", "0", "EOF"]
    (here / f"{name}.dxf").write_text("\n".join(out) + "\n")

def rect(w, h): return [("line", 0, 0, w, 0), ("line", w, 0, w, h), ("line", w, h, 0, h), ("line", 0, h, 0, 0)]

# Filten: en rektangel. Långsidorna blir bågens nederkanter.
felt = rect(L, W)
felt.append(("circle", L / 2, W / 2, SOCKET / 2))
felt += [("circle", x, W / 2, 2.5) for x in SCREWS_X]
felt += [("circle", x, y, ROD_D / 2) for x in (ROD_X, L - ROD_X) for y in (ROD_EDGE, W - ROD_EDGE)]

# Ryggstödet: en ekribba under filten längs toppen
spine = rect(SPINE_L, SPINE_W)
spine.append(("circle", SPINE_L / 2, SPINE_W / 2, SOCKET / 2))
spine += [("circle", x - SPINE_INSET, SPINE_W / 2, 2.5) for x in SCREWS_X]

def to_svg(ents):
    parts = []
    for e in ents:
        if e[0] == "line": parts.append(f'<line x1="{e[1]}" y1="{e[2]}" x2="{e[3]}" y2="{e[4]}"/>')
        else: parts.append(f'<circle cx="{e[1]}" cy="{e[2]}" r="{e[3]}"/>')
    return "".join(parts)

svg(L, W, to_svg(felt), "filt-70", f"Filtvalvet 70 cm · filt 5 mm · {L} x {W} mm · hål Ø{SOCKET} för lamphållare, Ø5 för skruvnitar, Ø{ROD_D} för stängerna · skala 1:1")
dxf(felt, "filt-70")
svg(SPINE_L, SPINE_W, to_svg(spine), "ryggstod-70", f"Ryggstöd i ek · {SPINE_L} x {SPINE_W} x 10 mm · samma hål som filten · skala 1:1")
dxf(spine, "ryggstod-70")
print("filt", L, "x", W, "mm")
