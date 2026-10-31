from pathlib import Path
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parent.parent
S=ROOT/'scripts'
with tempfile.TemporaryDirectory(prefix='placurso-community-') as temp:
    engine=Path(temp)/'psico-engine.js'
    engine.write_text("var hubSelector='.pch-games-hub';\n/* PLACURSO_PHASE3B_TRADE_EDUCATION */\n",encoding='utf-8')
    for name in ['patch_phase3c_crypto_games.py','patch_phase3d_annan_profile.py']:
        r=subprocess.run([sys.executable,str(S/name),str(engine)],cwd=ROOT,capture_output=True,text=True)
        if r.returncode:
            raise SystemExit(f'{name} failed:\n{r.stdout}\n{r.stderr}')
    for name in ['community_access_core.js','psychotechnical_core.js','bible_learning_core.js']:
        engine.write_text(engine.read_text(encoding='utf-8')+'\n'+(S/name).read_text(encoding='utf-8'),encoding='utf-8')
    r=subprocess.run([sys.executable,str(S/'patch_community_flow.py'),str(engine)],cwd=ROOT,capture_output=True,text=True)
    if r.returncode:
        raise SystemExit(f'community patch failed:\n{r.stdout}\n{r.stderr}')
    subprocess.run(['node','--check',str(engine)],cwd=ROOT,check=True)
    generated=engine.read_text(encoding='utf-8')
    for marker in ['PLACURSO_PHASE3C_CRYPTO_GAMES','PLACURSO_PHASE3D_ANNAN_PROFILE','PLACURSO_ANNAN_LEARNING_CORE','PLACURSO_COMMUNITY_FUNCTIONAL_FLOW_V1','PlacursoCommunityAccess','PlacursoPsychotechnical','PlacursoBibleLearning','Área de Aluno','Centro de Desafios']:
        if marker not in generated: raise SystemExit('Missing marker: '+marker)
    for event_marker in ["source:'psychotechnical'", "source:'bible'", "placurso_bible_progress_v1"]:
        if event_marker not in generated: raise SystemExit('Missing ANNAN learning event integration: '+event_marker)
    if generated.count('PLACURSO_COMMUNITY_FUNCTIONAL_FLOW_V1')!=1: raise SystemExit('Community marker duplicated.')
print('OK: community flow composes with Phase 3C/3D and passes Node syntax.')
