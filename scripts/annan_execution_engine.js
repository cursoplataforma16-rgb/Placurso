/*
 * Phase 9 — ANNAN Execution Engine
 *
 * Bounded, deterministic and side-effect free. This is a capability of the
 * existing ANNAN runtime. External work is intentionally deferred to the
 * Phase 8 Integration Gateway.
 */
(function (global) {
  'use strict';

  const MAX_HISTORY = 120;
  const tasks = new Map();
  const priorities = ['low', 'normal', 'high', 'critical'];

  function cleanId(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
  }

  function hasUnsafeText(value) {
    return typeof value === 'string' && /(secret|api[_-]?key|access[_-]?token|private[_-]?key|service[_-]?role)/i.test(value);
  }

  function safeValue(value, depth) {
    if (depth > 3 || hasUnsafeText(value)) return false;
    if (!value || typeof value !== 'object') return true;
    return Object.keys(value).slice(0, 40).every((key) => !hasUnsafeText(key) && safeValue(value[key], depth + 1));
  }

  function validate(input) {
    if (!input || typeof input !== 'object') return { ok: false, reason: 'invalid_task' };
    const id = cleanId(input.id);
    if (!id) return { ok: false, reason: 'missing_id' };
    if (!String(input.objective || '').trim()) return { ok: false, reason: 'invalid_objective' };
    if (!safeValue(input, 0)) return { ok: false, reason: 'unsafe_task' };
    if (input.priority && !priorities.includes(input.priority)) return { ok: false, reason: 'invalid_priority' };
    return { ok: true, id };
  }

  function trimHistory() {
    while (tasks.size > MAX_HISTORY) {
      const first = tasks.keys().next().value;
      tasks.delete(first);
    }
  }

  function create(input) {
    const check = validate(input);
    if (!check.ok) return check;
    if (tasks.has(check.id)) return { ok: false, reason: 'duplicate_task' };
    tasks.set(check.id, {
      id: check.id,
      objective: String(input.objective).trim().slice(0, 240),
      priority: input.priority || 'normal',
      sensitive: input.sensitive === true,
      approved: input.sensitive !== true,
      status: 'pending',
      createdAt: Date.now(),
      result: null,
    });
    trimHistory();
    return { ok: true, task: { ...tasks.get(check.id) } };
  }

  function get(id) {
    const task = tasks.get(cleanId(id));
    return task ? { ...task } : null;
  }

  function list() {
    return Array.from(tasks.values()).map((task) => ({ ...task }));
  }

  function approve(id) {
    const task = tasks.get(cleanId(id));
    if (!task) return { ok: false, reason: 'task_not_found' };
    task.approved = true;
    return { ok: true, task: { ...task } };
  }

  function start(id) {
    const task = tasks.get(cleanId(id));
    if (!task) return { ok: false, reason: 'task_not_found' };
    if (task.status !== 'pending') return { ok: false, reason: 'invalid_state' };
    if (!task.approved) return { ok: false, reason: 'approval_required' };
    task.status = 'running';
    task.startedAt = Date.now();
    return { ok: true, task: { ...task } };
  }

  function complete(id, result) {
    const task = tasks.get(cleanId(id));
    if (!task) return { ok: false, reason: 'task_not_found' };
    if (task.status !== 'running') return { ok: false, reason: 'invalid_state' };
    if (!safeValue(result, 0)) return { ok: false, reason: 'unsafe_result' };
    task.status = 'completed';
    task.result = result == null ? null : { ...result };
    task.completedAt = Date.now();
    return { ok: true, task: { ...task } };
  }

  function fail(id, reason) {
    const task = tasks.get(cleanId(id));
    if (!task) return { ok: false, reason: 'task_not_found' };
    if (task.status !== 'running') return { ok: false, reason: 'invalid_state' };
    task.status = 'failed';
    task.result = { reason: String(reason || 'execution_failed').slice(0, 120) };
    task.completedAt = Date.now();
    return { ok: true, task: { ...task } };
  }

  global.PlacursoAnnanExecutionEngine = Object.freeze({
    version: '1.0',
    create,
    get,
    list,
    approve,
    start,
    complete,
    fail,
    validate,
  });
})(typeof window !== 'undefined' ? window : globalThis);
