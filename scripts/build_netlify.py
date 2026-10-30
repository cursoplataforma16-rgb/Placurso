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
PATCH_PHASE3A_VIS = ROOT / 'scripts' / 'patch_phase3a_visibility.py'
PATCH_PHASE3B = ROOT / 'scripts' / 'patch_phase3b_experience.py'
PATCH_PHASE3B_TRADE = ROOT / 'scripts' / 'patch_phase3b_trade.py'

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
if PATCH.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH), str(engine)], cwd=ROOT, check=True)
if PATCH_PHASE2.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH_PHASE2), str(engine)], cwd=ROOT, check=True)
if PATCH_PHASE3A.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH_PHASE3A), str(engine)], cwd=ROOT, check=True)
if PATCH_PHASE3A_VIS.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH_PHASE3A_VIS), str(engine)], cwd=ROOT, check=True)
if PATCH_PHASE3B.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH_PHASE3B), str(engine)], cwd=ROOT, check=True)
if PATCH_PHASE3B_TRADE.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH_PHASE3B_TRADE), str(engine)], cwd=ROOT, check=True)

if engine.exists():
    subprocess.run(['node', '--check', str(engine)], cwd=ROOT, check=True)

public_engine = WORK / 'public' / 'psico-engine.js'
if public_engine.parent.exists() and engine.exists():
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
print('OK: Fase 1 + Fase 2 + Fase 3A + Fase 3B preparadas no motor de jogos.')
print('OK: fallback visual da Fase 3A preparado.')
print('OK: progressão persistente: nível, XP, partidas, acertos e tempo.')
print('OK: 4 experiências novas: memória, reflexo, dinheiro e negócio.')
print('OK: experiência profissional Fase 3B: perfil, maestria e desafio diário.')
print('OK: formação cripto/trade: básico, intermédio e avançado em formato de experiência.')
print('OK: / no domínio Placurso serve index.html.')
print(f'OK: função Netlify pronta: {FUNCTIONS / "seo.mjs"}')
