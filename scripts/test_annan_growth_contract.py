from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FUNCTION = ROOT / "supabase" / "functions" / "annan-growth" / "index.ts"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
PANEL = ROOT / "scripts" / "placurso-growth-center.js"
MIGRATIONS = ROOT / "supabase" / "migrations"


def test_growth_function_is_separate_from_learning_function():
    assert FUNCTION.is_file(), "dedicated annan-growth function is missing"
    source = FUNCTION.read_text(encoding="utf-8")
    assert "annan-ensino" not in source
    assert "verify_jwt" not in source or "verify_jwt = true" in source


def test_growth_function_requires_server_side_ceo_authorization():
    source = FUNCTION.read_text(encoding="utf-8")
    for marker in (
        "/auth/v1/user",
        "growth_ceo_identity",
        "johnjunior.tchek@gmail.com",
        "app_metadata",
        "email_confirmed_at",
        "public.perfis",
        "papel",
        "admin",
        "ceo.bootstrap",
        "ceo_not_configured",
        "forbidden",
    ):
        assert marker in source, f"missing CEO authorization contract: {marker}"


def test_growth_function_has_no_publication_or_ads_side_effect():
    source = FUNCTION.read_text(encoding="utf-8").lower()
    for forbidden in (
        "video.publish",
        "graph.facebook.com",
        "api.tiktok.com",
        "youtube.googleapis.com",
        "marketing api",
        "publish_now",
        "spend_budget",
    ):
        assert forbidden not in source, f"Phase 10.2 must not publish or spend: {forbidden}"


def test_growth_browser_client_contains_no_privileged_secrets():
    assert CLIENT.is_file(), "browser growth client is missing"
    client = CLIENT.read_text(encoding="utf-8").lower()
    for forbidden in (
        "service_role",
        "supabase_secret_keys",
        "supabase_service_role_key",
        "access_token",
        "client_secret",
        "refresh_token",
    ):
        assert forbidden not in client, f"browser client contains a privileged secret marker: {forbidden}"


def test_growth_browser_panel_does_not_fake_connections_or_metrics():
    panel = PANEL.read_text(encoding="utf-8")
    assert "Ainda não ligado" in panel or "Não ligado" in panel
    assert "—" in panel
    assert "annan-growth" in panel or "PlacursoGrowthClient" in panel


def test_growth_schema_migration_exists_and_closes_direct_access():
    matches = sorted(MIGRATIONS.glob("*growth_foundation*.sql"))
    assert matches, "Phase 10.2 growth schema migration is missing"
    sql = matches[-1].read_text(encoding="utf-8").lower()
    for table in (
        "growth_accounts",
        "growth_campaigns",
        "growth_contents",
        "growth_approvals",
        "growth_publications",
        "growth_metrics",
        "growth_audit_log",
    ):
        assert re.search(rf"create table(?: if not exists)? public\.{table}\b", sql), f"missing table {table}"
        assert f"alter table public.{table} enable row level security" in sql
        assert f"revoke all privileges on table public.{table}" in sql
    assert "grant all privileges on table public.growth_" not in sql or "to service_role" in sql


if __name__ == "__main__":
    for test in (
        test_growth_function_is_separate_from_learning_function,
        test_growth_function_requires_server_side_ceo_authorization,
        test_growth_function_has_no_publication_or_ads_side_effect,
        test_growth_browser_client_contains_no_privileged_secrets,
        test_growth_browser_panel_does_not_fake_connections_or_metrics,
        test_growth_schema_migration_exists_and_closes_direct_access,
    ):
        test()
    print("Phase 10.2 growth contract: PASS")
