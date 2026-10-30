# Placurso Phase 3B — Experience Design

## Goal
Transform the existing Phase 3A games into a professional, intuitive, mobile-first learning experience that makes progress visible and gives users clear, healthy reasons to return.

## Current state
Production already exposes the Phase 3A hub and four playable games. The repository is a static-site archive plus build-time patch scripts; `scripts/build_netlify.py` extracts `placurso-site-root.zip` and patches `psico-engine.js` before Netlify publication.

## Approach
Deepen the existing game hub rather than replacing the platform. Add one deterministic Phase 3B experience layer after Phase 3A so the existing games remain available and regressions are easy to isolate. The layer provides: a professional hub header, persistent progress, level/mastery indicators, per-skill profile, clearer game states, micro-interactions, and healthy return loops. It uses localStorage only for this phase and does not require authentication or a database.

## UX requirements
- Mobile-first; primary controls are reachable with one hand.
- Clear hierarchy: identity → progress → current challenge → next action.
- Every game exposes objective, level, timer/progress, feedback, and next action.
- Progress is meaningful: level changes alter challenge conditions, not only labels.
- User sees skill signals for Memory, Focus, Decision, Strategy, Finance.
- Return reasons are self-improvement based: daily challenge, personal best, unfinished level, mastery, and new variation.
- No manipulative streak loss, artificial urgency, gambling-like rewards, or dark patterns.
- Existing Phase 3A games remain functional.

## State model
localStorage key: `placurso_phase3b_experience_v1`

State fields:
- `xp`: total Phase 3B XP.
- `plays`: completed rounds.
- `bestScore`: highest normalized round score.
- `lastPlayedAt`: ISO timestamp.
- `skills`: `{memory,focus,decision,strategy,finance}` each 0–100.
- `masters`: per-game mastery progress 0–5.
- `daily`: `{date, completed}`.

## Game progression
Each Phase 3A game maps to a primary skill and has five levels. A successful round increases the skill signal and mastery; failure does not remove progress. Levels change sequence length, response window, number of decisions, or scenario variables. Level 5 is the mastery challenge.

## Acceptance criteria
1. The Phase 3A section still renders and opens every existing game.
2. Phase 3B adds a visible professional progress layer without requiring login.
3. Refresh preserves Phase 3B progress.
4. A successful game updates XP, skill percentage, mastery, and last-played state.
5. A failed/expired round never produces negative XP or corrupt state.
6. A daily challenge is derived deterministically from the current date and can be completed once per day.
7. The UI works at mobile width and desktop width without horizontal overflow.
8. Keyboard focus is visible and buttons have accessible labels.
9. Build-time JavaScript syntax validation passes.
10. No DIONUEL/Kunica assets, routes, or projects are touched.
11. No production deployment occurs until the full phase is tested.
