from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
PATCH = ROOT / "scripts" / "patch_seo_function_static_preference.py"


def run_patch(source: str) -> str:
    with tempfile.TemporaryDirectory() as directory:
        target = Path(directory) / "seo.mjs"
        target.write_text(source, encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(PATCH), str(target)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr or result.stdout
        return target.read_text(encoding="utf-8")


def test_seo_function_prefers_existing_static_resources():
    source = """export const config = {
  path: ["/robots.txt", "/sitemap.xml", "/cursos"],
};
export default async () => new Response("dynamic");
"""
    result = run_patch(source)
    assert "preferStatic: true" in result
    assert 'path: ["/robots.txt", "/sitemap.xml", "/cursos"]' in result


def test_existing_prefer_static_false_is_corrected():
    source = """export const config = { path: ["/robots.txt"], preferStatic: false };
"""
    result = run_patch(source)
    assert "preferStatic: true" in result
    assert "preferStatic: false" not in result


def test_seo_function_static_preference_is_idempotent():
    source = """export const config = { path: ["/robots.txt"], preferStatic: true };
"""
    result = run_patch(source)
    assert result.count("preferStatic: true") == 1


if __name__ == "__main__":
    test_seo_function_prefers_existing_static_resources()
    test_existing_prefer_static_false_is_corrected()
    test_seo_function_static_preference_is_idempotent()
    print("Phase 10 SEO function static preference: PASS")
