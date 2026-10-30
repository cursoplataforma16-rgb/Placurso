from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')

marker = "\n/* PLACURSO_PHASE2_PROGRESSION */\n"
if marker in s:
    raise SystemExit('Fase 2 já aplicada.')

script = r'''
/* PLACURSO_PHASE2_PROGRESSION */
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    if(!hub || hub.dataset.phase2==='1') return;
    hub.dataset.phase2='1';
    var KEY='placurso_phase2_progress_v2';
    var empty=function(){return {level:1,xp:0,plays:0,correct:0,totalTime:0,areas:{mente:{plays:0,correct:0},foco:{plays:0,correct:0},estrategia:{plays:0,correct:0}}};};
    var state=empty();
    try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
    state.areas=Object.assign(empty().areas,state.areas||{});
    function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
    function levelForXP(x){return x>=300?4:x>=180?3:x>=80?2:1;}
    function levelName(l){return l===1?'Explorador':l===2?'Praticante':l===3?'Desafiador':'Mestre';}
    function nextXP(l){return l===1?80:l===2?180:l===3?300:300;}
    function areaScore(k){var v=state.areas[k];return v.plays?v.correct/v.plays:0;}
    function bestArea(){var keys=['mente','foco','estrategia'],best=keys[0];keys.forEach(function(k){if(areaScore(k)>areaScore(best))best=k;});return best;}
    function weakArea(){var keys=['mente','foco','estrategia'],played=keys.filter(function(k){return state.areas[k].plays>0;});if(!played.length)return 'mente';return played.sort(function(a,b){return areaScore(a)-areaScore(b);})[0];}
    function render(){
      state.level=levelForXP(state.xp);
      var old=hub.querySelector('#annanPhase2Progress'); if(old) old.remove();
      var card=document.createElement('section'); card.id='annanPhase2Progress'; card.className='pch-phase2-progress';
      var current=state.level===1?0:state.level===2?80:state.level===3?180:300;
      var target=nextXP(state.level);
      var pct=state.level===4?100:Math.max(0,Math.min(100,Math.round(((state.xp-current)/Math.max(1,target-current))*100)));
      var label=levelName(state.level), best=bestArea(), weak=weakArea();
      var names=['Explorador','Praticante','Desafiador','Mestre'];
      var steps=names.map(function(n,i){var lv=i+1,active=lv===state.level,done=lv<state.level;return '<span class="pch-p2-step '+(active?'active ':'')+(done?'done':'')+'"><b>N'+lv+'</b><small>'+n+'</small></span>';}).join('');
      card.innerHTML='<div class="pch-p2-kicker">ANNAN · FASE 2 · MOTOR DE EVOLUÇÃO</div><div class="pch-p2-head"><div><h3>Nível '+state.level+' · '+label+'</h3><p>O jogo agora regista a tua experiência e usa o histórico para orientar o próximo desafio.</p></div><strong class="pch-p2-xp">'+state.xp+' XP</strong></div><div class="pch-p2-progress-track"><span style="width:'+pct+'%"></span></div><div class="pch-p2-next">'+(state.level<4?(target-state.xp)+' XP para desbloquear o Nível '+(state.level+1):'Todos os níveis principais desbloqueados')+'</div><div class="pch-p2-map">'+steps+'</div><div class="pch-p2-stats"><div><b>'+state.plays+'</b><small>Partidas</small></div><div><b>'+state.correct+'</b><small>Acertos</small></div><div><b>'+Math.round(state.totalTime)+'s</b><small>Tempo</small></div><div><b>'+best+'</b><small>Melhor área</small></div></div><div class="pch-p2-annan">ANNAN → <b>Próximo foco: '+weak+'</b>. Repetir com variação transforma tentativa em experiência.</div>';
      var css=document.getElementById('pchPhase2CSS');
      if(!css){css=document.createElement('style');css.id='pchPhase2CSS';css.textContent='.pch-phase2-progress{margin:14px 0;padding:16px;border:2px solid #A43D2F;border-radius:20px;background:linear-gradient(180deg,#fffdf8,#f6efe3);box-shadow:0 10px 26px rgba(58,45,24,.09)}.pch-p2-kicker{font-size:10px;font-weight:950;letter-spacing:1.3px;color:#A43D2F}.pch-p2-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-top:5px}.pch-p2-head h3{margin:0;font-size:21px}.pch-p2-head p{margin:5px 0 0;color:#756D60;font-size:11px;line-height:1.45;max-width:600px}.pch-p2-xp{font-size:20px;white-space:nowrap}.pch-p2-progress-track{height:10px;margin:13px 0 4px;border-radius:99px;background:#e6dccb;overflow:hidden}.pch-p2-progress-track span{display:block;height:100%;border-radius:99px;background:#A43D2F;transition:width .3s ease}.pch-p2-next{font-size:10px;font-weight:800;color:#756D60}.pch-p2-map{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:13px 0}.pch-p2-step{padding:7px 5px;border-radius:10px;background:#eee6d6;text-align:center;opacity:.55}.pch-p2-step b,.pch-p2-step small{display:block}.pch-p2-step b{font-size:10px}.pch-p2-step small{font-size:8px;margin-top:2px}.pch-p2-step.active{opacity:1;background:#A43D2F;color:white}.pch-p2-step.done{opacity:1}.pch-p2-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.pch-p2-stats div{padding:8px;border-radius:10px;background:white;text-align:center}.pch-p2-stats b,.pch-p2-stats small{display:block}.pch-p2-stats b{font-size:13px}.pch-p2-stats small{font-size:8px;color:#756D60;margin-top:2px}.pch-p2-annan{margin-top:10px;padding:9px;border-radius:11px;background:#202A24;color:#F7EBD1;font-size:10px;line-height:1.45}.pch-p2-annan b{color:#fff}.pch-phase2-progress~*{}@media(max-width:720px){.pch-phase2-progress{padding:13px}.pch-p2-head{flex-direction:column;gap:5px}.pch-p2-xp{font-size:18px}.pch-p2-map{grid-template-columns:repeat(2,1fr)}.pch-p2-stats{grid-template-columns:repeat(2,1fr)}}';document.head.appendChild(css);}
      var nav=hub.querySelector('.pch-games-nav'); if(nav) nav.after(card); else hub.prepend(card);
    }
    render();
    var startedAt=0,activeKind='mente';
    hub.addEventListener('click',function(ev){
      var micro=ev.target.closest('[data-microgame]');
      if(micro){activeKind=micro.dataset.microgame==='focus'?'foco':micro.dataset.microgame==='decision'?'estrategia':'mente';startedAt=Date.now();return;}
      var answer=ev.target.closest('#annanMicroRunner [data-answer]');
      if(answer && startedAt){
        state.plays++;state.areas[activeKind].plays++;
        var ok=answer.dataset.answer==='0';
        if(ok){state.correct++;state.areas[activeKind].correct++;state.xp+=state.level*10;}else{state.xp+=3;}
        state.totalTime+=Math.max(1,(Date.now()-startedAt)/1000);
        state.level=levelForXP(state.xp); save(); render(); startedAt=0;
      }
    });
    var observer=new MutationObserver(function(){if(hub.querySelector('#annanMicroRunner .pch-runner-result'))render();});observer.observe(hub,{subtree:true,childList:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
'''
s += marker + script
p.write_text(s, encoding='utf-8')
print('OK: Fase 2 visual e progressão reforçadas.')