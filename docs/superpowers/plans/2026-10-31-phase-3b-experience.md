# Phase 3B Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a professional, mobile-first experience layer over the existing Phase 3A games with persistent progress, skill feedback, mastery, and healthy return loops.

**Architecture:** Keep the current static archive and patch pipeline. Add one build-time patch script that appends a self-contained Phase 3B IIFE to `psico-engine.js`; it owns state, UI, and game progression without changing the Phase 3A engine. Update `build_netlify.py` to apply the patch after Phase 3A visibility. Validate the resulting engine with Node syntax checks and a browser smoke test before any production deploy.

**Tech Stack:** Existing HTML/CSS/vanilla JavaScript, Python build patching, localStorage.

**Spec:** `docs/superpowers/specs/2026-10-31-phase-3b-experience.md`

## Global Constraints

- Preserve all existing Phase 3A games.
- Mobile-first and no horizontal overflow.
- No login/database dependency for Phase 3B.
- Progress is stored in `placurso_phase3b_experience_v1`.
- No manipulative retention mechanics.
- Validate JavaScript with `node --check`.
- Do not deploy to production until the complete phase passes verification.
- Do not touch DIONUEL/Kunica.

## Review Focus

- Existing Phase 3A boot order: Phase 3B must attach after `.pch-games-hub` exists.
- Corrupt localStorage: invalid JSON must fall back to safe defaults.
- Expired/timed-out rounds: no negative XP and no broken timers.
- Repeat play: event listeners and timers must not accumulate.
- Mobile layout: 360px width must not create horizontal scrolling.

### Task 1: Add the Phase 3B experience patch

**Files:**
- Create: `scripts/patch_phase3b_experience.py`
- Modify: `scripts/build_netlify.py`

**Interfaces:**
- Input: extracted `psico-engine.js` path passed as argv[1].
- Output: same file with one marker `/* PLACURSO_PHASE3B_EXPERIENCE */` appended exactly once.
- Build integration: `PATCH_PHASE3B` is applied after `PATCH_PHASE3A_VIS`.

- [ ] Step 1: Add a patch script that fails if the Phase 3B marker already exists and fails clearly if `.pch-games-hub` support is absent from the source.
- [ ] Step 2: Implement state defaults and safe localStorage loading/saving under `placurso_phase3b_experience_v1`.
- [ ] Step 3: Implement the visible experience layer: progress card, skill meters, mastery cards, daily challenge, and return cue.
- [ ] Step 4: Implement five-level game metadata and result handling for the four Phase 3A games without replacing their existing buttons.
- [ ] Step 5: Add responsive styles, visible focus states, reduced-motion handling, and defensive event/timer cleanup.
- [ ] Step 6: Update `build_netlify.py` to invoke the Phase 3B patch after Phase 3A visibility and update its success output.
- [ ] Step 7: Run Python syntax checks and confirm the patch script is syntactically valid.

### Task 2: Build verification

**Files:**
- Test: generated `psico-engine.js` from the current source archive.

- [ ] Step 1: Extract the source archive into a temporary directory.
- [ ] Step 2: Apply the full build patch chain.
- [ ] Step 3: Run `node --check` on the generated engine.
- [ ] Step 4: Assert the Phase 3B marker, state key, five-level metadata, and responsive CSS are present exactly once.
- [ ] Step 5: Run the generated site in a local browser-capable smoke environment and verify hub visibility, game launch, result state, refresh persistence, and mobile width behavior.

### Task 3: Final review gate

**Files:**
- Review: all Phase 3B changes on `phase-3b-experience`.

- [ ] Step 1: Review the diff for accidental changes outside Placurso.
- [ ] Step 2: Re-run the full syntax/build verification after any fix.
- [ ] Step 3: Confirm production `main` remains unchanged by this phase.
- [ ] Step 4: Stop before production deployment and report the verified branch commit plus the exact production deployment gate.
