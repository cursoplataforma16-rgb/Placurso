# Placurso Phase 3D — ANNAN Profile & Evidence-Based Evolution

## Goal
Turn the existing activity records into a useful, honest personal evolution profile. ANNAN must connect game and crypto-learning results, explain what the records show, identify the next useful practice activity, and preserve an evolution history.

## Product principle
**ANNAN may interpret evidence; it must not invent evidence.** A score is a record of performance in Placurso activities, not a psychological, educational, financial, or professional diagnosis.

## Current system
- The site is a static archive with Python build-time patches that append vanilla JavaScript to `psico-engine.js`.
- Phase 3A records game attempts and correct answers in `placurso_phase3a_games_v1`.
- Phase 3B records general XP, skill signals and mastery in `placurso_phase3b_experience_v1`.
- Phase 3C currently stores crypto progress in `placurso_crypto_learning_v1`; its unlock counter advances after every finished mission, regardless of score. This makes failed attempts count towards unlocking.
- No login or database is required for this phase.

## Goals
1. Present one clear ANNAN profile with seven pillars: Memória, Foco, Decisão, Estratégia, Finanças, Negócio and IA.
2. Calculate displayed scores only from recorded answers/attempts.
3. Show sample counts and label low-volume results as an initial signal.
4. Show IA as "Por iniciar" until an IA challenge records real results.
5. Give a concise ANNAN interpretation: strongest measured area (only with enough samples), an area to practise, and one actionable next challenge.
6. Keep a history of profile snapshots, with a recent trend only when at least two comparable records exist.
7. Correct crypto progression so a level only unlocks after two passed missions at that level; a pass requires at least 2 correct answers out of 3.
8. Migrate legacy crypto XP/completion totals without trusting old unlock counters.
9. Preserve mobile-first layout, keyboard focus, accessible labels, and localStorage persistence.
10. Keep the implementation within the existing build-time patch architecture and avoid new dependencies.

## Scoring rules
- Memory: correct/attempted in the Phase 3A memory game.
- Focus: correct/attempted in the Phase 3A reflex game.
- Decision: combine Phase 3A finance-game results and answered crypto-learning questions.
- Finance: combine finance-game results and crypto-learning questions, with sample counts shown.
- Strategy: combine mini-business game results with advanced crypto scenario answers.
- Business: mini-business game results.
- AI: no score until a real IA experience is available.
- Percentages are rounded to whole numbers and capped at 100. Missing data is `null`, not zero.
- Fewer than 3 observations are marked "Sinal inicial". Scores are activity performance, not a measure of inherent ability.
- Recommendation prioritises unpractised available activities; once the main activities have evidence, it recommends an area with comparatively lower recorded performance.

## Crypto progression rules
- Use a versioned v2 state with per-level `attempts`, `passed`, `answered`, and `correct`.
- A mission passes with at least 2 correct answers out of 3.
- Two passed missions unlock the next level.
- Failed missions remain useful practice and earn modest non-negative XP, but do not unlock levels.
- Legacy v1 XP and completed totals may be retained; legacy unlock counts are discarded because they may include failed attempts.

## Non-goals
- No generative/LLM claims: this phase uses deterministic analysis of local records.
- No user account, server persistence, personalised trading signals, real-money execution or financial recommendations.
- No DIONUEL/Kunica changes.
- No production deployment in Phase 3D.

## Approaches considered
1. Add a separate analytics service/API: rejected because it adds infrastructure, credentials and a login/data dependency to a static experience.
2. Extend the existing localStorage + vanilla-JS build patch: selected because it preserves the current architecture, works on mobile without login, and can later be migrated to authenticated persistence.
3. Show fixed, manually written scores: rejected because it would misrepresent user performance and create false confidence.

## Constraints and decisions
- Use only existing JavaScript/Python build tooling and Node's built-in test/assert APIs.
- The profile must remain useful with no recorded games and with corrupt or missing localStorage.
- No new deployment; work remains on the isolated `phase-3b-experience` branch until later production verification.
- Add explicit progress events from Phase 3A and Phase 3C so profile refresh is event-driven, not based on polling.

## Acceptance criteria
1. The profile renders with all seven pillars when the game hub exists.
2. No-data pillars display "Por iniciar" or "Sem dados"; they do not display fabricated 0% scores.
3. Scores match recorded correct/total counts and are clamped to 0–100.
4. Sample count and the "Sinal inicial" status appear below 3 observations.
5. The strongest area is not asserted from fewer than 3 observations.
6. ANNAN's next action launches the corresponding existing challenge, or provides an honest fallback.
7. Crypto missions only count as passed at 2/3 or better; failed attempts cannot unlock the next level.
8. Two passed missions unlock the next crypto level; one passed mission does not.
9. Legacy v1 migration preserves XP/completed totals but does not preserve unverified unlock counters.
10. Profile history persists and trend is shown only with two comparable records.
11. Corrupt storage, missing keys, empty profile, and repeated events do not break the experience.
12. Node unit tests and JavaScript syntax/build-pipeline smoke tests pass.
13. Existing Phase 3A/3B/3C features remain in the build pipeline.
14. No production deployment occurs; main remains unchanged.
