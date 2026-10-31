# Community Functional Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Placurso's public experience into a clear community entry flow and separate registered-student area while preserving the existing Phase 3A/3B/3C/3D engines.

**Architecture:** Add a thin orchestration/access layer around the generated `psico-engine.js`. Keep existing game engines intact. Public UI exposes discovery and one compact 7-question challenge; member UI exposes the Challenge Center, evolution, learning and dedicated game launchers. Use explicit referral state and local compatibility first; avoid claiming verified referrals without evidence.

**Tech Stack:** Existing static/JS engine, Python build patches, browser localStorage compatibility, existing Netlify build pipeline, existing ANNAN profile core.

**Spec:** `docs/superpowers/designs/2026-10-31-placurso-community-experience.md`

## Global Constraints
- Work only in `cursoplataforma16-rgb/Placurso` and branch `feature/community-functional-flow`.
- Never touch DIONUEL/Kunica.
- Preserve existing Phase 3A/3B/3C/3D logic and crypto educational framing.
- No medical-treatment claims for anxiety/depression.
- Do not expose implementation phase names, conversion language, or internal engine terminology to visitors.
- Mobile-first and functional before visual polish.
- Do not deploy intermediate fragments; batch and verify before one production deploy.

## Review Focus
- Public page never exposes student evolution data.
- Exactly 7 psychotechnical questions.
- Invitation/registration state is explicit and never falsely reports five completed referrals.
- Student area is visibly distinct and has Challenge Center at the top.
- Each game opens through a dedicated experience panel without rewriting existing game logic.
- Biblical learning is independently discoverable and educational.
- Result -> ANNAN -> next action remains functional.
- Existing crypto progression and local persistence remain intact.

---

## Task 1 — Access and progression contract
- [ ] Add `scripts/community_access_core.js` with visitor/member state, referral/invitation state, registration completion, and gating helpers.
- [ ] Add `scripts/test_community_access_core.js` covering visitor state, registration, referral count, threshold behavior, and rejection of fake completion.
- [ ] Run the test and require green before continuing.

## Task 2 — Seven-question psychotechnical experience
- [ ] Add `scripts/psychotechnical_core.js` with exactly seven questions, answer tracking, completion, score and result band.
- [ ] Add `scripts/test_psychotechnical_core.js` proving exactly seven questions and deterministic scoring/completion behavior.
- [ ] Run the test and require green.

## Task 3 — Public/member orchestration
- [ ] Add `scripts/patch_community_flow.py` to inject the new public/student shell around the existing hub.
- [ ] Public: horizontal Challenge Center, one accessible experience, compact 7-question entry, biblical discovery, Bybit link, footer links.
- [ ] Public: hide evolution/student-only panels and show only a benefit-oriented invitation to follow evolution.
- [ ] Registration gate: invite-five state, registration form, then member shell.
- [ ] Member: Challenge Center at top, continue/recommended, evolution, learning and community actions.
- [ ] Route game selection into a dedicated experience overlay/panel while invoking the existing engine underneath.

## Task 4 — Biblical learning family
- [ ] Add `scripts/bible_learning_core.js` with teaching-first progressive questions.
- [ ] Add tests for question progression and completion.
- [ ] Add the Bible family to the community flow without commercial-first language.

## Task 5 — ANNAN and existing engine bridge
- [ ] Connect result events to the existing ANNAN profile/recommendation core.
- [ ] Keep evolution member-only.
- [ ] Preserve Phase 3A/3C events and crypto progression.
- [ ] Ensure the dedicated panel returns a result and next action.

## Task 6 — Build integration and verification
- [ ] Add the new core tests to the build/CI verification path.
- [ ] Run Python compilation and Node syntax checks.
- [ ] Build the Netlify package once and verify markers, routes, required assets and absence of DIONUEL/Kunica references.
- [ ] Verify mobile interaction paths from public entry through member area.

## Task 7 — Single production release
- [ ] Commit the complete functional batch on `feature/community-functional-flow`.
- [ ] Verify branch head and Netlify target is the `placurso` project before deployment.
- [ ] Deploy once after all verification passes.
- [ ] Verify production and record the deploy URL/commit.
