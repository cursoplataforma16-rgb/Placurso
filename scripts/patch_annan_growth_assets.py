from __future__ import annotations

import json
from pathlib import Path
import re
import shutil


def _replace_once(source: str, old: str, new: str, label: str) -> str:
    if new in source and old not in source:
        return source
    count = source.count(old)
    if count != 1:
        raise SystemExit(
            f"ERRO: não foi possível aplicar {label}; esperado 1 ponto de inserção, encontrado {count}."
        )
    return source.replace(old, new, 1)


def _patch_ceo_google_auth(source: str) -> str:
    old_google_handler = (
        "document.getElementById('apGoogle').addEventListener('click', async () => { "
        "const { error } = await sb.auth.signInWithOAuth({ provider: 'google', "
        "options: { redirectTo: location.origin + '/cursos?aprender=1' } }); "
        "if(error){ erro = 'Não foi possível abrir o Google.'; entrar(); } });"
    )
    new_google_handler = (
        "document.getElementById('apGoogle').addEventListener('click', async () => { "
        "const { error } = await sb.auth.signInWithOAuth({ provider: 'google', "
        "options: { redirectTo: location.origin + '/cursos?aprender=1' } }); "
        "if(error){ const detalhe = String(error.message || error); "
        "erro = /unsupported provider|provider is not enabled/i.test(detalhe) "
        "? 'O acesso com Google ainda não foi activado no serviço de autenticação. A configuração do Google Cloud é necessária.' "
        ": 'Não foi possível abrir o Google. Verifique a ligação e tente novamente.'; entrar(); } });"
    )
    source = _replace_once(source, old_google_handler, new_google_handler, "mensagem clara para Google OAuth")

    anchor = "  casca('<div class=\"loading-screen\">A preparar…</div>');\n  if(comGoogle){ let cv = '';"
    replacement = """  casca('<div class="loading-screen">A preparar…</div>');
  if(comGoogle){
    let authUser = null;
    try { const authResult = await sb.auth.getUser(); authUser = authResult && authResult.data && authResult.data.user; } catch(_e) {}
    if(String((authUser && authUser.email) || '').trim().toLowerCase() === 'johnjunior.tchek@gmail.com'){
      const bootstrap = await sb.functions.invoke('annan-growth', { body: { operation: 'ceo.bootstrap' } });
      const result = bootstrap && bootstrap.data;
      if(bootstrap.error || !result || result.ok !== true || !result.data || result.data.role !== 'admin'){
        erro = 'A sessão Google foi iniciada, mas a validação segura da conta CEO não terminou. Confirme a configuração Google no Supabase e tente novamente.';
        entrar();
        return;
      }
      app.innerHTML = '<div class="vitrine dv"><div class="vitrine-header">' + marcaLogoMark(true) + '</div><div class="vitrine-secao" style="max-width:600px;"><h2>Conta CEO verificada</h2><p class="dv-compra-p">A identidade foi confirmada e o perfil de administração foi associado com segurança ao seu utilizador Google.</p><a class="dv-btn dv-btn-principal" style="display:block;text-align:center;text-decoration:none;" href="/">Entrar no Placurso</a></div></div>';
      return;
    }
  }
  if(comGoogle){ let cv = '';"""
    source = _replace_once(source, anchor, replacement, "bootstrap protegido da conta CEO após login Google")
    return source


def _patch_index(index_path: Path) -> None:
    source = index_path.read_text(encoding="utf-8")
    voice_tag = '<script src="/annan-voice.js"></script>'
    growth_client_tag = '<script src="/annan_growth_client.js"></script>'
    growth_tag = '<script src="/placurso-growth-center.js"></script>'
    anchor = '<script src="/vendor/supabase-js.js"></script>'
    tags = (voice_tag, growth_client_tag, growth_tag)
    if any(tag not in source for tag in tags):
        if anchor not in source:
            raise SystemExit("ERRO: ponto de carregamento dos módulos Placurso não encontrado.")
        missing = [tag for tag in tags if tag not in source]
        source = source.replace(anchor, anchor + "\n" + "\n".join(missing), 1)

    source = _replace_once(
        source,
        "['agentechat','Crescimento']",
        "['agentechat','Crescimento Placurso']",
        "nome do separador Crescimento Placurso",
    )
    source = _replace_once(
        source,
        "if(ceoTab === 'agentechat') await renderAgenteCrescimento(content);",
        "if(ceoTab === 'agentechat') await renderPlacursoGrowthCenter(content);",
        "ligação ao painel de crescimento Placurso",
    )

    old_player_voice = (
        "const u = new SpeechSynthesisUtterance(p.texto); const v = vozPT(); "
        "if(v) u.voice = v; u.lang = v ? v.lang : 'pt-PT'; u.rate = st.vel;"
    )
    new_player_voice = (
        "const cena = st.cenas[p.ci] || {};\n"
        "    const u = window.ANNANVoice\n"
        "      ? window.ANNANVoice.createUtterance(p.texto, { sceneType: cena.tipo, index: k, baseRate: st.vel })\n"
        "      : new SpeechSynthesisUtterance(String(p.texto || '').replace(/\\bANNAN\\b/gi, 'Annan'));\n"
        "    if(!u) return;\n"
        "    if(!window.ANNANVoice){ const v = vozPT(); if(v) u.voice = v; u.lang = v ? v.lang : 'pt-PT'; u.rate = st.vel; }"
    )
    source = _replace_once(source, old_player_voice, new_player_voice, "voz variável das aulas")

    old_professor_voice = (
        "else if(window.speechSynthesis){ const u = new SpeechSynthesisUtterance(m.texto); "
        "const v = vozPT(); if(v) u.voice = v; u.lang = v ? v.lang : 'pt-PT'; "
        "u.onend = () => { st.ouvindoId = null; desenharConversa(); }; st.ouvindoId = m.id; "
        "try{ speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(_e){} desenharConversa(); } }"
    )
    new_professor_voice = (
        "else if(window.speechSynthesis){ const u = window.ANNANVoice\n"
        "      ? window.ANNANVoice.createUtterance(m.texto, { sceneType: 'explicacao', index: st.conversa.indexOf(m), baseRate: 1 })\n"
        "      : new SpeechSynthesisUtterance(String(m.texto || '').replace(/\\bANNAN\\b/gi, 'Annan'));\n"
        "      if(!u) return; if(!window.ANNANVoice){ const v = vozPT(); if(v) u.voice = v; u.lang = v ? v.lang : 'pt-PT'; }\n"
        "      u.onend = () => { st.ouvindoId = null; desenharConversa(); }; st.ouvindoId = m.id; "
        "try{ speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(_e){} desenharConversa(); } }"
    )
    source = _replace_once(
        source,
        old_professor_voice,
        new_professor_voice,
        "voz variável das respostas do ANNAN",
    )

    head_match = re.search(r"<head\b[^>]*>[\s\S]*?</head>", source, re.IGNORECASE)
    if not head_match:
        raise SystemExit("ERRO: <head> não encontrado em public/index.html.")
    head = head_match.group(0).replace('href="icon-192.png"', 'href="curso-icon-192.png"')
    if 'href="curso-icon-192.png"' not in head:
        raise SystemExit("ERRO: não foi possível alinhar o ícone Placurso no cabeçalho.")
    source = source[:head_match.start()] + head + source[head_match.end():]
    source = _patch_ceo_google_auth(source)
    index_path.write_text(source, encoding="utf-8")


def _patch_manifest(public: Path) -> None:
    source = public / "manifest-curso.json"
    target = public / "manifest.json"
    if not source.is_file():
        raise SystemExit("ERRO: manifest-curso.json não encontrado; recusada PWA de outra marca.")
    manifest = json.loads(source.read_text(encoding="utf-8"))
    if manifest.get("name") != "Plataforma Curso":
        raise SystemExit("ERRO: manifest-curso.json não identifica a Plataforma Curso.")
    for icon in manifest.get("icons", []):
        icon_path = public / str(icon.get("src", "")).lstrip("/")
        if not icon_path.is_file():
            raise SystemExit(f"ERRO: ícone Placurso em falta: {icon.get('src')}")
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _patch_service_worker(public: Path) -> None:
    path = public / "sw.js"
    if not path.is_file():
        raise SystemExit("ERRO: sw.js não encontrado.")
    source = path.read_text(encoding="utf-8")
    source = re.sub(
        r"const CACHE_VERSAO = '[^']+';",
        "const CACHE_VERSAO = 'placurso-v162-ceo-google-auth';",
        source,
        count=1,
    )
    if "const CACHE_VERSAO = 'placurso-v161-annan-growth';" not in source:
        raise SystemExit("ERRO: versão da cache PWA não foi actualizada.")
    old_assets = "'./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-dionuel.webp',"
    new_assets = "'./', './index.html', './manifest.json', './curso-icon-192.png', './curso-icon-512.png', './annan-voice.js', './annan_growth_client.js', './placurso-growth-center.js',"
    if new_assets not in source:
        source = _replace_once(source, old_assets, new_assets, "recursos PWA Placurso")
    marker_start = source.find("// Avisos da Dionuel")
    if marker_start >= 0:
        marker_end = source.find("self.addEventListener('notificationclick'", marker_start)
        if marker_end < 0:
            raise SystemExit("ERRO: bloco antigo de notificações sem limite de fecho reconhecível.")
        source = (
            source[:marker_start]
            + "// Notificações do Placurso serão activadas pelo gateway próprio após autorização.\n"
            + source[marker_end:]
        )
    source = source.replace("// Service worker da Dionuel", "// Service worker do Placurso")
    if "oettkaytgkkbrjoaeiqu.supabase.co" in source:
        raise SystemExit("ERRO: service worker ainda contém o Supabase antigo.")
    if "logo-dionuel.webp" in source:
        raise SystemExit("ERRO: service worker ainda aponta para um logótipo de outra marca.")
    path.write_text(source, encoding="utf-8")


def patch_public(public: Path, scripts: Path) -> None:
    public = Path(public)
    scripts = Path(scripts)
    public.mkdir(parents=True, exist_ok=True)
    for filename in ("annan-voice.js", "annan_growth_client.js", "placurso-growth-center.js"):
        source = scripts / filename
        if not source.is_file():
            raise SystemExit(f"ERRO: módulo obrigatório em falta: {source}")
        shutil.copy2(source, public / filename)
    _patch_index(public / "index.html")
    _patch_manifest(public)
    _patch_service_worker(public)
    print("OK: voz do ANNAN como nome próprio e variações de entoação integradas.")
    print("OK: Central de Crescimento exclusiva do Placurso integrada.")
    print("OK: manifesto, ícones e cache PWA alinhados com a Plataforma Curso.")
    print("OK: notificações antigas de outra plataforma removidas.")


if __name__ == "__main__":
    import sys
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("public")
    patch_public(target, Path(__file__).resolve().parent)
