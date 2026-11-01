from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATCH = ROOT / "scripts" / "patch_annan_growth_assets.py"
FUNCTION = ROOT / "supabase" / "functions" / "annan-growth" / "index.ts"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*_ceo_google_login_repair.sql"))


def test_browser_login_handles_disabled_google_provider_clearly():
    patch = PATCH.read_text(encoding="utf-8")
    assert "provider: 'google'" in patch
    assert "provider is not enabled" in patch
    assert "configuração do Google Cloud" in patch


def test_browser_delegates_ceo_classification_to_server_not_a_hardcoded_email():
    patch = PATCH.read_text(encoding="utf-8")
    assert "sb.auth.getUser()" in patch
    assert "operation: 'ceo.bootstrap'" in patch
    assert "johnjunior.tchek@gmail.com" not in patch
    assert "belcianycosmedionisio@gmail.com" not in patch
    assert "result.data.role === 'admin'" in patch
    assert "bootstrapStatus === 403" in patch
    assert "bootstrapCode === 'forbidden'" in patch


def test_browser_only_shows_ceo_success_after_server_confirmation():
    patch = PATCH.read_text(encoding="utf-8")
    assert "Conta CEO verificada" in patch
    assert patch.index("operation: 'ceo.bootstrap'") < patch.index("Conta CEO verificada")
    assert "bootstrapStatus === 403" in patch


def test_edge_function_uses_database_singleton_as_only_email_allowlist():
    function = FUNCTION.read_text(encoding="utf-8")
    assert '=== "ceo.bootstrap"' in function
    assert "app_metadata" in function
    assert "email_confirmed_at" in function
    assert "growth_ceo_identity" in function
    assert 'auth_user_id=is.null' in function
    assert 'on_conflict=id' in function
    assert "johnjunior.tchek@gmail.com" not in function
    assert "belcianycosmedionisio@gmail.com" not in function
    assert "PLACURSO_GROWTH_CEO_USER_ID" not in function


def test_new_migration_releases_old_ceo_and_demotes_old_admin():
    assert len(MIGRATIONS) == 1, f"expected one CEO login repair migration, found {len(MIGRATIONS)}"
    sql = MIGRATIONS[0].read_text(encoding="utf-8").lower()
    assert "belcianycosmedionisio@gmail.com" in sql
    assert "johnjunior.tchek@gmail.com" in sql
    assert "update public.perfis" in sql
    assert "papel = 'aluno'" in sql or "papel='aluno'" in sql
    assert "auth_user_id = null" in sql or "auth_user_id=null" in sql
    assert "claimed_at = null" in sql or "claimed_at=null" in sql
    assert "perform set_config('request.jwt.claim.sub'" in sql
    assert "where id = 1" in sql or "where id=1" in sql


def test_browser_code_does_not_contain_server_secrets():
    client = CLIENT.read_text(encoding="utf-8").lower()
    assert "service_role" not in client
    assert "client_secret" not in client
    assert "supabase_secret_keys" not in client


if __name__ == "__main__":
    for test_function in (
        test_browser_login_handles_disabled_google_provider_clearly,
        test_browser_delegates_ceo_classification_to_server_not_a_hardcoded_email,
        test_browser_only_shows_ceo_success_after_server_confirmation,
        test_edge_function_uses_database_singleton_as_only_email_allowlist,
        test_new_migration_releases_old_ceo_and_demotes_old_admin,
        test_browser_code_does_not_contain_server_secrets,
    ):
        test_function()
    print("Phase 10.3 CEO Google Auth repair contract: PASS")
