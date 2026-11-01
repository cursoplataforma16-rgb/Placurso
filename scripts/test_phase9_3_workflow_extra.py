from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def test_phase9_3_source_exists():
    source=(ROOT/'scripts/annan_autonomous_workflow.js').read_text(encoding='utf-8')
    assert 'PlacursoAnnanAutonomousWorkflow' in source
    assert 'approval_required' in source
    assert 'verified' in source
