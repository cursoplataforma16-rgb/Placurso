# Phase 9.3 Autonomous Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add a bounded workflow orchestrator that lets the existing ANNAN execution engine run ordered tasks, verify each result, stop safely on failure, and expose an auditable workflow summary.

**Architecture:** The workflow is a capability of the existing ANNAN runtime. It composes the existing Execution Engine and, when requested, the existing Phase 9.2 Gateway Adapter; it never creates another ANNAN and performs no external calls itself. Each task is created and executed sequentially, with deterministic local completion/failure semantics for this phase.

**Tech Stack:** Plain JavaScript runtime modules, Python contract tests, existing GitHub Actions/Netlify build pipeline.

**Spec:** Phase 9.3 approved direction in conversation: ANNAN plans a sequence → executes step by step → verifies each result → stops on failure → returns an auditable summary.

## Global Constraints

- Use the existing ANNAN runtime; no second ANNAN.
- Do not modify DIONUEL ANNAN.
- No external network/API/payment/channel calls in this phase.
- Sensitive workflows require explicit approval through the existing Execution Engine.
- Reject secret-like payloads through existing engine/gateway safeguards.
- Preserve Product Factory and A-Ads.

## Review Focus

- Ordered execution: later steps must not execute before earlier steps complete.
- Failure handling: one failed step stops subsequent steps and reports skipped work.
- Approval: sensitive workflows must not start without approval.
- Verification: a completed step must have a valid deterministic result before the workflow advances.
- Build safety: the workflow must be included in the same generated ANNAN runtime exactly once.

---

### Task 1: Workflow contract

**Files:**
- Create: `scripts/test_phase9_3_workflow.py`
- Create: `scripts/annan_autonomous_workflow.js`

**Interfaces:**
- `PlacursoAnnanAutonomousWorkflow.run(input)` returns a deterministic workflow summary.
- Input includes `id`, `objective`, `tasks`, and optional `sensitive`.

- [x] Define failing tests for sequential execution, stop-on-failure, and approval gating.
- [ ] Implement minimal workflow orchestration using the existing Execution Engine.
- [ ] Verify the workflow tests pass.

### Task 2: Build integration

**Files:**
- Modify: `scripts/build_netlify.py`
- Create: `scripts/test_phase9_3_build_integration.py`

**Interfaces:**
- Generated `public/psico-engine.js` contains the workflow marker and API.

- [ ] Add build integration after the Phase 9.2 adapter.
- [ ] Add regression checks that Product Factory, Gateway, Execution Engine, Adapter and A-Ads remain present.
- [ ] Verify syntax and build contracts.

### Task 3: CI

**Files:**
- Create: `.github/workflows/phase9-3-verify.yml`

- [ ] Run workflow contract and build integration tests in CI.
- [ ] Require Node syntax checks.
- [ ] Preserve the existing Phase 4/6/7/8/9 checks through the existing workflows.

### Task 4: PR and verification

- [ ] Commit the implementation.
- [ ] Open a PR against `main`.
- [ ] Wait for all required checks.
- [ ] Merge only after fresh green verification.
