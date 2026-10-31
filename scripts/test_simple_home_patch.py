from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
build = (ROOT / 'scripts' / 'build_netlify.py').read_text(encoding='utf-8')
patch = (ROOT / 'scripts' / 'patch_simple_home.py').read_text(encoding='utf-8')

assert 'PATCH_SIMPLE_HOME' in build
assert "subprocess.run(['python3', str(PATCH_SIMPLE_HOME), str(engine)]" in build
assert build.index('PATCH_PHASE3D') < build.index('PATCH_SIMPLE_HOME')
assert 'PLACURSO_PHASE3D_ANNAN_PROFILE' in patch
assert 'PLACURSO_SIMPLE_HOME_V1' in patch
for text in [
    'Olá. Vamos descobrir o teu próximo nível.',
    'Continuar desafio',
    'Desafio de hoje',
    'A minha evolução',
    'Escolhe uma habilidade',
    'Dinheiro / Trade',
    'window.PlacursoAnnanProfileCore',
    'placurso:progress',
]:
    assert text in patch, f'missing required UI/bridge text: {text}'
assert 'DIONUEL' not in patch
assert 'Kunica' not in patch
print('PASS: simple home patch composition and guard checks')
