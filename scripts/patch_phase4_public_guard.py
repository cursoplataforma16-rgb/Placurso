from pathlib import Path
import sys

p = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('psico-engine.js')
s = p.read_text(encoding='utf-8')
marker='\n/* PLACURSO_PHASE4_PUBLIC_GUARD_V1 */\n'
if marker in s:
    raise SystemExit('Phase 4 public guard já aplicado.')
script=r'''
(function(){
  function boot(){
    if(document.querySelector('.plc-phase4-guard')) return;
    var style=document.createElement('style');
    style.className='plc-phase4-guard';
    style.textContent='.plc-legacy-student-hidden{display:none!important}.plc-external-ad-hidden{display:none!important}a[href*="maads.com"],a[href*="slise.xyz"]{display:none!important}';
    document.head.appendChild(style);
    var Access=window.PlacursoCommunityAccess;
    var legacyText=['Aprender com o ANNAN','A tua evolução fica visível','ANNAN · FASE 3A','ANNAN · FASE 3B','ANNAN · FASE 3D','Laboratório de decisão','Reflexo rápido','Decisão financeira','Mini negócio'];
    var adText=['Anuncie neste espaço publicitário','Web3-Native Marketing Hub','maads.com','slise.xyz','Obtenha uma conta Visa','Obtain a Visa account'];
    function inShell(el){return !!(el&&el.closest&&el.closest('.plc-community-shell'));}
    function isMember(){try{return !!(Access&&Access.canEnterStudent(Access.read()));}catch(e){return false;}}
    function isAAdsElement(el){
      if(!el) return false;
      var node=el.closest?el.closest('a,iframe,ins,div,aside,section'):el;
      var href=((node&&node.getAttribute&&node.getAttribute('href'))||'').toLowerCase();
      var src=((node&&node.getAttribute&&node.getAttribute('src'))||'').toLowerCase();
      var cls=((node&&node.className)||'').toString().toLowerCase();
      return /a-?ads\.com/.test(href)||/a-?ads\.com/.test(src)||/a-?ads\.com/.test(cls);
    }
    function hideLegacy(){
      if(isMember()) return;
      var hub=document.querySelector('.pch-games-hub');
      if(hub && !inShell(hub)) hub.classList.add('plc-legacy-student-hidden');
      document.querySelectorAll('section,article,[role="region"]').forEach(function(el){
        if(inShell(el)) return;
        var t=(el.innerText||'').replace(/\s+/g,' ').trim();
        if(!t || t.length>1400) return;
        if(legacyText.some(function(k){return t.indexOf(k)>=0;})) el.classList.add('plc-legacy-student-hidden');
      });
    }
    function hideAds(){
      document.querySelectorAll('iframe').forEach(function(el){
        if(isAAdsElement(el)) return;
        var src=(el.getAttribute('src')||'').toLowerCase();
        if(src.indexOf('maads.com')>=0||src.indexOf('slise.xyz')>=0||src.indexOf('advert')>=0) el.classList.add('plc-external-ad-hidden');
      });
      document.querySelectorAll('body *').forEach(function(el){
        if(isAAdsElement(el)) return;
        var t=(el.innerText||'').replace(/\s+/g,' ').trim();
        if(adText.some(function(k){return t.toLowerCase().indexOf(k.toLowerCase())>=0;}) && t.length<500){
          var target=el.closest('[style*="position: fixed"], [style*="position:fixed"], aside, [role="dialog"]')||el;
          if(!isAAdsElement(target)) target.classList.add('plc-external-ad-hidden');
        }
      });
    }
    function clean(){hideLegacy();hideAds();}
    clean();
    setTimeout(clean,300);setTimeout(clean,1200);setTimeout(clean,2500);
    new MutationObserver(function(){clean();}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
'''
s += marker + script
p.write_text(s,encoding='utf-8')
print('OK: guardião público da Fase 4 aplicado; A-Ads preservado e demais regras mantidas.')
