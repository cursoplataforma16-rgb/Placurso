# Placurso Phase 3B — Experience, Presentation & Growth

## Goal
Transform the existing Phase 3A games into a professional, intuitive, mobile-first experience where presentation and functionality work together to attract users, keep them engaged, and give them a clear reason to return. The product is not presented as a simple course catalog or a collection of games: it is a place where the user discovers, tests, improves, and follows their own evolution.

## Product principle
**The idea alone does not generate traffic. Recognition comes from presentation; frequency and permanence come from functionality.** Therefore Phase 3B treats UX, interaction, progression, content discovery, and the ANNAN feedback loop as one product system.

## Current state
Production already exposes the Phase 3A hub and four playable games. The repository is a static-site archive plus build-time patch scripts; `scripts/build_netlify.py` extracts `placurso-site-root.zip` and patches `psico-engine.js` before Netlify publication.

## Core positioning
The primary product is **MY EVOLUTION / O MEU NÍVEL**. Courses, games, trends, challenges, and ANNAN are mechanisms inside that experience.

The user should be able to enter for one of several immediate reasons:
- 🧠 Mente — memory, logic, cognition.
- 🎯 Foco — attention, concentration, speed.
- ⚡ Decisão — quick choices and consequences.
- 💰 Dinheiro / Trade — financial decisions, risk/reward simulations, market reasoning, capital management and scenario interpretation. Educational/simulation framing only; no promises of profit or personalized financial signals.
- 💼 Negócio — pricing, margin, customers, resources and management.
- 🤖 IA — practical AI use, prompts, problem solving and tool selection.
- ♟ Estratégia — planning, adaptation and linked decisions.

These are entry doors, not separate products. Results feed the same evolving user profile.

## Growth and engagement model
The acquisition loop is designed around contemporary digital behavior: short-form discovery, interactive participation, useful entertainment, authenticity, serialized challenges, and social sharing. Current 2026 social research continues to show the strength of short-form video, interactive/educational content, authenticity, and community-oriented experiences. cite-source-placeholder

The Placurso loop is:

`SOCIAL HOOK → PLACURSO → 60–120s CHALLENGE → RESULT → ANNAN INSIGHT → PERSONAL NEED → NEXT CHALLENGE / CONTENT / COURSE → PROFILE EVOLUTION → NEW REASON TO RETURN`

Examples of acquisition hooks:
- “Você conseguiria administrar este negócio?”
- “Você sabe identificar uma boa decisão financeira?”
- “Você realmente sabe usar IA?”
- “Quanto você consegue memorizar em 30 segundos?”
- “Você tomaria esta decisão?”
- “Teste o seu nível de estratégia.”

The site should feel useful and entertaining before it feels like a school. The course catalog remains available, but it should not be the first psychological barrier to entry.

## Presentation requirements
- The first screen must communicate value within seconds.
- Lead with **what the user can improve**, not with a list of courses.
- Use strong visual hierarchy: identity → current level → challenge → result → next action.
- Cards must look like experiences, not store products.
- Short text, large controls, clear icons, strong contrast and obvious actions on mobile.
- Use micro-animations only when they communicate state, progress or feedback.
- Show immediate feedback after actions.
- Make the user's progress visually memorable.
- Use recurring challenge formats so users recognize the experience and want to see the next episode/variation.
- Social content should point into specific challenges, not merely advertise the platform.

## Functionality requirements
- Every experience has objective, difficulty, timer/progress, decisions, feedback, result and next action.
- Progress is meaningful: higher levels change challenge conditions, not only labels.
- ANNAN converts results into understandable insights and recommends what to improve next.
- The profile tracks capability evolution over time rather than only a single score.
- The system should later support statements such as: “Há 14 dias: Finanças 48%. Hoje: 67%. Maior avanço: margem. Próximo ponto: risco.”
- Daily challenges, personal records, new variations, mastery and unfinished goals provide healthy reasons to return.
- No manipulative streak loss, artificial urgency, gambling-like rewards, deceptive notifications or dark patterns.

## ANNAN role
ANNAN is the transversal intelligence layer. It should connect game results, learning activity and user progression into a coherent trajectory:
`OBSERVA → ANALISA → IDENTIFICA PADRÃO → EXPLICA → PROPÕE PRÓXIMO PASSO → MEDE EVOLUÇÃO`.

The immediate Phase 3B implementation may use localStorage only, but its state model must be structured so it can later migrate to authenticated persistence without redesigning the experience.

## State model
localStorage key: `placurso_phase3b_experience_v1`

State fields:
- `xp`: total Phase 3B XP.
- `plays`: completed rounds.
- `bestScore`: highest normalized round score.
- `lastPlayedAt`: ISO timestamp.
- `skills`: `{memory,focus,decision,strategy,finance,ai,business}` each 0–100 when introduced.
- `masters`: per-experience mastery progress 0–5.
- `daily`: `{date, completed}`.

## Game progression
Each experience maps to one or more skills and has five levels. A successful round increases the relevant skill signal and mastery; failure does not remove progress. Levels change sequence length, response window, number of decisions, scenario variables, or consequences. Level 5 is the mastery challenge.

## Trade / finance framing
Trade is treated as a high-interest educational simulation inside **Dinheiro**, not as a financial-advice product. Initial experiences should focus on reading movement, probability, risk/reward, position sizing, discipline and decision timing. Avoid real-money execution, profit guarantees, “sure signals”, or language that implies guaranteed returns.

## Acceptance criteria
1. The Phase 3A section still renders and opens every existing game.
2. Phase 3B adds a visible professional progress layer without requiring login.
3. The presentation clearly communicates “your evolution” rather than “buy a course”.
4. The experience exposes the initial skill pillars and leaves room for Trade/Finance, IA and Business expansion.
5. Refresh preserves Phase 3B progress.
6. A successful game updates XP, skill percentage, mastery, and last-played state.
7. A failed/expired round never produces negative XP or corrupt state.
8. A daily challenge is derived deterministically from the current date and can be completed once per day.
9. The UI works at mobile width and desktop width without horizontal overflow.
10. Keyboard focus is visible and buttons have accessible labels.
11. Build-time JavaScript syntax validation passes.
12. No DIONUEL/Kunica assets, routes, or projects are touched.
13. No production deployment occurs until the full phase is tested.
