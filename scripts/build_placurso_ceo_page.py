from __future__ import annotations

from pathlib import Path
import sys


HTML = r'''<!doctype html>
<html lang="pt"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#14284b"><meta name="robots" content="noindex,nofollow">
<title>Placurso | Painel CEO</title>
<style>
:root{color-scheme:dark;--bg:#101b2e;--panel:#182944;--line:#2d4564;--text:#edf3fb;--muted:#a9bad0;--accent:#1b8a83}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--text);font:15px/1.5 Inter,system-ui,Arial,sans-serif}
.shell{width:min(1120px,100%);margin:0 auto;padding:20px 14px 50px}.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0 20px;border-bottom:1px solid var(--line);margin-bottom:20px}
.brand{display:flex;align-items:center;gap:11px;font-weight:800;letter-spacing:.08em}.brand-mark{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:var(--accent);color:white;font-size:18px}.muted{color:var(--muted)}
.panel{max-width:560px;margin:8vh auto;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--panel)}h1{font-size:26px;margin:0 0 8px}p{margin:8px 0 18px;color:var(--muted)}
button{border:0;border-radius:10px;padding:13px 16px;background:var(--accent);color:white;font-weight:750;cursor:pointer;width:100%}button:disabled{opacity:.55;cursor:wait}
.secondary{background:transparent;border:1px solid var(--line);margin-top:9px}.status{min-height:24px;margin-top:12px;font-size:13px}.hidden{display:none!important}
</style>
<script src="/vendor/supabase-js.js"></script>
<script src="/psico-engine.js"></script>
<script src="/annan_growth_client.js"></script>
<script src="/placurso-growth-center.js"></script>
</head><body><main class="shell">
<header class="top"><div class="brand"><span class="brand-mark" aria-hidden="true">P</span><span>PLACURSO <span class="muted">/ CEO</span></span></div><span class="muted">Painel privado</span></header>
<section id="login" class="panel"><h1>Painel de gestão</h1><p>Entra com a conta Google autorizada. O servidor confirma a identidade e as permissões antes de abrir a gestão.</p><button id="google">Entrar com Google</button><div id="login-status" class="status" role="status"></div></section>
<section id="denied" class="panel hidden"><h1>Acesso não autorizado</h1><p>Esta sessão não tem autorização CEO no Placurso. Termina a sessão e entra com a conta correcta.</p><button id="switch-account">Trocar de conta Google</button><button id="back" class="secondary">Voltar à plataforma</button></section>
<section id="error" class="panel hidden"><h1>Não foi possível validar a conta</h1><p id="error-message">O serviço seguro não respondeu correctamente. Nenhuma permissão foi concedida.</p><button id="retry">Tentar novamente</button><button id="error-back" class="secondary">Voltar à plataforma</button></section>
<section id="dashboard" class="hidden"><div class="top"><div><h1 style="margin:0">Painel CEO</h1><span class="muted">ANNAN · gestão, crescimento e aprovação</span></div><button id="logout" style="width:auto">Terminar sessão</button></div><div id="growth"></div></section>
</main>
<script>
(async function(){
'use strict';
const $=id=>document.getElementById(id), sections=['login','denied','error','dashboard'];
const show=name=>sections.forEach(id=>$(id).classList.toggle('hidden',id!==name));
let client=null,busy=false,lastUserId='';
function message(value){$('login-status').textContent=value||'';}
function parseError(value){return {code:String(value&&value.error&&value.error.code||''),message:String(value&&value.error&&value.error.message||'')};}
async function initClient(){
  const p=window.PlacursoAnnanPersistence;
  if(!p||typeof p.getClient!=='function'||typeof p.getCurrentUser!=='function')throw new Error('O runtime central do ANNAN não ficou disponível.');
  client=await p.getClient();
  if(!window.PlacursoAnnanIntegrationGateway||!window.PlacursoGrowthClient||typeof window.renderPlacursoGrowthCenter!=='function')throw new Error('Os módulos de gestão do ANNAN não ficaram disponíveis.');
  return p;
}
async function validateAndOpen(){
  if(busy)return;busy=true;show('login');$('google').disabled=true;message('A confirmar a sessão Google e as permissões no servidor…');
  try{
    const p=await initClient(),current=await p.getCurrentUser();
    if(!current||!current.ok||!current.user){message('Entra com Google para continuar.');return;}
    if(lastUserId===current.user.id&&!$('dashboard').classList.contains('hidden'))return;
    const response=await client.functions.invoke('annan-growth',{body:{operation:'ceo.bootstrap'}});
    let payload=response&&response.data;
    if(response&&response.error){
      const context=response.error.context;
      if(context&&typeof context.clone==='function'){try{payload=await context.clone().json();}catch(_){}}
      const detail=parseError(payload),status=Number(context&&context.status||0);
      if(status===403||detail.code==='forbidden'){await client.auth.signOut();show('denied');return;}
      throw new Error(detail.message||'Não foi possível validar a identidade CEO.');
    }
    if(!payload||payload.ok!==true||!payload.data||payload.data.role!=='admin'){
      const detail=parseError(payload);
      if(detail.code==='forbidden'){await client.auth.signOut();show('denied');return;}
      throw new Error(detail.message||'O servidor não confirmou as permissões administrativas.');
    }
    lastUserId=current.user.id;show('dashboard');window.renderPlacursoGrowthCenter($('growth'));
  }catch(error){$('error-message').textContent=error&&error.message?error.message:'Falha temporária de autenticação.';show('error');}
  finally{busy=false;$('google').disabled=false;}
}
$('google').addEventListener('click',async()=>{
  try{await initClient();const result=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/ceo',queryParams:{prompt:'select_account'}}});
    if(result.error)throw result.error;message('A abrir a conta Google…');
  }catch(error){message(error&&error.message?error.message:'Não foi possível abrir o Google.');}
});
$('switch-account').addEventListener('click',async()=>{try{const p=await initClient();await p.signOut();}catch(_){}lastUserId='';show('login');message('Escolhe a conta CEO autorizada.');});
$('logout').addEventListener('click',async()=>{try{const p=await initClient();await p.signOut();}catch(_){}lastUserId='';show('login');message('Sessão terminada.');});
$('retry').addEventListener('click',validateAndOpen);
$('back').addEventListener('click',()=>{location.href='/cursos';});
$('error-back').addEventListener('click',()=>{location.href='/cursos';});
try{
  const p=await initClient(),current=await p.getCurrentUser();
  if(current&&current.ok&&current.user)await validateAndOpen();else{show('login');message('');}
  client.auth.onAuthStateChange(event=>{
    if(event==='SIGNED_IN')setTimeout(validateAndOpen,0);
    if(event==='SIGNED_OUT'){lastUserId='';show('login');message('');}
  });
}catch(error){$('error-message').textContent=error&&error.message?error.message:'O runtime do ANNAN não ficou disponível.';show('error');}
})();
</script></body></html>'''


def build(public: Path) -> None:
    required = ("psico-engine.js", "annan_growth_client.js", "placurso-growth-center.js", "_redirects")
    missing = [name for name in required if not (public / name).is_file()]
    if missing:
        raise SystemExit("CEO page dependencies missing: " + ", ".join(missing))
    (public / "ceo.html").write_text(HTML, encoding="utf-8")


def clean_redirects(public: Path) -> None:
    path = public / "_redirects"
    if not path.is_file():
        raise SystemExit(f"Netlify redirects missing: {path}")
    kept = []
    for line in path.read_text(encoding="utf-8").splitlines():
        lower = line.lower()
        if any(term in lower for term in ("dionuel", "alfaiataria", "logo-dionuel")):
            continue
        if line.startswith("/ceo ") or line.startswith("/ceo/* "):
            continue
        kept.append(line)
    path.write_text("\n".join(["/ceo /ceo.html 200!", "/ceo/* /ceo.html 200!"] + kept) + "\n", encoding="utf-8")
    residual = [line for line in path.read_text(encoding="utf-8").splitlines() if any(term in line.lower() for term in ("dionuel", "alfaiataria", "logo-dionuel"))]
    if residual:
        raise SystemExit("Legacy redirect remains: " + " | ".join(residual[:3]))


def main() -> None:
    public = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public")
    build(public)
    clean_redirects(public)
    print("Placurso CEO page and isolated Netlify routes generated.")


if __name__ == "__main__":
    main()
