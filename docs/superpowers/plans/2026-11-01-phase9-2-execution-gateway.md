# Phase 9.2 Execution Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing ANNAN Execution Engine to the existing Integration Gateway through a bounded, auditable adapter without performing external calls.

**Architecture:** The Execution Engine remains responsible for task lifecycle and approval. A small adapter resolves a registered integration through the Gateway, dispatches a normalized event, and feeds the deterministic Gateway result back into the task lifecycle. The adapter is part of the same ANNAN runtime; it does not create another ANNAN and does not touch DIONUEL.

**Tech Stack:** Browser-safe JavaScript, Node contract tests, Python build/integration tests, GitHub Actions, Netlify build pipeline.

**Spec:** This phase follows the approved controlled-gateway design in the conversation: ANNAN → Execution Engine → Integration Gateway → verification → learning; external execution remains deferred.

## Global Constraints

- Keep one ANNAN runtime; do not create a second ANNAN.
- Do not modify or integrate the DIONUEL ANNAN in this phase.
- No external network/API/payment/channel calls in this phase.
- Sensitive tasks still require explicit approval before starting.
- Reject secret-like values and preserve deterministic, bounded results.
- Preserve Product Factory, Phase 6 persistence, Phase 4 public guard, and A-Ads.

## Review Focus

- Unknown or disabled integration must fail without changing the task to running.
- Sensitive task without approval must remain blocked.
- Secret-like integration/event payloads must be rejected before dispatch.
- Gateway dispatch failure must transition the task to failed with an auditable reason.
- Successful dispatch must complete the task with a safe deterministic result.

### Task 1: Contract tests first

**Files:**
- Create: `scripts/test_annan_execution_gateway_adapter.js`
- Create: `scripts/test_phase9_2_build_integration.py`

- [ ] Write tests for successful dispatch through a registered gateway integration.
- [ ] Write tests for unknown/disabled integration, approval gating, secret rejection, and failure lifecycle.
- [ ] Write build test requiring the adapter marker and APIs in generated `psico-engine.js` while preserving Product Factory, Integration Gateway, Execution Engine, and A-Ads boundaries.
- [ ] Run tests and confirm they fail before implementation.

### Task 2: Execution/Gateway adapter

**Files:**
- Create: `scripts/annan_execution_gateway_adapter.js`
- Modify: `scripts/annan_execution_engine.js`

- [ ] Extend task state with normalized integration metadata without exposing secrets.
- [ ] Implement adapter that validates the task, starts it through the Execution Engine, dispatches through `PlacursoAnnanIntegrationGateway`, and completes/fails through the Execution Engine.
- [ ] Keep dispatch side-effect free and return deterministic audit data.
- [ ] Run JavaScript contract tests until green.

### Task 3: Build integration

**Files:**
- Modify: `scripts/build_netlify.py`
- Modify: `.github/workflows/phase9-verify.yml`

- [ ] Append the adapter to the same generated ANNAN runtime with a unique marker.
- [ ] Add Phase 9.2 contract and build tests to CI.
- [ ] Run all relevant Phase 4/6/7/8/9 regression tests.

### Task 4: Verification and delivery

- [ ] Verify generated runtime contains all required ANNAN components.
- [ ] Verify A-Ads preservation.
- [ ] Open PR against `main` with the Phase 9.2 scope and safety boundaries.
- [ ] Merge only after required checks pass.
- [ ] Verify the resulting `main` commit and Netlify deployment.
