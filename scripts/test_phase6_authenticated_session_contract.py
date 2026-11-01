from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMMUNITY = (ROOT / "scripts" / "patch_community_flow.py").read_text(encoding="utf-8")
ADAPTER = (ROOT / "scripts" / "annan_supabase_adapter.js").read_text(encoding="utf-8")


def test_student_access_requires_a_real_supabase_session():
    for marker in (
        "Persistence.getCurrentUser()",
        "Persistence.signUp(name,email,password)",
        "Persistence.signIn(email,password)",
        "Persistence.signOut()",
        "if(!authenticatedUser)return login()",
        "function activateMember(user,preferredName)",
    ):
        assert marker in COMMUNITY, f"missing authenticated student flow: {marker}"
    assert "Access.canEnterStudent(initial)" not in COMMUNITY
    assert "Nesta fase, a sessão local mantém a experiência" not in COMMUNITY


def test_successful_auth_syncs_local_learning_before_remote_merge():
    assert "Persistence.syncEvents(local.events||[])" in COMMUNITY
    assert "Persistence.bootstrap(window.PlacursoAnnanLearningCore,local)" in COMMUNITY
    assert "localStorage.getItem(LEARNING_KEY)" in COMMUNITY
    assert "O histórico local continua disponível" in COMMUNITY


def test_adapter_uses_supabase_auth_and_never_exposes_service_role():
    for marker in (
        "auth.signUp",
        "auth.signInWithPassword",
        "auth.signOut",
        "auth.getUser",
        "function syncEvents(events)",
        "onConflict:'user_id,event_id'",
    ):
        assert marker in ADAPTER, f"missing adapter behavior: {marker}"
    lowered = ADAPTER.lower()
    assert "service_role" not in lowered
    assert "supabase_service_role_key" not in lowered


if __name__ == "__main__":
    test_student_access_requires_a_real_supabase_session()
    test_successful_auth_syncs_local_learning_before_remote_merge()
    test_adapter_uses_supabase_auth_and_never_exposes_service_role()
    print("Phase 6 authenticated student session contract: PASS")
