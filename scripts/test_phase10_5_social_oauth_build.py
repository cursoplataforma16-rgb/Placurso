from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))


def test_ceo_builder_includes_social_oauth_patch():
    build = (ROOT / "scripts/build_netlify.py").read_text(encoding="utf-8")
    assert 'run_python("patch_placurso_social_integrations.py", str(PUBLIC))' in build
    assert 'node", "--check", str(PUBLIC / "placurso-social-integrations.js")' in build


def test_growth_client_exposes_authenticated_social_methods_without_secrets():
    client = (ROOT / "scripts/annan_growth_client.js").read_text(encoding="utf-8")
    for marker in (
        "startSocialOAuth",
        "startWhatsAppSignup",
        "completeWhatsAppSignup",
        "disconnectSocialAccount",
        "annan-social-oauth",
        "PlacursoAnnanIntegrationGateway",
    ):
        assert marker in client, f"missing social client method or boundary: {marker}"
    lower = client.lower()
    for forbidden in (
        "service_role",
        "supabase_secret_keys",
        "supabase_service_role_key",
        "access_token",
        "client_secret",
        "refresh_token",
    ):
        assert forbidden not in lower, f"social browser client contains secret marker: {forbidden}"


def test_social_ui_uses_the_real_supported_provider_flows():
    ui = ROOT / "scripts/placurso_social_integrations.js"
    source = ui.read_text(encoding="utf-8")
    for marker in (
        "Facebook Pages",
        "Instagram profissional",
        "WhatsApp Business",
        "YouTube",
        "startSocialOAuth('meta')",
        "startSocialOAuth('youtube')",
        "startWhatsAppSignup",
        "completeWhatsAppSignup",
        "disconnectSocialAccount",
        "WA_EMBEDDED_SIGNUP",
        "waba_id",
        "phone_number_id",
        "authorizationUrl",
    ):
        assert marker in source, f"missing social UI feature: {marker}"
    assert "sessionInfoVersion" not in source, "Embedded Signup v4 must not use the retired v2/v3 sessionInfoVersion option"
    assert "response_type: 'code'" in source
    assert "override_default_response_type: true" in source


def test_ceo_injection_is_idempotent_and_has_script_and_mount():
    with TemporaryDirectory() as folder:
        public = Path(folder)
        scripts = public / "scripts"
        scripts.mkdir()
        (public / "ceo.html").write_text(
            '<html><head><script src="/placurso-growth-center.js"></script></head>'
            '<body><div id="growth"></div>'
            "<script>async function render(){window.renderPlacursoGrowthCenter($('growth'));</script></body></html>",
            encoding="utf-8",
        )
        (scripts / "placurso_social_integrations.js").write_text(
            (ROOT / "scripts/placurso_social_integrations.js").read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        patcher = ROOT / "scripts/patch_placurso_social_integrations.py"
        subprocess.run(
            ["python3", str(patcher), str(public)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        # Run twice to prove it does not inject a second copy.
        subprocess.run(
            ["python3", str(patcher), str(public)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        html = (public / "ceo.html").read_text(encoding="utf-8")
        assert html.count('src="/placurso-social-integrations.js"') == 1
        assert html.count('id="social-integrations"') == 1
        assert html.count("PlacursoSocialIntegrations.render") == 1
        assert "\n    if(window.PlacursoSocialIntegrations" in html
        assert (public / "placurso-social-integrations.js").is_file()


if __name__ == "__main__":
    test_ceo_builder_includes_social_oauth_patch()
    test_growth_client_exposes_authenticated_social_methods_without_secrets()
    test_social_ui_uses_the_real_supported_provider_flows()
    test_ceo_injection_is_idempotent_and_has_script_and_mount()
    print("Phase 10.5 social OAuth build contract: PASS")
