from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
import re
import subprocess

from build_placurso_ceo_page import build, clean_redirects


def test_ceo_route_reuses_the_existing_annan_runtime() -> None:
    with TemporaryDirectory() as folder:
        public = Path(folder)
        for name in ("psico-engine.js", "annan_growth_client.js", "placurso-growth-center.js", "_redirects"):
            (public / name).write_text("// fixture", encoding="utf-8")
        build(public)
        html = (public / "ceo.html").read_text(encoding="utf-8")
        for marker in (
            'src="/psico-engine.js"',
            "window.PlacursoAnnanPersistence",
            "window.PlacursoAnnanIntegrationGateway",
            "operation:'ceo.bootstrap'",
            "payload.data.role!=='admin'",
            "window.renderPlacursoGrowthCenter",
            "signInWithOAuth",
            "prompt:'select_account'",
        ):
            assert marker in html, f"missing CEO route contract: {marker}"
        for forbidden in (
            "dionuel",
            "alfaiataria",
            "public.usuarios",
            "belcianycosmedionisio@gmail.com",
            "service_role",
            "SUPABASE_SERVICE_ROLE_KEY",
        ):
            assert forbidden.lower() not in html.lower(), f"forbidden CEO page content: {forbidden}"
        inline = re.findall(r"<script>([\s\S]*?)</script>", html)
        assert len(inline) == 1, "expected one inline CEO controller"
        script = public / "ceo-inline.js"
        script.write_text(inline[0], encoding="utf-8")
        subprocess.run(["node", "--check", str(script)], check=True, capture_output=True, text=True)


def test_ceo_route_fails_closed_when_annan_assets_are_missing() -> None:
    with TemporaryDirectory() as folder:
        public = Path(folder)
        (public / "_redirects").write_text("/* /index.html 200\n", encoding="utf-8")
        try:
            build(public)
        except SystemExit as error:
            assert "dependencies missing" in str(error)
        else:
            raise AssertionError("CEO route must not be generated without its ANNAN runtime")


def test_netlify_redirects_remove_legacy_cross_brand_links() -> None:
    with TemporaryDirectory() as folder:
        public = Path(folder)
        redirects = public / "_redirects"
        redirects.write_text(
            "# old DIONUEL routes\n"
            "https://placurso.netlify.app/alfaiataria https://dionuel.netlify.app/alfaiataria 301!\n"
            "https://placurso.netlify.app/logo-dionuel.webp /curso-logo.png 200!\n"
            "/vendor/supabase-js.js https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 200\n"
            "/cursos /cursos/index.html 200!\n"
            "/* /index.html 200\n",
            encoding="utf-8",
        )
        clean_redirects(public)
        lines = redirects.read_text(encoding="utf-8").splitlines()
        assert lines[:2] == ["/ceo /ceo.html 200!", "/ceo/* /ceo.html 200!"]
        result = "\n".join(lines).lower()
        assert "dionuel" not in result and "alfaiataria" not in result
        assert "/vendor/supabase-js.js" in result
        assert "/cursos /cursos/index.html 200!" in result
        assert "/* /index.html 200" in result


if __name__ == "__main__":
    for test in (
        test_ceo_route_reuses_the_existing_annan_runtime,
        test_ceo_route_fails_closed_when_annan_assets_are_missing,
        test_netlify_redirects_remove_legacy_cross_brand_links,
    ):
        test()
    print("Placurso isolated CEO route contract: PASS")
