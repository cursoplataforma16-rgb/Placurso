# Phase 4 Public Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public Placurso experience show only the community entry layer while hiding legacy student surfaces and intrusive external ad overlays, without changing the existing Phase 3 engines.

**Architecture:** Add a small post-community guard patch to the existing generated `psico-engine.js`. The guard is presentation-only: it hides known legacy student sections and external ad overlays after the DOM loads and when third-party content is injected. It does not change registration, referral, game, or progress data.

**Tech Stack:** Python build patches, generated browser JavaScript, Node syntax check, GitHub source, Netlify static deploy.

**Spec:** `docs/superpowers/designs/2026-10-31-placurso-community-experience.md`

## Global Constraints

- Only modify `cursoplataforma16-rgb/Placurso`.
- Preserve Phase 1, 2, 3A, 3B, 3C and 3D engines.
- Do not expose detailed student evolution to visitors.
- Do not send real invitations during validation.
- Batch changes into one source commit and one production deploy.
- Do not create a separate deploy for a minor fix.

## Review Focus

- Visitor sees legacy student content — test with a fresh browser state.
- Student shell is hidden incorrectly — test registered local member state.
- Third-party ad content reappears — test after delayed DOM injection.
- Existing game engine is broken by the guard — run Node syntax/build checks.
- Public challenge center disappears — confirm the community shell remains visible.

---

### Task 1: Add the Phase 4 public guard

**Files:**
- Create: `scripts/patch_phase4_public_guard.py`
- Modify: `scripts/build_netlify.py`
- Test: `scripts/test_phase4_public_guard.py`

- [ ] Add the guard patch after `patch_community_flow.py`.
- [ ] Hide only known legacy student surfaces outside `.plc-community-shell`.
- [ ] Hide identified intrusive ad overlays/iframes outside the community shell.
- [ ] Re-run cleanup after delayed DOM changes with `MutationObserver`.
- [ ] Run the Phase 4 guard test and Node syntax check.

### Task 2: Batch source commit

**Files:**
- Create: `docs/superpowers/plans/2026-10-31-phase4-public-guard.md`
- Create: `scripts/patch_phase4_public_guard.py`
- Create: `scripts/test_phase4_public_guard.py`
- Modify: `scripts/build_netlify.py`

- [ ] Commit all changes together so Netlify does not build intermediate states.

### Task 3: Production verification

- [ ] Confirm Netlify deploy is `ready`.
- [ ] Open production on mobile.
- [ ] Confirm visitor does not see the legacy student area.
- [ ] Confirm public challenge center remains visible.
- [ ] Confirm the ad overlay is no longer obstructing the page.
- [ ] Confirm the seven-question entry remains functional.
