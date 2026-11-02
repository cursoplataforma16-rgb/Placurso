/* PLACURSO_SOCIAL_INTEGRATION_CENTER_V2 */
(function (root) {
  'use strict';
  if (root.PlacursoSocialIntegrations) return;

  const PROVIDERS = [
    {
      id: 'facebook',
      title: 'Facebook Pages',
      description: 'Autoriza as Páginas que o Placurso poderá gerir através da API oficial da Meta.',
      group: 'meta',
      action: 'meta',
    },
    {
      id: 'instagram',
      title: 'Instagram profissional',
      description: 'É detectado automaticamente quando está associado a uma Página Meta elegível.',
      group: 'meta',
      action: 'meta',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Liga a conta empresarial e o número através do Embedded Signup v4 da Meta.',
      group: 'whatsapp',
      action: 'whatsapp',
    },
    {
      id: 'youtube',
      title: 'YouTube',
      description: 'Autoriza o canal com Google OAuth de servidor e acesso offline.',
      group: 'youtube',
      action: 'youtube',
    },
  ];

  const el = (tag, text, className) => {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  };

  function accountsFor(accounts, platform) {
    return (Array.isArray(accounts) ? accounts : []).filter((account) =>
      account && String(account.platform || '').toLowerCase() === platform
    );
  }

  function stateFor(accounts, platform) {
    const items = accountsFor(accounts, platform);
    if (items.some((item) => ['connected', 'active'].includes(String(item.connection_state || '').toLowerCase()))) {
      return { label: 'Ligado', kind: 'connected', items };
    }
    if (items.some((item) => ['error', 'revoked'].includes(String(item.connection_state || '').toLowerCase()))) {
      return { label: 'Requer atenção', kind: 'attention', items };
    }
    if (items.length) return { label: 'Configuração pendente', kind: 'pending', items };
    return { label: 'Ainda não ligado', kind: 'off', items: [] };
  }

  function safeAccountName(account) {
    return String(account.display_name || account.external_account_id || 'Conta social').slice(0, 150);
  }

  function button(label, variant, onClick) {
    const item = el('button', label, 'si-button ' + (variant || ''));
    item.type = 'button';
    item.addEventListener('click', onClick);
    return item;
  }

  async function ensureFacebookSdk(appId, graphVersion) {
    if (root.FB && typeof root.FB.login === 'function') {
      root.FB.init({ appId, cookie: true, xfbml: false, version: graphVersion });
      return root.FB;
    }

    return await new Promise((resolve, reject) => {
      let settled = false;
      const previous = root.fbAsyncInit;
      const timeout = setTimeout(() => finish(new Error('O SDK da Meta não respondeu. Verifica a ligação à Internet e o domínio autorizado.')), 20000);
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve(root.FB);
      };

      root.fbAsyncInit = function () {
        try {
          if (typeof previous === 'function') previous();
          if (!root.FB || typeof root.FB.init !== 'function') throw new Error('SDK da Meta indisponível.');
          root.FB.init({ appId, cookie: true, xfbml: false, version: graphVersion });
          finish();
        } catch (error) {
          finish(error);
        }
      };

      let script = document.querySelector('script[data-placurso-meta-sdk="true"]');
      if (!script) {
        script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.dataset.placursoMetaSdk = 'true';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.onerror = () => finish(new Error('Não foi possível carregar o SDK da Meta.'));
        document.head.appendChild(script);
      }
    });
  }

  async function runWhatsAppEmbeddedSignup(configuration) {
    const fb = await ensureFacebookSdk(configuration.appId, configuration.graphVersion || 'v26.0');
    return await new Promise((resolve, reject) => {
      let code = '';
      let assets = null;
      let settled = false;

      const cleanup = () => {
        clearTimeout(timeout);
        root.removeEventListener('message', onMessage);
      };
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) reject(error);
        else resolve(value);
      };
      const tryComplete = () => {
        if (!code || !assets || settled) return;
        finish(null, {
          code,
          state: configuration.state,
          wabaId: assets.waba_id,
          phoneNumberId: assets.phone_number_id,
        });
      };
      const onMessage = (event) => {
        let hostname = '';
        try { hostname = new URL(event.origin).hostname.toLowerCase(); } catch (_) { return; }
        if (!(hostname === 'facebook.com' || hostname.endsWith('.facebook.com'))) return;
        let payload;
        try {
          payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (_) {
          return;
        }
        if (!payload || payload.type !== 'WA_EMBEDDED_SIGNUP') return;
        if (payload.event === 'FINISH') {
          const data = payload.data || {};
          if (typeof data.waba_id !== 'string' || typeof data.phone_number_id !== 'string') {
            finish(new Error('A Meta não devolveu os identificadores da conta e do número.'));
            return;
          }
          assets = { waba_id: data.waba_id, phone_number_id: data.phone_number_id };
          tryComplete();
        } else if (payload.event === 'CANCEL') {
          finish(new Error('A ligação do WhatsApp foi cancelada.'));
        } else if (payload.event === 'ERROR') {
          finish(new Error('A Meta comunicou um erro durante a configuração do WhatsApp.'));
        }
      };
      const timeout = setTimeout(() => finish(new Error('A configuração do WhatsApp expirou. Inicia novamente.')), 120000);
      root.addEventListener('message', onMessage);

      try {
        fb.login((response) => {
          const authResponse = response && response.authResponse ? response.authResponse : {};
          if (typeof authResponse.code !== 'string' || !authResponse.code) {
            finish(new Error('A Meta não devolveu o código de autorização. Confirma as permissões da aplicação.'));
            return;
          }
          code = authResponse.code;
          tryComplete();
        }, {
          config_id: configuration.configId,
          auth_type: 'rerequest',
          response_type: 'code',
          override_default_response_type: true,
        });
      } catch (error) {
        finish(error instanceof Error ? error : new Error('Não foi possível abrir o Embedded Signup da Meta.'));
      }
    });
  }

  async function render(container) {
    if (!container) return;
    const panel = el('section');
    panel.id = 'pc-social-integrations';
    const style = el('style');
    style.textContent = `
      #pc-social-integrations{margin-top:16px;padding:16px;border:1px solid rgba(77,150,190,.28);border-radius:14px;background:#101d31;color:#edf3fb}
      #pc-social-integrations .si-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px}
      #pc-social-integrations h3,#pc-social-integrations h4{margin:0 0 6px}
      #pc-social-integrations p{margin:4px 0;line-height:1.5}
      #pc-social-integrations .si-muted{font-size:12px;color:#a9bad0}
      #pc-social-integrations .si-status{font-size:12px;color:#d8b96e;margin-top:10px;min-height:19px}
      #pc-social-integrations .si-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:9px}
      #pc-social-integrations .si-card{padding:13px;border:1px solid #2d4564;border-radius:12px;background:#182944;min-width:0}
      #pc-social-integrations .si-top{display:flex;justify-content:space-between;gap:8px;align-items:center}
      #pc-social-integrations .si-badge{font-size:10px;font-weight:800;border-radius:999px;padding:4px 7px;border:1px solid #52657e;white-space:nowrap}
      #pc-social-integrations .si-badge.connected{color:#75d8c7;border-color:#2d9d90;background:rgba(27,138,131,.12)}
      #pc-social-integrations .si-badge.off,#pc-social-integrations .si-badge.pending{color:#d8b96e}
      #pc-social-integrations .si-badge.attention{color:#f0a6a6;border-color:#9a4b4b}
      #pc-social-integrations .si-button{display:inline-flex;align-items:center;justify-content:center;padding:9px 11px;border-radius:8px;border:1px solid #3c5573;background:transparent;color:#edf3fb;text-decoration:none;font-size:11px;font-weight:750;cursor:pointer}
      #pc-social-integrations .si-button.primary{background:#1b8a83;border-color:#1b8a83}
      #pc-social-integrations .si-button.danger{color:#f0a6a6;border-color:#8c4c58}
      #pc-social-integrations .si-button:disabled{opacity:.55;cursor:wait}
      #pc-social-integrations .si-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
      #pc-social-integrations .si-accounts{display:grid;gap:7px;margin-top:9px}
      #pc-social-integrations .si-account{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px;border-radius:8px;background:#102139;font-size:11px}
      #pc-social-integrations .si-account span{overflow-wrap:anywhere}
      #pc-social-integrations .si-note{margin-top:12px;padding:10px;border-left:3px solid #c9a24a;background:rgba(201,162,74,.08);font-size:11px;line-height:1.55;color:#d7e0eb}
      @media(max-width:480px){#pc-social-integrations{padding:13px}#pc-social-integrations .si-account{align-items:flex-start;flex-direction:column}}
    `;
    panel.appendChild(style);

    const head = el('div');
    head.className = 'si-head';
    const title = el('div');
    title.appendChild(el('h3', 'Centro de Integrações'));
    title.appendChild(el('p', 'Liga os canais oficiais ao Placurso. O ANNAN só recebe o estado das autorizações; as credenciais permanecem no servidor.', 'si-muted'));
    const refresh = button('Actualizar estado', 'primary', load);
    head.append(title, refresh);
    panel.appendChild(head);

    const status = el('div', 'A consultar as contas autorizadas…', 'si-status');
    panel.appendChild(status);
    const grid = el('div');
    grid.className = 'si-grid';
    panel.appendChild(grid);
    panel.appendChild(el('div', 'Segurança: a ligação usa autorização oficial. Não introduzas palavras-passe, App Secrets ou tokens no painel. As publicações e mensagens ficam desactivadas nesta fase.', 'si-note'));
    container.replaceChildren(panel);

    function setStatus(message, error) {
      status.textContent = message;
      status.style.color = error ? '#f0a6a6' : '#d8b96e';
    }

    async function connectMeta() {
      setStatus('A preparar a autorização Meta…');
      const result = await root.PlacursoGrowthClient.startSocialOAuth('meta');
      if (!result || result.ok !== true || !result.data || !result.data.authorizationUrl) {
        setStatus(result && result.error ? result.error.message : 'Não foi possível iniciar a autorização Meta.', true);
        return;
      }
      root.location.assign(result.data.authorizationUrl);
    }

    async function connectYouTube() {
      setStatus('A preparar a autorização Google para YouTube…');
      const result = await root.PlacursoGrowthClient.startSocialOAuth('youtube');
      if (!result || result.ok !== true || !result.data || !result.data.authorizationUrl) {
        setStatus(result && result.error ? result.error.message : 'Não foi possível iniciar a autorização YouTube.', true);
        return;
      }
      root.location.assign(result.data.authorizationUrl);
    }

    async function connectWhatsApp() {
      setStatus('A preparar o Embedded Signup v4 da Meta…');
      const started = await root.PlacursoGrowthClient.startWhatsAppSignup();
      if (!started || started.ok !== true || !started.data) {
        setStatus(started && started.error ? started.error.message : 'Não foi possível iniciar o WhatsApp Business.', true);
        return;
      }
      try {
        const signup = await runWhatsAppEmbeddedSignup(started.data);
        setStatus('A validar a conta e o número do WhatsApp no servidor…');
        const completed = await root.PlacursoGrowthClient.completeWhatsAppSignup(signup);
        if (!completed || completed.ok !== true) {
          setStatus(completed && completed.error ? completed.error.message : 'Não foi possível validar a conta WhatsApp.', true);
          return;
        }
        setStatus('WhatsApp Business ligado e validado.');
        await load();
      } catch (error) {
        setStatus(error && error.message ? error.message : 'A configuração do WhatsApp foi interrompida.', true);
      }
    }

    async function disconnect(account) {
      const name = safeAccountName(account);
      if (!root.confirm('Desligar "' + name + '" do Placurso? O token cifrado será removido do servidor.')) return;
      const result = await root.PlacursoGrowthClient.disconnectSocialAccount(account.id);
      if (!result || result.ok !== true) {
        setStatus(result && result.error ? result.error.message : 'Não foi possível desligar a conta.', true);
        return;
      }
      setStatus('Conta desligada do Placurso. A autorização local foi removida.');
      await load();
    }

    function renderCard(provider, accounts) {
      const state = stateFor(accounts, provider.id);
      const card = el('article');
      card.className = 'si-card';
      const top = el('div');
      top.className = 'si-top';
      top.appendChild(el('h4', provider.title));
      top.appendChild(el('span', state.label, 'si-badge ' + state.kind));
      card.appendChild(top);
      card.appendChild(el('p', provider.description, 'si-muted'));

      if (state.items.length) {
        const accountList = el('div');
        accountList.className = 'si-accounts';
        state.items.forEach((account) => {
          const row = el('div');
          row.className = 'si-account';
          row.appendChild(el('span', safeAccountName(account) + ' · ' + String(account.connection_state || 'pendente')));
          if (account.id) row.appendChild(button('Desligar', 'danger', () => disconnect(account)));
          accountList.appendChild(row);
        });
        card.appendChild(accountList);
      }

      const actions = el('div');
      actions.className = 'si-actions';
      if (provider.action === 'meta') actions.appendChild(button(state.items.length ? 'Ligar outra conta Meta' : 'Ligar com Meta', 'primary', connectMeta));
      if (provider.action === 'youtube') actions.appendChild(button(state.items.length ? 'Reconectar YouTube' : 'Ligar YouTube', 'primary', connectYouTube));
      if (provider.action === 'whatsapp') actions.appendChild(button(state.items.length ? 'Ligar outro número' : 'Ligar WhatsApp Business', 'primary', connectWhatsApp));
      card.appendChild(actions);
      return card;
    }

    async function load() {
      if (!root.PlacursoGrowthClient || typeof root.PlacursoGrowthClient.listAccounts !== 'function') {
        setStatus('O cliente de integrações do ANNAN não está disponível.', true);
        return;
      }
      refresh.disabled = true;
      setStatus('A consultar o estado das contas…');
      try {
        const result = await root.PlacursoGrowthClient.listAccounts();
        if (!result || result.ok !== true) {
          throw new Error(result && result.error ? result.error.message : 'Não foi possível consultar as contas.');
        }
        const accounts = Array.isArray(result.data) ? result.data : [];
        grid.replaceChildren();
        PROVIDERS.forEach((provider) => grid.appendChild(renderCard(provider, accounts)));
        const connected = PROVIDERS.reduce((total, provider) => total + accountsFor(accounts, provider.id)
          .filter((item) => ['connected', 'active'].includes(String(item.connection_state || '').toLowerCase())).length, 0);
        setStatus(connected + ' conta(s) autorizada(s) registada(s) no Placurso. A publicação continua desactivada.');
      } catch (error) {
        grid.replaceChildren();
        setStatus(error && error.message ? error.message : 'Não foi possível carregar as integrações.', true);
      } finally {
        refresh.disabled = false;
      }
    }

    const params = new URLSearchParams(root.location.search);
    const callbackState = params.get('social');
    if (callbackState === 'connected') {
      const provider = params.get('provider') || 'social';
      setStatus('Autorização ' + provider + ' concluída. A confirmar as contas no servidor…');
      params.delete('social');
      params.delete('provider');
      params.delete('reason');
      const next = root.location.pathname + (params.toString() ? '?' + params.toString() : '') + root.location.hash;
      root.history.replaceState({}, '', next);
    } else if (callbackState === 'error') {
      setStatus('A autorização ' + (params.get('provider') || 'social') + ' não foi concluída. Reinicia a ligação e confirma as permissões na aplicação.', true);
      params.delete('social');
      params.delete('provider');
      params.delete('reason');
      const next = root.location.pathname + (params.toString() ? '?' + params.toString() : '') + root.location.hash;
      root.history.replaceState({}, '', next);
    }
    await load();
  }

  root.PlacursoSocialIntegrations = Object.freeze({ version: 2, render });
})(window);
