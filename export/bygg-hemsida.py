# Bygger en fristående kopia av den publika hemsidan i export/hemsida/.
# Kräver att webbappen kör lokalt (npx next dev -p 3001) mot en databas med startinnehållet.
# Formulär och kassa fungerar inte utan server; en liten förhandsvisningsshim svarar i stället.
import pathlib, re, shutil, sys, urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
root = pathlib.Path(__file__).resolve().parent.parent
out = root / "export/hemsida"
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)
pub = root / "web/public"

PAGES = {"": "index", "hjalp": "hjalp", "ateljen": "ateljen", "manniskohemmet": "manniskohemmet", "rohemmet": "rohemmet",
         "ro-i-vardagen": "ro-i-vardagen", "om": "om", "integritet": "integritet", "villkor": "villkor"}

SHIM = """<script>
/* Förhandsvisning: hemsidan körs utan server, så formulär och kassa får ett låtsassvar. */
(function () {
  var real = window.fetch;
  window.fetch = function (url, opt) {
    if (typeof url === "string" && url.indexOf("/api/") === 0) {
      var ok = function (j) { return Promise.resolve(new Response(JSON.stringify(j), { status: 200, headers: { "Content-Type": "application/json" } })); };
      var no = function (m) { return Promise.resolve(new Response(JSON.stringify({ error: m }), { status: 400, headers: { "Content-Type": "application/json" } })); };
      if (url === "/api/guide") return ok({ url: "guide-lugnare-barnrum.pdf" });
      if (url === "/api/checkout") return no("Det här är en förhandsvisning. Betalningen kopplas på när hemsidan är i drift.");
      return ok({ ok: true });
    }
    return real.apply(this, arguments);
  };
})();
</script>
"""


def link(path: str) -> str:
    """Gör en absolut sökväg på sajten till en relativ fil."""
    m = re.match(r"^/([^?#]*)([?#].*)?$", path)
    page, rest = m.group(1), m.group(2) or ""
    if page in PAGES:
        return PAGES[page] + ".html" + rest
    return page + rest


def rewrite(html: str) -> str:
    html = re.sub(r'(href|src|action)="(/[^"/][^"]*|/)"', lambda m: f'{m.group(1)}="{link(m.group(2))}"', html)
    html = re.sub(r'(site\.(?:css|js))\?v=[^"]*', r"\1", html)
    return html.replace('<script src="site.js"', SHIM + '<script src="site.js"', 1)


for route, name in PAGES.items():
    html = urllib.request.urlopen(f"{BASE}/{route}").read().decode()
    (out / f"{name}.html").write_text(rewrite(html))
    print(name, len(html))

js = (pub / "site.js").read_text()
js = re.sub(r'"(/(?:hjalp|ateljen|rohemmet|manniskohemmet|ro-i-vardagen|om)(?:[?#][^"]*)?)"', lambda m: '"' + link(m.group(1)) + '"', js)
(out / "site.js").write_text(js)
shutil.copy(pub / "site.css", out / "site.css")
for pdf in pub.glob("*.pdf"):
    shutil.copy(pdf, out / pdf.name)
print("klart:", out)
