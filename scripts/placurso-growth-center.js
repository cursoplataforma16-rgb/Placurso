/* Central de Crescimento exclusiva da Plataforma Curso / Placurso. */
(function (root) {
  'use strict';
  const channels = [
    { id: 'facebook', name: 'Facebook Pages', detail: 'Página, publicações, comentários e campanhas.', url: 'https://developers.facebook.com/apps/', needs: 'App Meta, permissões de Pages e Marketing API, revisão e autorização da Página.' },
    { id: 'instagram', name: 'Instagram', detail: 'Conta profissional ligada a uma Página Meta.', url: 'https://developers.facebook.com/apps/', needs: 'Conta profissional, Página Meta associada, Instagram Graph API e aprovação da app.' },
    { id: 'tiktok', name: 'TikTok', detail: 'Publicações, perfil e métricas aprovadas.', url: 'https://developers.tiktok.com/', needs: 'TikTok for Developers, produto e permissões aprovados e OAuth.' },
    { id: 'youtube', name: 'YouTube', detail: 'Canal, vídeos, Shorts e métricas.', url: 'https://console.cloud.google.com/apis/credentials', needs: 'Projecto Google Cloud, YouTube Data API e consentimento OAuth.' },
    { id: 'whatsapp', name: 'WhatsApp Business', detail: 'Atendimento, contactos e leads.', url: 'https://developers.facebook.com/apps/', needs: 'WhatsApp Business Platform, número elegível, webhook e permissões.' },
    { id: 'x', name: 'X', detail: 'Publicações e métricas conforme o acesso da API.', url: 'https://developer.x.com/en/portal/dashboard', needs: 'Projecto X Developer, credenciais e nível de API compatível.' }
  ];
  const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
  function brief(data) {
    return [
      'PLACURSO — BRIEFING DE CAMPANHA',
      'Produto/curso: ' + (data.product || 'A definir'),
      'Objectivo: ' + data.objective,
      'Público: ' + (data.audience || 'A definir'),
      'Oferta: ' + (data.offer || 'A definir'),
      'Orçamento máximo diário: ' + (data.budget ? data.budget + ' AOA/dia' : 'A definir'),
      'Canais: ' + data.channels,
      'Chamada para acção: ' + data.cta,
      '', 'REGRAS DE EXECUÇÃO',
      '- Medir visitas, contactos, inscrições, compras e custo por resultado.',
      '- Não publicar nem gastar orçamento sem aprovação do CEO.',
      '- Usar apenas contas autorizadas e credenciais guardadas no servidor.',
      '- Não afirmar resultados ou benefícios que o produto não entrega.'
    ].join('\n');
  }
  function render(container) {
    if (!container) return;
    const rootPanel = el('div'); rootPanel.id = 'pc-growth';
    const style = el('style'); style.textContent = '#pc-growth{color:var(--giz-light,#edf3fb)}#pc-growth .pg-head{padding:16px;border:1px solid rgba(77,150,190,.28);border-radius:14px;background:linear-gradient(135deg,#142847,#204b5c);margin-bottom:14px}#pc-growth h3,#pc-growth h4{margin:0 0 7px}#pc-growth p{line-height:1.5}#pc-growth .pg-muted{font-size:12px;color:var(--linho-dim,#9eabbc)}#pc-growth .pg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px}#pc-growth .pg-card{padding:12px;border:1px solid var(--line,rgba(255,255,255,.15));border-radius:12px;background:var(--carvao-2,#17243a);min-width:0}#pc-growth .pg-section{margin:14px 0}#pc-growth .pg-state{display:inline-block;margin:8px 0;color:#d8b96e;font-size:11px}#pc-growth a,#pc-growth button{cursor:pointer}#pc-growth .pg-btn{display:inline-flex;padding:9px 11px;border:1px solid rgba(255,255,255,.2);border-radius:9px;background:transparent;color:inherit;text-decoration:none;font-size:12px;font-weight:650}#pc-growth .pg-primary{background:#1b8a83;border-color:#1b8a83;color:white}#pc-growth .pg-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}#pc-growth .pg-kpi{padding:10px;border:1px solid var(--line,rgba(255,255,255,.15));border-radius:10px;background:var(--carvao-2,#17243a)}#pc-growth .pg-kpi b{display:block;font-size:17px}#pc-growth .pg-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#pc-growth label{display:block;font-size:11px;color:var(--linho-dim,#9eabbc)}#pc-growth input,#pc-growth select,#pc-growth textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--line,rgba(255,255,255,.16));border-radius:8px;background:var(--carvao,#101b2e);color:var(--giz-light,#edf3fb)}#pc-growth .pg-full{grid-column:1/-1}#pc-growth .pg-note{padding:10px;border-left:3px solid #c9a24a;background:rgba(201,162,74,.08);font-size:12px;line-height:1.5}#pc-growth #pg-brief{white-space:pre-wrap;padding:11px;border:1px dashed #1b8a83;border-radius:9px;margin-top:10px}@media(max-width:480px){#pc-growth .pg-kpis{grid-template-columns:1fr 1fr}#pc-growth .pg-form{grid-template-columns:1fr}#pc-growth .pg-full{grid-column:auto}}';
    rootPanel.appendChild(style);
    const head = el('section'); head.className = 'pg-head'; head.appendChild(el('h3', 'Central de Crescimento — Placurso')); head.appendChild(el('p', 'Um só centro para atrair visitantes, transformar interesse em inscrições e vender cursos e infoprodutos. O ANNAN continua a ser o motor central.')); head.appendChild(el('p', 'ANNAN  →  Gateway  →  Redes  →  Métricas  →  Optimização', 'pg-muted')); rootPanel.appendChild(head);
    const funnel = el('section'); funnel.className = 'pg-section'; funnel.appendChild(el('h4', 'Funil comercial')); const kpis = el('div'); kpis.className = 'pg-kpis'; [['Visitas'],['Leads / contactos'],['Inscrições / vendas'],['Receita atribuída']].forEach(item => { const box = el('div'); box.className='pg-kpi'; box.appendChild(el('b','—')); box.appendChild(el('span',item[0],'pg-muted')); kpis.appendChild(box); }); funnel.appendChild(kpis); funnel.appendChild(el('p','As métricas só surgirão depois da activação do rastreio e da ligação real das plataformas. Não há números simulados.','pg-muted')); rootPanel.appendChild(funnel);
    const accounts = el('section'); accounts.className='pg-section'; accounts.appendChild(el('h4','Contas e canais para ligar')); const grid = el('div'); grid.className='pg-grid'; channels.forEach(channel => { const card=el('article');card.className='pg-card';card.appendChild(el('h4',channel.name));card.appendChild(el('p',channel.detail,'pg-muted'));card.appendChild(el('span','● Ainda não ligado','pg-state'));card.appendChild(el('p','Necessário: '+channel.needs,'pg-muted'));const link=el('a','Abrir portal de programadores ↗','pg-btn');link.href=channel.url;link.target='_blank';link.rel='noopener noreferrer';card.appendChild(link);grid.appendChild(card);});accounts.appendChild(grid);rootPanel.appendChild(accounts);
    const campaign=el('section');campaign.className='pg-section pg-card';campaign.appendChild(el('h4','Preparar campanha'));campaign.appendChild(el('p','Gera um briefing que o ANNAN pode usar para organizar a estratégia. Este planeador não publica anúncios nem consome orçamento.','pg-muted'));
    const form=el('form');form.className='pg-form';const fields=[['product','Curso ou infoproduto','text','Ex.: Curso de contabilidade prática'],['audience','Público-alvo','text','Jovens à procura do primeiro emprego em Angola'],['budget','Limite diário (AOA)','number','3000'],['channels','Canais pretendidos','text','Facebook, Instagram, TikTok, YouTube'],['cta','Chamada para acção','text','Conhecer o curso no Placurso'],['offer','Resultado / oferta concreta','textarea','Que problema resolve e o que a pessoa recebe?']];const inputs={};fields.forEach(([id,label,type,placeholder])=>{const wrap=el('div');if(id==='offer')wrap.className='pg-full';const lab=el('label',label);lab.htmlFor='pg-'+id;wrap.appendChild(lab);const input=type==='textarea'?el('textarea'):el('input');input.id='pg-'+id;input.placeholder=placeholder;if(type!=='textarea')input.type=type;if(id==='budget')input.min='0';inputs[id]=input;wrap.appendChild(input);form.appendChild(wrap);});const objectiveWrap=el('div');objectiveWrap.className='pg-full';objectiveWrap.appendChild(el('label','Objectivo principal'));const objective=el('select');['Reconhecimento da marca','Tráfego para o Placurso','Gerar contactos / leads','Inscrições e vendas'].forEach(v=>{const op=el('option',v);op.value=v;objective.appendChild(op);});objectiveWrap.appendChild(objective);form.appendChild(objectiveWrap);const submit=el('button','Gerar briefing da campanha','pg-btn pg-primary');submit.type='submit';const submitWrap=el('div');submitWrap.className='pg-full';submitWrap.appendChild(submit);form.appendChild(submitWrap);campaign.appendChild(form);const output=el('pre');output.id='pg-brief';output.hidden=true;campaign.appendChild(output);const actions=el('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';const copy=el('button','Copiar briefing','pg-btn');copy.type='button';const download=el('button','Guardar briefing .txt','pg-btn');download.type='button';actions.append(copy,download);actions.hidden=true;campaign.appendChild(actions);let last='';form.addEventListener('submit',event=>{event.preventDefault();last=brief({product:inputs.product.value,objective:objective.value,audience:inputs.audience.value,budget:inputs.budget.value,channels:inputs.channels.value,cta:inputs.cta.value,offer:inputs.offer.value});output.textContent=last;output.hidden=false;actions.hidden=false;});copy.addEventListener('click',async()=>{if(!last)return;try{await navigator.clipboard.writeText(last);if(typeof root.showToast==='function')root.showToast('Briefing copiado.');}catch(_){root.prompt('Copie o briefing:',last);}});download.addEventListener('click',()=>{if(!last)return;const url=URL.createObjectURL(new Blob([last],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='placurso-briefing-campanha.txt';a.click();URL.revokeObjectURL(url);});rootPanel.appendChild(campaign);

    const management=el('section');management.className='pg-section pg-card';
    management.appendChild(el('h4','Gestão ANNAN — campanhas e conteúdos'));
    management.appendChild(el('p','Cria campanhas e rascunhos, envia conteúdos para aprovação e acompanha decisões. Esta fase ainda não publica nas redes nem executa anúncios.','pg-muted'));
    const accessStatus=el('p','A validar a sessão e a autorização de gestão...','pg-muted');management.appendChild(accessStatus);
    const campaignForm=el('form');campaignForm.className='pg-form';
    const campaignFields={};
    function addControl(form,label,id,type,placeholder,full){
      const wrap=el('div');if(full)wrap.className='pg-full';
      const lab=el('label',label);lab.htmlFor='pgm-'+id;wrap.appendChild(lab);
      let control;
      if(type==='select'){control=el('select');}
      else if(type==='textarea'){control=el('textarea');}
      else{control=el('input');control.type=type;}
      control.id='pgm-'+id;control.name=id;if(placeholder)control.placeholder=placeholder;
      if(type==='number'){control.min='0';control.value='0';}
      wrap.appendChild(control);form.appendChild(wrap);campaignFields[id]=control;return control;
    }
    addControl(campaignForm,'Nome da campanha','name','text','Ex.: Matrículas de contabilidade',true).required=true;
    const objectiveField=addControl(campaignForm,'Objectivo','objective','select','',false);
    [['awareness','Reconhecimento'],['traffic','Tráfego'],['leads','Contactos / leads'],['enrollments','Inscrições'],['sales','Vendas']].forEach(([value,label])=>{const op=el('option',label);op.value=value;objectiveField.appendChild(op);});
    addControl(campaignForm,'Público-alvo','audience','text','Quem queremos alcançar?',true);
    addControl(campaignForm,'Oferta / problema resolvido','offer','textarea','O que o curso resolve e o que entrega?',true);
    addControl(campaignForm,'Limite diário (AOA)','budgetLimit','number','0',false);
    const campaignSubmit=el('button','Criar campanha em rascunho','pg-btn pg-primary');campaignSubmit.type='submit';const campaignSubmitWrap=el('div');campaignSubmitWrap.className='pg-full';campaignSubmitWrap.appendChild(campaignSubmit);campaignForm.appendChild(campaignSubmitWrap);
    management.appendChild(el('h4','Nova campanha'));management.appendChild(campaignForm);

    const contentForm=el('form');contentForm.className='pg-form';
    const contentCampaign=addControl(contentForm,'Associar campanha','campaignId','select','',false);
    const platformField=addControl(contentForm,'Plataforma','platform','select','',false);
    channels.forEach(channel=>{const op=el('option',channel.name);op.value=channel.id;platformField.appendChild(op);});
    const formatField=addControl(contentForm,'Formato','format','select','',false);
    [['text','Texto'],['image','Imagem'],['video','Vídeo'],['reel','Reel'],['carousel','Carrossel'],['story','Story'],['short','Short']].forEach(([value,label])=>{const op=el('option',label);op.value=value;formatField.appendChild(op);});
    addControl(contentForm,'Texto / legenda','body','textarea','Escreve o conteúdo original para esta plataforma...',true).required=true;
    const contentSubmit=el('button','Guardar rascunho de conteúdo','pg-btn pg-primary');contentSubmit.type='submit';const contentSubmitWrap=el('div');contentSubmitWrap.className='pg-full';contentSubmitWrap.appendChild(contentSubmit);contentForm.appendChild(contentSubmitWrap);
    management.appendChild(el('h4','Novo conteúdo'));management.appendChild(contentForm);

    const dataBoard=el('div');dataBoard.className='pg-section';
    const campaignBoard=el('div');campaignBoard.className='pg-grid';
    const contentBoard=el('div');contentBoard.className='pg-grid';
    dataBoard.appendChild(el('h4','Campanhas registadas'));dataBoard.appendChild(campaignBoard);
    dataBoard.appendChild(el('h4','Conteúdos e aprovações'));dataBoard.appendChild(contentBoard);
    management.appendChild(dataBoard);
    let canManage=false;
    function setManagementEnabled(enabled){
      canManage=!!enabled;
      [campaignForm,contentForm].forEach(form=>Array.from(form.elements).forEach(control=>{control.disabled=!canManage;}));
    }
    function setAccessMessage(code){
      const messages={
        ceo_not_configured:'Configuração pendente: a identidade do CEO ainda não foi provisionada no Supabase. As operações permanecem bloqueadas.',
        forbidden:'A sessão não tem o perfil administrativo autorizado para gerir o Crescimento.',
        unauthenticated:'Inicia sessão no Placurso com a conta de gestão para continuar.',
        session_adapter_missing:'O adaptador de sessão do ANNAN não está disponível nesta versão.',
      };
      accessStatus.textContent=messages[code]||'A gestão segura do ANNAN está temporariamente indisponível.';
    }
    function renderCampaignRows(rows){
      campaignBoard.textContent='';
      if(!rows.length){campaignBoard.appendChild(el('p','Ainda não existem campanhas.','pg-muted'));return;}
      rows.forEach(item=>{const card=el('article');card.className='pg-card';card.appendChild(el('h4',item.name));card.appendChild(el('p',item.objective+' · '+item.status,'pg-muted'));card.appendChild(el('p',item.audience||'Público por definir','pg-muted'));const option=el('option',item.name);option.value=item.id;contentCampaign.appendChild(option);campaignBoard.appendChild(card);});
    }
    function renderContentRows(rows){
      contentBoard.textContent='';
      if(!rows.length){contentBoard.appendChild(el('p','Ainda não existem rascunhos.','pg-muted'));return;}
      rows.forEach(item=>{
        const card=el('article');card.className='pg-card';
        card.appendChild(el('h4',item.platform+' · '+item.format));
        card.appendChild(el('p',item.status+' · versão '+item.version,'pg-muted'));
        card.appendChild(el('p',(item.body||'').slice(0,180),'pg-muted'));
        if(item.status==='draft'){
          const submit=el('button','Enviar para aprovação','pg-btn pg-primary');submit.type='button';
          submit.addEventListener('click',async()=>{submit.disabled=true;const result=await root.PlacursoGrowthClient.submitContent(item.id);if(!result.ok){setAccessMessage(result.error&&result.error.code);submit.disabled=false;return;}await refreshManagement();});
          card.appendChild(submit);
        }
        if(item.status==='pending_approval'){
          const approve=el('button','Aprovar','pg-btn pg-primary');approve.type='button';
          const reject=el('button','Rejeitar','pg-btn');reject.type='button';
          const decide=async decision=>{approve.disabled=true;reject.disabled=true;const result=await root.PlacursoGrowthClient.decideApproval({contentId:item.id,version:item.version,contentHash:item.content_hash,decision:decision,reason:''});if(!result.ok){setAccessMessage(result.error&&result.error.code);approve.disabled=false;reject.disabled=false;return;}await refreshManagement();};
          approve.addEventListener('click',()=>decide('approved'));reject.addEventListener('click',()=>decide('rejected'));card.append(approve,reject);
        }
        contentBoard.appendChild(card);
      });
    }
    async function refreshManagement(){
      if(!root.PlacursoGrowthClient){setManagementEnabled(false);setAccessMessage('session_adapter_missing');return;}
      const campaigns=await root.PlacursoGrowthClient.listCampaigns();
      if(!campaigns.ok){setManagementEnabled(false);setAccessMessage(campaigns.error&&campaigns.error.code);return;}
      const contents=await root.PlacursoGrowthClient.listContents();
      const accounts=await root.PlacursoGrowthClient.listAccounts();
      if(!contents.ok||!accounts.ok){setManagementEnabled(false);setAccessMessage((contents.error||accounts.error||{}).code);return;}
      setManagementEnabled(true);
      accessStatus.textContent='Gestão autorizada. Contas ligadas: '+accounts.data.length+'. Nenhuma publicação externa é executada nesta fase.';
      contentCampaign.textContent='';const none=el('option','Sem campanha associada');none.value='';contentCampaign.appendChild(none);
      renderCampaignRows(campaigns.data);renderContentRows(contents.data);
    }
    campaignForm.addEventListener('submit',async event=>{
      event.preventDefault();if(!canManage)return;campaignSubmit.disabled=true;
      const result=await root.PlacursoGrowthClient.createCampaign({name:campaignFields.name.value,objective:objectiveField.value,audience:campaignFields.audience.value,offer:campaignFields.offer.value,budgetLimit:Number(campaignFields.budgetLimit.value||0),currency:'AOA'});
      campaignSubmit.disabled=false;
      if(!result.ok){setAccessMessage(result.error&&result.error.code);return;}
      campaignForm.reset();campaignFields.budgetLimit.value='0';await refreshManagement();
    });
    contentForm.addEventListener('submit',async event=>{
      event.preventDefault();if(!canManage)return;contentSubmit.disabled=true;
      const result=await root.PlacursoGrowthClient.createContent({campaignId:contentCampaign.value,platform:platformField.value,format:formatField.value,body:campaignFields.body.value,assetRefs:[]});
      contentSubmit.disabled=false;
      if(!result.ok){setAccessMessage(result.error&&result.error.code);return;}
      campaignFields.body.value='';await refreshManagement();
    });
    setManagementEnabled(false);rootPanel.appendChild(management);

    const integrations=el('section');integrations.className='pg-section pg-note';integrations.appendChild(el('b','APIs, conectores e MCP'));integrations.appendChild(el('p','O gateway será o ponto único para APIs, webhooks e MCP. Chaves privadas ficam no servidor, nunca no navegador.'));integrations.appendChild(el('p','Estado actual: painel e planeador preparados. OAuth, publicações reais e métricas aguardam credenciais e autorização das aplicações oficiais.'));integrations.appendChild(el('p','Controlo do CEO: ligar contas, publicar conteúdos e gastar orçamento só ocorre com autorização válida. Nenhuma conta aparece como ligada antes da confirmação da plataforma.'));rootPanel.appendChild(integrations);
    container.replaceChildren(rootPanel);
  }
  root.renderPlacursoGrowthCenter = render;
  root.PlacursoGrowthCenter = Object.freeze({ buildCampaignBrief: brief, platforms: channels.map(p=>({id:p.id,name:p.name})) });
})(window);
