from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# TDD contract for the browser persistence layer. The implementation must expose
# a small adapter without secrets and keep the local/offline learning path intact.
EXPECTED = [
    "placurso_annan_persistence_v1",
    "supabase",
    "auth",
    "event_id",
    "annan_learning_events",
    "localStorage",
    "placurso:progress",
]


def test_browser_adapter_contract_is_present():
    candidates = [
        ROOT / "scripts" / "annan_supabase_adapter.js",
        ROOT / "scripts" / "patch_annan_supabase_adapter.py",
    ]
    text = "\n".join(p.read_text(encoding="utf-8") for p in candidates if p.exists())
    assert text, "browser persistence adapter contract is missing"
    for marker in EXPECTED:
        assert marker in text, f"missing adapter contract marker: {marker}"


def test_browser_adapter_does_not_contain_service_role_secret():
    candidates = [
        ROOT / "scripts" / "annan_supabase_adapter.js",
        ROOT / "scripts" / "patch_annan_supabase_adapter.py",
    ]
    text = "\n".join(p.read_text(encoding="utf-8") for p in candidates if p.exists()).lower()
    assert "service_role" not in text
    assert "supabase_service_role_key" not in text
