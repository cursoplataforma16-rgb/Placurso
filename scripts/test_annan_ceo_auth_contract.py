from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATCH = ROOT / "scripts" / "patch_annan_growth_assets.py"
FUNCTION = ROOT / "supabase" / "functions" / "annan-growth" / "index.ts"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*_ceo_google_login_repair.sql"))
SIGNUP_MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*_ceo_signup_profile_from_identity.sql"))
CEO_RPC_MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*_placurso_ceo_bootstrap_rpc.sql"))


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
    assert "rpc/placurso_ceo_bootstrap_profile" in function
    assert "p_auth_user_id" in function
    assert 'growth_ceo_identity?id=eq.1&auth_user_id=is.null' not in function
    assert "perfis?on_conflict=id" not in function
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


def test_auth_signup_trigger_creates_students_and_defers_ceo_promotion():
    assert len(CEO_RPC_MIGRATIONS) == 1, (
        f"expected one CEO RPC migration, found {len(CEO_RPC_MIGRATIONS)}"
    )
    sql = CEO_RPC_MIGRATIONS[0].read_text(encoding="utf-8").lower()
    assert "create or replace function public.handle_new_user()" in sql
    assert "values (new.id" in sql
    assert "'aluno'" in sql
    assert "growth_ceo_identity" not in sql.split("create or replace function public.handle_new_user()", 1)[1].split("$function$;", 1)[0]


def test_ceo_role_is_provisioned_only_by_service_role_rpc():
    assert len(CEO_RPC_MIGRATIONS) == 1
    sql = CEO_RPC_MIGRATIONS[0].read_text(encoding="utf-8").lower()
    assert "create or replace function public.placurso_ceo_bootstrap_profile" in sql
    assert "auth.role()" in sql and "service_role" in sql
    assert "auth.users" in sql
    assert "email_confirmed_at is not null" in sql
    assert "raw_app_meta_data" in sql and "google" in sql
    assert "public.growth_ceo_identity" in sql
    assert "for update" in sql
    assert "placurso.allow_ceo_role_change" in sql
    assert "revoke all on function public.placurso_ceo_bootstrap_profile" in sql
    assert "grant execute on function public.placurso_ceo_bootstrap_profile" in sql
    assert "to service_role" in sql
    assert "public.eh_admin()" in sql
    assert "public.bloquear_mudanca_de_papel()" in sql


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
        test_auth_signup_trigger_creates_students_and_defers_ceo_promotion,
        test_ceo_role_is_provisioned_only_by_service_role_rpc,
        test_browser_code_does_not_contain_server_secrets,
    ):
        test_function()
    print("Phase 10.3 CEO Google Auth repair contract: PASS")
