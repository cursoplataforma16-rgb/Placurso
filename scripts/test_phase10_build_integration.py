from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
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
    calculator = (public / "ferramentas" / "calculadora-margem" / "index.html").read_text(encoding="utf-8")
    guide = (public / "guias" / "calcular-margem-lucro" / "index.html").read_text(encoding="utf-8")
    engine = (public / "psico-engine.js").read_text(encoding="utf-8")
    redirects = (public / "_redirects").read_text(encoding="utf-8")
    seo_function = (ROOT / "netlify" / "functions" / "seo.mjs").read_text(encoding="utf-8")

    assert "DIONUEL" not in homepage.split("</head>", 1)[0]
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
    assert "/cursos/* /cursos/index.html 200!" in redirects
    assert "/robots.txt" not in seo_function
    assert "/sitemap.xml" not in seo_function
    assert "/cursos" not in seo_function
    assert "/cursos/*" not in seo_function
    assert "preferStatic" not in seo_function
    for route in ["/p/*", "/ver", "/bio", "/links"]:
        assert route in seo_function


if __name__ == "__main__":
    test_full_netlify_build_publishes_traffic_assets_and_keeps_annan()
    print("Phase 10 full build integration: PASS")
