from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker='\n/* PLACURSO_COMMUNITY_FUNCTIONAL_FLOW_V1 */\n'
if marker in s:
    raise SystemExit('Community functional flow já aplicado.')
for required in ['PLACURSO_PHASE3C_CRYPTO_GAMES','PLACURSO_PHASE3D_ANNAN_PROFILE']:
    if required not in s:
        raise SystemExit(f'ERRO: community flow requer {required}.')

script=r'''
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    if(!hub || document.querySelector('.plc-community-shell')) return;
    var Access=window.PlacursoCommunityAccess, Psych=window.PlacursoPsychotechnical, Bible=window.PlacursoBibleLearning, Persistence=window.PlacursoAnnanPersistence;
    if(!Access||!Psych||!Bible) return;
    var authenticatedUser=null;
    var GAME_KEY='placurso_phase3a_games_v1', CRYPTO_KEY='placurso_crypto_learning_v2', LEARNING_KEY='placurso_annan_learning_v1';
    var shell=document.createElement('section'); shell.className='plc-community-shell';
    var style=document.createElement('style'); style.textContent=`
      .plc-community-shell{margin:0 auto 16px;padding:12px;border:1px solid #ddd2c1;border-radius:20px;background:#fffdf8;color:#202a24;box-shadow:0 10px 26px rgba(20,30,25,.06)}
      .plc-community-hero{padding:16px;border-radius:17px;background:#202a24;color:#fff8ec}.plc-community-kicker{font-size:8px;font-weight:900;letter-spacing:1.5px;color:#ddc99f}.plc-community-hero h1{margin:6px 0;font-size:clamp(24px,7vw,34px);line-height:1.05}.plc-community-hero p{margin:0;color:#e9e0d1;font-size:11px;line-height:1.45}.plc-community-btn{width:100%;min-height:46px;border:0;border-radius:12px;margin-top:12px;background:#a43d2f;color:white;font-weight:900;font-size:12px}.plc-community-section{margin-top:12px}.plc-community-title{display:flex;justify-content:space-between;align-items:end;gap:8px;margin:0 2px 7px}.plc-community-title strong{font-size:14px}.plc-community-title span{font-size:8px;color:#786f62}.plc-challenge-row{display:flex;gap:8px;overflow:auto;padding:2px 1px 6px;scroll-snap-type:x mandatory}.plc-challenge-card{flex:0 0 154px;min-height:108px;border:1px solid #ded4c5;border-radius:14px;background:white;padding:11px;text-align:left;scroll-snap-align:start}.plc-challenge-card button{width:100%;height:100%;border:0;background:transparent;text-align:left;padding:0;color:inherit}.plc-challenge-card b{display:block;font-size:11px}.plc-challenge-card small{display:block;margin-top:6px;color:#746d63;font-size:8px;line-height:1.35}.plc-tag{display:inline-block;margin-bottom:7px;padding:4px 6px;border-radius:999px;background:#eee5d6;font-size:7px;font-weight:900}.plc-lock{font-size:8px;color:#a43d2f;font-weight:900}.plc-mini{padding:12px;border:1px solid #ded4c5;border-radius:14px;background:#fbf7ef}.plc-mini h3{margin:0 0 5px;font-size:14px}.plc-mini p{margin:0;color:#6f685d;font-size:9px;line-height:1.45}.plc-mini button,.plc-member-card button{margin-top:9px;min-height:40px;width:100%;border:1px solid #d5c9b8;border-radius:10px;background:#fff;font-weight:900;color:#202a24}.plc-footer-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.plc-footer-actions a,.plc-footer-actions button{display:flex;align-items:center;justify-content:center;min-height:40px;border:1px solid #d8cdbc;border-radius:10px;background:white;color:#202a24;text-decoration:none;font-size:9px;font-weight:900}.plc-member{display:none}.plc-member.is-visible{display:block}.plc-public.is-hidden{display:none}.plc-member-head{padding:14px;border-radius:15px;background:#202a24;color:white}.plc-member-head h2{margin:4px 0;font-size:20px}.plc-member-head p{margin:0;color:#e6ddcf;font-size:9px}.plc-member-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.plc-member-card{padding:11px;border:1px solid #ded4c5;border-radius:13px;background:white}.plc-member-card strong{display:block;font-size:10px}.plc-member-card span{display:block;margin-top:4px;color:#756d62;font-size:8px}.plc-experience{display:none;position:relative;margin-top:10px;padding:14px;border:1px solid #d9cdbb;border-radius:16px;background:#fff}.plc-experience.is-visible{display:block}.plc-experience h3{margin:0 0 5px;font-size:17px}.plc-experience p{margin:0;color:#6f685e;font-size:9px;line-height:1.45}.plc-q{margin-top:10px;padding:10px;border-radius:12px;background:#faf5eb}.plc-q b{display:block;font-size:10px;line-height:1.4}.plc-opt{display:block;width:100%;margin-top:6px;min-height:39px;border:1px solid #d9cebd;border-radius:9px;background:white;text-align:left;padding:8px;font-size:9px}.plc-result{margin-top:10px;padding:11px;border-radius:12px;background:#202a24;color:#fff;font-size:10px;line-height:1.45}.plc-result button{margin-top:8px;width:100%;min-height:38px;border:0;border-radius:9px;background:#d8c59f;color:#202a24;font-weight:900}.plc-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45);padding:10px}.plc-modal.is-visible{display:flex}.plc-modal-box{width:min(520px,100%);max-height:90vh;overflow:auto;border-radius:18px;background:#fffdf8;padding:15px;color:#202a24}.plc-modal-box h3{margin:0 0 5px;font-size:19px}.plc-modal-box p{font-size:9px;color:#6f685e;line-height:1.45}.plc-form input{display:block;width:100%;box-sizing:border-box;margin-top:7px;padding:11px;border:1px solid #d8cebe;border-radius:9px}.plc-invite-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:10px 0}.plc-invite{padding:8px 2px;border:1px solid #d8cebe;border-radius:8px;text-align:center;font-size:8px}.plc-invite.sent{background:#eee5d6;border-color:#cdbb9f}.plc-muted{font-size:8px!important}.plc-auth-message{min-height:16px;margin-top:8px;color:#a43d2f;font-size:9px;line-height:1.4}.plc-auth-link{display:block;margin-top:10px;border:0;background:transparent;color:#8b382d;text-decoration:underline;font-size:10px;font-weight:800}.plc-annan-note{margin-top:8px;padding:10px;border-radius:10px;background:#f3ecdf;font-size:9px;line-height:1.45}.plc-community-hide{display:none!important}@media(max-width:380px){.plc-challenge-card{flex-basis:142px}.plc-member-grid{grid-template-columns:1fr}}
    `; document.head.appendChild(style);
    shell.innerHTML=`<div class="plc-public"><div class="plc-community-hero"><div class="plc-community-kicker">PLACURSO · COMUNIDADE</div><h1>Entra. Experimenta. Descobre.</h1><p>Um espaço para ocupar a mente, divertir-te, aprender e descobrir novas capacidades.</p><button class="plc-community-btn" id="plcPsychStart">🧠 Fazer o desafio de 7 perguntas</button></div>
      <div class="plc-community-section"><div class="plc-community-title"><strong>Centro de Desafios</strong><span>escolhe uma experiência</span></div><div class="plc-challenge-row">
        <div class="plc-challenge-card"><button data-public-game="memoria"><span class="plc-tag">🧠 MENTE</span><b>Memória em cadeia</b><small>Observa, lembra e reconstrói a sequência.</small><small>▶ Experimentar</small></button></div>
        <div class="plc-challenge-card"><button data-gated="reflexo"><span class="plc-tag">🎯 FOCO</span><b>Reflexo rápido</b><small>Responde ao sinal certo no momento certo.</small><small class="plc-lock">🔒 Continua na comunidade</small></button></div>
        <div class="plc-challenge-card"><button data-gated="dinheiro"><span class="plc-tag">💰 DINHEIRO</span><b>Decisão financeira</b><small>Treina preço, margem e risco.</small><small class="plc-lock">🔒 Continua na comunidade</small></button></div>
        <div class="plc-challenge-card"><button data-gated="biblia"><span class="plc-tag">✝️ BÍBLIA</span><b>Conhecer Deus</b><small>Aprende histórias, princípios e ensinamentos.</small><small class="plc-lock">🔒 Descobrir</small></button></div>
      </div></div>
      <div class="plc-community-section"><div class="plc-mini"><h3>Acompanhar a tua evolução</h3><p>Guarda o que descobres sobre a tua prática e continua a partir de onde paraste.</p><button id="plcEvolutionCta">Ver como funciona</button></div></div>
      <div class="plc-footer-actions"><a href="https://www.bybit.com" target="_blank" rel="noopener">💱 Bybit</a><button id="plcStudentCta">Área de aluno</button></div></div>
      <div class="plc-member"><div class="plc-member-head"><div class="plc-community-kicker">ÁREA DE ALUNO</div><h2>Olá. Continua a tua jornada.</h2><p>O Centro de Desafios fica aqui no topo para escolheres o próximo passo.</p><button class="plc-community-btn" id="plcSignOut">Terminar sessão</button></div><div class="plc-community-section"><div class="plc-community-title"><strong>Centro de Desafios</strong><span>experiências disponíveis</span></div><div class="plc-member-grid">
        <div class="plc-member-card"><strong>🧠 Mente</strong><span>Memória e raciocínio.</span><button data-member-game="memoria">Abrir</button></div>
        <div class="plc-member-card"><strong>🎯 Foco</strong><span>Reflexo e atenção.</span><button data-member-game="reflexo">Abrir</button></div>
        <div class="plc-member-card"><strong>💰 Dinheiro</strong><span>Decisão e formação Trade.</span><button data-member-game="dinheiro">Abrir</button></div>
        <div class="plc-member-card"><strong>💼 Negócio</strong><span>Escolhas e estratégia.</span><button data-member-game="negocio">Abrir</button></div>
        <div class="plc-member-card"><strong>✝️ Bíblia</strong><span>Aprender e compreender.</span><button data-member-game="biblia">Abrir</button></div>
        <div class="plc-member-card"><strong>📈 Evolução</strong><span>Ver prática e próximos desafios.</span><button id="plcEvolution">Abrir</button></div>
      </div></div><div class="plc-annan-note" id="plcMemberNote"><b>ANNAN:</b> faz uma experiência. Depois do resultado, indica o próximo passo.</div></div>
      <div class="plc-experience" id="plcExperience"></div>`;
    hub.parentNode.insertBefore(shell,hub);
    hub.classList.add('plc-community-hide');
    var modal=document.createElement('div');modal.className='plc-modal';modal.innerHTML='<div class="plc-modal-box" id="plcModalBox"></div>';document.body.appendChild(modal);
    function state(){return Access.read();}
    function openModal(html){document.getElementById('plcModalBox').innerHTML=html;modal.classList.add('is-visible');}
    function closeModal(){modal.classList.remove('is-visible');}
    function authMessage(message){var target=document.getElementById('plcAuthMessage');if(target)target.textContent=message||'';}
    function userDisplayName(user,fallback){
      var metadata=user&&user.user_metadata?user.user_metadata:{};
      var candidate=fallback||metadata.full_name||metadata.name||(user&&user.email?user.email.split('@')[0]:'Aluno');
      return String(candidate||'Aluno').trim().slice(0,80)||'Aluno';
    }
    function localLearningState(){
      try{var saved=JSON.parse(localStorage.getItem(LEARNING_KEY)||'null');return saved&&typeof saved==='object'?saved:{version:1,events:[],processedIds:[]};}
      catch(e){return {version:1,events:[],processedIds:[]};}
    }
    function syncStudentLearning(){
      if(!Persistence||!window.PlacursoAnnanLearningCore)return Promise.resolve({ok:false,reason:'adapter_unavailable'});
      var local=localLearningState();
      return Persistence.syncEvents(local.events||[]).then(function(sync){
        return Persistence.bootstrap(window.PlacursoAnnanLearningCore,local).then(function(boot){
          var ok=!!(sync&&sync.ok&&boot&&boot.ok);
          var note=document.getElementById('plcMemberNote');
          if(note)note.textContent=ok
            ?'ANNAN: sessão autenticada. Histórico sincronizado com a tua conta e disponível noutros dispositivos.'
            :'ANNAN: sessão autenticada. O histórico local continua disponível; a sincronização será repetida quando a ligação estiver disponível.';
          return {ok:ok,sync:sync,bootstrap:boot};
        });
      }).catch(function(){
        var note=document.getElementById('plcMemberNote');
        if(note)note.textContent='ANNAN: sessão autenticada. O histórico local continua disponível; não foi possível sincronizar agora.';
        return {ok:false,reason:'sync_failed'};
      });
    }
    function activateMember(user,preferredName){
      if(!user||!user.id){authMessage('Não foi possível validar a sessão. Entra novamente.');return false;}
      authenticatedUser=user;
      var name=userDisplayName(user,preferredName);
      Access.register({name:name,email:user.email||null},localStorage);
      var heading=shell.querySelector('.plc-member-head h2');
      if(heading)heading.textContent='Olá, '+name+'. Continua a tua jornada.';
      closeModal();
      showMember();
      syncStudentLearning();
      return true;
    }
    function login(){
      openModal('<h3>Entrar na Área de Aluno</h3><p>Usa o email e a palavra-passe da tua conta Placurso.</p><div class="plc-form"><input id="plcLoginEmail" placeholder="Gmail ou e-mail" type="email" autocomplete="email"><input id="plcLoginPassword" placeholder="Palavra-passe" type="password" autocomplete="current-password"><button class="plc-community-btn" id="plcLoginSubmit">Entrar</button><div class="plc-auth-message" id="plcAuthMessage" role="status" aria-live="polite"></div><button class="plc-auth-link" id="plcShowSignup">Ainda não tenho conta</button></div>');
      document.getElementById('plcLoginSubmit').onclick=function(){
        var email=document.getElementById('plcLoginEmail').value.trim(),password=document.getElementById('plcLoginPassword').value;
        if(!email||!password){authMessage('Preenche o email e a palavra-passe.');return;}
        if(!Persistence){authMessage('O serviço de autenticação não está disponível. Tenta novamente mais tarde.');return;}
        var button=document.getElementById('plcLoginSubmit');button.disabled=true;button.textContent='A validar...';
        Persistence.signIn(email,password).then(function(result){
          if(!result.ok){button.disabled=false;button.textContent='Entrar';authMessage(result.reason==='unauthenticated'?'Não foi possível validar a sessão.':(result.reason||'Credenciais inválidas.'));return;}
          activateMember(result.user);
        }).catch(function(){button.disabled=false;button.textContent='Entrar';authMessage('Não foi possível iniciar sessão. Verifica a ligação e tenta novamente.');});
      };
      document.getElementById('plcShowSignup').onclick=function(){
        closeModal();
        if(Access.hasReferralThreshold(state()))register();else invite('student',null);
      };
    }
    function gameCard(kind){return hub.querySelector('[data-p3a="'+kind+'"]')||hub.querySelector('[data-g="'+kind+'"]');}
    function launchExisting(kind){var card=gameCard(kind);if(!card)return false;card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){card.click();},120);return true;}
    function psych(){
      var qs=Psych.questions(),i=0,answers={};
      function render(){var q=qs[i];openModal('<h3>🧠 Descobre como pensas</h3><p>São exatamente 7 perguntas. No fim, recebes uma leitura simples da tua experiência.</p><div class="plc-q"><b>'+ (i+1) +'/7 · '+q.text+'</b>'+q.options.map(function(o,n){return '<button class="plc-opt" data-a="'+n+'">'+o+'</button>';}).join('')+'</div>');document.querySelectorAll('#plcModalBox .plc-opt').forEach(function(b){b.onclick=function(){answers[q.id]=Number(b.dataset.a);if(i<6){i++;render();}else{var r=Psych.complete(answers);localStorage.setItem('placurso_psychotechnical_v1',JSON.stringify(r));if(r.completed&&window.dispatchEvent&&typeof CustomEvent==='function'){window.__placursoPsychEventNo=(window.__placursoPsychEventNo||0)+1;window.dispatchEvent(new CustomEvent('placurso:progress',{detail:{id:'psych-'+Date.now()+'-'+window.__placursoPsychEventNo,source:'psychotechnical',game:'psychotechnical',level:'entry',correct:r.correct,total:r.questions}}));}closeModal();invite('psych',r);}};});}
      render();
    }
    function invite(reason,result){
      var s=state();var sent=Number(s.referrals)||0;
      function paint(){s=state();sent=Number(s.referrals)||0;var slots='';for(var i=0;i<5;i++)slots+='<div class="plc-invite '+(i<sent?'sent':'')+'">'+(i<sent?'✓':'○')+' '+(i+1)+'</div>';
        openModal('<h3>🌱 Continua contigo</h3><p>Convida 5 pessoas para descobrirem esta experiência também. Aqui mostramos <b>convites enviados</b>, não fingimos que alguém se inscreveu.</p><div class="plc-invite-grid">'+slots+'</div><button class="plc-community-btn" id="plcShare">Convidar uma pessoa</button><button class="plc-mini" id="plcRegister" '+(sent<5?'disabled':'')+'>Continuar para inscrição</button><p class="plc-muted">'+(sent<5?'Faltam '+(5-sent)+' convite(s) enviados.':'Já podes seguir para a inscrição.')+'</p>');
        var share=document.getElementById('plcShare');share.onclick=function(){var id='invite-'+Date.now();var url=location.origin+location.pathname+'?convite='+encodeURIComponent(id);var text='Vem experimentar o Placurso comigo — um espaço para jogar, aprender e descobrir novas capacidades.';if(navigator.share){navigator.share({title:'Placurso',text:text,url:url}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(text+' '+url);}Access.addReferral(id);paint();};
        var reg=document.getElementById('plcRegister');reg.onclick=function(){if(sent>=5)register();};
      }
      paint();
    }
    function register(){
      openModal('<h3>👋 Criar conta Placurso</h3><p>Usa um email válido e cria uma palavra-passe com pelo menos 8 caracteres. A conta guarda a tua evolução entre dispositivos.</p><div class="plc-form"><input id="plcName" placeholder="Nome" autocomplete="name"><input id="plcEmail" placeholder="Gmail ou e-mail" type="email" autocomplete="email"><input id="plcPassword" placeholder="Criar palavra-passe (mínimo 8 caracteres)" type="password" minlength="8" autocomplete="new-password"><button class="plc-community-btn" id="plcFinish">Criar conta e entrar</button><div class="plc-auth-message" id="plcAuthMessage" role="status" aria-live="polite"></div><button class="plc-auth-link" id="plcOpenLogin">Já tenho conta — entrar</button></div>');
      document.getElementById('plcFinish').onclick=function(){
        var name=document.getElementById('plcName').value.trim(),email=document.getElementById('plcEmail').value.trim(),password=document.getElementById('plcPassword').value;
        if(!name||!email||password.length<8){authMessage('Preenche o nome, um email válido e uma palavra-passe com pelo menos 8 caracteres.');return;}
        if(!Persistence){authMessage('O serviço de autenticação não está disponível. Tenta novamente mais tarde.');return;}
        var button=document.getElementById('plcFinish');button.disabled=true;button.textContent='A criar conta...';
        Persistence.signUp(name,email,password).then(function(result){
          if(!result.ok){
            button.disabled=false;button.textContent='Criar conta e entrar';
            if(result.reason==='email_confirmation_required')authMessage('Conta criada. Confirma o email que enviámos e depois regressa para entrar na tua Área de Aluno.');
            else if(result.reason==='account_already_exists')authMessage('Este email já tem uma conta. Usa a opção “Já tenho conta — entrar”.');
            else authMessage(result.reason||'Não foi possível criar a conta. Verifica os dados e tenta novamente.');
            return;
          }
          activateMember(result.user,name);
        }).catch(function(){button.disabled=false;button.textContent='Criar conta e entrar';authMessage('Não foi possível criar a conta. Verifica a ligação e tenta novamente.');});
      };
      document.getElementById('plcOpenLogin').onclick=login;
    }
    function showMember(){if(!authenticatedUser)return login();shell.querySelector('.plc-public').classList.add('is-hidden');shell.querySelector('.plc-member').classList.add('is-visible');window.scrollTo({top:shell.offsetTop-8,behavior:'smooth'});}
    function showPublic(){shell.querySelector('.plc-public').classList.remove('is-hidden');shell.querySelector('.plc-member').classList.remove('is-visible');}
    function gated(kind){if(authenticatedUser){showMember();openExperience(kind);return;}invite('game',null);}
    function biblePanel(){var BIBLE_KEY='placurso_bible_progress_v1';function readBibleProgress(){try{var saved=JSON.parse(localStorage.getItem(BIBLE_KEY)||'null');return saved&&typeof saved==='object'?saved:{nextLevel:1,completed:0};}catch(e){return {nextLevel:1,completed:0};}}var bibleProgress=readBibleProgress();var level=Math.max(1,Math.min(3,Number(bibleProgress.nextLevel)||1)),m= Bible.mission(level),answers=[];function draw(){m=Bible.mission(level);answers=[];openModal('<h3>✝️ '+m.title+'</h3><p>Aprender primeiro. Jogar para compreender.</p>'+m.items.map(function(q,i){return '<div class="plc-q"><b>'+q.q+'</b>'+q.o.map(function(o,n){return '<button class="plc-opt" data-b="'+i+'" data-a="'+n+'">'+o+'</button>';}).join('')+'</div>';}).join('')+'<button class="plc-community-btn" id="plcBibleCheck">Ver resultado</button>');document.querySelectorAll('#plcModalBox .plc-opt').forEach(function(b){b.onclick=function(){answers[Number(b.dataset.b)]=Number(b.dataset.a);document.querySelectorAll('[data-b="'+b.dataset.b+'"]').forEach(function(x){x.style.fontWeight='400';});b.style.fontWeight='900';};});document.getElementById('plcBibleCheck').onclick=function(){var r=Bible.score(level,answers);bibleProgress.completed=Math.max(0,Number(bibleProgress.completed)||0)+1;bibleProgress.lastLevel=level;bibleProgress.lastScore=r.score;bibleProgress.nextLevel=r.passed?Math.min(3,level+1):level;try{localStorage.setItem(BIBLE_KEY,JSON.stringify(bibleProgress));}catch(e){}if(window.dispatchEvent&&typeof CustomEvent==='function'){window.dispatchEvent(new CustomEvent('placurso:progress',{detail:{id:'bible-'+Date.now()+'-'+bibleProgress.completed,source:'bible',game:'biblia',level:level,correct:r.correct,total:r.questions,passed:r.passed}}));}document.getElementById('plcModalBox').innerHTML='<h3>Resultado</h3><div class="plc-result">Acertaste '+r.correct+' de '+r.questions+'. '+(r.passed?'Boa base. O próximo nível aprofunda a compreensão.':'Continua a praticar; cada erro pode ensinar alguma coisa.')+'<br><small>'+m.items.map(function(x){return x.why;}).join(' ')+'</small></div><button class="plc-community-btn" id="plcBibleNext">'+(r.passed&&level<3?'Continuar nível '+(level+1):'Voltar à Área de Aluno')+'</button>';document.getElementById('plcBibleNext').onclick=function(){if(r.passed&&level<3){level++;draw();}else closeModal();};};}draw();}
    function openExperience(kind){if(kind==='biblia'){biblePanel();return;}var map={memoria:'memoria',reflexo:'reflexo',dinheiro:'dinheiro',negocio:'negocio'};var exp=document.getElementById('plcExperience');var names={memoria:['🧠 Memória em cadeia','Observa, lembra e reconstrói.'],reflexo:['🎯 Reflexo rápido','Responde ao sinal certo.'],dinheiro:['💰 Decisão financeira','Treina preço, margem e risco.'],negocio:['💼 Mini negócio','Escolhe ações e gere recursos.']};var x=names[kind]||names.memoria;exp.innerHTML='<h3>'+x[0]+'</h3><p>'+x[1]+'</p><div class="plc-result">A experiência abre no motor correspondente. No fim, o teu resultado volta para o teu percurso.</div><button class="plc-community-btn" id="plcLaunch">Começar</button>';exp.classList.add('is-visible');document.getElementById('plcLaunch').onclick=function(){launchExisting(map[kind]||'memoria');};exp.scrollIntoView({behavior:'smooth',block:'center'});}
    function evolution(){
      var p=window.PlacursoAnnanProfileCore,Learning=window.PlacursoAnnanLearningCore;
      function readStored(key){try{var value=JSON.parse(localStorage.getItem(key)||'null');return value&&typeof value==='object'?value:{};}catch(e){return {};}}
      var game=readStored(GAME_KEY),crypto=readStored(CRYPTO_KEY);
      var profile=p?p.deriveAnnanProfile(game,crypto):null;
      var rows='';
      if(profile&&profile.skills){Object.keys(profile.skills).forEach(function(k){var z=profile.skills[k];if(z.score!==null)rows+='<div class="plc-invite sent">'+z.icon+' '+z.label+': '+z.score+'%</div>';});}
      var learning=Learning?Learning.sanitizeLearningState(readStored('placurso_annan_learning_v1')):null;
      var analysis=p&&profile?p.analyseAnnanProfile(profile):null;
      var summary=Learning?Learning.summarizeLearning(learning):{totalEvents:0,averageScore:null};
      var next=Learning?Learning.recommendNextAction(profile,learning,analysis):{action:null,label:'Explorar desafios',reason:'Ainda não há resultados suficientes para sugerir um próximo passo.'};
      var stats=summary.totalEvents+' resultados guardados neste dispositivo'+(summary.averageScore===null?'':' · média geral '+summary.averageScore+'%');
      openModal('<h3>📈 A tua evolução</h3><p>Esta área mostra a prática que realmente realizaste. '+stats+'.</p><div class="plc-invite-grid" style="grid-template-columns:1fr 1fr">'+(rows||'<div class="plc-muted">Ainda não há dados suficientes.</div>')+'</div><div class="plc-annan-note"><b>ANNAN · LEITURA E PRÓXIMO PASSO</b><br>'+next.reason+'</div><button class="plc-community-btn" id="plcNextAction" '+(!next.action?'disabled':'')+'>'+next.label+'</button><button class="plc-mini" id="plcBack">Voltar</button>');
      document.getElementById('plcBack').onclick=closeModal;
      document.getElementById('plcNextAction').onclick=function(){
        if(!next.action)return;
        closeModal();
        if(next.action==='biblia'){biblePanel();return;}
        var target=next.action==='crypto'?'dinheiro':next.action;
        if(['memoria','reflexo','dinheiro','negocio'].indexOf(target)>=0){openExperience(target);return;}
        openExperience('memoria');
      };
    }
    document.getElementById('plcPsychStart').onclick=psych;
    document.getElementById('plcStudentCta').onclick=function(){if(authenticatedUser)showMember();else login();};
    document.getElementById('plcEvolutionCta').onclick=function(){if(authenticatedUser)evolution();else invite('evolution',null);};
    document.getElementById('plcEvolution').onclick=evolution;
    document.getElementById('plcSignOut').onclick=function(){
      if(!Persistence){authenticatedUser=null;showPublic();return;}
      var button=document.getElementById('plcSignOut');button.disabled=true;button.textContent='A terminar...';
      Persistence.signOut().then(function(result){
        if(!result.ok){button.disabled=false;button.textContent='Terminar sessão';var note=document.getElementById('plcMemberNote');if(note)note.textContent='Não foi possível terminar a sessão. Tenta novamente.';return;}
        authenticatedUser=null;
        var current=state();
        Access.write({status:'visitor',registered:false,profile:null,referrals:current.referrals,referralIds:current.referralIds},localStorage);
        showPublic();
      }).catch(function(){button.disabled=false;button.textContent='Terminar sessão';});
    };
    shell.querySelectorAll('[data-public-game]').forEach(function(b){b.onclick=function(){launchExisting(b.dataset.publicGame);};});shell.querySelectorAll('[data-gated]').forEach(function(b){b.onclick=function(){gated(b.dataset.gated);};});shell.querySelectorAll('[data-member-game]').forEach(function(b){b.onclick=function(){openExperience(b.dataset.memberGame);};});
    showPublic();
    if(Persistence&&typeof Persistence.getCurrentUser==='function'){
      Persistence.getCurrentUser().then(function(result){if(result&&result.ok&&result.user)activateMember(result.user);}).catch(function(){showPublic();});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
'''
s += marker + script.replace(r'\n','\n')
p.write_text(s,encoding='utf-8')
print('OK: fluxo público/comunidade/aluno aplicado.')
