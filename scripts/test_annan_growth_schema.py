from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "supabase" / "migrations"
TABLES = (
    "growth_accounts",
    "growth_campaigns",
    "growth_contents",
    "growth_approvals",
    "growth_publications",
    "growth_metrics",
    "growth_audit_log",
)


def migration_text():
    matches = sorted(MIGRATIONS.glob("*growth_foundation*.sql"))
    assert matches, "Phase 10.2 growth foundation migration is missing"
    return matches[-1].read_text(encoding="utf-8").lower()


def test_all_growth_tables_are_rls_protected_and_service_only():
    sql = migration_text()
    for table in TABLES:
        assert re.search(rf"create table public\.{table}\b", sql), f"missing table {table}"
        assert f"alter table public.{table} enable row level security" in sql
        assert f"revoke all privileges on table public.{table}" in sql
        assert f"grant all privileges on table public.{table}" in sql
        assert "to service_role" in sql


def test_growth_schema_has_no_plaintext_provider_credential_storage():
    sql = migration_text()
    for marker in ("access_token", "refresh_token", "client_secret", "service_role_key"):
        assert marker not in sql, f"plaintext credential field is forbidden: {marker}"


def test_content_approval_is_bound_to_a_single_immutable_version():
    sql = migration_text()
    assert "content_version" in sql
    assert "content_hash" in sql
    assert "unique (content_id, content_version, content_hash)" in sql
    assert "growth_decide_approval" in sql
    assert "for update" in sql


def test_atomic_approval_rpc_is_service_only():
    sql = migration_text()
    assert "create or replace function public.growth_decide_approval" in sql
    assert "security invoker" in sql
    assert "revoke all on function public.growth_decide_approval" in sql
    assert "grant execute on function public.growth_decide_approval" in sql
    assert "to service_role" in sql


if __name__ == "__main__":
    for test in (
        test_all_growth_tables_are_rls_protected_and_service_only,
        test_growth_schema_has_no_plaintext_provider_credential_storage,
        test_content_approval_is_bound_to_a_single_immutable_version,
        test_atomic_approval_rpc_is_service_only,
    ):
        test()
    print("Phase 10.2 growth schema contract: PASS")
