from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from patch_seo_function_static_preference import patch


def test_adds_static_preference_for_robots_and_sitemap():
    source = """
export const config = {
  path: ["/robots.txt", "/sitemap.xml", "/cursos", "/cursos/*"],
};
"""
    result = patch(source)
    assert "preferStatic: true" in result
    assert result.count("preferStatic: true") == 1
    assert '"/robots.txt"' in result
    assert '"/sitemap.xml"' in result


def test_upgrades_existing_false_value_and_is_idempotent():
    source = """
export const config = {
  path: ["/robots.txt", "/sitemap.xml"],
  preferStatic: false,
};
"""
    first = patch(source)
    second = patch(first)
    assert "preferStatic: true" in second
    assert "preferStatic: false" not in second
    assert second.count("preferStatic: true") == 1


def test_rejects_unrelated_function_routes():
    source = 'export const config = { path: ["/cursos/*"] };'
    try:
        patch(source)
    except ValueError as error:
        assert "robots.txt" in str(error)
    else:
        raise AssertionError("A configuração sem as rotas SEO deveria ser rejeitada")


if __name__ == "__main__":
    test_adds_static_preference_for_robots_and_sitemap()
    test_upgrades_existing_false_value_and_is_idempotent()
    test_rejects_unrelated_function_routes()
    print("Phase 10 SEO static routing: PASS")
