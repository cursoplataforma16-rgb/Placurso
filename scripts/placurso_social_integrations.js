/* PLACURSO_SOCIAL_INTEGRATION_CENTER_V1 */
(function (root) {
  'use strict';
  if (root.PlacursoSocialIntegrations) return;

  const providers = [
    { id: 'facebook', name: 'Facebook Pages', detail: 'Páginas, publicações, comentários e futuras campanhas Meta.', portal: 'https://developers.facebook.com/apps/', requirements: 'Meta App + permissões Pages/Marketing API + revisão quando exigida.' },
    { id: 'instagram', name: 'Instagram', detail: 'Conta profissional ligada ao ecossistema Meta.', portal: 'https://developers.facebook.com/apps/', requirements: 'Conta profissional + Página Meta associada + permissões Instagram Graph API.' },
    { id: 'tiktok', name: 'TikTok', detail: 'Perfil, conteúdos e publicação conforme as permissões aprovadas.', portal: 'https://developers.tiktok.com/', requirements: 'TikTok for Developers + Login Kit + Content Posting API + OAuth aprovado.' },
    { id: 'youtube', name: 'YouTube', detail: 'Canal, vídeos, Shorts e métricas.', portal: 'https://console.cloud.google.com/apis/credentials', requirements: 'Google Cloud Project + YouTube Data API + credenciais OAuth 2.0.' },
    { id: 'whatsapp', name: 'WhatsApp Business', detail: 'Atendimento, leads e comunicação comercial.', portal: 'https://developers.facebook.com/apps/', requirements: 'WhatsApp Business Platform + número elegível + webhook.' },
    { id: 'x', name: 'X', detail: 'Publicações e métricas conforme o nível de API disponível.', portal: 'https://developer.x.com/en/portal/dashboard', requirements: 'Projecto X Developer + credenciais e acesso de API compatível.' }
  ];

  const node = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };

  function accountMap(accounts) {
    const map = {};
    (accounts || []).forEach(account => {
      if (!account || !account.platform) return;
      map[String(account.platform).toLowerCase()] = account;
    });
    return map;
  }

  function stateFor(provider, map) {
    const account = map[provider.id];
    if (!account) return { label: 'Pronto para configurar', cls: 'ready', account: null };
    const state = String(account.connection_state || '').toLowerCase();
    if (state === 'connected' || state === 'active') return { label: 'Ligado', cls: 'connected', account };
    if (state === 'error' || state === 'revoked') return { label: 'Requer atenção', cls: 'attention', account };
    return { label: 'Configuração pendente', cls: 'ready', account };
  }

  async function render(container) {
    if (!container) return;
    const panel = node('section');
    panel.id = 'pc-social-integrations';
    const style = node('style');
    style.textContent = `
      #pc-social-integrations{margin-top:16px;padding:16px;border:1px solid rgba(77,150,190,.28);border-radius:14px;background:#101d31;color:#edf3fb}
      #pc-social-integrations .si-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px}
      #pc-social-integrations h3,#pc-social-integrations h4{margin:0 0 6px}
      #pc-social-integrations p{margin:4px 0;line-height:1.5}
      #pc-social-integrations .si-muted{font-size:12px;color:#a9bad0}
      #pc-social-integrations .si-status{font-size:11px;color:#d8b96e;margin-top:8px}
      #pc-social-integrations .si-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:9px}
      #pc-social-integrations .si-card{padding:13px;border:1px solid #2d4564;border-radius:12px;background:#182944}
      #pc-social-integrations .si-top{display:flex;justify-content:space-between;gap:8px;align-items:center}
      #pc-social-integrations .si-badge{font-size:10px;font-weight:800;border-radius:999px;padding:4px 7px;border:1px solid #52657e}
      #pc-social-integrations .si-badge.connected{color:#75d8c7;border-color:#2d9d90;background:rgba(27,138,131,.12)}
      #pc-social-integrations .si-badge.ready{color:#d8b96e}
      #pc-social-integrations .si-badge.attention{color:#f0a6a6;border-color:#9a4b4b}
      #pc-social-integrations .si-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
      #pc-social-integrations a,#pc-social-integrations button{display:inline-flex;align-items:center;justify-content:center;padding:8px 10px;border-radius:8px;border:1px solid #3c5573;background:transparent;color:#edf3fb;text-decoration:none;font-size:11px;font-weight:700;cursor:pointer}
      #pc-social-integrations .si-primary{background:#1b8a83;border-color:#1b8a83}
      #pc-social-integrations .si-note{margin-top:12px;padding:10px;border-left:3px solid #c9a24a;background:rgba(201,162,74,.08);font-size:11px;line-height:1.55;color:#d7e0eb}
      @media(max-width:480px){#pc-social-integrations{padding:13px}}
    `;
    panel.appendChild(style);

    const head = node('div'); head.className = 'si-head';
    const title = node('div'); title.appendChild(node('h3', 'Centro de Integrações')); title.appendChild(node('p', 'Liga as contas externas ao Placurso para que o ANNAN possa trabalhar com canais autorizados, métricas e conteúdos.', 'si-muted'));
    const refresh = node('button', 'Actualizar estado', 'si-primary');
    head.append(title, refresh); panel.appendChild(head);

    const status = node('div', 'A verificar contas autorizadas…', 'si-status'); panel.appendChild(status);
    const grid = node('div'); grid.className = 'si-grid'; panel.appendChild(grid);
    const note = node('div', 'Segurança: o painel não pede palavras-passe das redes. As ligações reais devem usar OAuth no servidor; tokens e segredos nunca devem ficar no JavaScript do navegador.', 'si-note'); panel.appendChild(note);

    async function load() {
      refresh.disabled = true;
      status.textContent = 'A consultar o estado das integrações…';
      try {
        const result = root.PlacursoGrowthClient && typeof root.PlacursoGrowthClient.listAccounts === 'function'
          ? await root.PlacursoGrowthClient.listAccounts()
          : { ok: false, error: { message: 'Serviço de crescimento indisponível.' } };
        if (!result || result.ok !== true) throw new Error((result && result.error && result.error.message) || 'Não foi possível consultar as contas.');
        const map = accountMap(result.data && result.data.accounts ? result.data.accounts : result.data);
        grid.textContent = '';
        providers.forEach(provider => {
          const state = stateFor(provider, map);
          const card = node('article'); card.className = 'si-card';
          const top = node('div'); top.className = 'si-top'; top.appendChild(node('h4', provider.name)); top.appendChild(node('span', state.label, 'si-badge ' + state.cls)); card.appendChild(top);
          card.appendChild(node('p', provider.detail, 'si-muted'));
          if (state.account && state.account.display_name) card.appendChild(node('p', 'Conta: ' + state.account.display_name, 'si-muted'));
          card.appendChild(node('p', 'Necessário: ' + provider.requirements, 'si-muted'));
          const actions = node('div'); actions.className = 'si-actions';
          const portal = node('a', state.cls === 'connected' ? 'Abrir portal ↗' : 'Configurar no portal ↗'); portal.href = provider.portal; portal.target = '_blank'; portal.rel = 'noopener noreferrer';
          actions.appendChild(portal);
          if (state.cls === 'connected') {
            const check = node('button', 'Verificar ligação');
            check.addEventListener('click', () => { status.textContent = provider.name + ': ligação registada; a validação de API será feita pelo conector OAuth do servidor.'; });
            actions.appendChild(check);
          }
          card.appendChild(actions); grid.appendChild(card);
        });
        const connected = providers.filter(p => stateFor(p, map).cls === 'connected').length;
        status.textContent = connected + ' de ' + providers.length + ' integrações registadas como ligadas.';
      } catch (error) {
        grid.textContent = '';
        status.textContent = error && error.message ? error.message : 'Não foi possível carregar as integrações.';
      } finally { refresh.disabled = false; }
    }

    refresh.addEventListener('click', load);
    container.appendChild(panel);
    await load();
  }

  root.PlacursoSocialIntegrations = Object.freeze({ version: 1, render });
})(window);
