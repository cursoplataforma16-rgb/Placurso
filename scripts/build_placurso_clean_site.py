from __future__ import annotations

from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

ROOT_HTML = r'''<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#14284b">
<meta name="description" content="Aprende no telemóvel com desafios práticos, orientação ANNAN, percursos e acompanhamento da evolução.">
<meta property="og:site_name" content="Placurso">
<meta property="og:title" content="Placurso — aprender, aplicar e crescer">
<meta property="og:description" content="Aprendizagem prática, desafios e percursos com ANNAN.">
<meta property="og:image" content="/curso-icon-512.png">
<link rel="canonical" href="https://placurso.netlify.app/">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/curso-icon-192.png">
<title>Placurso — aprender, aplicar e crescer</title>
<style>
:root{color-scheme:light;--navy:#14284b;--navy2:#203c65;--teal:#1b8a83;--ink:#1d2b3e;--muted:#65758b;--paper:#f5f7fb;--line:#dbe4ef;--white:#fff;--gold:#d8c59f}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:inherit}.wrap{width:min(1080px,100%);margin:0 auto;padding:0 18px}.top{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.top-inner{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:900;letter-spacing:.12em;color:var(--navy)}.brand-mark{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:var(--navy);color:white;font-size:18px}.brand small{display:block;font-size:9px;letter-spacing:.16em;color:var(--muted);font-weight:700}
.nav{display:flex;align-items:center;gap:17px}.nav a{text-decoration:none;font-size:12px;font-weight:750;color:#506078}.button{display:inline-flex;justify-content:center;align-items:center;min-height:44px;padding:0 17px;border:0;border-radius:10px;background:var(--teal);color:white;font-weight:850;font-size:12px;text-decoration:none;cursor:pointer;box-shadow:0 5px 14px rgba(27,138,131,.15)}.button.dark{background:var(--navy)}.button.outline{background:white;color:var(--navy);border:1px solid var(--line);box-shadow:none}.button:disabled{opacity:.55;cursor:wait}
.hero{padding:64px 0 46px;background:radial-gradient(ellipse at 85% 12%,rgba(27,138,131,.12),transparent 38%),linear-gradient(135deg,#fff,#f0f4fa)}.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr);gap:32px;align-items:center}.eyebrow{font-size:10px;letter-spacing:.17em;font-weight:900;color:var(--teal)}h1{font-size:clamp(34px,6vw,58px);line-height:1.04;letter-spacing:-.04em;margin:12px 0 18px;color:var(--navy);max-width:670px}.hero p{max-width:590px;color:var(--muted);font-size:16px;line-height:1.7;margin:0 0 24px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap}.hero-note{display:flex;gap:9px;align-items:center;margin-top:17px;color:var(--muted);font-size:11px}.hero-card{padding:22px;border:1px solid #d9e4ec;border-radius:20px;background:white;box-shadow:0 20px 55px rgba(20,40,75,.08)}.hero-card-top{display:flex;justify-content:space-between;align-items:center}.pill{padding:5px 9px;border-radius:999px;background:#e8f5f3;color:#1a716c;font-size:9px;font-weight:900;letter-spacing:.07em}.hero-stat{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}.stat{padding:13px;border-radius:12px;background:#f4f7fb}.stat b{display:block;color:var(--navy);font-size:18px}.stat span{font-size:9px;color:var(--muted)}
.section{padding:48px 0}.section-head{max-width:650px;margin-bottom:20px}.section-head h2{font-size:clamp(24px,4vw,35px);letter-spacing:-.03em;line-height:1.12;color:var(--navy);margin:7px 0}.section-head p{color:var(--muted);font-size:13px;line-height:1.6;margin:0}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.feature{padding:18px;border:1px solid var(--line);border-radius:15px;background:#fff}.feature-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:#eaf2f7;font-size:19px}.feature h3{font-size:14px;color:var(--navy);margin:12px 0 5px}.feature p{font-size:11px;line-height:1.6;color:var(--muted);margin:0}
.learning{padding:20px;border-radius:19px;background:var(--navy);color:#fff;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center}.learning h2{font-size:23px;line-height:1.15;margin:0 0 7px}.learning p{margin:0;color:#d0d9e6;font-size:12px;line-height:1.6;max-width:620px}
.course-list{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:13px}.course{padding:14px;border:1px solid var(--line);border-radius:13px;background:white}.course b{display:block;color:var(--navy);font-size:13px}.course p{margin:5px 0;color:var(--muted);font-size:10px}.empty{padding:17px;border:1px dashed #c6d3e1;border-radius:13px;color:var(--muted);font-size:11px;background:rgba(255,255,255,.6)}
#coursePanel{display:none;margin-top:16px;padding:18px;border:1px solid var(--line);border-radius:16px;background:white}#coursePanel.open{display:block}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:flex;flex-direction:column;gap:5px}.field label{font-size:10px;font-weight:850;color:#506078}.field input,.field select,.question input{min-height:42px;width:100%;padding:0 11px;border:1px solid var(--line);border-radius:9px;background:#fff;color:var(--ink);font:inherit;font-size:12px}.form-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.status{min-height:22px;margin-top:9px;color:var(--muted);font-size:11px}.lesson-scenes{display:grid;gap:9px;margin-top:12px}.scene{padding:12px;border-radius:11px;background:#f2f6fa}.scene b{display:block;font-size:12px;color:var(--navy)}.scene p{font-size:11px;color:#506078;margin:5px 0 0}.question{display:flex;gap:8px;margin-top:13px}.chat-answer{margin-top:9px;padding:12px;border-radius:12px;background:#eaf5f3;color:#235a56;font-size:11px;line-height:1.55}
#challengeArea{padding-top:14px}.pch-challenges{min-height:20px}
.footer{padding:25px 0;margin-top:28px;border-top:1px solid var(--line);background:white}.footer-inner{display:flex;justify-content:space-between;align-items:center;gap:10px;color:var(--muted);font-size:10px}.footer a{color:var(--navy);font-weight:800;text-decoration:none}
@media(max-width:760px){.nav{display:none}.hero{padding:43px 0 34px}.hero-grid{grid-template-columns:1fr;gap:21px}.hero-card{max-width:none}.feature-grid,.course-list{grid-template-columns:1fr}.learning{grid-template-columns:1fr}.learning .button{width:100%}.section{padding:34px 0}.footer-inner{align-items:flex-start;flex-direction:column}}
@media(max-width:420px){.wrap{padding:0 13px}.hero h1{font-size:36px}.form-grid{grid-template-columns:1fr}.hero-actions .button{width:100%}}
</style>
</head>
<body>
<header class="top"><div class="wrap top-inner">
<a class="brand" href="/"><span class="brand-mark">P</span><span>PLACURSO<small>APRENDER · APLICAR · CRESCER</small></span></a>
<nav class="nav"><a href="#como-funciona">Como funciona</a><a href="#cursos">Cursos</a><a href="#desafios">Desafios</a></nav>
<button class="button dark google-login" type="button">Entrar com Google</button>
</div></header>
<main>
<section class="hero"><div class="wrap hero-grid">
<div><span class="eyebrow">APRENDIZAGEM PRÁTICA</span><h1>Aprende algo útil. Avança ao teu ritmo.</h1><p>Estuda no telemóvel, experimenta desafios, define os teus objectivos e acompanha a tua evolução com orientação do ANNAN.</p>
<div class="hero-actions"><button class="button" id="startLearning" type="button">Começar a aprender</button><a class="button outline" href="#desafios">Explorar desafios</a></div>
<div class="hero-note"><span>✓</span><span>Entrada inicial gratuita · Percurso ajustado ao teu objectivo</span></div></div>
<aside class="hero-card"><div class="hero-card-top"><b style="color:var(--navy)">O teu próximo passo</b><span class="pill">ANNAN</span></div><p style="font-size:12px;color:var(--muted);line-height:1.6;margin:12px 0">Começa por conhecer o teu objectivo. O percurso de aprendizagem organiza-se a partir daí.</p><div class="hero-stat"><div class="stat"><b>01</b><span>Definir objectivo</span></div><div class="stat"><b>02</b><span>Praticar</span></div><div class="stat"><b>03</b><span>Medir evolução</span></div><div class="stat"><b>04</b><span>Avançar</span></div></div></aside>
</div></section>
<section class="section" id="como-funciona"><div class="wrap"><div class="section-head"><span class="eyebrow">O MÉTODO</span><h2>Aprender é mais do que assistir a uma aula.</h2><p>O Placurso reúne prática, avaliação e acompanhamento para transformar conhecimento em capacidade de execução.</p></div>
<div class="feature-grid"><article class="feature"><span class="feature-icon">🎯</span><h3>Objectivo claro</h3><p>Indica o que pretendes alcançar e o ANNAN organiza o ponto de partida.</p></article><article class="feature"><span class="feature-icon">🧠</span><h3>Prática orientada</h3><p>Desafios e exercícios ajudam a testar raciocínio, atenção e decisão.</p></article><article class="feature"><span class="feature-icon">📈</span><h3>Evolução registada</h3><p>Os resultados são guardados na tua conta e podem orientar os próximos passos.</p></article></div>
</div></section>
<section class="section" id="cursos" style="padding-top:8px"><div class="wrap"><div class="learning"><div><h2>Aprender com o ANNAN</h2><p>Cria a tua sessão, define o teu objectivo e começa pela aula de introdução. O catálogo só apresenta cursos que já estejam publicados.</p></div><button class="button" type="button" id="openLearning">Abrir área de aprendizagem</button></div><div id="courseCatalog" class="course-list" aria-live="polite"><div class="empty">A consultar o catálogo...</div></div><section id="coursePanel" aria-live="polite"><h3 id="panelTitle" style="margin:0;color:var(--navy);font-size:18px">Área de aprendizagem ANNAN</h3><p id="panelIntro" style="font-size:11px;color:var(--muted);margin:6px 0 14px">Entra com Google para criares ou recuperares a tua sessão de aluno.</p>
<form id="studentProfile" hidden><div class="form-grid">
<div class="field"><label for="ageGroup">Faixa etária</label><select id="ageGroup" required><option value="">Selecciona</option><option value="7-12">7–12 anos</option><option value="13-17">13–17 anos</option><option value="18-25">18–25 anos</option><option value="26-35">26–35 anos</option><option value="36+">36 anos ou mais</option></select></div>
<div class="field"><label for="birthplace">Local de nascimento (opcional)</label><input id="birthplace" maxlength="100" placeholder="Província ou município"></div>
<div class="field"><label for="studentPhone">Telemóvel (opcional)</label><input id="studentPhone" type="tel" maxlength="32" placeholder="+244"></div>
<div class="field"><label for="studyHours">Tempo disponível por semana</label><select id="studyHours"><option value="1-2">1–2 horas</option><option value="3-5">3–5 horas</option><option value="6-10">6–10 horas</option><option value="10+">Mais de 10 horas</option></select></div>
<div class="field"><label for="interest">Área de interesse</label><select id="interest" required><option value="">Selecciona</option><option value="tecnologia">Tecnologia</option><option value="educacao">Educação e ensino</option><option value="agronomia">Agronomia</option><option value="ambiente">Engenharia ambiental</option><option value="telecomunicacoes">Telecomunicações</option><option value="marketing">Marketing e publicidade</option><option value="gestao">Gestão e negócios</option><option value="biblia">Ensino bíblico</option><option value="outro">Outra área</option></select></div>
<div class="field"><label for="objective">O que queres alcançar?</label><input id="objective" maxlength="500" required placeholder="Ex.: conseguir o primeiro emprego"></div>
</div><div class="form-actions"><button class="button" id="saveProfile" type="submit">Guardar objectivo</button></div></form>
<div id="learningStatus" class="status" role="status"></div><div id="lessonScenes" class="lesson-scenes"></div>
<div class="question" id="annanQuestionBox" hidden><input id="annanQuestion" maxlength="1000" placeholder="Escreve uma pergunta ao ANNAN"><button class="button dark" id="askAnnan" type="button">Enviar</button></div><div id="annanAnswer" class="chat-answer" hidden></div>
</section></div></section>
<section class="section" id="desafios"><div class="wrap"><div class="section-head"><span class="eyebrow">ANNAN · CENTRO DE DESAFIOS</span><h2>Testa as tuas capacidades.</h2><p>Experimenta jogos de raciocínio, memória, foco, estratégia e aprendizagem. A área de desafios é construída pelo mesmo motor ANNAN.</p></div><div id="challengeArea"><div class="pch-challenges" aria-label="Centro de desafios ANNAN"></div></div></div></section>
</main>
<footer class="footer"><div class="wrap footer-inner"><span>Placurso · Aprender · Aplicar · Crescer</span><span><a href="/ceo" rel="nofollow">Painel de gestão</a></span></div></footer>
<script src="/psico-engine.js"></script>
<script src="/annan-voice.js"></script>
<script>
(function(){
'use strict';
const $=id=>document.getElementById(id);
const persistence=()=>window.PlacursoAnnanPersistence;
let client=null,student=null,busy=false;
function status(text){$('learningStatus').textContent=text||'';}
function showPanel(){ $('coursePanel').classList.add('open'); $('coursePanel').scrollIntoView({behavior:'smooth',block:'start'}); }
async function getClient(){
  const p=persistence();
  if(!p||typeof p.getClient!=='function')throw new Error('O motor de aprendizagem ainda não ficou disponível.');
  client=client||await p.getClient();
  return client;
}
async function invoke(action,payload){
  const sb=await getClient();
  const result=await sb.functions.invoke('annan-ensino',{body:Object.assign({acao:action},payload||{})});
  if(result.error)throw new Error(result.error.message||'Não foi possível contactar o ANNAN.');
  if(!result.data||result.data.ok===false)throw new Error(result.data&&result.data.nota||'O ANNAN não confirmou a operação.');
  return result.data;
}
async function signInGoogle(){
  const sb=await getClient();
  const result=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin,queryParams:{prompt:'select_account'}}});
  if(result.error)throw result.error;
}
function renderScenes(data){
  const root=$('lessonScenes');root.replaceChildren();
  const scenes=Array.isArray(data&&data.cenas)?data.cenas:[];
  scenes.forEach(scene=>{
    const card=document.createElement('article');card.className='scene';
    const title=document.createElement('b');title.textContent=String(scene.titulo||'ANNAN');
    const body=document.createElement('p');body.textContent=(Array.isArray(scene.pontos)?scene.pontos:[]).join(' ');
    card.append(title,body);root.append(card);
  });
  if(data&&data.audio_url){
    const audio=document.createElement('audio');audio.controls=true;audio.src=data.audio_url;audio.style.width='100%';root.prepend(audio);
  }
}
async function loadLearning(){
  if(busy)return;busy=true;status('A preparar a tua área de aprendizagem…');
  try{
    student=await invoke('aluno_iniciar');
    $('panelTitle').textContent='Bem-vindo, '+String(student.nome||'aluno');
    const profile=await invoke('perfil_ver');
    const details=profile.perfil||{};
    if(!student.concluido&&!details.objetivo&&!details.meta){
      $('studentProfile').hidden=false;
      $('ageGroup').value=details.faixa_etaria||details.idade_grupo||'';
      $('birthplace').value=details.local_nascimento||'';
      $('studentPhone').value=details.telefone||'';
      $('studyHours').value=details.horas_semana||'1-2';
      $('interest').value=details.interesse||'';
      $('objective').value=details.objetivo||'';
      status('Completa o teu perfil de aprendizagem. Só os campos assinalados são obrigatórios.');
      return;
    }
    await showLesson();
  }catch(error){status(error.message||'Falha ao abrir a área de aprendizagem.');}
  finally{busy=false;}
}
async function showLesson(){
  $('studentProfile').hidden=true;
  status('A carregar o teu percurso e a aula de introdução…');
  const plan=await invoke('percurso_ver');
  const media=await invoke('boas_vindas_midia',{formato:'video'});
  renderScenes(media);
  $('annanQuestionBox').hidden=false;
  const steps=Array.isArray(plan.plano&&plan.plano.passos)?plan.plano.passos:[];
  $('panelIntro').textContent=(plan.plano&&plan.plano.titulo?plan.plano.titulo:'Percurso ANNAN')+(steps.length?' · '+steps.join(' → '):'');
  status(media.nota||'A tua área está pronta. Continua pela aula de introdução e coloca as tuas perguntas.');
}
$('studentProfile').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;busy=true;
  const button=$('saveProfile');button.disabled=true;status('A guardar o teu objectivo…');
  try{
    await invoke('perfil_rapido',{campos:{
      faixa_etaria:$('ageGroup').value,
      local_nascimento:$('birthplace').value.trim(),
      telefone:$('studentPhone').value.trim(),
      horas_semana:$('studyHours').value,
      interesse:$('interest').value,
      objetivo:$('objective').value.trim()
    }});
    await showLesson();
  }catch(error){status(error.message||'Não foi possível guardar o perfil.');}
  finally{busy=false;button.disabled=false;}
});
$('askAnnan').addEventListener('click',async()=>{
  const field=$('annanQuestion'),question=field.value.trim();if(!question)return;
  $('askAnnan').disabled=true;$('annanAnswer').hidden=false;$('annanAnswer').textContent='O ANNAN está a responder…';
  try{const answer=await invoke('prof_falar',{texto:question});$('annanAnswer').textContent=answer.resposta||'Recebi a tua pergunta.';field.value='';}
  catch(error){$('annanAnswer').textContent=error.message||'Não foi possível enviar a pergunta.';}
  finally{$('askAnnan').disabled=false;}
});
async function start(){
  showPanel();
  try{
    const p=persistence(),current=await p.getCurrentUser();
    if(!current||!current.ok||!current.user){status('Entra com Google ou cria uma conta na Área de Aluno para continuares.');return;}
    await loadLearning();
  }catch(error){status(error.message||'Não foi possível confirmar a sessão.');}
}
$('startLearning').addEventListener('click',start);
$('openLearning').addEventListener('click',start);
document.querySelectorAll('.google-login').forEach(button=>button.addEventListener('click',async()=>{
  button.disabled=true;
  try{await signInGoogle();}
  catch(error){status(error.message||'Não foi possível abrir o Google.');}
  finally{button.disabled=false;}
}));
async function loadCourses(){
  try{
    const sb=await getClient();
    const result=await sb.from('cursos').select('id,titulo,descricao,categoria,preco,moeda').eq('ativo',true).order('criado_em',{ascending:false}).limit(12);
    if(result.error)throw result.error;
    const root=$('courseCatalog');root.replaceChildren();
    const courses=Array.isArray(result.data)?result.data:[];
    if(!courses.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='O catálogo de cursos ainda não tem cursos publicados. A aula de introdução e o Centro de Desafios já estão disponíveis.';root.append(empty);return;}
    courses.forEach(course=>{
      const card=document.createElement('article');card.className='course';
      const title=document.createElement('b');title.textContent=course.titulo||'Curso';
      const description=document.createElement('p');description.textContent=course.descricao||course.categoria||'Curso Placurso';
      card.append(title,description);root.append(card);
    });
  }catch(_){$('courseCatalog').textContent='Não foi possível consultar o catálogo. Tenta novamente mais tarde.';}
}
loadCourses();
})();
</script>
</body></html>'''

MANIFEST = {
    "id": "/",
    "name": "Placurso",
    "short_name": "Placurso",
    "description": "Aprender, aplicar e crescer com ANNAN.",
    "lang": "pt",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#f5f7fb",
    "theme_color": "#14284b",
    "icons": [
        {"src": "/curso-icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "/curso-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    ],
}

SERVICE_WORKER = r'''const CACHE_NAME = 'placurso-clean-v1';
const ASSETS = [
  '/', '/index.html', '/manifest.json', '/psico-engine.js',
  '/annan-voice.js', '/curso-icon-192.png', '/curso-icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/p/') || url.pathname.startsWith('/cursos/') || url.pathname === '/ceo') return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && ASSETS.includes(url.pathname)) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match('/index.html'))));
});
'''


def _remove_unapproved(public: Path) -> None:
    keep = {
        "index.html", "psico-engine.js", "ceo.html", "manifest.json", "sw.js",
        "_redirects", "robots.txt", "sitemap.xml", "curso-icon-192.png",
        "curso-icon-512.png", "curso-logo.png", "curso-og.png",
        "annan-voice.js", "annan_growth_client.js", "placurso-growth-center.js",
    }
    for entry in list(public.iterdir()):
        if entry.is_dir():
            shutil.rmtree(entry)
        elif entry.name not in keep:
            entry.unlink()


def build(public: Path = PUBLIC) -> None:
    public.mkdir(parents=True, exist_ok=True)
    required = ("psico-engine.js", "curso-icon-192.png", "curso-icon-512.png")
    missing = [name for name in required if not (public / name).is_file()]
    if missing:
        raise SystemExit("Clean Placurso build is missing: " + ", ".join(missing))

    _remove_unapproved(public)
    (public / "index.html").write_text(ROOT_HTML, encoding="utf-8")
    (public / "manifest.json").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (public / "sw.js").write_text(SERVICE_WORKER, encoding="utf-8")
    (public / "_redirects").write_text("/ceo /ceo.html 200!\n/ceo/* /ceo.html 200!\n", encoding="utf-8")
    (public / "robots.txt").write_text("User-agent: *\nAllow: /\nDisallow: /ceo\nDisallow: /ceo.html\nSitemap: https://placurso.netlify.app/sitemap.xml\n", encoding="utf-8")
    (public / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        '<url><loc>https://placurso.netlify.app/</loc></url>'
        '<url><loc>https://placurso.netlify.app/cursos</loc></url>'
        '</urlset>\n',
        encoding="utf-8",
    )
    for name in ("annan-voice.js", "annan_growth_client.js", "placurso-growth-center.js"):
        source = ROOT / "scripts" / name
        if source.is_file():
            shutil.copy2(source, public / name)
    print("Placurso clean shell generated; only the educational ANNAN engine and approved assets are retained.")


if __name__ == "__main__":
    build(Path(__import__("sys").argv[1]) if len(__import__("sys").argv) > 1 else PUBLIC)
