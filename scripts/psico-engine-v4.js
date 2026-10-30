/* V4 UI/UX engine for Placurso games. Generated from the existing psychometric engine with a reorganized game hub, category filters, mobile-first cards, focus timer and ANNAN chess presentation. */
(function(){
  'use strict';
  function init(){
    var old=document.querySelector('.pch-challenges');
    if(!old || old.dataset.psicoEngine==='v4') return;
    var host=old.parentNode;
    if(!host) return;
    var el=document.createElement('section');
    el.className='pch-challenges pch-games-hub';
    el.dataset.psicoEngine='v4';
    el.setAttribute('aria-labelledby','annanChallengeTitle');
    var css=document.createElement('style');
    css.textContent=`
      .pch-games-hub{max-width:980px;margin:0 auto;padding:4px 0 28px;color:#202A24}
      .pch-games-hero{position:relative;overflow:hidden;padding:22px 18px;border:1px solid #D9C8A7;border-radius:20px;background:linear-gradient(135deg,#202A24 0%,#29372F 58%,#39483E 100%);color:#F7EBD1;box-shadow:0 16px 36px rgba(32,42,36,.14)}
      .pch-games-hero:after{content:'◌';position:absolute;right:14px;top:-24px;font-size:150px;line-height:1;color:rgba(247,235,209,.06);pointer-events:none}
      .pch-games-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#D8C59F}
      .pch-games-title{margin:8px 0 0;font-size:clamp(26px,5vw,38px);line-height:1.08;letter-spacing:-.6px}
      .pch-games-subtitle{max-width:680px;margin:9px 0 0;color:#E6DDCB;font-size:14px;line-height:1.6}
      .pch-games-nav{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:none}
      .pch-games-nav::-webkit-scrollbar{display:none}
      .pch-game-filter{flex:0 0 auto;min-height:42px;padding:0 14px;border:1px solid #D8C9AE;border-radius:999px;background:#FFFDF7;color:#40392F;font-weight:900;cursor:pointer}
      .pch-game-filter.is-active{background:#A43D2F;border-color:#A43D2F;color:#fff}
      .pch-game-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0 18px}
      .pch-game-tile{min-width:0;padding:14px;border:1px solid #E0D5C2;border-radius:15px;background:#FFFDF8;cursor:pointer;text-align:left;box-shadow:0 7px 18px rgba(58,45,24,.06);transition:transform .15s ease,border-color .15s ease}
      .pch-game-tile:hover{transform:translateY(-2px);border-color:#CBBEAA}
      .pch-game-tile:focus-visible,.pch-game-filter:focus-visible{outline:3px solid rgba(164,61,47,.25);outline-offset:2px}
      .pch-game-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#EEE6D6;font-size:20px;margin-bottom:9px}
      .pch-game-tile strong{display:block;font-size:14px;color:#202A24}
      .pch-game-tile span span{display:block;margin-top:4px;font-size:11px;color:#6A6255;line-height:1.4}
      .pch-game-section{margin:8px 0 0;padding-top:2px}
      .pch-game-section-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:0 0 8px}
      .pch-game-section-head h3{margin:0;font-size:18px;color:#202A24}
      .pch-game-section-head p{margin:0;color:#756D60;font-size:11px}
      .pch-challenge-card.pch-game-card{margin-top:10px!important;border-radius:18px!important}
      @media(max-width:720px){.pch-games-hero{padding:19px 15px;border-radius:17px}.pch-game-grid{grid-template-columns:1fr}.pch-game-tile{display:flex;align-items:center;gap:11px;padding:11px}.pch-game-icon{margin:0;flex:0 0 40px}.pch-game-section-head{align-items:flex-start;flex-direction:column;gap:2px}.pch-challenge-card.pch-game-card{border-radius:15px!important}}
      @media(prefers-reduced-motion:reduce){.pch-game-tile{transition:none}.pch-game-tile:hover{transform:none}}
    `;
    document.head.appendChild(css);
    el.innerHTML=`
      <div class="pch-games-hero">
        <span class="pch-games-eyebrow">◈ ANNAN · CENTRO DE DESAFIOS</span>
        <h2 class="pch-games-title" id="annanChallengeTitle">Jogue, teste-se e descubra onde pode melhorar.</h2>
        <p class="pch-games-subtitle">Uma área organizada para entrar rapidamente num desafio, treinar uma habilidade e receber orientação. Cada ronda muda para incentivar novas tentativas.</p>
      </div>
      <nav class="pch-games-nav" aria-label="Categorias de jogos">
        <button type="button" class="pch-game-filter is-active" data-game-filter="all">Todos</button>
        <button type="button" class="pch-game-filter" data-game-filter="mente">🧠 Mente</button>
        <button type="button" class="pch-game-filter" data-game-filter="foco">◷ Foco</button>
        <button type="button" class="pch-game-filter" data-game-filter="estrategia">♟ Estratégia</button>
      </nav>
      <div class="pch-game-grid" aria-label="Atalhos dos jogos">
        <button type="button" class="pch-game-tile" data-jump="annanChallengeCard" data-game-category="mente"><span class="pch-game-icon">🧠</span><span><strong>Desafio psicotécnico</strong><span>10 perguntas · diagnóstico</span></span></button>
        <button type="button" class="pch-game-tile" data-jump="annanCounterGame" data-game-category="foco"><span class="pch-game-icon">◷</span><span><strong>Jogo do Contador</strong><span>Meta de tempo · concentração</span></span></button>
        <button type="button" class="pch-game-tile" data-jump="annanChessGame" data-game-category="estrategia"><span class="pch-game-icon">♟</span><span><strong>Xadrez com ANNAN</strong><span>Posições · decisão · estratégia</span></span></button>
      </div>
      <div class="pch-game-section" data-game-section="mente"><div class="pch-game-section-head"><h3>Desafio psicotécnico</h3><p>Treino rápido com resultado no fim</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanChallengeCard">
        <div class="pch-challenge-head"><span class="pch-tag" id="annanProgress">Pergunta 1 de 10</span><span class="pch-tag" id="annanType">Raciocínio</span><span class="pch-tag" id="annanTimer" aria-live="polite">2:30</span></div>
        <div class="pch-progress-track"><div class="pch-progress-fill" id="annanBar" style="width:0%"></div></div>
        <div id="annanTimeNote" style="margin:8px 0 0;color:#55657C;font-size:12px">Tempo desta questão: 2 min 30 s</div>
        <h3 class="pch-question" id="annanQuestion"></h3><div class="pch-choices" id="annanChoices"></div>
        <div class="pch-feedback" id="annanFeedback" hidden></div>
        <div class="pch-challenge-actions"><button type="button" id="annanAdvance" disabled>Avançar</button></div>
        <div class="pch-results" id="annanResults" hidden></div>
        <div class="pch-after3" id="annanLearn" hidden><h3>Quer melhorar nesta área?</h3><p id="annanLearnText">O ANNAN pode criar uma aula curta para treinar exactamente a habilidade em que está a errar mais.</p><button type="button" id="annanLearnBtn" style="min-height:44px;padding:0 16px;border:0;border-radius:10px;background:#14284B;color:#fff;font-weight:800;cursor:pointer">Aprender com ANNAN</button></div>
      </div></div>
      <div class="pch-game-section" data-game-section="foco"><div class="pch-game-section-head"><h3>Foco e percepção do tempo</h3><p>Exercício curto, sem pressão</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanCounterGame" style="margin-top:16px;border:1px solid #D9C8A7;background:linear-gradient(145deg,#fbf8f0,#f5efe2);box-shadow:0 14px 34px rgba(58,45,24,.10);overflow:hidden">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div><span class="pch-tag" style="background:#202A24;color:#F7EBD1">LINHA ORIENTAL</span><h3 style="margin:9px 0 0;color:#202A24;font-size:20px">Jogo do Contador</h3><p style="margin:5px 0 0;color:#6A6255;font-size:13px">Foco, percepção do tempo e disciplina.</p></div>
          <div style="width:132px;height:132px;border-radius:50%;padding:9px;background:conic-gradient(#A43D2F var(--counter-progress,0%),#E6DDCB 0);box-shadow:0 8px 22px rgba(70,50,25,.14)"><div style="width:100%;height:100%;border-radius:50%;background:#202A24;display:flex;align-items:center;justify-content:center;flex-direction:column;border:3px solid #D8C59F"><span id="annanCounterDisplay" aria-live="polite" style="font:800 26px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#F7EBD1;letter-spacing:1px">00:00</span><span style="font-size:9px;letter-spacing:1.5px;color:#CDBE9F;text-transform:uppercase">tempo</span></div></div>
        </div>
        <div style="height:1px;background:#E1D5BE;margin:16px 0"></div><p style="margin:0 0 12px;color:#5F584C;font-size:14px;line-height:1.55">Escolha a meta. Observe o relógio. Treine a capacidade de acompanhar o tempo sem perder a atenção.</p>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px"><button type="button" class="annan-counter-preset" data-min="1" style="min-height:36px;padding:0 12px;border:1px solid #CBBEAA;border-radius:999px;background:#fffaf0;color:#40392F;font-weight:800;cursor:pointer">1 min</button><button type="button" class="annan-counter-preset" data-min="3" style="min-height:36px;padding:0 12px;border:1px solid #CBBEAA;border-radius:999px;background:#fffaf0;color:#40392F;font-weight:800;cursor:pointer">3 min</button><button type="button" class="annan-counter-preset" data-min="5" style="min-height:36px;padding:0 12px;border:1px solid #CBBEAA;border-radius:999px;background:#fffaf0;color:#40392F;font-weight:800;cursor:pointer">5 min</button><button type="button" class="annan-counter-preset" data-min="10" style="min-height:36px;padding:0 12px;border:1px solid #CBBEAA;border-radius:999px;background:#fffaf0;color:#40392F;font-weight:800;cursor:pointer">10 min</button></div>
        <div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap"><label for="annanCounterMinutes" style="font-weight:800;font-size:13px;color:#40392F">Meta</label><input id="annanCounterMinutes" type="number" min="0.1" max="180" step="0.1" value="1" inputmode="decimal" aria-label="Minutos para parar o contador" style="width:92px;min-height:42px;padding:0 10px;border:1px solid #CBBEAA;border-radius:10px;background:#fffdf7;color:#202A24;font-weight:800"><span style="font-size:13px;color:#6A6255">minutos</span><button type="button" id="annanCounterStart" style="min-height:42px;padding:0 16px;border:0;border-radius:10px;background:#A43D2F;color:#fff;font-weight:900;cursor:pointer;box-shadow:0 5px 12px rgba(164,61,47,.22)">▶ Iniciar</button><button type="button" id="annanCounterReset" style="min-height:42px;padding:0 14px;border:1px solid #CBBEAA;border-radius:10px;background:#fffaf0;color:#40392F;font-weight:800;cursor:pointer">Reiniciar</button></div>
        <div id="annanCounterStatus" aria-live="polite" style="margin-top:11px;color:#6A6255;font-size:12px">Pronto. A prática começa quando iniciar.</div><div id="annanCounterCoach" style="margin-top:10px;padding:10px 12px;border-left:3px solid #A43D2F;background:rgba(255,255,255,.55);color:#4D463C;font-size:12px;line-height:1.5">Orientador: não procure velocidade; procure consistência. Quem pratica reconhece melhor o próprio ritmo.</div>
      </div></div>
      <div class="pch-game-section" data-game-section="estrategia"><div class="pch-game-section-head"><h3>Estratégia com ANNAN</h3><p>Pense antes de agir</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanChessGame" style="margin-top:16px;border:1px solid #D9C8A7;background:linear-gradient(145deg,#fbf8f0,#f4eee2);box-shadow:0 14px 34px rgba(58,45,24,.10)">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><span class="pch-tag" style="background:#202A24;color:#F7EBD1">LINHA ORIENTAL · ESTRATÉGIA</span><h3 style="margin:9px 0 0;color:#202A24;font-size:20px">Xadrez com Orientador ANNAN</h3><p id="annanChessCoach" style="margin:6px 0 0;color:#6A6255;font-size:13px;line-height:1.5">Escolha a jogada que melhor prepara a posição. O objetivo é treinar pensamento antes da ação.</p></div><span id="annanChessScore" class="pch-tag">0/0</span></div>
        <div style="display:grid;grid-template-columns:minmax(220px,340px) 1fr;gap:18px;align-items:center;margin-top:14px"><div id="annanChessBoard" aria-label="Tabuleiro de xadrez de treino" style="width:100%;max-width:340px;aspect-ratio:1;border:7px solid #202A24;border-radius:8px;overflow:hidden;box-shadow:0 10px 22px rgba(42,32,20,.16)"></div><div><div id="annanChessPrompt" style="font-weight:900;color:#202A24;font-size:15px;line-height:1.45;margin-bottom:10px"></div><div id="annanChessMoves" style="display:grid;gap:8px"></div><div id="annanChessFeedback" aria-live="polite" style="margin-top:10px;padding:10px 12px;border-left:3px solid #A43D2F;background:rgba(255,255,255,.55);color:#4D463C;font-size:12px;line-height:1.5"></div><button type="button" id="annanChessNext" style="display:none;margin-top:10px;min-height:42px;padding:0 15px;border:0;border-radius:10px;background:#202A24;color:#F7EBD1;font-weight:900;cursor:pointer">Próxima jogada</button></div></div>
        <div id="annanChessAdvice" style="margin-top:14px;padding:11px 13px;border-radius:10px;background:#EEE6D6;color:#514A40;font-size:12px;line-height:1.55">Orientador: pense no centro, segurança do rei, desenvolvimento e material. Uma boa jogada não precisa ser a mais rápida.</div><div id="annanChessCourse" hidden style="margin-top:12px;padding:13px;border-radius:10px;background:#202A24;color:#F7EBD1"><strong>O seu resultado mostra espaço para prática.</strong><p style="margin:7px 0;color:#E6DDCB;font-size:13px;line-height:1.5">Treinar xadrez pode ajudar a exercitar planeamento, análise de alternativas e tomada de decisão. Um curso estruturado dá exercícios progressivos, feedback e uma rotina de prática.</p><button type="button" id="annanChessCourseBtn" style="min-height:42px;padding:0 15px;border:0;border-radius:10px;background:#A43D2F;color:#fff;font-weight:900;cursor:pointer">Ver curso recomendado</button></div>
      </div></div>`;
    host.replaceChild(el,old);
    var filters=el.querySelectorAll('[data-game-filter]'),sections=el.querySelectorAll('[data-game-section]');
    function applyFilter(filter){filters.forEach(function(b){b.classList.toggle('is-active',b.dataset.gameFilter===filter);});sections.forEach(function(sec){sec.hidden=filter!=='all'&&sec.dataset.gameSection!==filter;});}
    filters.forEach(function(b){b.addEventListener('click',function(){applyFilter(b.dataset.gameFilter);});});
    el.querySelectorAll('[data-jump]').forEach(function(b){b.addEventListener('click',function(){var target=el.querySelector('#'+b.dataset.jump);if(!target)return;applyFilter(b.dataset.gameCategory);target.scrollIntoView({behavior:'smooth',block:'start'});});});
    start(el);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
