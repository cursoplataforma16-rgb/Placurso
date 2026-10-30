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

# Aplica a organização visual dos jogos sobre o motor existente.
engine = WORK / 'psico-engine.js'
if PATCH.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH), str(engine)], cwd=ROOT, check=True)

# Mantém a cópia pública do motor alinhada, quando o pacote incluir uma.
public_engine = WORK / 'public' / 'psico-engine.js'
if public_engine.parent.exists() and engine.exists():
    shutil.copy2(engine, public_engine)

# O Netlify procura funções em netlify/functions na raiz do repositório.
# O ZIP é a fonte do site, por isso materializamos aqui apenas a função SEO
# responsável por servir /cursos e a página inicial da Plataforma Curso.
source_seo = WORK / 'netlify' / 'functions' / 'seo.mjs'
if not source_seo.is_file():
    raise SystemExit('ERRO: netlify/functions/seo.mjs não encontrado no pacote.')
if FUNCTIONS.exists():
    shutil.rmtree(FUNCTIONS)
FUNCTIONS.mkdir(parents=True, exist_ok=True)
shutil.copy2(source_seo, FUNCTIONS / 'seo.mjs')

# Publica os recursos estáticos, mas nunca expõe o código das funções.
for item in WORK.iterdir():
    if item.name in {'public', '.site-extracted', 'netlify.toml', 'netlify'}:
        continue
    target = PUBLIC / item.name
    if item.is_dir():
        shutil.copytree(item, target)
    else:
        shutil.copy2(item, target)

if not (PUBLIC / 'index.html').is_file():
    raise SystemExit('ERRO: public/index.html não foi preparado.')
if not (PUBLIC / '_redirects').is_file():
    raise SystemExit('ERRO: public/_redirects não foi preparado.')

print(f'OK: {sum(1 for x in PUBLIC.rglob("*") if x.is_file())} recursos estáticos preparados.')
print(f'OK: função Netlify pronta: {FUNCTIONS / "seo.mjs"}')
