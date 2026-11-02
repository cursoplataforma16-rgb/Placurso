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
<meta name="theme-color" content="#f5f7f7">
<meta name="description" content="Escolhe o que queres aprender. Percursos práticos com orientação do ANNAN, ao teu ritmo.">
<meta property="og:site_name" content="Placurso">
<meta property="og:title" content="Placurso — escolhe o que queres aprender">
<meta property="og:description" content="Aprendizagem prática, escolhas simples e orientação do ANNAN.">
<meta property="og:image" content="/curso-icon-512.png">
<link rel="canonical" href="https://placurso.netlify.app/">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/curso-icon-192.png">
<title>Placurso — escolhe o que queres aprender</title>
<style>
:root{color-scheme:light;--ink:#203044;--navy:#183452;--teal:#167c72;--muted:#637487;--paper:#f5f7f7;--card:#fff;--line:#dce5e8;--soft:#eaf2f1;--focus:#b36c2d}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input,select{font:inherit}
button{min-height:44px;cursor:pointer}
a{color:inherit}
.wrap{width:min(900px,100%);margin:0 auto;padding:0 18px}
.top{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}
.top-inner{min-height:66px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--navy);font-weight:900;letter-spacing:.08em}
.brand-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:var(--navy);color:#fff;font-size:17px}
.brand small{display:block;font-size:9px;color:var(--muted);letter-spacing:.12em;font-weight:700}
.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 17px;border:0;border-radius:11px;background:var(--teal);color:#fff;font-size:13px;font-weight:850;text-decoration:none}
.button.secondary{background:#fff;border:1px solid var(--line);color:var(--navy)}
.button:disabled{opacity:.45;cursor:not-allowed}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.hero{padding:38px 0 22px}
.eyebrow{display:inline-block;color:var(--teal);font-size:10px;font-weight:900;letter-spacing:.15em}
h1{margin:8px 0 9px;color:var(--navy);font-size:clamp(30px,6vw,43px);line-height:1.1;letter-spacing:-.035em;max-width:620px}
.hero p{max-width:600px;margin:0;color:var(--muted);font-size:15px;line-height:1.65}
.choice-section{padding:22px 0 30px}
.section-heading{margin:0 0 16px}
.section-heading h2{margin:0;color:var(--navy);font-size:clamp(21px,4vw,27px);line-height:1.2;letter-spacing:-.02em}
.section-heading p{margin:6px 0 0;color:var(--muted);font-size:13px}
.area-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.area-choice{display:flex;align-items:center;gap:12px;width:100%;min-height:76px;padding:13px;text-align:left;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);transition:border-color .15s ease,background .15s ease,transform .15s ease}
.area-choice:hover{border-color:#9abbb6;transform:translateY(-1px)}
.area-choice[aria-pressed="true"]{border:2px solid var(--teal);background:#eef7f5;padding:12px}
.area-icon{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:12px;background:var(--soft);font-size:20px}
.area-copy{display:block;min-width:0}
.area-name{display:block;color:var(--navy);font-weight:850;font-size:14px}
.area-description{display:block;margin-top:2px;color:var(--muted);font-size:11px;line-height:1.35}
.area-arrow{margin-left:auto;color:var(--teal);font-size:20px;font-weight:700}
.all-areas{margin-top:13px;display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:var(--teal);font-size:13px;font-weight:850;padding:8px 0}
#moreLearningAreas{margin-top:10px}
#moreLearningAreas[hidden]{display:none}
.choice-status{min-height:23px;margin:12px 0 0;color:var(--muted);font-size:12px}
.selected-path{margin-top:12px;padding:17px;border:1px solid #b9d5cf;border-radius:15px;background:#edf6f4}
.selected-path[hidden]{display:none}
.selected-path p{margin:0;color:var(--muted);font-size:11px}
.selected-path h3{margin:3px 0 7px;color:var(--navy);font-size:19px}
.selected-path .actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
.disclosure{margin:15px 0;border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden}
.disclosure summary{min-height:54px;padding:15px 17px;display:flex;align-items:center;cursor:pointer;list-style:none;color:var(--navy);font-weight:850;font-size:13px}
.disclosure summary::-webkit-details-marker{display:none}
.disclosure summary:after{content:"+";margin-left:auto;color:var(--teal);font-size:20px;font-weight:500}
.disclosure[open] summary:after{content:"−"}
.disclosure-body{padding:0 16px 18px}
.course-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.course{padding:13px;border:1px solid var(--line);border-radius:11px;background:#fbfcfc}
.course b{display:block;color:var(--navy);font-size:13px}
.course p{margin:4px 0 0;color:var(--muted);font-size:11px}
.empty{padding:13px;border:1px dashed #c4d1d4;border-radius:11px;color:var(--muted);font-size:12px}
.course-panel{display:none;margin-top:15px;padding:17px;border:1px solid var(--line);border-radius:14px;background:#f8fbfa}
.course-panel.open{display:block}
.course-panel h3{margin:0;color:var(--navy);font-size:19px}
.course-panel-intro{margin:5px 0 14px;color:var(--muted);font-size:12px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.field{display:flex;flex-direction:column;gap:5px}
.field label{color:#526578;font-weight:800;font-size:11px}
.field input,.field select,.question input{width:100%;min-height:45px;padding:0 11px;border:1px solid var(--line);border-radius:9px;background:#fff;color:var(--ink);font-size:13px}
.optional-fields{grid-column:1/-1;margin-top:1px;border:1px solid var(--line);border-radius:10px;background:#fff}
.optional-fields summary{padding:11px 12px;color:var(--teal);font-size:12px;font-weight:800;cursor:pointer}
.optional-inner{padding:0 12px 12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
.status{min-height:23px;margin-top:9px;color:var(--muted);font-size:12px}
.lesson-scenes{display:grid;gap:9px;margin-top:12px}
.scene{padding:13px;border-radius:10px;background:#edf3f3}
.scene b{display:block;color:var(--navy);font-size:13px}
.scene p{margin:5px 0 0;color:#526578;font-size:12px}
.question{display:flex;gap:8px;margin-top:13px}
.chat-answer{margin-top:10px;padding:12px;border-radius:11px;background:#e8f4f1;color:#235d56;font-size:12px;line-height:1.55}
.challenge-copy{padding:0 0 12px;color:var(--muted);font-size:12px}
.pch-challenges{min-height:20px}
.footer{margin-top:28px;padding:22px 0;border-top:1px solid var(--line);background:#fff}
.footer-inner{display:flex;justify-content:space-between;align-items:center;gap:10px;color:var(--muted);font-size:11px}
.footer a{color:var(--navy);font-weight:850;text-decoration:none}
@media(max-width:600px){.wrap{padding:0 14px}.top-inner{min-height:61px}.hero{padding:30px 0 18px}.area-grid,.course-list{grid-template-columns:1fr}.area-choice{min-height:70px}.section-heading p{font-size:12px}.form-grid,.optional-inner{grid-template-columns:1fr}.optional-fields{grid-column:1}.footer-inner{align-items:flex-start;flex-direction:column}.selected-path .actions .button{width:100%}.question{flex-direction:column}.question .button{width:100%}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
</style>
</head>
<body>
<header class="top"><div class="wrap top-inner">
<a class="brand" href="/" aria-label="Placurso — página inicial"><span class="brand-mark" aria-hidden="true">P</span><span>PLACURSO<small>APRENDER · APLICAR · CRESCER</small></span></a>
<button class="button secondary google-login" type="button">Entrar com Google</button>
</div></header>
<main class="wrap">
<section class="hero">
<span class="eyebrow">APRENDIZAGEM AO TEU RITMO</span>
<h1>O que gostarias de aprender?</h1>
<p>Escolhe uma área. O ANNAN ajuda-te a encontrar um bom ponto de partida, sem pressa e sem complicações.</p>
</section>
<section class="choice-section" id="learningAreas" aria-labelledby="learningAreasTitle">
<div class="section-heading"><h2 id="learningAreasTitle">Escolhe uma área para começar</h2><p>Podes mudar de escolha sempre que quiseres.</p></div>
<div class="area-grid" role="group" aria-label="Áreas principais de aprendizagem">
<button class="area-choice" type="button" data-interest="tecnologia" aria-pressed="false"><span class="area-icon" aria-hidden="true">💻</span><span class="area-copy"><span class="area-name">Tecnologia</span><span class="area-description">Competências digitais e tecnologia</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="marketing" aria-pressed="false"><span class="area-icon" aria-hidden="true">📣</span><span class="area-copy"><span class="area-name">Marketing e publicidade</span><span class="area-description">Comunicação, vendas e marcas</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="educacao" aria-pressed="false"><span class="area-icon" aria-hidden="true">📚</span><span class="area-copy"><span class="area-name">Educação</span><span class="area-description">Ensino, estudo e aprendizagem</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="biblia" aria-pressed="false"><span class="area-icon" aria-hidden="true">🌿</span><span class="area-copy"><span class="area-name">Ensino bíblico</span><span class="area-description">Bíblia, histórias e conhecimento</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
</div>
<button class="all-areas" id="allAreasToggle" type="button" aria-expanded="false" aria-controls="moreLearningAreas">Ver todas as áreas <span aria-hidden="true">⌄</span></button>
<div id="moreLearningAreas" hidden>
<div class="area-grid" role="group" aria-label="Mais áreas de aprendizagem">
<button class="area-choice" type="button" data-interest="agronomia" aria-pressed="false"><span class="area-icon" aria-hidden="true">🌱</span><span class="area-copy"><span class="area-name">Agronomia</span><span class="area-description">Agricultura e produção</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="ambiente" aria-pressed="false"><span class="area-icon" aria-hidden="true">🌍</span><span class="area-copy"><span class="area-name">Engenharia ambiental</span><span class="area-description">Ambiente e sustentabilidade</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="telecomunicacoes" aria-pressed="false"><span class="area-icon" aria-hidden="true">📡</span><span class="area-copy"><span class="area-name">Telecomunicações</span><span class="area-description">Redes e comunicações</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="gestao" aria-pressed="false"><span class="area-icon" aria-hidden="true">📊</span><span class="area-copy"><span class="area-name">Gestão e negócios</span><span class="area-description">Organização e actividade empresarial</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
<button class="area-choice" type="button" data-interest="outro" aria-pressed="false"><span class="area-icon" aria-hidden="true">✨</span><span class="area-copy"><span class="area-name">Outra área</span><span class="area-description">Indica o tema que procuras</span></span><span class="area-arrow" aria-hidden="true">›</span></button>
</div>
</div>
<p class="choice-status" id="choiceStatus" aria-live="polite">Selecciona uma das áreas para veres o próximo passo.</p>
<section class="selected-path" id="selectedLearningPath" hidden aria-live="polite">
<p>A tua escolha</p><h3 id="selectedLearningLabel">Área de aprendizagem</h3>
<p>Começa com uma breve definição do teu objectivo. O ANNAN ajusta a orientação ao teu ponto de partida.</p>
<div class="actions"><button class="button" id="continueLearning" type="button" disabled>Continuar</button><button class="button secondary" id="changeLearningPath" type="button">Mudar área</button></div>
</section>
</section>

<details class="disclosure" id="courseDisclosure">
<summary>Cursos disponíveis</summary>
<div class="disclosure-body">
<section id="cursos">
<div class="section-heading"><h2>Aprende com orientação do ANNAN</h2><p>Consulta cursos publicados ou abre a tua área de aprendizagem.</p></div>
<div id="courseCatalog" class="course-list" aria-live="polite"><div class="empty">A consultar o catálogo...</div></div>
<button class="button secondary" type="button" id="openLearning" style="margin-top:13px">Abrir a minha área de aprendizagem</button>
<section class="course-panel" id="coursePanel" aria-live="polite">
<h3 id="panelTitle">Área de aprendizagem ANNAN</h3>
<p class="course-panel-intro" id="panelIntro">Entra com Google para criares ou recuperares a tua sessão de aluno.</p>
<button class="button secondary google-login" type="button">Entrar com Google</button>
<form id="studentProfile" hidden>
<div class="form-grid">
<div class="field"><label for="ageGroup">Faixa etária</label><select id="ageGroup" required><option value="">Selecciona a tua faixa etária</option><option value="7-12">7–12 anos</option><option value="13-17">13–17 anos</option><option value="18-25">18–25 anos</option><option value="26-35">26–35 anos</option><option value="36+">36 anos ou mais</option></select></div>
<div class="field"><label for="interest">Área de interesse</label><select id="interest" required><option value="">Selecciona uma área</option><option value="tecnologia">Tecnologia</option><option value="educacao">Educação e ensino</option><option value="agronomia">Agronomia</option><option value="ambiente">Engenharia ambiental</option><option value="telecomunicacoes">Telecomunicações</option><option value="marketing">Marketing e publicidade</option><option value="gestao">Gestão e negócios</option><option value="biblia">Ensino bíblico</option><option value="outro">Outra área</option></select></div>
<div class="field" style="grid-column:1/-1"><label for="objective">O que queres alcançar?</label><input id="objective" maxlength="500" required placeholder="Ex.: aprender uma competência ou preparar-me para uma oportunidade"></div>
<details class="optional-fields" id="optionalProfileFields">
<summary>Mais opções (facultativo)</summary>
<div class="optional-inner">
<div class="field"><label for="birthplace">Local de nascimento</label><input id="birthplace" maxlength="100" placeholder="Província ou município"></div>
<div class="field"><label for="studentPhone">Telemóvel</label><input id="studentPhone" type="tel" maxlength="32" placeholder="+244"></div>
<div class="field"><label for="studyHours">Tempo disponível por semana</label><select id="studyHours"><option value="1-2">1–2 horas</option><option value="3-5">3–5 horas</option><option value="6-10">6–10 horas</option><option value="10+">Mais de 10 horas</option></select></div>
</div>
</details>
</div>
<div class="form-actions"><button class="button" id="saveProfile" type="submit">Guardar e continuar</button></div>
</form>
<div id="learningStatus" class="status" role="status" aria-live="polite"></div>
<div id="lessonScenes" class="lesson-scenes"></div>
<div class="question" id="annanQuestionBox" hidden><input id="annanQuestion" maxlength="1000" placeholder="Escreve uma pergunta ao ANNAN"><button class="button" id="askAnnan" type="button">Enviar pergunta</button></div>
<div id="annanAnswer" class="chat-answer" hidden></div>
</section>
</section>
</div>
</details>

<details class="disclosure" id="challengeDisclosure">
<summary>Experimentar desafios de raciocínio</summary>
<div class="disclosure-body">
<p class="challenge-copy">Experimenta desafios de memória, atenção, estratégia e decisão. O mesmo motor ANNAN acompanha os teus resultados.</p>
<section id="desafios"><div id="challengeArea"><div class="pch-challenges" aria-label="Centro de desafios ANNAN"></div></div></section>
</div>
</details>
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
function showPanel(){ $('courseDisclosure').open=true; $('coursePanel').classList.add('open'); $('coursePanel').scrollIntoView({behavior:'smooth',block:'start'}); }
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
    const chosenInterest=$('interest').value||sessionStorage.getItem('placurso_selected_interest')||'';
    const selectionChanged=Boolean(chosenInterest&&chosenInterest!==details.interesse);
    if((!student.concluido&&!details.objetivo&&!details.meta)||selectionChanged){
      $('studentProfile').hidden=false;
      $('ageGroup').value=details.faixa_etaria||details.idade_grupo||'';
      $('birthplace').value=details.local_nascimento||'';
      $('studentPhone').value=details.telefone||'';
      $('studyHours').value=details.horas_semana||'1-2';
      $('interest').value=chosenInterest||details.interesse||'';
      $('objective').value=details.objetivo||details.meta||'';
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
    sessionStorage.removeItem('placurso_selected_interest');
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
  const selected=$('interest').value||sessionStorage.getItem('placurso_selected_interest')||'';
  if(!selected){$('choiceStatus').textContent='Escolhe primeiro uma área para continuares.';$('learningAreas').scrollIntoView({behavior:'smooth',block:'start'});return;}
  $('interest').value=selected;
  showPanel();
  try{
    const p=persistence(),current=await p.getCurrentUser();
    if(!current||!current.ok||!current.user){status('Entra com Google ou cria uma conta na Área de Aluno para continuares.');return;}
    await loadLearning();
  }catch(error){status(error.message||'Não foi possível confirmar a sessão.');}
}
$('continueLearning').addEventListener('click',start);
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

const interestLabels={
  tecnologia:'Tecnologia',
  marketing:'Marketing e publicidade',
  educacao:'Educação',
  biblia:'Ensino bíblico',
  agronomia:'Agronomia',
  ambiente:'Engenharia ambiental',
  telecomunicacoes:'Telecomunicações',
  gestao:'Gestão e negócios',
  outro:'Outra área'
};
const validInterests=new Set(Object.keys(interestLabels));
function chooseInterest(value){
  if(!validInterests.has(value))return;
  $('interest').value=value;
  sessionStorage.setItem('placurso_selected_interest',value);
  document.querySelectorAll('[data-interest]').forEach(card=>{
    const selected=card.dataset.interest===value;
    card.setAttribute('aria-pressed',selected?'true':'false');
  });
  $('selectedLearningLabel').textContent=interestLabels[value];
  $('selectedLearningPath').hidden=false;
  $('continueLearning').disabled=false;
  $('choiceStatus').textContent='Escolheste '+interestLabels[value]+'. Podes continuar ou mudar a área.';
}
document.querySelectorAll('[data-interest]').forEach(card=>{
  card.addEventListener('click',()=>chooseInterest(card.dataset.interest));
});
$('allAreasToggle').addEventListener('click',()=>{
  const expanded=$('allAreasToggle').getAttribute('aria-expanded')!=='true';
  $('allAreasToggle').setAttribute('aria-expanded',String(expanded));
  $('moreLearningAreas').hidden=!expanded;
  $('allAreasToggle').textContent=expanded?'Mostrar menos áreas':'Ver todas as áreas';
});
$('changeLearningPath').addEventListener('click',()=>{
  $('learningAreas').scrollIntoView({behavior:'smooth',block:'start'});
  const first=$('learningAreas').querySelector('[data-interest]');
  if(first)first.focus({preventScroll:true});
});
const savedInterest=sessionStorage.getItem('placurso_selected_interest');
if(savedInterest&&validInterests.has(savedInterest))chooseInterest(savedInterest);

loadCourses();
})();

</script>
</body></html>'''


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
