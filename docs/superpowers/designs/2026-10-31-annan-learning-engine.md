# ANNAN — Learning Memory & Recommendation Engine

**Date:** 2026-10-31  
**Scope:** event memory, learning history, evidence-based recommendations, and integration with the existing Placurso ANNAN profile.

## 1. Intent

Make ANNAN act on real learning activity rather than only displaying an aggregate profile. After a challenge or learning activity, ANNAN should record the result, update a bounded learning history, explain what the result suggests, and recommend one useful next action.

## 2. Current state

The existing `annan_profile_core.js` derives skill scores from Phase 3A game counters and crypto progression, identifies strongest/weakest measured areas, recommends a next activity, and provides pure helpers for snapshots and trends. Phase 3A and crypto already publish `placurso:progress` events. Phase 3D listens to those events and stores up to 30 profile snapshots in localStorage.

The missing layer is a normalized event ledger with deduplication, source-aware summaries, recent-performance signals, and a recommendation contract that gives an understandable reason. The psychotechnical and Biblical experiences currently produce results but do not send them into that event ledger.

## 3. Chosen architecture

Add a separate, dependency-free `annan_learning_core.js` module. It will reuse the existing profile rather than replacing it. The module will:
- validate and normalize a small result event;
- reject events without a stable ID or valid result totals;
- deduplicate processed event IDs;
- keep a bounded recent history (maximum 120 events);
- summarize activity by source and learning area;
- recommend reinforcement after a weak result, continue progressive Biblical learning after a passed mission, or fall back to the existing ANNAN recommendation;
- return a concise reason grounded in recorded results.

The browser integration will save this state under `placurso_annan_learning_v1`. Phase 3D will consume the existing `placurso:progress` event and render the recommendation. The psychotechnical and Biblical flows will publish the same event contract after completion.

## 4. Approaches considered

1. **Extend `annan_profile_core.js` with event storage and orchestration.** Rejected because it would mix profile mathematics, persistence, event validation and recommendation policy in one existing module.
2. **Add a separate learning core and bridge it to Phase 3D.** Chosen because it preserves the tested profile calculations, makes the new behavior independently testable, and keeps the integration narrow.
3. **Move all memory to Supabase now.** Deferred because the current public flow still uses local session compatibility and there is no verified authenticated student backend contract in this phase. Starting a server migration now would make the release dependent on credentials and schema work unrelated to validating the learning engine.

## 5. Goals

- Record real Phase 3A, crypto, psychotechnical, and Biblical outcomes.
- Keep history bounded and duplicate-safe.
- Make the next recommendation repeatable and explainable.
- Preserve existing profile scores, game engines and crypto progression.
- Keep the local storage format versioned and safely recoverable.
- Keep student evolution behind the existing member experience.

## 6. Non-goals and safety boundaries

- No new game engine, course catalogue, external source crawler or autonomous web research in this phase.
- No Supabase schema/auth migration or cross-device persistence claim.
- No raw answer capture, personal profile inference, clinical diagnosis, or claims about intelligence/personality.
- No DIONUEL/Kunica files or deployment changes.
- No rewriting Phase 3A or crypto scoring logic.

## 7. Event contract

An accepted event contains a stable `id`, `source`, `game`, `correct`, `total`, optional `level`, optional `passed`, optional elapsed time, and timestamp. Scores are derived from bounded counts; the event ledger stores outcomes only, not answer choices or identity data.

Sources in this release: `phase3a`, `crypto`, `psychotechnical`, and `bible`. The learning state is versioned and capped at 120 recent events. A separate bounded set of processed IDs prevents duplicate event ingestion.

## 8. Recommendation policy

- A recent weak result in an actionable area recommends a focused repeat and cites the recorded score.
- A passed Biblical mission recommends continuing the next available learning level.
- Otherwise, ANNAN falls back to the existing profile's next recommended activity.
- If evidence is insufficient, ANNAN says so and chooses exploration rather than claiming a measured weakness.
- Every recommendation includes an action, title, type, reason and supporting event ID where applicable.

## 9. Acceptance criteria

- Invalid or incomplete events are not stored.
- Repeated IDs do not create duplicate history entries.
- The event ledger never exceeds 120 events.
- Summaries report accurate counts and recent scores.
- A weak recorded result produces a reasoned reinforcement recommendation.
- A passed Biblical mission can continue through the existing Bible experience.
- Existing Phase 3D profile scoring and trend tests remain unchanged and green.
- The generated engine contains each ANNAN core exactly once and passes JavaScript syntax checks.
- CI runs the new core tests and the existing verification suite.
- The Netlify build integration remains in its existing pipeline; no intermediate deployment is performed.
