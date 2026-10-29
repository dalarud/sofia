"""Bygger Studio Dalaruds logotypfiler som rena vektorer.

Märket "Rundbågen": tre bågar som ett fönster eller en dörröppning, och innerst
en sten av lera. Ordbilden är egenritad med samma linje som bågarna: samma
tjocklek, rundade ändar och former byggda av bågar och raka ben. I u:et, dalen,
vilar samma sten som i märket. Inga typsnitt behövs.

Användning:
    python3 bygg-logotyp.py
"""
from pathlib import Path

UT = Path(__file__).parent
GRANSKOG, LERA, LINNE, LERA_LJUS = "#2B362E", "#9B5E49", "#F3EEE6", "#D49C82"

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


def mark(ink, clay):
    arcs = "".join(f'<path d="M{50 - r} {BOTTEN}V{MITT}A{r} {r} 0 0 1 {50 + r} {MITT}V{BOTTEN}"/>' for r in BAGAR)
    return (f'<g fill="none" stroke="{ink}" stroke-width="{LINJE}" stroke-linecap="round">{arcs}</g>'
            f'<path fill="{clay}" transform="translate(50 86) scale(.62)" d="{STEN}"/>')


def word(glyphs, text, x, y, scale, stroke, ink, spacing, extra=None):
    """Ritar ett ord av egna bokstäver. spacing är en funktion (föregående, nästa) -> luft.
    extra(tecken, x) kan lägga till något vid en bokstav, i ordets koordinater."""
    parts, cur, prev, more = [], 0.0, None, []
    for ch in text:
        d, w = glyphs[ch]
        if prev is not None:
            cur += spacing(prev, ch)
        parts.append(f'<path transform="translate({cur:.2f} 0)" d="{d}"/>')
        if extra:
            more.append(extra(ch, cur))
        cur += w
        prev = ch
    g = (f'<g transform="translate({x:.2f} {y:.2f}) scale({scale})" fill="none" stroke="{ink}" '
         f'stroke-width="{stroke / scale:.3f}" stroke-linecap="round" stroke-linejoin="round">{"".join(parts)}</g>'
         f'<g transform="translate({x:.2f} {y:.2f}) scale({scale})">{"".join(more)}</g>')
    return g, cur * scale


def namn(x, y, scale, ink, clay):
    # u:et är en dal, och i botten vilar samma sten som i märket
    def sten_i_u(ch, cx):
        return f'<path fill="{clay}" transform="translate({cx + 18:.2f} -8.2) scale(.56)" d="{STEN}"/>' if ch == "u" else ""
    return word(NAMN, "Dalarud", x, y, scale, LINJE, ink, lambda a, b: NAMN_LUFT[(a, b)], sten_i_u)


def studio(x, y, scale, ink):
    return word(STUDIO, "STUDIO", x, y, scale, LINJE * .5, ink, lambda a, b: 7.5)


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}">{body}</svg>\n'


def liggande(ink, clay):
    # Ordet står på samma baslinje som bågarnas fötter; STUDIO ovanför, kant i kant med D:ets stam.
    name, wn = namn(124, BOTTEN, 1, ink, clay)
    top, _ = studio(124, BOTTEN - 56 - 12, 1, ink)
    return svg(124 + wn + 6, 100, mark(ink, clay) + name + top)


def staende(ink, clay):
    _, wn = namn(0, 0, .8, ink, clay)
    _, ws = studio(0, 0, 1, ink)
    W = max(wn, 100) + 16
    name, _ = namn((W - wn) / 2, 152, .8, ink, clay)
    top, _ = studio((W - ws) / 2, 172, 1, ink)
    return svg(W, 178, f'<g transform="translate({(W - 100) / 2:.1f} 0)">{mark(ink, clay)}</g>' + name + top)


def main():
    files = {}
    for suffix, ink, clay in (("", GRANSKOG, LERA), ("-ljus", LINNE, LERA_LJUS)):
        files[f"symbol{suffix}.svg"] = svg(100, 100, mark(ink, clay))
        files[f"logotyp{suffix}.svg"] = liggande(ink, clay)
        files[f"logotyp-staende{suffix}.svg"] = staende(ink, clay)
    # Versioner för hemsidan: färger från sidans tokens
    files["logotyp-webb.svg"] = liggande("currentColor", "var(--accent)")
    files["symbol-webb.svg"] = svg(100, 100, mark("currentColor", "var(--accent)"))
    for name, content in files.items():
        (UT / name).write_text(content, encoding="utf-8")
        print(name)


if __name__ == "__main__":
    main()
