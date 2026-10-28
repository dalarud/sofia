"""Bygger logotypförslag för Studio Dalarud och en jämförelsesida.

Användning:
    pip install fonttools
    python3 bygg-forslag.py /mapp/med/typsnitt
Mappen ska innehålla Jost-500.ttf, Jostwght400.ttf, InstrumentSerif.ttf och YoungSerif.ttf
(alla från Google Fonts, fri licens).
"""
import importlib.util
import math
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
UT = HERE / "forslag"
spec = importlib.util.spec_from_file_location("logo", HERE / "bygg-logotyp.py")
logo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(logo)

GRANSKOG, LERA, LINNE, LERA_LJUS = "#2B362E", "#9B5E49", "#F3EEE6", "#D49C82"
STEN = "M-9.8 .6c-.4-5 4.3-8.4 10.1-8.5 6-.1 10.2 3.1 10 7.9-.2 4.9-4.6 7.9-10.2 7.9-5.4 0-9.6-2.6-9.9-7.3Z"  # runt (0, 0), ca 20 x 16


def sten(clay, x, y, k=1.0, rot=0):
    return f'<path fill="{clay}" transform="translate({x} {y}) rotate({rot}) scale({k})" d="{STEN}"/>'


def text(font, s, size, x, y, tracking=0.0, per_glyph=None):
    """Text som path. per_glyph(i) kan ge (rotation, dy) för varje bokstav."""
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    k = size / upm
    pen, cur = SVGPathPen(gs), 0.0
    for i, ch in enumerate(s):
        g = cmap[ord(ch)]
        w = gs[g].width * k
        rot, dy = per_glyph(i) if per_glyph else (0, 0)
        t = math.radians(rot)
        cx = x + cur + w / 2  # rotera runt bokstavens mitt på baslinjen
        # x' = cx + cos*(kx - w/2) - sin*(-ky) ; y' = y+dy + sin*(kx - w/2) + cos*(-ky)
        xx, xy = k * math.cos(t), k * math.sin(t)
        yx, yy = k * math.sin(t), -k * math.cos(t)
        dx = cx - math.cos(t) * w / 2
        dyy = y + dy - math.sin(t) * w / 2
        gs[g].draw(TransformPen(pen, (xx, xy, yx, yy, dx, dyy)))
        cur += w + tracking * size
    return pen.getCommands(), cur - tracking * size


def text_on_circle(font, s, size, R, cx=50, cy=50, centered=0):
    """Text runt en cirkel, jämnt fördelad över hela varvet. De första `centered` tecknen centreras upptill."""
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    k = size / upm
    widths = [gs[cmap[ord(ch)]].width * k for ch in s]
    extra = (2 * math.pi * R - sum(widths)) / len(s)
    pen = SVGPathPen(gs)
    arc = -(sum(widths[:centered]) + extra * (centered - 1)) / 2
    for ch, w in zip(s, widths):
        t = (arc + w / 2) / R  # vinkel från toppen, medurs
        c, si = math.cos(t), math.sin(t)
        dx = cx - c * w / 2 + si * R
        dy = cy - si * w / 2 - c * R
        gs[cmap[ord(ch)]].draw(TransformPen(pen, (k * c, k * si, k * si, -k * c, dx, dy)))
        arc += w + extra
    return pen.getCommands()


def path(d, fill):
    return f'<path fill="{fill}" d="{d}"/>'


def build(fonts):
    jost5, jost4 = fonts["Jost-500"], fonts["Jostwght400"]
    instr, young = fonts["InstrumentSerif"], fonts["YoungSerif"]
    out = []

    # A. Gläntan (nuvarande)
    def a_sym(ink, clay):
        return logo.mark(ink, clay)

    def a_lock(ink, clay):
        st, _ = text(jost5, "STUDIO", 13, 124, 37, .62)
        nm, w = text(jost5, "DALARUD", 44, 122, 77, .2)
        return a_sym(ink, clay) + path(st, ink) + path(nm, ink), 124 + w + 4, 100
    out.append(("glantan", "A. Gläntan", "Nuvarande förslag. En rund stämpel av raka streck, skogen och ordningen, med en glänta där en sten av lera vilar. Stram och modern, och kan tryckas i leran.", a_sym, a_lock))

    # B. Rundbågen
    def b_sym(ink, clay):
        arcs = "".join(f'<path d="M{50 - r} 94V52A{r} {r} 0 0 1 {50 + r} 52V94"/>' for r in (42, 31, 20))
        return (f'<g fill="none" stroke="{ink}" stroke-width="3.4" stroke-linecap="round">{arcs}</g>'
                + sten(clay, 50, 86, .62))

    def b_lock(ink, clay):
        nm, w = text(young, "Dalarud", 50, 122, 74)
        st, _ = text(jost5, "STUDIO", 11, 125, 94, .7)
        return b_sym(ink, clay) + path(nm, ink) + path(st, ink), 122 + w + 6, 100
    out.append(("rundbagen", "B. Rundbågen", "Tre bågar som ett fönster eller en dörröppning, och innerst en sten. Hemmet som en trygg plats som ringar in det viktiga. Varm serif i namnet ger en mjuk, inbjudande känsla.", b_sym, b_lock))

    # C. Monogrammet
    def c_sym(ink, clay):
        d = f'<path fill="none" stroke="{ink}" stroke-width="4" stroke-linejoin="round" d="M24 8H50A42 42 0 0 1 50 92H24Z"/>'
        s = (f'<path fill="none" stroke="{clay}" stroke-width="4" stroke-linecap="round" '
             f'd="M70 26C62 17 44 18 43 31 42 44 66 45 67 61 68 77 47 84 37 72"/>')
        return d + s

    def c_lock(ink, clay):
        nm, w = text(instr, "Studio Dalarud", 46, 118, 66)
        sub, _ = text(jost4, "INREDNING · HOMESTAGING · LERA", 8.6, 120, 86, .32)
        return c_sym(ink, clay) + path(nm, ink) + path(sub, ink), 118 + w + 6, 100
    out.append(("monogram", "C. Monogrammet", "S och D i ett märke. D:et är rummet, och S:et slingrar sig genom det som en å genom dalen. Klassiskt och personligt, med en elegant serif som hör ihop med sidans rubriker.", c_sym, c_lock))

    # D. Brus till ro (ordbild)
    tilt = [(-16, -5), (11, 4), (-7, -2), (4, 2), (-1.5, 0), (0, 0), (0, 0)]

    def d_sym(ink, clay):
        dd, w = text(jost5, "d", 92, 18, 82, 0, lambda i: (-10, -2))
        return path(dd, ink) + sten(clay, 78, 76, .55)

    def d_lock(ink, clay):
        nm, w = text(jost5, "dalarud", 64, 4, 70, .02, lambda i: tilt[i])
        return path(nm, ink) + sten(clay, 4 + w + 12, 64, .5), 4 + w + 26, 92
    out.append(("brus-till-ro", "D. Brus till ro", "Ordet själv berättar historien. De första bokstäverna står huller om buller, de sista har hittat ordning, och punkten är en sten av lera. Lekfullt, modernt och direkt kopplat till budskapet.", d_sym, d_lock))

    # E. Rutnätet
    def e_sym(ink, clay):
        dots = "".join(f'<circle cx="{x}" cy="{y}" r="7.5" fill="{ink}"/>' for y in (20, 50, 80) for x in (20, 50, 80) if (x, y) != (50, 50))
        return dots + sten(clay, 50, 50, .78, -8)

    def e_lock(ink, clay):
        nm, w = text(instr, "Studio Dalarud", 50, 120, 70)
        return e_sym(ink, clay) + path(nm, ink), 120 + w + 6, 100
    out.append(("rutnatet", "E. Rutnätet", "Åtta jämna punkter och en handformad sten i mitten. Struktur och överblick runt det som är personligt. Enkelt att känna igen, fungerar som bildstöd, mönster och på förpackningar.", e_sym, e_lock))

    # F. Lerstämpeln
    def f_sym(ink, clay):
        ring = f'<circle cx="50" cy="50" r="47" fill="none" stroke="{ink}" stroke-width="1.8"/>'
        words = text_on_circle(jost5, "STUDIO DALARUD · INREDNING · LERA · ", 8.4, 37.5, centered=14)
        shelf = f'<path stroke="{ink}" stroke-width="2.4" stroke-linecap="round" d="M35 60.5H65"/>'
        return ring + path(words, ink) + shelf + sten(clay, 50, 52.2, 1.05)

    def f_lock(ink, clay):
        nm, w = text(young, "Studio Dalarud", 34, 118, 62)
        return f_sym(ink, clay) + path(nm, ink), 118 + w + 6, 100
    out.append(("lerstampeln", "F. Lerstämpeln", "En rund makarstämpel, som den som trycks i botten på keramiken. Namnet går runt kanten, och i mitten vilar en sten på en hylla. Hantverk och tradition, och blir lika fin på ett paket som i leran.", f_sym, f_lock))
    return out


def svg(w, h, body, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg"{c} viewBox="0 0 {w:.1f} {h:.1f}">{body}</svg>'


def main(font_dir):
    fonts = {n: TTFont(Path(font_dir) / f"{n}.ttf") for n in ("Jost-500", "Jostwght400", "InstrumentSerif", "YoungSerif")}
    UT.mkdir(exist_ok=True)
    cards = []
    for slug, title, idea, sym, lock in build(fonts):
        for suf, ink, clay in (("", GRANSKOG, LERA), ("-ljus", LINNE, LERA_LJUS)):
            body, w, h = lock(ink, clay)
            (UT / f"{slug}-logotyp{suf}.svg").write_text(svg(w, h, body) + "\n", encoding="utf-8")
            (UT / f"{slug}-symbol{suf}.svg").write_text(svg(100, 100, sym(ink, clay)) + "\n", encoding="utf-8")
        body, w, h = lock("currentColor", "var(--accent)")
        dark_body, _, _ = lock(LINNE, LERA_LJUS)
        cards.append((slug, title, idea, svg(w, h, body, "lock"), svg(w, h, dark_body, "lock"),
                      svg(100, 100, sym("currentColor", "var(--accent)"), "sym"), svg(100, 100, sym(LINNE, LERA_LJUS), "sym")))
    page = (HERE / "forslag-mall.html").read_text(encoding="utf-8")
    html = "".join(
        f'<article class="card" id="{slug}"><header><h2>{title}</h2><p>{idea}</p></header>'
        f'<div class="tiles"><div class="tile tile--light">{lk}</div><div class="tile tile--dark">{dk}</div></div>'
        f'<div class="row"><div class="sizes">{sy}<span class="s48">{sy}</span><span class="s24">{sy}</span><span class="s16">{sy}</span></div>'
        f'<div class="stamp">{sd}</div></div></article>'
        for slug, title, idea, lk, dk, sy, sd in cards)
    (UT / "index.html").write_text(page.replace("<!--KORT-->", html), encoding="utf-8")
    print("\n".join(sorted(p.name for p in UT.iterdir())))


if __name__ == "__main__":
    main(sys.argv[1])
