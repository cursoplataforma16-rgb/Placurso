from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / 'scripts' / 'build_netlify.py'

text = BUILD.read_text(encoding='utf-8')

assert "annan_execution_gateway_adapter.js" in text, 'build must include Phase 9.2 adapter'
assert 'PLACURSO_ANNAN_EXECUTION_GATEWAY_ADAPTER' in text, 'build must use a unique Phase 9.2 marker'
assert 'annan_product_factory.js' in text, 'Product Factory must remain integrated'
assert 'annan_integration_gateway.js' in text, 'Integration Gateway must remain integrated'
assert 'annan_execution_engine.js' in text, 'Execution Engine must remain integrated'
assert 'A-Ads' in text or 'A-Ads preservado' in text, 'A-Ads preservation must remain explicit'

print('Phase 9.2 build integration contract passed.')
