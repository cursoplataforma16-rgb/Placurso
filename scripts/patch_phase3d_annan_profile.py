from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker = "\n/* PLACURSO_PHASE3D_ANNAN_PROFILE */\n"
core_marker = "PLACURSO_ANNAN_PROFILE_CORE"
if marker in s:
    raise SystemExit('Fase 3D ANNAN já aplicada.')
if 'PLACURSO_PHASE3C_CRYPTO_GAMES' not in s:
    raise SystemExit('ERRO: a Fase 3D requer a formação cripto da Fase 3C.')

core_path = Path(__file__).with_name('annan_profile_core.js')
if not core_path.is_file():
    raise SystemExit('ERRO: annan_profile_core.js não encontrado.')
core_source = core_path.read_text(encoding='utf-8')
if core_marker in s:
    raise SystemExit('ERRO: núcleo do perfil ANNAN já existe no motor base.')

script = r'''
(function(){
  function boot(){
    var hub=document.querySelector('.pch-games-hub');
    var Core=window.PlacursoAnnanProfileCore;
    if(!hub||!Core||hub.dataset.phase3dAnnan==='1') return;
    hub.dataset.phase3dAnnan='1';
    var PROFILE_KEY='placurso_annan_profile_v1';
    var GAME_KEY='placurso_phase3a_games_v1';
    var CRYPTO_KEY='placurso_crypto_learning_v2';

    function read(key){
      try{
        var value=JSON.parse(localStorage.getItem(key)||'null');
        return value&&typeof value==='object'?value:null;
      }catch(e){return null;}
    }
    function safeState(){
      var saved=read(PROFILE_KEY)||{};
      return {history:Array.isArray(saved.history)?saved.history.slice(-30):[],updatedAt:typeof saved.updatedAt==='string'?saved.updatedAt:null,lastEventId:typeof saved.lastEventId==='string'?saved.lastEventId:null};
    }
    var state=safeState();

    var css=document.createElement('style');
    css.textContent=".p3d-profile{margin:14px 0 20px;padding:16px;border:1px solid #D9C8A7;border-radius:20px;background:#F9F6EF;color:#202A24}.p3d-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.p3d-kicker{font-size:9px;letter-spacing:1.3px;font-weight:950;color:#A43D2F}.p3d-title{margin:6px 0 4px;font-size:21px;line-height:1.15}.p3d-intro{margin:0;color:#696357;font-size:11px;line-height:1.5;max-width:620px}.p3d-updated{padding:5px 8px;border-radius:999px;background:#EEE6D6;color:#574E42;font-size:8px;font-weight:900;white-space:nowrap}.p3d-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:13px}.p3d-skill{display:block;width:100%;min-width:0;padding:11px;border:1px solid #E0D5C2;border-radius:13px;background:#fff;text-align:left;color:#202A24;cursor:pointer}.p3d-skill:disabled{opacity:.72;cursor:default}.p3d-skill:focus-visible,.p3d-next:focus-visible{outline:3px solid #A43D2F;outline-offset:2px}.p3d-skill-top{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:10px;font-weight:900}.p3d-skill-score{display:block;margin-top:7px;font-size:21px;font-weight:950;line-height:1}.p3d-skill-status{display:block;margin-top:6px;color:#756D60;font-size:9px;line-height:1.35}.p3d-meter{height:5px;margin-top:8px;border-radius:99px;background:#E8E0D2;overflow:hidden}.p3d-meter i{display:block;height:100%;border-radius:99px;background:#A43D2F}.p3d-analysis{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin-top:12px;padding:13px;border-radius:15px;background:#202A24;color:#F7EBD1}.p3d-analysis-label{font-size:8px;letter-spacing:1px;font-weight:950;color:#D8C59F}.p3d-message{margin:5px 0 0;font-size:11px;line-height:1.55}.p3d-trend{margin:5px 0 0;color:#D9D0C0;font-size:9px;line-height:1.4}.p3d-next{min-height:42px;padding:0 13px;border:0;border-radius:11px;background:#A43D2F;color:#fff;font-size:10px;font-weight:950;cursor:pointer}.p3d-history{margin-top:9px;color:#756D60;font-size:9px;line-height:1.4}.p3d-note{margin:8px 0 0;color:#756D60;font-size:8px;line-height:1.4}@media(max-width:720px){.p3d-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.p3d-head{display:block}.p3d-updated{display:inline-block;margin-top:8px}.p3d-analysis{grid-template-columns:1fr}.p3d-next{width:100%}}@media(max-width:360px){.p3d-profile{padding:12px}.p3d-grid{gap:6px}.p3d-skill{padding:9px}.p3d-skill-top{font-size:9px}}";
    document.head.appendChild(css);

    var section=document.createElement('section');
    section.className='p3d-profile';
    section.setAttribute('aria-label','Perfil de evolução ANNAN');
    section.innerHTML='<div class="p3d-head"><div><div class="p3d-kicker">ANNAN · FASE 3D</div><h3 class="p3d-title">O teu perfil de evolução</h3><p class="p3d-intro">Os resultados dos teus desafios tornam-se sinais de prática. O perfil melhora à medida que realizas novas experiências.</p></div><span class="p3d-updated" id="p3dUpdated">A acompanhar</span></div><div class="p3d-grid" id="p3dSkills"></div><div class="p3d-analysis"><div><div class="p3d-analysis-label">LEITURA DO ANNAN</div><p class="p3d-message" id="p3dMessage">Ainda não há resultados suficientes. Faz um desafio para começar.</p><p class="p3d-trend" id="p3dTrend">A evolução recente aparecerá quando existirem dois registos comparáveis.</p></div><button type="button" class="p3d-next" id="p3dNext">Começar primeiro desafio</button></div><div class="p3d-history" id="p3dHistory">O histórico será guardado neste dispositivo.</div><p class="p3d-note">Estes valores representam o desempenho registado nos desafios Placurso; não são diagnóstico psicológico, escolar ou profissional. A IA ficará disponível quando existir uma experiência própria.</p>';
    var anchor=hub.querySelector('.p3b-experience');
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(section,anchor.nextSibling);
    else hub.insertBefore(section,hub.firstChild||null);

    function currentProfile(){
      return Core.deriveAnnanProfile(read(GAME_KEY),read(CRYPTO_KEY));
    }
    function persist(){
      try{localStorage.setItem(PROFILE_KEY,JSON.stringify(state));}catch(e){}
    }
    function hasRecordedData(profile){
      return Object.keys(profile.skills).some(function(id){return profile.skills[id].samples>0;});
    }
    function render(){
      var profile=currentProfile();
      var analysis=Core.analyseAnnanProfile(profile);
      var host=section.querySelector('#p3dSkills');
      var order=['memory','focus','decision','finance','strategy','business','ai'];
      host.innerHTML=order.map(function(id){
        var skill=profile.skills[id];
        var status=skill.status==='unavailable'?'Aguardando experiência':skill.samples===0?'Por iniciar':skill.samples<3?'Sinal inicial · '+skill.samples+' registo(s)':skill.samples+' observações';
        var score=skill.score===null?'—':skill.score+'%';
        var meter=skill.score===null?'':('<div class="p3d-meter"><i style="width:'+skill.score+'%"></i></div>');
        var disabled=!skill.action;
        return '<button type="button" class="p3d-skill" data-p3d-skill="'+id+'" aria-label="'+skill.label+': '+(skill.score===null?status:score+', '+status)+'" '+(disabled?'disabled':'')+'><span class="p3d-skill-top"><span>'+skill.icon+' '+skill.label+'</span><span>'+score+'</span></span>'+meter+'<span class="p3d-skill-status">'+status+'</span></button>';
      }).join('');
      section.querySelector('#p3dMessage').textContent=analysis.message;
      var trend=analysis.next?Core.getSkillTrend(state.history,analysis.next.id):null;
      section.querySelector('#p3dTrend').textContent=trend
        ? 'Evolução em '+analysis.next.label+': '+(trend.change>0?'+':'')+trend.change+' pontos percentuais desde o registo anterior.'
        : 'A evolução recente aparecerá quando existirem dois registos comparáveis.';
      section.querySelector('#p3dNext').textContent=analysis.next?'Praticar '+analysis.next.label:'Ver desafios';
      section.querySelector('#p3dNext').disabled=!analysis.next;
      section.querySelector('#p3dHistory').textContent=state.history.length===0
        ? 'Ainda sem histórico. O primeiro registo será guardado após o próximo desafio.'
        : state.history.length===1
          ? 'Base inicial guardada. O próximo desafio permitirá comparar a evolução.'
          : state.history.length+' registos guardados neste dispositivo.';
      section.querySelector('#p3dUpdated').textContent=state.updatedAt?'Perfil actualizado':'A acompanhar';
      if(!state.history.length&&hasRecordedData(profile)){
        state.history=Core.addProfileSnapshot(state.history,profile,new Date().toISOString(),'baseline-'+new Date().toISOString().slice(0,10));
        state.updatedAt=new Date().toISOString();
        persist();
        section.querySelector('#p3dHistory').textContent='Base inicial guardada. O próximo desafio permitirá comparar a evolução.';
        section.querySelector('#p3dUpdated').textContent='Perfil actualizado';
      }
    }

    function launch(skill){
      if(!skill||!skill.action)return;
      if(skill.action==='crypto'){
        var cryptoState=read(CRYPTO_KEY)||{};
        var crypto=window.PlacursoCryptoProgression;
        var level='basic';
        if(crypto&&crypto.canStartCryptoLevel(cryptoState,'intermediate'))level='intermediate';
        if(crypto&&crypto.canStartCryptoLevel(cryptoState,'advanced'))level='advanced';
        var cryptoButton=hub.querySelector('.p3b-trade [data-trade-level="'+level+'"]');
        if(cryptoButton&&!cryptoButton.disabled){cryptoButton.click();cryptoButton.scrollIntoView({behavior:'smooth',block:'center'});return;}
      }else{
        var card=hub.querySelector('[data-p3a="'+skill.action+'"]');
        if(card){card.click();card.scrollIntoView({behavior:'smooth',block:'center'});return;}
      }
      section.querySelector('#p3dMessage').textContent='Esta experiência ainda não está disponível neste ecrã. Escolhe um dos desafios existentes para continuar.';
    }

    section.querySelector('#p3dNext').addEventListener('click',function(){
      launch(Core.analyseAnnanProfile(currentProfile()).next);
    });
    section.querySelector('#p3dSkills').addEventListener('click',function(e){
      var button=e.target.closest('[data-p3d-skill]');
      if(button){launch(currentProfile().skills[button.dataset.p3dSkill]);}
    });

    window.addEventListener('placurso:progress',function(e){
      var detail=e&&e.detail?e.detail:{};
      if(!detail.id||detail.id===state.lastEventId)return;
      var profile=currentProfile();
      state.history=Core.addProfileSnapshot(state.history,profile,new Date().toISOString(),detail.id);
      state.lastEventId=detail.id;
      state.updatedAt=new Date().toISOString();
      persist();
      render();
    });
    window.addEventListener('storage',function(e){
      if(e&&[PROFILE_KEY,GAME_KEY,CRYPTO_KEY].indexOf(e.key)>=0){
        if(e.key===PROFILE_KEY)state=safeState();
        render();
      }
    });

    /* The older Phase 3B skill counters are incremental signals, not accuracy
       scores. Hide that small legacy strip; this evidence-based profile replaces it. */
    var legacySkills=hub.querySelector('.p3b-experience');
    if(legacySkills){
      var legacyTitle=legacySkills.querySelector('.p3b-section-title');
      var legacyGrid=legacySkills.querySelector('#p3bSkills');
      if(legacyTitle)legacyTitle.style.display='none';
      if(legacyGrid)legacyGrid.style.display='none';
    }
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
'''
s += "\n/* " + core_marker + " */\n" + core_source + marker + script
