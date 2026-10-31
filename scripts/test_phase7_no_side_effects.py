from pathlib import Path

CORE = Path(__file__).resolve().parents[1] / 'scripts' / 'annan_product_factory.js'
text = CORE.read_text(encoding='utf-8')
assert 'fetch(' not in text
assert 'XMLHttpRequest' not in text
assert 'supabase' not in text.lower()
assert 'stripe' not in text.lower()
assert 'A-Ads' not in text
print('Phase 7 side-effect guard passed')
