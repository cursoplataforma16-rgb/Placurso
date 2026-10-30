from pathlib import Path
import sys

p=Path(sys.argv[1]) if len(sys.argv)>1 else Path('psico-engine.js')
s=p.read_text()
needle='    var el=document.createElement(\'section\');\n    el.className=\'pch-challenges\';\n'
repl='''    var el=document.createElement('section');
    el.className='pch-challenges pch-games-hub';
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
'''
if needle not in s: raise SystemExit('UI anchor not found')
s=s.replace(needle,repl,1)
old='''      <p class="pch-section-kicker">TREINE A MENTE</p>
      <h2 class="pch-h2" id="annanChallengeTitle">Desafios que mudam a cada ronda</h2>
      <p style="margin:9px 0 0;color:#55657C;font-size:14px;line-height:1.55">Raciocínio, atenção, memória, personalidade, aptidão, percentagens, proporções, séries figurativas e tomada de decisão. A ronda é aleatória. Praticar com regularidade ajuda a ganhar familiaridade, confiança e rapidez — sem substituir uma avaliação psicológica profissional.</p>
      <div class="pch-challenge-card" id="annanChallengeCard">'''
new='''      <div class="pch-games-hero"><span class="pch-games-eyebrow">◈ ANNAN · CENTRO DE DESAFIOS</span><h2 class="pch-games-title" id="annanChallengeTitle">Jogue, teste-se e descubra onde pode melhorar.</h2><p class="pch-games-subtitle">Uma área organizada para entrar rapidamente num desafio, treinar uma habilidade e receber orientação. Cada ronda muda para incentivar novas tentativas.</p></div>
      <nav class="pch-games-nav" aria-label="Categorias de jogos"><button type="button" class="pch-game-filter is-active" data-game-filter="all">Todos</button><button type="button" class="pch-game-filter" data-game-filter="mente">🧠 Mente</button><button type="button" class="pch-game-filter" data-game-filter="foco">◷ Foco</button><button type="button" class="pch-game-filter" data-game-filter="estrategia">♟ Estratégia</button></nav>
      <div class="pch-game-grid" aria-label="Atalhos dos jogos"><button type="button" class="pch-game-tile" data-jump="annanChallengeCard" data-game-category="mente"><span class="pch-game-icon">🧠</span><span><strong>Desafio psicotécnico</strong><span>10 perguntas · diagnóstico</span></span></button><button type="button" class="pch-game-tile" data-jump="annanCounterGame" data-game-category="foco"><span class="pch-game-icon">◷</span><span><strong>Jogo do Contador</strong><span>Meta de tempo · concentração</span></span></button><button type="button" class="pch-game-tile" data-jump="annanChessGame" data-game-category="estrategia"><span class="pch-game-icon">♟</span><span><strong>Xadrez com ANNAN</strong><span>Posições · decisão · estratégia</span></span></button></div>
      <div class="pch-game-section" data-game-section="mente"><div class="pch-game-section-head"><h3>Desafio psicotécnico</h3><p>Treino rápido com resultado no fim</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanChallengeCard">'''
if old not in s: raise SystemExit('template anchor not found')
s=s.replace(old,new,1)
s=s.replace('''      </div>
      <div class="pch-challenge-card" id="annanCounterGame"''','''      </div></div>
      <div class="pch-game-section" data-game-section="foco"><div class="pch-game-section-head"><h3>Foco e percepção do tempo</h3><p>Exercício curto, sem pressão</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanCounterGame"''',1)
s=s.replace('''      </div>
      <div class="pch-challenge-card" id="annanChessGame"''','''      </div></div>
      <div class="pch-game-section" data-game-section="estrategia"><div class="pch-game-section-head"><h3>Estratégia com ANNAN</h3><p>Pense antes de agir</p></div>
      <div class="pch-challenge-card pch-game-card" id="annanChessGame"''',1)
end='''      </div>`;
    host.replaceChild(el,old);'''
replend='''      </div></div></div>`;
    host.replaceChild(el,old);
    var filters=el.querySelectorAll('[data-game-filter]'),sections=el.querySelectorAll('[data-game-section]');
    function applyFilter(filter){filters.forEach(function(b){b.classList.toggle('is-active',b.dataset.gameFilter===filter);});sections.forEach(function(sec){sec.hidden=filter!=='all'&&sec.dataset.gameSection!==filter;});}
    filters.forEach(function(b){b.addEventListener('click',function(){applyFilter(b.dataset.gameFilter);});});
    el.querySelectorAll('[data-jump]').forEach(function(b){b.addEventListener('click',function(){var target=el.querySelector('#'+b.dataset.jump);if(!target)return;applyFilter(b.dataset.gameCategory);target.scrollIntoView({behavior:'smooth',block:'start'});});});'''
if end not in s: raise SystemExit('end anchor not found')
s=s.replace(end,replend,1)
p.write_text(s)
