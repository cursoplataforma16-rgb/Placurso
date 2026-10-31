from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
build = (ROOT / 'scripts' / 'build_netlify.py').read_text(encoding='utf-8')
engine = (ROOT / 'scripts' / 'annan_execution_engine.js').read_text(encoding='utf-8')

assert 'CORE_EXECUTION_ENGINE' in build
assert 'PlacursoAnnanExecutionEngine' in engine
assert 'PLACURSO_ANNAN_EXECUTION_ENGINE' in build
assert 'CORE_PRODUCT_FACTORY' in build
assert 'CORE_INTEGRATION_GATEWAY' in build
assert 'PATCH_PHASE4_GUARD' in build
assert 'A-Ads' in build

print('Phase 9 build integration contract passed.')
