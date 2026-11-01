from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "scripts" / "build_netlify.py"
PATCH = ROOT / "scripts" / "patch_annan_growth_assets.py"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
PANEL = ROOT / "scripts" / "placurso-growth-center.js"


def test_growth_client_is_copied_and_loaded_before_the_growth_panel():
    patch = PATCH.read_text(encoding="utf-8")
    assert "annan_growth_client.js" in patch
    assert "growth_client_tag" in patch
    assert 'root.PlacursoGrowthClient' in CLIENT.read_text(encoding="utf-8")
    assert "placurso-growth-center.js" in patch
    assert "PATCH_ANNAN_GROWTH_ASSETS" in BUILD.read_text(encoding="utf-8")


def test_growth_ui_uses_authenticated_annangrowth_contract():
    client = CLIENT.read_text(encoding="utf-8")
    panel = PANEL.read_text(encoding="utf-8")
    for marker in (
        "PlacursoAnnanPersistence",
        "getCurrentUser",
        "getClient",
        "functions.invoke('annan-growth'",
        "requestId",
    ):
        assert marker in client, f"missing authenticated client behavior: {marker}"
    for marker in (
        "Gestão ANNAN",
        "createCampaign",
        "createContent",
        "submitContent",
        "decideApproval",
        "setManagementEnabled(false)",
        "Nenhuma publicação externa",
    ):
        assert marker in panel, f"missing Growth Center flow: {marker}"


def test_provider_channels_remain_disconnected_until_oauth_phase():
    panel = PANEL.read_text(encoding="utf-8")
    assert "Ainda não ligado" in panel
    assert "As métricas só surgirão" in panel
    assert "Contas ligadas:" in panel


if __name__ == "__main__":
    for test in (
        test_growth_client_is_copied_and_loaded_before_the_growth_panel,
        test_growth_ui_uses_authenticated_annangrowth_contract,
        test_provider_channels_remain_disconnected_until_oauth_phase,
    ):
        test()
    print("Phase 10.2 Growth Center build integration: PASS")
