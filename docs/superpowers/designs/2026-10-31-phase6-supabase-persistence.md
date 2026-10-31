# Phase 6 — ANNAN persistence with Supabase

## Goal
Move ANNAN learning memory from device-only persistence to secure account-backed persistence, without changing the existing scoring engines or public visitor experience.

## Current state
Phase 5 is now merged into `main`. ANNAN records bounded learning outcomes locally in `placurso_annan_learning_v1`, summarizes evidence, and recommends a next action. No raw psychotechnical answers are stored.

The configured Supabase project for Placurso is `plataforma-curso` (`ebdrrsrvjsdjthatfbcd`) and is ACTIVE_HEALTHY. The schema is live: migration versions `20261031175433` (ANNAN tables, RLS and ownership policies) and `20261031175547` (least-privilege API grants) are applied. Anonymous access is revoked; authenticated students can select, insert and update only their own rows. The browser adapter, authenticated session bridge, cross-device merge, and typed client integration remain to be implemented.

## Design
1. **Identity:** Supabase Auth identifies a registered student. Anonymous/public visitors remain outside the persistent student ledger.
2. **Learning events:** store normalized outcomes only: source, game, level, score/correct/total, passed, occurred-at, and stable event id. Never store raw answers.
3. **Student profile:** keep a compact ANNAN profile/evolution record derived from learning events rather than duplicating every UI state.
4. **Recommendations:** ANNAN remains the source of recommendation logic. Persistence supplies cross-device evidence; it does not replace the recommendation engine.
5. **Local compatibility:** local state remains as a short-lived offline cache/fallback. Successful sync reconciles by stable event id, preventing duplicates.
6. **Security:** all exposed tables use RLS. Students can read/write only their own records. No service-role key reaches the browser. Authorization is based on `auth.uid()` ownership, never editable user metadata.
7. **Migration:** create SQL migration and client integration only after the target Supabase project is active. Generate typed database definitions and run security/performance advisors before release.

## Proposed data model
- `public.annan_learning_events`: one row per normalized learning event, unique on `(user_id, event_id)`.
- `public.annan_student_profiles`: one row per authenticated student, storing derived profile summary and timestamps.

## Non-goals
- Replacing Phase 3A/3C/3D scoring.
- Storing raw quiz answers.
- Adding medical, psychological diagnosis, or treatment claims.
- Moving public visitor state into the student database.
- Introducing an admin/service-role key into client-side code.

## Acceptance criteria
- Authenticated student events persist across devices.
- Duplicate events are harmless.
- RLS prevents one student from reading or modifying another student's records.
- Offline/local behavior still works when Supabase is unavailable.
- ANNAN recommendations remain explainable and are based on the persisted event history.
- Existing Phase 4 public guard and Phase 5 regression tests remain green.
