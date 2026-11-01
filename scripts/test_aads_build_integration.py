from pathlib import Path

BUILD = Path("scripts/build_netlify.py").read_text(encoding="utf-8")


def test_aads_patch_is_declared_and_applied_before_public_guard():
    assert "PATCH_AADS = ROOT / 'scripts' / 'patch_aads_unit.py'" in BUILD
    assert "PATCH_AADS" in BUILD
    assert "patch_aads_unit.py" in BUILD
    assert "PATCH_PHASE4_GUARD" in BUILD
    assert BUILD.index("patch_aads_unit.py") < BUILD.index("PATCH_PHASE4_GUARD")


def test_aads_unit_marker_is_part_of_build_contract():
    assert "PLACURSO_AADS_UNIT_2459988" in Path("scripts/patch_aads_unit.py").read_text(encoding="utf-8")


if __name__ == "__main__":
    test_aads_patch_is_declared_and_applied_before_public_guard()
    test_aads_unit_marker_is_part_of_build_contract()
    print("A-Ads build integration contract: PASS")
