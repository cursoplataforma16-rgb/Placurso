from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'scripts' / 'build_netlify.py'
WORKFLOW = ROOT / 'scripts' / 'annan_autonomous_workflow.js'


def test_build_script_integrates_phase9_3_once():
    build = BUILD.read_text(encoding='utf-8')
    source = WORKFLOW.read_text(encoding='utf-8')
    assert 'CORE_AUTONOMOUS_WORKFLOW' in build
    assert 'PLACURSO_ANNAN_AUTONOMOUS_WORKFLOW' in build
    assert 'PlacursoAnnanAutonomousWorkflow' in source
    assert build.count('CORE_AUTONOMOUS_WORKFLOW') == 2
    assert build.count('PLACURSO_ANNAN_AUTONOMOUS_WORKFLOW') == 2


def test_build_preserves_previous_annan_capabilities_and_aads():
    build = BUILD.read_text(encoding='utf-8')
    for marker in [
        'CORE_PRODUCT_FACTORY',
        'CORE_INTEGRATION_GATEWAY',
        'CORE_EXECUTION_ENGINE',
        'CORE_EXECUTION_GATEWAY_ADAPTER',
        'PATCH_PHASE4_GUARD',
    ]:
        assert marker in build
    assert 'A-Ads' in build or 'A-Ads' in (ROOT / 'scripts' / 'patch_phase4_public_guard.py').read_text(encoding='utf-8')
