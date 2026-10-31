from pathlib import Path

core = Path(__file__).resolve().parents[1] / 'scripts' / 'annan_product_factory.js'
text = core.read_text(encoding='utf-8').lower()
assert 'a-ads' not in text
assert 'aads.com' not in text
print('Phase 7 A-Ads boundary passed')
