# Phase 6 — ANNAN Supabase Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist authenticated students' normalized ANNAN learning history across devices while retaining local/offline behavior and existing game engines.

**Architecture:** Add a small persistence adapter between the existing ANNAN learning core and Supabase. The adapter syncs normalized learning events by stable event id, keeps the browser cache as fallback, and never exposes privileged keys. Supabase Auth owns identity; RLS owns row access.

**Tech Stack:** Existing Placurso generated-site patch scripts, vanilla JavaScript, Supabase Postgres/Auth, SQL migration, GitHub Actions verification.

**Spec:** `docs/superpowers/designs/2026-10-31-phase6-supabase-persistence.md`

## Global Constraints

- Store normalized learning outcomes only; never raw answers.
- Public visitors remain outside the persistent student ledger.
- Preserve Phase 3A/3C/3D scoring and progression.
- Keep local persistence as offline fallback.
- Never expose a service-role/secret key in browser code.
- Every exposed table must have RLS and ownership predicates using `auth.uid()`.
- Do not add clinical or personality-diagnosis claims.
- Do not deploy until verification passes.

## Review Focus

- Duplicate event retries must be idempotent by stable event id.
- A logged-out visitor must not write student rows.
- One authenticated student must not read another student's rows.
- Supabase outage must not break local learning or recommendations.
- Malformed persisted records must be sanitized before sync.

### Task 1: Define the database contract

**Files:**
- Create: `supabase/migrations/20261031_annan_persistence.sql`
- Create: `scripts/test_annan_supabase_schema.py`

**Interfaces:**
- `annan_learning_events`: `id`, `user_id`, `event_id`, `source`, `game`, `level`, `correct`, `total`, `score`, `passed`, `occurred_at`, `created_at`; unique `(user_id,event_id)`.
- `annan_student_profiles`: `user_id` primary key plus compact derived profile JSON and timestamps.

- [x] Write schema/security assertions covering tables, unique key, foreign key to `auth.users`, RLS, SELECT/INSERT/UPDATE ownership policies, and absence of raw-answer columns.
- [x] Run the schema contract verification in GitHub Actions.
- [x] Add the migration with strict types, checks, indexes, RLS, ownership policies, and least-privilege table grants.
- [x] Run the schema verification and verify it passes.
- [x] Commit the migrations and regression test.

### Task 2: Build the browser persistence adapter

**Files:**
- Create: `scripts/annan_supabase_persistence.js`
- Create: `scripts/test_annan_supabase_persistence.js`

**Interfaces:**
- `createPersistence(config)` returns an adapter with `isConfigured()`, `getSession()`, `syncEvents(events)`, `loadEvents()`, and `saveProfile(profile)`.
- `syncEvents` accepts normalized Phase 5 events and returns `{syncedIds, failedIds}` without throwing on network failure.

- [ ] Write tests for missing configuration, logged-out state, duplicate events, malformed events, and network failure fallback.
- [ ] Implement the adapter using the browser-safe Supabase client only; configuration comes from public environment values.
- [ ] Ensure payloads contain only normalized event fields.
- [ ] Run the adapter tests and verify they pass.
- [ ] Commit the adapter.

### Task 3: Bridge ANNAN learning memory to persistence

**Files:**
- Modify: `scripts/patch_phase3d_annan_profile.py`
- Modify: `scripts/annan_learning_core.js`
- Test: `scripts/test_phase3d_patch_pipeline.py`

**Interfaces:**
- Existing `Learning.recordLearningEvent` remains the local source of truth for immediate UI behavior.
- Persistence adapter receives the normalized event after local recording.
- On student session load, persisted events are merged by event id before ANNAN summary/recommendation rendering.

- [ ] Add regression tests for event sync markers, session gating, and local fallback.
- [ ] Add the adapter bridge without changing existing recommendation semantics.
- [ ] Merge persisted events idempotently into local learning state.
- [ ] Keep raw answers out of all persistence calls.
- [ ] Run Phase 3D and ANNAN tests.
- [ ] Commit the bridge.

### Task 4: Authenticated student boundary

**Files:**
- Modify: `scripts/patch_community_flow.py`
- Create: `scripts/test_phase6_auth_boundary.py`

**Interfaces:**
- Public flow remains unauthenticated and cannot access student persistence.
- Student area obtains the current Supabase session before persistence operations.

- [ ] Write failing tests proving public UI has no student-history persistence path and authenticated UI does.
- [ ] Add the minimal session boundary and login/logout hooks required by the existing student area.
- [ ] Keep Bible, psychotechnical, crypto, and game progress behavior unchanged.
- [ ] Run the community-flow regression suite.
- [ ] Commit the boundary.

### Task 5: Integration verification and release gate

**Files:**
- Modify: `.github/workflows/phase6-verify.yml`
- Modify: `scripts/test_community_flow_pipeline.py`

- [ ] Add CI coverage for schema contract, persistence adapter, Phase 3D integration, public guard, and community flow.
- [ ] Run all Phase 6 tests and the existing regression suite.
- [x] Run Supabase security and performance advisors after the target project became active.
- [ ] Generate Supabase TypeScript types after the schema is live and verify client contracts.
- [ ] Create the Phase 6 pull request and do not deploy until all checks pass.
