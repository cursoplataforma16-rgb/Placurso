from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from audit_placurso_source_bundle import audit_archive, audit_directory


def make_archive(path: Path, source: str, filename: str = "index.html") -> None:
    with ZipFile(path, "w") as archive:
        archive.writestr(filename, source)


def assert_has_category(findings: dict[str, list[str]], category: str) -> None:
    assert findings.get(category), f"expected {category} to be detected"


def test_clean_source_bundle_passes() -> None:
    with TemporaryDirectory() as folder:
        archive = Path(folder) / "clean.zip"
        make_archive(archive, "<html><title>Placurso</title></html>")
        findings = audit_archive(archive)
        assert not any(findings.values()), findings


def test_dionuel_brand_is_blocked() -> None:
    with TemporaryDirectory() as folder:
        archive = Path(folder) / "legacy.zip"
        make_archive(archive, "<title>Dionuel Alfaiataria</title>")
        assert_has_category(audit_archive(archive), "DIONUEL_BRAND")


def test_legacy_usuarios_table_access_is_blocked() -> None:
    with TemporaryDirectory() as folder:
        archive = Path(folder) / "legacy.zip"
        make_archive(archive, "const { data } = await supabase.from('usuarios').select('*');")
        assert_has_category(audit_archive(archive), "LEGACY_USUARIOS_TABLE")


def test_dual_brand_router_is_blocked() -> None:
    with TemporaryDirectory() as folder:
        archive = Path(folder) / "legacy.zip"
        make_archive(archive, "function ehRotaCurso(){ return location.hostname.includes('placurso'); }")
        assert_has_category(audit_archive(archive), "DUAL_BRAND_ROUTER")


def test_production_output_is_scanned() -> None:
    with TemporaryDirectory() as folder:
        output = Path(folder) / "public"
        output.mkdir()
        (output / "index.html").write_text("<h1>Placurso</h1>", encoding="utf-8")
        assert not any(audit_directory(output, "production_output").values())
        (output / "manifest.json").write_text('{"name":"DIONUEL"}', encoding="utf-8")
        assert_has_category(audit_directory(output, "production_output"), "DIONUEL_BRAND")


def test_redirects_and_netlify_function_output_are_scanned() -> None:
    with TemporaryDirectory() as folder:
        root = Path(folder)
        (root / "_redirects").write_text(
            "https://placurso.netlify.app/alfaiataria https://dionuel.netlify.app/alfaiataria 301!\\n",
            encoding="utf-8",
        )
        assert_has_category(audit_directory(root, "redirect_output"), "DIONUEL_BRAND")
        (root / "seo.mjs").write_text(
            "const SITE='https://dionuel.netlify.app';", encoding="utf-8"
        )
        assert_has_category(audit_directory(root, "netlify_functions"), "DIONUEL_BRAND")



def test_active_archive_input_scans_only_the_clean_learning_engine() -> None:
    from audit_placurso_source_bundle import audit_active_engine_input
    with TemporaryDirectory() as folder:
        archive = Path(folder) / "bundle.zip"
        with ZipFile(archive, "w") as z:
            z.writestr("index.html", "<title>DIONUEL</title>")
            z.writestr("psico-engine.js", "window.PlacursoGames = {};")
        findings = audit_active_engine_input(archive)
        assert not any(findings.values()), findings


def test_build_pipeline_does_not_extract_the_legacy_homepage() -> None:
    from audit_placurso_source_bundle import audit_build_strategy
    root = Path(__file__).resolve().parents[1]
    violations = audit_build_strategy(root / "scripts" / "build_netlify.py")
    assert not any(violations.values()), violations


if __name__ == "__main__":
    tests = (
        test_clean_source_bundle_passes,
        test_dionuel_brand_is_blocked,
        test_legacy_usuarios_table_access_is_blocked,
        test_dual_brand_router_is_blocked,
        test_redirects_and_netlify_function_output_are_scanned,
        test_active_archive_input_scans_only_the_clean_learning_engine,
        test_build_pipeline_does_not_extract_the_legacy_homepage,
        test_production_output_is_scanned,
    )
    for test in tests:
        test()
    print("Placurso source isolation contract: PASS")
