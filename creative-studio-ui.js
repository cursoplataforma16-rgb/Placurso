/* ANNAN Creative Studio UI */
(function(){
'use strict';
function render(host){
 if(!host)return;
 host.innerHTML=`<section style="background:#171412;color:#eee7df;border:1px solid #3b332c;border-radius:16px;padding:16px;max-width:900px;margin:16px auto"><h2 style="margin:0 0 6px">ANNAN Creative Studio</h2><p style="color:#a9a096;margin:0 0 16px">Texto → imagem → vídeo → voz</p><div style="display:grid;gap:10px"><textarea id="cs-prompt" style="min-height:110px;width:100%;box-sizing:border-box;background:#211d19;color:#eee7df;border:1px solid #4b4035;border-radius:10px;padding:12px" placeholder="Descreva a campanha, produto ou vídeo..."></textarea><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="cs-copy">✍️ Copy + roteiro</button><button id="cs-image">🖼️ Imagem</button><button id="cs-video">🎥 Runway</button><button id="cs-luma">🎥 Luma</button><button id="cs-voice">🎙️ Narração</button></div><div id="cs-out" style="white-space:pre-wrap;overflow:auto;max-height:55vh;background:#211d19;border:1px solid #3b332c;border-radius:10px;padding:12px;min-height:80px">Pronto.</div></div></section>`;
 const p=host.querySelector('#cs-prompt'),out=host.querySelector('#cs-out');
 const run=async(fn)=>{out.textContent='ANNAN a trabalhar…';try{const r=await fn();out.textContent=JSON.stringify(r.result||r,null,2);return r}catch(e){out.textContent='Erro: '+e.message}};
 host.querySelector('#cs-copy').onclick=()=>run(()=>ANNAN_CREATIVE.text('Cria uma campanha de alta conversão para: '+p.value+'\nEntregar: público, dor, desejo, ângulo, 5 hooks, copywriting, storytelling, storyselling, oferta, CTA, roteiro de vídeo curto, retenção e 3 variações A/B.'));
 host.querySelector('#cs-image').onclick=()=>run(()=>ANNAN_CREATIVE.image(p.value,'1024x1024'));
 host.querySelector('#cs-video').onclick=()=>run(()=>ANNAN_CREATIVE.video(p.value,null,'runway'));
 host.querySelector('#cs-luma').onclick=()=>run(()=>ANNAN_CREATIVE.video(p.value,null,'luma'));
 host.querySelector('#cs-voice').onclick=()=>run(()=>ANNAN_CREATIVE.voice(p.value));
}
window.renderCreativeStudio=render;
function mount(){
 const sheet=document.querySelector('.ao-sheet');
 if(!sheet||sheet.querySelector('#ao-creative-open'))return;
 const b=document.createElement('button');b.id='ao-creative-open';b.textContent='🎨 Creative Studio';
 sheet.appendChild(b);
 b.onclick=()=>{
  let overlay=document.getElementById('ao-creative-overlay');
  if(!overlay){overlay=document.createElement('div');overlay.id='ao-creative-overlay';Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9999',overflow:'auto',background:'#0f0d0b',padding:'12px'});const close=document.createElement('button');close.textContent='← Voltar ao ANNAN';Object.assign(close.style,{padding:'10px 14px',margin:'4px',cursor:'pointer'});close.onclick=()=>overlay.remove();overlay.appendChild(close);const host=document.createElement('div');overlay.appendChild(host);document.body.appendChild(overlay);render(host);}else overlay.remove();
 };
}
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(mount,500);
})();
