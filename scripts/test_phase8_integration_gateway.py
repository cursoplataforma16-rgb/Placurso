from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "scripts" / "annan_integration_gateway.js"

source = CORE.read_text(encoding="utf-8")

required = [
    "PlacursoAnnanIntegrationGateway",
    "register",
    "dispatch",
    "list",
    "validateIntegration",
    "noSecrets",
]
for token in required:
    assert token in source, f"missing gateway contract: {token}"

assert "process.env" not in source
assert "SUPABASE_SERVICE_ROLE_KEY" not in source
assert "STRIPE_SECRET_KEY" not in source
assert "OPENAI_API_KEY" not in source
assert "fetch(" not in source, "gateway core must remain side-effect free"

print("OK: Phase 8 Integration Gateway contract")
