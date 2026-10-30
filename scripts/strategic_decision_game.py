from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'public' / 'psico-engine.js'
if not p.exists():
    raise SystemExit('ERRO: motor dos jogos não encontrado.')

s = p.read_text(encoding='utf-8')
anchor = '    start(el);'
if anchor not in s:
    raise SystemExit('ERRO: ponto de inserção do jogo estratégico não encontrado.')

card = r'''    el.insertAdjacentHTML('beforeend', `
      <div class="pch-game-section" data-game-section="estrategia">
        <div class="pch-game-section-head"><h3>Decisão de negócio</h3><p>Escolha, consequência e estratégia</p></div>
        <div class="pch-challenge-card pch-game-card" id="annanDecisionGame" style="margin-top:10px;border:1px solid #D9C8A7;background:linear-gradient(145deg,#202A24,#2E3D34);color:#F7EBD1;box-shadow:0 14px 34px rgba(32,42,36,.16);overflow:hidden">
          <span class="pch-tag" style="background:#D8C59F;color:#202A24">SIMULAÇÃO · ANNAN</span>
          <h3 style="margin:10px 0 5px;color:#F7EBD1;font-size:21px">Você decide. O mercado responde.</h3>
          <p id="annanDecisionScenario" style="margin:0 0 14px;color:#E6DDCB;font-size:14px;line-height:1.55"></p>
          <div id="annanDecisionChoices" style="display:grid;gap:8px"></div>
          <div id="annanDecisionFeedback" hidden style="margin-top:12px;padding:11px;border-radius:12px;background:rgba(247,235,209,.08);color:#F7EBD1;font-size:13px;line-height:1.5"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px"><span id="annanDecisionScore" style="font-size:12px;color:#D8C59F">Decisões: 0</span><button type="button" id="annanDecisionNext" disabled style="min-height:40px;padding:0 14px;border:0;border-radius:10px;background:#D8C59F;color:#202A24;font-weight:900;cursor:pointer">Próxima decisão</button></div>
        </div>
      </div>`);
    (function(){
      var scenarios=[
        {q:'As vendas caíram 15% este mês. Você tem pouco dinheiro para reagir. O que faz primeiro?',a:['Cortar tudo imediatamente','Analisar onde a queda aconteceu e testar uma oferta pequena','Aumentar preços sem analisar','Esperar o próximo mês'],ok:1,e:'Primeiro descubra a causa e faça um teste pequeno. Estratégia reduz risco e cria informação.'},
        {q:'Um concorrente baixou o preço. Qual é a resposta mais estratégica?',a:['Copiar o preço imediatamente','Atacar o concorrente nas redes','Comparar valor, custos e posicionamento antes de decidir','Dar desconto máximo a todos'],ok:2,e:'Preço é apenas uma variável. Conhecer custos, valor percebido e posição evita uma guerra de preços.'},
        {q:'Você tem duas oportunidades: uma dá lucro rápido; outra cria clientes recorrentes. O que deve avaliar?',a:['Só o lucro de hoje','Valor ao longo do tempo e risco de cada opção','Escolher a mais difícil','Escolher por impulso'],ok:1,e:'Uma decisão estratégica compara retorno, recorrência, risco e recursos disponíveis.'},
        {q:'Sua equipa tem três tarefas urgentes e recursos para apenas uma. O melhor método é:',a:['Escolher a mais fácil','Fazer todas ao mesmo tempo','Priorizar impacto, urgência e dependências','Escolher a que chegou primeiro'],ok:2,e:'Priorizar impacto e dependências evita gastar recursos onde o resultado é menor.'},
        {q:'Um cliente pede uma grande alteração sem pagar mais. O que fazer?',a:['Aceitar sempre','Recusar sem conversar','Avaliar custo, valor para o cliente e negociar uma solução','Ignorar o pedido'],ok:2,e:'Negociar com base em custo e valor preserva a relação sem destruir a margem.'}
      ];
      var state={i:0,score:0,answered:false};
      var qel=el.querySelector('#annanDecisionScenario'),cel=el.querySelector('#annanDecisionChoices'),fel=el.querySelector('#annanDecisionFeedback'),sel=el.querySelector('#annanDecisionScore'),nel=el.querySelector('#annanDecisionNext');
      if(!qel||!cel)return;
      function render(){var x=scenarios[state.i%scenarios.length];state.answered=false;fel.hidden=true;nel.disabled=true;qel.textContent=x.q;cel.innerHTML='';x.a.forEach(function(t,i){var b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='min-height:44px;padding:10px 12px;border:1px solid rgba(247,235,209,.22);border-radius:11px;background:rgba(247,235,209,.06);color:#F7EBD1;text-align:left;font-weight:700;cursor:pointer';b.addEventListener('click',function(){if(state.answered)return;state.answered=true;if(i===x.ok)state.score++;sel.textContent='Decisões: '+state.score+' / '+(state.i+1);fel.textContent=(i===x.ok?'✓ Boa decisão. ':'→ Melhor alternativa: ')+x.e;fel.hidden=false;nel.disabled=false;Array.from(cel.children).forEach(function(v,j){v.disabled=true;v.style.opacity=j===x.ok?'1':'.65';});});cel.appendChild(b);});sel.textContent='Decisões: '+state.score+' / '+state.i;}
      nel.addEventListener('click',function(){state.i++;render();});render();
    })();
'''
s=s.replace(anchor, card + anchor, 1)
p.write_text(s, encoding='utf-8')
print('OK: jogo estratégico de decisão adicionado.')
