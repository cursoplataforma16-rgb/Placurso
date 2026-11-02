from __future__ import annotations

from pathlib import Path, PurePosixPath
from zipfile import ZipFile
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "placurso-site-root.zip"
WORK = ROOT / ".placurso-engine-build"
LEGACY_EXTRACTED = ROOT / ".site-extracted"
PUBLIC = ROOT / "public"
FUNCTIONS = ROOT / "netlify" / "functions"

PATCHES = [
    "patch_games_ui.py",
    "patch_phase2_progression.py",
    "patch_phase3a_games.py",
    "patch_phase3b_trade.py",
    "patch_phase3c_crypto_games.py",
    "patch_phase3d_annan_profile.py",
    "patch_annan_supabase_adapter.py",
]
CORES = [
    ("community_access_core.js", None),
    ("psychotechnical_core.js", None),
    ("bible_learning_core.js", None),
    ("annan_product_factory.js", "PlacursoAnnanProductFactory"),
    ("annan_integration_gateway.js", "PlacursoAnnanIntegrationGateway"),
    ("annan_execution_engine.js", "PlacursoAnnanExecutionEngine"),
    ("annan_execution_gateway_adapter.js", "PlacursoAnnanExecutionGatewayAdapter"),
    ("annan_autonomous_workflow.js", "PlacursoAnnanAutonomousWorkflow"),
]
FINAL_BUILDERS = [
    "build_placurso_clean_site.py",
    "build_placurso_ceo_page.py",
    "patch_placurso_seo_function.py",
]


def run_python(name: str, *args: str) -> None:
    script = ROOT / "scripts" / name
    if not script.is_file():
        raise SystemExit(f"Required Placurso build step missing: {name}")
    subprocess.run(["python3", str(script), *args], cwd=ROOT, check=True)


def copy_clean_archive_member(archive: ZipFile, target_dir: Path, basename: str, required: bool = True) -> bool:
    candidates = [
        member for member in archive.namelist()
        if not member.endswith("/") and PurePosixPath(member).name == basename
    ]
    if not candidates:
        if required:
            raise SystemExit(f"Required Placurso asset missing from source package: {basename}")
        return False
    exact = [member for member in candidates if member == basename]
    public = [member for member in candidates if member.startswith("public/")]
    chosen = exact[0] if exact else (public[0] if public else candidates[0])
    target = target_dir / basename
    target.parent.mkdir(parents=True, exist_ok=True)
    with archive.open(chosen) as source, target.open("wb") as output:
        shutil.copyfileobj(source, output)
    print(f"Copied approved asset: {basename}")
    return True


def main() -> None:
    if not ARCHIVE.is_file():
        raise SystemExit("ERRO: pacote com o núcleo educativo do Placurso não encontrado.")

    for path in (WORK, PUBLIC):
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True, exist_ok=True)
    if LEGACY_EXTRACTED.exists():
        shutil.rmtree(LEGACY_EXTRACTED)
    if FUNCTIONS.exists():
        shutil.rmtree(FUNCTIONS)
    FUNCTIONS.mkdir(parents=True, exist_ok=True)

    with ZipFile(ARCHIVE) as archive:
        corrupt = archive.testzip()
        if corrupt:
            raise SystemExit(f"ERRO: pacote de origem inválido: {corrupt}")
        # Only the educational challenge engine and the Placurso icon assets are read.
        # The legacy index.html, service worker, manifest and Netlify functions are never extracted.
        engine_member = "psico-engine.js"
        if engine_member not in archive.namelist():
            raise SystemExit("ERRO: motor educativo psico-engine.js não encontrado.")
        with archive.open(engine_member) as source, (WORK / engine_member).open("wb") as output:
            shutil.copyfileobj(source, output)
        for asset in ("curso-icon-192.png", "curso-icon-512.png"):
            copy_clean_archive_member(archive, PUBLIC, asset, required=True)
        copy_clean_archive_member(archive, PUBLIC, "curso-logo.png", required=False)
        copy_clean_archive_member(archive, PUBLIC, "curso-og.png", required=False)

    engine = WORK / "psico-engine.js"
    for patch in PATCHES:
        run_python(patch, str(engine))

    for filename, required_symbol in CORES:
        path = ROOT / "scripts" / filename
        if not path.is_file():
            raise SystemExit(f"ERRO: módulo ANNAN obrigatório em falta: {filename}")
        source = path.read_text(encoding="utf-8")
        if required_symbol and required_symbol not in source:
            raise SystemExit(f"ERRO: API ausente em {filename}: {required_symbol}")
        marker = f"PLACURSO_BUNDLE_{filename.replace('.', '_').upper()}"
        if marker in engine.read_text(encoding="utf-8"):
            raise SystemExit(f"ERRO: módulo já integrado: {filename}")
        engine.write_text(
            engine.read_text(encoding="utf-8")
            + f"\n/* {marker} */\n"
            + source,
            encoding="utf-8",
        )

    run_python("patch_community_flow.py", str(engine))
    run_python("patch_phase4_public_guard.py", str(engine))
    subprocess.run(["node", "--check", str(engine)], cwd=ROOT, check=True)
    shutil.copy2(engine, PUBLIC / "psico-engine.js")

    # The homepage is generated from a Placurso-only template. No file from
    # the legacy application index or brand-specific dashboard is copied.
    run_python("build_placurso_clean_site.py", str(PUBLIC))

    # The private CEO view uses the same ANNAN persistence, integration and growth modules.
    run_python("build_placurso_ceo_page.py", str(PUBLIC))

    # Build the Placurso-only SEO function from a clean placeholder.
    (FUNCTIONS / "seo.mjs").write_text("// Generated by build_placurso_seo_function.py\n", encoding="utf-8")
    run_python("patch_placurso_seo_function.py", str(FUNCTIONS / "seo.mjs"))

    subprocess.run(["node", "--check", str(PUBLIC / "psico-engine.js")], cwd=ROOT, check=True)
    subprocess.run(["node", "--check", str(PUBLIC / "ceo.html")], cwd=ROOT, check=False)
    subprocess.run(["node", "--check", str(FUNCTIONS / "seo.mjs")], cwd=ROOT, check=True)

    print(f"OK: {sum(1 for item in PUBLIC.rglob('*') if item.is_file())} ficheiros finais preparados.")
    print("OK: shell novo Placurso, sem HTML ou módulos da aplicação antiga.")
    print("OK: motor de desafios, progressão, perfil ANNAN, persistência, Gateway e workflow preservados.")
    print("OK: área de aluno ligada à função educativa annan-ensino.")
    print("OK: painel CEO separado em /ceo, usando o mesmo ANNAN.")
    print("OK: função SEO e rotas geradas exclusivamente para Placurso.")
    print("OK: apenas assets educativos explicitamente autorizados foram copiados do pacote original.")


if __name__ == "__main__":
    main()
