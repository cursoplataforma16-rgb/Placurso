from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from patch_seo_function_static_routes import patch


def test_removes_only_static_routes_and_preserves_dynamic_routes():
    source = """export const config = {
  path: [
    "/robots.txt",
    "/sitemap.xml",
    "/p/*",
    "/cursos",
    "/cursos/*",
    "/ver",
    "/bio",
    "/links",
  ],
  preferStatic: true,
};
"""
    result = patch(source)
    assert '"/robots.txt"' not in result
    assert '"/sitemap.xml"' not in result
    assert "preferStatic" not in result
    for route in ["/p/*", "/cursos", "/cursos/*", "/ver", "/bio", "/links"]:
        assert f'"{route}"' in result


def test_supports_inline_path_arrays_and_single_quote_strings():
    source = """export const config = { path: ['/robots.txt', '/sitemap.xml', '/cursos', '/ver', '/bio', '/links', '/p/*'] };
"""
    result = patch(source)
    assert "'/robots.txt'" not in result
    assert "'/sitemap.xml'" not in result
    for route in ["/cursos", "/ver", "/bio", "/links", "/p/*"]:
        assert f"'{route}'" in result


def test_patch_is_idempotent():
    source = """export const config = {
  path: ["/robots.txt", "/sitemap.xml", "/cursos", "/ver", "/bio", "/links", "/p/*"],
  preferStatic: false,
};
"""
    once = patch(source)
    twice = patch(once)
    assert twice == once


if __name__ == "__main__":
    test_removes_only_static_routes_and_preserves_dynamic_routes()
    test_supports_inline_path_arrays_and_single_quote_strings()
    test_patch_is_idempotent()
    print("Phase 10 SEO function route exclusion: PASS")
