from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "public" / "index.html"
SERVICE_WORKER = ROOT / "public" / "sw.js"


def test_generated_site_contains_server_verified_ceo_google_flow():
    assert INDEX.is_file(), "Netlify build did not generate public/index.html"
    source = INDEX.read_text(encoding="utf-8")
    for marker in (
        "sb.auth.getUser()",
        "operation: 'ceo.bootstrap'",
        "bootstrapStatus === 403",
        "bootstrapCode === 'forbidden'",
        "Conta CEO verificada",
        "A conta Google autenticada não é a identidade CEO",
    ):
        assert marker in source, f"generated site is missing CEO login behavior: {marker}"
    assert "johnjunior.tchek@gmail.com" not in source, "former CEO identity leaked into generated login asset"
    assert "belcianycosmedionisio@gmail.com" not in source, "CEO allowlist must remain server-side"


def test_generated_service_worker_uses_new_ceo_login_cache_version():
    assert SERVICE_WORKER.is_file(), "Netlify build did not generate public/sw.js"
    source = SERVICE_WORKER.read_text(encoding="utf-8")
    assert "placurso-v162-ceo-google-auth" in source
    assert "annan_growth_client.js" in source
    assert "placurso-growth-center.js" in source


if __name__ == "__main__":
    test_generated_site_contains_server_verified_ceo_google_flow()
    test_generated_service_worker_uses_new_ceo_login_cache_version()
    print("Generated CEO login asset verification: PASS")
