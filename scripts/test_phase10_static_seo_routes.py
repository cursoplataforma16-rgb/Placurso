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


def test_removes_conflicting_seo_and_exact_course_redirects():
    source = """# Keep unrelated routes intact
/robots.txt /.netlify/functions/seo 200
/sitemap.xml /.netlify/functions/seo?type=sitemap 200
https://placurso.netlify.app/robots.txt /.netlify/functions/seo 200
/cursos /.netlify/functions/seo 301
/cursos/ /cursos 301
/cursos/* /.netlify/functions/seo 200
/blog/* /blog/index.html 200
"""
    result = run_patch(source)
    assert "/robots.txt " not in result
    assert "/sitemap.xml " not in result
    assert "https://placurso.netlify.app/robots.txt " not in result
    assert "/cursos /.netlify/functions/seo" not in result
    assert "/cursos/ /cursos 301" not in result
    assert "/cursos/* /.netlify/functions/seo 200" in result
    assert "/cursos /cursos/index.html 200!" in result
    assert "/cursos/ /cursos/index.html 200!" in result
    assert "/blog/* /blog/index.html 200" in result
    assert "# Keep unrelated routes intact" in result


def test_static_seo_redirect_cleanup_is_idempotent():
    source = "/robots.txt /.netlify/functions/seo 200\n/cursos /.netlify/functions/seo 301\n/cursos/* /.netlify/functions/seo 200\n/blog /blog.html 200\n"
    once = run_patch(source)
    twice = run_patch(once)
    assert twice == once
    assert twice.splitlines()[:2] == [
        "/cursos /cursos/index.html 200!",
        "/cursos/ /cursos/index.html 200!",
    ]


if __name__ == "__main__":
    test_removes_conflicting_seo_and_exact_course_redirects()
    test_static_seo_redirect_cleanup_is_idempotent()
    print("Phase 10 static SEO and course route cleanup: PASS")
