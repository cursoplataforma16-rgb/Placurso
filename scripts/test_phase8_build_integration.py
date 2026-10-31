from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = (ROOT / "scripts" / "build_netlify.py").read_text(encoding="utf-8")
CORE = ROOT / "scripts" / "annan_integration_gateway.js"

assert CORE.is_file(), "Phase 8 gateway source must exist"
assert "CORE_INTEGRATION_GATEWAY" in BUILD, "build must include gateway source"
assert "PLACURSO_ANNAN_INTEGRATION_GATEWAY" in BUILD, "build marker missing"
assert "A-Ads" in BUILD or "aads" in BUILD.lower(), "build must retain explicit A-Ads boundary"

print("OK: Phase 8 build integration contract")
