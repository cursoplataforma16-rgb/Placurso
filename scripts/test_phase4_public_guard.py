from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / 'scripts'
PATCH = SCRIPTS / 'patch_phase4_public_guard.py'
BUILDER = SCRIPTS / 'build_netlify.py'

with tempfile.TemporaryDirectory(prefix='placurso-phase4-guard-') as temp:
    engine = Path(temp) / 'psico-engine.js'
    engine.write_text("var shell = '.plc-community-shell';\n", encoding='utf-8')
    result = subprocess.run([sys.executable, str(PATCH), str(engine)], cwd=ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(f'Phase 4 guard patch failed:\n{result.stdout}\n{result.stderr}')
    generated = engine.read_text(encoding='utf-8')
    required = [
        'PLACURSO_PHASE4_PUBLIC_GUARD_V1',
        'plc-legacy-student-hidden',
        'Aprender com o ANNAN',
        'A tua evolução fica visível',
        'Web3-Native Marketing Hub',
        'aads.com',
        'isAAdsElement',
        'PlacursoCommunityAccess',
        'canEnterStudent',
        'Laboratório de decisão',
        'Reflexo rápido',
        'Decisão financeira',
        'Mini negócio',
        'MutationObserver',
    ]
    missing = [x for x in required if x.lower() not in generated.lower()]
    if missing:
        raise SystemExit('RED: Missing Phase 4 guard tokens: ' + ', '.join(missing))
    forbidden = ['a[href*="aads.com"]', 'a[href*="a-ads.com"]', "indexOf('ads.')"]
    present = [x for x in forbidden if x in generated]
    if present:
        raise SystemExit('RED: A-Ads preservation violated by broad selector/rule: ' + ', '.join(present))
    subprocess.run(['node', '--check', str(engine)], cwd=ROOT, check=True)

builder = BUILDER.read_text(encoding='utf-8')
if 'patch_phase4_public_guard.py' not in builder:
    raise SystemExit('Phase 4 guard is not included in build_netlify.py.')
if builder.index('PATCH_COMMUNITY') > builder.index('PATCH_PHASE4_GUARD'):
    raise SystemExit('Phase 4 guard must run after community flow.')

print('OK: Phase 4 public guard composes into valid JavaScript.')
print('OK: visitor guard covers legacy student/game surfaces and selected external ads.')
print('OK: A-Ads remains explicitly exempt from ad cleanup.')
print('OK: build order runs the guard after the community flow.')
