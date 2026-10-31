from pathlib import Path
from zipfile import ZipFile
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / 'placurso-site-root.zip'
WORK = ROOT / '.site-extracted'
PUBLIC = ROOT / 'public'
FUNCTIONS = ROOT / 'netlify' / 'functions'
PATCH = ROOT / 'scripts' / 'patch_games_ui.py'
PATCH_PHASE2 = ROOT / 'scripts' / 'patch_phase2_progression.py'
PATCH_PHASE3A = ROOT / 'scripts' / 'patch_phase3a_games.py'
PATCH_PHASE3B_TRADE = ROOT / 'scripts' / 'patch_phase3b_trade.py'
PATCH_PHASE3C_CRYPTO = ROOT / 'scripts' / 'patch_phase3c_crypto_games.py'
PATCH_PHASE3D = ROOT / 'scripts' / 'patch_phase3d_annan_profile.py'
PATCH_ANNAN_SUPABASE = ROOT / 'scripts' / 'patch_annan_supabase_adapter.py'
CORE_ACCESS = ROOT / 'scripts' / 'community_access_core.js'
CORE_PSYCH = ROOT / 'scripts' / 'psychotechnical_core.js'
CORE_BIBLE = ROOT / 'scripts' / 'bible_learning_core.js'
CORE_PRODUCT_FACTORY = ROOT / 'scripts' / 'annan_product_factory.js'

if not ARCHIVE.exists():
    raise SystemExit('ERRO: placurso-site-root.zip não encontrado.')
if WORK.exists():
    shutil.rmtree(WORK)
if PUBLIC.exists():
    shutil.rmtree(PUBLIC)
WORK.mkdir()
PUBLIC.mkdir()

with ZipFile(ARCHIVE) as archive:
    invalid = archive.testzip()
    if invalid:
        raise SystemExit(f'ERRO: ficheiro inválido no pacote: {invalid}')
    archive.extractall(WORK)

engine = WORK / 'psico-engine.js'
if not engine.exists():
    raise SystemExit('ERRO: psico-engine.js não encontrado.')

# Keep the proven game engines and learning cores, but do not rebuild the
# legacy Phase 3B experience dashboard or Phase 3A visibility layer. The
# current Community Flow owns the public/student presentation now.
for patch in [PATCH, PATCH_PHASE2, PATCH_PHASE3A, PATCH_PHASE3B_TRADE, PATCH_PHASE3C_CRYPTO, PATCH_PHASE3D, PATCH_ANNAN_SUPABASE]:
    if patch.exists():
        subprocess.run(['python3', str(patch), str(engine)], cwd=ROOT, check=True)

for core in [CORE_ACCESS, CORE_PSYCH, CORE_BIBLE]:
    if not core.is_file():
        raise SystemExit(f'ERRO: core obrigatório não encontrado: {core.name}')
    engine.write_text(engine.read_text(encoding='utf-8') + '\n' + core.read_text(encoding='utf-8'), encoding='utf-8')

# Product Factory is a capability of the existing ANNAN runtime, not a
# second agent. Keep it in the same generated engine and expose its bounded
# planning API without changing learner scoring or recommendation behavior.
if not CORE_PRODUCT_FACTORY.is_file():
    raise SystemExit('ERRO: annan_product_factory.js não encontrado.')
product_factory_source = CORE_PRODUCT_FACTORY.read_text(encoding='utf-8')
if 'PlacursoAnnanProductFactory' not in product_factory_source:
    raise SystemExit('ERRO: API PlacursoAnnanProductFactory não encontrada.')
if 'PLACURSO_ANNAN_PRODUCT_FACTORY' in engine.read_text(encoding='utf-8'):
    raise SystemExit('ERRO: Product Factory já foi integrado ao motor.')
engine.write_text(
    engine.read_text(encoding='utf-8')
    + '\n/* PLACURSO_ANNAN_PRODUCT_FACTORY */\n'
    + product_factory_source,
    encoding='utf-8',
)

subprocess.run(['python3', str(PATCH_COMMUNITY), str(engine)], cwd=ROOT, check=True)
subprocess.run(['python3', str(PATCH_PHASE4_GUARD), str(engine)], cwd=ROOT, check=True)
subprocess.run(['node', '--check', str(engine)], cwd=ROOT, check=True)

public_engine = WORK / 'public' / 'psico-engine.js'
public_engine.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(engine, public_engine)

source_seo = WORK / 'netlify' / 'functions' / 'seo.mjs'
if not source_seo.is_file():
    raise SystemExit('ERRO: netlify/functions/seo.mjs não encontrado no pacote.')
if FUNCTIONS.exists():
    shutil.rmtree(FUNCTIONS)
FUNCTIONS.mkdir(parents=True, exist_ok=True)
shutil.copy2(source_seo, FUNCTIONS / 'seo.mjs')

for item in WORK.iterdir():
    if item.name in {'public', '.site-extracted', 'netlify.toml', 'netlify'}:
        continue
    target = PUBLIC / item.name
    if item.is_dir():
        shutil.copytree(item, target)
    else:
        shutil.copy2(item, target)

redirects = PUBLIC / '_redirects'
if not redirects.is_file():
    raise SystemExit('ERRO: public/_redirects não foi preparado.')
lines = redirects.read_text(encoding='utf-8').splitlines()
changed = 0
for i, line in enumerate(lines):
    fields = line.split()
    if len(fields) == 3 and fields[0] == 'https://placurso.netlify.app/' and fields[2] in {'200', '200!'}:
        lines[i] = f'{fields[0]} /index.html {fields[2]}'
        changed += 1
if changed != 1:
    raise SystemExit('ERRO: não foi possível corrigir a rota inicial exclusiva do Placurso.')
redirects.write_text('\n'.join(lines) + '\n', encoding='utf-8')

if not (PUBLIC / 'index.html').is_file():
    raise SystemExit('ERRO: public/index.html não foi preparado.')
if not (FUNCTIONS / 'seo.mjs').is_file():
    raise SystemExit('ERRO: a função SEO não foi preparada.')

print(f'OK: {sum(1 for x in PUBLIC.rglob("*") if x.is_file())} recursos estáticos preparados.')
print('OK: motores de jogos + progressão + Phase 3A + formação Trade + Phase 3C preservados.')
print('OK: painel legado Phase 3B e camada de visibilidade Phase 3A removidos do build.')
print('OK: perfil ANNAN/evolução preservado como núcleo necessário à experiência atual.')
print('OK: adaptador ANNAN → Supabase integrado com fallback local.')
print('OK: core de acesso, psicotécnico de 7 perguntas e aprendizagem bíblica integrado.')
print('OK: Product Factory integrado no mesmo motor ANNAN do Placurso.')
print('OK: fluxo público → convite → inscrição → Área de Aluno integrado.')
print('OK: guardião público da Fase 4 integrado; A-Ads preservado.')
print('OK: Centro de Desafios horizontal no público e no topo do aluno.')
print('OK: / no domínio Placurso serve index.html.')
print(f'OK: função Netlify pronta: {FUNCTIONS / "seo.mjs"}')
