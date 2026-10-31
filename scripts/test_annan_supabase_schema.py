from pathlib import Path

MIGRATION_DIR = Path("supabase/migrations")
BASE_SQL = (MIGRATION_DIR / "20261031175433_annan_persistence.sql").read_text().lower()
HARDENING_SQL = (MIGRATION_DIR / "20261031175547_annan_privilege_hardening.sql").read_text().lower()
SQL = BASE_SQL + "\n" + HARDENING_SQL


def test_annan_learning_events_contract():
    assert "create table if not exists public.annan_learning_events" in BASE_SQL
    assert "unique (user_id, event_id)" in BASE_SQL
    assert "references auth.users(id)" in BASE_SQL
    assert "alter table public.annan_learning_events enable row level security" in BASE_SQL
    assert "students read own annan learning events" in BASE_SQL
    assert "students insert own annan learning events" in BASE_SQL
    assert "students update own annan learning events" in BASE_SQL
    assert "using ((select auth.uid()) = user_id)" in BASE_SQL
    assert "with check ((select auth.uid()) = user_id)" in BASE_SQL


def test_annan_student_profiles_contract():
    assert "create table if not exists public.annan_student_profiles" in BASE_SQL
    assert "user_id uuid primary key" in BASE_SQL
    assert "references auth.users(id)" in BASE_SQL
    assert "alter table public.annan_student_profiles enable row level security" in BASE_SQL
    assert "students read own annan profile" in BASE_SQL
    assert "students insert own annan profile" in BASE_SQL
    assert "students update own annan profile" in BASE_SQL


def test_api_privileges_are_least_privilege():
    for table in ("annan_learning_events", "annan_student_profiles"):
        assert f"revoke all privileges on table public.{table} from anon, public" in HARDENING_SQL
        assert f"revoke all privileges on table public.{table} from authenticated" in HARDENING_SQL
        assert f"grant select, insert, update on table public.{table} to authenticated" in HARDENING_SQL
        assert f"grant delete on table public.{table}" not in SQL


def test_no_raw_answers_are_persisted():
    for forbidden in ("raw_answer", "response_payload", "answer_text", "answers json"):
        assert forbidden not in SQL


if __name__ == "__main__":
    test_annan_learning_events_contract()
    test_annan_student_profiles_contract()
    test_api_privileges_are_least_privilege()
    test_no_raw_answers_are_persisted()
    print("ANNAN Supabase schema contract: PASS")
