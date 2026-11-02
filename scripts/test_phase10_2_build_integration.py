from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "scripts" / "build_netlify.py"
CLEAN_BUILDER = ROOT / "scripts" / "build_placurso_clean_site.py"
CLIENT = ROOT / "scripts" / "annan_growth_client.js"
PANEL = ROOT / "scripts" / "placurso-growth-center.js"
CEO_BUILDER = ROOT / "scripts" / "build_placurso_ceo_page.py"


def test_growth_client_and_panel_are_copied_as_ceo_only_assets():
    build = BUILD.read_text(encoding="utf-8")
    clean = CLEAN_BUILDER.read_text(encoding="utf-8")
    ceo = CEO_BUILDER.read_text(encoding="utf-8")
    assert "build_placurso_clean_site.py" in build
    assert "annan_growth_client.js" in clean
    assert "placurso-growth-center.js" in clean
    assert 'root.PlacursoGrowthClient' in CLIENT.read_text(encoding="utf-8")
    assert "PlacursoAnnanIntegrationGateway" in ceo
    assert "renderPlacursoGrowthCenter" in ceo


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
        test_growth_client_and_panel_are_copied_as_ceo_only_assets,
        test_growth_ui_uses_authenticated_annangrowth_contract,
        test_provider_channels_remain_disconnected_until_oauth_phase,
    ):
        test()
    print("Phase 10.2 Growth Center build integration: PASS")
