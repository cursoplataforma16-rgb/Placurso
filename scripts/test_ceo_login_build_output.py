from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CEO_PAGE = ROOT / "public" / "ceo.html"
SERVICE_WORKER = ROOT / "public" / "sw.js"


def test_generated_ceo_page_uses_server_verified_google_flow():
    assert CEO_PAGE.is_file(), "Netlify build did not generate public/ceo.html"
    source = CEO_PAGE.read_text(encoding="utf-8")
    for marker in (
        "PlacursoAnnanPersistence",
        "getCurrentUser",
        "operation:'ceo.bootstrap'",
        "role!=='admin'",
        "signInWithOAuth",
        "prompt:'select_account'",
        "renderPlacursoGrowthCenter",
    ):
        assert marker in source, f"CEO page is missing secure login behavior: {marker}"
    for forbidden in (
        "belcianycosmedionisio@gmail.com",
        "service_role",
        "SUPABASE_SERVICE_ROLE_KEY",
        "public.usuarios",
        "dionuel",
        "alfaiataria",
    ):
        assert forbidden.lower() not in source.lower(), f"forbidden content leaked into CEO page: {forbidden}"


def test_generated_service_worker_is_placurso_only():
    assert SERVICE_WORKER.is_file(), "Netlify build did not generate public/sw.js"
    source = SERVICE_WORKER.read_text(encoding="utf-8")
    for marker in (
        "placurso-clean-v1",
        "'/index.html'",
        "'/psico-engine.js'",
        "'/curso-icon-192.png'",
    ):
        assert marker in source, f"service worker is missing required asset: {marker}"
    for forbidden in ("dionuel", "logo-dionuel", "oettkaytgkkbrjoaeiqu.supabase.co"):
        assert forbidden.lower() not in source.lower(), f"legacy asset remains in service worker: {forbidden}"


if __name__ == "__main__":
    test_generated_ceo_page_uses_server_verified_google_flow()
    test_generated_service_worker_is_placurso_only()
    print("Generated CEO and PWA assets verification: PASS")
