/* ANNAN Online v11 — interface de trabalho organizada em 3 secções sempre à vista:
   Trabalho (Conversa, Pesquisar, Verificar, Estudar, Escrever), Gestão (Pedidos, Tarefas, Bancada,
   Atendente, Gestão avançada, Estado) e Conhecimento (Ficheiros, Memória, Academia, Casa, Ligações,
   Chaves, Guardar site, ANNAN Offline). Cada resposta tem Copiar, Verificar isto e Guardar.
   Carregado DEPOIS do app.js (index.html, arranque) para substituir o renderAnnan antigo. */
(function(){
  'use strict';
  const OFFLINE_URL='/annan-offline/';
  const journal=async(type,payload={})=>{try{if(typeof sb==='undefined')return null;const event={event_id:`online-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,type,origin:'annan-online',payload,created_at:new Date().toISOString(),observable:true,schema_version:1};const r=await sb.functions.invoke('annan-learning-ingest',{body:{event}});if(r?.error)throw r.error;return r?.data||null}catch(_){return null}};
  window.ANNAN_ONLINE_JOURNAL={record:journal,recordCapability:(p)=>journal('capability.learned',p),recordProcedure:(p)=>journal('procedure.learned',p),recordCode:(p)=>journal('code.learned',p),recordTool:(p)=>journal('tool.created',p),recordReasoningArtifact:(p)=>journal('reasoning.artifact',p),recordDecision:(p)=>journal('decision.created',p),recordTask:(p)=>journal('task.completed',p)};

  // ---------- Secções e abas (tudo à vista; nada escondido) ----------
  const GRUPOS=[
    {id:'trabalho',nome:'Trabalho',abas:[['chat','Conversa'],['pesquisar','Pesquisar'],['verificar','Verificar'],['estudar','Estudar'],['escrever','Escrever']]},
    {id:'gestao',nome:'Gestão',abas:[['pedidos','Pedidos'],['tarefas','Tarefas'],['bancada','Bancada'],['atendente','Atendente'],['avancada','Gestão avançada'],['estado','Estado']]},
    {id:'saber',nome:'Conhecimento',abas:[['fich','Ficheiros'],['mem','Memória'],['academia','Academia'],['casa','Casa'],['lig','Ligações'],['chave','Chaves'],['sites','Guardar site'],['offline','ANNAN Offline']]}
  ];
  const grupoDe=id=>(GRUPOS.find(g=>g.abas.some(a=>a[0]===id))||GRUPOS[0]).id;
  const nomeDe=id=>{for(const g of GRUPOS)for(const a of g.abas)if(a[0]===id)return a[1];return ''};

  // ---------- Modos de trabalho (mesma conversa, instruções diferentes) ----------
  const MODOS={
    chat:{rotulo:'',titulo:'Como posso ajudar?',desc:'Peça qualquer coisa. O ANNAN usa a memória central, os dados reais e as ferramentas do sistema.',ph:'Escreva ao ANNAN…',pre:'',ini:[
      ['Resumo de hoje','Resumo do negócio hoje: conversas, pedidos, depósitos por confirmar, publicações e o que precisa de mim.'],
      ['Clientes à espera','Mostre os clientes que escreveram e ainda não fecharam, com o próximo passo para cada um.'],
      ['Contas do mês','Situação financeira do mês: recebido, por receber, custos e o que falta para o equilíbrio.'],
      ['Publicações de hoje','Mostre as publicações de hoje e o estado de cada uma.'],
      ['Alterar o site','Altere no site da Plataforma Curso o seguinte: '],
      ['Testar o site','Teste o site no navegador e diga os erros encontrados.'],
      ['Criar página de venda','Crie uma página de venda para: '],
      ['Propostas a parceiros','Prepare propostas de parceria para escolas e empresas que possam usar os cursos.'],
      ['Reel de um produto','Crie um reel que explica e vende este produto: '],
      ['Pagamentos por confirmar','Mostre os pagamentos por confirmar e os alunos com plano a acabar.']]},
    pesquisar:{rotulo:'Pesquisa',titulo:'Pesquisar',desc:'O ANNAN parte a pergunta, procura primeiro em fontes oficiais, lê as páginas, cruza e separa o que está confirmado do que não está. As fontes ficam guardadas.',ph:'O que quer investigar?',
      pre:'[MODO PESQUISA] Use o método de investigação (ferramenta investigar ou pesquisar_web): parta a pergunta em partes, fontes oficiais primeiro, leia as páginas, cruze as fontes. Responda em secções: Resposta curta; Confirmado; Não confirmado; O que fazer. Termine com "Fontes:" (uma por linha: título e link) e guarde as fontes em fontes_investigacao.\n\nPergunta: ',ini:[
      ['Método dos melhores países','Que fontes oficiais e estudos mostram o que os países com melhor ensino fazem neste tema?'],
      ['Concursos abertos','Que concursos públicos e processos de seleção estão abertos este mês?'],
      ['O que fazem os melhores','O que fazem nas redes sociais as plataformas de ensino com mais alunos no mundo? Dê exemplos que a Plataforma Curso pode aplicar.'],
      ['Regras das redes','Quais são as regras atuais do Instagram e do TikTok para chegar a mais pessoas sem pagar?']]},
    verificar:{rotulo:'Verificação',titulo:'Verificar',desc:'Cole um texto, um número ou uma afirmação. O ANNAN confirma cada parte com os dados do sistema ou com fontes da internet e devolve a versão corrigida.',ph:'Cole o texto a verificar…',
      pre:'[MODO VERIFICAR] Verifique o texto abaixo, afirmação a afirmação. Para cada uma escreva: Confirmado, Falso ou Não confirmado, e a prova (dados do sistema ou fonte com link). Sobre a Plataforma Curso use os dados reais do sistema; sobre o mundo use a internet. Nunca diga confirmado sem prova. Termine com "Versão corrigida:" e com "Fontes:".\n\nTexto: ',ini:[
      ['Verificar a última resposta','@ultima'],
      ['Verificar os números do mês','Os números do mês que o ANNAN me deu estão certos? Confira com as obras, recebimentos e despesas registadas.'],
      ['Colar um texto','']]},
    estudar:{rotulo:'Estudo',titulo:'Estudar',desc:'Aprenda um tema passo a passo: objetivo, explicação simples, exemplo da Plataforma Curso, erros comuns e perguntas para testar. Use também a Academia na secção Conhecimento.',ph:'Que tema quer aprender?',
      pre:'[MODO ESTUDO] Ensine como um bom professor: 1) objetivo em 1 frase; 2) explicação simples em 3 a 5 partes com títulos; 3) um exemplo aplicado à Plataforma Curso; 4) erros comuns; 5) três perguntas para eu testar (respostas só quando eu pedir). Use a base de saber, a Academia e fontes; termine com "Fontes:".\n\nTema: ',ini:[
      ['Preço de um fato','Como calcular o preço certo de um fato sob medida.'],
      ['Negociar com escolas','Como negociar uma parceria de formação com uma escola ou empresa.'],
      ['Ler o resultado do mês','Como ler o resultado do mês: faturado, recebido, custos e equilíbrio.'],
      ['Abrir a Academia','@academia']]},
    escrever:{rotulo:'Escrita',titulo:'Escrever',desc:'Textos prontos a usar: posts, propostas, mensagens a clientes, cartas. Português claro, sem emojis e sem números inventados.',ph:'O que quer que eu escreva?',
      pre:'[MODO ESCRITA] Escreva o texto pedido, pronto a usar: título; texto em blocos curtos; português claro; trate o leitor por você; sem emojis; nunca invente números, preços ou clientes (use os dados do sistema). No fim, dê 2 alternativas curtas para o título ou gancho.\n\nPedido: ',ini:[
      ['Post para as redes','Post para o Instagram e Facebook sobre: '],
      ['Proposta de formação','Proposta de formação para a organização: '],
      ['Cobrança educada','Mensagem educada para lembrar um cliente do pagamento em falta: '],
      ['Resposta a pedido de desconto','Resposta a um cliente que pediu desconto num fato de noivo.']]}
  };
  const RE_PREFIXO=/^\[MODO ([A-ZÇÃÉ]+)\][\s\S]*?\n\n(?:Pergunta|Texto|Tema|Pedido): /;
  const ROTULO_PREFIXO={PESQUISA:'Pesquisa',VERIFICAR:'Verificação',ESTUDO:'Estudo','ESCRITA':'Escrita'};

  // ---------- Texto das respostas (leitura confortável) ----------
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(_){return u}};
  const linha=l=>esc(l)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\[([^\]]{1,120})\]\((https?:\/\/[^\s)]+)\)/g,(m,t,u)=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,(m,a,u)=>`${a}<a href="${u}" target="_blank" rel="noopener">${esc(host(u))}</a>`);
  function textoHTML(t){
    const ls=String(t||'').replace(/\r/g,'').replace(/�/g,'').split('\n');let html='',lista=null,fontes=false;
    const fecha=()=>{if(lista){html+=`</${lista}>`;lista=null}};
    for(const bruta of ls){const x=bruta.trim();
      if(!x){fecha();continue}
      if(/^(fontes|sources)\s*:?\s*$/i.test(x.replace(/[*#]/g,''))){fecha();fontes=true;html+='<div class="ao-fontes-t">Fontes</div>';continue}
      const h=x.match(/^#{1,4}\s*(.+)$/)||(/^\*\*[^*]{2,70}\*\*:?$/.test(x)?[x,x.replace(/\*\*/g,'').replace(/:$/,'')]:null);
      if(h){fecha();html+=`<h4>${linha(h[1])}</h4>`;continue}
      const b=x.match(/^[-•*]\s+(.+)$/),n=x.match(/^(\d{1,2})[.)]\s+(.+)$/);
      if(b||n){const tipo=b?'ul':'ol';if(lista!==tipo){fecha();html+=`<${tipo} class="${fontes?'ao-fontes':''}">`;lista=tipo}html+=`<li>${linha(b?b[1]:n[2])}</li>`;continue}
      fecha();
      const dec=x.replace(/\*\*/g,'').match(/^decis[ãa]o\s*[:\-–—]\s*(.+)$/i);
      if(dec){const q=dec[1].replace(/[?¿]+$/,'');const ps=q.split(/\s+ou\s+/i).map(s=>s.trim()).filter(Boolean);const ops=ps.length>=2&&ps.length<=3&&ps.every(s=>s.length<=60)?ps:[];html+=`<div class="ao-dec"><p>${linha(dec[1])}</p>${ops.map(o=>{const t=o.charAt(0).toUpperCase()+o.slice(1);return `<button type="button" class="ao-resp" data-resp="${esc(t)}">${esc(t)}</button>`}).join('')}</div>`;continue}
      if(/^✅|^✓/.test(x)){html+=`<p class="ao-ver">${linha(x.replace(/^✅\s*|^✓\s*/,''))}</p>`;continue}
      if(/^(confirmado|falso|não confirmado|nao confirmado)\b/i.test(x)){const k=/^falso/i.test(x)?'f':/^n/i.test(x)?'n':'c';html+=`<p class="ao-veri ${k}">${linha(x)}</p>`;continue}
      html+=fontes&&/https?:\/\//.test(x)?`<p class="ao-fonte">${linha(x)}</p>`:`<p>${linha(x)}</p>`;
    }
    fecha();return html||'<p>…</p>';
  }

  // ---------- Estilos ----------
  function estilos(){
    const id='annan-online-v11-style';document.getElementById(id)?.remove();document.getElementById('annan-online-parity-style')?.remove();
    const st=document.createElement('style');st.id=id;st.textContent=`
    .ao-app{position:fixed;inset:0;z-index:60;height:100dvh;display:flex;flex-direction:column;background:#171412;color:#eee7df;overflow:hidden;font-size:16px}
    body.ao-aberto .af-btn,body.ao-aberto .ceq-fab,body.ao-aberto #off22Bar,body.ao-aberto .an-flut,body.ao-aberto [class*="flutuante"]{display:none!important}
    .ao-top{flex:none;display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #2e2823;background:#191613}
    .ao-logo{height:34px;width:auto;display:block}
    .ao-mode{font-size:12px;color:#a9a096;display:flex;align-items:center;gap:6px;margin-left:auto;white-space:nowrap}
    .ao-dot{width:8px;height:8px;border-radius:50%;background:#6fbf73}
    .ao-mode.work{color:#e3c58e}.ao-mode.work .ao-dot{background:#c39a5b;animation:aoPulse 1s ease-in-out infinite}
    @keyframes aoPulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}
    #ao-voz{margin-left:8px;margin-right:6px}#ao-voz.on{border-color:#c9a45c;color:#e3c37f}
    .ao-sair{flex:none;min-height:38px;padding:0 12px;border:1px solid #4b4035;border-radius:10px;background:#211d19;color:#eee7df;font-size:13px;cursor:pointer}
    .ao-nav{flex:none;padding:8px 12px 10px;border-bottom:1px solid #2e2823;background:#1a1714}
        .ao-secs{display:grid;gap:5px}
    .ao-sec{padding:4px 7px 6px;border:1px solid #2e2823;border-radius:12px;background:#1d1916}
    .ao-sec.on{border-color:#5a4a36}
    .ao-sec-t{font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:#a9a096;margin:0 0 3px 2px;font-weight:700}
    .ao-sec.on .ao-sec-t{color:#e3c58e}
    .ao-sec-ab{display:flex;flex-wrap:wrap;gap:4px}
    .ao-num{display:inline-block;min-width:20px;height:20px;margin-left:6px;padding:0 6px;border-radius:10px;background:#c0503f;color:#fff;font-size:11.5px;line-height:20px;font-weight:700;vertical-align:1px}
    .ao-t{min-height:33px;padding:0 10px;border:1px solid #3b332c;border-radius:999px;background:transparent;color:#d9d0c5;font-size:13px;cursor:pointer}
    .ao-t.on{border-color:#c39a5b;color:#171412;background:#c39a5b;font-weight:700}
    .ao-t.alerta{border-color:#c0503f;color:#f1c9c2}.ao-t.on .ao-num{background:#171412;color:#e3c58e}
    .ao-nav-fim{display:flex;align-items:center;gap:8px;margin-top:5px}
    .ao-onde{flex:1;font-size:12px;color:#8f867c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ao-rec{flex:none;min-height:32px;padding:0 12px;border:1px solid #3b332c;border-radius:999px;background:transparent;color:#cfc6bb;font-size:12.5px;cursor:pointer}
    .ao-nav.recolhida .ao-secs{display:none}.ao-nav.recolhida .ao-nav-fim{margin-top:0}.ao-nav.recolhida .ao-onde{color:#e3c58e;font-size:13px}
    .ao-pedaviso{flex:none;margin:8px 12px 0;min-height:42px;padding:8px 14px;border:1px solid #c0503f;border-radius:12px;background:#2a1b18;color:#f6ddd8;font-size:14px;font-weight:600;text-align:left;cursor:pointer}.ao-pedaviso[hidden]{display:none}
    .ao-pane{flex:1;overflow:auto;padding:14px;min-height:0}.ao-pane[hidden]{display:none}
    .ao-pane .ao-estado-linha{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #3b332c;font-size:14px}
    .ao-pane .ao-acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
    .ao-pane .ao-acoes button{min-height:42px;padding:0 14px;border:1px solid #4b4035;border-radius:10px;background:#211d19;color:#eee7df;cursor:pointer;font-size:14px}
    .ao-pane .ao-res{margin-top:12px;color:#a9a096;font-size:13px;white-space:pre-wrap}
    .ao-chat{flex:1;overflow:auto;padding:14px 14px 24px;min-height:0}.ao-chat[hidden],.ao-compose[hidden]{display:none}
    .ao-cartao{max-width:820px;margin:4px auto 18px;padding:14px 16px;border:1px solid #3b332c;border-radius:14px;background:#1d1916}
    .ao-cartao h1{font-size:22px;margin:0 0 6px;font-weight:600}
    .ao-cartao p{color:#b5aca1;margin:0;line-height:1.55;font-size:14.5px}
    .ao-badge{margin-top:10px;color:#8f867c;font-size:12px}
    .ao-ords{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .ao-ord{min-height:46px;padding:10px 12px;border-radius:12px;border:1px solid #3a332d;background:#211d19;color:#f3ece2;font-size:14px;text-align:left;line-height:1.25;cursor:pointer}.ao-ord:active{background:#2f2823}
    .ao-msgs{max-width:820px;margin:auto}
    .ao-msg{margin:18px 0}
    .ao-msg.user{display:flex;flex-direction:column;align-items:flex-end}
    .ao-msg.user .ao-bubble{max-width:88%;padding:11px 14px;border-radius:16px;background:#332c25;border:1px solid #40362d;white-space:pre-wrap;overflow-wrap:anywhere;font-size:16px;line-height:1.5}
    .ao-tag{font-size:11px;color:#e3c58e;margin-bottom:4px;letter-spacing:.3px;text-transform:uppercase}
    .ao-msg.assistant .ao-bubble{font-size:17px;line-height:1.7;overflow-wrap:anywhere;color:#efe8de}
    .ao-bubble p{margin:0 0 10px}.ao-bubble h4{margin:16px 0 6px;font-size:17px;color:#e3c58e}
    .ao-bubble ul,.ao-bubble ol{margin:4px 0 10px;padding-left:22px}.ao-bubble li{margin:4px 0}
    .ao-bubble a{color:#e3c58e;text-decoration:underline;text-underline-offset:3px}
    .ao-ver{padding:10px 12px;border-left:3px solid #6fbf73;background:#1f261d;border-radius:0 10px 10px 0;font-weight:600}
    .ao-veri{padding:8px 12px;border-radius:10px;border:1px solid #3b332c}.ao-veri.c{border-color:#3f6b42;background:#1c241c}.ao-veri.f{border-color:#7a3a31;background:#2a1b18}.ao-veri.n{border-color:#6b5a32;background:#26211a}
    .ao-fontes-t{margin:16px 0 6px;padding-top:10px;border-top:1px solid #3b332c;font-size:12px;letter-spacing:.4px;text-transform:uppercase;color:#a9a096}
    .ao-fontes li,.ao-fonte{font-size:14px;color:#cfc6bb}
    .ao-dec{margin:12px 0;padding:12px;border:1px solid #6b5a32;border-radius:12px;background:#231e17}.ao-dec p{margin:0 0 8px;font-weight:600}
    .ao-resp{min-height:40px;margin:0 8px 6px 0;padding:0 16px;border:1px solid #c39a5b;border-radius:999px;background:transparent;color:#e3c58e;font-size:14px;font-weight:600;cursor:pointer}.ao-resp:active{background:#c39a5b;color:#171412}
    .ao-meta{margin-top:6px;font-size:11px;color:#756d66}
    .ao-msg-acoes{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
    .ao-msg-acoes button{min-height:34px;padding:0 12px;border:1px solid #3b332c;border-radius:999px;background:transparent;color:#cfc6bb;font-size:12.5px;cursor:pointer}
    .ao-msg-acoes button:active{background:#2f2823}
    .ao-thinking{display:flex;align-items:center;gap:6px;color:#a9a096;font-size:14px}
    .ao-thinking i{width:6px;height:6px;border-radius:50%;background:#c39a5b;animation:aoPulse 1s infinite}
    .ao-thinking i:nth-child(2){animation-delay:.15s}.ao-thinking i:nth-child(3){animation-delay:.3s}
    .ao-compose{flex:none;padding:8px 12px 12px;border-top:1px solid #2e2823;background:#171412}
    .ao-modo-l{max-width:820px;margin:0 auto 6px;font-size:12px;color:#e3c58e}
    .ao-form{max-width:820px;margin:auto;background:#211d19;border:1px solid #4b4035;border-radius:22px;display:flex;align-items:flex-end;padding:6px 7px}
    .ao-input{flex:1;resize:none;max-height:160px;min-height:40px;background:transparent;border:0;outline:0;color:#eee7df;font:inherit;font-size:16px;padding:9px 6px;line-height:1.4}
    .ao-send{width:42px;height:42px;flex:none;border:0;border-radius:50%;background:#c39a5b;color:#171412;font-weight:800;font-size:18px;cursor:pointer}.ao-send:disabled{opacity:.5}
    .ao-mais{width:40px;height:40px;flex:none;border:1px solid #4b4035;border-radius:50%;background:transparent;color:#eee7df;font-size:22px;line-height:1;cursor:pointer;margin-right:4px}
    .ao-anexos{max-width:820px;margin:0 auto 6px;display:flex;gap:6px;flex-wrap:wrap}.ao-anexos:empty{display:none}
    .ao-chip{display:flex;align-items:center;gap:6px;border:1px solid #4b4035;background:#211d19;border-radius:10px;padding:5px 6px 5px 10px;font-size:12px;max-width:100%}
    .ao-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}.ao-chip em{font-style:normal;color:#a9a096}
    .ao-chip button{background:none;border:0;color:#eee7df;opacity:.7;font-size:15px;cursor:pointer}.ao-chip img{width:28px;height:28px;object-fit:cover;border-radius:6px}
    .ao-msg.assistant .an2-passos{margin:0 0 8px}
    .ao-hidden{display:none!important}
    @media(min-width:900px){.ao-secs{grid-template-columns:repeat(3,1fr)}}
    `;document.head.appendChild(st);
  }

  // ---------- Contador de pedidos por aprovar ----------
  async function contarPedidos(){try{const {count}=await sb.from('annan_devops_pedidos').select('id',{count:'exact',head:true}).eq('estado','pendente');return count||0}catch(_){return 0}}

  async function novoRenderAnnan(container){
    if(typeof currentUsuario==='undefined'||!currentUsuario||currentUsuario.papel!=='ceo'){container.innerHTML='<div class="error-banner">Só o CEO.</div>';return}
    if(typeof annan2Estilos==='function'){try{annan2Estilos()}catch(_){}}
    estilos();
    let aba='chat';try{const g=localStorage.getItem('ao_aba');if(g&&nomeDe(g))aba=g}catch(_){}
    if(aba==='offline')aba='chat';
    let grupo=grupoDe(aba);

    container.innerHTML=`<div class="ao-app" id="ao-app">
      <header class="ao-top"><img class="ao-logo" src="/annan-offline/annan-logo.svg?v=1" alt="ANNAN"><div class="ao-mode" id="ao-mode"><span class="ao-dot"></span><span>Online</span></div><button type="button" class="ao-sair" id="ao-voz">Voz</button><button type="button" class="ao-sair" id="ao-sair">Painel</button></header>
      <nav class="ao-nav" id="ao-nav" aria-label="Secções do ANNAN"><div class="ao-secs" id="ao-abas"></div><div class="ao-nav-fim"><span class="ao-onde" id="ao-onde"></span><button type="button" class="ao-rec" id="ao-rec">Esconder abas</button></div></nav>
      <button type="button" class="ao-pedaviso" id="ao-pedaviso" hidden></button>
      <section class="ao-pane" id="ao-pane" hidden></section>
      <section class="ao-chat" id="ao-chat"><div class="ao-cartao" id="ao-cartao"></div><div class="ao-msgs" id="ao-msgs"></div></section>
      <div class="ao-compose" id="ao-compose"><div class="ao-modo-l" id="ao-modo-l"></div><div class="ao-anexos" id="ao-anexos"></div><form class="ao-form" id="ao-form"><button class="ao-mais" id="ao-mais" type="button" aria-label="Juntar foto, vídeo, PDF ou documento">+</button><input type="file" id="ao-fich" multiple accept="image/*,video/*,audio/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.json" hidden><textarea class="ao-input" id="ao-input" rows="1" autocomplete="off"></textarea><button class="ao-send" id="ao-send" type="submit" aria-label="Enviar">↑</button></form></div>
    </div>`;
    document.body.classList.add('ao-aberto');
    const vigia=setInterval(()=>{if(!document.getElementById('ao-app')){document.body.classList.remove('ao-aberto');clearInterval(vigia)}},800);

    const $=id=>document.getElementById(id);
    const chat=$('ao-chat'),list=$('ao-msgs'),cartao=$('ao-cartao'),mode=$('ao-mode'),pane=$('ao-pane'),compose=$('ao-compose'),abasEl=$('ao-abas'),navEl=$('ao-nav'),inp=$('ao-input');
    let modo='chat',pendentes=0,ultimaResposta='';
    const fmt=d=>{try{return new Date(d).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(_){return ''}};

    // ---------- navegação ----------
    function pintarNav(){
      // As 3 secções e TODAS as abas ficam à vista ao mesmo tempo (pedido do CEO, 14/11/2026).
      abasEl.innerHTML=GRUPOS.map(g=>`<div class="ao-sec${g.id===grupo?' on':''}"><div class="ao-sec-t">${g.nome}</div><div class="ao-sec-ab">${g.abas.map(([id,nome])=>`<button type="button" class="ao-t${id===aba?' on':''}${id==='pedidos'&&pendentes?' alerta':''}" data-aba="${id}">${nome}${id==='pedidos'&&pendentes?`<span class="ao-num">${pendentes}</span>`:''}</button>`).join('')}</div></div>`).join('');
      const g=GRUPOS.find(x=>x.id===grupo);$('ao-onde').textContent=(g?g.nome:'')+'  ›  '+nomeDe(aba);
      const av=$('ao-pedaviso');if(av){av.hidden=!pendentes||aba==='pedidos';av.textContent=pendentes===1?'1 pedido à espera da sua decisão. Toque para ver e aprovar.':pendentes+' pedidos à espera da sua decisão. Toque para ver e aprovar.'}
    }
    function recolher(sim){navEl.classList.toggle('recolhida',sim);$('ao-rec').textContent=sim?'Mostrar todas as abas':'Esconder abas';try{localStorage.setItem('ao_nav_recolhida',sim?'1':'')}catch(_){}}
    $('ao-rec').onclick=()=>recolher(!navEl.classList.contains('recolhida'));
    try{if(localStorage.getItem('ao_nav_recolhida')==='1')recolher(true)}catch(_){}
    $('ao-pedaviso').onclick=()=>abrirAba('pedidos');
    abasEl.addEventListener('click',e=>{const b=e.target.closest('.ao-t');if(b)abrirAba(b.dataset.aba)});
    $('ao-sair').onclick=()=>{document.body.classList.remove('ao-aberto');try{if(typeof renderCeoShell==='function'){ceoTab='painel_centro';renderCeoShell();return}}catch(_){}location.reload()};

    // ---------- cartão do modo ----------
    function pintarCartao(){
      const M=MODOS[modo];
      cartao.innerHTML=`<h1>${esc(M.titulo)}</h1><p>${esc(M.desc)}</p>${modo==='chat'?'<div class="ao-badge" id="ao-badge"></div>':''}<div class="ao-ords">${M.ini.map(([t,o])=>`<button type="button" class="ao-ord" data-ord="${esc(o)}">${esc(t)}</button>`).join('')}</div>`;
      inp.placeholder=M.ph;$('ao-modo-l').textContent=M.rotulo?('Modo: '+M.rotulo):'';
      if(modo==='chat'&&estadoMem)$('ao-badge').textContent=estadoMem;
    }
    cartao.addEventListener('click',e=>{const b=e.target.closest('.ao-ord');if(!b)return;const o=b.dataset.ord;
      if(o==='@academia'){abrirAba('academia');return}
      if(o==='@ultima'){if(!ultimaResposta){inp.focus();return}enviar(ultimaResposta.slice(0,6000));return}
      inp.value=o;autoAltura();inp.focus();if(o&&!/: $/.test(o))$('ao-form').requestSubmit()});

    // ---------- voz do ANNAN (voz do aparelho, pt-PT; funciona sem custos) ----------
    const vozLigada=()=>{try{return localStorage.getItem('ao_voz')==='1'}catch(_){return false}};
    function ouvir(texto){
      if(!window.speechSynthesis)return false;
      try{
        speechSynthesis.cancel();
        const limpo=String(texto||'').replace(/\[\[[^\]]*\]\]/g,'').replace(/https?:\/\/\S+/g,'').replace(/[#*_`>|]/g,'').replace(/\s*\n+\s*/g,'. ').trim();
        if(!limpo)return false;
        const vozes=speechSynthesis.getVoices();
        const v=vozes.find(x=>/pt[-_]PT/i.test(x.lang))||vozes.find(x=>/^pt/i.test(x.lang));
        const partes=limpo.match(/[^.!?]+[.!?]*/g)||[limpo];
        let bloco='';const blocos=[];
        for(const p of partes){if((bloco+p).length>200&&bloco){blocos.push(bloco);bloco=p}else bloco+=p}
        if(bloco)blocos.push(bloco);
        blocos.slice(0,12).forEach(b=>{const u=new SpeechSynthesisUtterance(b.trim());u.lang='pt-PT';if(v)u.voice=v;u.rate=0.97;speechSynthesis.speak(u)});
        return true;
      }catch(_){return false}
    }
    const botVoz=$('ao-voz');
    if(botVoz){
      const pintarVoz=()=>{botVoz.textContent='Voz: '+(vozLigada()?'ligada':'desligada');botVoz.classList.toggle('on',vozLigada())};
      pintarVoz();
      botVoz.onclick=()=>{const novo=!vozLigada();try{localStorage.setItem('ao_voz',novo?'1':'0')}catch(_){}if(!novo&&window.speechSynthesis)speechSynthesis.cancel();pintarVoz();if(novo)ouvir('Voz ligada.')};
    }

    // ---------- mensagens ----------
    const scrollFim=()=>{chat.scrollTop=chat.scrollHeight};
    function add(role,text,time,passos,tag){
      const row=document.createElement('div');row.className='ao-msg '+role;
      if(role==='user'){
        if(tag){const t=document.createElement('div');t.className='ao-tag';t.textContent=tag;row.appendChild(t)}
        const b=document.createElement('div');b.className='ao-bubble';b.textContent=text;row.appendChild(b);
      }else{
        if(passos&&typeof an2Passos==='function'){const w=document.createElement('div');try{w.innerHTML=an2Passos(passos)}catch(_){}while(w.firstChild)row.appendChild(w.firstChild)}
        const b=document.createElement('div');b.className='ao-bubble';b.innerHTML=textoHTML(text);row.appendChild(b);
        const ac=document.createElement('div');ac.className='ao-msg-acoes';
        ac.innerHTML='<button type="button" data-a="ouvir">Ouvir</button><button type="button" data-a="copiar">Copiar</button><button type="button" data-a="verificar">Verificar isto</button><button type="button" data-a="guardar">Guardar nos Ficheiros</button>';
        ac.addEventListener('click',ev=>acaoResposta(ev,String(text||'')));row.appendChild(ac);
        ultimaResposta=String(text||'');
      }
      if(time){const m=document.createElement('div');m.className='ao-meta';m.textContent=time;row.appendChild(m)}
      list.appendChild(row);scrollFim();
    }
    async function acaoResposta(ev,texto){
      const b=ev.target.closest('button');if(!b)return;const a=b.dataset.a,orig=b.textContent;
      const aviso=t=>{b.textContent=t;setTimeout(()=>{b.textContent=orig},1800)};
      if(a==='ouvir'){if(window.speechSynthesis&&speechSynthesis.speaking){speechSynthesis.cancel();aviso('Parado');return}if(!ouvir(texto))aviso('Sem voz neste aparelho');return}
      if(a==='copiar'){try{await navigator.clipboard.writeText(texto);aviso('Copiado')}catch(_){const t=document.createElement('textarea');t.value=texto;document.body.appendChild(t);t.select();try{document.execCommand('copy');aviso('Copiado')}catch(__){aviso('Não foi possível')}t.remove()}return}
      if(a==='verificar'){mudarModo('verificar');enviar(texto.slice(0,6000));return}
      if(a==='guardar'){b.disabled=true;b.textContent='A guardar…';try{const nome='ANNAN '+new Date().toISOString().slice(0,16).replace('T',' ').replace(':','h')+'.md';if(typeof faEnviar!=='function')throw new Error('sem ficheiros');await faEnviar(new File([texto],nome,{type:'text/markdown'}));aviso('Guardado')}catch(_){const url=URL.createObjectURL(new Blob([texto],{type:'text/markdown'}));const l=document.createElement('a');l.href=url;l.download='annan.md';l.click();setTimeout(()=>URL.revokeObjectURL(url),4000);aviso('Descarregado')}b.disabled=false}
    }
    list.addEventListener('click',e=>{const b=e.target.closest('.ao-resp');if(b&&!busy)enviar(b.dataset.resp)});
    const thinking=()=>{const row=document.createElement('div');row.className='ao-msg assistant';row.id='ao-thinking';row.innerHTML='<div class="ao-bubble ao-thinking"><i></i><i></i><i></i><span>A trabalhar…</span></div>';list.appendChild(row);scrollFim()};
    let estadoMem='';
    async function carregar(){
      try{
        const [{data:msgs,error},a,b2]=await Promise.all([
          sb.from('annan_chat').select('autor,texto,criado_em,passos').order('criado_em',{ascending:false}).limit(40),
          sb.from('annan_memoria').select('id',{count:'exact',head:true}).then(r=>r,()=>({count:0})),
          sb.from('annan_aprendido').select('id',{count:'exact',head:true}).then(r=>r,()=>({count:0}))
        ]);
        if(error)throw error;
        list.innerHTML='';
        (msgs||[]).reverse().forEach(m=>{
          if(m.autor==='ceo'){const t=String(m.texto||''),p=t.match(RE_PREFIXO);add('user',p?t.slice(p[0].length):t,fmt(m.criado_em),null,p?ROTULO_PREFIXO[p[1]]:'')}
          else add('assistant',m.texto,fmt(m.criado_em),m.passos)
        });
        estadoMem=`Memória central: ${a.count||0} registos · ${b2.count||0} tarefas que já sabe fazer sozinho`;
        const bd=$('ao-badge');if(bd)bd.textContent=estadoMem;
      }catch(e){void journal('error.created',{source:'annan-online',action:'memory.load',message:String(e?.message||e)})}
    }

    // ---------- anexos ----------
    let busy=false;const anexos=[];const boxAn=$('ao-anexos');
    const pintarAn=()=>{boxAn.innerHTML='';anexos.forEach((a,i)=>{const c=document.createElement('div');c.className='ao-chip';if(a.thumb){const im=document.createElement('img');im.src=a.thumb;im.alt='';c.appendChild(im)}const n=document.createElement('span');n.textContent=a.f.name;c.appendChild(n);const e=document.createElement('em');e.textContent=a.estado||'';c.appendChild(e);const x=document.createElement('button');x.type='button';x.textContent='×';x.onclick=()=>{anexos.splice(i,1);pintarAn()};c.appendChild(x);boxAn.appendChild(c)})};
    $('ao-mais').onclick=()=>$('ao-fich').click();
    $('ao-fich').onchange=e=>{for(const f of e.target.files||[]){if(f.size>50*1024*1024){add('assistant','"'+f.name+'" tem mais de 50 MB. Envie uma versão mais pequena.');continue}anexos.push({f,thumb:/^image\//.test(f.type)?URL.createObjectURL(f):null})}e.target.value='';pintarAn()};
    async function prepararAnexos(setEstado){const partes=[];for(const a of anexos.slice()){try{a.estado='a enviar';pintarAn();setEstado('A guardar '+a.f.name+'…');const r=await faEnviar(a.f);let analise='';if(/^(image|video|audio)\//.test(a.f.type)||/\.pdf$/i.test(a.f.name)){a.estado='a analisar';pintarAn();setEstado('A ver '+a.f.name+'…');const {data}=await sb.functions.invoke('annan-ficheiros',{body:{acao:'analisar',id:r.id}});analise=(data&&data.analise)||'';if(!analise&&data&&data.nota)analise='(não consegui analisar agora: '+data.nota+')'}partes.push({nome:a.f.name,id:r.id,tipo:r.tipo,analise})}catch(err){partes.push({nome:a.f.name,erro:String(err&&err.message||err)})}}anexos.length=0;pintarAn();return partes}

    // ---------- enviar ----------
    async function enviar(texto){
      texto=(texto||'').trim();if((!texto&&!anexos.length)||busy)return;
      if(texto&&typeof RE_CHAVE_TXT!=='undefined'&&RE_CHAVE_TXT.test(texto)&&typeof annanEntregarChave==='function'){
        busy=true;add('user','Chave enviada (não fica escrita na conversa).',fmt(new Date()));thinking();
        let r;try{r=await annanEntregarChave({texto})}catch(err){r='Não consegui entregar a chave: '+String(err&&err.message||err)}
        $('ao-thinking')?.remove();add('assistant',r,fmt(new Date()));busy=false;return}
      busy=true;
      const M=MODOS[modo];const nomesAn=anexos.map(a=>a.f.name);
      add('user',(texto||'Veja os anexos.')+(nomesAn.length?'\n[Anexos: '+nomesAn.join(', ')+']':''),fmt(new Date()),null,M.rotulo);
      let corpo=texto;
      if(anexos.length){thinking();const est=t=>{const s2=document.querySelector('#ao-thinking span');if(s2)s2.textContent=t};const partes=await prepararAnexos(est);$('ao-thinking')?.remove();
        corpo=(texto||'Analise os anexos, diga o que são e o que podemos fazer com eles para as marcas.')+'\n\nAnexos (nos Ficheiros do ANNAN):'+partes.map(p=>'\n- "'+p.nome+'"'+(p.erro?' (falhou: '+p.erro+')':'')+(p.analise?'\nO que se vê/ouve:\n'+String(p.analise).slice(0,3500):p.erro?'':' (lê com a ferramenta ficheiros acao ler)')).join('')}
      if(M.pre)corpo=M.pre+corpo;
      const btn=$('ao-send');btn.disabled=true;inp.disabled=true;mode.classList.add('work');mode.lastElementChild.textContent='A trabalhar…';thinking();
      const timerLento=setTimeout(()=>{const s2=document.querySelector('#ao-thinking span');if(s2)s2.textContent=modo==='pesquisar'||modo==='verificar'?'O ANNAN está a ler as fontes. Uma pesquisa pode levar 1 a 2 minutos; não envie de novo.':'O ANNAN está a consultar os dados. Não envie a pergunta de novo.'},12000);
      const started=new Date().toISOString();void journal('task.created',{task:'annan-agente.chat',modo,input:corpo,started_at:started});
      try{
        let data,error;
        if(typeof annanPedir==='function'){try{data=await annanPedir(corpo,110000);data={...data,resposta:data.resposta}}catch(e){error=e}}
        else ({data,error}=await sb.functions.invoke('annan-agente',{body:{acao:'chat',texto:corpo}}));
        clearTimeout(timerLento);$('ao-thinking')?.remove();
        if(error||!data||data.erro||!data.resposta){add('assistant','Não consegui responder agora: '+String(error?.message||data?.erro||'sem resposta')+'. A mensagem ficou guardada; tente de novo daqui a um minuto.');void journal('error.created',{source:'annan-agente',message:String(error?.message||data?.erro||'unknown')})}
        else{add('assistant',data.resposta,fmt(new Date()),data.passos);if(vozLigada())ouvir(data.resposta);void journal('task.completed',{task:'annan-agente.chat',modo,input:corpo,output:data.resposta,started_at:started,completed_at:new Date().toISOString()})}
      }catch(e){clearTimeout(timerLento);$('ao-thinking')?.remove();add('assistant','O ANNAN não conseguiu responder agora. Verifique a ligação antes de reenviar.')}
      finally{clearTimeout(timerLento);busy=false;btn.disabled=false;inp.disabled=false;mode.classList.remove('work');mode.lastElementChild.textContent='Online';atualizarPedidos()}
    }
    const autoAltura=()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,160)+'px'};
    $('ao-form').onsubmit=e=>{e.preventDefault();const v=inp.value;inp.value='';autoAltura();enviar(v)};
    inp.addEventListener('input',autoAltura);

    // ---------- abrir abas ----------
    const GERAIS=['fich','mem','sites','lig','chave'];
    const CEO={academia:'renderAcademia',tarefas:'renderTarefasAnnan',pedidos:'renderPedidosAnnan',bancada:'renderBancadaAnnan',casa:'renderCasaAnnan',atendente:'renderAtendenteTab'};
    function mudarModo(m){modo=m;aba=m;grupo='trabalho';pane.hidden=true;pane.innerHTML='';chat.hidden=false;compose.hidden=false;pintarCartao();pintarNav();try{localStorage.setItem('ao_aba',m)}catch(_){}}
    async function estadoPane(){
      const [a,b,c]=await Promise.all([sb.from('annan_memoria').select('id',{count:'exact',head:true}),sb.from('annan_aprendido').select('id',{count:'exact',head:true}),sb.functions.invoke('annan',{body:{acao:'estado'}}).catch(()=>({data:null}))]);
      const d=(c&&c.data)||{};const dt=x=>x?fmt(x):'—';
      pane.innerHTML=`<div class="ao-estado-linha"><span>Memórias</span><b>${a.count||0}</b></div><div class="ao-estado-linha"><span>Tarefas que já sabe fazer sozinho</span><b>${b.count||0}</b></div><div class="ao-estado-linha"><span>Pedidos à espera da sua aprovação</span><b>${pendentes}</b></div><div class="ao-estado-linha"><span>Último estudo</span><span>${dt(d.ultimo_aprender)}</span></div><div class="ao-estado-linha"><span>Casa da memória</span><span>${d.casa==='google-drive'?'Google Drive':'Supabase'}</span></div><div class="ao-acoes"><button type="button" id="ao-ap">Aprender agora</button><button type="button" id="ao-cp">Guardar cópia</button><button type="button" id="ao-rc">Recarregar a conversa</button></div><div class="ao-res" id="ao-res"></div>`;
      const res=pane.querySelector('#ao-res');
      const correr=async(btn,corpo,fmtOk)=>{btn.disabled=true;res.textContent='A trabalhar…';try{const {data}=await sb.functions.invoke('annan',{body:corpo});res.textContent=data&&!data.erro?fmtOk(data):'Não consegui agora. Tente outra vez.'}catch(_){res.textContent='Não consegui agora. Tente outra vez.'}btn.disabled=false};
      pane.querySelector('#ao-ap').onclick=e=>correr(e.currentTarget,{acao:'aprender'},r=>`Aprendeu ${r.memorias_novas||0} coisa(s) nova(s).`);
      pane.querySelector('#ao-cp').onclick=e=>correr(e.currentTarget,{acao:'exportar'},r=>`Cópia guardada: ${r.total} memórias.`);
      pane.querySelector('#ao-rc').onclick=async()=>{await carregar();mudarModo('chat')};
    }
    async function abrirAba(id){
      if(MODOS[id]){mudarModo(id);scrollFim();return}
      if(id==='offline'){void journal('activity.observed',{action:'offline.opened'});location.href=OFFLINE_URL;return}
      aba=id;grupo=grupoDe(id);try{localStorage.setItem('ao_aba',id)}catch(_){}
      pintarNav();chat.hidden=true;compose.hidden=true;pane.hidden=false;pane.innerHTML='<div class="loading-screen">A abrir…</div>';pane.scrollTop=0;
      try{
        if(GERAIS.includes(id)){if(typeof annanPainelGeral!=='function')throw new Error('painel indisponível');await annanPainelGeral(id,pane)}
        else if(id==='estado'){await estadoPane()}
        else if(id==='avancada'){if(typeof renderAnnanFerramentas!=='function')throw new Error('painel indisponível');await renderAnnanFerramentas(pane,(typeof abasAnnanCache!=='undefined'&&Array.isArray(abasAnnanCache))?abasAnnanCache:[])}
        else{const fn=CEO[id];let f=fn&&typeof window[fn]==='function'?window[fn]:null;if(!f&&fn){try{f=(0,eval)('typeof '+fn+"==='function'?"+fn+':null')}catch(_){}}if(!f)throw new Error('aba sem conteúdo');await f(pane)}
        if(id==='pedidos')atualizarPedidos();
      }catch(e){pane.innerHTML='<div class="error-banner"></div>';pane.firstChild.textContent='Não foi possível abrir esta aba: '+String(e&&e.message||e)}
      void journal('activity.observed',{action:'tab.opened',tab:id});
    }
    async function atualizarPedidos(){pendentes=await contarPedidos();pintarNav()}

    // ---------- arranque ----------
    pintarNav();
    if(MODOS[aba])mudarModo(aba);else abrirAba(aba);
    await carregar();
    atualizarPedidos();
    const intPed=setInterval(()=>{if(!document.getElementById('ao-app')){clearInterval(intPed);return}atualizarPedidos()},60000);
    // abrir uma aba pelo endereço: ...#annan=pedidos
    try{const m=location.hash.match(/annan=([a-z]+)/);if(m&&nomeDe(m[1]))abrirAba(m[1])}catch(_){}
  }

  // O app.js é carregado depois (arranque protegido) e declara o renderAnnan antigo.
  // Instalar agora e voltar a instalar quando o app.js terminar, para a interface nova ganhar sempre.
  window.renderAnnanNovo=novoRenderAnnan;
  const instalar=()=>{if(window.renderAnnan!==novoRenderAnnan)window.renderAnnan=novoRenderAnnan};
  instalar();
  let n=0;const t=setInterval(()=>{instalar();if(++n>120)clearInterval(t)},500);
})();
