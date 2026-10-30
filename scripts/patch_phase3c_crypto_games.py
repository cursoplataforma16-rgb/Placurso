from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker = "\n/* PLACURSO_PHASE3C_CRYPTO_GAMES */\n"
core_marker = "PLACURSO_CRYPTO_PROGRESS_CORE"
if marker in s:
    raise SystemExit('Fase 3C cripto já aplicada.')
if 'PLACURSO_PHASE3B_TRADE_EDUCATION' not in s:
    raise SystemExit('ERRO: formação Trade deve existir antes da Fase 3C.')

core_path = Path(__file__).with_name('crypto_progression_core.js')
if not core_path.is_file():
    raise SystemExit('ERRO: crypto_progression_core.js não encontrado.')
core_source = core_path.read_text(encoding='utf-8')
if core_marker in s:
    raise SystemExit('ERRO: motor de progressão cripto já existe no motor base.')

script = r'''
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    var trade=hub&&hub.querySelector('.p3b-trade');
    var Progress=window.PlacursoCryptoProgression;
    if(!hub||!trade||!Progress||hub.dataset.cryptoGames==='1') return;
    hub.dataset.cryptoGames='1';
    var KEY='placurso_crypto_learning_v2';
    var LEGACY_KEY='placurso_crypto_learning_v1';
    function read(key){
      try{
        var value=JSON.parse(localStorage.getItem(key)||'null');
        return value&&typeof value==='object'?value:null;
      }catch(e){return null;}
    }
    var state=Progress.migrateCryptoState(read(LEGACY_KEY),read(KEY));
    function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
    persist();
    var levels={
      basic:{name:'Básico',tag:'FUNDAMENTOS',questions:[
        {q:'O preço de um ativo pode subir e descer. Qual é a primeira regra de aprendizagem?',a:['Entender o risco antes da decisão','Comprar sempre que subir','Usar todo o capital'],ok:0,why:'Antes de decidir, identifica o risco e o contexto.'},
        {q:'Se não sabes porque o preço está a mover-se, qual é a decisão mais educativa?',a:['Esperar e observar','Entrar imediatamente','Aumentar o tamanho da posição'],ok:0,why:'Esperar também é uma decisão quando faltam informações.'},
        {q:'O que significa diversificar?',a:['Distribuir exposição entre ativos','Garantir lucro','Eliminar todo o risco'],ok:0,why:'Diversificação pode reduzir concentração, mas não elimina risco.'}
      ]},
      intermediate:{name:'Intermédio',tag:'DECISÃO',questions:[
        {q:'Um cenário oferece possível ganho maior, mas também risco maior. O que deves comparar?',a:['Risco e recompensa','Apenas o ganho','Apenas o preço'],ok:0,why:'A decisão deve considerar os dois lados do cenário.'},
        {q:'O mercado sobe rapidamente depois de uma queda. O que falta confirmar antes de agir?',a:['Contexto e força do movimento','Que todos estão a comprar','Que o preço nunca voltará'],ok:0,why:'Um movimento isolado não prova uma tendência.'},
        {q:'Gestão de capital serve principalmente para:',a:['Controlar a exposição ao risco','Aumentar sempre o lucro','Prever o preço com certeza'],ok:0,why:'Gestão de capital limita o impacto de decisões erradas.'}
      ]},
      advanced:{name:'Avançado',tag:'CENÁRIOS',questions:[
        {q:'Há sinais de alta, mas o risco/recompensa piorou. O que pesa mais?',a:['A qualidade do cenário completo','A vontade de entrar','O último candle isolado'],ok:0,why:'Confluência e contexto importam mais que um sinal isolado.'},
        {q:'Num cenário lateral, uma entrada perto do centro da faixa tende a ter:',a:['Menor clareza de risco/recompensa','Garantia de continuação','Risco zero'],ok:0,why:'O contexto pode oferecer menos vantagem quando o preço está no meio da faixa.'},
        {q:'Uma sequência de perdas acontece. Qual resposta demonstra disciplina?',a:['Rever regras e reduzir exposição','Aumentar a posição para recuperar','Ignorar o histórico'],ok:0,why:'Disciplina significa preservar o processo quando o resultado é desfavorável.'}
      ]}
    };
    var css=document.createElement('style');
    css.textContent=".p3c-panel{margin-top:12px;padding:14px;border-radius:16px;background:#fff;color:#202A24;border:1px solid #DDD3C2}.p3c-panel h4{margin:0 0 4px;font-size:15px}.p3c-meta{display:flex;justify-content:space-between;gap:8px;color:#70695E;font-size:9px}.p3c-progress{height:6px;background:#E8E0D2;border-radius:99px;overflow:hidden;margin:9px 0}.p3c-progress i{display:block;height:100%;background:#A43D2F;width:0}.p3c-question{font-size:13px;line-height:1.45;font-weight:800;margin:10px 0}.p3c-options{display:grid;gap:7px}.p3c-option{border:1px solid #D8D0C1;background:#FAF8F3;border-radius:11px;padding:10px;text-align:left;cursor:pointer;font-size:10px;font-weight:800}.p3c-option:hover,.p3c-option:focus-visible{border-color:#A43D2F;outline:2px solid #D8C59F;outline-offset:1px}.p3c-feedback{margin-top:9px;padding:9px;border-radius:10px;background:#F1EEE7;font-size:10px;line-height:1.45}.p3c-next{margin-top:9px;border:0;border-radius:10px;padding:10px 13px;background:#202A24;color:#fff;font-weight:900;cursor:pointer}.p3c-score{margin-top:8px;font-size:10px;color:#5F665F}.p3c-badge{display:inline-block;padding:4px 6px;border-radius:999px;background:#EEE6D6;font-size:8px;font-weight:900}.p3c-locked{opacity:.55;cursor:not-allowed}";
    document.head.appendChild(css);
    var panel=document.createElement('div');panel.className='p3c-panel';panel.setAttribute('aria-live','polite');trade.appendChild(panel);
    var current=null,index=0,score=0,answered=false;
    function refreshLevels(){
      trade.querySelectorAll('[data-trade-level]').forEach(function(btn){
        var unlocked=Progress.canStartCryptoLevel(state,btn.dataset.tradeLevel);
        btn.disabled=!unlocked;
        btn.classList.toggle('p3c-locked',!unlocked);
        btn.setAttribute('aria-disabled',unlocked?'false':'true');
      });
    }
    function renderLevel(k){
      if(!Progress.canStartCryptoLevel(state,k)){
        panel.innerHTML='<h4>Próximo nível bloqueado</h4><p>Conclui pelo menos 2 missões aprovadas no nível anterior para desbloquear esta etapa.</p>';
        return;
      }
      current=k;index=0;score=0;answered=false;renderQuestion();
    }
    function renderQuestion(){
      var g=levels[current],q=g.questions[index];
      panel.innerHTML='<div class="p3c-meta"><span>💰 '+g.name+' · '+g.tag+'</span><span>Questão '+(index+1)+'/'+g.questions.length+'</span></div><div class="p3c-progress"><i style="width:'+((index/g.questions.length)*100)+'%"></i></div><div class="p3c-question">'+q.q+'</div><div class="p3c-options">'+q.a.map(function(x,i){return '<button type="button" class="p3c-option" data-answer="'+i+'">'+x+'</button>';}).join('')+'</div><div class="p3c-score">Pontuação: '+score+'</div>';
      answered=false;
    }
    function finish(){
      var g=levels[current];
      var result=Progress.recordCryptoMission(state,current,score,g.questions.length);
      state=result.state;
      persist();
      refreshLevels();
      if(window.dispatchEvent&&typeof CustomEvent==='function'){
        window.dispatchEvent(new CustomEvent('placurso:progress',{detail:{source:'crypto',level:current,correct:score,total:g.questions.length,passed:result.passed}}));
      }
      var unlockedNext=current==='basic'?'intermediate':current==='intermediate'?'advanced':null;
      var nextButton=unlockedNext&&Progress.canStartCryptoLevel(state,unlockedNext)
        ?'<button type="button" class="p3c-next" data-unlock="'+unlockedNext+'">Continuar para '+levels[unlockedNext].name+'</button>':'';
      panel.innerHTML='<h4>'+(result.passed?'Missão aprovada · ':'Missão registada · ')+g.name+'</h4><p>Resultado: <strong>'+score+'/'+g.questions.length+'</strong>. '+(result.passed?'Atingiste o mínimo de 2 respostas certas.':'Ainda não atingiste 2 respostas certas. Revê o feedback e tenta novamente; a tentativa não desbloqueia o próximo nível.')+'</p><div class="p3c-badge">XP total: '+state.xp+'</div><br><button type="button" class="p3c-next" data-replay="1">Jogar novamente</button>'+nextButton;
    }
    panel.addEventListener('click',function(e){
      var opt=e.target.closest('[data-answer]');
      if(opt&&!answered){
        answered=true;
        var q=levels[current].questions[index],ok=Number(opt.dataset.answer)===q.ok;
        if(ok)score+=1;
        panel.querySelectorAll('.p3c-option').forEach(function(b){b.disabled=true;b.style.opacity='.6';});
        var f=document.createElement('div');f.className='p3c-feedback';f.textContent=(ok?'✓ Correto. ':'↺ Ainda não. ')+q.why;panel.appendChild(f);
        var b=document.createElement('button');b.type='button';b.className='p3c-next';b.textContent=index===levels[current].questions.length-1?'Ver resultado':'Próxima missão';b.dataset.next='1';panel.appendChild(b);
        return;
      }
      if(e.target.closest('[data-next]')){
        if(index<levels[current].questions.length-1){index++;renderQuestion();}else finish();
        return;
      }
      if(e.target.closest('[data-replay]')){renderLevel(current);return;}
      var u=e.target.closest('[data-unlock]');if(u)renderLevel(u.dataset.unlock);
    });
    trade.querySelectorAll('[data-trade-level]').forEach(function(btn){
      btn.addEventListener('click',function(){renderLevel(btn.dataset.tradeLevel);});
    });
    refreshLevels();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
'''
s += "\n/* " + core_marker + " */\n" + core_source + marker + script
