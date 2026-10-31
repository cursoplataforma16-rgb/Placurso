/*
 * Phase 8 — ANNAN Integration Gateway
 *
 * This module is deliberately side-effect free. It provides a stable boundary
 * for future APIs, webhooks, analytics, payments, MCP and channel adapters.
 * It is a capability of the existing ANNAN runtime, not another ANNAN.
 */
(function (global) {
  'use strict';

  const MAX_INTEGRATIONS = 32;
  const MAX_PAYLOAD_KEYS = 40;
  const integrations = new Map();

  function cleanName(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 80);
  }

  function validateIntegration(definition) {
    if (!definition || typeof definition !== 'object') return { ok: false, reason: 'invalid_definition' };
    const name = cleanName(definition.name);
    if (!name) return { ok: false, reason: 'missing_name' };
    if (definition.kind && !['api', 'webhook', 'analytics', 'payment', 'channel', 'mcp', 'automation'].includes(definition.kind)) {
      return { ok: false, reason: 'unsupported_kind' };
    }
    return { ok: true, name };
  }

  function noSecrets(value) {
    if (typeof value === 'string') {
      return !/(secret|api[_-]?key|access[_-]?token|private[_-]?key|service[_-]?role)/i.test(value);
    }
    if (!value || typeof value !== 'object') return true;
    return Object.keys(value).slice(0, MAX_PAYLOAD_KEYS).every((key) => noSecrets(key) && noSecrets(value[key]));
  }

  function register(definition) {
    const check = validateIntegration(definition);
    if (!check.ok) return check;
    if (integrations.size >= MAX_INTEGRATIONS && !integrations.has(check.name)) {
      return { ok: false, reason: 'integration_limit' };
    }
    if (!noSecrets(definition)) return { ok: false, reason: 'secret_like_value_rejected' };
    integrations.set(check.name, Object.freeze({
      name: check.name,
      kind: definition.kind || 'api',
      version: String(definition.version || '1'),
      enabled: definition.enabled !== false,
    }));
    return { ok: true, name: check.name };
  }

  function list() {
    return Array.from(integrations.values()).map((item) => ({ ...item }));
  }

  function dispatch(name, event) {
    const normalized = cleanName(name);
    const integration = integrations.get(normalized);
    if (!integration || !integration.enabled) return { ok: false, reason: 'integration_unavailable' };
    if (!event || typeof event !== 'object' || !noSecrets(event)) {
      return { ok: false, reason: 'unsafe_event' };
    }
    return {
      ok: true,
      queued: false,
      integration: normalized,
      event: String(event.type || 'unknown').slice(0, 80),
      payload: Object.keys(event).slice(0, MAX_PAYLOAD_KEYS),
    };
  }

  const gateway = Object.freeze({
    version: '1.0',
    register,
    dispatch,
    list,
    validateIntegration,
    noSecrets,
  });

  global.PlacursoAnnanIntegrationGateway = gateway;
})(typeof window !== 'undefined' ? window : globalThis);
