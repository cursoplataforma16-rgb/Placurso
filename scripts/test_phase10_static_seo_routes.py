from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
PATCH = ROOT / "scripts" / "patch_static_seo_routes.py"


def run_patch(source: str) -> str:
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
        return redirects.read_text(encoding="utf-8")


def test_removes_only_static_seo_redirects():
    source = """# Keep unrelated routes intact
/robots.txt /.netlify/functions/seo 200
/sitemap.xml /.netlify/functions/seo?type=sitemap 200
https://placurso.netlify.app/robots.txt /.netlify/functions/seo 200
/blog/* /blog/index.html 200
/cursos /index.html 200
"""
    result = run_patch(source)
    assert "/robots.txt " not in result
    assert "/sitemap.xml " not in result
    assert "https://placurso.netlify.app/robots.txt " not in result
    assert "/blog/* /blog/index.html 200" in result
    assert "/cursos /index.html 200" in result
    assert "# Keep unrelated routes intact" in result


def test_static_seo_redirect_cleanup_is_idempotent():
    source = "/robots.txt /.netlify/functions/seo 200\n/cursos /index.html 200\n"
    once = run_patch(source)
    twice = run_patch(once)
    assert twice == once
    assert twice == "/cursos /index.html 200\n"


if __name__ == "__main__":
    test_removes_only_static_seo_redirects()
    test_static_seo_redirect_cleanup_is_idempotent()
    print("Phase 10 static SEO redirect cleanup: PASS")
