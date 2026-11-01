from pathlib import Path

PATCH = Path("scripts/patch_aads_unit.py")

EXPECTED_MARKER = "PLACURSO_AADS_UNIT_2459988"
EXPECTED_UNIT = "data-aa=2459988"
EXPECTED_SRC = "//acceptable.a-ads.com/2459988/?size=Adaptive"
EXPECTED_CAMPAIGN = "https://aads.com/campaigns/new?source_id=2459988&source_type=ad_unit&partner=2459988"


def test_aads_patch_exists_and_targets_exact_unit():
    assert PATCH.is_file(), "A-Ads patch must exist"
    script = PATCH.read_text(encoding="utf-8")
    assert EXPECTED_MARKER in script
    assert EXPECTED_UNIT in script
    assert EXPECTED_SRC in script
    assert EXPECTED_CAMPAIGN in script


def test_aads_patch_does_not_remove_a_ads_domain_globally():
    script = PATCH.read_text(encoding="utf-8")
    assert "a-ads.com" in script
    assert "remove all" not in script.lower()
    assert "a[href*='a-ads.com']" not in script
    assert "a[href*=\"a-ads.com\"]" not in script


if __name__ == "__main__":
    test_aads_patch_exists_and_targets_exact_unit()
    test_aads_patch_does_not_remove_a_ads_domain_globally()
    print("A-Ads unit 2459988 contract: PASS")
