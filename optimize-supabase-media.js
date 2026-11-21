/* Reduz a saída em cache do Supabase:
   converte imagens públicas em miniaturas WebP no CDN do Netlify e evita
   o pré-carregamento de vídeos até a pessoa tocar em Reproduzir.
*/
(function(){
  'use strict';
  const ORIGEM = 'https://txyjrczknkiheofptgxc.supabase.co/storage/v1/object/public/';
  const PREFIXO_CDN = '/.netlify/images?url=';
  const LARGURAS = [240, 360, 480, 720, 960];

  function origemValida(url){
    return typeof url === 'string' && url.startsWith(ORIGEM)
      && !/[?&](download|token|signature)=/i.test(url);
  }
  function larguraPara(el){
    let largura = 0;
    try { largura = el.getBoundingClientRect().width || 0; } catch(_e){}
    if(!largura) largura = Number(el.getAttribute('width')) || Number(el.width) || 360;
    const alvo = Math.min(960, Math.max(160, Math.round(largura * 1.35)));
    return LARGURAS.find(n => n >= alvo) || 960;
  }
  function urlOtimizada(url, largura){
    return PREFIXO_CDN + encodeURIComponent(url) + '&w=' + largura + '&fm=webp&q=66';
  }
  function otimizarImagem(img){
    if(!(img instanceof HTMLImageElement)) return;
    const original = img.getAttribute('src') || '';
    if(!origemValida(original) || img.dataset.egressOptimizedFor === original) return;
    img.dataset.egressOriginal = original;
    img.dataset.egressOptimizedFor = original;
    if(!img.dataset.egressFallbackBound){
      img.dataset.egressFallbackBound = '1';
      img.addEventListener('error', function(){
        const antigo = img.dataset.egressOriginal || '';
        if(antigo && img.src.includes('/.netlify/images?') && !img.dataset.egressFallbackUsed){
          img.dataset.egressFallbackUsed = '1'; img.src = antigo;
        }
      });
    }
    if(img.hasAttribute('srcset') && img.getAttribute('srcset').includes(ORIGEM)) img.removeAttribute('srcset');
    img.src = urlOtimizada(original, larguraPara(img));
  }
  function otimizarPoster(video){
    if(!(video instanceof HTMLVideoElement)) return;
    const poster = video.getAttribute('poster') || '';
    if(!origemValida(poster) || video.dataset.egressPosterFor === poster) return;
    video.dataset.egressPosterFor = poster;
    video.dataset.egressPosterOriginal = poster;
    video.poster = urlOtimizada(poster, larguraPara(video));
    if(!video.dataset.egressPosterFallbackBound){
      video.dataset.egressPosterFallbackBound = '1';
      video.addEventListener('error', function(){
        const antigo = video.dataset.egressPosterOriginal || '';
        if(antigo && video.poster.includes('/.netlify/images?') && !video.dataset.egressPosterFallbackUsed){
          video.dataset.egressPosterFallbackUsed = '1'; video.poster = antigo;
        }
      });
    }
  }
  function processar(node){
    if(!node || node.nodeType !== 1) return;
    if(node.matches('img')) otimizarImagem(node);
    if(node.matches('video')){
      if(!node.hasAttribute('data-egress-allow-preload')) node.preload = 'none';
      otimizarPoster(node);
    }
    node.querySelectorAll('img').forEach(otimizarImagem);
    node.querySelectorAll('video').forEach(video => {
      if(!video.hasAttribute('data-egress-allow-preload')) video.preload = 'none';
      otimizarPoster(video);
    });
  }
  function iniciar(){
    processar(document.documentElement);
    new MutationObserver(mutations => {
      for(const m of mutations){
        if(m.type === 'childList') m.addedNodes.forEach(processar);
        else if(m.type === 'attributes'){
          if(m.target.matches('img')) otimizarImagem(m.target);
          if(m.target.matches('video')){
            if(!m.target.hasAttribute('data-egress-allow-preload')) m.target.preload = 'none';
            otimizarPoster(m.target);
          }
        }
      }
    }).observe(document.documentElement, {
      subtree:true, childList:true, attributes:true,
      attributeFilter:['src','srcset','poster']
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once:true });
  else iniciar();
})();
