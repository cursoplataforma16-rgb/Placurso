from pathlib import Path
from zipfile import ZipFile
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / 'placurso-site-root.zip'
WORK = ROOT / '.site-extracted'
PUBLIC = ROOT / 'public'
PATCH = ROOT / 'scripts' / 'patch_games_ui.py'

if not ARCHIVE.exists():
    raise SystemExit('ERRO: placurso-site-root.zip não encontrado.')
if WORK.exists(): shutil.rmtree(WORK)
if PUBLIC.exists(): shutil.rmtree(PUBLIC)
WORK.mkdir()
PUBLIC.mkdir()

with ZipFile(ARCHIVE) as z:
    z.extractall(WORK)

# Aplica a nova organização visual dos jogos sobre o motor existente.
engine = WORK / 'psico-engine.js'
if PATCH.exists() and engine.exists():
    subprocess.run(['python3', str(PATCH), str(engine)], cwd=ROOT, check=True)

# Se o ZIP já tiver uma cópia pública do motor, mantém a mesma versão.
public_engine = WORK / 'public' / 'psico-engine.js'
if public_engine.parent.exists() and engine.exists():
    shutil.copy2(engine, public_engine)

for item in WORK.iterdir():
    if item.name in {'public', '.site-extracted', 'netlify.toml'}:
        continue
    target = PUBLIC / item.name
    if item.is_dir(): shutil.copytree(item, target)
    else: shutil.copy2(item, target)

print(f'OK: {sum(1 for x in PUBLIC.rglob("*") if x.is_file())} ficheiros preparados.')
