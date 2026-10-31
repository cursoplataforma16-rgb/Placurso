import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PATCHER = ROOT / "scripts" / "patch_phase4_public_guard.py"


def run_patch(source: str) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        target = Path(tmp) / "engine.js"
        target.write_text(source, encoding="utf-8")
        subprocess.run(["python3", str(PATCHER), str(target)], check=True, cwd=ROOT)
        return target.read_text(encoding="utf-8")


def test_phase4_guard_covers_observed_visa_ad_surface() -> None:
    output = run_patch("console.log('placurso');")
    assert "Obtenha uma conta Visa" in output
    assert "Obtain a Visa account" in output
    assert "aads.com" in output
    assert "maads.com" in output
    assert "slise.xyz" in output


if __name__ == "__main__":
    test_phase4_guard_covers_observed_visa_ad_surface()
    print("PASS: Phase 4 advertising regression")
