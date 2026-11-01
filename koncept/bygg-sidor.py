# Bygger koncept/livsstil.html, rohemmet.html och manniskohemmet.html av *.src.html med logotypen inbäddad.
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "koncept/livsstil.src.html").read_text()
logo = (root / "profil/webb/logotyp-webb.svg").read_text().strip()
logo = re.sub(r"<\?xml[^>]*>", "", logo).replace("<svg ", '<svg role="img" aria-hidden="true" ', 1)
# Stenar på en hylla: sju stenar i årstidernas färger, en "läggs" i taget.
stones = []
cols = ["#6F7D62", "#8F7F92", "#C4AF90", "#A9705A", "#9A968C", "#D2C2A6", "#9B5E49"]
pos = [(70, 300, 46, 26), (150, 296, 38, 22), (222, 302, 52, 28), (300, 298, 40, 24), (130, 252, 34, 19), (214, 250, 42, 23), (176, 212, 30, 17)]
for i, ((x, y, rx, ry), c) in enumerate(zip(pos, cols)):
    d = 0.25 * i
    stones.append(f'<g style="animation: drop 1s cubic-bezier(.3,1.4,.5,1) {d:.2f}s both"><ellipse cx="{x}" cy="{y+ry-2}" rx="{rx+6}" ry="5" fill="currentColor" opacity=".08"/><path d="M{x-rx} {y} C{x-rx} {y-ry*1.1} {x+rx*0.9} {y-ry*1.25} {x+rx} {y-ry*0.1} C{x+rx*1.05} {y+ry*0.9} {x-rx*0.8} {y+ry*1.05} {x-rx} {y}Z" fill="{c}" opacity=".9"/></g>')
art = ('<svg viewBox="0 0 370 360" xmlns="http://www.w3.org/2000/svg" style="color: var(--fg)"><style>@keyframes drop { from { transform: translateY(-40px); opacity: 0 } to { transform: none; opacity: 1 } } @media (prefers-reduced-motion: reduce) { g { animation: none !important } }</style>'
       '<path d="M20 330 H350" stroke="#B88A62" stroke-width="7" stroke-linecap="round"/>' + "".join(stones) +
       '<text x="185" y="355" text-anchor="middle" font-family="Caveat, cursive" font-size="20" fill="#9B5E49">en sten för varje litet steg</text></svg>')
out = src.replace("{{LOGO}}", logo).replace("{{STONES}}", art)
(root / "koncept/livsstil.html").write_text(out)
print("livsstil", len(out))
ro = (root / "koncept/rohemmet.src.html").read_text().replace("{{LOGO}}", logo)
(root / "koncept/rohemmet.html").write_text(ro)
print("rohemmet", len(ro))
mh = (root / "koncept/manniskohemmet.src.html").read_text().replace("{{LOGO}}", logo)
(root / "koncept/manniskohemmet.html").write_text(mh)
print("manniskohemmet", len(mh))
bg = (root / "koncept/bagen.src.html").read_text().replace("{{LOGO}}", logo)
(root / "koncept/bagen.html").write_text(bg)
print("bagen", len(bg))
fs = (root / "koncept/formsprak.src.html").read_text().replace("{{LOGO}}", logo)
(root / "koncept/formsprak.html").write_text(fs)
print("formsprak", len(fs))
fg = (root / "produkter/filtvalvet/guide.src.html").read_text().replace("{{LOGO}}", logo)
(root / "produkter/filtvalvet/guide.html").write_text(fg)
print("filtvalvet guide", len(fg))
