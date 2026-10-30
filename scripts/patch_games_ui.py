from pathlib import Path
import sys

p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('psico-engine.js')
s=p.read_text()
needle="    var el=document.createElement('section');\n    el.className='pch-challenges';\n"
repl="""    var el=document.createElement('section');
    el.className='pch-challenges pch-games-hub';
    var css=document.createElement('style');
    css.textContent=`
      .pch-games-hub{max-width:980px;margin:0 auto;padding:4px 0 28px;color:#202A24}
      .pch-games-hero{padding:22px 18px;border:1px solid #D9C8A7;border-radius:20px;background:linear-gradient(135deg,#202A24,#39483E);color:#F7EBD1;box-shadow:0 16px 36px rgba(32,42,36,.14)}
      .pch-games-eyebrow{font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D8C59F}.pch-games-title{margin:8px 0 0;font-size:clamp(26px,5vw,38px);line-height:1.08}.pch-games-subtitle{margin:9px 0 0;color:#E6DDCB;font-size:14px;line-height:1.6}
      .pch-games-nav{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:none}.pch-games-nav::-webkit-scrollbar{display:none}.pch-game-filter{flex:0 0 auto;min-height:42px;padding:0 14px;border:1px solid #D8C9AE;border-radius:999px;background:#FFFDF7;color:#40392F;font-weight:900}.pch-game-filter.is-active{background:#A43D2F;border-color:#A43D2F;color:#fff}
      .pch-game-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0 18px}.pch-game-tile{padding:14px;border:1px solid #E0D5C2;border-radius:15px;background:#FFFDF8;cursor:pointer;text-align:left;box-shadow:0 7px 18px rgba(58,45,24,.06)}.pch-game-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#EEE6D6;font-size:20px;margin-bottom:9px}.pch-game-tile strong{display:block;font-size:14px}.pch-game-tile span span{display:block;margin-top:4px;font-size:11px;color:#6A6255}
      .pch-game-section{margin:8px 0}.pch-game-section-head{display:flex;justify-content:space-between;gap:12px;margin:0 0 8px}.pch-game-section-head h3{margin:0;font-size:18px}.pch-game-section-head p{margin:0;color:#756D60;font-size:11px}.pch-challenge-card.pch-game-card{margin-top:10px!important;border-radius:18px!important}
      .pch-phase1{margin:18px 0;padding:16px;border:1px solid #E0D5C2;border-radius:18px;background:#fffdf8}.pch-phase1-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:12px}.pch-phase1-head h3{margin:0;font-size:19px}.pch-phase1-head p{margin:4px 0 0;color:#756D60;font-size:12px}.pch-phase1-badge{padding:6px 9px;border-radius:999px;background:#EEE6D6;font-size:10px;font-weight:900}.pch-micro-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.pch-micro-card{padding:12px;border:1px solid #E3D9C8;border-radius:14px;background:#fff;cursor:pointer;text-align:left;min-height:132px}.pch-micro-card strong{display:block;font-size:13px}.pch-micro-card small{display:block;margin-top:5px;color:#756D60;line-height:1.4}.pch-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.pch-tag{padding:4px 7px;border-radius:999px;background:#F1ECE3;font-size:9px;font-weight:900;color:#574E42}
      .pch-runner{display:none;margin-top:12px;padding:14px;border:1px solid #D9C8A7;border-radius:15px;background:#F9F5EC}.pch-runner.is-open{display:block}.pch-runner-top{display:flex;justify-content:space-between;gap:8px}.pch-runner-title{font-weight:900}.pch-runner-meta{font-size:11px;color:#756D60}.pch-runner-question{margin:14px 0;font-size:18px;font-weight:900}.pch-runner-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pch-runner-btn{min-height:46px;border:1px solid #D7CDBD;border-radius:12px;background:#fff;font-weight:900;cursor:pointer}.pch-runner-btn.primary{background:#202A24;color:#fff;border-color:#202A24}.pch-runner-result{margin-top:12px;padding:11px;border-radius:12px;background:#EEE6D6;font-size:13px;line-height:1.5}
      @media(max-width:720px){.pch-game-grid,.pch-micro-grid{grid-template-columns:1fr}.pch-game-tile{display:flex;align-items:center;gap:11px;padding:11px}.pch-game-icon{margin:0;flex:0 0 40px}.pch-game-section-head,.pch-phase1-head{align-items:flex-start;flex-direction:column;gap:3px}.pch-micro-card{min-height:0}.pch-runner-actions{grid-template-columns:1fr}.pch-games-hero{padding:19px 15px;border-radius:17px}}
    `;
    document.head.appendChild(css);
"""
if needle not in s: raise SystemExit('UI anchor not found')
s=s.replace(needle,repl,1)
old='''      <p class="pch-section-kicker">TREINE A MENTE</p>
      <h2 class="pch-h2" id="annanChallengeTitle">Desafios que mudam a cada ronda</h2>
      <p style="margin:9px 0 0;color:#55657C;font-size:14px;line-height:1.55">Raciocínio, atenção, memória, personalidade, aptidão, percentagens, proporções, séries figurativas e tomada de decisão. A ronda é aleatória. Praticar com regularidade ajuda a ganhar familiaridade, confiança e rapidez — sem substituir uma avaliação psicológica profissional.</p>
      <div class="pch-challenge-card" id="annanChallengeCard">'''
new='''      <div class="pch-games-hero"><span class="pch-games-eyebrow">◈ ANNAN · CENTRO DE DESAFIOS</span><h2 class="pch-games-title" id="annanChallengeTitle">Jogue, teste-se e descubra onde pode melhorar.</h2><p class="pch-games-subtitle">Entre rápido, experimente uma habilidade e receba orientação. A experiência cresce por níveis.</p></div>
      <nav class="pch-games-nav" aria-label="Categorias de jogos"><button type="button" class="pch-game-filter is-active" data-game-filter="all">Todos</button><button type="button" class="pch-game-filter" data-game-filter="mente">🧠 Mente</button><button type="button" class="pch-game-filter" data-game-filter="foco">◷ Foco</button><button type="button" class="pch-game-filter" data-game-filter="estrategia">♟ Estratégia</button></nav>
      <div class="pch-game-grid" aria-label="Atalhos dos jogos"><button type="button" class="pch-game-tile" data-jump="annanChallengeCard" data-game-category="mente"><span class="pch-game-icon">🧠</span><span><strong>Desafio psicotécnico</strong><span>10 perguntas · diagnóstico</span></span></button><button type="button" class="pch-game-tile" data-jump="annanCounterGame" data-game-category="foco"><span class="pch-game-icon">◷</span><span><strong>Jogo do Contador</strong><span>Meta de tempo · concentração</span></span></button><button type="button" class="pch-game-tile" data-jump="annanChessGame" data-game-category="estrategia"><span class="pch-game-icon">♟</span><span><strong>Xadrez com ANNAN</strong><span>Posições · decisão · estratégia</span></span></button></div>
      <div class="pch-phase1" id="annanMicrogamesPhase1"><div class="pch-phase1-head"><div><h3>Fase 1 · Microjogos</h3><p>Entrar rápido, jogar pouco tempo e ganhar experiência. A dificuldade cresce por níveis.</p></div><span class="pch-phase1-badge">TESTÁVEL</span></div><div class="pch-micro-grid"><button class="pch-micro-card" type="button" data-microgame="decision"><strong>⚡ Decisão em 30s</strong><small>Escolha a melhor ação antes que o cenário mude.</small><div class="pch-tags"><span class="pch-tag">DECISÃO</span><span class="pch-tag">RÁPIDO</span></div></button><button class="pch-micro-card" type="button" data-microgame="pattern"><strong>🧩 Encontra o padrão</strong><small>Observe, descubra a regra e complete a sequência.</small><div class="pch-tags"><span class="pch-tag">MENTE</span><span class="pch-tag">LÓGICA</span></div></button><button class="pch-micro-card" type="button" data-microgame="focus"><strong>🎯 Foco Relâmpago</strong><small>Segure a atenção enquanto a experiência aumenta.</small><div class="pch-tags"><span class="pch-tag">FOCO</span><span class="pch-tag">ATENÇÃO</span></div></button></div><div class="pch-runner" id="annanMicroRunner"></div></div>
      <div class="pch-game-section" data-game-section="mente"><div class="pch-game-section-head"><h3>Desafio psicotécnico</h3><p>Treino rápido com resultado no fim</p></div><div class="pch-challenge-card pch-game-card" id="annanChallengeCard">'''
if old not in s: raise SystemExit('template anchor not found')
s=s.replace(old,new,1)
s=s.replace('''      </div>
      <div class="pch-challenge-card" id="annanCounterGame"''','''      </div></div>
      <div class="pch-game-section" data-game-section="foco"><div class="pch-game-section-head"><h3>Foco e percepção do tempo</h3><p>Exercício curto, sem pressão</p></div><div class="pch-challenge-card pch-game-card" id="annanCounterGame"''',1)
s=s.replace('''      </div>
      <div class="pch-challenge-card" id="annanChessGame"''','''      </div></div>
      <div class="pch-game-section" data-game-section="estrategia"><div class="pch-game-section-head"><h3>Estratégia com ANNAN</h3><p>Pense antes de agir</p></div><div class="pch-challenge-card pch-game-card" id="annanChessGame"''',1)
end='''      </div>`;
    host.replaceChild(el,old);'''
replend='''      </div></div></div>`;
    host.replaceChild(el,old);
    var filters=el.querySelectorAll('[data-game-filter]'),sections=el.querySelectorAll('[data-game-section]');
    function applyFilter(filter){filters.forEach(function(b){b.classList.toggle('is-active',b.dataset.gameFilter===filter);});sections.forEach(function(sec){sec.hidden=filter!=='all'&&sec.dataset.gameSection!==filter;});}
    filters.forEach(function(b){b.addEventListener('click',function(){applyFilter(b.dataset.gameFilter);});});
    el.querySelectorAll('[data-jump]').forEach(function(b){b.addEventListener('click',function(){var target=el.querySelector('#'+b.dataset.jump);if(!target)return;applyFilter(b.dataset.gameCategory);target.scrollIntoView({behavior:'smooth',block:'start'});});});
    (function(){
      var runner=el.querySelector('#annanMicroRunner'),level=1,xp=0,timer=null;
      var data={
        decision:{title:'Decisão em 30s',rounds:[['Tens 10 minutos e três tarefas. O que fazes primeiro?',['A mais urgente','A mais fácil']],['Um cliente hesita. O primeiro passo é:',['Descobrir a objeção','Dar desconto já']],['O plano mudou. O melhor é:',['Reavaliar prioridades','Continuar igual']]]},
        pattern:{title:'Encontra o padrão',rounds:[['2 · 4 · 8 · 16 · ?',['24','32']],['3 · 6 · 12 · 24 · ?',['36','48']],['5 · 10 · 20 · 40 · ?',['60','80']]]},
        focus:{title:'Foco Relâmpago',rounds:[['Qual símbolo é diferente? ● ● ● ○ ●',['○','●']],['Qual palavra não pertence? FOCO · FOCO · FOGO · FOCO',['FOGO','FOCO']],['Escolha o número diferente: 7 · 7 · 7 · 9 · 7',['9','7']] ]}
      };
      function renderGame(kind){var game=data[kind],round=game.rounds[Math.floor(Math.random()*game.rounds.length)];runner.classList.add('is-open');runner.innerHTML='<div class="pch-runner-top"><span class="pch-runner-title">'+game.title+'</span><span class="pch-runner-meta">Nível '+level+' · '+xp+' XP</span></div><div class="pch-runner-question">'+round[0]+'</div><div class="pch-runner-actions"><button class="pch-runner-btn primary" data-answer="0">'+round[1][0]+'</button><button class="pch-runner-btn" data-answer="1">'+round[1][1]+'</button></div><div class="pch-runner-meta" style="margin-top:9px">Tempo: '+(level===1?'30s':level===2?'45s':'60s')+' · experiência '+(level*10)+' XP</div>';
        clearTimeout(timer);timer=setTimeout(function(){finish(false)},level===1?30000:level===2?45000:60000);
        runner.querySelectorAll('[data-answer]').forEach(function(btn){btn.addEventListener('click',function(){finish(btn.dataset.answer==='0');});});
        function finish(ok){clearTimeout(timer);xp+=ok?level*10:Math.max(2,level*3);if(ok&&level<3)level++;runner.innerHTML='<div class="pch-runner-result"><strong>'+(ok?'Boa escolha.':'Boa tentativa.')+'</strong><br>'+(ok?'A decisão foi coerente com a regra desta ronda.':'Observe a regra antes de decidir. Cada tentativa serve para aprender.')+'<br><span>ANNAN: '+xp+' XP · Nível '+level+'.</span></div><button class="pch-runner-btn primary" style="width:100%;margin-top:9px" data-replay="1">Jogar novamente</button>';runner.querySelector('[data-replay]').addEventListener('click',function(){renderGame(kind);});}
      }
      el.querySelectorAll('[data-microgame]').forEach(function(card){card.addEventListener('click',function(){renderGame(card.dataset.microgame);});});
    })();
'''
if end not in s: raise SystemExit('end anchor not found')
s=s.replace(end,replend,1)
p.write_text(s)
