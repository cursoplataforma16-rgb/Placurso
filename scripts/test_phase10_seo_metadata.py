from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
PATCH = ROOT / "scripts" / "patch_placurso_seo.py"
EXPECTED_CANONICAL = 'https://placurso.netlify.app/'


def run_patch(html: str) -> str:
    with tempfile.TemporaryDirectory() as directory:
        target = Path(directory) / "index.html"
        target.write_text(html, encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(PATCH), str(target)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr or result.stdout
        return target.read_text(encoding="utf-8")


def test_homepage_metadata_describes_placurso_not_dionuel():
    source = """<!doctype html><html lang="pt"><head>
    <title>Old title</title>
    <meta name="description" content="Roupa sob medida, fatos de noivos e ajustes da DIONUEL.">
    </head><body><h1>Aprenda algo útil</h1></body></html>"""
    result = run_patch(source)
    head = result.split("</head>", 1)[0].lower()

    assert "<title>Placurso — cursos práticos, ferramentas e aprendizagem com ANNAN</title>" in result
    assert "formação prática" in head
    assert "ferramentas digitais" in head
    assert "dionuel" not in head
    assert "alfaiataria" not in head
    assert "roupa sob medida" not in head


def test_homepage_gets_one_self_canonical_and_social_metadata():
    source = """<!doctype html><html><head>
    <title>Old title</title>
    <meta name="description" content="Roupa sob medida da DIONUEL.">
    </head><body></body></html>"""
    result = run_patch(source)

    canonicals = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', result, re.I)
    assert canonicals == [EXPECTED_CANONICAL]
    assert result.count('property="og:title"') == 1
    assert result.count('property="og:description"') == 1
    assert result.count('property="og:url"') == 1
    assert 'name="twitter:card"' in result


def test_homepage_seo_patch_is_idempotent():
    source = """<!doctype html><html><head>
    <title>Old title</title>
    <meta name="description" content="Roupa sob medida da DIONUEL.">
    </head><body></body></html>"""
    once = run_patch(source)
    twice = run_patch(once)

    assert twice.count('rel="canonical"') == 1
    assert twice.count('property="og:title"') == 1
    assert twice.count('property="og:description"') == 1


if __name__ == "__main__":
    test_homepage_metadata_describes_placurso_not_dionuel()
    test_homepage_gets_one_self_canonical_and_social_metadata()
    test_homepage_seo_patch_is_idempotent()
    print("Phase 10 SEO metadata: PASS")
