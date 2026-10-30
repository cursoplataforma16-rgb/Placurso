# Phase 3B Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a professional, mobile-first experience where presentation, interaction, progression and ANNAN feedback turn the Placurso idea into a repeatable growth loop. The user should enter to discover/test/improve something, not merely to browse courses.

**Architecture:** Keep the current static archive and patch pipeline. Add one build-time Phase 3B experience layer over the Phase 3A engine. The layer owns presentation, profile/progression state, challenge entry points and healthy return cues without replacing existing game buttons. Future Trade/Finance, IA and Business experiences plug into the same profile model.

**Tech Stack:** Existing HTML/CSS/vanilla JavaScript, Python build patching, localStorage.

**Spec:** `docs/superpowers/specs/2026-10-31-phase-3b-experience.md`

## Product hierarchy

1. **O MEU NÍVEL / A MINHA EVOLUÇÃO** — main product identity.
2. **Desafios** — fastest entry and engagement mechanism.
3. **ANNAN** — interprets results and proposes the next improvement.
4. **Skills** — Mente, Foco, Decisão, Dinheiro, Negócio, IA, Estratégia.
5. **Cursos** — deeper solution after a need is discovered.

## Growth loop

`SOCIAL HOOK → CHALLENGE → RESULT → ANNAN INSIGHT → NEED → NEXT CHALLENGE/CONTENT/COURSE → PROGRESS → NEW REASON TO RETURN`

Short-form/social content is an acquisition layer; the site itself must provide the interactive value. Current 2026 social research supports prioritizing short-form, interactive/educational content, authenticity, serialized experiences and community-oriented engagement. The implementation must not depend on any one social network.

## Global Constraints

- Preserve all existing Phase 3A games.
- Mobile-first and no horizontal overflow.
- No login/database dependency for Phase 3B.
- Progress is stored in `placurso_phase3b_experience_v1`.
- No manipulative retention mechanics.
- Trade is educational/simulation-only in this phase: no profit guarantees, real-money execution, or personalized financial signals.
- Validate JavaScript with `node --check`.
- Batch work and test the whole phase before deployment; minimize production deploys.
- Do not deploy to production until the complete phase passes verification.
- Do not touch DIONUEL/Kunica.

## Review Focus

- Existing Phase 3A boot order: Phase 3B must attach after `.pch-games-hub` exists.
- Corrupt localStorage: invalid JSON must fall back to safe defaults.
- Expired/timed-out rounds: no negative XP and no broken timers.
- Repeat play: event listeners and timers must not accumulate.
- Mobile layout: 360px width must not create horizontal scrolling.
- Presentation must communicate value within seconds and avoid looking like an online store.
- Every visible recommendation must lead to an actionable next step.

### Task 1: Experience foundation and presentation

**Files:**
- Create/modify: `scripts/patch_phase3b_experience.py`
- Modify: `scripts/build_netlify.py`

- [ ] Step 1: Add a patch script that fails if the Phase 3B marker already exists and fails clearly if `.pch-games-hub` support is absent.
- [ ] Step 2: Implement safe state defaults/loading/saving under `placurso_phase3b_experience_v1`.
- [ ] Step 3: Implement the primary “A tua evolução fica visível” experience card with immediate next action.
- [ ] Step 4: Add visible skill pillars: Mente, Foco, Decisão, Dinheiro/Finanças, Estratégia, with IA and Negócio ready for expansion.
- [ ] Step 5: Add progress, mastery, daily challenge and personal-best cues.
- [ ] Step 6: Ensure the visual language feels like an interactive product, not a course shop.

### Task 2: Engagement and challenge layer

- [ ] Step 1: Implement five-level metadata and meaningful difficulty changes for the four Phase 3A games.
- [ ] Step 2: Make every round communicate objective → action → feedback → result → next action.
- [ ] Step 3: Add deterministic daily challenge routing without manipulative streak loss.
- [ ] Step 4: Add repeatable variations/mastery cues that create a legitimate reason to return.
- [ ] Step 5: Add ANNAN-style result language that explains the user's current signal and suggests the next challenge.

### Task 3: Trend-entry experiences

- [ ] Step 1: Add the information architecture for **Dinheiro / Trade** as an educational simulation category.
- [ ] Step 2: Define initial trade scenarios around movement reading, probability, risk/reward, capital and decision timing.
- [ ] Step 3: Add **IA** challenge entry points around practical AI use and problem solving.
- [ ] Step 4: Add **Negócio** challenge entry points around price, margin, customer and resource decisions.
- [ ] Step 5: Keep these as plug-in experiences feeding the same profile, rather than separate products.

### Task 4: Build verification

**Files:** generated `psico-engine.js` from the current source archive.

- [ ] Step 1: Extract the source archive into a temporary directory.
- [ ] Step 2: Apply the complete build patch chain.
- [ ] Step 3: Run `node --check` on the generated engine.
- [ ] Step 4: Assert the Phase 3B marker, state key, profile pillars, five-level metadata and responsive CSS are present exactly once.
- [ ] Step 5: Smoke-test desktop and 360px mobile behavior.
- [ ] Step 6: Verify game launch, result handling, XP/skill/mastery update, daily completion and refresh persistence.
- [ ] Step 7: Verify no horizontal overflow and no console-blocking error in the experience flow.

### Task 5: Final review gate

- [ ] Step 1: Review the diff for accidental changes outside Placurso.
- [ ] Step 2: Re-run full syntax/build/browser verification after any fix.
- [ ] Step 3: Confirm production `main` remains unchanged by this phase.
- [ ] Step 4: Stop before production deployment and report the verified branch commit and exact deployment gate.
