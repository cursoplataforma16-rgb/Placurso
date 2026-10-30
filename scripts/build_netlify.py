from pathlib import Path
from zipfile import ZipFile
import shutil

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / 'placurso-site-root.zip'
WORK = ROOT / '.site-extracted'
PUBLIC = ROOT / 'public'
OVERRIDE = ROOT / 'scripts' / 'psico-engine-v4.js'

if not ARCHIVE.exists():
    raise SystemExit('ERRO: placurso-site-root.zip não encontrado.')
if WORK.exists(): shutil.rmtree(WORK)
if PUBLIC.exists(): shutil.rmtree(PUBLIC)
WORK.mkdir()
PUBLIC.mkdir()

with ZipFile(ARCHIVE) as z:
    z.extractall(WORK)

if OVERRIDE.exists():
    target = WORK / 'psico-engine.js'
    shutil.copy2(OVERRIDE, target)
    public_target = WORK / 'public' / 'psico-engine.js'
    if public_target.parent.exists():
        shutil.copy2(OVERRIDE, public_target)

for item in WORK.iterdir():
    if item.name in {'public', '.site-extracted', 'netlify.toml'}:
        continue
    target = PUBLIC / item.name
    if item.is_dir(): shutil.copytree(item, target)
    else: shutil.copy2(item, target)

print(f'OK: {sum(1 for x in PUBLIC.rglob("*") if x.is_file())} ficheiros preparados.')
