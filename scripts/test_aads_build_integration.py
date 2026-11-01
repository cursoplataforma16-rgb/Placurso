from pathlib import Path

BUILD = Path("scripts/build_netlify.py").read_text(encoding="utf-8")


def test_aads_patch_is_declared_and_applied_to_html():
    assert "PATCH_AADS = ROOT / 'scripts' / 'patch_aads_unit.py'" in BUILD
    assert "site_html = WORK / 'index.html'" in BUILD
    assert "subprocess.run(['python3', str(PATCH_AADS), str(site_html)]" in BUILD
    assert "PATCH_PHASE4_GUARD" in BUILD


def test_aads_unit_marker_is_part_of_build_contract():
    assert "PLACURSO_AADS_UNIT_2459988" in Path("scripts/patch_aads_unit.py").read_text(encoding="utf-8")


if __name__ == "__main__":
    test_aads_patch_is_declared_and_applied_to_html()
    test_aads_unit_marker_is_part_of_build_contract()
    print("A-Ads build integration contract: PASS")
