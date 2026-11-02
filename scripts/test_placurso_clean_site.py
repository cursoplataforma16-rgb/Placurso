from pathlib import Path
from tempfile import TemporaryDirectory
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_placurso_clean_site import build


def test_clean_homepage_uses_educational_engine_and_student_function():
    with TemporaryDirectory() as folder:
        public = Path(folder)
        (public / "psico-engine.js").write_text("// educational engine", encoding="utf-8")
        (public / "curso-icon-192.png").write_bytes(b"png")
        (public / "curso-icon-512.png").write_bytes(b"png")
        (public / "Dionuel-old.html").write_text("<p>legacy</p>", encoding="utf-8")
        (public / "legacy-dir").mkdir()
        (public / "legacy-dir" / "app.js").write_text("old", encoding="utf-8")
        build(public)

        html = (public / "index.html").read_text(encoding="utf-8")
        assert (public / "psico-engine.js").is_file()
        assert not (public / "Dionuel-old.html").exists()
        assert not (public / "legacy-dir").exists()
        for marker in (
            'src="/psico-engine.js"',
            "window.PlacursoAnnanPersistence",
            "annan-ensino",
            "aluno_iniciar",
            "perfil_rapido",
            "boas_vindas_midia",
            "percurso_ver",
            "prof_falar",
            'class="pch-challenges"',
            'id="courseCatalog"',
            'id="studentProfile"',
            "/ceo",
        ):
            assert marker in html, f"missing clean Placurso function: {marker}"
        for forbidden in (
            "dionuel",
            "alfaiataria",
            "public.usuarios",
            "ehRotaCurso",
            "kunica.netlify.app",
            "oettkaytgkkbrjoaeiqu.supabase.co",
        ):
            assert forbidden.lower() not in html.lower(), f"legacy marker in homepage: {forbidden}"

        inline = re.findall(r"<script>([\s\S]*?)</script>", html)
        assert len(inline) == 1, "expected one inline controller"
        js = public / "homepage-inline.js"
        js.write_text(inline[0], encoding="utf-8")
        subprocess.run(["node", "--check", str(js)], check=True, capture_output=True, text=True)

        service_worker = (public / "sw.js").read_text(encoding="utf-8")
        assert "placurso-clean-v1" in service_worker
        manifest = (public / "manifest.json").read_text(encoding="utf-8")
        assert '"name": "Placurso"' in manifest
        assert (public / "_redirects").read_text(encoding="utf-8").startswith("/ceo /ceo.html 200!")


def test_build_script_does_not_extract_or_copy_the_legacy_homepage():
    source = (ROOT / "scripts" / "build_netlify.py").read_text(encoding="utf-8")
    assert "archive.extractall" not in source
    assert "WORK / \"index.html\"" not in source
    assert "netlify/functions/seo.mjs" not in source
    for required in (
        "psico-engine.js",
        "build_placurso_clean_site.py",
        "build_placurso_ceo_page.py",
        "patch_placurso_seo_function.py",
        "copy_clean_archive_member",
    ):
        assert required in source


if __name__ == "__main__":
    test_clean_homepage_uses_educational_engine_and_student_function()
    test_build_script_does_not_extract_or_copy_the_legacy_homepage()
    print("Placurso clean-site build contract: PASS")
