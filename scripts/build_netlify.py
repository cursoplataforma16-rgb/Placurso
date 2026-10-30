from pathlib import Path
from zipfile import ZipFile
import re
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
# O ZIP é a fonte do site; a função SEO trata /cursos, /p e os sitemaps.
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

# A página principal já reconhece placurso.netlify.app e aplica a marca
# Plataforma Curso. Não deve depender da função /cursos para abrir a raiz.
redirects = PUBLIC / '_redirects'
if not redirects.is_file():
    raise SystemExit('ERRO: public/_redirects não foi preparado.')
rules = redirects.read_text(encoding='utf-8')
rules, changed = re.subn(
    r'(?m)^(https://placurso\\.netlify\\.app/)\\s+\\S+\\s+(200!?)\\s*$',
    r'\\1 /index.html \\2',
    rules
)
if changed != 1:
    raise SystemExit('ERRO: não foi possível corrigir a rota inicial exclusiva do Placurso.')
redirects.write_text(rules, encoding='utf-8')

if not (PUBLIC / 'index.html').is_file():
    raise SystemExit('ERRO: public/index.html não foi preparado.')
if not (FUNCTIONS / 'seo.mjs').is_file():
    raise SystemExit('ERRO: a função SEO não foi preparada.')

print(f'OK: {sum(1 for x in PUBLIC.rglob("*") if x.is_file())} recursos estáticos preparados.')
print('OK: / no domínio Placurso serve index.html; a página identifica o domínio e aplica a marca Plataforma Curso.')
print(f'OK: função Netlify pronta: {FUNCTIONS / "seo.mjs"}')
