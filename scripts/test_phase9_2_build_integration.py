from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "scripts" / "build_netlify.py"
SOURCE = ROOT / "scripts" / "annan_execution_gateway_adapter.js"

text = BUILD.read_text(encoding="utf-8")
source = SOURCE.read_text(encoding="utf-8")

assert "CORE_EXECUTION_GATEWAY_ADAPTER" in text, "build must include Phase 9.2 adapter"
assert "PLACURSO_ANNAN_EXECUTION_GATEWAY_ADAPTER" in text, "build must use a unique Phase 9.2 marker"
assert "annan_product_factory.js" in text, "Product Factory must remain integrated"
assert "annan_integration_gateway.js" in text, "Integration Gateway must remain integrated"
assert "annan_execution_engine.js" in text, "Execution Engine must remain integrated"
assert "PlacursoAnnanExecutionGatewayAdapter" in source, "adapter API must remain available"
assert "patch_phase4_public_guard.py" in text, "public access guard must remain integrated"

# External ad iframes are not injected into the clean learner homepage by default.
assert "patch_aads_unit.py" not in text, "external ads must not be injected before the CEO activates an approved channel"

print("Phase 9.2 clean-build integration contract passed.")
