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

# Regression test: the OAuth callback returns to /cursos?aprender=1.
import subprocess
import tempfile
from patch_placurso_seo_function import SEO_FUNCTION


def test_exact_courses_route_serves_the_app_without_self_redirect():
    with tempfile.TemporaryDirectory() as directory:
        function_path = Path(directory) / "seo.mjs"
        runner_path = Path(directory) / "check-course-route.mjs"
        function_path.write_text(SEO_FUNCTION, encoding="utf-8")
        runner_path.write_text(
            r"""
import { pathToFileURL } from "node:url";

globalThis.fetch = async (input) => {
  const url = new URL(String(input));
  if (url.pathname !== "/index.html") {
    throw new Error("Unexpected SEO function fetch: " + url.pathname);
  }
  return new Response(
    '<!doctype html><html><head><title>Old</title><meta name="description" content="Old"></head><body>Placurso home</body></html>',
    { status: 200, headers: { "content-type": "text/html" } },
  );
};

const { default: handler } = await import(pathToFileURL(process.argv[2]).href);
const response = await handler(new Request("https://placurso.netlify.app/cursos?aprender=1"));
if (response.status !== 200 || response.headers.has("location")) {
  throw new Error("Expected a direct 200 response for /cursos, got "
    + response.status + " location=" + response.headers.get("location"));
}
if (!(await response.text()).includes("Placurso — aprender, aplicar e crescer")) {
  throw new Error("The /cursos route did not render the Placurso home page");
}
""",
            encoding="utf-8",
        )
        result = subprocess.run(
            ["node", str(runner_path), str(function_path)],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr or result.stdout


if __name__ == "__main__":
    for test in (
        test_growth_client_and_panel_are_copied_as_ceo_only_assets,
        test_growth_ui_uses_authenticated_annangrowth_contract,
        test_provider_channels_remain_disconnected_until_oauth_phase,
        test_exact_courses_route_serves_the_app_without_self_redirect,
    ):
        test()
    print("Phase 10.2 Growth Center build integration: PASS")
