from pathlib import Path

PATCH = Path("scripts/patch_phase4_public_guard.py").read_text(encoding="utf-8")
SCRIPT = PATCH.split("script=r'''", 1)[1].split("'''", 1)[0]


def test_a_ads_are_explicitly_exempted_from_public_ad_cleanup():
    assert "function isAAdsElement(el)" in SCRIPT
    assert "a-?ads\\\\.com" in SCRIPT
    assert "if(isAAdsElement(el)) return;" in SCRIPT
    assert "if(!isAAdsElement(target))" in SCRIPT
    assert 'a[href*="aads.com"]' not in SCRIPT
    assert 'a[href*="a-ads.com"]' not in SCRIPT
    assert "indexOf('ads.')" not in SCRIPT
    assert "'Advertise here'" not in SCRIPT


def test_other_existing_public_ad_cleanup_remains_in_place():
    for token in ["maads.com", "slise.xyz", "Anuncie neste espaço publicitário",
                  "Obtenha uma conta Visa", "Obtain a Visa account"]:
        assert token in SCRIPT, f"expected existing cleanup rule to remain: {token}"


if __name__ == "__main__":
    test_a_ads_are_explicitly_exempted_from_public_ad_cleanup()
    test_other_existing_public_ad_cleanup_remains_in_place()
    print("A-ADS preservation and remaining public ad cleanup: PASS")
