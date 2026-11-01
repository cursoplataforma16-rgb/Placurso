from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
PATCH = ROOT / "scripts" / "patch_static_seo_routes.py"


def test_seo_static_routes_are_not_rewritten_to_function():
    source = """# Keep unrelated routes intact
/robots.txt /.netlify/functions/seo 200
/sitemap.xml /.netlify/functions/seo?type=sitemap 200
https://placurso.netlify.app/robots.txt /.netlify/functions/seo 200
/blog/* /blog/index.html 200
/cursos /index.html 200
"""
    with tempfile.TemporaryDirectory() as directory:
        redirects = Path(directory) / "_redirects"
        redirects.write_text(source, encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(PATCH), str(redirects)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr or result.stdout

        output = redirects.read_text(encoding="utf-8")
        assert "/robots.txt " not in output
        assert "/sitemap.xml " not in output
        assert "https://placurso.netlify.app/robots.txt " not in output
        assert "/blog/* /blog/index.html 200" in output
        assert "/cursos /index.html 200" in output
        assert "# Keep unrelated routes intact" in output


def test_static_seo_route_patch_is_idempotent():
    source = "/robots.txt /.netlify/functions/seo 200\n/cursos /index.html 200\n"
    with tempfile.TemporaryDirectory() as directory:
        redirects = Path(directory) / "_redirects"
        redirects.write_text(source, encoding="utf-8")
        for _ in range(2):
            result = subprocess.run(
                [sys.executable, str(PATCH), str(redirects)],
                cwd=ROOT,
                capture_output=True,
                text=True,
            )
            assert result.returncode == 0, result.stderr or result.stdout
        assert redirects.read_text(encoding="utf-8") == "/cursos /index.html 200\n"


if __name__ == "__main__":
    test_seo_static_routes_are_not_rewritten_to_function()
    test_static_seo_route_patch_is_idempotent()
    print("Phase 10 static SEO route guard: PASS")
