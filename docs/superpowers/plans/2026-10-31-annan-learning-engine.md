# ANNAN Learning Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Give ANNAN a bounded, duplicate-safe learning memory and evidence-based next-action recommendations connected to existing Placurso experiences.

**Architecture:** Add a standalone pure JavaScript learning core, connect its event contract to psychotechnical and Biblical completions, then bridge it into the existing Phase 3D profile UI. Keep the existing profile core, game engines, crypto scoring and local-storage compatibility intact.

**Tech Stack:** Browser JavaScript (UMD/CommonJS), existing Python patch scripts, Node.js tests, GitHub Actions, Netlify build pipeline.

**Spec:** `docs/superpowers/designs/2026-10-31-annan-learning-engine.md`

## Global Constraints
- Work only in `cursoplataforma16-rgb/Placurso`.
- Preserve all Phase 3A/3B/3C/3D game and progression logic.
- Store outcomes only; do not store raw answers or personal data in the event ledger.
- Limit learning history to 120 events and processed IDs to a bounded set.
- No clinical/psychological diagnosis or unsupported intelligence/personality claims.
- Use localStorage as a compatibility store; do not claim cross-device or server persistence.
- Do not touch DIONUEL/Kunica or deploy intermediate fragments.

## Review Focus
- Missing/invalid event IDs or totals are rejected rather than stored.
- Duplicate event IDs do not inflate learning counts.
- Malformed local storage is sanitized without crashing the student experience.
- A weak or failed result triggers reinforcement with a reason grounded in the result.
- A passed Bible mission continues through the existing Bible panel, not a new engine.
- Visitor access does not expose member-only evolution.

---

### Task 1: Learning memory contract (TDD)

**Files:**
- Create: `scripts/test_annan_learning_core.js`
- Create: `scripts/annan_learning_core.js` (after the failing tests)

**Interfaces:**
- `createLearningState()`
- `sanitizeLearningState(input)`
- `recordLearningEvent(state, event, timestamp)`
- `summarizeLearning(state)`
- `recommendNextAction(profile, state, profileAnalysis)`

- [x] Write tests for rejected invalid events, event normalization, duplicate IDs, the 120-event cap, safe sanitization, accurate summaries, weak-result reinforcement, Bible continuation, and profile fallback.
- [x] Run the new Node test before implementation and confirm it fails because the learning API is missing.
- [x] Implement the smallest pure core that satisfies the tests.
- [x] Run the focused test and the existing ANNAN profile tests.

### Task 2: Capture psychotechnical and Biblical results

**Files:**
- Modify: `scripts/patch_community_flow.py`
- Modify: `scripts/test_community_flow_pipeline.py`

**Interfaces:**
- Publish `placurso:progress` events with stable IDs and source/game labels `psychotechnical` and `bible`.
- Keep the existing 7-question completion and Bible progression behavior unchanged.

- [x] Add pipeline assertions for both event producers.
- [x] Verify the assertions fail before the integration change.
- [x] Add event dispatch only after each result has been calculated and persisted.
- [x] Run the community pipeline test.

### Task 3: Connect the learning core to Phase 3D

**Files:**
- Modify: `scripts/patch_phase3d_annan_profile.py`
- Modify: `scripts/test_phase3d_patch_pipeline.py`

**Interfaces:**
- Embed `annan_learning_core.js` exactly once under marker `PLACURSO_ANNAN_LEARNING_CORE`.
- Persist under `placurso_annan_learning_v1`.
- Consume the shared `placurso:progress` event, ignore duplicate IDs, and render an action/reason from `recommendNextAction`.
- Keep existing profile snapshots and score calculations intact.

- [x] Add pipeline assertions for the learning core marker, store key, event listener and recommendation call.
- [x] Verify the assertions fail before patcher changes.
- [x] Integrate the core and event listener with safe localStorage handling.
- [x] Add the Bible route to the existing launch behavior without changing Bible questions or scoring.
- [x] Run Phase 3D pipeline and JavaScript syntax verification.

### Task 4: CI and full regression

**Files:**
- Modify: `.github/workflows/phase3d-verify.yml`
- Verify: existing Node and Python tests, exact Netlify build command.

- [x] Add the new learning-core Node test to CI.
- [x] Run all Node core tests.
- [x] Run all existing Python pipeline/guard tests and Python compilation.
- [x] Reproduce the Netlify build in CI and verify generated engine syntax and markers.
- [x] Inspect the final diff and open a pull request to `main`.
- [x] Do not deploy until the complete batch is verified and production target is confirmed.


## Release status

- [x] PR #5 opened against `main`.
- [x] GitHub Actions functional verification passed on the branch and again for the pull request.
- [x] Netlify pull-request preview checks completed; this is not a production release.
- [x] No production deployment was initiated in this phase.
