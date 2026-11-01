from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from patch_seo_function_static_routes import configured_routes

BUILD = ROOT / "scripts" / "build_netlify.py"
PATCH_REDIRECTS = ROOT / "scripts" / "patch_static_seo_routes.py"


def _run_build() -> Path:
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
    return ROOT / "public"


def _course_mode(homepage: str, hostname: str, pathname: str = "/") -> bool:
    match = re.search(r"function\s+ehRotaCurso\s*\(\)\s*\{[^}]*\}", homepage)
    assert match, "homepage must expose ehRotaCurso() host routing"
    script = (
        "const location = " + json.dumps({"hostname": hostname, "pathname": pathname}) + ";\n"
        + match.group(0)
        + "\nprocess.stdout.write(ehRotaCurso() ? 'true' : 'false');"
    )
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout
    return result.stdout == "true"


def test_full_netlify_build_publishes_traffic_assets_and_keeps_annan():
    public = _run_build()
    homepage = (public / "index.html").read_text(encoding="utf-8")
    calculator = (public / "ferramentas" / "calculadora-margem" / "index.html").read_text(encoding="utf-8")
    guide = (public / "guias" / "calcular-margem-lucro" / "index.html").read_text(encoding="utf-8")
    engine = (public / "psico-engine.js").read_text(encoding="utf-8")
    redirects = (public / "_redirects").read_text(encoding="utf-8")
    seo_function = (ROOT / "netlify" / "functions" / "seo.mjs").read_text(encoding="utf-8")
    seo_routes = configured_routes(seo_function)

    # The homepage is rendered by home-curso-simples.js after host detection;
    # checking the static splash markup for rendered copy is not a valid test.
    assert _course_mode(homepage, "placurso.netlify.app")
    assert _course_mode(homepage, "deploy-preview-17--placurso.netlify.app")
    assert _course_mode(homepage, "main--placurso.netlify.app")
    assert not _course_mode(homepage, "another-project.netlify.app")
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
