from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from patch_seo_function_static_routes import configured_routes

BUILD = ROOT / "scripts" / "build_netlify.py"
PATCH_REDIRECTS = ROOT / "scripts" / "patch_static_seo_routes.py"


def test_full_netlify_build_publishes_traffic_assets_and_keeps_annan():
    result = subprocess.run(
        [sys.executable, str(BUILD)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout

    redirect_patch = subprocess.run(
        [sys.executable, str(PATCH_REDIRECTS)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert redirect_patch.returncode == 0, redirect_patch.stderr or redirect_patch.stdout

    public = ROOT / "public"
    homepage = (public / "index.html").read_text(encoding="utf-8")
    # Guard the generated public homepage body, not only its SEO head.
    homepage_body = homepage.split("</head>", 1)[1] if "</head>" in homepage else homepage
    print("GENERATED HOMEPAGE BODY DIAGNOSTIC:", homepage_body[:8000])
    from zipfile import ZipFile
    with ZipFile(ROOT / "placurso-site-root.zip") as archive:
        names = archive.namelist()
        roots = sorted({name.split("/", 1)[0] for name in names if name and not name.startswith("/")})
        course_indexes = [name for name in names if name.lower().endswith("cursos/index.html")]
        print("ARCHIVE TOP-LEVEL ROOTS:", roots[:80])
        print("ARCHIVE COURSE INDEX PATHS:", course_indexes[:20])
        source_index = archive.read("index.html").decode("utf-8", errors="replace")
        script_refs = re.findall(r"""<script[^>]+src=["']([^"']+)["']""", source_index, flags=re.I)
        print("ROOT INDEX SCRIPT REFERENCES:", script_refs[:100])
        for token in ("renderHomeCursoSimples", "location.hostname", "modo-loja", "home-curso-simples.js"):
            positions = [match.start() for match in re.finditer(re.escape(token), source_index)]
            print("ROOT INDEX TOKEN:", token, "count=", len(positions))
            for position in positions[:3]:
                print("ROOT INDEX CONTEXT:", source_index[max(0, position-700):position+1100])
        if "home-curso-simples.js" in names:
            home_script = archive.read("home-curso-simples.js").decode("utf-8", errors="replace")
            print("COURSE HOME SCRIPT TAIL:", home_script[-7000:])
        for entry in course_indexes[:2]:
            source_html = archive.read(entry).decode("utf-8", errors="replace")
            refs = re.findall(r"""(?:src|href)=["']([^"']+)["']""", source_html, flags=re.I)
            print("COURSE INDEX STRUCTURE:", {"path": entry, "bytes": len(source_html), "asset_refs": refs[:60]})
    assert "Aprenda algo útil." in homepage_body, "generated homepage is missing Placurso platform content"
    assert "Dionuel" not in homepage_body, "generated homepage contains unrelated project content"
    assert "Alfaiataria" not in homepage_body, "generated homepage contains unrelated atelier content"
    calculator = (public / "ferramentas" / "calculadora-margem" / "index.html").read_text(encoding="utf-8")
    guide = (public / "guias" / "calcular-margem-lucro" / "index.html").read_text(encoding="utf-8")
    engine = (public / "psico-engine.js").read_text(encoding="utf-8")
    redirects = (public / "_redirects").read_text(encoding="utf-8")
    seo_function = (ROOT / "netlify" / "functions" / "seo.mjs").read_text(encoding="utf-8")
    seo_routes = configured_routes(seo_function)

    assert "Placurso" in homepage.split("</head>", 1)[0]
    assert homepage.count("data-aa=2459988") == 1
    assert calculator.count("data-aa=2459988") == 1
    assert guide.count("data-aa=2459988") == 1
    assert "PlacursoAnnanProductFactory" in engine
    assert "PlacursoAnnanIntegrationGateway" in engine
    assert "PlacursoAnnanExecutionEngine" in engine
    assert "PlacursoAnnanAutonomousWorkflow" in engine
    assert (public / "sitemap.xml").is_file()
    assert (public / "robots.txt").is_file()
    assert "/robots.txt " not in redirects
    assert "/sitemap.xml " not in redirects
    assert "/cursos /cursos/index.html 200!" in redirects
    assert "/cursos/ /cursos/index.html 200!" in redirects
    assert "/robots.txt" not in seo_routes
    assert "/sitemap.xml" not in seo_routes
    assert "/cursos" not in seo_routes
    assert "/cursos/*" in seo_routes
    for route in ["/p/*", "/ver", "/bio", "/links"]:
        assert route in seo_routes


if __name__ == "__main__":
    test_full_netlify_build_publishes_traffic_assets_and_keeps_annan()
    print("Phase 10 full build integration: PASS")
