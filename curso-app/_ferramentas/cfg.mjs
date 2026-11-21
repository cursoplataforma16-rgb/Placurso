export const extraRoots=['init','annanPedir','renderAnnanFerramentas'];
export const deMain=['annanEstilos','annanFicha','annanPedir','annanPainelGeral','renderAnnan','renderAnnanFerramentas','renderAnnanFicheiros','renderCasaAnnan','renderPedidosAnnan','renderTarefasAnnan','faTextoDe','faTipo','faEnviar','FA_TEXTO','ANNAN_IDENT','RE_CHAVE_TXT','DEVOPS_ROTULO','renderAcademia','annanFlutuanteHTML','ligarAnnanFlutuante','rmBD','rmGuardar','rmApagar','rmLerTodos','rmOuvir','rmReduzir','rmJuntar','rmUm','rmAndar','rmFim','rmDesenhar','rmRetomar','fotosAntesDepois','tentarRecuperarSupabase','carregarScriptComPromise','ABAS_CONFIGURAVEIS'];
export const dropRoots=[t=>t.includes('sincronizarFilaOffline')];
export const cortar=['sincronizarFilaOffline','enviarMediaPendenteDeObra','renderFeedTab','renderFeedLista','renderPedidoAgente','renderAfilhadoShell','renderObraDetalheAfilhado','renderIndicarClienteParceiro','obraMediaTiraHTML','carregarMediaObraCard','enviarMediaPendenteDeObra','LOOKS_ESTILISTA','motorLooksHTML','LOOKS_FOTOS_CACHE','carregarLooksFotos','LOOKS_MIDIAS','LOOKS_MIDIA_I','renderLookVisualHTML','ativarMotorLooks','_manequimSeq','svgManequimHTML','tecidosCache','amostraTecidoHTML','MEDIDAS_ATEND','renderHolding'];
export function aplicar({sub,repl,drop,byName}){
  repl('ehRotaCurso',"function ehRotaCurso(){ return true; }");
  repl('modoLojaInfo',"let modoLojaInfo = true;");
  repl('carregarTecidos',"async function carregarTecidos(){ return []; }");
  repl('carregarSituacaoAtelier',"async function carregarSituacaoAtelier(){ return null; }");
  repl('textoSituacaoAtelier',"function textoSituacaoAtelier(){ return ''; }");
  repl('USOS_TECIDO',"const USOS_TECIDO = {};");
  repl('tecidosDoProduto',"async function tecidosDoProduto(){ return []; }");
  repl('chipsTecidosHTML',"function chipsTecidosHTML(){ return ''; }");
  repl('irParaTecido',"function irParaTecido(){}");
  repl('ehCursoAlfaiataria',"const ehCursoAlfaiataria = () => false;");
  repl('abrirAtendimento',"function abrirAtendimento(){ return abrirAssistente(); }");
  repl('ligarAtendimentoAoParceiro',"async function ligarAtendimentoAoParceiro(){}");
  repl('refParceiro',"function refParceiro(){ return null; }");
  repl('iniciarRegistoAgente',"function iniciarRegistoAgente(){}");
  repl('REDES_DIONUEL',"const REDES_DIONUEL = { whatsapp: CURSO_WHATSAPP };");
  sub('criarLinhaProdutoAdmin',t=>t.replace("if(p.tipo === 'pronto' || p.tipo === 'servico_atelier') card.appendChild(criarEditorTecidosProduto(p, container));",""));
  sub('init',t=>t.replace("try{ pararChatEquipa(); }catch(_e){}",""));
  sub('signOut',t=>t.replace("try{ pararChatEquipa(); }catch(_e){}",""));
  sub('renderCeoShell',t=>t.replace("if(ceoTab === 'home') await renderFeedTab(content, true);","if(ceoTab === 'home') await renderVisitantesCEO(content);"));
  repl('renderAnnanFerramentas',"function renderAnnanFerramentas(container){ const t=[['pedidos_annan','Pedidos do ANNAN'],['tarefas_annan','Tarefas'],['bancada_annan','Bancada'],['casa_annan','Casa do ANNAN'],['fases_annan','Fases'],['apidionuel','Cérebro (API)'],['midias','Biblioteca'],['atendente','Atendente']]; container.innerHTML = '<div style=\"display:flex;flex-wrap:wrap;gap:8px;padding:12px\">' + t.map(a => '<button class=\"btn btn-secondary\" data-gt=\"'+a[0]+'\">'+a[1]+'</button>').join('') + '</div>'; container.querySelectorAll('[data-gt]').forEach(b => b.onclick = () => { ceoTab = b.dataset.gt; renderCeoShell(); }); }");
  repl('renderVitrineLoja',"async function renderVitrineLoja(){ modoLojaInfo = true; return renderLojaInfoprodutos(); }");
  repl('routeByUsuario',`async function routeByUsuario(){
  await carregarConfiguracoesSistema();
  if(currentUsuario.papel === 'ceo'){ renderCeoShell(); }
  else if(currentUsuario.estado === 'rejeitado'){ renderRejected(); }
  else { renderVitrineLoja(); }
}`);
  repl('CEO_SECOES',`const CEO_SECOES = [
  { id:'inicio', ic:'🏠', nome:'Início', itens:[['home','Visitantes']] },
  { id:'annan', ic:'🧠', nome:'ANNAN', itens:[['annan','ANNAN'], ['fases_annan','Fases do ANNAN'], ['pedidos_annan','Pedidos do ANNAN'], ['tarefas_annan','Tarefas do ANNAN'], ['bancada_annan','Bancada do ANNAN'], ['casa_annan','Casa do ANNAN'], ['apidionuel','Cérebro'], ['midias','Biblioteca do atendente'], ['atendente','Atendente'], ['atendimento','Conversas']] },
  { id:'curso', ic:'🛒', nome:'Plataforma Curso', itens:[['produtos_ceo','Produtos e preços'], ['mentoria_ceo','Mentoria'], ['alunos_ceo','Alunos do ANNAN'], ['trabalhos_ceo','Trabalhos pagos'], ['livroscursos','Editar livros e cursos'], ['infoloja','Loja'], ['recebimentos','Recebimentos'], ['biblioteca','Ficheiros'], ['fabrica','Fábrica'], ['oportunidades','Oportunidades'], ['ferramentas','Ferramentas']] },
  { id:'sistema', ic:'⚙️', nome:'Sistema', itens:[['membros','Membros'], ['continuidade','Cópias'], ['integracoes','Integrações'], ['hub','Tudo']] }
];`);
  const manter=new Set(['home','visitantes','fases_annan','pedidos_annan','tarefas_annan','bancada_annan','casa_annan','annan','apidionuel','midias','atendente','produtos_ceo','mentoria_ceo','alunos_ceo','trabalhos_ceo','livroscursos','infoloja','recebimentos','biblioteca','fabrica','oportunidades','ferramentas','atendimento','membros','continuidade','integracoes','hub']);
  sub('renderCeoShell',t=>t.split('\n').filter(l=>{const m=l.match(/^\s*if\(ceoTab === '([a-z_]+)'\)/);return !m||manter.has(m[1]);}).join('\n'));
}

export function cabecalho(h){
  h=h.split("const HEAD_DIONUEL = { manifest: 'manifest.json', icone: 'icon-192.png', cor: '#1C1A17' };").join("const HEAD_DIONUEL = { manifest: '/manifest-curso.json', icone: '/curso-icon-192.png', cor: '#14284B' };");
  h=h.split("navigator.serviceWorker.register('sw.js')").join("navigator.serviceWorker.register('/cursos-sw.js', { scope: '/cursos' })");
  h=h.split('txyjrczknkiheofptgxc').join('ebdrrsrvjsdjthatfbcd').split('sb_publishable_YzuHPCy8KXRn4w_rJNKPBg_ZeJEZrya').join('sb_publishable_yGhE0wXCqPMKSMrc1xlzkw_1E8JmFD9');
  h=h.split("'Nome do beneficiário (aparece no seu banco)', 'Dionuel', 'Dionuel'").join("'Nome do beneficiário (aparece no seu banco)', 'Plataforma Curso', 'Plataforma Curso'");
  h=h.split("titular: 'Dionuel Comércio e Prestação de Serviços'").join("titular: 'Plataforma Curso'");
  h=h.split('<div class="logo-mark">DIONUEL</div>').join('<div class="logo-mark">PLATAFORMA CURSO</div>')
   .split('<div class="brand">DIONUEL <span class="tag">Gestão</span></div>').join('<div class="brand">PLATAFORMA CURSO <span class="tag">Gestão</span></div>')
   .split('<img src="logo-dionuel.webp" alt="Dionuel" class="logo-emblema">').join('<img src="/curso-logo.png" alt="Plataforma Curso" class="logo-emblema">')
   .split("const ANNAN_IDENT = ['Dionuel Alfaiataria', 'Outra', 'Nenhuma'];").join("const ANNAN_IDENT = ['Plataforma Curso', 'Outra', 'Nenhuma'];")
   .split("encodeURIComponent('Dionuel Alfaiataria, Ilha de Luanda, Sector Ponta, Angola')").join("encodeURIComponent('Plataforma Curso')");
  const DESC='Cursos práticos no telemóvel com o professor ANNAN: aulas para ler, ouvir ou ver, prática real, provas e certificado. O nível básico de cada curso é grátis. Também livros, kits e ferramentas para aplicar.';
  const TITULO='Plataforma Curso — aprender, aplicar e crescer';
  const SITE='https://placurso.netlify.app';
  const ld={'@context':'https://schema.org','@type':'Organization',name:'Plataforma Curso',url:SITE+'/',logo:SITE+'/curso-logo.png',slogan:'Aprender · Aplicar · Crescer'};
  const q=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  h=h.replace(/<title>[\s\S]*?<\/title>/,'<title>'+TITULO+'</title>')
   .replace(/<meta name="description"[^>]*>\s*/gi,'')
   .replace(/<meta (property|name)="(og|twitter):[^"]*"[^>]*>\s*/gi,'')
   .replace('<link rel="manifest" href="manifest.json">','<link rel="manifest" href="/manifest-curso.json">')
   .replace(/<link rel="icon"[^>]*>/,'<link rel="icon" href="/curso-icon-192.png" type="image/png">')
   .replace(/<link rel="apple-touch-icon"[^>]*>/,'<link rel="apple-touch-icon" href="/curso-icon-192.png">')
   .replace(/<meta name="theme-color"[^>]*>/,'<meta name="theme-color" content="#14284B">')
   .replace('</head>','<meta name="description" content="'+q(DESC)+'"><link rel="canonical" href="'+SITE+'/"><meta property="og:site_name" content="Plataforma Curso"><meta property="og:type" content="website"><meta property="og:title" content="'+q(TITULO)+'"><meta property="og:description" content="'+q(DESC)+'"><meta property="og:image" content="'+SITE+'/curso-og.png"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">'+JSON.stringify(ld)+'</script></head>');
  h=h.replace('id="splashMarca">DIONUEL<','id="splashMarca" style="color:#14284B;font-weight:700"><img src="/curso-logo.png" alt="" style="width:56px;height:56px;border-radius:14px;display:block;margin:0 auto 10px">PLATAFORMA CURSO<').replace('<body>','<body style="background:#FBF9F2">');
  return h;
}
