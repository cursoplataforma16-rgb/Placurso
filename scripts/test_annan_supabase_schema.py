from pathlib import Path

SQL = Path("supabase/migrations/20261031_annan_persistence.sql").read_text().lower()


def test_annan_learning_events_contract():
    assert "create table if not exists public.annan_learning_events" in SQL
    assert "unique (user_id, event_id)" in SQL
    assert "references auth.users(id)" in SQL
    assert "alter table public.annan_learning_events enable row level security" in SQL
    assert "grant select, insert, update on table public.annan_learning_events to authenticated" in SQL
    assert "for select" in SQL and "for insert" in SQL and "for update" in SQL
    assert "using ((select auth.uid()) = user_id)" in SQL
    assert "with check ((select auth.uid()) = user_id)" in SQL
    assert "to anon" not in SQL
    assert "delete on table public.annan_learning_events" not in SQL


def test_annan_student_profiles_contract():
    assert "create table if not exists public.annan_student_profiles" in SQL
    assert "user_id uuid primary key" in SQL
    assert "references auth.users(id)" in SQL
    assert "alter table public.annan_student_profiles enable row level security" in SQL
    assert "grant select, insert, update on table public.annan_student_profiles to authenticated" in SQL
    assert "students read own annan profile" in SQL
    assert "students insert own annan profile" in SQL
    assert "students update own annan profile" in SQL
    assert "to anon" not in SQL
    assert "delete on table public.annan_student_profiles" not in SQL


def test_no_raw_answers_are_persisted():
    for forbidden in ("raw_answer", "response_payload", "answer_text", "answers json"):
        assert forbidden not in SQL


if __name__ == "__main__":
    test_annan_learning_events_contract()
    test_annan_student_profiles_contract()
    test_no_raw_answers_are_persisted()
    print("ANNAN Supabase schema contract: PASS")
