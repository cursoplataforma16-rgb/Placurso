# Phase 9 Execution Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded, auditable execution engine to the existing ANNAN runtime so decisions can become tracked tasks without creating a second ANNAN or making external calls.

**Architecture:** A side-effect-free execution engine owns task lifecycle, priorities, approval requirements, and result recording. It delegates future external work through the Phase 8 Integration Gateway, but this phase only produces deterministic execution plans/results and never calls external services.

**Tech Stack:** Vanilla JavaScript runtime, Python contract tests, existing Netlify build pipeline, GitHub Actions.

**Spec:** Phase 9 — Motor Autónomo de Execução do ANNAN, approved by the user in conversation on 2026-10-31.

## Global Constraints

- Must remain a capability of the existing ANNAN runtime; do not create another ANNAN.
- Do not touch or integrate the DIONUEL ANNAN in this phase.
- No external API, payment, analytics, channel, MCP, webhook, or automation calls in this phase.
- Sensitive actions require explicit approval before execution.
- Every task has a bounded lifecycle and auditable result.
- Preserve A-Ads and all existing Phase 4/6/7/8 behavior.
- Keep the engine deterministic and side-effect free.

## Review Focus

- Duplicate task IDs must not create duplicate execution.
- Invalid or secret-like task payloads must be rejected.
- Sensitive tasks must remain blocked until approved.
- Failed execution must be represented without silently becoming completed.
- Task history must be bounded to avoid unbounded browser memory.

### Task 1: Execution Engine contract

**Files:**
- Create: `scripts/test_annan_execution_engine.js`
- Create: `scripts/annan_execution_engine.js`

- [ ] Write failing tests for task creation, validation, lifecycle transitions, duplicate IDs, approval gates, bounded history, and deterministic result recording.
- [ ] Run the test and confirm it fails because the engine does not yet exist.
- [ ] Implement the minimal side-effect-free engine exposed as `global.PlacursoAnnanExecutionEngine`.
- [ ] Run the tests and confirm green.
- [ ] Commit the engine and tests.

### Task 2: Build integration and regression guard

**Files:**
- Create: `scripts/test_phase9_build_integration.py`
- Modify: `scripts/build_netlify.py`
- Modify: `.github/workflows/phase9-verify.yml`

- [ ] Add a build integration test requiring the engine marker and source in `psico-engine.js`.
- [ ] Run the test before the build change and confirm failure.
- [ ] Append the engine to the existing ANNAN runtime without removing Gateway, Product Factory, persistence, community flow, or A-Ads guard.
- [ ] Add CI for engine contract, build integration, existing regression tests, and Python compilation.
- [ ] Run the full Phase 9 verification suite and confirm green.
- [ ] Commit the integration and CI.

### Task 3: PR and verification

- [ ] Push branch and open a PR against `main`.
- [ ] Verify all required GitHub Actions checks are green.
- [ ] Merge only after verification succeeds.
- [ ] Verify the resulting `main` commit and production deployment status.
