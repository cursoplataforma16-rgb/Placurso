from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATCH = ROOT / "scripts" / "patch_annan_growth_assets.py"
FUNCTION = ROOT / "supabase" / "functions" / "annan-growth" / "index.ts"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
MIGRATION = ROOT / "supabase" / "migrations" / "20261101214500_phase10_3_ceo_google_identity.sql"


def test_browser_login_handles_disabled_google_provider_clearly():
    patch = PATCH.read_text(encoding="utf-8")
    assert "provider: 'google'" in patch
    assert "provider is not enabled" in patch
    assert "configuração do Google Cloud" in patch


def test_signed_in_ceo_runs_server_bootstrap_before_student_creation():
    patch = PATCH.read_text(encoding="utf-8")
    assert "sb.auth.getUser()" in patch
    assert "johnjunior.tchek@gmail.com" in patch
    assert "operation: 'ceo.bootstrap'" in patch
    assert "bootstrap.data.role !== 'admin'" in patch
    assert patch.index("operation: 'ceo.bootstrap'") < patch.index("if(comGoogle){ let cv = '';")


def test_edge_function_uses_server_verified_google_auth_identity():
    function = FUNCTION.read_text(encoding="utf-8")
    assert 'operation") === "ceo.bootstrap"' in function
    assert "app_metadata" in function
    assert "email_confirmed_at" in function
    assert "growth_ceo_identity" in function
    assert 'auth_user_id=is.null' in function
    assert 'on_conflict=id' in function
    assert "PLACURSO_GROWTH_CEO_USER_ID" not in function
    assert "verify_jwt = true" in function


def test_ceo_identity_mapping_is_service_only_and_not_email_as_user_id():
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    assert "references auth.users(id)" in sql
    assert "auth_user_id uuid unique" in sql
    assert "enable row level security" in sql
    assert "revoke all privileges on table public.growth_ceo_identity from authenticated" in sql
    assert "revoke all privileges on table public.growth_ceo_identity from anon" in sql
    assert "grant select, update on table public.growth_ceo_identity to service_role" in sql
    assert "johnjunior.tchek@gmail.com" in sql


def test_browser_code_does_not_contain_server_secrets():
    client = CLIENT.read_text(encoding="utf-8").lower()
    assert "service_role" not in client
    assert "client_secret" not in client
    assert "supabase_secret_keys" not in client


if __name__ == "__main__":
    for test in (
        test_browser_login_handles_disabled_google_provider_clearly,
        test_signed_in_ceo_runs_server_bootstrap_before_student_creation,
        test_edge_function_uses_server_verified_google_auth_identity,
        test_ceo_identity_mapping_is_service_only_and_not_email_as_user_id,
        test_browser_code_does_not_contain_server_secrets,
    ):
        test()
    print("Phase 10.3 CEO Google Auth contract: PASS")
