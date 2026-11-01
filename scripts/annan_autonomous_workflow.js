/*
 * Phase 9.3 — ANNAN Autonomous Workflow
 *
 * Bounded orchestration for the existing ANNAN Execution Engine. It runs an
 * ordered task plan one step at a time, verifies each local result, stops on
 * failure, and returns an auditable summary. No external calls are performed.
 */
(function (global) {
  'use strict';

  const MAX_STEPS = 32;

  function cleanId(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
  }

  function safeText(value, max) {
    return String(value || '').trim().slice(0, max);
  }

  function validate(input) {
    if (!input || typeof input !== 'object') return { ok: false, reason: 'invalid_workflow' };
    const id = cleanId(input.id);
    if (!id) return { ok: false, reason: 'missing_id' };
    if (!safeText(input.objective, 240)) return { ok: false, reason: 'invalid_objective' };
    if (!Array.isArray(input.tasks) || input.tasks.length === 0) return { ok: false, reason: 'missing_tasks' };
    if (input.tasks.length > MAX_STEPS) return { ok: false, reason: 'step_limit' };
    return { ok: true, id };
  }

  function verifyResult(result) {
    return !!result && typeof result === 'object' && result.ok === true && !!result.task && result.task.status === 'completed';
  }

  function run(input) {
    const check = validate(input);
    if (!check.ok) return check;

    const Engine = global.PlacursoAnnanExecutionEngine;
    if (!Engine) return { ok: false, reason: 'execution_engine_missing' };

    const sensitive = input.sensitive === true;
    if (sensitive && input.approved !== true) return { ok: false, reason: 'approval_required' };

    const workflowId = check.id;
    const steps = input.tasks.slice(0, MAX_STEPS);
    const summary = {
      ok: true,
      id: workflowId,
      objective: safeText(input.objective, 240),
      status: 'completed',
      total: steps.length,
      completed: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index] || {};
      const stepId = cleanId(step.id || `step-${index + 1}`);
      if (!stepId) {
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, status: 'failed', reason: 'invalid_step_id' });
        break;
      }

      const taskId = `${workflowId}:${stepId}`;
      const taskSensitive = sensitive || step.sensitive === true;
      if (step.sensitive === true && !sensitive) {
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, taskId, status: 'failed', reason: 'approval_required' });
        break;
      }

      const created = Engine.create({
        id: taskId,
        objective: safeText(step.objective || `Workflow step ${index + 1}`, 240),
        priority: step.priority,
        integration: step.integration,
        eventType: step.eventType,
        event: step.event,
        sensitive: taskSensitive,
      });

      if (!created.ok) {
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, taskId, status: 'failed', reason: created.reason });
        break;
      }

      if (taskSensitive && input.approved === true) {
        const approved = Engine.approve(taskId);
        if (!approved.ok) {
          summary.status = 'failed';
          summary.failed += 1;
          summary.skipped = steps.length - index - 1;
          summary.results.push({ index, taskId, status: 'failed', reason: approved.reason });
          break;
        }
      }

      const started = Engine.start(taskId);
      if (!started.ok) {
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, taskId, status: 'failed', reason: started.reason });
        break;
      }

      if (step.fail === true) {
        Engine.fail(taskId, 'workflow_step_failed');
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, taskId, status: 'failed', reason: 'workflow_step_failed' });
        break;
      }

      const completed = Engine.complete(taskId, {
        workflowId,
        stepId,
        index,
        verified: true,
        execution: 'local',
      });

      if (!verifyResult(completed)) {
        summary.status = 'failed';
        summary.failed += 1;
        summary.skipped = steps.length - index - 1;
        summary.results.push({ index, taskId, status: 'failed', reason: completed.reason || 'verification_failed' });
        break;
      }

      summary.completed += 1;
      summary.results.push({ index, taskId, status: 'completed', verified: true });
    }

    return summary;
  }

  global.PlacursoAnnanAutonomousWorkflow = Object.freeze({
    version: '1.0',
    validate,
    verifyResult,
    run,
  });
})(typeof window !== 'undefined' ? window : globalThis);
