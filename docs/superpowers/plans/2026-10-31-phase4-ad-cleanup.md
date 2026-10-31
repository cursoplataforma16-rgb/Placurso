# Phase 4 Ad Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining external/embedded advertising surface visible in the mobile public Placurso experience, including the Visa-style ad seen in the validation video, without hiding legitimate Placurso content.

**Architecture:** Keep the fix in the existing Phase 4 public guard (`scripts/patch_phase4_public_guard.py`) so every Netlify build receives the same cleanup. Extend detection by stable advertising wording/patterns rather than changing the public shell or game engines.

**Tech Stack:** Python build/patch scripts, browser JavaScript injected by the Phase 4 guard, GitHub Actions.

**Spec:** Current mobile validation video and the Phase 4 public-guard behavior already in `scripts/patch_phase4_public_guard.py`.

## Global Constraints

- Do not advance to a new product phase while Phase 4 public presentation still exposes unwanted ads.
- Do not hide the Placurso community shell or legitimate student/public content.
- Preserve the existing ANNAN challenge/game flow.
- Keep the change in the existing build pipeline; do not create a separate deployment path.

## Review Focus

- Visa-style external ad text rendered after game content must disappear.
- Existing `aads.com`, `maads.com`, and `slise.xyz` surfaces must remain blocked.
- Legitimate Placurso text containing generic words such as “conta” must not be hidden.
- MutationObserver-inserted ads must be removed after initial page load.
- The build must continue to pass JavaScript syntax validation.

---

### Task 1: Regression test for Phase 4 advertising cleanup

**Files:**
- Create: `scripts/tests/test_phase4_public_guard.py`
- Create: `.github/workflows/phase4-guard-verify.yml`

**Interfaces:**
- Consumes: `scripts/patch_phase4_public_guard.py`.
- Produces: a deterministic regression test that fails until Visa-style advertising text is covered.

- [ ] **Step 1: Write the failing test**

The test creates a temporary minimal JavaScript engine, runs the existing guard patcher, and asserts that the generated guard contains the expected Visa advertising marker and existing domain markers.

- [ ] **Step 2: Run the test to verify it fails**

Run in CI: `python3 scripts/tests/test_phase4_public_guard.py`.
Expected: FAIL because the current guard does not contain the Visa-style marker.

- [ ] **Step 3: Add a CI workflow**

Run the regression on pushes and pull requests using Python 3.11.

- [ ] **Step 4: Commit the red test**

Commit message: `test: cover remaining Phase 4 ad surface`.

### Task 2: Minimal Phase 4 guard fix

**Files:**
- Modify: `scripts/patch_phase4_public_guard.py`

**Interfaces:**
- Consumes: the failing regression from Task 1.
- Produces: the same guard with stronger advertising detection.

- [ ] **Step 1: Extend the ad marker list with the exact observed Visa-style wording**

Add a narrow marker for `Obtenha uma conta Visa` and its English equivalent, without treating generic words like `conta` or `Visa` independently as ads.

- [ ] **Step 2: Run the regression**

Run: `python3 scripts/tests/test_phase4_public_guard.py`.
Expected: PASS.

- [ ] **Step 3: Commit the fix**

Commit message: `fix: remove remaining Phase 4 ad surface`.

### Task 3: Verify the branch before integration

**Files:**
- No new files.

- [ ] **Step 1: Inspect the CI result**

Expected: Phase 4 guard regression is green.

- [ ] **Step 2: Inspect the final diff**

Confirm only the Phase 4 guard, its regression test/workflow, and this plan changed.

- [ ] **Step 3: Open a pull request for integration**

Target: `main`.
