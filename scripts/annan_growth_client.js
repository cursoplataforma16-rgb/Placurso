/* PLACURSO_ANNAN_GROWTH_CLIENT_V1 */
(function (root) {
  'use strict';
  if (root.PlacursoGrowthClient) return;

  function requestId() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') return root.crypto.randomUUID();
    return 'growth-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 14);
  }

  function errorResult(code, message) {
    return {
      ok: false,
      error: {
        code: code || 'growth_request_failed',
        message: message || 'Não foi possível concluir a operação de crescimento.',
      },
    };
  }

  async function call(operation, payload, mutating) {
    const persistence = root.PlacursoAnnanPersistence;
    if (!persistence || typeof persistence.getCurrentUser !== 'function' || typeof persistence.getClient !== 'function') {
      return errorResult('session_adapter_missing', 'O serviço de autenticação do ANNAN não está disponível.');
    }

    const session = await persistence.getCurrentUser();
    if (!session || !session.ok || !session.user) {
      return errorResult('unauthenticated', 'Entre na sua conta para aceder à gestão.');
    }

    const gateway = root.PlacursoAnnanIntegrationGateway;
    if (!gateway || typeof gateway.dispatch !== 'function') {
      return errorResult('annan_gateway_unavailable', 'O Gateway central do ANNAN não está disponível.');
    }
    const route = gateway.dispatch('placurso-growth', {
      type: operation,
      source: 'growth-center',
    });
    if (!route || route.ok !== true) {
      return errorResult('growth_gateway_unavailable', 'A capacidade de crescimento não está registada no ANNAN.');
    }

    try {
      const client = await persistence.getClient();
      const body = { operation: operation, payload: payload || {} };
      if (mutating) body.requestId = requestId();
      const response = await client.functions.invoke('annan-growth', { body: body });

      if (response && response.error) {
        let providerError = null;
        const context = response.error.context;
        if (context && typeof context.clone === 'function') {
          try { providerError = await context.clone().json(); } catch (_) { providerError = null; }
        }
        const error = providerError && providerError.error ? providerError.error : {};
        return errorResult(
          error.code || 'growth_service_unavailable',
          error.message || 'A gestão do ANNAN não está disponível neste momento.'
        );
      }

      if (!response || !response.data || response.data.ok !== true) {
        return errorResult('invalid_growth_response', 'O serviço devolveu uma resposta inválida.');
      }
      return { ok: true, data: response.data.data };
    } catch (_) {
      return errorResult('growth_network_error', 'Não foi possível contactar o serviço de crescimento.');
    }
  }

  root.PlacursoGrowthClient = Object.freeze({
    version: 1,
    listAccounts: function () { return call('account.list', {}, false); },
    listCampaigns: function () { return call('campaign.list', {}, false); },
    createCampaign: function (payload) { return call('campaign.create', payload, true); },
    listContents: function () { return call('content.list', {}, false); },
    createContent: function (payload) { return call('content.create', payload, true); },
    submitContent: function (contentId) { return call('content.submit', { contentId: contentId }, true); },
    decideApproval: function (payload) { return call('approval.decide', payload, true); },
    listAudit: function () { return call('audit.list', {}, false); },
  });
})(window);
