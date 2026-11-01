from pathlib import Path
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
BUILDER = ROOT / "scripts" / "build_traffic_assets.py"
BASE = "https://placurso.netlify.app"


def build_assets(destination: Path) -> None:
    result = subprocess.run(
        [sys.executable, str(BUILDER), str(destination)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout


def test_traffic_builder_creates_pages_sitemap_and_robots():
    with tempfile.TemporaryDirectory() as directory:
        public = Path(directory)
        build_assets(public)

        calculator = public / "ferramentas" / "calculadora-margem" / "index.html"
        guide = public / "guias" / "calcular-margem-lucro" / "index.html"
        sitemap = public / "sitemap.xml"
        robots = public / "robots.txt"

        assert calculator.is_file()
        assert guide.is_file()
        assert sitemap.is_file()
        assert robots.is_file()

        calc_html = calculator.read_text(encoding="utf-8")
        guide_html = guide.read_text(encoding="utf-8")

        for marker in [
            "<title>Calculadora de margem e preço | Placurso</title>",
            'name="description"',
            'rel="canonical"',
            "<h1>Calculadora de margem e preço</h1>",
            'id="unit-cost"',
            'id="unit-expenses"',
            'id="fee-percent"',
            'id="sale-price"',
            'id="target-margin"',
            "/js/placurso-margin-calculator.js",
            "/guias/calcular-margem-lucro/",
            "/cursos",
        ]:
            assert marker in calc_html, marker

        for marker in [
            "<title>Como calcular margem de lucro e definir o preço de venda | Placurso</title>",
            'name="description"',
            'rel="canonical"',
            "<h1>Como calcular a margem de lucro e definir o preço de venda</h1>",
            "margem de lucro",
            "markup",
            "5.500",
            "/ferramentas/calculadora-margem/",
            "/cursos",
        ]:
            assert marker in guide_html, marker

        for html in [calc_html, guide_html]:
            assert html.count("data-aa=2459988") == 1
            assert html.count("Advertise here") == 1
            assert "source_id=2459988" in html

        js = (public / "js" / "placurso-margin-calculator.js").read_text(encoding="utf-8")
        assert "PlacursoMarginCalculator" in js
        assert "addEventListener" in js

        xml = ET.parse(sitemap)
        locs = {node.text for node in xml.findall(".//{*}loc")}
        assert locs == {
            f"{BASE}/",
            f"{BASE}/cursos",
            f"{BASE}/ferramentas/calculadora-margem/",
            f"{BASE}/guias/calcular-margem-lucro/",
        }

        robots_text = robots.read_text(encoding="utf-8")
        assert "User-agent: *" in robots_text
        assert "Allow: /" in robots_text
        assert f"Sitemap: {BASE}/sitemap.xml" in robots_text


if __name__ == "__main__":
    test_traffic_builder_creates_pages_sitemap_and_robots()
    print("Phase 10 traffic assets: PASS")
