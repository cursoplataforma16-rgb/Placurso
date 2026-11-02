from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "supabase/migrations/20261102100000_phase10_5_social_oauth.sql"


def test_oauth_state_and_credentials_are_server_only():
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    for marker in (
        "create table if not exists public.growth_oauth_states",
        "state_hash text primary key",
        "code_verifier text",
        "expires_at timestamptz",
        "used_at timestamptz",
        "create table if not exists public.growth_oauth_credentials",
        "encrypted_access_token text not null",
        "encrypted_refresh_token text",
        "encryption_version smallint",
        "alter table public.growth_oauth_states enable row level security",
        "alter table public.growth_oauth_credentials enable row level security",
        "revoke all privileges on table public.growth_oauth_states from anon, public, authenticated",
        "revoke all privileges on table public.growth_oauth_credentials from anon, public, authenticated",
        "grant all privileges on table public.growth_oauth_states to service_role",
        "grant all privileges on table public.growth_oauth_credentials to service_role",
    ):
        assert marker in sql, f"missing server-only OAuth schema requirement: {marker}"


def test_oauth_state_has_replay_and_expiry_guards():
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    assert "check (state_hash ~ '^[a-f0-9]{64}$')" in sql
    assert "check (expires_at > created_at)" in sql
    assert "created_by uuid not null references auth.users(id)" in sql
    assert "unique (account_id)" in sql or "account_id uuid primary key" in sql


if __name__ == "__main__":
    test_oauth_state_and_credentials_are_server_only()
    test_oauth_state_has_replay_and_expiry_guards()
    print("Phase 10.5 OAuth schema contract: PASS")
