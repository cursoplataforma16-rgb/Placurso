from pathlib import Path

SQL = Path('supabase/migrations/20261031_annan_persistence.sql').read_text()


def test_annan_learning_events_contract():
    assert 'create table public.annan_learning_events' in SQL.lower()
    assert 'unique (user_id, event_id)' in SQL.lower()
    assert 'references auth.users(id)' in SQL.lower()
    assert 'enable row level security' in SQL.lower()
    assert 'auth.uid() = user_id' in SQL.lower()
    for forbidden in ('answer', 'raw_answer', 'response_payload'):
        assert forbidden not in SQL.lower()


def test_annan_student_profiles_contract():
    assert 'create table public.annan_student_profiles' in SQL.lower()
    assert 'user_id uuid primary key' in SQL.lower()
    assert 'references auth.users(id)' in SQL.lower()
    assert 'enable row level security' in SQL.lower()
    assert 'auth.uid() = user_id' in SQL.lower()
