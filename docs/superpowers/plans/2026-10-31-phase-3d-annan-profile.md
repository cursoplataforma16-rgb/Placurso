# Phase 3D ANNAN Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Convert real Placurso game and crypto-learning records into an evidence-based profile, clear ANNAN insight, an actionable next challenge, and a persisted evolution history.

**Architecture:** Keep the static site and Python patch pipeline. Add two small UMD JavaScript cores with Node built-in tests: one for crypto mission progression and one for profile derivation/insights. Patch Phase 3A/3C to publish progress events, add a Phase 3D UI patch, and include it last in the existing build chain.

**Tech Stack:** Vanilla JavaScript, Python 3, Node.js built-in `assert`, localStorage, existing GitHub branch.

**Spec:** `docs/superpowers/specs/2026-10-31-phase-3d-annan-profile.md`

## Global Constraints
- Preserve Phase 3A, Phase 3B and Phase 3C.
- No external dependencies, authentication or database.
- Keep all work on `phase-3b-experience`; do not modify `main`.
- Preserve all existing DIONUEL/Kunica assets, URLs and repositories untouched.
- Scores come from actual recorded correct/total counts; missing data is `null`.
- Mark fewer than 3 observations as "Sinal inicial".
- Never present scores as a psychological or professional diagnosis.
- Trade remains educational/simulation-only.
- No production deploy in Phase 3D; minimize future deploy count.

## Review Focus
- Corrupt or partially populated localStorage must not throw or fabricate high scores.
- Failed crypto missions must never unlock a level.
- Repeated progress events must not duplicate history or XP.
- No-data and low-sample profiles must not assert a strongest capability.
- Recommendation targets must exist or show an honest fallback.
- The profile must not create horizontal overflow at 360px width.
- Legacy crypto records must not preserve potentially false unlock counts.

---

### Task 1: Crypto progression correctness

**Files:**
- Create: `scripts/crypto_progression_core.js`
- Create: `scripts/test_crypto_progression_core.js`
- Modify: `scripts/patch_phase3c_crypto_games.py`

**Interfaces:**
- `createCryptoState()` returns version 2 state with per-level attempts/passes/answered/correct totals.
- `canStartCryptoLevel(state, level)` allows basic always, intermediate after 2 passed basic missions, advanced after 2 passed intermediate missions.
- `recordCryptoMission(state, level, score, total)` returns a new safe state and pass flag; pass threshold is 2/3.
- The Phase 3C patch embeds the core into `psico-engine.js`, migrates v1 XP/completed only, and dispatches `placurso:progress`.

- [ ] Step 1: Write tests for fresh state, basic unlock, 1-vs-2 passed missions, failed mission non-unlock, score clamping and legacy migration.
- [ ] Step 2: Run `node scripts/test_crypto_progression_core.js`; verify RED because the core does not exist.
- [ ] Step 3: Implement the minimal core functions and rerun the tests.
- [ ] Step 4: Update Phase 3C rendering, persistence and unlock UI to use only the shared core; retain XP/completed counts but discard legacy unlock counters.
- [ ] Step 5: Run the test again and `python3 -m py_compile scripts/patch_phase3c_crypto_games.py`.

### Task 2: Evidence-based ANNAN profile core

**Files:**
- Create: `scripts/annan_profile_core.js`
- Create: `scripts/test_annan_profile_core.js`

**Interfaces:**
- `deriveAnnanProfile(phase3aState, cryptoState)` returns seven skill records with score, sample count, evidence label and source; IA is null until real data exists.
- `analyseAnnanProfile(profile)` returns strongest area only at 3+ samples, next practice area and an honest explanation.
- `addProfileSnapshot(history, profile, timestamp)` keeps a bounded recent history.
- `getSkillTrend(history, skillId)` returns a change only when two comparable scores exist.

- [ ] Step 1: Write tests for empty profile, correct percentage, weighted results, missing AI data, sample confidence, ANNAN recommendation and trend calculation.
- [ ] Step 2: Run `node scripts/test_annan_profile_core.js`; verify RED because the core does not exist.
- [ ] Step 3: Implement pure derivation/analysis/history functions.
- [ ] Step 4: Rerun the test and add malformed-state edge cases.

### Task 3: Publish progress and present Phase 3D

**Files:**
- Modify: `scripts/patch_phase3a_games.py`
- Create: `scripts/patch_phase3d_annan_profile.py`

**Interfaces:**
- Phase 3A dispatches one `placurso:progress` event after each completed round with source, game, correct, elapsed and score.
- Phase 3C dispatches the same event after each completed crypto mission.
- Phase 3D consumes both event types, derives profile from the authoritative localStorage records, persists bounded snapshots under `placurso_annan_profile_v1`, and renders one profile/insight/recommendation panel.
- Recommendation actions launch the matching Phase 3A card or the next unlocked crypto level.

- [ ] Step 1: Add the Phase 3A event dispatch after the existing state save.
- [ ] Step 2: Build the Phase 3D patch with seven skill cards, sample labels, recent trend, ANNAN explanation and next-action button.
- [ ] Step 3: Handle empty, corrupt and storage-blocked states without breaking the hub.
- [ ] Step 4: Ensure event handlers are registered once and repeated events do not duplicate history.
- [ ] Step 5: Run Node syntax checks on generated engine and Python compile checks.

### Task 4: Integrate and verify the build chain

**Files:**
- Modify: `scripts/build_netlify.py`
- Create: `scripts/test_phase3d_patch_pipeline.py`

- [ ] Step 1: Add Phase 3D after Phase 3C in the build sequence and update build status messages.
- [ ] Step 2: Create a synthetic engine fixture containing the minimum Phase 3A hub marker.
- [ ] Step 3: Apply the Phase 3B, Trade, Phase 3C and Phase 3D patch chain to the fixture; verify all expected markers appear once.
- [ ] Step 4: Run `node --check` on the generated fixture and all Node core tests.
- [ ] Step 5: Run `python3 -m py_compile scripts/*.py` for the changed patch/build scripts and run the patch pipeline smoke test.
- [ ] Step 6: Inspect the complete branch diff and confirm `main` has not changed.

### Task 5: Final review gate

- [ ] Step 1: Review the full diff against the Phase 3D spec, with special attention to score truthfulness and progression unlocks.
- [ ] Step 2: Re-run every test and syntax/build smoke test after any fix.
- [ ] Step 3: Confirm Phase 3A/3B/3C remain in the build chain and DIONUEL/Kunica remain untouched.
- [ ] Step 4: Stop before production deployment; report branch commit and the exact outstanding browser/production verification gate.
