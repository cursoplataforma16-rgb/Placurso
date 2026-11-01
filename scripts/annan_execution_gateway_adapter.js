/*
 * Phase 9.2 — ANNAN Execution Engine ↔ Integration Gateway adapter
 *
 * Bounded and side-effect free. It coordinates the existing execution engine
 * and gateway contracts but performs no external network/API calls.
 */
(function (global) {
  'use strict';

  function execute(taskId) {
    const Engine = global.PlacursoAnnanExecutionEngine;
    const Gateway = global.PlacursoAnnanIntegrationGateway;
    if (!Engine || !Gateway) return { ok: false, reason: 'runtime_dependency_missing' };

    const task = Engine.get(taskId);
    if (!task) return { ok: false, reason: 'task_not_found' };
    if (!task.integration) return { ok: false, reason: 'missing_integration' };

    const started = Engine.start(task.id);
    if (!started.ok) return { ok: false, reason: started.reason };

    const event = task.event && typeof task.event === 'object'
      ? { ...task.event }
      : { type: task.eventType || 'annan.execution' };

    const dispatched = Gateway.dispatch(task.integration, event);
    if (!dispatched.ok) {
      Engine.fail(task.id, dispatched.reason);
      return { ok: false, reason: dispatched.reason, status: 'failed' };
    }

    const result = {
      integration: dispatched.integration,
      event: dispatched.event,
      payloadKeys: dispatched.payload,
      queued: dispatched.queued === true,
      adapter: 'phase9.2',
    };
    const completed = Engine.complete(task.id, result);
    if (!completed.ok) return { ok: false, reason: completed.reason };

    return {
      ok: true,
      status: completed.task.status,
      integration: dispatched.integration,
      event: dispatched.event,
      taskId: task.id,
    };
  }

  global.PlacursoAnnanExecutionGatewayAdapter = Object.freeze({
    version: '1.0',
    execute,
  });
})(typeof window !== 'undefined' ? window : globalThis);
