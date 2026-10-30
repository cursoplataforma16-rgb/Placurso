from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker = "\n/* PLACURSO_PHASE3B_TRADE_EDUCATION */\n"
if marker in s:
    raise SystemExit('Trade educacional da Fase 3B já aplicado.')
if 'PLACURSO_PHASE3B_EXPERIENCE' not in s:
    raise SystemExit('ERRO: o módulo de experiência da Fase 3B deve ser aplicado antes do Trade.')

script = r'''
/* PLACURSO_PHASE3B_TRADE_EDUCATION */
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    if(!hub || hub.dataset.tradeEducation==='1') return;
    hub.dataset.tradeEducation='1';
    var css=document.createElement('style');
    css.textContent=`
      .p3b-trade{margin:14px 0;padding:15px;border:1px solid #D8C59F;border-radius:20px;background:#202A24;color:#F7EBD1}
      .p3b-trade-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .p3b-trade-kicker{font-size:9px;letter-spacing:1.2px;font-weight:900;color:#D8C59F}
      .p3b-trade h3{margin:5px 0 4px;font-size:19px}
      .p3b-trade p{margin:0;color:#E7DECE;font-size:11px;line-height:1.5;max-width:680px}
      .p3b-trade-path{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
      .p3b-trade-level{border:1px solid #4A544C;border-radius:14px;padding:11px;background:#27322B;color:#F7EBD1;text-align:left;cursor:pointer;min-height:105px}
      .p3b-trade-level:hover{border-color:#D8C59F}
      .p3b-trade-level:focus-visible{outline:3px solid #D8C59F;outline-offset:2px}
      .p3b-trade-level strong{display:block;font-size:12px}
      .p3b-trade-level span{display:block;margin-top:5px;color:#D9D0C0;font-size:9px;line-height:1.45}
      .p3b-trade-level b{display:inline-block;margin-top:8px;font-size:8px;letter-spacing:.5px;color:#D8C59F}
      .p3b-trade-note{margin-top:9px;font-size:9px;color:#BFC8BF}
      .p3b-trade-panel{display:none;margin-top:10px;padding:12px;border-radius:14px;background:#F7F2E9;color:#202A24}
      .p3b-trade-panel.active{display:block}
      .p3b-trade-panel h4{margin:0 0 4px;font-size:14px}
      .p3b-trade-panel p{color:#5F665F;font-size:10px}
      .p3b-trade-topics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}
      .p3b-trade-topic{padding:9px;border:1px solid #DDD3C2;border-radius:11px;background:#fff;font-size:9px;line-height:1.4}
      @media(max-width:620px){.p3b-trade-head{display:block}.p3b-trade-path{grid-template-columns:1fr}.p3b-trade-level{min-height:auto}.p3b-trade-topics{grid-template-columns:1fr}}
    `;
    document.head.appendChild(css);
    var section=document.createElement('section');
    section.className='p3b-trade';
    section.setAttribute('aria-label','Formação em criptomoedas por jogos');
    section.innerHTML=`
      <div class="p3b-trade-head"><div><div class="p3b-trade-kicker">💰 DINHEIRO · FORMAÇÃO</div><h3>Queres entrar no mundo das criptomoedas?</h3><p>Aprende antes de operar. Aqui, os conceitos de cripto e trading são ensinados através de desafios, simulações e decisões progressivas — do básico ao avançado.</p></div></div>
      <div class="p3b-trade-path">
        <button type="button" class="p3b-trade-level" data-trade-level="basic"><strong>Nível 1 · Básico</strong><span>Entende o que são ativos, preço, mercado, risco e decisões simples.</span><b>APRENDER JOGANDO</b></button>
        <button type="button" class="p3b-trade-level" data-trade-level="intermediate"><strong>Nível 2 · Intermédio</strong><span>Lê movimentos, compara risco/recompensa e treina gestão de capital.</span><b>DECIDIR MELHOR</b></button>
        <button type="button" class="p3b-trade-level" data-trade-level="advanced"><strong>Nível 3 · Avançado</strong><span>Simula cenários, timing, probabilidades e decisões sob pressão.</span><b>DOMINAR CENÁRIOS</b></button>
      </div>
      <div class="p3b-trade-panel" data-trade-panel="basic"><h4>Básico · Primeira missão</h4><p>Antes de pensar em comprar ou vender, aprende a identificar o que estás realmente a observar.</p><div class="p3b-trade-topics"><div class="p3b-trade-topic"><strong>Mercado</strong><br>O que move o preço?</div><div class="p3b-trade-topic"><strong>Risco</strong><br>Quanto podes perder?</div><div class="p3b-trade-topic"><strong>Ativo</strong><br>O que estás a negociar?</div><div class="p3b-trade-topic"><strong>Decisão</strong><br>Quando esperar é melhor?</div></div></div>
      <div class="p3b-trade-panel" data-trade-panel="intermediate"><h4>Intermédio · Decisão</h4><p>Treina leitura de movimento, probabilidade, risco/recompensa e gestão de capital em cenários simulados.</p><div class="p3b-trade-topics"><div class="p3b-trade-topic"><strong>Movimento</strong><br>Identificar força e correção.</div><div class="p3b-trade-topic"><strong>Probabilidade</strong><br>Trabalhar com cenários, não certezas.</div><div class="p3b-trade-topic"><strong>Capital</strong><br>Dimensionar uma decisão.</div><div class="p3b-trade-topic"><strong>Timing</strong><br>Entrar, esperar ou sair.</div></div></div>
      <div class="p3b-trade-panel" data-trade-panel="advanced"><h4>Avançado · Cenários</h4><p>Simula múltiplas condições de mercado e aprende a escolher uma ação coerente com risco, contexto e objetivo.</p><div class="p3b-trade-topics"><div class="p3b-trade-topic"><strong>Cenários</strong><br>Alta, correção, lateralização.</div><div class="p3b-trade-topic"><strong>Gestão</strong><br>Risco por operação e sequência.</div><div class="p3b-trade-topic"><strong>Estratégia</strong><br>Confluência de sinais.</div><div class="p3b-trade-topic"><strong>Disciplina</strong><br>Executar regras sem improviso.</div></div></div>
      <div class="p3b-trade-note">Formação e simulação educativa. Não é recomendação financeira nem promessa de lucro.</div>`;
    var anchor=hub.querySelector('.p3b-experience');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(section,anchor.nextSibling); else hub.insertBefore(section,hub.firstChild||null);
    section.addEventListener('click',function(e){
      var btn=e.target.closest('[data-trade-level]');
      if(!btn) return;
      section.querySelectorAll('[data-trade-panel]').forEach(function(panel){panel.classList.toggle('active',panel.dataset.tradePanel===btn.dataset.tradeLevel);});
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
'''
s += marker + script
p.write_text(s, encoding='utf-8')
print('OK: formação em criptomoedas adicionada como experiência educativa por níveis.')
