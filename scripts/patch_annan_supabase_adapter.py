from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker='\n/* PLACURSO_ANNAN_SUPABASE_ADAPTER_V1 */\n'
if marker in s:
    raise SystemExit('Adaptador Supabase ANNAN já aplicado.')
source = Path(__file__).with_name('annan_supabase_adapter.js')
if not source.is_file():
    raise SystemExit('ERRO: annan_supabase_adapter.js não encontrado.')
adapter = source.read_text(encoding='utf-8')
s += marker + adapter
p.write_text(s, encoding='utf-8')
print('OK: adaptador de persistência Supabase do ANNAN integrado.')
