from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
PATCHES = [
    SCRIPTS / "patch_phase3c_crypto_games.py",
    SCRIPTS / "patch_phase3d_annan_profile.py",
]

with tempfile.TemporaryDirectory(prefix="placurso-phase3d-") as temp:
    engine = Path(temp) / "psico-engine.js"
    engine.write_text(
        "var hubSelector = '.pch-games-hub';\n"
        "/* PLACURSO_PHASE3B_TRADE_EDUCATION */\n",
        encoding="utf-8",
    )

    for patch in PATCHES:
        result = subprocess.run(
            [sys.executable, str(patch), str(engine)],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise SystemExit(
                f"Patch failed: {patch.name}\n"
                f"stdout:\n{result.stdout}\n"
                f"stderr:\n{result.stderr}"
            )
        if patch.name == "patch_phase3c_crypto_games.py":
            after = engine.read_text(encoding="utf-8")
            marker = "PLACURSO_PHASE3C_CRYPTO_GAMES"
            if marker not in after:
                raise SystemExit(
                    "Phase 3C patch returned success but did not write its marker.\n"
                    f"stdout:\n{result.stdout}\n"
                    f"tail:\n{after[-1200:]}"
                )

    generated = engine.read_text(encoding="utf-8")
    required = [
        "PLACURSO_PHASE3B_TRADE_EDUCATION",
        "PLACURSO_CRYPTO_PROGRESS_CORE",
        "PLACURSO_PHASE3C_CRYPTO_GAMES",
        "PLACURSO_ANNAN_PROFILE_CORE",
        "PLACURSO_PHASE3D_ANNAN_PROFILE",
        "placurso_crypto_learning_v2",
        "placurso_annan_profile_v1",
        "placurso:progress",
    ]
    missing = [token for token in required if token not in generated]
    if missing:
        raise SystemExit("Missing generated engine markers: " + ", ".join(missing))

    for marker in [
        "/* PLACURSO_CRYPTO_PROGRESS_CORE */",
        "/* PLACURSO_PHASE3C_CRYPTO_GAMES */",
        "/* PLACURSO_ANNAN_PROFILE_CORE */",
        "/* PLACURSO_PHASE3D_ANNAN_PROFILE */",
    ]:
        if generated.count(marker) != 1:
            raise SystemExit("Expected exactly one marker: " + marker)

    subprocess.run(["node", "--check", str(engine)], cwd=ROOT, check=True)

phase3a = (SCRIPTS / "patch_phase3a_games.py").read_text(encoding="utf-8")
if "placurso:progress" not in phase3a or "source:'phase3a'" not in phase3a:
    raise SystemExit("Phase 3A progress event bridge is missing.")

builder = (SCRIPTS / "build_netlify.py").read_text(encoding="utf-8")
if builder.index("if PATCH_PHASE3C_CRYPTO.exists()") > builder.index("if PATCH_PHASE3D.exists()"):
    raise SystemExit("Phase 3D must run after Phase 3C in the build chain.")
if "patch_phase3d_annan_profile.py" not in builder:
    raise SystemExit("Phase 3D patch is not included in build_netlify.py.")

print("OK: Phase 3C + 3D patches compose into valid JavaScript.")
print("OK: both new modules and the shared progress event are present exactly once.")
print("OK: Phase 3A bridge and build order are correct.")
