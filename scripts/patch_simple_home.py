from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker = "\n/* PLACURSO_SIMPLE_HOME_V1 */\n"
if marker in s:
    raise SystemExit('Simple home já aplicado.')
if 'PLACURSO_PHASE3D_ANNAN_PROFILE' not in s:
    raise SystemExit('ERRO: simple home requer a Fase 3D.')

script = r'''
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    if(!hub || document.querySelector('.plc-simple-home') || hub.dataset.simpleHome==='1') return;
    hub.dataset.simpleHome='1';
    var CORE=window.PlacursoAnnanProfileCore;
    var GAME_KEY='placurso_phase3a_games_v1';
    var CRYPTO_KEY='placurso_crypto_learning_v2';
    var home=document.createElement('section');
    home.className='plc-simple-home';
    home.setAttribute('aria-label','Página inicial simples do Placurso');
    var css=document.createElement('style');
    css.textContent=".plc-simple-home{margin:0 auto 18px;padding:16px;border:1px solid #D9C8A7;border-radius:22px;background:linear-gradient(180deg,#fffdf8,#f7f2e9);color:#202A24;box-shadow:0 12px 30px rgba(32,42,36,.07)}.plc-simple-head{padding:18px;border-radius:18px;background:#202A24;color:#F7EBD1}.plc-simple-kicker{font-size:9px;font-weight:900;letter-spacing:1.5px;color:#D8C59F}.plc-simple-title{margin:7px 0 6px;font-size:clamp(25px,7vw,34px);line-height:1.04}.plc-simple-copy{margin:0;color:#E6DDCB;font-size:11px;line-height:1.5}.plc-simple-primary{width:100%;min-height:50px;margin-top:14px;border:0;border-radius:13px;background:#A43D2F;color:#fff;font-size:13px;font-weight:950;cursor:pointer}.plc-simple-primary:focus-visible,.plc-simple-chip:focus-visible,.plc-simple-secondary:focus-visible{outline:3px solid #D8C59F;outline-offset:2px}.plc-simple-today{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding:12px;border:1px solid #D9C8A7;border-radius:14px;background:#FBF6EA}.plc-simple-today strong{display:block;font-size:12px}.plc-simple-today span{display:block;margin-top:3px;color:#756D60;font-size:9px}.plc-simple-pill{padding:5px 7px;border-radius:999px;background:#EEE6D6;font-size:8px;font-weight:900;white-space:nowrap}.plc-simple-section{margin-top:14px}.plc-simple-section-title{display:flex;justify-content:space-between;align-items:end;gap:8px;margin-bottom:8px}.plc-simple-section-title h3{margin:0;font-size:15px}.plc-simple-section-title span{font-size:8px;color:#756D60}.plc-simple-evolution{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.plc-simple-stat{padding:10px;border:1px solid #E0D5C2;border-radius:13px;background:#fff}.plc-simple-stat strong{display:block;font-size:18px}.plc-simple-stat small{display:block;margin-top:3px;color:#756D60;font-size:8px}.plc-simple-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.plc-simple-chip{padding:11px;border:1px solid #E0D5C2;border-radius:13px;background:#fff;text-align:left;cursor:pointer}.plc-simple-chip-top{display:flex;justify-content:space-between;gap:6px;font-size:10px;font-weight:900}.plc-simple-meter{height:5px;margin-top:7px;border-radius:99px;background:#E8E0D2;overflow:hidden}.plc-simple-meter i{display:block;height:100%;border-radius:99px;background:#A43D2F}.plc-simple-chip small{display:block;margin-top:4px;color:#756D60;font-size:8px}.plc-simple-bottom{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.plc-simple-secondary{min-height:42px;border:1px solid #D8CDBB;border-radius:11px;background:#fff;color:#202A24;font-size:10px;font-weight:900;cursor:pointer}.plc-simple-annan{margin-top:10px;padding:11px 12px;border-radius:13px;background:#202A24;color:#EEE5D7;font-size:9px;line-height:1.45}.plc-simple-annan strong{color:#fff}.plc-simple-hidden{display:none!important}@media(max-width:380px){.plc-simple-home{padding:12px}.plc-simple-head{padding:15px}.plc-simple-title{font-size:25px}.plc-simple-evolution{grid-template-columns:1fr 1fr}.plc-simple-stat:last-child{grid-column:1/-1}.plc-simple-bottom{grid-template-columns:1fr}.plc-simple-skills{gap:6px}}";
    document.head.appendChild(css);
    home.innerHTML='<div class="plc-simple-head"><div class="plc-simple-kicker">PLACURSO · ANNAN</div><h1 class="plc-simple-title">Olá. Vamos descobrir o teu próximo nível.</h1><p class="plc-simple-copy">Uma experiência curta. Um resultado. Um próximo passo.</p><button type="button" class="plc-simple-primary" id="plcContinue">▶ Continuar desafio</button></div><div class="plc-simple-today"><div><strong id="plcTodayTitle">Desafio de hoje · 2 min</strong><span id="plcTodayText">O ANNAN escolhe uma experiência para começar.</span></div><span class="plc-simple-pill" id="plcTodayBadge">ABERTO</span></div><div class="plc-simple-section"><div class="plc-simple-section-title"><h3>A minha evolução</h3><span>baseada na tua prática</span></div><div class="plc-simple-evolution"><div class="plc-simple-stat"><strong id="plcXp">0</strong><small>XP acumulado</small></div><div class="plc-simple-stat"><strong id="plcRounds">0</strong><small>experiências</small></div><div class="plc-simple-stat"><strong id="plcStrong">—</strong><small>área mais forte</small></div></div></div><div class="plc-simple-section"><div class="plc-simple-section-title"><h3>Escolhe uma habilidade</h3><span>começa por onde quiseres</span></div><div class="plc-simple-skills" id="plcSkills"></div><div class="plc-simple-bottom"><button type="button" class="plc-simple-secondary" id="plcMoney">💰 Dinheiro / Trade</button><button type="button" class="plc-simple-secondary" id="plcAll">Ver desafios</button></div></div><div class="plc-simple-annan" id="plcAnnan"><strong>ANNAN:</strong> faz um desafio. Depois do resultado, mostro-te o próximo passo.</div>';
    hub.parentNode.insertBefore(home,hub);

    function read(key){try{var x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:null;}catch(e){return null;}}
    function profile(){return CORE?CORE.deriveAnnanProfile(read(GAME_KEY),read(CRYPTO_KEY)):null;}
    function launchGame(kind){
      var card=hub.querySelector('[data-p3a="'+kind+'"]');
      if(card){card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){card.click();},150);return true;}
      var fallback=hub.querySelector('[data-g="'+kind+'"]');
      if(fallback){fallback.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){fallback.click();},150);return true;}
      return false;
    }
    function launchCrypto(){
      var trade=hub.querySelector('.p3b-trade');
      if(!trade)return false;
      var level='basic',crypto=window.PlacursoCryptoProgression,state=read(CRYPTO_KEY)||{};
      if(crypto&&crypto.canStartCryptoLevel(state,'intermediate'))level='intermediate';
      if(crypto&&crypto.canStartCryptoLevel(state,'advanced'))level='advanced';
      var button=trade.querySelector('[data-trade-level="'+level+'"]');
      if(button){button.click();trade.scrollIntoView({behavior:'smooth',block:'center'});return true;}
      return false;
    }
    function dailyKind(){var keys=['memoria','reflexo','dinheiro','negocio'],d=new Date(),n=d.getFullYear()+d.getMonth()+d.getDate();return keys[Math.abs(n)%keys.length];}
    function render(){
      var p=profile(),games=p&&p.skills?['memory','focus','decision','finance','strategy'].map(function(id){return p.skills[id];}):[];
      var gameState=read(GAME_KEY)||{},crypto=read(CRYPTO_KEY)||{};
      var xp=Number(gameState.xp)||0,rounds=Number(gameState.plays)||0;
      var cryptoXp=Number(crypto.xp)||0,cryptoCompleted=Number(crypto.completed)||0;
      document.getElementById('plcXp').textContent=xp+cryptoXp;
      document.getElementById('plcRounds').textContent=rounds+cryptoCompleted;
      var labels={memory:'Memória',focus:'Foco',decision:'Decisão',finance:'Finanças',strategy:'Estratégia',business:'Negócio',ai:'IA'};
      var order=['memory','focus','decision','finance','strategy','business'];
      var host=document.getElementById('plcSkills');
      if(p&&p.skills){host.innerHTML=order.map(function(id){var s=p.skills[id],v=s.score===null?0:s.score;return '<button type="button" class="plc-simple-chip" data-skill="'+id+'"><div class="plc-simple-chip-top"><span>'+s.icon+' '+s.label+'</span><span>'+(s.score===null?'—':s.score+'%')+'</span></div><div class="plc-simple-meter"><i style="width:'+v+'%"></i></div><small>'+(s.samples?'em evolução':'por iniciar')+'</small></button>';}).join('');
        var strong=p.strongest;document.getElementById('plcStrong').textContent=strong&&strong.label?strong.label:'—';
      }else{host.innerHTML='<button type="button" class="plc-simple-chip" data-skill="memory"><div class="plc-simple-chip-top"><span>🧠 Mente</span><span>—</span></div><small>começar</small></button>';}
      var k=dailyKind(),names={memoria:'Memória',reflexo:'Foco',dinheiro:'Decisão financeira',negocio:'Negócio'};document.getElementById('plcTodayText').textContent='Hoje: '+names[k]+'. Faz uma ronda e recebe o teu resultado.';
      var played=rounds+cryptoCompleted>0;document.getElementById('plcTodayBadge').textContent=played?'CONTINUAR':'COMEÇAR';
      if(played)document.getElementById('plcAnnan').innerHTML='<strong>ANNAN:</strong> já tens sinais de evolução. O próximo passo é superar a tua própria marca.';
    }
    document.getElementById('plcContinue').addEventListener('click',function(){var p=profile(),next=p&&CORE?CORE.analyseAnnanProfile(p).next:null;if(next&&next.action==='crypto'){launchCrypto();return;}var map={memory:'memoria',focus:'reflexo',decision:'dinheiro',finance:'dinheiro',strategy:'negocio',business:'negocio'};launchGame(map[next&&next.id]||dailyKind());});
    document.getElementById('plcMoney').addEventListener('click',launchCrypto);
    document.getElementById('plcAll').addEventListener('click',function(){var first=hub.querySelector('[data-p3a="memoria"]');if(first)first.scrollIntoView({behavior:'smooth',block:'center'});});
    document.getElementById('plcSkills').addEventListener('click',function(e){var b=e.target.closest('[data-skill]');if(!b)return;var map={memory:'memoria',focus:'reflexo',decision:'dinheiro',finance:'dinheiro',strategy:'negocio',business:'negocio',ai:null};if(map[b.dataset.skill])launchGame(map[b.dataset.skill]);else document.getElementById('plcAnnan').innerHTML='<strong>ANNAN:</strong> a experiência de IA será disponibilizada quando houver dados próprios suficientes.';});
    /* Technical phase panels remain in the DOM for their engines, but not in the primary user journey. */
    ['.p3b-experience','.p3d-profile','#annanPhase3AVisible'].forEach(function(sel){hub.querySelectorAll(sel).forEach(function(el){el.classList.add('plc-simple-hidden');});});
    render();
    window.addEventListener('placurso:progress',function(){setTimeout(render,30);});
    window.addEventListener('storage',function(){setTimeout(render,30);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
'''
script = script.replace(r'\n', '\n')
s += marker + script
p.write_text(s, encoding='utf-8')
print('OK: interface simples Placurso adicionada.')
